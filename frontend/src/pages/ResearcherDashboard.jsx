import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const STATUS_COLORS = {
  pending:  '#F59E0B',
  triaging: '#3B82F6',
  accepted: '#22C55E',
  rejected: '#EF4444',
  resolved: '#A855F7',
};

const SEVERITY_COLORS = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#14B8A6',
};

const ResearcherDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredReport, setHoveredReport] = useState(null);

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
    { label: 'Total Reports', value: reports.length, color: '#3B82F6', icon: '📄' },
    { label: 'Accepted', value: reports.filter(r => r.status === 'accepted' || r.status === 'resolved').length, color: '#22C55E', icon: '✅' },
    { label: 'Pending', value: reports.filter(r => r.status === 'pending').length, color: '#F59E0B', icon: '⏳' },
    { label: 'Total Earned', value: `NPR ${totalEarned.toLocaleString()}`, color: '#22C55E', icon: '💰' },
  ];

  // Premium Styles
  const pageStyle = { backgroundColor: '#0F172A', minHeight: '100vh', padding: '3rem 1.5rem', color: '#F8FAFC' };
  const containerStyle = { maxWidth: '1200px', margin: '0 auto' };
  
  const headerStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem'
  };

  const statCardStyle = (color) => ({
    background: '#162033', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)',
    textAlign: 'center', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease'
  });

  const reportRowStyle = (id) => ({
    padding: '1.25rem 1.5rem', background: '#162033', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', transition: 'all 0.2s ease',
    marginBottom: '0.75rem', transform: hoveredReport === id ? 'translateX(4px)' : 'translateX(0)',
    borderColor: hoveredReport === id ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.08)',
    boxShadow: hoveredReport === id ? '0 4px 12px rgba(0, 0, 0, 0.3)' : 'none'
  });

  return (
    <div style={pageStyle}>
      <style>{`
        @media (max-width: 768px) { 
          .report-row { flex-direction: column; align-items: flex-start !important; gap: 0.75rem !important; }
          .report-meta { width: 100%; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem; }
        }
      `}</style>

      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Welcome back, {user?.username}! 👋</h1>
            <p style={{ color: '#94A3B8', marginTop: '0.4rem', fontWeight: '500' }}>Researcher Command Center</p>
          </div>
          <Link to="/programs" style={{ 
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', color: 'white', textDecoration: 'none',
            padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: '700', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'transform 0.2s'
          }} onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.target.style.transform = 'translateY(0)'}>
            + Find New Programs
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {stats.map(stat => (
            <div key={stat.label} style={statCardStyle(stat.color)}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '3rem', opacity: 0.05 }}>{stat.icon}</div>
              <div style={{ color: stat.color, fontSize: '2rem', fontWeight: '800', marginBottom: '0.25rem' }}>{stat.value}</div>
              <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Reports Section */}
        <div style={{ background: '#162033', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>Vulnerability Disclosures</h2>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '600' }}>Showing {reports.length} reports</div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>Initializing secure data stream...</div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>No vulnerabilities submitted yet. Ready to start hunting?</p>
              <Link to="/programs" style={{ color: '#3B82F6', fontWeight: '700', textDecoration: 'none', borderBottom: '2px solid rgba(59, 130, 246, 0.2)' }}>Browse Active Programs →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {reports.map(report => (
                <Link key={report.id} to={`/reports/${report.id}`} style={{ textDecoration: 'none' }} onMouseEnter={() => setHoveredReport(report.id)} onMouseLeave={() => setHoveredReport(null)}>
                  <div className="report-row" style={reportRowStyle(report.id)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#F8FAFC', marginBottom: '0.25rem' }}>{report.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#3B82F6', fontWeight: '600' }}>{report.program_title}</span>
                        <span>•</span>
                        <span>{report.company_name}</span>
                      </div>
                    </div>
                    
                    <div className="report-meta" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase',
                        backgroundColor: `${SEVERITY_COLORS[report.severity.toLowerCase()] || '#64748B'}20`,
                        color: SEVERITY_COLORS[report.severity.toLowerCase()] || '#64748B',
                        border: `1px solid ${SEVERITY_COLORS[report.severity.toLowerCase()] || '#64748B'}40`
                      }}>
                        {report.severity}
                      </span>
                      
                      <div style={{ minWidth: '100px', textAlign: 'center' }}>
                        <div style={{ 
                          fontSize: '0.75rem', fontWeight: '800', 
                          color: STATUS_COLORS[report.status.toLowerCase()] || '#64748B',
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          {report.status}
                        </div>
                      </div>

                      {report.reward_amount && (
                        <div style={{ minWidth: '120px', textAlign: 'right', color: '#22C55E', fontWeight: '800', fontSize: '1rem' }}>
                          + NPR {Number(report.reward_amount).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearcherDashboard;