import React, { useEffect, useState } from 'react';
import { Shield, Plus, User, Building2, Trash2, Edit } from 'lucide-react';
import { getUsers, createUser, deleteUser, updateUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UsersPage: React.FC = () => {
  const { hasRole, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'INSPECTION_MEMBER',
    institutionId: ''
  });

  useEffect(() => {
    if (!hasRole(['SUPER_ADMIN'])) {
      navigate('/');
      return;
    }
    
    getUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, [hasRole, navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser = await createUser(form);
      setUsers([...users, newUser]);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', role: 'INSPECTION_MEMBER', institutionId: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to create user');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete user');
      }
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      const updated = await updateUser(id, { role });
      setUsers(users.map(u => u.id === id ? updated : u));
    } catch (err) {
      console.error(err);
      alert('Failed to update role');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin-slow" style={{ borderWidth: 2 }} />
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title text-2xl flex items-center gap-2">
            <Shield className="text-purple-600" /> User Management
          </h1>
          <p className="section-subtitle">Manage roles and access for UNI-INSPECTION</p>
        </div>
        <button className="btn btn-primary bg-purple-600 hover:bg-purple-700" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={16} /> Add User
        </button>
      </div>

      {showCreate && (
        <div className="card p-6 mb-6 animate-fade-in border-purple-200">
          <h2 className="section-title mb-5">Create New User</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name</label>
                <input required type="text" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input required type="email" className="form-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Temporary Password</label>
                <input required type="password" className="form-input" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  <option value="INSPECTION_ADMIN">INSPECTION_ADMIN</option>
                  <option value="INSPECTION_MEMBER">INSPECTION_MEMBER</option>
                  <option value="INSTITUTION_ADMIN">INSTITUTION_ADMIN</option>
                  <option value="INSTITUTION_STAFF">INSTITUTION_STAFF</option>
                </select>
              </div>
              {form.role.startsWith('INSTITUTION') && (
                <div>
                  <label className="form-label">Institution ID (e.g. inst-001)</label>
                  <input required type="text" className="form-input" value={form.institutionId} onChange={e => setForm({...form, institutionId: e.target.value})} />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary bg-purple-600 hover:bg-purple-700">Create User</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Institution</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <User size={14} className="text-slate-500" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 text-sm">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <select 
                    className="text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === currentUser?.id}
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="INSPECTION_ADMIN">INSPECTION_ADMIN</option>
                    <option value="INSPECTION_MEMBER">INSPECTION_MEMBER</option>
                    <option value="INSTITUTION_ADMIN">INSTITUTION_ADMIN</option>
                    <option value="INSTITUTION_STAFF">INSTITUTION_STAFF</option>
                  </select>
                </td>
                <td>
                  {u.institutionId ? (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Building2 size={12} className="text-slate-400" />
                      {u.institutionId}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {u.id !== currentUser?.id && (
                    <button 
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
