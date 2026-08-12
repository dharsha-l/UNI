import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Users, BookOpen, GraduationCap, Calendar,
  Play, FileStack, History, ArrowLeft, Award, Hash, ChevronRight,
  TrendingUp, AlertTriangle
} from 'lucide-react';
import { getInstitution, getInspectionHistory } from '../services/api';

const InstitutionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getInstitution(id), getInspectionHistory(id)]).then(([inst, hist]) => {
      setInstitution(inst);
      setHistory(hist);
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin-slow" style={{ borderWidth: 2 }} />
    </div>
  );

  if (!institution) return <div className="p-8 text-slate-500">Institution not found.</div>;

  const latestInspection = history[0];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate('/institutions')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Back to Institutions
      </button>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Building2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{institution.name}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="font-mono text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  AISHE: {institution.aishe_code}
                </span>
                <span className="badge badge-blue">{institution.type}</span>
                <span className={`badge ${institution.accreditation_status.includes('Under') ? 'badge-blue' : 'badge-low'}`}>
                  {institution.accreditation_status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate('/inspections', { state: { preselected: id } })}
              className="btn btn-primary"
            >
              <Play size={16} /> Start New Inspection
            </button>
            <button onClick={() => navigate('/evidence')} className="btn btn-secondary">
              <FileStack size={16} /> View Evidence
            </button>
            <button onClick={() => navigate(`/history`)} className="btn btn-secondary">
              <History size={16} /> View History
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Institution details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Key metrics */}
          <div className="card p-6">
            <h2 className="section-title mb-5">Institution Profile</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {[
                { label: 'Location', value: institution.location, icon: MapPin },
                { label: 'Affiliation', value: institution.affiliation, icon: Award },
                { label: 'Established', value: institution.established, icon: Calendar },
                { label: 'Total Students', value: institution.students.toLocaleString(), icon: Users },
                { label: 'Total Faculty', value: institution.faculty, icon: GraduationCap },
                { label: 'Programs Offered', value: institution.programs, icon: BookOpen },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-slate-500" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">{label}</div>
                    <div className="text-sm font-semibold text-slate-800 mt-0.5">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inspection history */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="section-title">Inspection History</h2>
              <button onClick={() => navigate('/history')} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
                Full history <ChevronRight size={14} />
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Inspection ID</th>
                  <th>Date</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-slate-400 py-8">No inspections yet</td></tr>
                ) : history.map(h => (
                  <tr key={h.id} className="cursor-pointer" onClick={() => navigate(`/inspections/${h.id}`)}>
                    <td className="font-mono text-sm text-blue-600">{h.inspection_id}</td>
                    <td className="text-slate-500 text-sm">{h.inspection_date}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${h.risk_level === 'High' ? 'text-red-600' : h.risk_level === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                          {h.risk_score}/100
                        </span>
                        <span className={`badge ${h.risk_level === 'High' ? 'badge-high' : h.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                          {h.risk_level}
                        </span>
                      </div>
                    </td>
                    <td><span className={`badge ${h.status === 'Completed' ? 'badge-low' : h.status === 'In Progress' ? 'badge-blue' : 'badge-gray'}`}>{h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Current risk */}
          {latestInspection && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-700 mb-4 text-sm">Current Risk Status</h3>
              <div className="text-center py-4">
                <div className={`text-5xl font-bold mb-2 ${latestInspection.risk_level === 'High' ? 'text-red-600' : latestInspection.risk_level === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                  {latestInspection.risk_score}
                </div>
                <div className="text-sm text-slate-500 mb-2">out of 100</div>
                <span className={`badge ${latestInspection.risk_level === 'High' ? 'badge-high' : latestInspection.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                  {latestInspection.risk_level} Risk
                </span>
              </div>
              <div className="mt-3 progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${latestInspection.risk_score}%`,
                    background: latestInspection.risk_level === 'High' ? '#dc2626' : latestInspection.risk_level === 'Medium' ? '#d97706' : '#16a34a'
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Risk score is an inspection-support indicator, not an accreditation grade.
              </p>
            </div>
          )}

          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-4 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'View AI Findings', icon: AlertTriangle, path: '/findings' },
                { label: 'Inspection History', icon: History, path: '/history' },
                { label: 'Evidence Library', icon: FileStack, path: '/evidence' },
                { label: 'View Reports', icon: TrendingUp, path: '/reports' },
              ].map(({ label, icon: Icon, path }) => (
                <button key={label} onClick={() => navigate(path)} className="w-full flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 p-2.5 rounded-lg transition-colors">
                  <Icon size={15} className="text-slate-400" />
                  {label}
                  <ChevronRight size={13} className="ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDetailPage;
