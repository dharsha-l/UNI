import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Filter, ChevronRight, Brain, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getFindings } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

type Filter = 'All' | 'High' | 'Medium' | 'Low' | 'Accepted' | 'Pending' | 'Overridden';

const FindingsPage: React.FC = () => {
  const { id: inspectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('All');

  const isInstitution = hasRole(['INSTITUTION_ADMIN', 'INSTITUTION_STAFF']);

  useEffect(() => {
    if (!inspectionId) return;
    getFindings(inspectionId).then(f => { setFindings(f); setLoading(false); });
  }, [inspectionId]);

  const filtered = findings.filter(f => {
    if (filter === 'High') return f.risk === 'High';
    if (filter === 'Medium') return f.risk === 'Medium';
    if (filter === 'Low') return f.risk === 'Low';
    if (filter === 'Accepted') return f.inspector_decision === 'ACCEPTED';
    if (filter === 'Overridden') return f.inspector_decision === 'OVERRIDDEN';
    if (filter === 'Pending') return !f.inspector_decision;
    return true;
  });

  const filters: Filter[] = ['All', 'High', 'Medium', 'Low', 'Pending', 'Accepted', 'Overridden'];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {inspectionId && (
        <button onClick={() => navigate(`/inspections/${inspectionId}`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
          <ArrowLeft size={16} /> Back to Inspection
        </button>
      )}

      <div className="section-header mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="section-title text-2xl">{isInstitution ? 'Inspection Findings' : 'Findings'}</h1>
            {!isInstitution && <div className="ai-label"><Brain size={12} />AI Generated</div>}
          </div>
          <p className="section-subtitle">{isInstitution ? 'Review potential discrepancies raised during inspection' : 'Review AI findings and make inspector decisions'}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`badge cursor-pointer transition-all ${
              filter === f
                ? f === 'High' ? 'badge-high' : f === 'Medium' ? 'badge-medium' : f === 'Low' ? 'badge-low' : 'badge-blue'
                : 'badge-gray'
            }`}
          >
            {f}
            <span className="ml-1 opacity-70">
              {f === 'All' ? findings.length :
               f === 'High' ? findings.filter(x => x.risk === 'High').length :
               f === 'Medium' ? findings.filter(x => x.risk === 'Medium').length :
               f === 'Low' ? findings.filter(x => x.risk === 'Low').length :
               f === 'Accepted' ? findings.filter(x => x.inspector_decision === 'ACCEPTED').length :
               f === 'Overridden' ? findings.filter(x => x.inspector_decision === 'OVERRIDDEN').length :
               findings.filter(x => !x.inspector_decision).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className={`w-8 h-8 border-2 ${isInstitution ? 'border-emerald-200 border-t-emerald-600' : 'border-blue-200 border-t-blue-600'} rounded-full animate-spin-slow`} style={{ borderWidth: 2 }} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Finding ID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Risk</th>
                {!isInstitution && <th>AI Confidence</th>}
                <th>{isInstitution ? 'Final Resolution' : 'Inspector Decision'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isInstitution ? 7 : 8} className="text-center py-12 text-slate-400">
                    No findings match the selected filter
                  </td>
                </tr>
              ) : filtered.map(f => (
                <tr key={f.id} className="cursor-pointer" onClick={() => navigate(`/findings/${f.id}`)}>
                  <td>
                    <span className="font-mono text-xs text-slate-500 font-medium">{f.finding_number}</span>
                  </td>
                  <td>
                    <span className="badge badge-gray text-xs">{f.category}</span>
                  </td>
                  <td className="max-w-xs">
                    <div className="font-medium text-slate-900 text-sm truncate">{f.title}</div>
                  </td>
                  <td>
                    <span className={`badge border text-xs ${statusColor(f.status)}`}>
                      {statusLabel(f.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${f.risk === 'High' ? 'badge-high' : f.risk === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                      {f.risk}
                    </span>
                  </td>
                  {!isInstitution && (
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar-container w-12">
                          <div className="progress-bar-fill bg-blue-500" style={{ width: `${f.ai_confidence * 100}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          {Math.round(f.ai_confidence * 100)}%
                        </span>
                      </div>
                    </td>
                  )}
                  <td>
                    {f.inspector_decision ? (
                      <div className="flex items-center gap-1.5">
                        {f.inspector_decision === 'ACCEPTED' ? (
                          <CheckCircle2 size={14} className="text-green-600" />
                        ) : (
                          <XCircle size={14} className="text-amber-600" />
                        )}
                        <span className={`badge text-xs ${f.inspector_decision === 'ACCEPTED' ? 'badge-low' : 'badge-medium'}`}>
                          {f.inspector_decision}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs text-slate-400">Pending</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <ChevronRight size={16} className="text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FindingsPage;
