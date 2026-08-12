import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, AlertTriangle, CheckCircle2,
  XCircle, Building2, User, Calendar, BarChart2, Eye, Loader2, Shield
} from 'lucide-react';
import { generateReport, getReport, getInspection } from '../services/api';

const ReportPage: React.FC = () => {
  const { id: inspectionId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [inspection, setInspection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!inspectionId) return;
    getInspection(inspectionId).then(setInspection);
    getReport(inspectionId)
      .then(r => { setReport(r.report); setLoading(false); })
      .catch(() => setLoading(false));
  }, [inspectionId]);

  const handleGenerate = async () => {
    if (!inspectionId) return;
    setGenerating(true);
    try {
      const res = await generateReport(inspectionId);
      setReport(res.report);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const content = JSON.stringify(report, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InspectAI_Report_${report.inspection_id}.json`;
    a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={20} className="text-slate-400 animate-spin-slow" />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={() => navigate(inspectionId ? `/inspections/${inspectionId}` : '/inspections')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Inspection
      </button>

      <div className="section-header mb-6">
        <div>
          <h1 className="section-title text-2xl">Inspection Report</h1>
          <p className="section-subtitle">AI-generated inspection report with inspector decisions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleGenerate} disabled={generating} className="btn btn-primary">
            {generating ? <Loader2 size={16} className="animate-spin-slow" /> : <FileText size={16} />}
            {generating ? 'Generating...' : report ? 'Regenerate' : 'Generate Report'}
          </button>
          {report && (
            <button onClick={handleDownload} className="btn btn-secondary">
              <Download size={16} /> Download
            </button>
          )}
        </div>
      </div>

      {!report ? (
        <div className="card p-12 text-center">
          <FileText size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Report Generated</h3>
          <p className="text-slate-400 text-sm mb-6">Generate the inspection report after reviewing all findings and making inspector decisions.</p>
          <button onClick={handleGenerate} disabled={generating} className="btn btn-primary mx-auto">
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          {/* Report header */}
          <div className="card p-6 border-blue-200 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-xl">InspectAI Inspection Report</div>
                <div className="text-blue-200 text-sm">Evidence-driven · AI-assisted · Human-verified</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><div className="text-blue-200 text-xs mb-1">Inspection ID</div><div className="font-bold">{report.inspection_id}</div></div>
              <div><div className="text-blue-200 text-xs mb-1">Institution</div><div className="font-bold">{report.institution}</div></div>
              <div><div className="text-blue-200 text-xs mb-1">Inspector</div><div className="font-bold">{report.inspector}</div></div>
              <div><div className="text-blue-200 text-xs mb-1">Date</div><div className="font-bold">{report.date}</div></div>
            </div>
          </div>

          {/* Risk summary */}
          <div className="card p-6">
            <h2 className="section-title mb-4">Risk Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className={`text-4xl font-bold mb-1 ${report.risk_level === 'High' ? 'text-red-600' : report.risk_level === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                  {report.risk_score}
                </div>
                <div className="text-xs text-slate-400">Overall Risk Score</div>
                <span className={`badge mt-1 text-xs ${report.risk_level === 'High' ? 'badge-high' : report.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                  {report.risk_level}
                </span>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-3xl font-bold text-red-600 mb-1">{report.high_risk}</div>
                <div className="text-xs text-slate-400">High Risk</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <div className="text-3xl font-bold text-amber-600 mb-1">{report.medium_risk}</div>
                <div className="text-xs text-slate-400">Medium Risk</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-1">{report.low_risk}</div>
                <div className="text-xs text-slate-400">Low Risk</div>
              </div>
            </div>
          </div>

          {/* Decisions summary */}
          <div className="card p-6">
            <h2 className="section-title mb-4">Inspector Decisions Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <CheckCircle2 size={24} className="text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{report.accepted}</div>
                <div className="text-xs text-slate-500">Accepted</div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <XCircle size={24} className="text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-700">{report.overridden}</div>
                <div className="text-xs text-slate-500">Overridden</div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <AlertTriangle size={24} className="text-slate-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-600">{report.pending}</div>
                <div className="text-xs text-slate-500">Pending</div>
              </div>
            </div>
          </div>

          {/* Findings detail */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="section-title">Findings Detail</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {report.findings?.map((f: any) => (
                <div key={f.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{f.finding_number}</span>
                        <span className="badge badge-gray text-xs">{f.category}</span>
                        <span className={`badge text-xs ${f.risk === 'High' ? 'badge-high' : f.risk === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                          {f.risk} Risk
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900 text-sm mb-1">{f.title}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{f.description}</div>
                      {f.inspector_comment && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                          <div className="text-xs font-semibold text-blue-700 mb-0.5">Inspector Comment:</div>
                          <div className="text-xs text-blue-600">{f.inspector_comment}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {f.inspector_decision ? (
                        <span className={`badge ${f.inspector_decision === 'ACCEPTED' ? 'badge-low' : 'badge-medium'}`}>
                          {f.inspector_decision}
                        </span>
                      ) : (
                        <span className="badge badge-gray">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="card p-5 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <Shield size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">{report.disclaimer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
