import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(null);

  const navStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '0.75rem 0',
    transition: 'all 0.3s ease'
  };

  const brandStyle = {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#F8FAFC',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    letterSpacing: '-0.02em'
  };

  const linkStyle = (id) => ({
    color: isHovered === id ? '#3B82F6' : '#94A3B8',
    textDecoration: 'none',
    fontSize: '0.925rem',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    padding: '0.5rem 0.75rem'
  });

  const badgeStyle = (role) => {
    const colors = {
      admin: { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444' },
      company: { bg: 'rgba(20, 184, 166, 0.1)', text: '#14B8A6' },
      researcher: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6' }
    };
    const style = colors[role] || colors.researcher;
    return {
      padding: '0.25rem 0.6rem',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      backgroundColor: style.bg,
      color: style.text,
      border: `1px solid ${style.text}33`
    };
  };

  const logoutBtnStyle = {
    backgroundColor: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#EF4444',
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  };

  return (
    <nav style={navStyle}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem'
      }}>
        <Link to="/" style={brandStyle}>
          <span style={{ fontSize: '1.5rem' }}>🛡️</span> HuntrNepal
        </Link>

        <ul style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          listStyle: 'none', 
          margin: 0, 
          padding: 0 
        }}>
          <li>
            <Link 
              to="/programs" 
              style={linkStyle('programs')}
              onMouseEnter={() => setIsHovered('programs')}
              onMouseLeave={() => setIsHovered(null)}
            >
              Programs
            </Link>
          </li>

          {user ? (
            <>
              {user.role === 'researcher' && (
                <li>
                  <Link 
                    to="/dashboard" 
                    style={linkStyle('dash')}
                    onMouseEnter={() => setIsHovered('dash')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              {user.role === 'company' && (
                <li>
                  <Link 
                    to="/dashboard/company" 
                    style={linkStyle('dashc')}
                    onMouseEnter={() => setIsHovered('dashc')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              {user.role === 'admin' && (
                <li>
                  <Link 
                    to="/admin" 
                    style={linkStyle('admin')}
                    onMouseEnter={() => setIsHovered('admin')}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <span style={badgeStyle(user.role)}>
                  {user.role}
                </span>
              </li>
              <li>
                <Link 
                  to="/leaderboard" 
                  style={linkStyle('leader')}
                  onMouseEnter={() => setIsHovered('leader')}
                  onMouseLeave={() => setIsHovered(null)}
                >
                   Leaderboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  style={linkStyle('profile')}
                  onMouseEnter={() => setIsHovered('profile')}
                  onMouseLeave={() => setIsHovered(null)}
                >
                   Profile
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  style={linkStyle('settings')}
                  onMouseEnter={() => setIsHovered('settings')}
                  onMouseLeave={() => setIsHovered(null)}
                >
                   {user.username}
                </Link>
              </li>
              <li>
                <button 
                  style={logoutBtnStyle}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                  onClick={logout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to="/login" 
                  style={linkStyle('login')}
                  onMouseEnter={() => setIsHovered('login')}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  Login
                </Link>
              </li>
              <li>
                <button 
                  style={{ 
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  onClick={() => navigate('/register')}
                >
                  Sign Up
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;