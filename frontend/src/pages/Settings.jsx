import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Settings = () => {
  const { user } = useAuth();
  const [mfaStep, setMfaStep] = useState('idle'); // idle | setup | verify
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password change state
  const [pwData, setPwData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // ── MFA Setup ──
  const handleSetupMfa = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/mfa/setup');
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setMfaStep('setup');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to setup MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/mfa/verify', { token: mfaCode });
      setMfaStep('idle');
      setMessage('MFA enabled successfully! Your account is now more secure.');
      setMfaCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  // ── Password Change ──
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (pwData.newPassword !== pwData.confirmPassword) {
      return setPwError('New passwords do not match');
    }
    if (pwData.newPassword.length < 8) {
      return setPwError('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(pwData.newPassword) || 
        !/[0-9]/.test(pwData.newPassword) || 
        !/[!@#$%^&*]/.test(pwData.newPassword)) {
      return setPwError('Password must contain uppercase, number, and special character');
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', pwData);
      setPwSuccess('Password changed successfully');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // ── Premium Styles ──
  const theme = {
    bg: '#0F172A',
    surface: '#162033',
    border: 'rgba(255,255,255,0.08)',
    primary: '#3B82F6',
    secondary: '#1E293B',
    accent: '#14B8A6',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    error: '#EF4444',
    success: '#22C55E',
    radius: '16px',
    shadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    background: '#0F172A',
    border: `1px solid ${theme.border}`,
    borderRadius: '10px',
    color: theme.textPrimary,
    fontSize: '1rem',
    transition: theme.transition,
    outline: 'none',
    boxSizing: 'border-box'
  };

  const cardStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: theme.shadow
  };

  const btnPrimary = {
    background: `linear-gradient(135deg, ${theme.primary}, #2563EB)`,
    color: 'white',
    padding: '0.875rem 1.5rem',
    borderRadius: '10px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    transition: theme.transition,
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  };

  return (
    <div style={{ 
      background: theme.bg, 
      minHeight: '100vh', 
      padding: '4rem 1.5rem', 
      color: theme.textPrimary,
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Account <span style={{ color: theme.primary }}>Settings</span>
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '1.1rem' }}>
            Secure your presence on the HuntrNepal platform
          </p>
        </header>

        {/* ── Profile Info ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primary }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Identity Profile</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Username</span>
              <span style={{ fontWeight: '600' }}>{user?.username}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Email Address</span>
              <span style={{ fontWeight: '600' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: theme.textSecondary, fontWeight: '500' }}>Access Level</span>
              <span style={{ 
                padding: '0.4rem 1rem', 
                borderRadius: '20px', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                textTransform: 'uppercase',
                background: user?.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(20, 184, 166, 0.15)',
                color: user?.role === 'admin' ? theme.error : theme.accent,
                border: `1px solid ${user?.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(20, 184, 166, 0.2)'}`
              }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* ── MFA Section ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(20, 184, 166, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Multi-Factor Authentication</h2>
          </div>
          <p style={{ color: theme.textSecondary, fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            Strengthen your account security by requiring a second form of identification beyond your password.
          </p>

          {message && (
            <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', border: `1px solid ${theme.success}`, color: theme.success, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {message}
            </div>
          )}
          {error && (
            <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${theme.error}`, color: theme.error, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {mfaStep === 'idle' && (
            <button 
              style={btnPrimary} 
              onClick={handleSetupMfa}
              disabled={loading}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? 'Initializing...' : '🔐 Activate 2FA Security'}
            </button>
          )}

          {mfaStep === 'setup' && (
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  background: 'white', 
                  padding: '1.25rem', 
                  borderRadius: '16px',
                  display: 'inline-block',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  marginBottom: '1.5rem'
                }}>
                  <img src={qrCode} alt="MFA QR Code" style={{ display: 'block', width: '180px', height: '180px' }} />
                </div>
                <p style={{ fontSize: '0.9rem', color: theme.textSecondary, marginBottom: '0.75rem' }}>
                  Manual configuration key:
                </p>
                <div style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  color: theme.accent,
                  border: `1px solid ${theme.border}`,
                  letterSpacing: '0.1em'
                }}>
                  {secret}
                </div>
              </div>

              <form onSubmit={handleVerifyMfa}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: '600' }}>Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000 000"
                    value={mfaCode}
                    onChange={e => setMfaCode(e.target.value)}
                    style={{ 
                      ...inputStyle,
                      textAlign: 'center', 
                      fontSize: '1.75rem', 
                      letterSpacing: '0.5rem',
                      fontWeight: '700',
                      color: theme.primary
                    }}
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    type="submit" 
                    style={{ ...btnPrimary, flex: 1 }}
                    disabled={loading || mfaCode.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Confirm Activation'}
                  </button>
                  <button 
                    type="button"
                    style={{ 
                      background: 'transparent',
                      color: theme.textSecondary,
                      padding: '0.875rem 1.5rem',
                      borderRadius: '10px',
                      border: `1px solid ${theme.border}`,
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: theme.transition
                    }}
                    onClick={() => { setMfaStep('idle'); setError(''); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ── Password Change ── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3y-3.5-3.5"/></svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Password Authentication</h2>
          </div>
          <p style={{ color: theme.textSecondary, fontSize: '0.95rem', marginBottom: '2rem' }}>
            Update your authentication credentials regularly to ensure account integrity.
          </p>

          {pwError && (
            <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: `1px solid ${theme.error}`, color: theme.error, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', border: `1px solid ${theme.success}`, color: theme.success, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {pwSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: theme.textSecondary }}>Current Password</label>
              <input
                type="password"
                value={pwData.currentPassword}
                onChange={e => setPwData(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: theme.textSecondary }}>New Password</label>
              <input
                type="password"
                value={pwData.newPassword}
                onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))}
                placeholder="Create a strong password"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: theme.textSecondary }}>Confirm New Password</label>
              <input
                type="password"
                value={pwData.confirmPassword}
                onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Repeat new password"
                style={inputStyle}
              />
            </div>
            <button 
              type="submit" 
              style={{ ...btnPrimary, width: '100%' }} 
              disabled={loading}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? 'Processing...' : 'Update Password Credentials'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;