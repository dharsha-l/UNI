import { Router, Request, Response, NextFunction } from 'express';
import { DB, updateRecord } from '../database';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();

// Middleware to check access
const checkFindingAccess = (req: Request, res: Response, next: NextFunction) => {
  if (['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER'].includes(req.user!.role)) {
    return next();
  }
  
  const findingId = req.params.id;
  if (findingId) {
    const finding = DB.findings.find(f => f.id === findingId);
    if (!finding) return res.status(404).json({ error: 'Finding not found' });
    const insp = DB.inspections.find(i => i.id === finding.inspection_id);
    if (!insp || insp.institution_id !== req.user!.institutionId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!['RELEASED', 'RESOLVED', 'CLOSED'].includes(finding.visibility || 'INTERNAL')) {
      return res.status(403).json({ error: 'Finding not released' });
    }
  }
  next();
};

router.get('/:inspectionId', authenticate, (req: Request, res: Response) => {
  let findings = DB.findings.filter(f => f.inspection_id === req.params.inspectionId)
    .sort((a, b) => a.finding_number.localeCompare(b.finding_number));
  
  if (['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'].includes(req.user!.role)) {
    const insp = DB.inspections.find(i => i.id === req.params.inspectionId);
    if (!insp || insp.institution_id !== req.user!.institutionId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    findings = findings.filter(f => ['RELEASED', 'RESOLVED', 'CLOSED'].includes(f.visibility || 'INTERNAL'));
  }

  res.json(findings);
});

router.get('/detail/:id', authenticate, checkFindingAccess, (req: Request, res: Response) => {
  const finding = DB.findings.find(f => f.id === req.params.id);
  if (!finding) return res.status(404).json({ error: 'Finding not found' });
  res.json(finding);
});

router.post('/:id/accept', authenticate, requireRoles(['SUPER_ADMIN', 'INSPECTION_ADMIN']), (req: Request, res: Response) => {
  const { inspector_id, comment } = req.body;
  const updated = updateRecord(DB.findings, req.params.id, {
    inspector_decision: 'ACCEPTED',
    inspector_comment: comment || '',
    inspector_id,
    decided_at: new Date().toISOString()
  } as any);
  if (!updated) return res.status(404).json({ error: 'Finding not found' });
  
  DB.auditLogs.push({ id: require('uuid').v4(), userId: req.user!.id, role: req.user!.role, action: 'ACCEPT_FINDING', entity: 'Finding', entityId: req.params.id, timestamp: new Date().toISOString() });
  
  res.json(updated);
});

router.post('/:id/override', authenticate, requireRoles(['SUPER_ADMIN', 'INSPECTION_ADMIN']), (req: Request, res: Response) => {
  const { inspector_id, reason, comment } = req.body;
  if (!reason) return res.status(400).json({ error: 'Override reason is required' });
  const updated = updateRecord(DB.findings, req.params.id, {
    inspector_decision: 'OVERRIDDEN',
    inspector_comment: `[OVERRIDE REASON] ${reason}${comment ? ' | ' + comment : ''}`,
    inspector_id,
    decided_at: new Date().toISOString()
  } as any);
  if (!updated) return res.status(404).json({ error: 'Finding not found' });
  
  DB.auditLogs.push({ id: require('uuid').v4(), userId: req.user!.id, role: req.user!.role, action: 'OVERRIDE_FINDING', entity: 'Finding', entityId: req.params.id, timestamp: new Date().toISOString() });
  
  res.json(updated);
});

export default router;
