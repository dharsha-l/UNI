import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileStack, FileText, Camera, ChevronRight, Building2 } from 'lucide-react';
import { getDocuments, getImages, getInspections } from '../services/api';

const EvidencePage: React.FC = () => {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get docs and images for the main inspection
    Promise.all([getDocuments('insp-001'), getImages('insp-001')]).then(([d, i]) => {
      setDocs(d);
      setImages(i);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title text-2xl">Evidence Library</h1>
          <p className="section-subtitle">All documentary and visual evidence collected across inspections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="card p-5 cursor-pointer hover:border-blue-300" onClick={() => navigate('/inspections/insp-001/documents')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-red-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Documentary Evidence</div>
              <div className="text-sm text-slate-500">{docs.length} documents</div>
            </div>
            <ChevronRight size={16} className="text-slate-400 ml-auto" />
          </div>
          <div className="space-y-2">
            {docs.slice(0, 4).map(d => (
              <div key={d.id} className="flex items-center gap-2 text-sm text-slate-600 py-1 border-b border-slate-50">
                <FileText size={13} className="text-slate-400" />
                <span className="truncate">{d.filename}</span>
                <span className={`badge ml-auto text-xs ${d.status === 'Analyzed' ? 'badge-low' : 'badge-gray'}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 cursor-pointer hover:border-blue-300" onClick={() => navigate('/inspections/insp-001/images')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Camera size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">Visual Evidence</div>
              <div className="text-sm text-slate-500">{images.length} images</div>
            </div>
            <ChevronRight size={16} className="text-slate-400 ml-auto" />
          </div>
          <div className="space-y-2">
            {images.slice(0, 4).map(img => (
              <div key={img.id} className="flex items-center gap-2 text-sm text-slate-600 py-1 border-b border-slate-50">
                <Camera size={13} className="text-slate-400" />
                <span className="truncate">{img.filename}</span>
                <span className="badge badge-gray text-xs ml-auto">{img.category}</span>
                <span className={`badge text-xs ${img.status === 'Analyzed' ? 'badge-low' : 'badge-gray'}`}>{img.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <FileStack size={16} className="flex-shrink-0 mt-0.5" />
        <span className="text-sm">
          <strong>Evidence context:</strong> Visual evidence only covers uploaded images.
          Detection results should not be interpreted as a complete inventory of institutional assets.
          Always verify physically for comprehensive assessment.
        </span>
      </div>
    </div>
  );
};

export default EvidencePage;
