import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/programs')
      .then(res => setPrograms(res.data.programs))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = programs.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1>Bounty Programs</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            {programs.length} active program{programs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <input
          placeholder="Search programs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            padding: '0.6rem 1rem',
            width: '220px'
          }}
        />
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading programs...</p>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            {search ? 'No programs match your search.' : 'No programs yet. Check back soon!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(program => (
            <Link 
              key={program.id} 
              to={`/programs/${program.id}`}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ 
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                ':hover': { borderColor: 'var(--primary)' }
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <h3 style={{ marginBottom: '0.2rem' }}>{program.title}</h3>
                    <p style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>
                      {program.company_name}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      color: 'var(--success)', 
                      fontWeight: 700,
                      fontSize: '1.1rem'
                    }}>
                      NPR {Number(program.min_reward).toLocaleString()} – {Number(program.max_reward).toLocaleString()}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {program.report_count} report{program.report_count !== 1 ? 's' : ''} submitted
                    </div>
                  </div>
                </div>
                <p style={{ 
                  color: 'var(--text-muted)', 
                  fontSize: '0.875rem',
                  marginTop: '0.8rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {program.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Programs;