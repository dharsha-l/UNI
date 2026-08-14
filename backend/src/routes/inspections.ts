import { Router, Request, Response, NextFunction } from 'express';
import { DB, insertRecord, updateRecord } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { CrossVerificationService, RiskScoringService } from '../services/aiServices';
import { authenticate, requireRoles, requireInstitutionMatch } from '../middleware/auth';

const router = Router();

// Middleware to check institution match based on inspection ID
const requireInspectionInstitutionMatch = (req: Request, res: Response, next: NextFunction) => {
  if (['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER'].includes(req.user!.role)) {
    return next();
  }
  const insp = DB.inspections.find(i => i.id === req.params.id);
  if (insp && req.user!.institutionId !== insp.institution_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

router.get('/', authenticate, (req: Request, res: Response) => {
  let inspections = [...DB.inspections];
  
  if (['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'].includes(req.user!.role)) {
    inspections = inspections.filter(i => i.institution_id === req.user!.institutionId);
  }

  const result = inspections.map(i => {
    const inst = DB.institutions.find(x => x.id === i.institution_id);
    const inspector = DB.users.find(x => x.id === i.inspector_id);
    return { ...i, institution_name: inst?.name, inspector_name: inspector?.name };
  }).sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(result);
});

router.get('/:id', authenticate, requireInspectionInstitutionMatch, (req: Request, res: Response) => {
  const insp = DB.inspections.find(i => i.id === req.params.id);
  if (!insp) return res.status(404).json({ error: 'Inspection not found' });
  const inst = DB.institutions.find(x => x.id === insp.institution_id);
  const inspector = DB.users.find(x => x.id === insp.inspector_id);
  res.json({ ...insp, institution_name: inst?.name, inspector_name: inspector?.name });
});

router.post('/', authenticate, requireRoles(['SUPER_ADMIN', 'INSPECTION_ADMIN']), (req: Request, res: Response) => {
  const id = uuidv4();
  const yearPart = new Date().getFullYear();
  const numPart = String(Math.floor(Math.random() * 900) + 100);
  const inspection_id = `INS-${yearPart}-${numPart}`;
  const record = { id, inspection_id, ...req.body, categories: JSON.stringify(req.body.categories || []), status: 'In Progress', risk_score: 0, risk_level: 'Low', created_at: new Date().toISOString() };
  insertRecord(DB.inspections, record);
  res.json(record);
});

router.post('/:id/cross-verify', authenticate, requireRoles(['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const insp = DB.inspections.find(i => i.id === id);
    if (!insp) return res.status(404).json({ error: 'Inspection not found' });

    const claims = DB.claims.filter(c => c.inspection_id === id);
    const detections = DB.detections.filter(d => d.inspection_id === id);

    const newFindings = await CrossVerificationService.compare(id, claims, detections, {});

    // Remove non-decided existing findings
    const existingDecided = DB.findings.filter(f => f.inspection_id === id && f.inspector_decision);

    // Remove all findings for this inspection
    const idx = DB.findings.findIndex(f => f.inspection_id === id);
    DB.findings.splice(0, DB.findings.length, ...DB.findings.filter(f => f.inspection_id !== id));

    // Re-add decided ones
    DB.findings.push(...existingDecided);

    // Add new AI findings
    for (const f of newFindings) {
      // Don't re-add if already decided
      if (existingDecided.find(e => e.finding_number === f.finding_number)) continue;
      const fid = uuidv4();
      DB.findings.push({ id: fid, inspection_id: id, finding_number: f.finding_number, category: f.category, title: f.title, description: f.description, evidence: JSON.stringify(f.evidence_sources), risk: f.risk, status: f.status, visibility: 'INTERNAL', ai_confidence: f.ai_confidence, created_at: new Date().toISOString() });
    }

    const allFindings = DB.findings.filter(f => f.inspection_id === id);
    const { score, level } = RiskScoringService.calculate(allFindings);
    updateRecord(DB.inspections, id, { risk_score: score, risk_level: level } as any);

    res.json({ success: true, findings_count: allFindings.length, risk_score: score, risk_level: level });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
