import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle2, Brain, FileCheck, Users } from 'lucide-react';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('inspector@demo.com');
  const [password, setPassword] = useState('inspector123');
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

  const fillDemo = () => {
    setEmail('inspector@demo.com');
    setPassword('inspector123');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0c1a3a] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">InspectAI</div>
              <div className="text-slate-400 text-xs">Evidence-driven. AI-assisted. Human-verified.</div>
            </div>
          </div>

          <div className="mb-12">
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              AI-Driven<br />
              <span className="text-blue-400">Institution</span><br />
              Inspection
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              Evidence-traceable inspection support system for regulatory compliance verification.
            </p>
          </div>

          <div className="space-y-5">
            {[
              { icon: Brain, title: 'AI Cross-Verification', desc: 'Documents, visuals, and external data verified automatically' },
              { icon: FileCheck, title: 'Evidence Traceability', desc: 'Every finding traced back to its source evidence' },
              { icon: Users, title: 'Human-in-the-Loop', desc: 'Inspectors accept or override every AI finding' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{title}</div>
                  <div className="text-slate-400 text-sm">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="disclaimer bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-4">
            <div className="text-yellow-400 text-xs font-bold mb-1">⚡ AI ASSISTS — HUMAN DECIDES</div>
            <div className="text-yellow-200/70 text-xs">
              This system generates AI findings to support inspector decisions. All findings require human validation.
              AI does not accredit, approve, or reject institutions.
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="text-slate-900 font-bold text-xl">InspectAI</div>
              <div className="text-slate-400 text-xs">AI Inspection Assistant</div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Sign in</h2>
            <p className="text-slate-500">Access the AI Inspection Assistant</p>
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
                placeholder="inspector@demo.com"
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

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3 text-base"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Demo Credentials</span>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <div><span className="font-medium">Email:</span> inspector@demo.com</div>
              <div><span className="font-medium">Password:</span> inspector123</div>
            </div>
            <button
              onClick={fillDemo}
              className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
            >
              Use demo credentials →
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            For demonstration purposes only. This system assists human inspectors.<br />
            Final decisions remain with qualified inspection personnel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
