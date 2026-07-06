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

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '700px' }}>
      <h1 style={{ marginBottom: '0.3rem' }}>🏆 Hall of Fame</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Top security researchers on HuntrNepal
      </p>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {leaders.map((researcher, index) => (
            <div key={researcher.researcher_id} className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '1.5rem', minWidth: '2rem', textAlign: 'center' }}>
                {medals[index] || `#${index + 1}`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{researcher.username}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {researcher.total_reports} reports · {researcher.accepted_reports} accepted
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--success)', fontWeight: 700 }}>
                  NPR {Number(researcher.total_earned || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>earned</div>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No resolved reports yet. Be the first!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;