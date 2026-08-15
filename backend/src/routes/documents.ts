import { Router, Request, Response, NextFunction } from 'express';
import { DB, insertRecord, updateRecord } from '../database';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { DocumentAIService } from '../services/aiServices';
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
  const docs = DB.documents.filter(d => d.inspection_id === req.params.inspectionId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(docs);
});

router.post('/upload', authenticate, upload.single('file'), checkInspectionAccess, (req: Request, res: Response) => {
  const { inspection_id } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file provided' });

  const id = uuidv4();
  const ext = file.originalname.split('.').pop()?.toUpperCase() || 'FILE';
  const record = { id, inspection_id, filename: file.originalname, type: ext, size: file.size, status: 'Uploaded', created_at: new Date().toISOString() };
  insertRecord(DB.documents, record);
  
  DB.auditLogs.push({ id: uuidv4(), userId: req.user!.id, role: req.user!.role, action: 'UPLOAD_DOCUMENT', entity: 'Document', entityId: id, timestamp: new Date().toISOString() });
  
  res.json(record);
});

router.post('/:id/analyze', authenticate, requireRoles(['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = DB.documents.find(d => d.id === id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    updateRecord(DB.documents, id, { status: 'Processing' } as any);
    const claims = await DocumentAIService.extractClaims(doc.id, doc.filename);

    for (const claim of claims) {
      const cid = uuidv4();
      const existing = DB.claims.find(c => c.inspection_id === doc.inspection_id && c.claim_name === claim.claim_name && c.document_id === doc.id);
      if (!existing) {
        DB.claims.push({ id: cid, inspection_id: doc.inspection_id, document_id: doc.id, category: claim.category, claim_name: claim.claim_name, value: claim.value, source_document: doc.filename, page_number: claim.page_number, confidence: claim.confidence, created_at: new Date().toISOString() });
      }
    }

    updateRecord(DB.documents, id, { status: 'Analyzed', analyzed_at: new Date().toISOString() } as any);
    
    DB.auditLogs.push({ id: uuidv4(), userId: req.user!.id, role: req.user!.role, action: 'ANALYZE_DOCUMENT', entity: 'Document', entityId: id, timestamp: new Date().toISOString() });
    
    res.json({ success: true, claims_extracted: claims.length, claims });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/analyze-all/:inspectionId', authenticate, requireRoles(['SUPER_ADMIN', 'INSPECTION_ADMIN', 'INSPECTION_MEMBER']), async (req: Request, res: Response) => {
  try {
    const { inspectionId } = req.params;
    const docs = DB.documents.filter(d => d.inspection_id === inspectionId && d.status !== 'Analyzed');

    let totalClaims = 0;
    for (const doc of docs) {
      updateRecord(DB.documents, doc.id, { status: 'Processing' } as any);
      const claims = await DocumentAIService.extractClaims(doc.id, doc.filename);
      for (const claim of claims) {
        const cid = uuidv4();
        const existing = DB.claims.find(c => c.inspection_id === inspectionId && c.claim_name === claim.claim_name && c.document_id === doc.id);
        if (!existing) {
          DB.claims.push({ id: cid, inspection_id: inspectionId, document_id: doc.id, category: claim.category, claim_name: claim.claim_name, value: claim.value, source_document: doc.filename, page_number: claim.page_number, confidence: claim.confidence, created_at: new Date().toISOString() });
        }
      }
      updateRecord(DB.documents, doc.id, { status: 'Analyzed', analyzed_at: new Date().toISOString() } as any);
      totalClaims += claims.length;
    }

    const allClaims = DB.claims.filter(c => c.inspection_id === inspectionId);
    res.json({ success: true, documents_analyzed: docs.length, total_claims: totalClaims, claims: allClaims });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
