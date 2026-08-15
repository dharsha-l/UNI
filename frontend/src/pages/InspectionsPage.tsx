import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, ArrowRight, Calendar, Building2, User, AlertTriangle, ChevronRight } from 'lucide-react';
import { getInspections, getInstitutions, createInspection } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Institutional Data', 'Infrastructure', 'Fire Safety', 'Accessibility', 'Academic Facilities', 'Student Data', 'Faculty Data'];

const statusBadge = (status: string, isInstitution: boolean) => {
  const map: Record<string, string> = { 'In Progress': isInstitution ? 'badge-low' : 'badge-blue', Completed: 'badge-low', Pending: 'badge-gray' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

const InspectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [inspections, setInspections] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    institution_id: 'inst-001',
    inspection_date: '2026-08-12',
    categories: CATEGORIES,
  });

  const isInstitution = hasRole(['INSTITUTION_ADMIN', 'INSTITUTION_STAFF']);

  useEffect(() => {
    Promise.all([
      getInspections().catch(err => { console.error(err); return []; }),
      getInstitutions().catch(err => { console.error(err); return []; })
    ]).then(([insps, insts]) => {
      setInspections(Array.isArray(insps) ? insps : []);
      setInstitutions(Array.isArray(insts) ? insts : []);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const result = await createInspection({ ...form, inspector_id: user?.id || 'user-001' });
      setInspections(prev => [result, ...prev]);
      setShowCreate(false);
      navigate(`/inspections/${result.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat]
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title text-2xl">Inspections</h1>
          <p className="section-subtitle">{isInstitution ? 'View your institution\'s inspections' : 'Create and manage institutional inspections'}</p>
        </div>
        {!isInstitution && (
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={16} /> New Inspection
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && !isInstitution && (
        <div className="card p-6 mb-6 animate-fade-in border-blue-200">
          <h2 className="section-title mb-5">Create New Inspection</h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="form-label">Institution</label>
                <select
                  className="form-input"
                  value={form.institution_id}
                  onChange={e => setForm(f => ({ ...f, institution_id: e.target.value }))}
                >
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Inspection Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.inspection_date}
                  onChange={e => setForm(f => ({ ...f, inspection_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Inspection Categories</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`badge cursor-pointer transition-all ${form.categories.includes(cat) ? 'badge-blue' : 'badge-gray'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={creating} className="btn btn-primary">
                {creating ? 'Creating...' : '⚡ Start Inspection'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inspections list */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className={`w-8 h-8 border-2 ${isInstitution ? 'border-emerald-200 border-t-emerald-600' : 'border-blue-200 border-t-blue-600'} rounded-full animate-spin-slow`} style={{ borderWidth: 2 }} />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Inspection ID</th>
                <th>Inspector</th>
                <th>Date</th>
                {!isInstitution && <th>Risk Score</th>}
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inspections.map(insp => (
                <tr key={insp.id} className="cursor-pointer" onClick={() => navigate(`/inspections/${insp.id}`)}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span className="font-medium text-slate-900">{insp.institution_name}</span>
                    </div>
                  </td>
                  <td className={`font-mono text-sm ${isInstitution ? 'text-emerald-600' : 'text-blue-600'}`}>{insp.inspection_id}</td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <User size={13} className="text-slate-400" />
                      {insp.inspector_name}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                      <Calendar size={13} className="text-slate-400" />
                      {insp.inspection_date}
                    </div>
                  </td>
                  {!isInstitution && (
                    <td>
                      {insp.risk_score > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="progress-bar-container w-16">
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
                      ) : (
                        <span className="text-slate-300 text-sm">—</span>
                      )}
                    </td>
                  )}
                  <td>{statusBadge(insp.status, isInstitution)}</td>
                  <td>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/inspections/${insp.id}`); }}
                      className={`${isInstitution ? 'text-emerald-600 hover:text-emerald-800' : 'text-blue-600 hover:text-blue-800'}`}
                    >
                      <ChevronRight size={16} />
                    </button>
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

export default InspectionsPage;
