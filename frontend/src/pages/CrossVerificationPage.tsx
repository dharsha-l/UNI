import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Brain, CheckCircle2, Loader2, AlertTriangle, ArrowDown,
  BarChart2, Database, FileText, Eye, ChevronRight, TrendingUp
} from 'lucide-react';
import { crossVerify, getFindings, getExternalData, getClaims, getInspection } from '../services/api';

const ProcessingStep: React.FC<{ text: string; done: boolean; active: boolean }> = ({ text, done, active }) => (
  <div className={`flex items-center gap-3 py-2 ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
    {done ? <CheckCircle2 size={16} /> : active ? <Loader2 size={16} className="animate-spin-slow" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
    <span className="text-sm font-medium">{text}</span>
  </div>
);

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    MISMATCH: 'text-red-600 bg-red-50 border-red-200',
    MINOR_MISMATCH: 'text-amber-600 bg-amber-50 border-amber-200',
    CONSISTENT: 'text-green-600 bg-green-50 border-green-200',
    INSUFFICIENT_EVIDENCE: 'text-amber-600 bg-amber-50 border-amber-200',
    REQUIRES_VERIFICATION: 'text-blue-600 bg-blue-50 border-blue-200',
    POTENTIAL_MISMATCH: 'text-red-600 bg-red-50 border-red-200',
    MISSING_EVIDENCE: 'text-amber-600 bg-amber-50 border-amber-200',
  };
  return map[status] || 'text-slate-600 bg-slate-50 border-slate-200';
};

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    MISMATCH: 'Mismatch Detected',
    MINOR_MISMATCH: 'Minor Mismatch',
    CONSISTENT: 'Consistent',
    INSUFFICIENT_EVIDENCE: 'Insufficient Evidence',
    REQUIRES_VERIFICATION: 'Requires Verification',
    POTENTIAL_MISMATCH: 'Potential Discrepancy',
    MISSING_EVIDENCE: 'Missing Evidence',
  };
  return map[s] || s.replace(/_/g, ' ');
};

const CrossVerificationPage: React.FC = () => {
  const { id: inspectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [findings, setFindings] = useState<any[]>([]);
  const [externalData, setExternalData] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);
  const [verified, setVerified] = useState(false);

  const verifySteps = [
    'Loading institution claims...',
    'Comparing documentary evidence...',
    'Cross-referencing visual detections...',
    'Querying external databases (AISHE/NIRF)...',
    'Running cross-verification engine...',
    'Calculating risk scores...',
    'Cross-verification complete!'
  ];

  useEffect(() => {
    if (!inspectionId) return;
    Promise.all([getFindings(inspectionId), getClaims(inspectionId), getInspection(inspectionId)]).then(([finds, cls, insp]) => {
      setFindings(finds);
      setClaims(cls);
      setInspection(insp);
      if (finds.length > 0) setVerified(true);
      setLoading(false);
      // Load external data for the institution
      if (insp?.institution_id) {
        getExternalData(insp.institution_id).then(setExternalData);
      }
    });
  }, [inspectionId]);

  const handleVerify = async () => {
    if (!inspectionId) return;
    setVerifying(true);
    setVerifyStep(0);
    setVerified(false);

    for (let i = 0; i < verifySteps.length - 1; i++) {
      await new Promise(r => setTimeout(r, 600));
      setVerifyStep(i + 1);
    }

    try {
      await crossVerify(inspectionId);
      const [finds, insp] = await Promise.all([getFindings(inspectionId), getInspection(inspectionId)]);
      setFindings(finds);
      setInspection(insp);
      setVerified(true);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  // External data comparison
  const aishe = externalData.filter(e => e.source === 'AISHE');
  const nirf = externalData.filter(e => e.source === 'NIRF');

  const getExternalValue = (source: any[], metric: string) =>
    source.find(e => e.metric === metric)?.value || '—';

  const getClaimValue = (name: string) =>
    claims.find(c => c.claim_name === name)?.value || '—';

  const comparisonRows = [
    { metric: 'Total Students', claimKey: 'Total Students', aisheKey: 'Total Students', nirfKey: 'Total Students' },
    { metric: 'Total Faculty', claimKey: 'Total Faculty', aisheKey: 'Total Faculty', nirfKey: 'Total Faculty' },
    { metric: 'Laboratories', claimKey: 'Laboratories', aisheKey: 'Laboratories', nirfKey: 'Laboratories' },
    { metric: 'Programs', claimKey: 'Programs Offered', aisheKey: 'Programs', nirfKey: 'Programs' },
  ];

  const getStatus = (claim: string, aishe: string, nirf: string) => {
    const c = parseInt(claim), a = parseInt(aishe), n = parseInt(nirf);
    if (isNaN(c) || isNaN(a) || isNaN(n)) return 'UNKNOWN';
    const diff = Math.max(Math.abs(c - a), Math.abs(c - n));
    const pct = diff / c;
    if (pct > 0.1) return 'MISMATCH';
    if (pct > 0.02) return 'MINOR_MISMATCH';
    return 'CONSISTENT';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button onClick={() => navigate(`/inspections/${inspectionId}`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Inspection
      </button>

      <div className="section-header mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="section-title text-2xl">AI Cross-Verification</h1>
            <div className="ai-label"><Brain size={12} />AI Analysis</div>
          </div>
          <p className="section-subtitle">AI compares institutional claims against document, visual, and external evidence</p>
        </div>
        <button onClick={handleVerify} disabled={verifying} className="btn btn-primary">
          <Brain size={16} /> {verifying ? 'Running...' : 'Run Cross-Verification'}
        </button>
      </div>

      {/* Verification flow diagram */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Verification Flow</h2>
        <div className="flex items-start gap-2 flex-wrap">
          {[
            { label: 'Institution Claims', icon: FileText, color: 'bg-blue-100 text-blue-700 border-blue-200' },
            { label: '+ Documents', icon: FileText, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
            { label: '+ Visual AI', icon: Eye, color: 'bg-purple-100 text-purple-700 border-purple-200' },
            { label: '+ AISHE/NIRF', icon: Database, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
            { label: '→ AI Cross-Verify', icon: Brain, color: 'bg-amber-100 text-amber-700 border-amber-200' },
            { label: '→ Risk Score', icon: BarChart2, color: 'bg-red-100 text-red-700 border-red-200' },
            { label: '→ Inspector Decision', icon: CheckCircle2, color: 'bg-green-100 text-green-700 border-green-200' },
          ].map(({ label, icon: Icon, color }, i) => (
            <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${color}`}>
              <Icon size={13} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Processing animation */}
      {verifying && (
        <div className="card p-6 mb-6 border-blue-200 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="ai-label"><Brain size={12} />AI Cross-Verification Engine</div>
          </div>
          {verifySteps.map((step, i) => (
            <ProcessingStep key={i} text={step} done={i < verifyStep} active={i === verifyStep} />
          ))}
          <div className="mt-4 progress-bar-container">
            <div className="progress-bar-fill bg-blue-600" style={{ width: `${(verifyStep / (verifySteps.length - 1)) * 100}%` }} />
          </div>
        </div>
      )}

      {/* External data comparison */}
      {externalData.length > 0 && (
        <div className="card overflow-hidden mb-6">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <Database size={16} className="text-cyan-600" />
            <h2 className="section-title">External Data Comparison</h2>
            <span className="text-xs text-slate-400 ml-auto">Sources: AISHE · NIRF</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Institution Claim</th>
                <th>AISHE (2025)</th>
                <th>NIRF (2024)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(row => {
                const claimVal = getClaimValue(row.claimKey);
                const aisheVal = getExternalValue(aishe, row.aisheKey);
                const nirfVal = getExternalValue(nirf, row.nirfKey);
                const status = getStatus(claimVal, aisheVal, nirfVal);
                return (
                  <tr key={row.metric}>
                    <td className="font-medium text-slate-900">{row.metric}</td>
                    <td className="font-bold text-blue-700">{claimVal}</td>
                    <td className="font-semibold text-slate-700">{aisheVal}</td>
                    <td className="font-semibold text-slate-700">{nirfVal}</td>
                    <td>
                      <span className={`badge border text-xs ${
                        status === 'MISMATCH' ? 'badge-high' :
                        status === 'MINOR_MISMATCH' ? 'badge-medium' :
                        status === 'CONSISTENT' ? 'badge-low' : 'badge-gray'
                      }`}>
                        {statusLabel(status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Risk score */}
      {verified && inspection?.risk_score > 0 && (
        <div className="card p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 size={18} className="text-slate-600" />
                <h2 className="section-title">Institution Risk Score</h2>
                <div className="ai-label"><Brain size={11} />AI Computed</div>
              </div>
              <p className="text-sm text-slate-500">Composite score based on finding severity and evidence gaps</p>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold ${inspection.risk_level === 'High' ? 'text-red-600' : inspection.risk_level === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                {inspection.risk_score}
              </div>
              <div className="text-sm text-slate-400">/ 100</div>
              <span className={`badge mt-1 ${inspection.risk_level === 'High' ? 'badge-high' : inspection.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                {inspection.risk_level} Risk
              </span>
            </div>
          </div>
          <div className="mt-4 progress-bar-container h-3">
            <div
              className="progress-bar-fill"
              style={{
                width: `${inspection.risk_score}%`,
                background: inspection.risk_level === 'High' ? '#dc2626' : inspection.risk_level === 'Medium' ? '#d97706' : '#16a34a'
              }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-3">
            ⚠️ Risk score is an inspection-support indicator only. It is not an accreditation grade and does not determine institutional approval or rejection.
          </p>
        </div>
      )}

      {/* Findings */}
      {verified && findings.length > 0 && (
        <div className="card overflow-hidden animate-fade-in">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <h2 className="section-title">AI Findings ({findings.length})</h2>
              <div className="ai-label"><Brain size={11} />AI Analysis</div>
            </div>
            <button onClick={() => navigate(`/inspections/${inspectionId}/findings`)} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
              Review & Decide <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {findings.map(f => (
              <div key={f.id} className="p-5 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/findings/${f.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-400">{f.finding_number}</span>
                      <span className="badge badge-gray text-xs">{f.category}</span>
                      <span className={`badge text-xs border ${statusColor(f.status)}`}>
                        {statusLabel(f.status)}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">{f.title}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{f.description}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`badge ${f.risk === 'High' ? 'badge-high' : f.risk === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                      {f.risk} Risk
                    </span>
                    <span className="text-xs text-slate-400">
                      AI: {Math.round(f.ai_confidence * 100)}%
                    </span>
                    {f.inspector_decision && (
                      <span className={`badge text-xs ${f.inspector_decision === 'ACCEPTED' ? 'badge-low' : 'badge-medium'}`}>
                        {f.inspector_decision}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!verified && !verifying && (
        <div className="card p-12 text-center">
          <Brain size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Run cross-verification to generate AI findings</p>
          <p className="text-slate-400 text-sm mt-1">The AI will compare claims, documents, visuals, and external data</p>
        </div>
      )}

      {verified && (
        <div className="mt-6 flex justify-end">
          <button onClick={() => navigate(`/inspections/${inspectionId}/findings`)} className="btn btn-primary">
            Review Findings <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CrossVerificationPage;
