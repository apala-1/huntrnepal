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
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    api.get(`/programs/${id}`)
      .then(res => setProgram(res.data.program))
      .catch(() => setError('Program not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Premium Styles
  const pageStyle = {
    backgroundColor: '#0F172A',
    minHeight: '100vh',
    padding: '3rem 1.5rem',
    color: '#F8FAFC'
  };

  const containerStyle = {
    maxWidth: '900px',
    margin: '0 auto'
  };

  const cardStyle = {
    background: '#162033',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '2rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
  };

  const sectionLabelStyle = {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1rem',
    display: 'block'
  };

  const preStyle = {
    fontFamily: '"Fira Code", "Roboto Mono", monospace',
    fontSize: '0.9rem',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.6,
    color: '#E2E8F0'
  };

  if (loading) return (
    <div style={pageStyle}>
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59, 130, 246, 0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#94A3B8' }}>Loading Disclosure Policy...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (error || !program) return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', padding: '1.5rem', borderRadius: '12px', color: '#EF4444', textAlign: 'center' }}>
          {error || 'Program not found'}
        </div>
        <Link to="/programs" style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: '#3B82F6', textDecoration: 'none' }}>← Return to Directory</Link>
      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '2rem' }}>
          <Link 
            to="/programs" 
            style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#3B82F6'}
            onMouseLeave={(e) => e.target.style.color = '#94A3B8'}
          >
            ← Back to All Programs
          </Link>
        </div>

        {/* Header Block */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              {program.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#94A3B8' }}>by <strong>{program.company_name}</strong></span>
              {program.website && (
                <a href={program.website} target="_blank" rel="noreferrer"
                  style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', borderBottom: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  {program.website}
                </a>
              )}
              <span style={{ 
                padding: '0.25rem 0.6rem', 
                backgroundColor: 'rgba(20, 184, 166, 0.1)', 
                color: '#14B8A6', 
                borderRadius: '6px', 
                fontSize: '0.7rem', 
                fontWeight: '800', 
                textTransform: 'uppercase' 
              }}>Active</span>
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'right', 
            background: 'rgba(34, 197, 94, 0.05)', 
            padding: '1.25rem', 
            borderRadius: '16px', 
            border: '1px solid rgba(34, 197, 94, 0.1)' 
          }}>
            <div style={{ color: '#22C55E', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.01em' }}>
              NPR {Number(program.min_reward).toLocaleString()} – {Number(program.max_reward).toLocaleString()}
            </div>
            <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginTop: '0.25rem' }}>
              Potential Reward
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section>
            <span style={sectionLabelStyle}>About this Program</span>
            <div style={cardStyle}>
              <p style={{ lineHeight: 1.8, fontSize: '1.05rem', color: '#E2E8F0', margin: 0 }}>{program.description}</p>
            </div>
          </section>

          <section>
            <span style={sectionLabelStyle}>In Scope</span>
            <div style={cardStyle}>
              <pre style={preStyle}>{program.scope}</pre>
            </div>
          </section>

          {program.out_of_scope && (
            <section>
              <span style={{ ...sectionLabelStyle, color: '#EF4444' }}>Out of Scope</span>
              <div style={cardStyle}>
                <pre style={{ ...preStyle, borderLeft: '4px solid #EF4444' }}>{program.out_of_scope}</pre>
              </div>
            </section>
          )}

          {/* Action Footer */}
          <div style={{ marginTop: '2rem', padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {user?.role === 'researcher' && (
              <button
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1.25rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.2s ease',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => navigate(`/reports/submit?program=${id}`)}
              >
                <span>🐛</span> Submit Vulnerability Report
              </button>
            )}

            {!user && (
              <div style={{ ...cardStyle, textAlign: 'center', background: 'rgba(30, 41, 59, 0.5)' }}>
                <p style={{ color: '#94A3B8', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                  Authentication required to submit security findings.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <Link to="/register" style={{ 
                    background: '#3B82F6', color: 'white', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '700' 
                  }}>Join HuntrNepal</Link>
                  <Link to="/login" style={{ 
                    border: '1px solid rgba(255,255,255,0.1)', color: '#F8FAFC', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '700' 
                  }}>Sign In</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;