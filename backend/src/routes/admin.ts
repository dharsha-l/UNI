import { Router } from 'express';
import { DB, insertRecord, updateRecord, deleteWhere, User } from '../database';
import { authenticate, requireRoles } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Only SUPER_ADMIN can access these routes
router.use(authenticate);
router.use(requireRoles(['SUPER_ADMIN']));

// GET all users
router.get('/users', (req, res) => {
  // Omit passwords
  const users = DB.users.map(({ password, ...user }) => user);
  res.json(users);
});

// POST new user
router.post('/users', (req, res) => {
  const { name, email, password, role, institutionId } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = DB.users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser: User = {
    id: `user-${uuidv4().substring(0, 8)}`,
    name,
    email,
    password, // In a real app, hash this
    role,
    institutionId: role.startsWith('INSTITUTION') ? institutionId : undefined,
    created_at: new Date().toISOString()
  };

  insertRecord(DB.users, newUser);
  
  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// PUT update user
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Prevent updating password through this endpoint for simplicity
  delete updates.password;

  const updated = updateRecord(DB.users, id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password, ...userWithoutPassword } = updated;
  res.json(userWithoutPassword);
});

// DELETE user
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  
  // Prevent deleting oneself
  if (req.user?.id === id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  const existing = DB.users.find(u => u.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'User not found' });
  }

  deleteWhere(DB.users, { id });
  res.status(204).send();
});

// GET audit logs
router.get('/audit-logs', (req, res) => {
  res.json(DB.auditLogs);
});

export default router;
