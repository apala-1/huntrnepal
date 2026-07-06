import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [mfaState, setMfaState] = useState({ required: false, tempToken: '', code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', formData);

      if (res.data.mfaRequired) {
        setMfaState({ 
          required: true, 
          tempToken: res.data.tempToken, 
          code: '' 
        });
      } else {
        login(res.data.user);
        navigate(getDashboardRoute(res.data.user.role));
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/mfa/login', {
        token: mfaState.code,
        tempToken: mfaState.tempToken
      });
      login(res.data.user);
      navigate(getDashboardRoute(res.data.user.role));
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid MFA code');
    } finally {
      setLoading(false);
    }
  };

  const getDashboardRoute = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'company') return '/dashboard/company';
    return '/dashboard';
  };

  // ── MFA screen ──
  if (mfaState.required) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-logo">
            <h1>🛡️ HuntrNepal</h1>
            <p>Two-Factor Authentication</p>
          </div>
          <div className="card">
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.3rem' }}>
              Enter MFA Code
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Open your authenticator app and enter the 6-digit code.
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleMfaSubmit}>
              <div className="form-group">
                <label>Authentication Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaState.code}
                  onChange={e => setMfaState(prev => ({ ...prev, code: e.target.value }))}
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          </div>
          <div className="auth-footer">
            <button 
              className="btn btn-outline" 
              style={{ marginTop: '1rem' }}
              onClick={() => setMfaState({ required: false, tempToken: '', code: '' })}
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Login screen ──
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🛡️ HuntrNepal</h1>
          <p>Bug Bounty & Vulnerability Disclosure Platform</p>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>
            Sign In
          </h2>

          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
          <br />
          <Link to="/forgot-password" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;