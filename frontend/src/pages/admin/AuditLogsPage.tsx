import React, { useEffect, useState } from 'react';
import { ShieldAlert, Activity, FileText, Download } from 'lucide-react';
import { getAuditLogs } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuditLogsPage: React.FC = () => {
  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRole(['SUPER_ADMIN'])) {
      navigate('/');
      return;
    }
    
    getAuditLogs().then(data => {
      // Sort by timestamp descending
      setLogs(data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setLoading(false);
    });
  }, [hasRole, navigate]);

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
            <ShieldAlert className="text-purple-600" /> Audit Logs
          </h1>
          <p className="section-subtitle">System-wide activity and security trails</p>
        </div>
        <button className="btn btn-secondary text-slate-600">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User ID</th>
              <th>Role</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400">
                  <Activity size={24} className="mx-auto mb-2 opacity-50" />
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="font-mono text-xs text-purple-600">{log.userId}</td>
                  <td>
                    <span className="badge badge-gray text-xs">{log.role}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      log.action.includes('OVERRIDE') ? 'badge-high' :
                      log.action.includes('UPLOAD') ? 'badge-blue' :
                      log.action.includes('LOGIN') ? 'badge-low' : 'badge-gray'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="text-sm font-medium text-slate-700">{log.entity}</td>
                  <td className="font-mono text-xs text-slate-500">{log.entityId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsPage;
