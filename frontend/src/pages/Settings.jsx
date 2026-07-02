import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Settings = () => {
  const { user } = useAuth();

  const [mfaData, setMfaData] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  const [pwData, setPwData] = useState({ 
    currentPassword: '', newPassword: '', confirmPassword: '' 
  });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // ── MFA Setup ──
  const handleSetupMfa = async () => {
    setMfaLoading(true);
    setMfaError('');
    try {
      const res = await api.post('/auth/mfa/setup');
      setMfaData(res.data);
    } catch (err) {
      setMfaError(err.response?.data?.error || 'Failed to setup MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async (e) => {
    e.preventDefault();
    setMfaLoading(true);
    setMfaError('');
    try {
      await api.post('/auth/mfa/verify', { token: mfaCode });
      setMfaSuccess(true);
      setMfaData(null);
    } catch (err) {
      setMfaError(err.response?.data?.error || 'Invalid code');
    } finally {
      setMfaLoading(false);
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
      return setPwError('Password must contain uppercase, number and special character');
    }

    setPwLoading(true);
    try {
      await api.post('/auth/change-password', pwData);
      setPwSuccess('Password changed successfully');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '640px' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Account Settings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Manage your security preferences
      </p>

      {/* ── Profile Info ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Profile</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: 'Username', value: user?.username },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role },
          ].map(({ label, value }) => (
            <div key={label} style={{ 
              display: 'flex', justifyContent: 'space-between',
              padding: '0.6rem 0', borderBottom: '1px solid var(--border)'
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {label}
              </span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MFA Setup ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Two-Factor Authentication
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Add an extra layer of security to your account using an authenticator app 
          like Google Authenticator or Authy.
        </p>

        {mfaSuccess || user?.mfa_enabled ? (
          <div className="alert alert-success">
            ✅ MFA is enabled on your account
          </div>
        ) : (
          <>
            {!mfaData ? (
              <button
                className="btn btn-primary"
                onClick={handleSetupMfa}
                disabled={mfaLoading}
              >
                {mfaLoading ? 'Setting up...' : '🔐 Enable MFA'}
              </button>
            ) : (
              <>
                <p style={{ 
                  fontSize: '0.875rem', 
                  marginBottom: '1rem',
                  color: 'var(--text-muted)' 
                }}>
                  Scan this QR code with your authenticator app, then enter 
                  the 6-digit code below to confirm.
                </p>

                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <img
                    src={mfaData.qrCode}
                    alt="MFA QR Code"
                    style={{ 
                      width: 180, height: 180,
                      border: '4px solid white',
                      borderRadius: '8px'
                    }}
                  />
                </div>

                <details style={{ marginBottom: '1rem' }}>
                  <summary style={{ 
                    cursor: 'pointer', 
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem'
                  }}>
                    Can't scan? Enter key manually
                  </summary>
                  <code style={{ 
                    display: 'block',
                    background: 'var(--bg)',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    marginTop: '0.5rem',
                    fontSize: '0.8rem',
                    letterSpacing: '0.1rem',
                    wordBreak: 'break-all'
                  }}>
                    {mfaData.secret}
                  </code>
                </details>

                {mfaError && (
                  <div className="alert alert-error">{mfaError}</div>
                )}

                <form onSubmit={handleVerifyMfa}>
                  <div className="form-group">
                    <label>Enter 6-digit code from your app</label>
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
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={mfaLoading || mfaCode.length !== 6}
                  >
                    {mfaLoading ? 'Verifying...' : 'Confirm & Enable MFA'}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Password Change ── */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          Change Password
        </h2>
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: '0.875rem', 
          marginBottom: '1rem' 
        }}>
          Use a strong password with uppercase, numbers, and special characters.
        </p>

        {pwError && <div className="alert alert-error">{pwError}</div>}
        {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}

        <form onSubmit={handlePasswordChange}>
          {[
            { name: 'currentPassword', label: 'Current Password' },
            { name: 'newPassword', label: 'New Password' },
            { name: 'confirmPassword', label: 'Confirm New Password' }
          ].map(({ name, label }) => (
            <div className="form-group" key={name}>
              <label>{label}</label>
              <input
                type="password"
                value={pwData[name]}
                onChange={e => setPwData(prev => ({ 
                  ...prev, [name]: e.target.value 
                }))}
                placeholder="••••••••"
              />
            </div>
          ))}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={pwLoading}
          >
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;