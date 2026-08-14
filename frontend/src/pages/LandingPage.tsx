import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2 } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="text-center z-10 mb-16 animate-fade-in">
        <h1 className="text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-sm">
          UNI<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">-INSPECTION</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
          AI-Assisted Evidence-Traceable Institutional Inspection Platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl z-10">
        
        {/* Inspection Portal Card */}
        <div 
          onClick={() => navigate('/login/inspection')}
          className="group relative bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 cursor-pointer overflow-hidden transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
              <ShieldCheck size={48} className="text-blue-400 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-transform duration-500 group-hover:scale-110" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Inspection Portal</h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8 flex-1">
              For Lead Inspectors and Evaluation Committees. Analyze evidence, verify AI cross-checks, and generate compliance reports.
            </p>
            
            <div className="flex items-center text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
              Access Portal 
              <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Institution Portal Card */}
        <div 
          onClick={() => navigate('/login/institution')}
          className="group relative bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-10 cursor-pointer overflow-hidden transition-all duration-500 hover:border-emerald-500/50 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Decorative wireframe graphic for institution */}
          <div className="absolute -bottom-10 -right-10 opacity-[0.03] text-emerald-500 transform rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <Building2 size={120} />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
              <Building2 size={48} className="text-emerald-400 relative z-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-transform duration-500 group-hover:scale-110" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">Institution Portal</h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8 flex-1">
              For University Administrators and Nodal Officers. Submit SSR documents, upload visual evidence, and track evaluation status.
            </p>
            
            <div className="flex items-center text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
              Access Portal 
              <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-16 text-slate-500 text-sm font-medium">
        Powered by AI-Assisted Assessment Framework
      </div>
    </div>
  );
};

export default LandingPage;
