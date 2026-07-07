import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);

  const fetchPrograms = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/programs?search=${searchTerm}`);
      setPrograms(res.data.programs);
    } catch {
      setError('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPrograms(search);
  };

  const formatReward = (min, max) => {
    return `NPR ${Number(min).toLocaleString()} – ${Number(max).toLocaleString()}`;
  };

  // Modern UI Styles
  const pageContainerStyle = {
    backgroundColor: '#0F172A',
    minHeight: '100vh',
    padding: '4rem 1.5rem',
    color: '#F8FAFC'
  };

  const headerStyle = {
    maxWidth: '1200px',
    margin: '0 auto 3rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  };

  const searchFormStyle = {
    maxWidth: '1200px',
    margin: '0 auto 3rem',
    display: 'flex',
    gap: '1rem',
    position: 'relative'
  };

  const inputStyle = {
    flex: 1,
    background: '#162033',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#F8FAFC',
    padding: '1rem 1.5rem',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    border: 'none',
    borderRadius: '12px',
    padding: '0 2rem',
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.2s ease'
  };

  const programCardStyle = (id) => ({
    backgroundColor: '#162033',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '1.75rem',
    marginBottom: '1.25rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: hoveredCard === id ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: hoveredCard === id 
      ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.1)' 
      : 'none',
    borderColor: hoveredCard === id ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)'
  });

  const badgeStyle = {
    padding: '0.3rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    color: '#14B8A6',
    border: '1px solid rgba(20, 184, 166, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  return (
    <div style={pageContainerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Bounty Programs
          </h1>
          <p style={{ color: '#94A3B8', marginTop: '0.5rem', fontSize: '1.1rem' }}>
            Identify vulnerabilities in top-tier organizations and secure your rewards.
          </p>
        </div>
      </div>

      {/* Modern Search Section */}
      <form onSubmit={handleSearch} style={searchFormStyle}>
        <input
          type="text"
          placeholder="Search for programs, companies, or keywords..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={(e) => {
            e.target.style.borderColor = '#3B82F6';
            e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.target.style.boxShadow = 'none';
          }}
          style={inputStyle}
        />
        <button 
          type="submit" 
          style={buttonStyle}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          Search
        </button>
      </form>

      {error && (
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto 2rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.2)', 
          borderRadius: '12px', 
          color: '#EF4444',
          fontWeight: '600'
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#94A3B8' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid rgba(59, 130, 246, 0.1)', 
            borderTop: '3px solid #3B82F6', 
            borderRadius: '50%', 
            margin: '0 auto 1.5rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          Initializing platform programs...
        </div>
      ) : programs.length === 0 ? (
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          textAlign: 'center', 
          padding: '5rem', 
          backgroundColor: '#162033', 
          borderRadius: '24px',
          border: '1px dashed rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔎</div>
          <p style={{ color: '#94A3B8', fontSize: '1.2rem' }}>
            No active programs match your search. {search && 'Try different keywords.'}
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {programs.map(program => (
            <Link 
              key={program.id} 
              to={`/programs/${program.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div 
                style={programCardStyle(program.id)}
                onMouseEnter={() => setHoveredCard(program.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '2rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      marginBottom: '0.75rem'
                    }}>
                      <h3 style={{ fontSize: '1.35rem', color: '#F8FAFC', margin: 0, fontWeight: '700' }}>
                        {program.title}
                      </h3>
                      <span style={badgeStyle}>Active</span>
                    </div>
                    <p style={{ 
                      color: '#94A3B8', 
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      marginBottom: '1rem'
                    }}>
                      {program.description.substring(0, 160)}
                      {program.description.length > 160 ? '...' : ''}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#64748B', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Host:</span>
                      <span style={{ color: '#3B82F6', fontSize: '0.9rem', fontWeight: '600' }}>
                        {program.company_name}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    textAlign: 'right', 
                    minWidth: '220px',
                    paddingLeft: '2rem',
                    borderLeft: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ 
                      color: '#14B8A6', 
                      fontWeight: '800',
                      fontSize: '1.25rem',
                      letterSpacing: '-0.02em'
                    }}>
                      {formatReward(program.min_reward, program.max_reward)}
                    </div>
                    <div style={{ 
                      color: '#64748B', 
                      fontSize: '0.75rem',
                      marginTop: '0.4rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Bounty Range
                    </div>
                    <div style={{ 
                      marginTop: '1.5rem',
                      display: 'inline-block',
                      color: '#3B82F6',
                      fontSize: '0.875rem',
                      fontWeight: '700'
                    }}>
                      View Policy →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Programs;