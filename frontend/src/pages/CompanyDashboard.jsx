import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    Promise.all([
      api.get('/reports/company'),
      api.get('/programs/my/programs')
    ]).then(([reportsRes, programsRes]) => {
      setReports(reportsRes.data.reports);
      setPrograms(programsRes.data.programs);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteProgram = async (programId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/programs/${programId}`);
      setPrograms(prev => prev.filter(p => p.id !== programId));
    } catch (err) {
      // Note: setMessage was missing from original state, but preserved logic 
      console.error(err.response?.data?.error || 'Failed to delete program');
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  // ── Premium Theme Constants ──
  const theme = {
    bg: '#0F172A',
    surface: '#162033',
    border: 'rgba(255,255,255,0.08)',
    primary: '#3B82F6',
    secondary: '#1E293B',
    accent: '#14B8A6',
    warning: '#F59E0B',
    error: '#EF4444',
    success: '#22C55E',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    radius: '16px',
    shadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const statCardStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: theme.shadow,
    transition: theme.transition
  };

  const badgeStyle = (severity) => {
    const colors = {
      critical: theme.error,
      high: '#F97316',
      medium: theme.warning,
      low: theme.accent,
      info: theme.primary
    };
    const color = colors[severity?.toLowerCase()] || theme.textSecondary;
    return {
      padding: '0.3rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      background: `${color}15`,
      color: color,
      border: `1px solid ${color}30`,
      letterSpacing: '0.05em'
    };
  };

  return (
    <div style={{ 
      background: theme.bg, 
      minHeight: '100vh', 
      padding: '3rem 1.5rem', 
      color: theme.textPrimary,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '3rem',
          borderBottom: `1px solid ${theme.border}`,
          paddingBottom: '2rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Company <span style={{ color: theme.primary }}>Dashboard</span>
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.success, boxShadow: `0 0 10px ${theme.success}` }} />
              <p style={{ color: theme.textSecondary, margin: 0, fontSize: '1rem', fontWeight: '500' }}>
                Signed in as <span style={{ color: theme.textPrimary }}>{user?.username}</span>
              </p>
            </div>
          </div>
          <Link to="/programs/create" style={{ 
            textDecoration: 'none',
            background: `linear-gradient(135deg, ${theme.primary}, #2563EB)`,
            color: 'white',
            padding: '0.875rem 1.75rem',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '0.95rem',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            transition: theme.transition,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Program
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem'
        }}>
          {[
            { label: 'Active Programs', value: programs.filter(p => p.is_active).length, color: theme.primary, icon: '🛡️' },
            { label: 'Total Reports', value: reports.length, color: theme.textPrimary, icon: '📄' },
            { label: 'Needs Review', value: pendingCount, color: theme.warning, icon: '⚠️' },
            { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, color: theme.success, icon: '✅' },
          ].map(stat => (
            <div key={stat.label} style={statCardStyle}>
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: stat.color, marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <div style={{ color: theme.textSecondary, fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '2.5rem', 
          marginBottom: '2rem', 
          borderBottom: `1px solid ${theme.border}`,
          paddingLeft: '0.5rem'
        }}>
          {['reports', 'programs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: '1rem 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? `3px solid ${theme.primary}` : '3px solid transparent',
                color: activeTab === tab ? theme.primary : theme.textSecondary,
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: theme.transition,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              {tab}
              {tab === 'reports' && pendingCount > 0 && (
                <span style={{ 
                  background: theme.warning,
                  color: theme.bg,
                  borderRadius: '6px',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '800'
                }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
             <div style={{ width: '32px', height: '32px', border: `3px solid ${theme.border}`, borderTopColor: theme.primary, borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
             <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : activeTab === 'reports' ? (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            {reports.length === 0 ? (
              <div style={{ background: theme.surface, borderRadius: theme.radius, padding: '4rem', textAlign: 'center', border: `1px dashed ${theme.border}` }}>
                <p style={{ color: theme.textSecondary, fontSize: '1.1rem' }}>No vulnerability reports filed yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reports.map(report => (
                  <Link 
                    key={report.id} 
                    to={`/reports/${report.id}`}
                    style={{ textDecoration: 'none', transition: theme.transition }}
                  >
                    <div style={{ 
                      padding: '1.25rem 1.75rem',
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      borderRadius: theme.radius,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = theme.primary;
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = theme.border;
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: theme.textPrimary, marginBottom: '0.4rem' }}>
                          {report.title}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: theme.textSecondary, fontWeight: '500' }}>
                          <span style={{ color: theme.primary }}>@{report.researcher_username}</span> • {report.program_title}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <span style={badgeStyle(report.severity)}>{report.severity}</span>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '800', 
                          color: report.status === 'pending' ? theme.warning : theme.success,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          background: 'rgba(0,0,0,0.2)',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          border: `1px solid ${theme.border}`
                        }}>
                          {report.status}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            {programs.length === 0 ? (
              <div style={{ background: theme.surface, borderRadius: theme.radius, padding: '4rem', textAlign: 'center', border: `1px dashed ${theme.border}` }}>
                <p style={{ color: theme.textSecondary, marginBottom: '2rem' }}>You haven't launched any bounty programs.</p>
                <Link to="/programs/create" style={{ 
                  textDecoration: 'none', background: theme.primary, color: 'white', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: '600'
                }}>
                  Launch First Program
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {programs.map(program => (
                  <div key={program.id} style={{ 
                    padding: '1.5rem 1.75rem',
                    background: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: theme.radius,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '1.15rem', color: theme.textPrimary, marginBottom: '0.5rem' }}>{program.title}</div>
                      <div style={{ fontSize: '0.85rem', color: theme.textSecondary, display: 'flex', gap: '1rem' }}>
                        <span><strong>{program.report_count}</strong> reports</span>
                        <span style={{ color: theme.border }}>|</span>
                        <span style={{ color: theme.success, fontWeight: '600' }}>NPR {Number(program.min_reward).toLocaleString()} – {Number(program.max_reward).toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span style={{ 
                        padding: '0.3rem 0.75rem', 
                        borderRadius: '6px', 
                        fontSize: '0.7rem', 
                        fontWeight: '800', 
                        textTransform: 'uppercase',
                        background: program.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                        color: program.is_active ? theme.success : theme.textSecondary,
                        border: `1px solid ${program.is_active ? theme.success : theme.border}`
                      }}>
                        {program.is_active ? 'Active' : 'Paused'}
                      </span>
                      <Link 
                        to={`/programs/${program.id}/edit`}
                        style={{
                          padding: '0.5rem 1rem',
                          background: theme.secondary,
                          borderRadius: '8px',
                          color: theme.textPrimary,
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          border: `1px solid ${theme.border}`,
                          transition: theme.transition
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#2D3748'}
                        onMouseOut={(e) => e.currentTarget.style.background = theme.secondary}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProgram(program.id, program.title)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: `1px solid ${theme.error}40`,
                          borderRadius: '8px',
                          color: theme.error,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: theme.transition
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default CompanyDashboard;