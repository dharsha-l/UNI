import { Router, Request, Response } from 'express';
import { DB } from '../database';
import { RegulationRAGService } from '../services/aiServices';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json([...DB.regulations].sort((a, b) => a.source.localeCompare(b.source)));
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.json([]);
    const results = await RegulationRAGService.search(query, DB.regulations);
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  const reg = DB.regulations.find(r => r.id === req.params.id);
  if (!reg) return res.status(404).json({ error: 'Regulation not found' });
  res.json(reg);
});

export default router;
