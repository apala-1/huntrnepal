import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

// ─── Reusable Pagination Component ───────────────────────────────
const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)'
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Page {page} of {totalPages}
      </span>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={{
            padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', background: 'transparent',
            color: page === 1 ? 'var(--text-muted)' : 'var(--text)',
            cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem'
          }}
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) => p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0.35rem 0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)',
                border: `1px solid ${p === page ? 'var(--primary)' : 'var(--border)'}`,
                background: p === page ? 'var(--primary)' : 'transparent',
                color: p === page ? 'white' : 'var(--text)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: p === page ? 600 : 400
              }}
            >
              {p}
            </button>
          ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={{
            padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)',
            border: '1px solid var(--border)', background: 'transparent',
            color: page === totalPages ? 'var(--text-muted)' : 'var(--text)',
            cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ─── 3-Dot Menu Component ────────────────────────────────────────
const ActionMenu = ({ actions }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '0.3rem 0.6rem', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', background: 'transparent',
          color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem',
          lineHeight: 1
        }}
      >
        ···
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: '4px',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', minWidth: '160px',
          boxShadow: 'var(--shadow)', zIndex: 100, overflow: 'hidden'
        }}>
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onClick(); setOpen(false); }}
              style={{
                display: 'block', width: '100%', padding: '0.6rem 1rem',
                background: 'transparent', border: 'none', textAlign: 'left',
                color: action.danger ? 'var(--danger)' : 'var(--text)',
                cursor: 'pointer', fontSize: '0.875rem',
                borderBottom: i < actions.length - 1 ? '1px solid var(--border)' : 'none'
              }}
              onMouseEnter={e => e.target.style.background = 'var(--bg)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Create/Edit User Modal ───────────────────────────────────────
const UserModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'researcher',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!user;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/admin/users/${user.id}`, {
          username: form.username,
          email: form.email,
          role: form.role
        });
      } else {
        if (!form.password) return setError('Password is required');
        await api.post('/admin/users', form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '2rem', width: '100%',
        maxWidth: '440px', boxShadow: 'var(--shadow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>
            {isEdit ? `Edit User — ${user.username}` : 'Create New User'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ✕
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            >
              <option value="researcher">Researcher</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {!isEdit && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Temporary password"
                required
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Admin Panel ─────────────────────────────────────────────
const TABS = ['overview', 'users', 'logs', 'payments'];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [modal, setModal] = useState(null); // null | { type: 'create' | 'edit', user? }

  const fetchTabData = (tab, page = 1) => {
    setLoading(true);
    setMessage('');
    const fetchers = {
      overview: () => api.get('/admin/stats').then(r => setStats(r.data.stats)),
      users: () => api.get(`/admin/users?page=${page}`).then(r => {
        setUsers(r.data.users);
        setPagination(p => ({ ...p, users: r.data.pagination }));
      }),
      logs: () => api.get(`/admin/logs?page=${page}`).then(r => {
        setLogs(r.data.logs);
        setPagination(p => ({ ...p, logs: r.data.pagination }));
      }),
      payments: () => api.get(`/admin/payments?page=${page}`).then(r => {
        setPayments(r.data.payments);
        setPagination(p => ({ ...p, payments: r.data.pagination }));
      }),
    };
    fetchers[tab]?.()
      .catch(() => setMessage('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTabData(activeTab); }, [activeTab]);

  const handleToggleUser = async (userId, isActive) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      setMessage(res.data.message);
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_active: isActive ? 0 : 1 } : u
      ));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Permanently delete user "${username}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage(`User "${username}" permanently deleted`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to delete');
    }
  };

  const getUserActions = (user) => [
    {
      label: 'Edit User',
      onClick: () => setModal({ type: 'edit', user })
    },
    {
      label: user.is_active ? 'Suspend Account' : 'Activate Account',
      onClick: () => handleToggleUser(user.id, user.is_active)
    },
    {
      label: 'Delete Permanently',
      danger: true,
      onClick: () => handleDeleteUser(user.id, user.username)
    }
  ];

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      {/* Modal */}
      {modal && (
        <UserModal
          user={modal.user}
          onClose={() => setModal(null)}
          onSave={() => {
            setModal(null);
            fetchTabData('users');
            setMessage(modal.type === 'create' ? 'User created successfully' : 'User updated successfully');
          }}
        />
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h1>Admin Panel</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          Platform management and oversight
        </p>
      </div>

      {message && (
        <div
          className={`alert ${message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') ? 'alert-error' : 'alert-success'}`}
          style={{ marginBottom: '1.5rem' }}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem',
        borderBottom: '1px solid var(--border)', marginBottom: '1.5rem'
      }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '0.6rem 1.2rem', background: 'none', border: 'none',
            borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize', fontSize: '0.9rem'
          }}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : (
        <>
          {/* OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem'
            }}>
              {[
                { label: 'Researchers', value: stats.researchers, color: 'var(--primary)' },
                { label: 'Companies', value: stats.companies, color: 'var(--warning)' },
                { label: 'Active Programs', value: stats.activePrograms, color: 'var(--success)' },
                { label: 'Total Reports', value: stats.totalReports, color: 'var(--text)' },
                { label: 'Resolved', value: stats.resolvedReports, color: 'var(--success)' },
                {
                  label: 'Total Paid Out',
                  value: `NPR ${Number(stats.totalPaidOut || 0).toLocaleString()}`,
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
          )}

          {/* USERS */}
          {activeTab === 'users' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1rem' }}>
                  All Users
                  {pagination.users && (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                      ({pagination.users.total} total)
                    </span>
                  )}
                </h2>
                <button
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.875rem' }}
                  onClick={() => setModal({ type: 'create' })}
                >
                  + Create User
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['ID', 'User', 'Email', 'Role', 'MFA', 'Status', ''].map(h => (
                        <th key={h} style={{
                          padding: '0.65rem 1rem', textAlign: 'left',
                          color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap'
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} style={{
                        borderBottom: '1px solid var(--border)',
                        opacity: user.is_active ? 1 : 0.5
                      }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          #{user.id}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: 500 }}>{user.username}</div>
                          {user.company_name && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {user.company_name}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {user.email}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className={`badge badge-${user.role}`}>{user.role}</span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <span style={{ color: user.mfa_enabled ? 'var(--success)' : 'var(--text-muted)' }}>
                            {user.mfa_enabled ? '✓' : '—'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 600,
                            color: user.is_active ? 'var(--success)' : 'var(--danger)'
                          }}>
                            {user.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {user.role !== 'admin' && (
                            <ActionMenu actions={getUserActions(user)} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                pagination={pagination.users}
                onPageChange={(p) => fetchTabData('users', p)}
              />
            </div>
          )}

          {/* LOGS */}
          {activeTab === 'logs' && (
            <div className="card">
              <h2 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>
                Audit Logs
                {pagination.logs && (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                    ({pagination.logs.total} total)
                  </span>
                )}
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Time', 'User', 'Action', 'Target', 'IP'].map(h => (
                        <th key={h} style={{
                          padding: '0.65rem 1rem', textAlign: 'left',
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
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.65rem 1rem' }}>{log.username || '—'}</td>
                        <td style={{ padding: '0.65rem 1rem' }}>
                          <code style={{
                            background: 'var(--bg)', padding: '0.15rem 0.4rem',
                            borderRadius: '4px', fontSize: '0.75rem', color: 'var(--primary)'
                          }}>
                            {log.action}
                          </code>
                        </td>
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)' }}>
                          {log.target_type ? `${log.target_type} #${log.target_id}` : '—'}
                        </td>
                        <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)' }}>
                          {log.ip_address || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                pagination={pagination.logs}
                onPageChange={(p) => fetchTabData('logs', p)}
              />
            </div>
          )}

          {/* PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="card">
              <h2 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>
                Payment Records
                {pagination.payments && (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                    ({pagination.payments.total} total)
                  </span>
                )}
              </h2>
              {payments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No payments yet</p>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['Report', 'Researcher', 'Company', 'Amount', 'Status', 'Date'].map(h => (
                            <th key={h} style={{
                              padding: '0.65rem 1rem', textAlign: 'left',
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
                            <td style={{ padding: '0.65rem 1rem' }}>{p.report_title}</td>
                            <td style={{ padding: '0.65rem 1rem' }}>{p.researcher_username}</td>
                            <td style={{ padding: '0.65rem 1rem' }}>{p.company_name}</td>
                            <td style={{ padding: '0.65rem 1rem', color: 'var(--success)', fontWeight: 600 }}>
                              NPR {Number(p.amount).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.65rem 1rem' }}>
                              <span style={{
                                fontSize: '0.75rem', fontWeight: 600,
                                color: p.status === 'completed' ? 'var(--success)' : 'var(--warning)'
                              }}>
                                {p.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 1rem', color: 'var(--text-muted)' }}>
                              {new Date(p.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    pagination={pagination.payments}
                    onPageChange={(p) => fetchTabData('payments', p)}
                  />
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanel;