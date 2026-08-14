import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, BuildingLibrary } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-4xl w-full">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
            UNI-INSPECTION
          </h1>
          <h2 className="text-2xl text-slate-300 font-light">
            AI-Assisted Evidence-Traceable Institutional Inspection
          </h2>
          <div className="inline-block px-6 py-3 border border-slate-700 bg-slate-800/50 rounded-full">
            <p className="text-lg italic text-slate-400">
              "AI suggests. Evidence explains. Inspector decides."
            </p>
          </div>
        </div>

        {/* Portals Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Inspection Portal */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 flex flex-col shadow-2xl hover:border-blue-500 transition-colors duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={120} />
            </div>
            
            <div className="relative z-10 flex-1">
              <div className="w-16 h-16 bg-blue-900/50 text-blue-400 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">INSPECTION PORTAL</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Authorized inspection members and administrators can inspect institutions, review evidence, analyze AI findings, verify compliance and finalize inspection decisions.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/login/inspection')}
              className="w-full relative z-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
            >
              ENTER INSPECTION PORTAL
            </button>
          </div>

          {/* Institution Portal */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 flex flex-col shadow-2xl hover:border-emerald-500 transition-colors duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BuildingLibrary size={120} />
            </div>
            
            <div className="relative z-10 flex-1">
              <div className="w-16 h-16 bg-emerald-900/50 text-emerald-400 rounded-lg flex items-center justify-center mb-6">
                <BuildingLibrary size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">INSTITUTION PORTAL</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Institutional users can submit documents, upload infrastructure evidence, respond to verification requests and track inspection status.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/login/institution')}
              className="w-full relative z-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
            >
              ENTER INSTITUTION PORTAL
            </button>
          </div>
          
        </div>

        {/* Footer Section */}
        <div className="text-center space-y-2">
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">Authorized users only</p>
          <p className="text-slate-600 text-sm">Your permissions are determined by your account role.</p>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
