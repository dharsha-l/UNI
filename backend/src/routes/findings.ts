import { Router, Request, Response } from 'express';
import { DB, updateRecord } from '../database';

const router = Router();

router.get('/:inspectionId', (req: Request, res: Response) => {
  const findings = DB.findings.filter(f => f.inspection_id === req.params.inspectionId)
    .sort((a, b) => a.finding_number.localeCompare(b.finding_number));
  res.json(findings);
});

router.get('/detail/:id', (req: Request, res: Response) => {
  const finding = DB.findings.find(f => f.id === req.params.id);
  if (!finding) return res.status(404).json({ error: 'Finding not found' });
  res.json(finding);
});

router.post('/:id/accept', (req: Request, res: Response) => {
  const { inspector_id, comment } = req.body;
  const updated = updateRecord(DB.findings, req.params.id, {
    inspector_decision: 'ACCEPTED',
    inspector_comment: comment || '',
    inspector_id,
    decided_at: new Date().toISOString()
  } as any);
  if (!updated) return res.status(404).json({ error: 'Finding not found' });
  res.json(updated);
});

router.post('/:id/override', (req: Request, res: Response) => {
  const { inspector_id, reason, comment } = req.body;
  if (!reason) return res.status(400).json({ error: 'Override reason is required' });
  const updated = updateRecord(DB.findings, req.params.id, {
    inspector_decision: 'OVERRIDDEN',
    inspector_comment: `[OVERRIDE REASON] ${reason}${comment ? ' | ' + comment : ''}`,
    inspector_id,
    decided_at: new Date().toISOString()
  } as any);
  if (!updated) return res.status(404).json({ error: 'Finding not found' });
  res.json(updated);
});

export default router;
