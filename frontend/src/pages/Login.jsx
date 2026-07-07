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
  const [focusField, setFocusField] = useState(null);

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
        setMfaState({ required: true, tempToken: res.data.tempToken, code: '' });
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

  // Shared Styles
  const wrapperStyle = {
    backgroundColor: '#0F172A',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardStyle = {
    backgroundColor: '#162033',
    width: '100%',
    maxWidth: '440px',
    borderRadius: '24px',
    padding: '3rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    zIndex: 1
  };

  const inputGroupStyle = { marginBottom: '1.5rem' };
  
  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: '0.5rem'
  };

  const inputBaseStyle = (field) => ({
    width: '100%',
    backgroundColor: '#0F172A',
    border: `1px solid ${focusField === field ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '12px',
    padding: '0.875rem 1rem',
    color: '#F8FAFC',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: focusField === field ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none'
  });

  const btnPrimaryStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: '1rem',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.7 : 1
  };

  // Background decoration
  const bgDecoration = (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)' }}></div>
      <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(20, 184, 166, 0.05) 0%, transparent 70%)' }}></div>
    </div>
  );

  if (mfaState.required) {
    return (
      <div style={wrapperStyle}>
        {bgDecoration}
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ color: '#F8FAFC', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🛡️</span> HuntrNepal
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Two-Factor Authentication</p>
          </div>

          <h2 style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>Enter MFA Code</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '2rem' }}>
            Enter the 6-digit code from your authenticator app to secure your session.
          </p>

          {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '0.75rem', borderRadius: '8px', color: '#EF4444', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</div>}

          <form onSubmit={handleMfaSubmit}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>6-Digit Code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={mfaState.code}
                onFocus={() => setFocusField('mfa')}
                onBlur={() => setFocusField(null)}
                onChange={e => setMfaState(prev => ({ ...prev, code: e.target.value }))}
                style={{ ...inputBaseStyle('mfa'), textAlign: 'center', fontSize: '1.75rem', letterSpacing: '0.5rem', fontWeight: '800' }}
                autoFocus
              />
            </div>
            <button type="submit" style={btnPrimaryStyle} disabled={loading}>
              {loading ? 'Verifying...' : 'Authenticate'}
            </button>
          </form>

          <button 
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#64748B', marginTop: '1.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
            onClick={() => setMfaState({ required: false, tempToken: '', code: '' })}
          >
            ← Back to Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      {bgDecoration}
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ color: '#F8FAFC', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span> HuntrNepal
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Premium Bug Bounty Ecosystem</p>
        </div>

        <h2 style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: '700', marginBottom: '2rem' }}>Sign In</h2>

        {successMessage && <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22C55E', padding: '0.75rem', borderRadius: '8px', color: '#22C55E', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{successMessage}</div>}
        {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '0.75rem', borderRadius: '8px', color: '#EF4444', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onFocus={() => setFocusField('email')}
              onBlur={() => setFocusField(null)}
              onChange={handleChange}
              placeholder="hunter@nepal.security"
              style={inputBaseStyle('email')}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div style={inputGroupStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={labelStyle}>Password</label>
              <Link to="/forgot-password" style={{ color: '#3B82F6', fontSize: '0.75rem', textDecoration: 'none', fontWeight: '600' }}>Forgot?</Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onFocus={() => setFocusField('password')}
              onBlur={() => setFocusField(null)}
              onChange={handleChange}
              placeholder="••••••••"
              style={inputBaseStyle('password')}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" style={btnPrimaryStyle} disabled={loading}>
            {loading ? 'Authorizing...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748B' }}>
          New to HuntrNepal? <Link to="/register" style={{ color: '#3B82F6', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;