import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const CreateProgram = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', scope: '',
    out_of_scope: '', min_reward: '', max_reward: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.min_reward) > Number(formData.max_reward)) {
      return setError('Minimum reward cannot exceed maximum reward');
    }
    setLoading(true);
    try {
      await api.post('/programs', formData);
      navigate('/dashboard/company', { state: { message: 'Program created!' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create program');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '720px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/dashboard/company" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Back to Dashboard
        </Link>
      </div>

      <h1 style={{ marginBottom: '0.3rem' }}>Create Bounty Program</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Define what you want tested and how much you'll pay.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>PROGRAM DETAILS</h2>
          <div className="form-group">
            <label>Program Title</label>
            <input name="title" value={formData.title} onChange={handleChange}
              placeholder="e.g. Acme Web Application" required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              placeholder="Describe your application and what kind of vulnerabilities you're looking for..."
              rows={4} required />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>SCOPE</h2>
          <div className="form-group">
            <label>In Scope</label>
            <textarea name="scope" value={formData.scope} onChange={handleChange}
              placeholder={"*.yourdomain.com\nhttps://app.yourdomain.com/api/*"}
              rows={4} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Out of Scope (optional)</label>
            <textarea name="out_of_scope" value={formData.out_of_scope} onChange={handleChange}
              placeholder={"Physical attacks\nSocial engineering\nDDoS"}
              rows={3} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>REWARDS (NPR)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Minimum Reward</label>
              <input type="number" name="min_reward" value={formData.min_reward}
                onChange={handleChange} placeholder="e.g. 5000" min="0" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Maximum Reward</label>
              <input type="number" name="max_reward" value={formData.max_reward}
                onChange={handleChange} placeholder="e.g. 100000" min="0" required />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : '🚀 Create Program'}
          </button>
          <Link to="/dashboard/company" className="btn btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreateProgram;