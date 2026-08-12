import React, { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Play } from 'lucide-react';

const MonitoringPage: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const handleMiniInspection = async () => {
    setRunning(true);
    setDone(false);
    await new Promise(r => setTimeout(r, 2500));
    setRunning(false);
    setDone(true);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title text-2xl">Continuous Monitoring</h1>
          <p className="section-subtitle">Track institutional compliance between formal inspection cycles</p>
        </div>
      </div>

      {/* Institution selector */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="font-semibold text-slate-800">ABC Institute of Technology</div>
            <div className="text-sm text-slate-500">AISHE: C-12345 · Last inspection: 12 Aug 2026</div>
          </div>
          <button
            onClick={handleMiniInspection}
            disabled={running}
            className="btn btn-primary"
          >
            {running ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" style={{ borderWidth: 2 }} />
                Running Mini-Inspection...
              </div>
            ) : (
              <>
                <Play size={16} /> Run Mini Inspection
              </>
            )}
          </button>
        </div>
      </div>

      {/* Risk comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="card p-5">
          <div className="text-slate-500 text-sm mb-1">Previous Risk Score</div>
          <div className="text-4xl font-bold text-amber-600">64</div>
          <div className="text-xs text-slate-400 mt-1">INS-2025-018 · Dec 2025</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-500 text-sm mb-1">Current Risk Score</div>
          <div className="text-4xl font-bold text-red-600">72</div>
          <div className="text-xs text-slate-400 mt-1">INS-2026-001 · Aug 2026</div>
        </div>
        <div className="card p-5">
          <div className="text-slate-500 text-sm mb-1">Change</div>
          <div className="flex items-center gap-2">
            <TrendingUp size={24} className="text-red-500" />
            <div className="text-4xl font-bold text-red-500">+8</div>
          </div>
          <div className="text-xs text-red-400 mt-1">Risk increased</div>
        </div>
      </div>

      {/* New / Resolved findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="font-semibold text-slate-800">New Issues Found</h3>
            <span className="badge badge-high ml-auto">3</span>
          </div>
          <div className="space-y-2">
            {['Student count mismatch vs AISHE 2025', 'Barrier-free access unverified', 'Lab count visual verification incomplete'].map(issue => (
              <div key={issue} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                <span className="text-xs text-red-700">{issue}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={16} className="text-green-500" />
            <h3 className="font-semibold text-slate-800">Resolved Since Last</h3>
            <span className="badge badge-low ml-auto">2</span>
          </div>
          <div className="space-y-2">
            {['Fire safety certificate renewed', 'Faculty qualification data updated'].map(issue => (
              <div key={issue} className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle2 size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-green-700">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mini inspection result */}
      {done && (
        <div className="card p-5 border-blue-200 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-blue-600" />
            <h3 className="font-semibold text-blue-800">Mini Inspection Complete</h3>
          </div>
          <p className="text-sm text-slate-600">
            A quick automated check was performed against institutional claims. 3 new data points reviewed.
            No critical changes detected since last formal inspection. Next formal inspection recommended within 3 months.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-blue-50 rounded-lg"><div className="font-bold text-blue-700">3</div><div className="text-xs text-slate-400">Checks Run</div></div>
            <div className="p-2 bg-amber-50 rounded-lg"><div className="font-bold text-amber-700">1</div><div className="text-xs text-slate-400">Flags Raised</div></div>
            <div className="p-2 bg-green-50 rounded-lg"><div className="font-bold text-green-700">2</div><div className="text-xs text-slate-400">Consistent</div></div>
          </div>
        </div>
      )}

      <div className="disclaimer mt-5">
        ⚠️ Continuous monitoring is a <strong>supplementary feature</strong> for between-cycle awareness.
        It does not replace formal inspections or institutional assessment processes.
      </div>
    </div>
  );
};

export default MonitoringPage;
