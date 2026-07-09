import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token') || '';

  const [step, setStep] = useState(tokenFromUrl ? 'reset' : 'request');
  const [email, setEmail] = useState(emailFromUrl);
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStep('reset');
    } catch (err) {
      setMessage('If an account exists with this email, reset instructions have been sent.');
      setStep('reset');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, token, newPassword });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Premium Styles
  const wrapperStyle = {
    backgroundColor: '#0F172A',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardStyle = {
    backgroundColor: '#162033',
    width: '100%',
    maxWidth: '480px',
    borderRadius: '24px',
    padding: 'clamp(1.5rem, 5vw, 3rem)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    zIndex: 1
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
    marginTop: '1.5rem',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.7 : 1
  };

  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#94A3B8', marginBottom: '0.5rem' };

  return (
    <div style={wrapperStyle}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .auth-card { animation: fadeIn 0.4s ease-out; }
        @media (max-width: 480px) { .auth-card { padding: 1.5rem; border-radius: 16px; } }
      `}</style>
      
      <div className="auth-card" style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ color: '#F8FAFC', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span> HuntrNepal
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Security Protocol: Account Recovery</p>
        </div>

        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.3)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          {step === 'request' && (
            <>
              <h2 style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Forgot Password</h2>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Enter your registered email and we'll transmit a secure reset token.
              </p>
              {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '0.75rem', borderRadius: '8px', color: '#EF4444', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</div>}
              <form onSubmit={handleRequest}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="hunter@nepal.security"
                    style={inputBaseStyle('email')}
                    required autoFocus
                  />
                </div>
                <button type="submit" style={btnPrimaryStyle} disabled={loading}>
                  {loading ? 'Transmitting...' : 'Request Token'}
                </button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <h2 style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Reset Password</h2>
              {message && <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22C55E', padding: '1rem', borderRadius: '12px', color: '#22C55E', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>{message}</div>}
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Enter the 6-digit verification code sent to your email.</p>
              {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '0.75rem', borderRadius: '8px', color: '#EF4444', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{error}</div>}
              <form onSubmit={handleReset}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Verify Email</label>
                  <input type="email" value={email} style={{ ...inputBaseStyle('none'), opacity: 0.6 }} readOnly />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Reset Token</label>
                  <input
                    value={token}
                    onFocus={() => setFocusField('token')}
                    onBlur={() => setFocusField(null)}
                    onChange={e => setToken(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    style={{ ...inputBaseStyle('token'), textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem', fontWeight: '800' }}
                    autoFocus
                  />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>New Secure Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onFocus={() => setFocusField('new')}
                    onBlur={() => setFocusField(null)}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    style={inputBaseStyle('new')}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onFocus={() => setFocusField('confirm')}
                    onBlur={() => setFocusField(null)}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    style={inputBaseStyle('confirm')}
                  />
                </div>
                <button type="submit" style={btnPrimaryStyle} disabled={loading}>
                  {loading ? 'Updating Vault...' : 'Reset Password'}
                </button>
              </form>
              <button style={{ width: '100%', background: 'transparent', border: 'none', color: '#3B82F6', marginTop: '1rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700' }} onClick={() => setStep('request')}>Resend Token</button>
            </>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3.5rem', color: '#22C55E', marginBottom: '1.5rem' }}>✓</div>
              <h2 style={{ color: '#F8FAFC', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem' }}>Identity Verified</h2>
              <p style={{ color: '#94A3B8', marginBottom: '2rem', lineHeight: '1.6' }}>Your credentials have been successfully updated. You may now re-authenticate.</p>
              <button style={btnPrimaryStyle} onClick={() => navigate('/login')}>Return to Login</button>
            </div>
          )}
        </div>

        {step === 'request' && (
          <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748B' }}>
            Remember it? <Link to="/login" style={{ color: '#3B82F6', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;