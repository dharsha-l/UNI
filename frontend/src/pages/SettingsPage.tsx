import React from 'react';
import { Settings, Shield, Brain, Info } from 'lucide-react';

const SettingsPage: React.FC = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <div className="section-header mb-6">
      <div>
        <h1 className="section-title text-2xl">Settings</h1>
        <p className="section-subtitle">System configuration and preferences</p>
      </div>
    </div>

    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Brain size={16} className="text-blue-600" />AI Service Configuration</h2>
        <div className="space-y-3">
          {[
            { label: 'Document OCR Service', value: 'Mock (Demo) — Replace with Tesseract OCR / Azure AI Document Intelligence', status: 'Mock' },
            { label: 'Visual Detection Service', value: 'Mock (Demo) — Replace with YOLOv8 via Python/FastAPI', status: 'Mock' },
            { label: 'Cross-Verification Engine', value: 'Mock (Demo) — Replace with custom verification pipeline', status: 'Mock' },
            { label: 'Regulation RAG Service', value: 'Mock (Demo) — Replace with sentence-transformers + vector DB', status: 'Mock' },
            { label: 'External Data API', value: 'Mock (Demo) — Replace with AISHE/NIRF live API integration', status: 'Mock' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <div className="font-medium text-slate-800 text-sm">{item.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.value}</div>
              </div>
              <span className="badge badge-medium text-xs">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Shield size={16} className="text-green-600" />Safety & Ethics</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">✅ AI does not automatically approve or reject institutions</div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">✅ All AI findings require human inspector validation</div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">✅ Visual evidence treated as partial — not total inventory</div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">✅ Risk score is inspection-support indicator only</div>
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">✅ Override with reason is always available to inspector</div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Info size={16} className="text-blue-600" />About InspectAI</h2>
        <div className="text-sm text-slate-600 space-y-2">
          <div><strong>Version:</strong> 1.0.0 (Hackathon Prototype)</div>
          <div><strong>Frontend:</strong> React + Vite + TypeScript + Tailwind CSS</div>
          <div><strong>Backend:</strong> Node.js + Express + In-Memory Store</div>
          <div><strong>AI Services:</strong> Mock interfaces (ready for Python/FastAPI integration)</div>
          <div><strong>Tagline:</strong> Evidence-driven. AI-assisted. Human-verified.</div>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsPage;
