import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle2, Brain, FileCheck, Users, GitBranch, ArrowLeft } from 'lucide-react';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const InspectionLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('lead@uninspection.demo');
  const [password, setPassword] = useState('DemoLead@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      authLogin(res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@uninspection.demo');
    setPassword('DemoAdmin@123');
  };

  const fillDemoLead = () => {
    setEmail('lead@uninspection.demo');
    setPassword('DemoLead@123');
  };

  const fillDemoMember = () => {
    setEmail('member@uninspection.demo');
    setPassword('DemoMember@123');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#0a1628] via-[#0f172a] to-[#0c1a3a] relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Decorative accent lines */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl tracking-tight">UNI-INSPECTION</div>
              <div className="text-blue-400 text-xs font-medium">Inspection Portal</div>
            </div>
          </div>

          {/* Hero text */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-blue-400 text-xs font-medium">Evidence-Traceable · Human-in-the-Loop</span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              AI suggests.<br />
              <span className="text-blue-400">Evidence</span> explains.<br />
              Inspector decides.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              An evidence-traceable inspection platform for verifying higher educational institutions. 
              Document + Image + External Data → Cross-Verification → Human Decision.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon: Brain, title: 'AI Cross-Verification', desc: 'Documents, visuals, and AISHE/NIRF data cross-verified automatically' },
              { icon: FileCheck, title: 'Evidence Traceability', desc: 'Every finding traced to Claim → Document → Image → External Data → Regulation' },
              { icon: Users, title: 'Human-in-the-Loop', desc: 'Inspectors Accept or Override every AI finding with audit trail' },
              { icon: GitBranch, title: 'Regulation-Aware RAG', desc: 'NAAC · AICTE · UGC · NIRF regulatory references retrieved automatically' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 bg-blue-600/15 border border-blue-500/25 rounded-lg flex items-center justify-center">
                  <Icon size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="relative z-10">
          <div className="bg-amber-900/20 border border-amber-500/25 rounded-lg p-4">
            <div className="text-amber-400 text-xs font-bold mb-1">⚡ AI ASSISTS — INSPECTOR DECIDES</div>
            <div className="text-amber-200/60 text-xs leading-relaxed">
              UNI-INSPECTION generates AI findings to support inspection decisions. 
              All findings require human validation before inclusion in final reports. 
              AI does not accredit, approve, or reject institutions.
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-8 left-8 text-slate-500 hover:text-slate-800 flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Back to Portal Selection
        </button>

        <div className="w-full max-w-md animate-fade-in mt-12">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="text-slate-900 font-bold text-xl">UNI-INSPECTION</div>
              <div className="text-slate-400 text-xs">Inspection Portal</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Inspection Login</h2>
            <p className="text-slate-500">Sign in to access the Inspection Portal</p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                id="email-input"
                className="form-input"
                placeholder="lead@uninspection.demo"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password-input"
                  className="form-input pr-10"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-blue-600 hover:underline">Forgot Password?</button>
            </div>

            <button
              type="submit"
              id="login-btn"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3 text-base"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                  Signing in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">Demo Accounts</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={fillDemoAdmin} className="text-left text-xs p-2 bg-white border border-slate-200 rounded hover:border-blue-500">
                <div className="font-semibold text-slate-700">Super Admin</div>
                <div className="text-slate-500">admin@...</div>
              </button>
              <button onClick={fillDemoLead} className="text-left text-xs p-2 bg-white border border-slate-200 rounded hover:border-blue-500">
                <div className="font-semibold text-slate-700">Inspection Admin</div>
                <div className="text-slate-500">lead@...</div>
              </button>
              <button onClick={fillDemoMember} className="text-left text-xs p-2 bg-white border border-slate-200 rounded hover:border-blue-500">
                <div className="font-semibold text-slate-700">Inspection Member</div>
                <div className="text-slate-500">member@...</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionLogin;
