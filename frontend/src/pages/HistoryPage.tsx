import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Building2, Calendar, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getInspections, getInstitutions } from '../services/api';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInspections().then(i => { setInspections(i); setLoading(false); });
  }, []);

  // Build trend data for ABC Institute
  const abcHistory = inspections
    .filter(i => i.institution_id === 'inst-001' && i.risk_score > 0)
    .sort((a, b) => a.inspection_date.localeCompare(b.inspection_date))
    .map(i => ({ date: i.inspection_date, score: i.risk_score, id: i.inspection_id }));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title text-2xl">Inspection History</h1>
          <p className="section-subtitle">Historical record of all inspections and risk trends</p>
        </div>
      </div>

      {/* Risk trend chart */}
      {abcHistory.length > 0 && (
        <div className="card p-6 mb-6">
          <div className="section-header mb-4">
            <div>
              <div className="section-title">Risk Trend — ABC Institute of Technology</div>
              <div className="section-subtitle">Risk score over inspection history</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={abcHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: 'white', fontSize: 12 }}
                formatter={(v: any) => [`${v}/100`, 'Risk Score']}
              />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* All inspections */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin-slow" style={{ borderWidth: 2 }} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Inspection ID</th>
                <th>Date</th>
                <th>Risk Score</th>
                <th>Trend</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((insp, idx) => {
                const prev = inspections[idx + 1];
                const prevScore = prev?.institution_id === insp.institution_id ? prev?.risk_score : null;
                const trend = prevScore != null ? insp.risk_score - prevScore : 0;

                return (
                  <tr key={insp.id} className="cursor-pointer" onClick={() => navigate(`/inspections/${insp.id}`)}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Building2 size={13} className="text-slate-400" />
                        <span className="font-medium text-slate-900 text-sm">{insp.institution_name}</span>
                      </div>
                    </td>
                    <td className="font-mono text-sm text-blue-600">{insp.inspection_id}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar size={12} className="text-slate-400" />
                        {insp.inspection_date}
                      </div>
                    </td>
                    <td>
                      {insp.risk_score > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-base ${insp.risk_level === 'High' ? 'text-red-600' : insp.risk_level === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                            {insp.risk_score}
                          </span>
                          <span className={`badge ${insp.risk_level === 'High' ? 'badge-high' : insp.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                            {insp.risk_level}
                          </span>
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td>
                      {trend !== 0 ? (
                        <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {trend > 0 ? '+' : ''}{trend}
                        </div>
                      ) : (
                        <Minus size={14} className="text-slate-300" />
                      )}
                    </td>
                    <td>
                      <span className={`badge ${insp.status === 'Completed' ? 'badge-low' : insp.status === 'In Progress' ? 'badge-blue' : 'badge-gray'}`}>
                        {insp.status}
                      </span>
                    </td>
                    <td><ChevronRight size={16} className="text-slate-400" /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
