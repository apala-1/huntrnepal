import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const EditProgram = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', scope: '',
    out_of_scope: '', min_reward: '', max_reward: '', is_active: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    api.get(`/programs/${id}`)
      .then(res => {
        const p = res.data.program;
        setFormData({
          title: p.title,
          description: p.description,
          scope: p.scope,
          out_of_scope: p.out_of_scope || '',
          min_reward: p.min_reward,
          max_reward: p.max_reward,
          is_active: p.is_active === 1
        });
      })
      .catch(() => setError('Failed to load program'))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/programs/${id}`, formData);
      navigate('/dashboard/company', { state: { message: 'Program updated successfully' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update program');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '720px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/dashboard/company" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
          Back to Dashboard
        </Link>
      </div>

      <h1 style={{ marginBottom: '0.3rem' }}>Edit Program</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Update your bounty program details
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            STATUS
          </h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
            />
            <div>
              <div style={{ fontWeight: 500 }}>Program Active</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Uncheck to pause submissions without deleting the program
              </div>
            </div>
          </label>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            PROGRAM DETAILS
          </h2>
          <div className="form-group">
            <label>Program Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>SCOPE</h2>
          <div className="form-group">
            <label>In Scope</label>
            <textarea name="scope" value={formData.scope} onChange={handleChange} rows={4} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Out of Scope</label>
            <textarea name="out_of_scope" value={formData.out_of_scope} onChange={handleChange} rows={3} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>REWARDS (NPR)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Minimum Reward</label>
              <input type="number" name="min_reward" value={formData.min_reward} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Maximum Reward</label>
              <input type="number" name="max_reward" value={formData.max_reward} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link to="/dashboard/company" className="btn btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditProgram;