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

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '0.3rem' }}>Edit Profile</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Public profile visible to companies on the platform
      </p>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '50%',
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700, color: 'white'
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.username}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
            <span className={`badge badge-${user?.role}`} style={{ marginTop: '0.3rem', display: 'inline-block' }}>
              {user?.role}
            </span>
          </div>
        </div>

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