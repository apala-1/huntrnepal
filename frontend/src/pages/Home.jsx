import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <div style={{ 
        padding: '5rem 1.5rem', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
      }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.2 }}>
          Nepal's Bug Bounty Platform 🇳🇵
        </h1>
        <p style={{ 
          color: 'var(--text-muted)', 
          maxWidth: '540px', 
          margin: '1.2rem auto',
          fontSize: '1.1rem'
        }}>
          Connect security researchers with organisations. 
          Find vulnerabilities, get rewarded, make Nepal's internet safer.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          {user ? (
            <Link to="/programs" className="btn btn-primary" style={{ width: 'auto' }}>
              Browse Programs →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary" style={{ width: 'auto' }}>
                Start Hunting →
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ width: 'auto' }}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ 
        background: 'var(--bg-card)', 
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '2rem 1.5rem'
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          {[
            { value: 'NPR 50K+', label: 'Paid Out' },
            { value: '20+', label: 'Programs' },
            { value: '100+', label: 'Researchers' },
            { value: '150+', label: 'Bugs Fixed' }
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                {stat.value}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;