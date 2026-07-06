import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">🛡️ HuntrNepal</Link>

        <ul className="navbar-links">
          <li><Link to="/programs">Programs</Link></li>

          {user ? (
            <>
              {user.role === 'researcher' && (
                <li><Link to="/dashboard">Dashboard</Link></li>
              )}
              {user.role === 'company' && (
                <li><Link to="/dashboard/company">Dashboard</Link></li>
              )}
              {user.role === 'admin' && (
                <li><Link to="/admin">Admin</Link></li>
              )}
              <li>
                <span className={`badge badge-${user.role}`}>
                  {user.role}
                </span>
              </li>
              <li><Link to="/leaderboard">🏆 Leaderboard</Link></li>
                            <li><Link to="/profile">👤 Profile</Link></li>
              <li>
                <Link to="/settings">⚙️ {user.username}</Link>
              </li>
              <li>
                <button 
                  className="btn btn-outline" 
                  style={{ width: 'auto', padding: '0.4rem 1rem' }}
                  onClick={logout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li>
                <button 
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '0.4rem 1rem' }}
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