import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1>Bounty Programs</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Find vulnerabilities, earn rewards
          </p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <input
          type="text"
          placeholder="Search programs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ 
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            padding: '0.7rem 1rem'
          }}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ width: 'auto', padding: '0.7rem 1.5rem' }}
        >
          Search
        </button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
          Loading programs...
        </p>
      ) : programs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No programs found. {search && 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {programs.map(program => (
            <Link 
              key={program.id} 
              to={`/programs/${program.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ 
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                ':hover': { borderColor: 'var(--primary)' }
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text)' }}>
                        {program.title}
                      </h3>
                      <span
  className="badge"
  style={{
    backgroundColor: program.is_active ? "#22c55e20" : "#ef444420",
    color: program.is_active ? "#22c55e" : "#ef4444",
    border: `1px solid ${program.is_active ? "#22c55e55" : "#ef444455"}`
  }}
>
  {program.is_active ? "Active" : "Inactive"}
</span>
                    </div>
                    <p style={{ 
                      color: 'var(--text-muted)', 
                      fontSize: '0.875rem',
                      marginBottom: '0.75rem'
                    }}>
                      {program.description.substring(0, 150)}
                      {program.description.length > 150 ? '...' : ''}
                    </p>
                    <span style={{ 
                      color: 'var(--text-muted)', 
                      fontSize: '0.8rem'
                    }}>
                      by {program.company_name}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '160px' }}>
                    <div style={{ 
                      color: 'var(--success)', 
                      fontWeight: 700,
                      fontSize: '1rem'
                    }}>
                      {formatReward(program.min_reward, program.max_reward)}
                    </div>
                    <div style={{ 
                      color: 'var(--text-muted)', 
                      fontSize: '0.75rem',
                      marginTop: '0.3rem'
                    }}>
                      Reward Range
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