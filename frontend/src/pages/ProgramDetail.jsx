import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ProgramDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/programs/${id}`)
      .then(res => setProgram(res.data.program))
      .catch(() => setError('Program not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  );

  if (error || !program) return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div className="alert alert-error">{error || 'Program not found'}</div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '0.5rem' }}>
        <Link 
          to="/programs" 
          style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}
        >
          ← Back to Programs
        </Link>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        margin: '1rem 0 2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>
            {program.title}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            by {program.company_name}
            {program.website && (
              <> · <a href={program.website} target="_blank" rel="noreferrer"
                style={{ color: 'var(--primary)' }}>{program.website}</a></>
            )}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.2rem' }}>
            NPR {Number(program.min_reward).toLocaleString()} – {Number(program.max_reward).toLocaleString()}
          </div>
          <span className="badge badge-info" style={{ marginTop: '0.3rem', display: 'inline-block' }}>
            Active
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            ABOUT THIS PROGRAM
          </h2>
          <p style={{ lineHeight: 1.8 }}>{program.description}</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            IN SCOPE
          </h2>
          <pre style={{ 
            fontFamily: 'inherit', 
            whiteSpace: 'pre-wrap',
            lineHeight: 1.8,
            color: 'var(--text)'
          }}>
            {program.scope}
          </pre>
        </div>

        {program.out_of_scope && (
          <div className="card">
            <h2 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
              OUT OF SCOPE
            </h2>
            <pre style={{ 
              fontFamily: 'inherit', 
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              color: 'var(--text)'
            }}>
              {program.out_of_scope}
            </pre>
          </div>
        )}

        {/* Submit button */}
        {user?.role === 'researcher' && (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/reports/submit?program=${id}`)}
          >
            🐛 Submit Vulnerability Report
          </button>
        )}

        {!user && (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              You need an account to submit vulnerability reports
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/register" className="btn btn-primary" style={{ width: 'auto' }}>
                Create Account
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ width: 'auto' }}>
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramDetail;