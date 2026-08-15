import { Router, Request, Response } from 'express';
import { DB, insertRecord } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, requireRoles, requireInstitutionMatch } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, (req: Request, res: Response) => {
  let institutions = [...DB.institutions];
  
  if (['INSTITUTION_ADMIN', 'INSTITUTION_STAFF'].includes(req.user!.role)) {
    institutions = institutions.filter(i => i.id === req.user!.institutionId);
  }
  // Assume INSPECTION members can see all for now, or those they are assigned to.

  res.json(institutions.sort((a, b) => a.name.localeCompare(b.name)));
});

router.get('/:id', authenticate, requireInstitutionMatch(req => req.params.id), (req: Request, res: Response) => {
  const inst = DB.institutions.find(i => i.id === req.params.id);
  if (!inst) return res.status(404).json({ error: 'Institution not found' });
  res.json(inst);
});

router.post('/', authenticate, requireRoles(['SUPER_ADMIN']), (req: Request, res: Response) => {
  const id = uuidv4();
  const record = { id, ...req.body, created_at: new Date().toISOString() };
  insertRecord(DB.institutions, record);
  res.json(record);
});

export default router;
