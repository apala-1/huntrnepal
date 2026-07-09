import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ bio: '', website: '', twitter: '', location: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `http://localhost:5000${user.avatar}` : null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      const u = res.data.user;
      setFormData({ bio: u.bio || '', website: u.website || '', twitter: u.twitter || '', location: u.location || '' });
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.put('/auth/profile', formData);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarLoading(true);
    const form = new FormData();
    form.append('avatar', file);
    try {
      await api.post('/auth/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Profile identity updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image');
      setAvatarPreview(null);
    } finally {
      setAvatarLoading(false);
    }
  };

  // Styles
  const pageStyle = { backgroundColor: '#0F172A', minHeight: '100vh', padding: '4rem 1.5rem', color: '#F8FAFC' };
  const containerStyle = { maxWidth: '700px', margin: '0 auto' };
  const cardStyle = { background: '#162033', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' };
  
  const inputStyle = (field) => ({
    width: '100%', backgroundColor: '#0F172A', border: `1px solid ${focusField === field ? '#3B82F6' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '12px', padding: '0.875rem 1rem', color: '#F8FAFC', fontSize: '1rem', outline: 'none', transition: 'all 0.2s ease',
    boxShadow: focusField === field ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none'
  });

  const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' };

  // Fallback initial
  const getInitial = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Identity Management</h1>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem' }}>Configure how you appear to organizations across the platform.</p>
        </div>

        {message && <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22C55E', padding: '1rem', borderRadius: '12px', color: '#22C55E', marginBottom: '1.5rem', fontWeight: '600' }}>{message}</div>}
        {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '1rem', borderRadius: '12px', color: '#EF4444', marginBottom: '1.5rem', fontWeight: '600' }}>{error}</div>}

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div 
              style={{
                width: '100px', height: '100px', borderRadius: '50%', background: '#3B82F6', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800,
                color: 'white', cursor: 'pointer', overflow: 'hidden', border: '4px solid #1E293B', boxShadow: '0 0 0 2px #3B82F6'
              }}
              onClick={() => document.getElementById('avatar-input').click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                getInitial()
              )}
              {avatarLoading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>SYNCING...</div>}
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Profile Picture</h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '0.75rem' }}>JPG, PNG or WebP. Max 2MB.</p>
              <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }} onClick={() => document.getElementById('avatar-input').click()}>Update Avatar</button>
            </div>
          </div>
          <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Professional Bio</label>
              <textarea
                value={formData.bio}
                onFocus={() => setFocusField('bio')}
                onBlur={() => setFocusField(null)}
                onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                placeholder="Ex: Security researcher specializing in web application penetration testing..."
                rows={4}
                style={{ ...inputStyle('bio'), resize: 'none', lineHeight: '1.6' }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem' }}>{formData.bio.length}/500</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Location</label>
                <input value={formData.location} onFocus={() => setFocusField('loc')} onBlur={() => setFocusField(null)} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="City, Country" style={inputStyle('loc')} />
              </div>
              <div>
                <label style={labelStyle}>Official Website</label>
                <input value={formData.website} onFocus={() => setFocusField('web')} onBlur={() => setFocusField(null)} onChange={e => setFormData(p => ({ ...p, website: e.target.value }))} placeholder="https://yourhub.io" style={inputStyle('web')} />
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={labelStyle}>Twitter / X</label>
              <input value={formData.twitter} onFocus={() => setFocusField('twit')} onBlur={() => setFocusField(null)} onChange={e => setFormData(p => ({ ...p, twitter: e.target.value }))} placeholder="@your_handle" style={inputStyle('twit')} />
            </div>

            <button type="submit" style={{ 
              width: '100%', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white', border: 'none',
              borderRadius: '12px', padding: '1rem', fontSize: '1rem', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s ease'
            }} disabled={loading}>
              {loading ? 'Transmitting Data...' : 'Save Profile Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;