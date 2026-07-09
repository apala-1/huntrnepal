import { useState, useEffect } from 'react';
import api from '../api/axios';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/leaderboard')
      .then(res => setLeaders(res.data.leaderboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  const theme = {
    bg: '#0F172A',
    surface: '#162033',
    border: 'rgba(255,255,255,0.08)',
    primary: '#3B82F6',
    secondary: '#1E293B',
    accent: '#14B8A6',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    success: '#22C55E',
    radius: '16px',
    shadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const cardStyle = (index) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    background: index < 3 ? 'rgba(59, 130, 246, 0.05)' : theme.surface,
    border: index < 3 ? `1px solid ${theme.primary}40` : `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    padding: '1.5rem',
    marginBottom: '0.75rem',
    boxShadow: theme.shadow,
    transition: theme.transition,
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden'
  });

  return (
    <div style={{ 
      background: theme.bg, 
      minHeight: '100vh', 
      padding: '4rem 1.5rem', 
      color: theme.textPrimary,
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '0.5rem 1rem', 
            borderRadius: '30px', 
            background: 'rgba(59, 130, 246, 0.1)', 
            color: theme.primary, 
            fontSize: '0.8rem', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            marginBottom: '1.5rem',
            border: `1px solid ${theme.primary}30`
          }}>
            Global Ranking
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
            Hall of <span style={{ color: theme.primary }}>Fame</span>
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '1.2rem', maxWidth: '500px', margin: '0 auto' }}>
            Celebrating the elite security researchers securing the HuntrNepal ecosystem.
          </p>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: `3px solid ${theme.border}`, 
              borderTopColor: theme.primary, 
              borderRadius: '50%', 
              display: 'inline-block',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: theme.textSecondary, marginTop: '1.5rem', fontWeight: '500' }}>Aggregating researcher data...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ animation: 'slideUp 0.6s ease-out' }}>
            {leaders.map((researcher, index) => (
              <div 
                key={researcher.researcher_id} 
                style={cardStyle(index)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = theme.primary;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = index < 3 ? `${theme.primary}40` : theme.border;
                }}
              >
                {index < 3 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    right: 0, 
                    width: '100px', 
                    height: '100px', 
                    background: `radial-gradient(circle at top right, ${theme.primary}20, transparent)`, 
                    pointerEvents: 'none' 
                  }} />
                )}
                
                <div style={{ 
                  fontSize: index < 3 ? '2.5rem' : '1.25rem', 
                  minWidth: '3.5rem', 
                  textAlign: 'center',
                  fontWeight: '800',
                  color: index < 3 ? theme.primary : theme.textSecondary,
                  opacity: index < 3 ? 1 : 0.5
                }}>
                  {medals[index] || `#${index + 1}`}
                </div>

                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '14px', 
                  background: index < 3 ? `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` : theme.secondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'white',
                  boxShadow: index < 3 ? '0 8px 16px rgba(59, 130, 246, 0.2)' : 'none'
                }}>
                  {researcher.username.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    color: theme.textPrimary,
                    marginBottom: '0.25rem' 
                  }}>
                    {researcher.username}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: theme.textSecondary, display: 'flex', gap: '1rem' }}>
                    <span><strong style={{ color: theme.textPrimary }}>{researcher.total_reports}</strong> Reports</span>
                    <span style={{ color: theme.border }}>|</span>
                    <span><strong style={{ color: theme.success }}>{researcher.accepted_reports}</strong> Accepted</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: theme.success, 
                    fontSize: '1.5rem', 
                    fontWeight: '800',
                    letterSpacing: '-0.02em'
                  }}>
                    NPR {Number(researcher.total_earned || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: theme.textSecondary, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.1em' }}>
                    Total Bounties
                  </div>
                </div>
              </div>
            ))}

            {leaders.length === 0 && (
              <div style={{ 
                ...cardStyle(4), 
                textAlign: 'center', 
                padding: '5rem 2rem', 
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🛡️</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>No Reports Resolved Yet</h3>
                <p style={{ color: theme.textSecondary }}>The field is open. Be the first to claim a spot on the leaderboard!</p>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;