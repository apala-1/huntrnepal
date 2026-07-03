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
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Admin Panel</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          Platform management and oversight
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Failed') ? 'alert-error' : 'alert-success'}`}
          style={{ marginBottom: '1.5rem' }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem'
      }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '0.6rem 1.2rem',
            background: 'none', border: 'none',
            borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: 500,
            textTransform: 'capitalize', fontSize: '0.9rem'
          }}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
          Loading...
        </p>
      ) : (
        <>
          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && stats && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem', marginBottom: '2rem'
              }}>
                {[
                  { label: 'Researchers', value: stats.researchers, color: 'var(--primary)' },
                  { label: 'Companies', value: stats.companies, color: 'var(--warning)' },
                  { label: 'Active Programs', value: stats.activePrograms, color: 'var(--success)' },
                  { label: 'Total Reports', value: stats.totalReports, color: 'var(--text)' },
                  { label: 'Resolved', value: stats.resolvedReports, color: 'var(--success)' },
                  {
                    label: 'Total Paid Out',
                    value: `NPR ${Number(stats.totalPaidOut).toLocaleString()}`,
                    color: 'var(--success)'
                  },
                ].map(s => (
                  <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>
                      {s.value}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <div className="card">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['ID', 'Username', 'Email', 'Role', 'MFA', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '0.75rem 1rem', textAlign: 'left',
                          color: 'var(--text-muted)', fontWeight: 500
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                          #{user.id}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                          {user.username}
                          {user.company_name && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {user.company_name}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className={`badge badge-${user.role}`}>{user.role}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{ color: user.mfa_enabled ? 'var(--success)' : 'var(--text-muted)' }}>
                            {user.mfa_enabled ? '✅' : '—'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            color: user.is_active ? 'var(--success)' : 'var(--danger)',
                            fontWeight: 500, fontSize: '0.8rem'
                          }}>
                            {user.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUser(user.id, user.is_active)}
                                style={{
                                  padding: '0.3rem 0.75rem',
                                  borderRadius: 'var(--radius)',
                                  border: `1px solid ${user.is_active ? 'var(--danger)' : 'var(--success)'}`,
                                  background: 'transparent',
                                  color: user.is_active ? 'var(--danger)' : 'var(--success)',
                                  cursor: 'pointer', fontSize: '0.75rem'
                                }}
                              >
                                {user.is_active ? 'Suspend' : 'Activate'}
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

          {/* ── AUDIT LOGS ── */}
          {activeTab === 'logs' && (
            <div className="card">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Time', 'User', 'Action', 'Target', 'IP'].map(h => (
                        <th key={h} style={{
                          padding: '0.75rem 1rem', textAlign: 'left',
                          color: 'var(--text-muted)', fontWeight: 500
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {log.username || '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <code style={{
                            background: 'var(--bg)',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: 'var(--primary)'
                          }}>
                            {log.action}
                          </code>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                          {log.target_type ? `${log.target_type} #${log.target_id}` : '—'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                          {log.ip_address || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {activeTab === 'payments' && (
            <div className="card">
              {payments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  No payments yet
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Report', 'Researcher', 'Company', 'Amount', 'Status', 'Date'].map(h => (
                          <th key={h} style={{
                            padding: '0.75rem 1rem', textAlign: 'left',
                            color: 'var(--text-muted)', fontWeight: 500
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>{p.report_title}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{p.researcher_username}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{p.company_name}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--success)', fontWeight: 600 }}>
                            NPR {Number(p.amount).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{
                              color: p.status === 'completed' ? 'var(--success)' : 'var(--warning)',
                              fontWeight: 500, fontSize: '0.8rem'
                            }}>
                              {p.status.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
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
    </div>
  );
};

export default AdminPanel;