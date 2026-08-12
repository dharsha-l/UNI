import express from 'express';
import cors from 'cors';
import { seedDatabase } from './database';

// Initialize in-memory database with seed data
seedDatabase();

import authRoutes from './routes/auth';
import institutionRoutes from './routes/institutions';
import inspectionRoutes from './routes/inspections';
import documentRoutes from './routes/documents';
import imageRoutes from './routes/images';
import findingRoutes from './routes/findings';
import regulationRoutes from './routes/regulations';
import reportRoutes from './routes/reports';
import analyticsRoutes from './routes/analytics';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/findings', findingRoutes);
app.use('/api/regulations', regulationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InspectAI API running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ InspectAI Backend running on http://localhost:${PORT}`);
  console.log(`   Demo login: inspector@demo.com / inspector123`);
  console.log(`   API health: http://localhost:${PORT}/api/health`);
});

export default app;
