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

  // ── Styling Constants ──
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
    radius: '16px',
    shadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
    transition: 'all 0.3s ease'
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

  const cardStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: theme.shadow
  };

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
            New Bounty <span style={{ color: theme.primary }}>Program</span>
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '1.1rem', lineHeight: '1.6' }}>
            Define the rules of engagement, technical scope, and reward structures for independent security researchers.
          </p>
        </header>

        {error && (
          <div style={{ 
            padding: '1rem 1.5rem', 
            borderRadius: '12px', 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: `1px solid ${theme.error}50`, 
            color: theme.error, 
            marginBottom: '2rem',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section: Program Details */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: theme.primary }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Program Definition</h2>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Program Identity / Title</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                placeholder="e.g. Acme Corporation Main Infrastructure" 
                required 
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = theme.primary}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
            </div>
            
            <div>
              <label style={labelStyle}>Executive Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                placeholder="Provide a high-level overview of the target environment and your security objectives..."
                rows={5} 
                required 
                style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                onFocus={(e) => e.target.style.borderColor = theme.primary}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
            </div>
          </div>

          {/* Section: Scope */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(20, 184, 166, 0.1)', borderRadius: '10px', color: theme.accent }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Asset Scope</h2>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>In-Scope Assets (Domains/IPs)</label>
              <textarea 
                name="scope" 
                value={formData.scope} 
                onChange={handleChange}
                placeholder={"*.acme.com\napi.acme.com\n192.168.1.1/24"}
                rows={4} 
                required 
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.9rem' }}
                onFocus={(e) => e.target.style.borderColor = theme.accent}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
              <p style={{ color: theme.textSecondary, fontSize: '0.75rem', marginTop: '0.75rem' }}>List one asset per line. Use wildcards where appropriate.</p>
            </div>

            <div>
              <label style={labelStyle}>Out-of-Scope / Exclusions</label>
              <textarea 
                name="out_of_scope" 
                value={formData.out_of_scope} 
                onChange={handleChange}
                placeholder={"Social engineering attacks\nDenial of Service (DoS)\nPhysical security"}
                rows={3} 
                style={{ ...inputStyle, background: 'rgba(0,0,0,0.1)' }}
                onFocus={(e) => e.target.style.borderColor = theme.error}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
            </div>
          </div>

          {/* Section: Rewards */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '10px', color: theme.success }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Bounty Structure (NPR)</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Minimum Reward</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary, fontWeight: '700' }}>Rs.</span>
                  <input 
                    type="number" 
                    name="min_reward" 
                    value={formData.min_reward}
                    onChange={handleChange} 
                    placeholder="5,000" 
                    min="0" 
                    required 
                    style={{ ...inputStyle, paddingLeft: '3.5rem' }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Maximum Reward</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary, fontWeight: '700' }}>Rs.</span>
                  <input 
                    type="number" 
                    name="max_reward" 
                    value={formData.max_reward}
                    onChange={handleChange} 
                    placeholder="250,000" 
                    min="0" 
                    required 
                    style={{ ...inputStyle, paddingLeft: '3.5rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '3rem' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                flex: 1,
                background: `linear-gradient(135deg, ${theme.primary}, #2563EB)`,
                color: 'white',
                padding: '1.125rem',
                borderRadius: '14px',
                border: 'none',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                transition: theme.transition
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.3)';
              }}
            >
              {loading ? 'Initializing Protocol...' : '🚀 Deploy Bounty Program'}
            </button>
            <Link 
              to="/dashboard/company" 
              style={{ 
                padding: '1.125rem 2rem',
                borderRadius: '14px',
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '1rem',
                textAlign: 'center',
                transition: theme.transition
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = theme.textPrimary;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.textSecondary;
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

export default CreateProgram;