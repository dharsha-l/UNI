import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Users, BookOpen, GraduationCap, Plus, ChevronRight, Search, ExternalLink } from 'lucide-react';
import { getInstitutions } from '../services/api';

const accreditationColor = (status?: string) => {
  if (!status) return 'badge-gray';
  if (status.includes('A')) return 'badge-low';
  if (status.includes('B')) return 'badge-medium';
  if (status.includes('Under')) return 'badge-blue';
  return 'badge-gray';
};

const InstitutionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getInstitutions().then(data => { setInstitutions(data); setLoading(false); });
  }, []);

  const filtered = institutions.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.aishe_code.toLowerCase().includes(search.toLowerCase()) ||
    i.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title text-2xl">Institutions</h1>
          <p className="section-subtitle">Manage and inspect registered institutions</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Add Institution
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="form-input pl-9"
          placeholder="Search institutions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin-slow" style={{ borderWidth: 2 }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(inst => (
            <div
              key={inst.id}
              className="card p-6 cursor-pointer"
              onClick={() => navigate(`/institutions/${inst.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{inst.name}</h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">AISHE: {inst.aishe_code}</div>
                  </div>
                </div>
                <span className={`badge ${accreditationColor(inst.accreditation_status)}`}>
                  {inst.accreditation_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={14} className="text-slate-400" />
                  {inst.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <GraduationCap size={14} className="text-slate-400" />
                  {inst.type}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Users size={14} className="text-slate-400" />
                  {inst.students.toLocaleString()} students
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <BookOpen size={14} className="text-slate-400" />
                  {inst.programs} programs
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-400">
                  Est. {inst.established} · {inst.faculty} faculty
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/institutions/${inst.id}`); }}
                    className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1"
                  >
                    View Profile <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstitutionsPage;
