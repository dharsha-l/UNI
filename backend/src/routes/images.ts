import { Router, Request, Response, NextFunction } from 'express';
import { DB, insertRecord, updateRecord } from '../database';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { VisionAIService } from '../services/aiServices';
import { authenticate, requireRoles } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Check access to inspection
const checkInspectionAccess = (req: Request, res: Response, next: NextFunction) => {
  if (['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER'].includes(req.user!.role)) {
    return next();
  }
  const inspectionId = req.params.inspectionId || req.body.inspection_id;
  if (!inspectionId) return res.status(400).json({ error: 'Inspection ID missing' });
  const insp = DB.inspections.find(i => i.id === inspectionId);
  if (!insp || insp.institution_id !== req.user!.institutionId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

router.get('/:inspectionId', authenticate, checkInspectionAccess, (req: Request, res: Response) => {
  const images = DB.images.filter(i => i.inspection_id === req.params.inspectionId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(images);
});

const imageBuffers = new Map<string, Buffer>();

router.post('/upload', authenticate, upload.single('file'), checkInspectionAccess, (req: Request, res: Response) => {
  const { inspection_id, category } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file provided' });

  const id = uuidv4();
  imageBuffers.set(id, file.buffer);
  const record = { id, inspection_id, filename: file.originalname, category: category || 'General', status: 'Uploaded', created_at: new Date().toISOString() };
  insertRecord(DB.images, record);
  
  DB.auditLogs.push({ id: uuidv4(), userId: req.user!.id, role: req.user!.role, action: 'UPLOAD_IMAGE', entity: 'Image', entityId: id, timestamp: new Date().toISOString() });
  
  res.json(record);
});

router.post('/:id/analyze', authenticate, requireRoles(['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = DB.images.find(i => i.id === id);
    if (!image) return res.status(404).json({ error: 'Image not found' });

    updateRecord(DB.images, id, { status: 'Processing' } as any);
    const buffer = imageBuffers.get(id);
    const detections = await VisionAIService.detectObjects(image.id, image.filename, image.category, buffer);

    for (const det of detections) {
      const did = uuidv4();
      DB.detections.push({
        id: did,
        inspection_id: image.inspection_id,
        image_id: image.id,
        object_type: det.object_type,
        confidence: det.confidence,
        class_id: det.class_id,
        bbox: det.bbox,
        created_at: new Date().toISOString()
      });
    }

    updateRecord(DB.images, id, { status: 'Analyzed', analyzed_at: new Date().toISOString() } as any);
    
    DB.auditLogs.push({ id: uuidv4(), userId: req.user!.id, role: req.user!.role, action: 'ANALYZE_IMAGE', entity: 'Image', entityId: id, timestamp: new Date().toISOString() });
    
    res.json({ success: true, detections_count: detections.length, detections });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/analyze-all/:inspectionId', authenticate, requireRoles(['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']), async (req: Request, res: Response) => {
  try {
    const { inspectionId } = req.params;
    const images = DB.images.filter(i => i.inspection_id === inspectionId && i.status !== 'Analyzed');

    let totalDetections = 0;
    for (const img of images) {
      updateRecord(DB.images, img.id, { status: 'Processing' } as any);
      const buffer = imageBuffers.get(img.id);
      const detections = await VisionAIService.detectObjects(img.id, img.filename, img.category, buffer);
      for (const det of detections) {
        const did = uuidv4();
        DB.detections.push({
          id: did,
          inspection_id: inspectionId,
          image_id: img.id,
          object_type: det.object_type,
          confidence: det.confidence,
          class_id: det.class_id,
          bbox: det.bbox,
          created_at: new Date().toISOString()
        });
      }
      updateRecord(DB.images, img.id, { status: 'Analyzed', analyzed_at: new Date().toISOString() } as any);
      totalDetections += detections.length;
    }

    const allDetections = DB.detections.filter(d => d.inspection_id === inspectionId).map(d => {
      const img = DB.images.find(i => i.id === d.image_id);
      return { ...d, image_name: img?.filename, category: img?.category };
    });
    res.json({ success: true, images_analyzed: images.length, total_detections: totalDetections, detections: allDetections });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/detections/:inspectionId', authenticate, checkInspectionAccess, (req: Request, res: Response) => {
  const detections = DB.detections.filter(d => d.inspection_id === req.params.inspectionId).map(d => {
    const img = DB.images.find(i => i.id === d.image_id);
    return { ...d, image_name: img?.filename, category: img?.category };
  });
  res.json(detections);
});

export default router;
