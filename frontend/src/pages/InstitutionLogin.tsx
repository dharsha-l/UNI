import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, UploadCloud, FileText, Lock } from 'lucide-react';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const InstitutionLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('institution@uninspection.demo');
  const [password, setPassword] = useState('DemoInstitution@123');
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
    setEmail('institution@uninspection.demo');
    setPassword('DemoInstitution@123');
  };

  const fillDemoStaff = () => {
    setEmail('staff@uninspection.demo');
    setPassword('DemoStaff@123');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#06201b] via-[#0f2922] to-[#0a1b1a] relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Decorative accent lines */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl tracking-tight">UNI-INSPECTION</div>
              <div className="text-emerald-400 text-xs font-medium">Institution Portal</div>
            </div>
          </div>

          {/* Hero text */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Submit Evidence.<br />
              <span className="text-emerald-400">Track Progress.</span><br />
              Ensure Compliance.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              The secure portal for higher educational institutions to upload documentation, submit infrastructure evidence, and respond to inspector requests.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon: UploadCloud, title: 'Secure Evidence Submission', desc: 'Upload SSR documents, certificates, and infrastructure images.' },
              { icon: FileText, title: 'Real-time Tracking', desc: 'Monitor the status of your inspection and AI analysis in real-time.' },
              { icon: Lock, title: 'Data Privacy', desc: 'Your institutional data is isolated and secure.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 bg-emerald-600/15 border border-emerald-500/25 rounded-lg flex items-center justify-center">
                  <Icon size={16} className="text-emerald-400" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{title}</div>
                  <div className="text-slate-500 text-xs leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Institution Login</h2>
            <p className="text-slate-500">Sign in to access the Institution Portal</p>
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
                className="form-input"
                placeholder="institution@uninspection.demo"
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
              <button type="button" className="text-sm text-emerald-600 hover:underline">Forgot Password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn w-full justify-center py-3 text-base bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-slate-600" />
              <span className="text-sm font-semibold text-slate-800">Demo Accounts</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={fillDemoAdmin} className="text-left text-xs p-2 bg-white border border-slate-200 rounded hover:border-emerald-500">
                <div className="font-semibold text-slate-700">Institution Admin</div>
                <div className="text-slate-500">institution@...</div>
              </button>
              <button onClick={fillDemoStaff} className="text-left text-xs p-2 bg-white border border-slate-200 rounded hover:border-emerald-500">
                <div className="font-semibold text-slate-700">Institution Staff</div>
                <div className="text-slate-500">staff@...</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionLogin;
