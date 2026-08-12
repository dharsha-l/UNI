import { Router, Request, Response } from 'express';
import { DB } from '../database';

const router = Router();

router.get('/claims/:inspectionId', (req: Request, res: Response) => {
  const claims = DB.claims.filter(c => c.inspection_id === req.params.inspectionId)
    .sort((a, b) => a.category.localeCompare(b.category));
  res.json(claims);
});

router.get('/external/:institutionId', (req: Request, res: Response) => {
  const data = DB.externalData.filter(e => e.institution_id === req.params.institutionId);
  res.json(data);
});

router.get('/history/:institutionId', (req: Request, res: Response) => {
  const history = DB.inspections
    .filter(i => i.institution_id === req.params.institutionId)
    .map(i => {
      const inst = DB.institutions.find(x => x.id === i.institution_id);
      const inspector = DB.users.find(x => x.id === i.inspector_id);
      const findings = DB.findings.filter(f => f.inspection_id === i.id);
      return {
        ...i,
        institution_name: inst?.name,
        inspector_name: inspector?.name,
        findings_count: findings.length,
        high_risk_count: findings.filter(f => f.risk === 'High').length,
      };
    })
    .sort((a, b) => b.inspection_date.localeCompare(a.inspection_date));
  res.json(history);
});

router.get('/dashboard', (req: Request, res: Response) => {
  const institutionCount = DB.institutions.length;
  const activeInspections = DB.inspections.filter(i => i.status === 'In Progress').length;
  const highRiskFindings = DB.findings.filter(f => f.risk === 'High' && !f.inspector_decision).length;
  const evidenceItems = DB.documents.length + DB.images.length;

  const recentInspections = DB.inspections
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)
    .map(i => {
      const inst = DB.institutions.find(x => x.id === i.institution_id);
      const inspector = DB.users.find(x => x.id === i.inspector_id);
      return { ...i, institution_name: inst?.name, inspector_name: inspector?.name };
    });

  const statusBreakdown = {
    completed: DB.inspections.filter(i => i.status === 'Completed').length,
    in_progress: DB.inspections.filter(i => i.status === 'In Progress').length,
    pending: DB.inspections.filter(i => i.status === 'Pending').length,
  };

  const riskBreakdown = {
    high: DB.inspections.filter(i => i.risk_level === 'High').length,
    medium: DB.inspections.filter(i => i.risk_level === 'Medium').length,
    low: DB.inspections.filter(i => i.risk_level === 'Low').length,
  };

  res.json({ institutionCount, activeInspections, highRiskFindings, evidenceItems, recentInspections, statusBreakdown, riskBreakdown });
});

export default router;
