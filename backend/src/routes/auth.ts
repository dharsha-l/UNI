import { Router, Request, Response } from 'express';
import { DB } from '../database';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = DB.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export default router;
