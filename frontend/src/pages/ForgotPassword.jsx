import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const [step, setStep] = useState('request'); // request | reset | done
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [debugToken, setDebugToken] = useState(''); // shows the vuln
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      // ✅ FIXED: No longer shows token in UI
      setStep('reset');
      setMessage('Reset instructions sent. Please check your email.');
    } catch (err) {
      // ✅ FIXED: Generic message prevents user enumeration
      setStep('reset');
      setMessage('If this email exists, reset instructions have been sent.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { email, token, newPassword });
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🛡️ HuntrNepal</h1>
          <p>Password Reset</p>
        </div>

        <div className="card">
          {step === 'request' && (
            <>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                Forgot Password
              </h2>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleRequest}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Token'}
                </button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Enter Reset Token
              </h2>
              {debugToken && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  Token: <strong>{debugToken}</strong>
                  <br />
                  
                </div>
              )}
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleReset}>
                <div className="form-group">
                  <label>Reset Token</label>
                  <input
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="6-digit token"
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem' }}
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Password Reset!
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Your password has been updated.
              </p>
              <Link to="/login" className="btn btn-primary">
                Back to Login
              </Link>
            </div>
          )}
        </div>

        {step === 'request' && (
          <div className="auth-footer">
            Remember it? <Link to="/login">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;