import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { encryptReportData } from '../utils/encryption';

const SEVERITIES = [
  { value: 'critical', label: '🔴 Critical', desc: 'RCE, Auth Bypass, SQLi', color: '#EF4444' },
  { value: 'high',     label: '🟠 High',     desc: 'Privesc, Sensitive Data leak', color: '#F97316' },
  { value: 'medium',   label: '🟡 Medium',   desc: 'CSRF, Stored XSS, IDOR', color: '#F59E0B' },
  { value: 'low',      label: '🟢 Low',      desc: 'Open Redirect, Info Leak', color: '#14B8A6' },
  { value: 'info',     label: '⚪ Info',     desc: 'Best practices & hardening', color: '#94A3B8' },
];

const SubmitReport = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProgram = searchParams.get('program');

  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    program_id: preselectedProgram || '',
    title: '',
    severity: '',
    cvss_score: '',
    description: '',
    steps_to_reproduce: '',
    impact: '',
    poc_code: '',         
    poc_url: ''          
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/programs')
      .then(res => setPrograms(res.data.programs))
      .catch(() => setError('System Alert: Could not synchronize bounty programs'));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.severity) return setError('Mandatory field: Please categorize vulnerability severity');

    setLoading(true);
    try {
      let submitData = { ...formData };

      if (formData.program_id && (formData.poc_code || formData.poc_url)) {
        const keyRes = await api.get(`/programs/${formData.program_id}/encryption-key`);
        const encryptionKey = keyRes.data.encryptionKey;

        const sensitiveData = {
          poc_code: formData.poc_code,
          poc_url: formData.poc_url,
          encrypted_at: new Date().toISOString()
        };

        const encrypted = encryptReportData(sensitiveData, encryptionKey);
        submitData.encrypted_poc = JSON.stringify(encrypted);
        submitData.poc_code = '[ENCRYPTED - SECURE HANDSHAKE COMPLETED]';
        submitData.poc_url = '[ENCRYPTED]';
      }

      const res = await api.post('/reports', submitData);
      navigate(`/reports/${res.data.reportId}`, {
        state: { message: 'Infiltration report submitted for triage!' }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Transmission failed: Security gateway timeout');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared Premium Theme ──
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

  const cardStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    padding: '2.5rem',
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

  return (
    <div style={{ 
      background: theme.bg, 
      minHeight: '100vh', 
      padding: '4rem 1.5rem', 
      color: theme.textPrimary,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/programs" style={{ 
            color: theme.textSecondary, 
            textDecoration: 'none', 
            fontSize: '0.9rem', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Active Programs
          </Link>
        </div>

        <header style={{ marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: '2.75rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Report <span style={{ color: theme.primary }}>Vulnerability</span>
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '1.15rem', lineHeight: '1.6' }}>
            Provide high-fidelity technical evidence to ensure rapid triage and validation.
          </p>
        </header>

        {error && (
          <div style={{ 
            padding: '1rem 1.5rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', 
            border: `1px solid ${theme.error}50`, color: theme.error, marginBottom: '2.5rem', 
            fontWeight: '600', fontSize: '0.95rem' 
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Program Selection */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', color: theme.primary }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Target Environment</h2>
            </div>
            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>Authorized Bounty Program</label>
              <select 
                name="program_id" 
                value={formData.program_id} 
                onChange={handleChange} 
                required
                style={inputStyle}
              >
                <option value="">Select a validated program...</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.company_name} — {p.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vulnerability Details */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(14, 184, 166, 0.1)', borderRadius: '10px', color: theme.accent }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Incident Classification</h2>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={labelStyle}>Report Headline</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Broken Access Control on /api/v1/user/settings"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={labelStyle}>Threat Severity</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {SEVERITIES.map(s => (
                  <label 
                    key={s.value}
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      border: `1px solid ${formData.severity === s.value ? s.color : theme.border}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: formData.severity === s.value ? `${s.color}10` : 'rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={s.value}
                      checked={formData.severity === s.value}
                      onChange={handleChange}
                      style={{ accentColor: s.color, width: '18px', height: '18px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: formData.severity === s.value ? s.color : theme.textPrimary }}>{s.label.split(' ')[1]}</div>
                      <div style={{ fontSize: '0.75rem', color: theme.textSecondary, marginTop: '0.2rem' }}>{s.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={labelStyle}>CVSS Score (Vector 3.1)</label>
              <input
                name="cvss_score"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.cvss_score}
                onChange={handleChange}
                placeholder="0.0"
                style={{ ...inputStyle, width: '120px', textAlign: 'center', fontWeight: '700' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Technical Executive Summary</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a clear overview of the finding and the underlying technical flaw..."
                rows={5}
                required
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Reproduction & Impact */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', color: theme.warning }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>Attack Vector & Impact</h2>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={labelStyle}>Step-by-Step Reproduction</label>
              <textarea
                name="steps_to_reproduce"
                value={formData.steps_to_reproduce}
                onChange={handleChange}
                placeholder={`1. Navigate to target endpoint\n2. Inject payload: <script>document.cookie</script>\n3. Verify execution...`}
                rows={8}
                required
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.9rem' }}
              />
              <div style={{ textAlign: 'right', marginTop: '0.5rem', fontSize: '0.75rem', color: formData.steps_to_reproduce.length >= 50 ? theme.success : theme.textSecondary }}>
                {formData.steps_to_reproduce.length} / 50 characters minimum
              </div>
            </div>

            <div>
              <label style={labelStyle}>Business & Operational Impact</label>
              <textarea
                name="impact"
                value={formData.impact}
                onChange={handleChange}
                placeholder="What can an attacker achieve? High-level risk to confidentiality, integrity, or availability."
                rows={4}
                required
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Encrypted PoC Section */}
          <div style={{ ...cardStyle, border: `1px solid ${theme.primary}40`, background: `linear-gradient(to bottom right, ${theme.surface}, ${theme.primary}05)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ color: theme.primary }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: theme.primary }}>E2E Encrypted PoC</h2>
              <span style={{
                background: `${theme.primary}15`,
                color: theme.primary,
                padding: '0.2rem 0.6rem',
                borderRadius: '20px',
                fontSize: '0.65rem',
                fontWeight: 800,
                border: `1px solid ${theme.primary}30`
              }}>
                SECURE HANDSHAKE
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: theme.textSecondary, marginBottom: '2rem', lineHeight: '1.6' }}>
              PoC details are cryptographically sealed in your browser using the company's public key. HuntrNepal servers never see this raw data.
            </p>

            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Sensitive PoC Code / Payload</label>
              <textarea
                name="poc_code"
                value={formData.poc_code}
                onChange={handleChange}
                placeholder={"# Exploit Script\nimport os\n..."}
                rows={6}
                style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.9rem', background: '#0F172A' }}
              />
            </div>
            <div>
              <label style={labelStyle}>External Proof URL</label>
              <input
                name="poc_url"
                value={formData.poc_url}
                onChange={handleChange}
                placeholder="https://gist.github.com/... or your secure host"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3.5rem' }}>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                flex: 2,
                background: `linear-gradient(135deg, ${theme.primary}, #2563EB)`,
                color: 'white',
                padding: '1.125rem',
                borderRadius: '14px',
                border: 'none',
                fontWeight: '800',
                fontSize: '1.05rem',
                cursor: 'pointer',
                boxShadow: `0 8px 25px rgba(59, 130, 246, 0.4)`,
                transition: theme.transition
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? 'Initializing Secure Transmission...' : '🚀 Submit Vulnerability Report'}
            </button>
            <Link to="/programs" style={{ 
              flex: 1,
              padding: '1.125rem',
              borderRadius: '14px',
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '700',
              fontSize: '1rem',
              transition: theme.transition
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Discard
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitReport;