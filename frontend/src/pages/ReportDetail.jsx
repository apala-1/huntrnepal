import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { decryptReportData } from '../utils/encryption';

// ── Shared Premium Theme ──
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

const EncryptedPocSection = ({ encryptedPoc }) => {
  const [key, setKey] = useState('');
  const [decrypted, setDecrypted] = useState(null);
  const [error, setError] = useState('');
  const [keyLoading, setKeyLoading] = useState(false);

  const handleAutoDecrypt = async () => {
    setKeyLoading(true);
    try {
      const res = await api.get('/programs/my/encryption-key');
      const result = decryptReportData(JSON.parse(encryptedPoc), res.data.encryptionKey);
      if (result) {
        setDecrypted(result);
        setError('');
      } else {
        setError('Decryption failed — integrity check failed');
      }
    } catch (e) {
      setError('Secure gateway error: Could not retrieve encryption key');
    } finally {
      setKeyLoading(false);
    }
  };

  if (!encryptedPoc) return null;

  return (
    <div style={{ 
      background: theme.surface, 
      border: `1px solid ${theme.primary}40`, 
      borderRadius: theme.radius, 
      padding: '2rem',
      boxShadow: `0 0 20px ${theme.primary}10`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ 
        position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', 
        background: `radial-gradient(circle at top right, ${theme.primary}15, transparent)`, 
        pointerEvents: 'none' 
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ color: theme.primary }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 style={{ fontSize: '0.75rem', fontWeight: '800', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          Proof of Concept
        </h2>
        <span style={{
          background: `${theme.primary}15`,
          color: theme.primary,
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.65rem',
          fontWeight: 800,
          border: `1px solid ${theme.primary}30`
        }}>
          E2E ENCRYPTED
        </span>
      </div>

      {!decrypted ? (
        <div>
          <p style={{ fontSize: '0.95rem', color: theme.textSecondary, marginBottom: '1.5rem', lineHeight: '1.6' }}>
            This technical evidence is protected by military-grade encryption. The data was encrypted locally by the researcher.
          </p>
          {error && <div style={{ padding: '0.75rem 1rem', background: `${theme.error}15`, border: `1px solid ${theme.error}30`, borderRadius: '8px', color: theme.error, marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}
          <button
            onClick={handleAutoDecrypt}
            disabled={keyLoading}
            style={{ 
              background: theme.primary,
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: theme.transition,
              boxShadow: `0 4px 12px ${theme.primary}40`
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {keyLoading ? 'Accessing Secure Key...' : '🔓 Decrypt technical Evidence'}
          </button>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ padding: '0.75rem 1rem', background: `${theme.success}15`, border: `1px solid ${theme.success}30`, borderRadius: '8px', color: theme.success, marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            Successfully decrypted with authorized organizational key
          </div>
          {decrypted.poc_code && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: theme.textSecondary, margin: 0 }}>Payload / Code</p>
                <button onClick={() => navigator.clipboard.writeText(decrypted.poc_code)} style={{ background: 'transparent', border: 'none', color: theme.primary, fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}>COPY</button>
              </div>
              <pre style={{
                background: '#0F172A',
                padding: '1.25rem',
                borderRadius: '12px',
                overflow: 'auto',
                fontSize: '0.9rem',
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                border: `1px solid ${theme.border}`,
                color: theme.accent,
                lineHeight: '1.5'
              }}>
                {decrypted.poc_code}
              </pre>
            </div>
          )}
          {decrypted.poc_url && (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: theme.textSecondary }}>Reference URL</span>
              <a href={decrypted.poc_url} target="_blank" rel="noreferrer"
                style={{ color: theme.primary, fontWeight: '700', textDecoration: 'none', fontSize: '0.9rem' }}>
                {decrypted.poc_url} ↗
              </a>
            </div>
          )}
          <p style={{ fontSize: '0.7rem', color: theme.textSecondary, marginTop: '1rem', fontStyle: 'italic', textAlign: 'right' }}>
            Session localized: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

const CommentsSection = ({ reportId, userRole }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/comments/${reportId}`)
      .then(res => setComments(res.data.comments))
      .catch(console.error);
  }, [reportId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await api.post('/comments', { report_id: reportId, comment: newComment });
      const res = await api.get(`/comments/${reportId}`);
      setComments(res.data.comments);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: '2rem', boxShadow: theme.shadow }}>
      <h2 style={{ fontSize: '0.75rem', fontWeight: '800', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>
        Communication Log
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: `1px dashed ${theme.border}` }}>
            <p style={{ color: theme.textSecondary, fontSize: '0.9rem', margin: 0 }}>No dialogue has been initiated for this report.</p>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={{
              padding: '1.25rem',
              background: c.role === 'admin' ? 'rgba(59,130,246,0.05)' : 'rgba(0,0,0,0.15)',
              borderRadius: '14px',
              border: `1px solid ${c.role === 'admin' ? `${theme.primary}30` : theme.border}`,
              alignSelf: 'flex-start',
              width: '90%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: theme.textPrimary }}>{c.username}</span>
                  <span style={{ 
                    fontSize: '0.6rem', 
                    fontWeight: '800', 
                    textTransform: 'uppercase', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px',
                    background: c.role === 'admin' ? theme.primary : c.role === 'company' ? theme.accent : theme.textSecondary,
                    color: 'white'
                  }}>
                    {c.role}
                  </span>
                </div>
                <span style={{ color: theme.textSecondary, fontSize: '0.75rem' }}>
                  {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: theme.textSecondary, whiteSpace: 'pre-wrap', margin: 0, lineHeight: '1.5' }}>
                {c.comment}
              </p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Secure message to researcher/team..."
            rows={3}
            style={{ 
              width: '100%', 
              background: '#0F172A', 
              border: `1px solid ${theme.border}`, 
              borderRadius: '12px', 
              padding: '1rem', 
              color: theme.textPrimary, 
              fontSize: '0.95rem',
              outline: 'none',
              resize: 'none',
              transition: theme.transition,
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = theme.primary}
            onBlur={(e) => e.target.style.borderColor = theme.border}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            disabled={loading || !newComment.trim()}
            style={{ 
              background: 'transparent',
              color: theme.primary,
              border: `1px solid ${theme.primary}`,
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: theme.transition
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = theme.primary;
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.primary;
            }}
          >
            {loading ? 'Transmitting...' : 'Post Message'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PayButton = ({ reportId, rewardAmount }) => {
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const handlePay = async () => {
    setPaying(true);
    setPayError('');
    try {
      const res = await api.post('/payments/initiate', { report_id: reportId });
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      setPayError(err.response?.data?.error || 'Payment gateway connection failed');
      setPaying(false);
    }
  };

  return (
    <div style={{ 
      background: 'rgba(34,197,94,0.05)', 
      border: `1px solid ${theme.success}30`, 
      borderRadius: theme.radius, 
      padding: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: theme.success, margin: '0 0 0.5rem' }}>
          Bounty Authorized
        </h3>
        <p style={{ color: theme.textSecondary, fontSize: '0.9rem', margin: 0 }}>
          Payment of <strong style={{ color: theme.textPrimary }}>NPR {Number(rewardAmount).toLocaleString()}</strong> pending.
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        {payError && <div style={{ color: theme.error, fontSize: '0.75rem', marginBottom: '0.75rem' }}>{payError}</div>}
        <button
          onClick={handlePay}
          disabled={paying}
          style={{ 
            background: theme.success,
            color: 'white',
            border: 'none',
            padding: '0.875rem 1.5rem',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: `0 4px 15px rgba(34, 197, 94, 0.3)`,
            transition: theme.transition
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {paying ? 'Connecting Khalti...' : '💳 Execute Payment'}
        </button>
      </div>
    </div>
  );
};

const STATUS_COLORS = {
  pending:  { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' },
  triaging: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)' },
  accepted: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
  rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
  resolved: { bg: 'rgba(168, 85, 247, 0.1)', color: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' },
};

const ReportDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({ status: '', reward_amount: '' });
  const [updateMsg, setUpdateMsg] = useState('');

  const successMessage = location.state?.message;

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then(res => {
        setReport(res.data.report);
        setStatusUpdate({ 
          status: res.data.report.status, 
          reward_amount: res.data.report.reward_amount || '' 
        });
      })
      .catch(() => setError('Operational error: Resource not found or access denied'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/reports/${id}/status`, statusUpdate);
      setUpdateMsg('Report metadata updated successfully');
      setReport(prev => ({ ...prev, ...statusUpdate }));
    } catch (err) {
      setUpdateMsg(err.response?.data?.error || 'Registry update failed');
    }
  };

  if (loading) return (
    <div style={{ background: theme.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: `3px solid ${theme.border}`, borderTopColor: theme.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ background: theme.bg, minHeight: '100vh', padding: '4rem 2rem', textAlign: 'center' }}>
      <div style={{ background: `${theme.error}10`, color: theme.error, padding: '1.5rem', borderRadius: theme.radius, border: `1px solid ${theme.error}30`, display: 'inline-block' }}>{error}</div>
    </div>
  );

  const statusStyle = STATUS_COLORS[report.status] || STATUS_COLORS.pending;

  return (
    <div style={{ 
      background: theme.bg, 
      minHeight: '100vh', 
      padding: '4rem 1.5rem', 
      color: theme.textPrimary,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link 
            to={user?.role === 'company' ? '/dashboard/company' : '/dashboard'}
            style={{ color: theme.textSecondary, textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Mission Dashboard
          </Link>
        </div>

        {successMessage && (
          <div style={{ padding: '1rem 1.5rem', background: `${theme.success}15`, border: `1px solid ${theme.success}30`, borderRadius: '12px', color: theme.success, marginBottom: '2rem', fontWeight: '600' }}>
            ✓ {successMessage}
          </div>
        )}

        {/* Hero Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '3rem',
          background: theme.surface,
          padding: '2.5rem',
          borderRadius: theme.radius,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow
        }}>
          <div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ 
                padding: '0.35rem 1rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: report.severity === 'critical' ? theme.error : report.severity === 'high' ? '#F97316' : theme.warning,
                color: 'white'
              }}>
                {report.severity}
              </span>
              <span style={{ 
                padding: '0.35rem 1rem',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: statusStyle.bg,
                color: statusStyle.color,
                border: `1px solid ${statusStyle.border}`
              }}>
                {report.status}
              </span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '900', margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>{report.title}</h1>
            <div style={{ display: 'flex', gap: '1.5rem', color: theme.textSecondary, fontSize: '0.9rem', fontWeight: '500' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {new Date(report.created_at).toLocaleDateString()}
              </span>
              {report.cvss_score && (
                <span style={{ color: theme.primary, fontWeight: '700' }}>CVSS V3: {report.cvss_score}</span>
              )}
              <span>ID: <code style={{ color: theme.accent }}>HN-{report.id.toString().padStart(5, '0')}</code></span>
            </div>
          </div>
          {report.reward_amount && (
            <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
              <div style={{ color: theme.success, fontWeight: '900', fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
                NPR {Number(report.reward_amount).toLocaleString()}
              </div>
              <div style={{ color: theme.textSecondary, fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>Authorized Bounty</div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Description */}
            <section>
              <h2 style={{ fontSize: '0.75rem', fontWeight: '800', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Vulnerability Executive Summary
              </h2>
              <div style={{ background: theme.surface, padding: '1.75rem', borderRadius: theme.radius, border: `1px solid ${theme.border}`, lineHeight: '1.8', color: theme.textPrimary, whiteSpace: 'pre-wrap', fontSize: '1rem' }}>
                {report.description}
              </div>
            </section>

            {/* Steps */}
            <section>
              <h2 style={{ fontSize: '0.75rem', fontWeight: '800', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Reproduction Protocol
              </h2>
              <div style={{ background: '#0F172A', padding: '1.75rem', borderRadius: theme.radius, border: `1px solid ${theme.border}`, position: 'relative' }}>
                <pre style={{ margin: 0, fontFamily: "'Inter', sans-serif", whiteSpace: 'pre-wrap', lineHeight: '1.8', color: theme.textSecondary }}>
                  {report.steps_to_reproduce}
                </pre>
              </div>
            </section>

            {/* Impact */}
            <section>
              <h2 style={{ fontSize: '0.75rem', fontWeight: '800', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Security Impact Analysis
              </h2>
              <div style={{ background: `${theme.error}05`, padding: '1.75rem', borderRadius: theme.radius, border: `1px solid ${theme.error}20`, lineHeight: '1.8', color: theme.textPrimary }}>
                {report.impact}
              </div>
            </section>

            {user?.role === 'company' && report.encrypted_poc && (
              <EncryptedPocSection encryptedPoc={report.encrypted_poc} />
            )}

            {user?.role === 'researcher' && report.encrypted_poc && (
              <div style={{ background: theme.surface, border: `1px solid ${theme.primary}30`, borderRadius: theme.radius, padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ color: theme.primary }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '800', margin: '0 0 0.25rem' }}>End-to-End Encrypted PoC</h3>
                  <p style={{ fontSize: '0.85rem', color: theme.textSecondary, margin: 0 }}>Your technical proof is cryptographically sealed. Only the company can access this data.</p>
                </div>
              </div>
            )}

            <CommentsSection reportId={id} userRole={user?.role} />
          </div>

          {/* Sidebar Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Meta Card */}
            <div style={{ background: theme.surface, borderRadius: theme.radius, border: `1px solid ${theme.border}`, padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.7rem', fontWeight: '800', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Report Meta</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Program', value: report.program_title },
                  { label: 'Company', value: report.company_name },
                  { label: 'Researcher', value: `@${report.researcher_username}` },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '0.7rem', color: theme.textSecondary, marginBottom: '0.2rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: theme.textPrimary }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Panel (Company Only) */}
            {user?.role === 'company' && (
              <div style={{ background: theme.surface, borderRadius: theme.radius, border: `1px solid ${theme.primary}40`, padding: '1.5rem', boxShadow: `0 10px 20px rgba(0,0,0,0.2)` }}>
                <h3 style={{ fontSize: '0.7rem', fontWeight: '800', color: theme.primary, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Administrative Review</h3>
                
                {updateMsg && (
                  <div style={{ padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.5rem', background: updateMsg.includes('success') ? `${theme.success}15` : `${theme.error}15`, color: updateMsg.includes('success') ? theme.success : theme.error, border: `1px solid ${updateMsg.includes('success') ? theme.success : theme.error}30` }}>
                    {updateMsg}
                  </div>
                )}

                {report.status === 'accepted' && report.reward_amount && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <PayButton reportId={id} rewardAmount={report.reward_amount} />
                  </div>
                )}

                <form onSubmit={handleStatusUpdate}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: theme.textSecondary, display: 'block', marginBottom: '0.5rem' }}>Current Status</label>
                    <select
                      value={statusUpdate.status}
                      onChange={e => setStatusUpdate(p => ({ ...p, status: e.target.value }))}
                      style={{ width: '100%', background: '#0F172A', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '0.6rem', color: theme.textPrimary, outline: 'none' }}
                    >
                      <option value="pending">Pending Review</option>
                      <option value="triaging">Under Triage</option>
                      <option value="accepted">Accepted / Validated</option>
                      <option value="rejected">Rejected / Invalid</option>
                      <option value="resolved">Resolved / Fixed</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: theme.textSecondary, display: 'block', marginBottom: '0.5rem' }}>Reward (NPR)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary, fontSize: '0.8rem' }}>Rs.</span>
                      <input
                        type="number"
                        min="0"
                        value={statusUpdate.reward_amount}
                        onChange={e => setStatusUpdate(p => ({ ...p, reward_amount: e.target.value }))}
                        placeholder="0.00"
                        style={{ width: '100%', background: '#0F172A', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '0.6rem 0.6rem 0.6rem 2.5rem', color: theme.success, fontWeight: '700', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <button type="submit" style={{ width: '100%', background: theme.primary, color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: theme.transition }}>
                    Commit Updates
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default ReportDetail;