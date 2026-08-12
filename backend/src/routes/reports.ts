import { Router, Request, Response } from 'express';
import { DB, insertRecord, updateRecord } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { ReportService } from '../services/aiServices';

const router = Router();

router.post('/:inspectionId/generate', (req: Request, res: Response) => {
  const { inspectionId } = req.params;
  const insp = DB.inspections.find(i => i.id === inspectionId);
  if (!insp) return res.status(404).json({ error: 'Inspection not found' });

  const inst = DB.institutions.find(i => i.id === insp.institution_id);
  const inspector = DB.users.find(u => u.id === insp.inspector_id);
  const findings = DB.findings.filter(f => f.inspection_id === inspectionId).sort((a, b) => a.finding_number.localeCompare(b.finding_number));

  const content = ReportService.generate(insp, inst, findings, inspector);

  const reportId = uuidv4();
  const report = { id: reportId, inspection_id: inspectionId, content, generated_at: new Date().toISOString(), generated_by: inspector?.name || 'Unknown' };
  
  // Remove old reports for this inspection
  const idx = DB.reports.findIndex(r => r.inspection_id === inspectionId);
  if (idx !== -1) DB.reports.splice(idx, 1);
  DB.reports.push(report);

  updateRecord(DB.inspections, inspectionId, { status: 'Completed' } as any);

  res.json({ success: true, report_id: reportId, report: JSON.parse(content) });
});

router.get('/:inspectionId', (req: Request, res: Response) => {
  const report = DB.reports.filter(r => r.inspection_id === req.params.inspectionId)
    .sort((a, b) => b.generated_at.localeCompare(a.generated_at))[0];
  if (!report) return res.status(404).json({ error: 'No report generated yet' });
  res.json({ ...report, report: JSON.parse(report.content) });
});

export default router;
