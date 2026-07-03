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

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '680px' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Account Settings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Manage your security preferences
      </p>

      {/* ── Profile Info ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Profile</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Username</span>
            <span>{user?.username}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Email</span>
            <span>{user?.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Role</span>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* ── MFA Section ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Two-Factor Authentication
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Add an extra layer of security using an authenticator app like 
          Google Authenticator or Authy.
        </p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Step 1: Prompt to set up */}
        {mfaStep === 'idle' && (
          <button 
            className="btn btn-primary" 
            onClick={handleSetupMfa}
            disabled={loading}
          >
            {loading ? 'Loading...' : '🔐 Enable Two-Factor Authentication'}
          </button>
        )}

        {/* Step 2: Show QR code */}
        {mfaStep === 'setup' && (
          <div>
            <div style={{ 
              background: 'white', 
              padding: '1rem', 
              borderRadius: 'var(--radius)',
              display: 'inline-block',
              marginBottom: '1rem'
            }}>
              <img src={qrCode} alt="MFA QR Code" style={{ display: 'block' }} />
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Can't scan? Enter this code manually in your app:
            </p>
            <code style={{ 
              background: 'var(--bg)', 
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.875rem',
              display: 'block',
              marginBottom: '1.5rem',
              wordBreak: 'break-all'
            }}>
              {secret}
            </code>

            <form onSubmit={handleVerifyMfa}>
              <div className="form-group">
                <label>Enter the 6-digit code from your app to confirm</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  style={{ 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    letterSpacing: '0.5rem' 
                  }}
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading || mfaCode.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button 
                  type="button"
                  className="btn btn-outline"
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
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Change Password
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Use a strong, unique password you don't use anywhere else.
        </p>

        {pwError && <div className="alert alert-error">{pwError}</div>}
        {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}

        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={pwData.currentPassword}
              onChange={e => setPwData(p => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Your current password"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={pwData.newPassword}
              onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))}
              placeholder="Min 8 chars, uppercase, number, special"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={pwData.confirmPassword}
              onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="Repeat new password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;