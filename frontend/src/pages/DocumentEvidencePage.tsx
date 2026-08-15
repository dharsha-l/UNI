import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  FileStack, Upload, FileText, CheckCircle2, Clock, Loader2,
  ArrowLeft, Brain, ChevronRight, AlertCircle, File
} from 'lucide-react';
import { getDocuments, uploadDocument, analyzeAllDocuments, getClaims } from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusIcon = (status: string) => {
  if (status === 'Analyzed') return <CheckCircle2 size={14} className="text-green-600" />;
  if (status === 'Processing') return <Loader2 size={14} className="text-blue-500 animate-spin-slow" />;
  return <Clock size={14} className="text-slate-400" />;
};

const ProcessingStep: React.FC<{ text: string; done: boolean; active: boolean }> = ({ text, done, active }) => (
  <div className={`flex items-center gap-3 py-2 ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
    {done ? (
      <CheckCircle2 size={16} />
    ) : active ? (
      <Loader2 size={16} className="animate-spin-slow" />
    ) : (
      <div className="w-4 h-4 rounded-full border-2 border-current" />
    )}
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const DocumentEvidencePage: React.FC = () => {
  const { id: inspectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showClaims, setShowClaims] = useState(false);

  const isInstitution = hasRole(['INSTITUTION_ADMIN', 'INSTITUTION_STAFF']);

  const steps = ['Reading documents...', 'Extracting text...', 'Identifying institutional claims...', 'Structuring evidence...', 'Analysis complete!'];

  const fetchData = async () => {
    if (!inspectionId) return;
    setLoading(true);
    try {
      const docs = await getDocuments(inspectionId).catch(() => []);
      let cls = [];
      try {
        cls = await getClaims(inspectionId);
      } catch (e) {
        cls = [];
      }
      setDocuments(Array.isArray(docs) ? docs : []);
      setClaims(Array.isArray(cls) ? cls : []);
      if (Array.isArray(cls) && cls.length > 0) setShowClaims(true);
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [inspectionId]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!inspectionId) return;
    setUploading(true);
    for (const file of acceptedFiles) {
      try {
        const doc = await uploadDocument(inspectionId, file);
        if (doc) {
          setDocuments(prev => [doc, ...prev]);
        }
      } catch (err) {
        console.error('Upload error:', err);
      }
    }
    setUploading(false);
    await fetchData();
  }, [inspectionId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx'], 'image/*': ['.jpg', '.png'] }
  });

  const handleAnalyzeAll = async () => {
    if (!inspectionId) return;
    setAnalyzing(true);
    setAnalysisStep(0);

    for (let i = 0; i < steps.length - 1; i++) {
      await new Promise(r => setTimeout(r, 700));
      setAnalysisStep(i + 1);
    }

    try {
      const result = await analyzeAllDocuments(inspectionId);
      setClaims(result.claims || []);
      setShowClaims(true);
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '150 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {inspectionId && !isInstitution && (
        <button onClick={() => navigate(`/inspections/${inspectionId}`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Inspection
        </button>
      )}

      <div className="section-header mb-6">
        <div>
          <h1 className="section-title text-2xl">Document Evidence</h1>
          <p className="section-subtitle">Upload SSR, certificates, reports and other institutional documents</p>
        </div>
        {!isInstitution && documents.some(d => d.status !== 'Analyzed') && !analyzing && (
          <button onClick={handleAnalyzeAll} className="btn btn-primary">
            <Brain size={16} /> Run Document Analysis
          </button>
        )}
        {!isInstitution && documents.every(d => d.status === 'Analyzed') && documents.length > 0 && (
          <button onClick={handleAnalyzeAll} className="btn btn-secondary">
            <Brain size={16} /> Re-analyze Documents
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div {...getRootProps()} className={`dropzone mb-6 ${isDragActive ? 'active' : ''} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        <input {...getInputProps()} />
        <Upload size={32} className="text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">
          {uploading ? 'Uploading & Extracting with AI...' : isDragActive ? 'Drop files here...' : 'Drop files here or click to upload'}
        </p>
        <p className="text-slate-400 text-sm mt-1">Supported: PDF, DOCX, JPG, PNG</p>
      </div>

      {/* AI Processing animation */}
      {analyzing && !isInstitution && (
        <div className="card p-6 mb-6 border-blue-200 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="ai-label">
              <Brain size={12} />
              AI Analysis
            </div>
            <span className="text-sm font-semibold text-blue-800">Running Document OCR Analysis...</span>
          </div>
          <div className="space-y-1">
            {steps.map((step, i) => (
              <ProcessingStep key={i} text={step} done={i < analysisStep} active={i === analysisStep} />
            ))}
          </div>
          <div className="mt-4 progress-bar-container">
            <div className="progress-bar-fill bg-blue-600" style={{ width: `${(analysisStep / (steps.length - 1)) * 100}%` }} />
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isInstitution ? '' : 'lg:grid-cols-2'} gap-6`}>
        {/* Documents */}
        <div>
          <h2 className="section-title mb-4">Uploaded Documents ({documents.length})</h2>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={20} className="text-slate-400 animate-spin-slow" />
            </div>
          ) : documents.length === 0 ? (
            <div className="card p-8 text-center">
              <FileStack size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">No documents uploaded yet</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${isInstitution ? 'md:grid-cols-2' : ''} gap-3`}>
              {documents.map(doc => (
                <div key={doc.id || doc.filename} className="card p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 text-sm truncate">{doc.filename || doc.originalFilename || 'Document'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge badge-gray text-xs">{doc.type || 'PDF'}</span>
                        <span className="text-xs text-slate-400">{formatSize(doc.size)}</span>
                        {doc.extraction_method && (
                          <span className="badge badge-blue text-xs uppercase">{doc.extraction_method}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      {statusIcon(doc.status || 'Analyzed')} {doc.status || 'Analyzed'}
                    </div>
                  </div>

                  {doc.extracted_text && (
                    <div className="mt-2 p-2.5 bg-slate-50 rounded text-xs font-mono text-slate-700 border border-slate-200 max-h-24 overflow-y-auto">
                      <span className="font-semibold text-slate-500 block mb-0.5">Extracted Content (PostgreSQL):</span>
                      {typeof doc.extracted_text === 'object'
                        ? JSON.stringify(doc.extracted_text, null, 2)
                        : String(doc.extracted_text)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Extracted Claims */}
        {!isInstitution && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="section-title">AI Extracted Claims</h2>
              <div className="ai-label"><Brain size={11} /> AI Analysis</div>
            </div>
            {!showClaims ? (
              <div className="card p-8 text-center">
                <AlertCircle size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Run document analysis to extract claims</p>
              </div>
            ) : claims.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-slate-400 text-sm">No claims extracted yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {claims.map(claim => (
                  <div key={claim.id} className="card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge badge-gray text-xs">{claim.category}</span>
                        </div>
                        <div className="font-semibold text-slate-800 text-sm">{claim.claim_name}</div>
                        <div className="text-blue-700 font-bold text-lg mt-0.5">{claim.value}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-slate-400">Confidence</div>
                        <div className={`text-sm font-bold ${claim.confidence >= 0.95 ? 'text-green-600' : claim.confidence >= 0.85 ? 'text-amber-600' : 'text-red-600'}`}>
                          {Math.round(claim.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><File size={11} />{claim.source_document}</span>
                      <span>Page {claim.page_number}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {(showClaims || claims.length > 0) && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate(`/inspections/${inspectionId}/images`)}
            className="btn btn-primary"
          >
            Next: Visual Evidence <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentEvidencePage;
