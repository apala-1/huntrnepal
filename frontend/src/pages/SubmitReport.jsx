import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { encryptReportData } from '../utils/encryption';

const SEVERITIES = [
  { value: 'critical', label: '🔴 Critical', desc: 'Remote code execution, authentication bypass' },
  { value: 'high',     label: '🟠 High',     desc: 'Privilege escalation, sensitive data exposure' },
  { value: 'medium',   label: '🟡 Medium',   desc: 'CSRF, stored XSS, IDOR' },
  { value: 'low',      label: '🟢 Low',      desc: 'Open redirect, information disclosure' },
  { value: 'info',     label: '⚪ Info',     desc: 'Best practice recommendations' },
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
    poc_code: '',         // New: sensitive PoC code
    poc_url: ''          // New: proof URL  
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/programs')
      .then(res => setPrograms(res.data.programs))
      .catch(() => setError('Failed to load programs'));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.severity) return setError('Please select a severity level');

    setLoading(true);
    try {
      let submitData = { ...formData };

      // Encrypt sensitive PoC data if program selected
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
        submitData.poc_code = '[ENCRYPTED - Only company can decrypt]';
        submitData.poc_url = '[ENCRYPTED]';
      }

      const res = await api.post('/reports', submitData);
      navigate(`/reports/${res.data.reportId}`, {
        state: { message: 'Report submitted successfully!' }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '760px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/programs" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Back to Programs
        </Link>
      </div>

      <h1 style={{ marginBottom: '0.3rem' }}>Submit Vulnerability Report</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Be detailed and professional. Better reports get reviewed faster.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>

        {/* Program selection */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            TARGET PROGRAM
          </h2>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Select Program</label>
            <select name="program_id" value={formData.program_id} onChange={handleChange} required>
              <option value="">Choose a bounty program...</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.company_name} — {p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vulnerability details */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            VULNERABILITY DETAILS
          </h2>

          <div className="form-group">
            <label>Vulnerability Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Stored XSS in profile description field"
              required
            />
          </div>

          <div className="form-group">
            <label>Severity</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {SEVERITIES.map(s => (
                <label 
                  key={s.value}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    border: `1px solid ${formData.severity === s.value ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    background: formData.severity === s.value ? 'rgba(99,102,241,0.1)' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={s.value}
                    checked={formData.severity === s.value}
                    onChange={handleChange}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>CVSS Score (optional)</label>
            <input
              name="cvss_score"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={formData.cvss_score}
              onChange={handleChange}
              placeholder="e.g. 8.5"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the vulnerability. What is it? Where did you find it?"
              rows={4}
              required
            />
          </div>
        </div>

        {/* Reproduction & Impact */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            REPRODUCTION & IMPACT
          </h2>

          <div className="form-group">
            <label>Steps to Reproduce</label>
            <textarea
              name="steps_to_reproduce"
              value={formData.steps_to_reproduce}
              onChange={handleChange}
              placeholder={`1. Go to /profile/edit\n2. Enter the following payload in the bio field: <script>alert(1)</script>\n3. Save the profile\n4. Visit any user's profile page\n5. Observe the alert box executes`}
              rows={7}
              required
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {formData.steps_to_reproduce.length} chars (minimum 50)
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Impact</label>
            <textarea
              name="impact"
              value={formData.impact}
              onChange={handleChange}
              placeholder="What can an attacker achieve? What data is at risk? Who is affected?"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Encrypted PoC Section */}
<div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(99,102,241,0.3)' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
    <h2 style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
      PROOF OF CONCEPT
    </h2>
    <span style={{
      background: 'rgba(99,102,241,0.15)',
      color: 'var(--primary)',
      padding: '0.2rem 0.6rem',
      borderRadius: '999px',
      fontSize: '0.7rem',
      fontWeight: 600
    }}>
      END-TO-END ENCRYPTED
    </span>
  </div>
  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
    PoC details are encrypted in your browser before transmission. 
    HuntrNepal servers never see this data — only the company can decrypt it.
  </p>

  <div className="form-group">
    <label>PoC Code / Payload (optional)</label>
    <textarea
      name="poc_code"
      value={formData.poc_code}
      onChange={handleChange}
      placeholder={"# Example exploit code\nimport requests\n\n# Your PoC here..."}
      rows={5}
      style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
    />
  </div>
  <div className="form-group" style={{ marginBottom: 0 }}>
    <label>Reference URL (optional)</label>
    <input
      name="poc_url"
      value={formData.poc_url}
      onChange={handleChange}
      placeholder="https://your-poc-demo.com"
    />
  </div>
</div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : '🐛 Submit Report'}
          </button>
          <Link to="/programs" className="btn btn-outline" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SubmitReport;