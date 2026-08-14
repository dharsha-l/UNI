import { Router, Request, Response } from 'express';
import { DB, findById } from '../database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = DB.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, institutionId: user.institutionId } });
});

router.post('/logout', authenticate, (req: Request, res: Response) => {
  res.json({ success: true });
});

router.post('/forgot-password', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Password reset link sent to email' });
});

router.post('/reset-password', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Password has been reset' });
});

router.get('/me', authenticate, (req: Request, res: Response) => {
  const user = findById(DB.users, req.user!.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, institutionId: user.institutionId } });
});

export default router;
