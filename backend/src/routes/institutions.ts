import { Router, Request, Response } from 'express';
import { DB, insertRecord } from '../database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json([...DB.institutions].sort((a, b) => a.name.localeCompare(b.name)));
});

router.get('/:id', (req: Request, res: Response) => {
  const inst = DB.institutions.find(i => i.id === req.params.id);
  if (!inst) return res.status(404).json({ error: 'Institution not found' });
  res.json(inst);
});

router.post('/', (req: Request, res: Response) => {
  const id = uuidv4();
  const record = { id, ...req.body, created_at: new Date().toISOString() };
  insertRecord(DB.institutions, record);
  res.json(record);
});

export default router;
