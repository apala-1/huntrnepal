import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

// ─── Design System Constants ──────────────────────────────────────
const theme = {
  primary: '#3B82F6',
  primaryGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  secondary: '#1E293B',
  surface: '#162033',
  bg: '#0F172A',
  border: 'rgba(255,255,255,0.08)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  teal: '#14B8A6',
  radius: '16px',
  shadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
};

// ─── Reusable Pagination Component ───────────────────────────────
const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${theme.border}`
    }}>
      <span style={{ color: theme.textMuted, fontSize: '0.85rem', fontWeight: 500 }}>
        Page <span style={{ color: theme.text }}>{page}</span> of <span style={{ color: theme.text }}>{totalPages}</span>
      </span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={{
            padding: '0.5rem 1rem', borderRadius: '10px',
            border: `1px solid ${theme.border}`, background: 'rgba(255,255,255,0.03)',
            color: page === 1 ? theme.textMuted : theme.text,
            cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem',
            transition: theme.transition, fontWeight: 500
          }}
          onMouseEnter={e => page !== 1 && (e.target.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => page !== 1 && (e.target.style.background = 'rgba(255,255,255,0.03)')}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) => p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0.5rem 0.5rem', color: theme.textMuted, fontSize: '0.85rem' }}>...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '10px',
                border: `1px solid ${p === page ? theme.primary : theme.border}`,
                background: p === page ? theme.primaryGradient : 'transparent',
                color: theme.text,
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                transition: theme.transition,
                boxShadow: p === page ? '0 0 15px rgba(59, 130, 246, 0.3)' : 'none'
              }}
            >
              {p}
            </button>
          ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={{
            padding: '0.5rem 1rem', borderRadius: '10px',
            border: `1px solid ${theme.border}`, background: 'rgba(255,255,255,0.03)',
            color: page === totalPages ? theme.textMuted : theme.text,
            cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem',
            transition: theme.transition, fontWeight: 500
          }}
          onMouseEnter={e => page !== totalPages && (e.target.style.background = 'rgba(255,255,255,0.08)')}
          onMouseLeave={e => page !== totalPages && (e.target.style.background = 'rgba(255,255,255,0.03)')}
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
          width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${theme.border}`,
          borderRadius: '8px', background: 'rgba(255,255,255,0.03)',
          color: theme.textMuted, cursor: 'pointer', fontSize: '1.2rem',
          transition: theme.transition
        }}
        onMouseEnter={e => {
          e.target.style.background = 'rgba(255,255,255,0.08)';
          e.target.style.color = theme.text;
        }}
        onMouseLeave={e => {
          e.target.style.background = 'rgba(255,255,255,0.03)';
          e.target.style.color = theme.textMuted;
        }}
      >
        <span style={{ transform: 'translateY(-2px)' }}>···</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '110%',
          background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: '12px', minWidth: '180px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', zIndex: 100, overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
          backdropFilter: 'blur(10px)'
        }}>
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => { action.onClick(); setOpen(false); }}
              style={{
                display: 'block', width: '100%', padding: '0.75rem 1rem',
                background: 'transparent', border: 'none', textAlign: 'left',
                color: action.danger ? theme.danger : theme.text,
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                transition: theme.transition,
                borderBottom: i < actions.length - 1 ? `1px solid ${theme.border}` : 'none'
              }}
              onMouseEnter={e => {
                e.target.style.background = action.danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
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

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)',
    border: `1px solid ${theme.border}`, borderRadius: '10px',
    color: theme.text, fontSize: '0.9rem', outline: 'none',
    transition: theme.transition, marginTop: '0.5rem'
  };

  const labelStyle = {
    fontSize: '0.85rem', fontWeight: 600, color: theme.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.05em'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem', backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: '24px', padding: '2.5rem', width: '100%',
        maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: theme.text }}>
              {isEdit ? 'Update Profile' : 'New Identity'}
            </h2>
            <p style={{ color: theme.textMuted, fontSize: '0.875rem', marginTop: '0.4rem' }}>
              {isEdit ? `Modifying privileges for ${user.username}` : 'Registering a new operative on HuntrNepal'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: 'none', 
              color: theme.textMuted, cursor: 'pointer', 
              width: '32px', height: '32px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', transition: theme.transition
            }}
            onMouseEnter={e => e.target.style.color = theme.text}
            onMouseLeave={e => e.target.style.color = theme.textMuted}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', 
            border: `1px solid ${theme.danger}`, borderRadius: '12px',
            color: theme.danger, fontSize: '0.85rem', marginBottom: '1.5rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Username</label>
            <input
              style={inputStyle}
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              onFocus={e => e.target.style.borderColor = theme.primary}
              onBlur={e => e.target.style.borderColor = theme.border}
              required
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              style={inputStyle}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              onFocus={e => e.target.style.borderColor = theme.primary}
              onBlur={e => e.target.style.borderColor = theme.border}
              required
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Access Level</label>
            <select
              style={inputStyle}
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            >
              <option value="researcher">Researcher</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {!isEdit && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Temporary Password</label>
              <input
                type="password"
                style={inputStyle}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                onFocus={e => e.target.style.borderColor = theme.primary}
                onBlur={e => e.target.style.borderColor = theme.border}
                required
              />
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="submit" 
              style={{
                flex: 1, padding: '0.85rem', borderRadius: '12px',
                background: theme.primaryGradient, color: 'white',
                border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                transition: theme.transition, boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
              }}
              disabled={loading}
              onMouseEnter={e => { if(!loading) e.target.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
            >
              {loading ? 'Processing...' : isEdit ? 'Update operative' : 'Create operative'}
            </button>
            <button 
              type="button" 
              style={{
                padding: '0.85rem 1.5rem', borderRadius: '12px',
                background: 'transparent', color: theme.text,
                border: `1px solid ${theme.border}`, fontWeight: 600, cursor: 'pointer',
                transition: theme.transition
              }}
              onClick={onClose}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
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
  const [modal, setModal] = useState(null);

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
      .catch(() => setMessage('Network Error: Failed to synchronize data'))
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
      setMessage(err.response?.data?.error || 'System Breach: Action restricted');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Permanently terminate user "${username}"? All associated data will be purged.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setMessage(`User "${username}" has been purged from system`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Authorization Failed');
    }
  };

  const getUserActions = (user) => [
    {
      label: 'Modify Details',
      onClick: () => setModal({ type: 'edit', user })
    },
    {
      label: user.is_active ? 'Revoke Access' : 'Restore Access',
      onClick: () => handleToggleUser(user.id, user.is_active)
    },
    {
      label: 'Purge Identity',
      danger: true,
      onClick: () => handleDeleteUser(user.id, user.username)
    }
  ];

  // Helper for status badges
  const getBadgeStyle = (type) => {
    const colors = {
      researcher: { bg: 'rgba(59, 130, 246, 0.1)', text: '#60A5FA' },
      company: { bg: 'rgba(20, 184, 166, 0.1)', text: '#2DD4BF' },
      admin: { bg: 'rgba(139, 92, 246, 0.1)', text: '#A78BFA' },
      active: { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ADE80' },
      suspended: { bg: 'rgba(239, 68, 68, 0.1)', text: '#F87171' }
    };
    const c = colors[type.toLowerCase()] || colors.researcher;
    return {
      padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem',
      fontWeight: 600, background: c.bg, color: c.text, textTransform: 'uppercase',
      letterSpacing: '0.02em', border: `1px solid ${c.bg}`
    };
  };

  return (
    <div style={{ 
      background: theme.bg, minHeight: '100vh', color: theme.text,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Modal */}
        {modal && (
          <UserModal
            user={modal.user}
            onClose={() => setModal(null)}
            onSave={() => {
              setModal(null);
              fetchTabData('users');
              setMessage(modal.type === 'create' ? 'Success: New operative registered' : 'Success: Profile updated');
            }}
          />
        )}

        {/* Header Section */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', 
          marginBottom: '2.5rem', position: 'relative'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ 
                width: '12px', height: '12px', borderRadius: '50%', 
                background: theme.teal, boxShadow: `0 0 10px ${theme.teal}` 
              }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.teal, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                System Core
              </span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Admin <span style={{ color: theme.primary }}>Panel</span>
            </h1>
            <p style={{ color: theme.textMuted, fontSize: '1rem', marginTop: '0.5rem' }}>
              Command & Control for the HuntrNepal infrastructure.
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
             <div style={{ fontSize: '0.85rem', color: theme.textMuted }}>Security Status</div>
             <div style={{ fontSize: '1.1rem', fontWeight: 600, color: theme.success }}>ENCRYPTED & ONLINE</div>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem',
            background: message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') || message.toLowerCase().includes('breach') 
              ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            border: `1px solid ${message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') || message.toLowerCase().includes('breach') 
              ? theme.danger : theme.success}`,
            color: message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') || message.toLowerCase().includes('breach') 
              ? '#FCA5A5' : '#86EFAC',
            fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <span style={{ fontSize: '1.2rem' }}>{message.toLowerCase().includes('fail') ? '⚠️' : '✓'}</span>
            {message}
          </div>
        )}

        {/* Tabs Strategy */}
        <div style={{
          display: 'flex', gap: '0.5rem',
          background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '14px',
          marginBottom: '2.5rem', border: `1px solid ${theme.border}`, width: 'fit-content'
        }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '0.7rem 1.5rem', borderRadius: '10px', background: activeTab === tab ? theme.surface : 'transparent',
              border: 'none',
              boxShadow: activeTab === tab ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
              color: activeTab === tab ? theme.text : theme.textMuted,
              cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize', fontSize: '0.95rem',
              transition: theme.transition
            }}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '10rem 0' }}>
            <div style={{ 
              width: '40px', height: '40px', border: `3px solid ${theme.border}`,
              borderTopColor: theme.primary, borderRadius: '50%', display: 'inline-block',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: theme.textMuted, marginTop: '1.5rem', fontWeight: 500, letterSpacing: '0.05em' }}>SYNCHRONIZING SECURE FEED...</p>
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
            {/* OVERVIEW */}
            {activeTab === 'overview' && stats && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {[
                  { label: 'Registered Researchers', value: stats.researchers, color: theme.primary, icon: '🛡️' },
                  { label: 'Partner Organizations', value: stats.companies, color: theme.teal, icon: '🏢' },
                  { label: 'Active Bug Bounties', value: stats.activePrograms, color: theme.success, icon: '🎯' },
                  { label: 'Submissions Received', value: stats.totalReports, color: theme.text, icon: '📄' },
                  { label: 'Threats Neutralized', value: stats.resolvedReports, color: theme.success, icon: '✅' },
                  {
                    label: 'Total Payout Volume',
                    value: `NPR ${Number(stats.totalPaidOut || 0).toLocaleString()}`,
                    color: '#FCD34D', icon: '💰'
                  },
                ].map(s => (
                  <div key={s.label} style={{ 
                    background: theme.surface, padding: '2rem', borderRadius: '24px',
                    border: `1px solid ${theme.border}`, position: 'relative', overflow: 'hidden',
                    transition: theme.transition, cursor: 'default'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{s.icon}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>
                      {s.value}
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '0.9rem', fontWeight: 600, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {s.label}
                    </div>
                    <div style={{ 
                      position: 'absolute', right: '-10px', bottom: '-10px', 
                      fontSize: '6rem', opacity: 0.03, pointerEvents: 'none', userSelect: 'none' 
                    }}>
                      {s.icon}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* USERS */}
            {activeTab === 'users' && (
              <div style={{ 
                background: theme.surface, borderRadius: '24px', 
                border: `1px solid ${theme.border}`, padding: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Active Operatives</h2>
                    <p style={{ color: theme.textMuted, fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Manage user privileges and account status
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                     {pagination.users && (
                        <span style={{ color: theme.textMuted, fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                          {pagination.users.total} Total
                        </span>
                      )}
                    <button
                      style={{ 
                        background: theme.primaryGradient, color: 'white', border: 'none',
                        padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 600,
                        cursor: 'pointer', transition: theme.transition, fontSize: '0.9rem',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }}
                      onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                      onClick={() => setModal({ type: 'create' })}
                    >
                      + Register Operative
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                        {['Operative', 'Contact Info', 'Access Level', '2FA', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{
                            padding: '1.25rem 1.5rem', color: theme.textMuted, 
                            fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem',
                            letterSpacing: '0.1em'
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} style={{
                          borderTop: `1px solid ${theme.border}`,
                          background: user.is_active ? 'transparent' : 'rgba(239, 68, 68, 0.02)',
                          transition: theme.transition
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = user.is_active ? 'transparent' : 'rgba(239, 68, 68, 0.02)'}
                        >
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                               <div style={{ 
                                 width: '36px', height: '36px', borderRadius: '10px', 
                                 background: `linear-gradient(45deg, ${theme.secondary}, ${theme.surface})`,
                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                                 fontWeight: 700, color: theme.primary, border: `1px solid ${theme.border}`
                               }}>
                                 {user.username.charAt(0).toUpperCase()}
                               </div>
                               <div>
                                 <div style={{ fontWeight: 600, color: theme.text }}>{user.username}</div>
                                 <div style={{ fontSize: '0.75rem', color: theme.textMuted }}>ID: #{user.id}</div>
                               </div>
                            </div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ color: theme.text }}>{user.email}</div>
                            <div style={{ fontSize: '0.75rem', color: theme.textMuted }}>{user.company_name || 'No Affiliation'}</div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={getBadgeStyle(user.role)}>{user.role}</span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                             <div style={{ 
                               color: user.mfa_enabled ? theme.success : theme.textMuted,
                               display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.8rem'
                             }}>
                               {user.mfa_enabled ? '● ENABLED' : '○ DISABLED'}
                             </div>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
                            <span style={getBadgeStyle(user.is_active ? 'active' : 'suspended')}>
                              {user.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem' }}>
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
              <div style={{ 
                background: theme.surface, borderRadius: '24px', 
                border: `1px solid ${theme.border}`, padding: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                   <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Audit Trails</h2>
                    <p style={{ color: theme.textMuted, fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Real-time forensic ledger of platform activity
                    </p>
                  </div>
                  {pagination.logs && (
                    <span style={{ color: theme.textMuted, fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                      {pagination.logs.total} Entries
                    </span>
                  )}
                </div>
                <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                        {['Timestamp', 'Subject', 'Action / Event', 'Object', 'Source IP'].map(h => (
                          <th key={h} style={{
                            padding: '1.25rem 1.5rem', color: theme.textMuted, 
                            fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem',
                            letterSpacing: '0.1em'
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id} style={{ borderTop: `1px solid ${theme.border}`, transition: theme.transition }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '1rem 1.5rem', color: theme.textMuted, fontFamily: 'monospace' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{log.username || 'SYSTEM'}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{
                              background: 'rgba(59, 130, 246, 0.1)', color: theme.primary,
                              padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem',
                              fontWeight: 700, fontFamily: 'monospace'
                            }}>
                              {log.action}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', color: theme.textMuted }}>
                            {log.target_type ? `${log.target_type} [${log.target_id}]` : '—'}
                          </td>
                          <td style={{ padding: '1rem 1.5rem', color: theme.textMuted, fontFamily: 'monospace' }}>
                            {log.ip_address || '127.0.0.1'}
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
              <div style={{ 
                background: theme.surface, borderRadius: '24px', 
                border: `1px solid ${theme.border}`, padding: '2rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Transaction Ledger</h2>
                    <p style={{ color: theme.textMuted, fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Financial records of reward distributions
                    </p>
                  </div>
                  {pagination.payments && (
                    <span style={{ color: theme.textMuted, fontSize: '0.85rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                      {pagination.payments.total} Records
                    </span>
                  )}
                </div>
                {payments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</div>
                    <p style={{ color: theme.textMuted, fontSize: '1rem', fontWeight: 500 }}>No financial traffic detected in this cycle.</p>
                  </div>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${theme.border}` }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                            {['Objective', 'Researcher', 'Entity', 'Bounty', 'Status', 'Date'].map(h => (
                              <th key={h} style={{
                                padding: '1.25rem 1.5rem', color: theme.textMuted, 
                                fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem',
                                letterSpacing: '0.1em'
                              }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map(p => (
                            <tr key={p.id} style={{ borderTop: `1px solid ${theme.border}`, transition: theme.transition }}
                               onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                               onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600 }}>{p.report_title}</td>
                              <td style={{ padding: '1.25rem 1.5rem' }}>{p.researcher_username}</td>
                              <td style={{ padding: '1.25rem 1.5rem' }}>{p.company_name}</td>
                              <td style={{ padding: '1.25rem 1.5rem', color: theme.success, fontWeight: 800, fontSize: '1rem' }}>
                                NPR {Number(p.amount).toLocaleString()}
                              </td>
                              <td style={{ padding: '1.25rem 1.5rem' }}>
                                <span style={{
                                  fontSize: '0.7rem', fontWeight: 800,
                                  color: p.status === 'completed' ? theme.success : theme.warning,
                                  background: p.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                  padding: '0.3rem 0.6rem', borderRadius: '6px', border: `1px solid ${p.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                                }}>
                                  {p.status.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: '1.25rem 1.5rem', color: theme.textMuted }}>
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
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        
        * { box-sizing: border-box; }
        
        button:active { transform: scale(0.98); }
        
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${theme.bg}; }
        ::-webkit-scrollbar-thumb { background: ${theme.secondary}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.primary}; }
        
        input::placeholder { color: rgba(255,255,255,0.2); }
        
        select { appearance: none; background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1em; }
      `}</style>
    </div>
  );
};

export default AdminPanel;