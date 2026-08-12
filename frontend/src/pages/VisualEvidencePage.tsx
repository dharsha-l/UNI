import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Camera, Upload, CheckCircle2, Clock, Loader2, ArrowLeft,
  Brain, ChevronRight, Eye, ZoomIn, Package
} from 'lucide-react';
import { getImages, uploadImage, analyzeAllImages, getDetections } from '../services/api';

const CATEGORIES = ['Laboratory', 'Classroom', 'Fire Safety', 'Accessibility', 'Library', 'Campus'];

const ProcessingStep: React.FC<{ text: string; done: boolean; active: boolean }> = ({ text, done, active }) => (
  <div className={`flex items-center gap-3 py-2 ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
    {done ? <CheckCircle2 size={16} /> : active ? <Loader2 size={16} className="animate-spin-slow" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
    <span className="text-sm font-medium">{text}</span>
  </div>
);

// Simulated bounding boxes for YOLO visualization
const DEMO_BOXES: Record<string, Array<{ label: string; conf: number; x: number; y: number; w: number; h: number; color: string }>> = {
  'lab_03.jpg': [
    { label: 'Fire Extinguisher', conf: 91, x: 8, y: 60, w: 12, h: 28, color: '#22c55e' },
    { label: 'Fire Extinguisher', conf: 88, x: 72, y: 55, w: 12, h: 30, color: '#22c55e' },
    { label: 'Emergency Exit Sign', conf: 84, x: 40, y: 5, w: 20, h: 10, color: '#f59e0b' },
    { label: 'Lab Bench', conf: 94, x: 10, y: 40, w: 80, h: 25, color: '#3b82f6' },
  ],
  'lab_01.jpg': [
    { label: 'Lab Bench', conf: 94, x: 5, y: 45, w: 90, h: 30, color: '#3b82f6' },
    { label: 'Lab Equipment', conf: 87, x: 20, y: 30, w: 25, h: 20, color: '#8b5cf6' },
    { label: 'Computer Workstation', conf: 91, x: 60, y: 35, w: 25, h: 30, color: '#06b6d4' },
  ],
  'classroom_01.jpg': [
    { label: 'Whiteboard', conf: 93, x: 15, y: 5, w: 70, h: 35, color: '#3b82f6' },
    { label: 'Student Desk', conf: 95, x: 5, y: 55, w: 40, h: 30, color: '#22c55e' },
    { label: 'Projector', conf: 89, x: 40, y: 10, w: 15, h: 12, color: '#f59e0b' },
  ],
};

const VisualEvidencePage: React.FC = () => {
  const { id: inspectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [images, setImages] = useState<any[]>([]);
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Laboratory');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showDetections, setShowDetections] = useState(false);

  const yoloSteps = ['Loading YOLO v8 model...', 'Detecting infrastructure objects...', 'Calculating confidence scores...', 'Generating visual evidence overlays...', 'Analysis complete!'];

  useEffect(() => {
    if (!inspectionId) return;
    Promise.all([getImages(inspectionId), getDetections(inspectionId)]).then(([imgs, dets]) => {
      setImages(imgs);
      setDetections(dets);
      setLoading(false);
      if (dets.length > 0) { setShowDetections(true); setSelectedImage(imgs[0]); }
    });
  }, [inspectionId]);

  const onDrop = useCallback(async (files: File[]) => {
    if (!inspectionId) return;
    for (const file of files) {
      const img = await uploadImage(inspectionId, file, selectedCategory);
      setImages(prev => [img, ...prev]);
    }
  }, [inspectionId, selectedCategory]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }
  });

  const handleAnalyzeAll = async () => {
    if (!inspectionId) return;
    setAnalyzing(true);
    setAnalysisStep(0);

    for (let i = 0; i < yoloSteps.length - 1; i++) {
      await new Promise(r => setTimeout(r, 800));
      setAnalysisStep(i + 1);
    }

    try {
      const result = await analyzeAllImages(inspectionId);
      setDetections(result.detections || []);
      setShowDetections(true);
      const imgs = await getImages(inspectionId);
      setImages(imgs);
      if (imgs.length > 0) setSelectedImage(imgs[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Group detections
  const detectionCounts: Record<string, number> = {};
  detections.forEach(d => {
    detectionCounts[d.object_type] = (detectionCounts[d.object_type] || 0) + 1;
  });

  const getDemoBoxes = (img: any) => DEMO_BOXES[img?.filename] || [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button onClick={() => navigate(`/inspections/${inspectionId}`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Inspection
      </button>

      <div className="section-header mb-6">
        <div>
          <h1 className="section-title text-2xl">Visual Evidence</h1>
          <p className="section-subtitle">Upload campus and facility photographs for AI object detection</p>
        </div>
        <button onClick={handleAnalyzeAll} disabled={analyzing} className="btn btn-primary">
          <Brain size={16} /> {analyzing ? 'Analyzing...' : 'Run Visual AI Analysis'}
        </button>
      </div>

      {/* Category selector */}
      <div className="flex gap-2 flex-wrap mb-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`badge cursor-pointer transition-all ${selectedCategory === cat ? 'badge-blue' : 'badge-gray'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div {...getRootProps()} className={`dropzone mb-6 ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <Camera size={32} className="text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">
          {isDragActive ? 'Drop images here...' : 'Drop images here or click to upload'}
        </p>
        <p className="text-slate-400 text-sm mt-1">Category: {selectedCategory} · JPG, PNG, WebP</p>
      </div>

      {/* YOLO Processing */}
      {analyzing && (
        <div className="card p-6 mb-6 border-blue-200 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="ai-label"><Brain size={12} />YOLO AI Analysis</div>
            <span className="text-sm font-semibold text-blue-800">Running Visual Object Detection...</span>
          </div>
          {yoloSteps.map((step, i) => (
            <ProcessingStep key={i} text={step} done={i < analysisStep} active={i === analysisStep} />
          ))}
          <div className="mt-4 progress-bar-container">
            <div className="progress-bar-fill bg-blue-600" style={{ width: `${(analysisStep / (yoloSteps.length - 1)) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image list */}
        <div>
          <h2 className="section-title mb-3">Uploaded Images ({images.length})</h2>
          <div className="space-y-2">
            {images.map(img => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className={`card p-3 flex items-center gap-3 cursor-pointer transition-all ${selectedImage?.id === img.id ? 'border-blue-400 bg-blue-50' : ''}`}
              >
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Camera size={20} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{img.filename}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="badge badge-gray text-xs">{img.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  {img.status === 'Analyzed' ? <CheckCircle2 size={13} className="text-green-500" /> : <Clock size={13} className="text-slate-300" />}
                  <span>{img.status}</span>
                </div>
              </div>
            ))}
            {images.length === 0 && (
              <div className="card p-6 text-center">
                <Camera size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No images uploaded</p>
              </div>
            )}
          </div>
        </div>

        {/* Image viewer with YOLO overlay */}
        <div className="lg:col-span-2">
          {selectedImage ? (
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{selectedImage.filename}</div>
                  <div className="text-xs text-slate-400">{selectedImage.category} · {selectedImage.status}</div>
                </div>
                {showDetections && <div className="ai-label"><Brain size={11} />YOLO Detected</div>}
              </div>

              {/* Simulated image with bounding boxes */}
              <div className="relative bg-slate-900" style={{ height: 320 }}>
                {/* Placeholder image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                    <div className="text-center">
                      <Camera size={48} className="text-slate-600 mx-auto mb-2" />
                      <div className="text-slate-400 text-sm">{selectedImage.filename}</div>
                      <div className="text-slate-500 text-xs mt-1">{selectedImage.category}</div>
                    </div>
                  </div>
                </div>

                {/* YOLO Bounding box overlays */}
                {showDetections && getDemoBoxes(selectedImage).map((box, i) => (
                  <div
                    key={i}
                    className="detection-box"
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                      borderColor: box.color,
                      background: `${box.color}10`,
                    }}
                  >
                    <div
                      className="detection-label"
                      style={{ background: box.color, fontSize: 10 }}
                    >
                      {box.label} {box.conf}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Detection results */}
              {showDetections && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="ai-label"><Brain size={11} />AI Analysis</div>
                    <span className="text-sm font-semibold text-slate-700">Detected Objects</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {getDemoBoxes(selectedImage).map((box, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm" style={{ background: box.color }} />
                          <span className="text-xs font-medium text-slate-700">{box.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{box.conf}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      ⚠️ Visual evidence shows objects in uploaded photos only. This does not verify the total institutional count.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Eye size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400">Select an image to view analysis</p>
            </div>
          )}

          {/* Detection summary */}
          {showDetections && Object.keys(detectionCounts).length > 0 && (
            <div className="card p-5 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="ai-label"><Brain size={11} />YOLO AI</div>
                <span className="text-sm font-semibold text-slate-700">Overall Detection Summary</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(detectionCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <Package size={14} className="text-blue-500" />
                    <div>
                      <div className="text-xs text-slate-500">{type}</div>
                      <div className="font-bold text-slate-800">{count} detected</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">
                ⚠️ Detected objects are from uploaded images only. Insufficient to verify total institutional inventory.
              </p>
            </div>
          )}
        </div>
      </div>

      {showDetections && (
        <div className="mt-6 flex justify-end">
          <button onClick={() => navigate(`/inspections/${inspectionId}/verify`)} className="btn btn-primary">
            Next: AI Cross-Verification <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VisualEvidencePage;
