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

  // ── Premium Theme ──
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

  const cardStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: theme.shadow
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1.25rem',
    background: '#0F172A',
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    color: theme.textPrimary,
    fontSize: '1rem',
    outline: 'none',
    transition: theme.transition,
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.75rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  if (fetchLoading) return (
    <div style={{ background: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: `3px solid ${theme.border}`, borderTopColor: theme.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: theme.textSecondary, marginTop: '1.5rem', fontWeight: '500' }}>Synchronizing program data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ 
      background: theme.bg, 
      minHeight: '100vh', 
      padding: '4rem 1.5rem', 
      color: theme.textPrimary,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/dashboard/company" style={{ 
            color: theme.textSecondary, 
            textDecoration: 'none', 
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Dashboard
          </Link>
        </div>

        <header style={{ marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '900', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
            Modify <span style={{ color: theme.primary }}>Program</span>
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '1.1rem', lineHeight: '1.6' }}>
            Update asset scope, reward tiers, or status for <span style={{ color: theme.textPrimary, fontWeight: '700' }}>{formData.title}</span>.
          </p>
        </header>

        {error && (
          <div style={{ 
            padding: '1rem 1.5rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', 
            border: `1px solid ${theme.error}50`, color: theme.error, marginBottom: '2rem', 
            fontWeight: '600', fontSize: '0.95rem' 
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Status Toggle Card */}
          <div style={{ 
            ...cardStyle, 
            border: `1px solid ${formData.is_active ? theme.success + '40' : theme.error + '40'}`,
            background: `linear-gradient(to right, ${formData.is_active ? theme.success + '05' : theme.error + '05'}, transparent)`
          }}>
            <h2 style={{ ...labelStyle, marginBottom: '1.5rem' }}>Administrative Status</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  style={{ 
                    appearance: 'none',
                    width: '52px',
                    height: '28px',
                    background: formData.is_active ? theme.success : theme.secondary,
                    borderRadius: '20px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: theme.transition,
                    border: `1px solid ${theme.border}`
                  }}
                />
                <div style={{ 
                  position: 'absolute',
                  top: '4px',
                  left: formData.is_active ? '28px' : '4px',
                  width: '20px',
                  height: '20px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: theme.transition,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: formData.is_active ? theme.success : theme.textSecondary }}>
                  {formData.is_active ? 'Protocol Active' : 'Protocol Suspended'}
                </div>
                <div style={{ fontSize: '0.85rem', color: theme.textSecondary, marginTop: '0.25rem' }}>
                  {formData.is_active ? 'Accepting new vulnerability submissions.' : 'Submissions are currently paused.'}
                </div>
              </div>
            </label>
          </div>

          <div style={cardStyle}>
            <h2 style={labelStyle}>Program Identity</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: theme.textSecondary, marginBottom: '0.5rem', display: 'block' }}>Title</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: theme.textSecondary, marginBottom: '0.5rem', display: 'block' }}>Executive Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows={5} 
                required 
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={labelStyle}>Technical Scope</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: theme.textSecondary, marginBottom: '0.5rem', display: 'block' }}>In-Scope Assets</label>
              <textarea 
                name="scope" 
                value={formData.scope} 
                onChange={handleChange} 
                rows={4} 
                required 
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: theme.textSecondary, marginBottom: '0.5rem', display: 'block' }}>Exclusions</label>
              <textarea 
                name="out_of_scope" 
                value={formData.out_of_scope} 
                onChange={handleChange} 
                rows={3} 
                style={{ ...inputStyle, background: 'rgba(0,0,0,0.1)' }}
              />
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={labelStyle}>Bounty Allocations (NPR)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: theme.textSecondary, marginBottom: '0.5rem', display: 'block' }}>Min Reward</label>
                <input 
                  type="number" 
                  name="min_reward" 
                  value={formData.min_reward} 
                  onChange={handleChange} 
                  required 
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: theme.textSecondary, marginBottom: '0.5rem', display: 'block' }}>Max Reward</label>
                <input 
                  type="number" 
                  name="max_reward" 
                  value={formData.max_reward} 
                  onChange={handleChange} 
                  required 
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                flex: 1,
                background: `linear-gradient(135deg, ${theme.primary}, #2563EB)`,
                color: 'white', padding: '1.125rem', borderRadius: '14px',
                border: 'none', fontWeight: '700', cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)', transition: theme.transition
              }}
            >
              {loading ? 'Propagating Changes...' : 'Save Program Configuration'}
            </button>
            <Link 
              to="/dashboard/company" 
              style={{ 
                padding: '1.125rem 2rem', borderRadius: '14px', background: 'transparent',
                border: `1px solid ${theme.border}`, color: theme.textSecondary,
                textDecoration: 'none', fontWeight: '700', transition: theme.transition
              }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProgram;