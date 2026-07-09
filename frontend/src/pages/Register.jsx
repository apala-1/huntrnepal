import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    role: 'researcher', company_name: '', website: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!formData.username || !formData.email || !formData.password) return 'All fields are required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(formData.password)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(formData.password)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*]/.test(formData.password)) return 'Password must contain at least one special character (!@#$%^&*)';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (formData.role === 'company' && !formData.company_name) return 'Company name is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login', { state: { message: 'Account created! Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[!@#$%^&*]/.test(p)) score++;
    if (score <= 2) return { label: 'Weak', color: '#EF4444', width: '33%' };
    if (score <= 4) return { label: 'Fair', color: '#F59E0B', width: '66%' };
    return { label: 'Elite', color: '#22C55E', width: '100%' };
  };

  const strength = getPasswordStrength();

  // Premium Styles
  const wrapperStyle = { backgroundColor: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' };
  const cardStyle = { backgroundColor: '#162033', width: '100%', maxWidth: '520px', borderRadius: '24px', padding: 'clamp(1.5rem, 5vw, 3rem)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' };
  const inputBaseStyle = (field) => ({
    width: '100%', backgroundColor: '#0F172A', border: `1px solid ${focusField === field ? '#3B82F6' : 'rgba(255, 255, 255, 0.1)'}`, borderRadius: '12px', padding: '0.75rem 1rem', color: '#F8FAFC', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s ease'
  });
  const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#64748B', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };

  return (
    <div style={wrapperStyle}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .register-card { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>
      
      <div className="register-card" style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ color: '#F8FAFC', fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span> HuntrNepal
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Join the Hive. Secure the Nation.</p>
        </div>

        <h2 style={{ color: '#F8FAFC', fontSize: '1.35rem', fontWeight: '700', marginBottom: '1.5rem' }}>Create Account</h2>
        {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '0.75rem', borderRadius: '8px', color: '#EF4444', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Deployment Role</label>
            <select name="role" value={formData.role} onChange={handleChange} style={{ ...inputBaseStyle('role'), cursor: 'pointer' }}>
              <option value="researcher">Security Researcher</option>
              <option value="company">Corporate Organization</option>
            </select>
          </div>

          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Target Username</label>
              <input name="username" value={formData.username} onFocus={() => setFocusField('user')} onBlur={() => setFocusField(null)} onChange={handleChange} placeholder="cyber_eagle" style={inputBaseStyle('user')} />
            </div>
            <div>
              <label style={labelStyle}>Email Protocol</label>
              <input type="email" name="email" value={formData.email} onFocus={() => setFocusField('email')} onBlur={() => setFocusField(null)} onChange={handleChange} placeholder="hunter@nepal.security" style={inputBaseStyle('email')} />
            </div>
          </div>

          {formData.role === 'company' && (
            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Organization Name</label>
                <input name="company_name" value={formData.company_name} onFocus={() => setFocusField('company')} onBlur={() => setFocusField(null)} onChange={handleChange} placeholder="Global Defense Ltd" style={inputBaseStyle('company')} />
              </div>
              <div>
                <label style={labelStyle}>Official Website</label>
                <input name="website" value={formData.website} onFocus={() => setFocusField('site')} onBlur={() => setFocusField(null)} onChange={handleChange} placeholder="https://defense.np" style={inputBaseStyle('site')} />
              </div>
            </div>
          )}

          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Access Password</label>
              <input type="password" name="password" value={formData.password} onFocus={() => setFocusField('pass')} onBlur={() => setFocusField(null)} onChange={handleChange} placeholder="••••••••" style={inputBaseStyle('pass')} />
              {strength && (
                <div style={{ marginTop: '0.6rem' }}>
                  <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, backgroundColor: strength.color, transition: 'all 0.3s ease' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: '700' }}>Strength</span>
                    <span style={{ fontSize: '0.7rem', color: strength.color, fontWeight: '800' }}>{strength.label}</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Verify Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onFocus={() => setFocusField('conf')} onBlur={() => setFocusField(null)} onChange={handleChange} placeholder="••••••••" style={inputBaseStyle('conf')} />
            </div>
          </div>

          <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white', border: 'none', borderRadius: '12px', padding: '1rem', fontSize: '1rem', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Initializing Agent...' : 'Finalize Registration'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748B' }}>
          Already have an account? <Link to="/login" style={{ color: '#3B82F6', fontWeight: '700', textDecoration: 'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;