import { useState, useEffect } from 'react';
import api from '../api/axios';

const TABS = ['overview', 'users', 'logs', 'payments'];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Constants for the theme
  const colors = {
    primary: '#3B82F6',
    secondary: '#1E293B',
    accent: '#14B8A6',
    bg: '#0F172A',
    surface: '#162033',
    border: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    success: '#22C55E',
    warning: '#F59E0B',
    critical: '#EF4444'
  };

  const styles = {
    container: {
      padding: '3rem 2rem',
      backgroundColor: colors.bg,
      minHeight: '100vh',
      color: colors.textPrimary,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    },
    headerSection: {
      marginBottom: '3rem',
      position: 'relative'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '800',
      letterSpacing: '-0.025em',
      background: `linear-gradient(to right, ${colors.textPrimary}, ${colors.primary})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0
    },
    subtitle: {
      color: colors.textSecondary,
      marginTop: '0.5rem',
      fontSize: '1.1rem',
      fontWeight: '400'
    },
    alert: (isError) => ({
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      marginBottom: '2rem',
      backgroundColor: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
      border: `1px solid ${isError ? colors.critical : colors.success}`,
      color: isError ? '#fca5a5' : '#86efac',
      fontSize: '0.95rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      animation: 'fadeIn 0.3s ease-out'
    }),
    tabContainer: {
      display: 'flex',
      gap: '1.5rem',
      borderBottom: `1px solid ${colors.border}`,
      marginBottom: '2.5rem',
      paddingBottom: '0.5rem'
    },
    tabButton: (isActive) => ({
      padding: '0.8rem 0.5rem',
      background: 'none',
      border: 'none',
      borderBottom: isActive ? `3px solid ${colors.primary}` : '3px solid transparent',
      color: isActive ? colors.primary : colors.textSecondary,
      cursor: 'pointer',
      fontWeight: '600',
      textTransform: 'capitalize',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      position: 'relative',
      outline: 'none'
    }),
    card: {
      backgroundColor: colors.surface,
      borderRadius: '16px',
      border: `1px solid ${colors.border}`,
      padding: '1.5rem',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    statGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      padding: '2rem',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    statValue: (color) => ({
      fontSize: '2.25rem',
      fontWeight: '800',
      color: color || colors.textPrimary,
      marginBottom: '0.5rem',
      lineHeight: '1'
    }),
    statLabel: {
      color: colors.textSecondary,
      fontSize: '0.9rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    tableWrapper: {
      overflowX: 'auto',
      borderRadius: '12px',
      border: `1px solid ${colors.border}`
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      fontSize: '0.95rem'
    },
    th: {
      padding: '1.25rem 1rem',
      textAlign: 'left',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      color: colors.textSecondary,
      fontWeight: '600',
      borderBottom: `1px solid ${colors.border}`,
      textTransform: 'uppercase',
      fontSize: '0.8rem',
      letterSpacing: '0.05em'
    },
    td: {
      padding: '1.25rem 1rem',
      borderBottom: `1px solid ${colors.border}`,
      verticalAlign: 'middle'
    },
    badge: (type) => {
      const typeMap = {
        admin: { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa' },
        researcher: { bg: 'rgba(20, 184, 166, 0.1)', text: '#2dd4bf' },
        company: { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24' },
        active: { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80' },
        suspended: { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171' },
        completed: { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80' },
        pending: { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24' }
      };
      const style = typeMap[type.toLowerCase()] || { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' };
      return {
        padding: '0.35rem 0.75rem',
        borderRadius: '99px',
        fontSize: '0.75rem',
        fontWeight: '700',
        backgroundColor: style.bg,
        color: style.text,
        textTransform: 'uppercase',
        display: 'inline-block'
      };
    },
    actionButton: (variant) => ({
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      border: '1px solid transparent',
      fontSize: '0.85rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: variant === 'suspend' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
      color: variant === 'suspend' ? colors.critical : colors.success,
      borderColor: variant === 'suspend' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
      outline: 'none'
    }),
    codeBlock: {
      background: 'rgba(59, 130, 246, 0.05)',
      padding: '0.4rem 0.6rem',
      borderRadius: '6px',
      fontSize: '0.85rem',
      color: colors.primary,
      fontFamily: "'JetBrains Mono', monospace",
      border: '1px solid rgba(59, 130, 246, 0.1)'
    }
  };

  // Load data based on active tab
  useEffect(() => {
    setLoading(true);
    setMessage('');

    const fetchers = {
      overview: () => api.get('/admin/stats').then(r => setStats(r.data.stats)),
      users:    () => api.get('/admin/users').then(r => setUsers(r.data.users)),
      logs:     () => api.get('/admin/logs').then(r => setLogs(r.data.logs)),
      payments: () => api.get('/admin/payments').then(r => setPayments(r.data.payments)),
    };

    fetchers[activeTab]?.()
      .catch(() => setMessage('Failed to load data'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleToggleUser = async (userId, isActive) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      setMessage(res.data.message);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_active: isActive ? 0 : 1 } : u
      ));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleVerifyCompany = async (companyId) => {
    try {
      const res = await api.put(`/admin/companies/${companyId}/verify`);
      setMessage(res.data.message);
      setUsers(prev => prev.map(u =>
        u.company_id === companyId ? { ...u, is_verified: 1 } : u
      ));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to verify company');
    }
  };

  return (
    <div className="admin-panel-container" style={styles.container}>
      {/* Page Header */}
      <div style={styles.headerSection}>
        <h1 style={styles.title}>Admin Command Center</h1>
        <p style={styles.subtitle}>
          Secure monitoring and platform oversight for HuntrNepal
        </p>
        
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '0',
          width: '150px',
          height: '150px',
          background: `radial-gradient(circle, ${colors.primary}22 0%, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: -1
        }} />
      </div>

      {/* Message Feedback */}
      {message && (
        <div style={styles.alert(message.includes('Failed'))}>
          <span style={{ fontSize: '1.2rem' }}>{message.includes('Failed') ? '⚠️' : '🛡️'}</span>
          {message}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        {TABS.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            style={styles.tabButton(activeTab === tab)}
          >
            {tab}
            {activeTab === tab && (
               <div style={{
                 position: 'absolute',
                 bottom: '-3px',
                 left: '0',
                 width: '100%',
                 height: '3px',
                 background: colors.primary,
                 boxShadow: `0 0 12px ${colors.primary}`
               }} />
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5rem' }}>
          <div className="spinner" style={{ 
            width: '40px', 
            height: '40px', 
            border: `3px solid ${colors.border}`, 
            borderTopColor: colors.primary, 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite' 
          }} />
          <p style={{ color: colors.textSecondary, marginTop: '1.5rem', fontWeight: '500' }}>
            Synchronizing data...
          </p>
        </div>
      ) : (
        <>
          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && stats && (
            <div style={styles.statGrid}>
              {[
                { label: 'Researchers', value: stats.researchers, color: colors.primary },
                { label: 'Companies', value: stats.companies, color: colors.warning },
                { label: 'Active Programs', value: stats.activePrograms, color: colors.accent },
                { label: 'Total Reports', value: stats.totalReports, color: colors.textPrimary },
                { label: 'Resolved', value: stats.resolvedReports, color: colors.success },
                {
                  label: 'Total Paid Out',
                  value: `NPR ${Number(stats.totalPaidOut).toLocaleString()}`,
                  color: colors.success
                },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{...styles.card, ...styles.statCard}}>
                  <div style={styles.statValue(s.color)}>
                    {s.value}
                  </div>
                  <div style={styles.statLabel}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <div style={styles.card}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['ID', 'Identity', 'Email', 'Role', 'MFA', 'Status', 'Actions'].map(h => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="table-row">
                        <td style={{...styles.td, color: colors.textSecondary, fontFamily: 'monospace'}}>
                          #{user.id}
                        </td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '700', fontSize: '1rem' }}>{user.username}</div>
                          {user.company_name && (
                            <div style={{ fontSize: '0.75rem', color: colors.primary, marginTop: '0.2rem', fontWeight: '600' }}>
                              🏢 {user.company_name}
                            </div>
                          )}
                        </td>
                        <td style={{...styles.td, color: colors.textSecondary }}>
                          {user.email}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.badge(user.role)}>{user.role}</span>
                        </td>
                        <td style={{...styles.td, textAlign: 'center'}}>
                          {user.mfa_enabled ? (
                            <span title="MFA Enabled" style={{ color: colors.success, fontSize: '1.2rem' }}>🛡️</span>
                          ) : (
                            <span title="MFA Disabled" style={{ opacity: 0.2 }}>⚪</span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.badge(user.is_active ? 'active' : 'suspended')}>
                            {user.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUser(user.id, user.is_active)}
                                style={styles.actionButton(user.is_active ? 'suspend' : 'activate')}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                              >
                                {user.is_active ? 'Restrict' : 'Restore'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── AUDIT LOGS TAB ── */}
          {activeTab === 'logs' && (
            <div style={styles.card}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Timestamp', 'User Identity', 'Action Performed', 'Entity Target', 'Network IP'].map(h => (
                        <th key={h} style={styles.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="table-row">
                        <td style={{...styles.td, color: colors.textSecondary, whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{...styles.td, fontWeight: '600'}}>
                          {log.username || 'System Engine'}
                        </td>
                        <td style={styles.td}>
                          <code style={styles.codeBlock}>
                            {log.action}
                          </code>
                        </td>
                        <td style={{...styles.td, color: colors.textSecondary }}>
                          {log.target_type ? (
                            <span style={{ color: colors.accent }}>
                              {log.target_type} <span style={{ opacity: 0.6 }}>#{log.target_id}</span>
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{...styles.td, color: colors.textSecondary, fontFamily: 'monospace' }}>
                          {log.ip_address || 'Internal'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PAYMENTS TAB ── */}
          {activeTab === 'payments' && (
            <div style={styles.card}>
              {payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>💰</div>
                  <p style={{ color: colors.textSecondary, fontSize: '1.1rem' }}>
                    No financial transactions recorded yet
                  </p>
                </div>
              ) : (
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {['Bounty Title', 'Researcher', 'Sponsor', 'Reward', 'Payout Status', 'Date'].map(h => (
                          <th key={h} style={styles.th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className="table-row">
                          <td style={{...styles.td, fontWeight: '600'}}>{p.report_title}</td>
                          <td style={styles.td}>{p.researcher_username}</td>
                          <td style={styles.td}>
                             <span style={{ color: colors.primary, fontWeight: '500' }}>{p.company_name}</span>
                          </td>
                          <td style={{...styles.td, color: colors.success, fontWeight: '800', fontSize: '1rem' }}>
                            NPR {Number(p.amount).toLocaleString()}
                          </td>
                          <td style={styles.td}>
                            <span style={styles.badge(p.status)}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{...styles.td, color: colors.textSecondary }}>
                            {new Date(p.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Global CSS for animations and row hovers */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .table-row {
          transition: background-color 0.2s ease;
        }
        .table-row:hover {
          background-color: rgba(255, 255, 255, 0.03);
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 15px ${colors.primary}11;
          border-color: ${colors.primary}44;
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${colors.bg};
        }
        ::-webkit-scrollbar-thumb {
          background: ${colors.secondary};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary}44;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;