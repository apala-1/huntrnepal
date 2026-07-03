import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const STATUS_COLORS = {
  pending:  '#f59e0b',
  triaging: '#3b82f6',
  accepted: '#22c55e',
  rejected: '#ef4444',
  resolved: '#a855f7',
};

const ResearcherDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/my')
      .then(res => setReports(res.data.reports))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalEarned = reports
    .filter(r => r.reward_amount)
    .reduce((sum, r) => sum + Number(r.reward_amount), 0);

  const stats = [
    { label: 'Total Reports', value: reports.length, color: 'var(--primary)' },
    { label: 'Accepted', value: reports.filter(r => r.status === 'accepted' || r.status === 'resolved').length, color: 'var(--success)' },
    { label: 'Pending', value: reports.filter(r => r.status === 'pending').length, color: 'var(--warning)' },
    { label: 'Total Earned', value: `NPR ${totalEarned.toLocaleString()}`, color: 'var(--success)' },
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Welcome back, {user?.username}! 👋</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Researcher Dashboard
          </p>
        </div>
        <Link to="/programs" className="btn btn-primary" style={{ width: 'auto' }}>
          + Find Programs
        </Link>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {stats.map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.3rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Reports list */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>My Reports</h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            Loading...
          </p>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              No reports yet. Start hunting!
            </p>
            <Link to="/programs" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
              Browse Programs
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reports.map(report => (
              <Link 
                key={report.id} 
                to={`/reports/${report.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{ 
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'border-color 0.2s'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '0.3rem', color: 'var(--text)' }}>
                      {report.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {report.program_title} · {report.company_name}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className={`badge badge-${report.severity}`}>
                      {report.severity}
                    </span>
                    <span style={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: STATUS_COLORS[report.status] || 'var(--text-muted)'
                    }}>
                      {report.status.toUpperCase()}
                    </span>
                    {report.reward_amount && (
                      <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>
                        NPR {Number(report.reward_amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearcherDashboard;