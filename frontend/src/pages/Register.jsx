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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!formData.username || !formData.email || !formData.password) {
      return 'All fields are required';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(formData.password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(formData.password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*]/.test(formData.password)) {
      return 'Password must contain at least one special character (!@#$%^&*)';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    if (formData.role === 'company' && !formData.company_name) {
      return 'Company name is required';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login', { 
        state: { message: 'Account created! Please log in.' } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[!@#$%^&*]/.test(p)) score++;
    if (score <= 2) return { label: 'Weak', color: 'var(--danger)' };
    if (score <= 3) return { label: 'Fair', color: 'var(--warning)' };
    if (score <= 4) return { label: 'Good', color: 'var(--primary)' };
    return { label: 'Strong', color: 'var(--success)' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🛡️ HuntrNepal</h1>
          <p>Bug Bounty & Vulnerability Disclosure Platform</p>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>
            Create Account
          </h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>I am a...</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="researcher">Security Researcher</option>
                <option value="company">Company / Organisation</option>
              </select>
            </div>

            {formData.role === 'company' && (
              <>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="form-group">
                  <label>Website (optional)</label>
                  <input
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://acme.com"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="hunter42"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, uppercase, number, special"
                autoComplete="new-password"
              />
              {strength && (
                <span style={{ fontSize: '0.8rem', color: strength.color, fontWeight: 500 }}>
                  Password strength: {strength.label}
                </span>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;