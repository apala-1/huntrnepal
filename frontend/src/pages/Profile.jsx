import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bio: '', website: '', twitter: '', location: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `http://localhost:5000${user.avatar}` : null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(res => {
      const u = res.data.user;
      setFormData({
        bio: u.bio || '',
        website: u.website || '',
        twitter: u.twitter || '',
        location: u.location || ''
      });
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

    // Client-side preview
    setAvatarPreview(URL.createObjectURL(file));

    // Upload immediately
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Profile picture updated');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image');
      setAvatarPreview(null);
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '0.3rem' }}>Edit Profile</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Public profile visible to companies on the platform
      </p>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div 
  style={{
    width: '80px', height: '80px',
    borderRadius: '50%',
    background: avatarPreview ? 'none' : 'var(--primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', fontWeight: 700, color: 'white',
    overflow: 'hidden', cursor: 'pointer',
    border: '2px solid var(--border)',
    position: 'relative'
  }}
  onClick={() => document.getElementById('avatar-input').click()}
>
  {avatarPreview ? (
    <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : (
    user?.username?.[0]?.toUpperCase()
  )}
  {avatarLoading && (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontSize: '0.75rem'
    }}>
      ...
    </div>
  )}
</div>
<input
  id="avatar-input"
  type="file"
  accept="image/jpeg,image/png,image/webp"
  onChange={handleAvatarChange}
  style={{ display: 'none' }}
/>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Bio</label>
            <textarea
              value={formData.bio}
              onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell companies about your security expertise..."
              rows={3}
              maxLength={500}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {formData.bio.length}/500
            </span>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              value={formData.location}
              onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
              placeholder="Kathmandu, Nepal"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              value={formData.website}
              onChange={e => setFormData(p => ({ ...p, website: e.target.value }))}
              placeholder="https://yourblog.com"
            />
          </div>

          <div className="form-group">
            <label>Twitter / X Handle</label>
            <input
              value={formData.twitter}
              onChange={e => setFormData(p => ({ ...p, twitter: e.target.value }))}
              placeholder="@yourhandle"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;