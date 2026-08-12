import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, ClipboardList, AlertTriangle, FileStack, ArrowRight,
  TrendingUp, TrendingDown, CheckCircle2, Clock, AlertCircle, Play
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getDashboard } from '../services/api';

const riskColors = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' };
const statusColors = { completed: '#16a34a', in_progress: '#2563eb', pending: '#64748b' };

const StatCard: React.FC<{ label: string; value: number; icon: React.FC<any>; color: string; trend?: string }> = ({
  label, value, icon: Icon, color, trend
}) => (
  <div className="card p-6 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
      {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} />
    </div>
  </div>
);

const statusLabel: Record<string, string> = {
  MISMATCH: 'Mismatch',
  INSUFFICIENT_EVIDENCE: 'Insufficient Evidence',
  CONSISTENT: 'Consistent',
  REQUIRES_VERIFICATION: 'Requires Verification',
  MINOR_MISMATCH: 'Minor Mismatch',
  PENDING: 'Pending',
};

const riskBadge = (risk: string) => {
  const cls = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' }[risk] || 'badge-gray';
  return <span className={`badge ${cls}`}>{risk}</span>;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'In Progress': 'badge-blue',
    Completed: 'badge-low',
    Pending: 'badge-gray',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin-slow mx-auto mb-4" style={{ borderWidth: 3 }} />
        <p className="text-slate-500">Loading dashboard...</p>
      </div>
    </div>
  );

  const statusData = data ? [
    { name: 'Completed', value: data.statusBreakdown?.completed || 0, color: '#16a34a' },
    { name: 'In Progress', value: data.statusBreakdown?.in_progress || 0, color: '#2563eb' },
    { name: 'Pending', value: data.statusBreakdown?.pending || 0, color: '#94a3b8' },
  ] : [];

  const riskData = data ? [
    { name: 'High Risk', value: data.riskBreakdown?.high || 0, color: '#dc2626' },
    { name: 'Medium Risk', value: data.riskBreakdown?.medium || 0, color: '#d97706' },
    { name: 'Low Risk', value: data.riskBreakdown?.low || 0, color: '#16a34a' },
  ] : [];

  const riskBarData = [
    { month: 'Nov 25', score: 55 },
    { month: 'Dec 25', score: 64 },
    { month: 'Jan 26', score: 58 },
    { month: 'Feb 26', score: 49 },
    { month: 'Mar 26', score: 61 },
    { month: 'Aug 26', score: 72 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inspection Command Center</h1>
            <p className="text-slate-500 mt-1">AI-assisted, evidence-traceable institutional inspection</p>
          </div>
          <button
            onClick={() => navigate('/inspections')}
            className="btn btn-primary"
          >
            <Play size={16} />
            New Inspection
          </button>
        </div>

        {/* Tagline banner */}
        <div className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <AlertCircle size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm">AI suggests. Human decides.</div>
              <div className="text-blue-200 text-xs">All AI findings require inspector validation before inclusion in final report.</div>
            </div>
          </div>
          <span className="text-blue-200 text-xs font-medium bg-white/10 px-3 py-1 rounded-full">
            Evidence-driven · AI-assisted · Human-verified
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Institutions" value={data?.institutionCount || 0} icon={Building2} color="bg-blue-50 text-blue-600" trend="4 active institutions" />
        <StatCard label="Active Inspections" value={data?.activeInspections || 0} icon={ClipboardList} color="bg-indigo-50 text-indigo-600" trend="In progress" />
        <StatCard label="High-Risk Findings" value={data?.highRiskFindings || 0} icon={AlertTriangle} color="bg-red-50 text-red-600" trend="Pending review" />
        <StatCard label="Evidence Items" value={data?.evidenceItems || 0} icon={FileStack} color="bg-emerald-50 text-emerald-600" trend="Documents + images" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Risk trend */}
        <div className="card p-6 lg:col-span-2">
          <div className="section-header">
            <div>
              <div className="section-title">Risk Score Trend</div>
              <div className="section-subtitle">ABC Institute of Technology — last 6 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={riskBarData} barSize={32}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: 'white', fontSize: 13 }}
                formatter={(v: number) => [`${v}/100`, 'Risk Score']}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {riskBarData.map((entry, i) => (
                  <Cell key={i} fill={entry.score >= 60 ? '#dc2626' : entry.score >= 35 ? '#d97706' : '#16a34a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status / Risk donut */}
        <div className="card p-6">
          <div className="section-header">
            <div>
              <div className="section-title">Inspection Status</div>
              <div className="section-subtitle">All inspections</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: 'white', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent inspections */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="section-title">Recent Inspections</div>
            <div className="section-subtitle">Latest inspection activities</div>
          </div>
          <button onClick={() => navigate('/inspections')} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Inspection ID</th>
                <th>Date</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentInspections?.map((insp: any) => (
                <tr key={insp.id} className="cursor-pointer" onClick={() => navigate(`/inspections/${insp.id}`)}>
                  <td>
                    <div className="font-medium text-slate-900">{insp.institution_name}</div>
                    <div className="text-xs text-slate-400">{insp.inspector_name}</div>
                  </td>
                  <td className="font-mono text-sm text-slate-600">{insp.inspection_id}</td>
                  <td className="text-slate-500 text-sm">{insp.inspection_date}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar-container w-20">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${insp.risk_score}%`,
                            background: insp.risk_level === 'High' ? '#dc2626' : insp.risk_level === 'Medium' ? '#d97706' : '#16a34a'
                          }}
                        />
                      </div>
                      <span className={`font-bold text-sm ${insp.risk_level === 'High' ? 'text-red-600' : insp.risk_level === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                        {insp.risk_score}
                      </span>
                    </div>
                  </td>
                  <td>{statusBadge(insp.status)}</td>
                  <td>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/inspections/${insp.id}`); }}
                      className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1"
                    >
                      Open <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
