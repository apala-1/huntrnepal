import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    <div className="container" style={{ padding: '2rem' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  );

  if (error || !program) return (
    <div className="container" style={{ padding: '2rem' }}>
      <div className="alert alert-error">{error || 'Program not found'}</div>
      <Link to="/programs">← Back to Programs</Link>
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <Link 
        to="/programs" 
        style={{ 
          color: 'var(--text-muted)', 
          textDecoration: 'none',
          fontSize: '0.875rem',
          display: 'inline-block',
          marginBottom: '1.5rem'
        }}
      >
        ← Back to Programs
      </Link>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>
              {program.title}
            </h1>
            <p style={{ color: 'var(--primary)' }}>{program.company_name}</p>
            {program.website && (
              <a 
                href={program.website} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}
              >
                {program.website}
              </a>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              color: 'var(--success)', 
              fontWeight: 700,
              fontSize: '1.3rem'
            }}>
              NPR {Number(program.min_reward).toLocaleString()} – {Number(program.max_reward).toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Reward range
            </div>
          </div>
        </div>

        <Section title="About the Program" content={program.description} />
        <Section title="In Scope" content={program.scope} />
        {program.out_of_scope && (
          <Section title="Out of Scope" content={program.out_of_scope} />
        )}
      </div>

      {/* Submit report button - researchers only */}
      {user?.role === 'researcher' && (
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/reports/submit/${id}`)}
        >
          🐛 Submit Vulnerability Report
        </button>
      )}

      {!user && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            You must be logged in as a researcher to submit a report.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
            Login to Submit
          </Link>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, content }) => (
  <div style={{ marginBottom: '1.2rem' }}>
    <h3 style={{ 
      fontSize: '0.875rem', 
      fontWeight: 600,
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '0.5rem'
    }}>
      {title}
    </h3>
    <p style={{ 
      color: 'var(--text)', 
      lineHeight: 1.7,
      whiteSpace: 'pre-wrap'
    }}>
      {content}
    </p>
  </div>
);

export default ProgramDetail;