import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // If arriving from email link, go straight to reset step
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

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      setStep('reset');
    } catch (err) {
      // Generic error - same as success to prevent enumeration
      setMessage('If an account exists with this email, reset instructions have been sent.');
      setStep('reset');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters');
    }

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

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>HuntrNepal</h1>
          <p>Password Reset</p>
        </div>

        <div className="card">
          {step === 'request' && (
            <>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Forgot Password
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Enter your email and we'll send you a reset token.
              </p>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleRequest}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required autoFocus
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
                Reset Password
              </h2>
              {message && (
                <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                  {message}
                </div>
              )}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Check your email for the 6-digit reset token. It expires in 30 minutes.
              </p>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleReset}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Reset Token</label>
                  <input
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    placeholder="6-digit token from email"
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.2rem' }}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, uppercase, number, special"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
              <button
                className="btn btn-outline"
                style={{ marginTop: '0.75rem' }}
                onClick={() => setStep('request')}
              >
                Resend Token
              </button>
            </>
          )}

          {step === 'done' && (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                ✓
              </div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Password Reset Successfully
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                Your password has been updated. Please sign in with your new password.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
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