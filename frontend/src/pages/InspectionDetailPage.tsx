import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Building2, Calendar, User, ClipboardList, FileStack,
  Eye, Brain, AlertTriangle, FileText, ChevronRight, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { getInspection, getFindings } from '../services/api';

const steps = [
  { label: 'Document Evidence', icon: FileStack, path: 'documents' },
  { label: 'Visual Evidence', icon: Eye, path: 'images' },
  { label: 'AI Cross-Verification', icon: Brain, path: 'verify' },
  { label: 'Findings Review', icon: AlertTriangle, path: 'findings' },
  { label: 'Generate Report', icon: FileText, path: 'report' },
];

const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getInspection(id), getFindings(id)]).then(([insp, finds]) => {
      setInspection(insp);
      setFindings(finds);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin-slow" style={{ borderWidth: 2 }} />
    </div>
  );

  if (!inspection) return <div className="p-8 text-slate-500">Inspection not found.</div>;

  const cats = JSON.parse(inspection.categories || '[]');
  const highRisk = findings.filter(f => f.risk === 'High').length;
  const pending = findings.filter(f => !f.inspector_decision).length;
  const decided = findings.filter(f => f.inspector_decision).length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <button onClick={() => navigate('/inspections')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Inspections
      </button>

      {/* Header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <ClipboardList size={20} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-mono text-blue-600 font-bold">{inspection.inspection_id}</div>
                <h1 className="text-xl font-bold text-slate-900">{inspection.institution_name}</h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-3">
              <div className="flex items-center gap-1.5"><Calendar size={13} /> {inspection.inspection_date}</div>
              <div className="flex items-center gap-1.5"><User size={13} /> {inspection.inspector_name}</div>
              <span className={`badge ${inspection.status === 'In Progress' ? 'badge-blue' : inspection.status === 'Completed' ? 'badge-low' : 'badge-gray'}`}>
                {inspection.status}
              </span>
            </div>
          </div>

          {inspection.risk_score > 0 && (
            <div className="text-center">
              <div className={`text-4xl font-bold ${inspection.risk_level === 'High' ? 'text-red-600' : inspection.risk_level === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                {inspection.risk_score}
              </div>
              <div className="text-xs text-slate-400">Risk Score /100</div>
              <span className={`badge mt-1 ${inspection.risk_level === 'High' ? 'badge-high' : inspection.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                {inspection.risk_level} Risk
              </span>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="mt-4 flex flex-wrap gap-2">
          {cats.map((c: string) => (
            <span key={c} className="badge badge-gray">{c}</span>
          ))}
        </div>
      </div>

      {/* Workflow steps */}
      <div className="card p-6 mb-6">
        <h2 className="section-title mb-5">Inspection Workflow</h2>
        <div className="flex flex-wrap gap-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <button
                key={step.path}
                onClick={() => navigate(`/inspections/${id}/${step.path}`)}
                className="flex-1 min-w-[140px] flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                  <Icon size={18} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700 text-center">{step.label}</span>
                <div className="flex items-center text-xs text-blue-500 font-medium">
                  Open <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Findings summary */}
      {findings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{highRisk}</div>
              <div className="text-sm text-slate-500">High Risk Findings</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{pending}</div>
              <div className="text-sm text-slate-500">Pending Review</div>
            </div>
          </div>
          <div className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{decided}</div>
              <div className="text-sm text-slate-500">Inspector Decisions</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent findings */}
      {findings.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="section-title">AI Findings</h2>
            <button onClick={() => navigate(`/inspections/${id}/findings`)} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
              Review all <ChevronRight size={14} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Finding</th>
                <th>Category</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Inspector</th>
              </tr>
            </thead>
            <tbody>
              {findings.slice(0, 5).map(f => (
                <tr key={f.id} className="cursor-pointer" onClick={() => navigate(`/findings/${f.id}`)}>
                  <td>
                    <div className="font-medium text-slate-900 text-sm">{f.title}</div>
                    <div className="text-xs text-slate-400 font-mono">{f.finding_number}</div>
                  </td>
                  <td><span className="badge badge-gray text-xs">{f.category}</span></td>
                  <td>
                    <span className={`text-xs font-medium ${
                      f.status === 'MISMATCH' ? 'text-red-600' :
                      f.status === 'CONSISTENT' ? 'text-green-600' :
                      f.status === 'INSUFFICIENT_EVIDENCE' ? 'text-amber-600' :
                      'text-slate-500'
                    }`}>
                      {f.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td><span className={`badge ${f.risk === 'High' ? 'badge-high' : f.risk === 'Medium' ? 'badge-medium' : 'badge-low'}`}>{f.risk}</span></td>
                  <td>
                    {f.inspector_decision ? (
                      <span className={`badge ${f.inspector_decision === 'ACCEPTED' ? 'badge-low' : 'badge-medium'}`}>
                        {f.inspector_decision}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Pending</span>
                    )}
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

export default InspectionDetailPage;
