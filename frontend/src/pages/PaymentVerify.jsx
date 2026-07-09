import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const pidx = searchParams.get('pidx');
    const paymentId = searchParams.get('payment_id');

    if (!pidx || !paymentId) {
      setStatus('error');
      setError('Missing unique payment identifiers');
      return;
    }

    api.get(`/payments/verify?pidx=${pidx}&payment_id=${paymentId}`)
      .then(res => {
        setStatus('success');
        setDetails(res.data);
      })
      .catch(err => {
        setStatus('error');
        setError(err.response?.data?.error || 'Validation gateway rejected the transaction');
      });
  }, [searchParams]);

  // ── Theme ──
  const theme = {
    bg: '#0F172A',
    surface: '#162033',
    border: 'rgba(255,255,255,0.08)',
    primary: '#3B82F6',
    success: '#22C55E',
    error: '#EF4444',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    radius: '20px',
    shadow: '0 20px 40px rgba(0,0,0,0.4)',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={{ 
      background: theme.bg, 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem',
      color: theme.textPrimary,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ 
        maxWidth: '520px', 
        width: '100%',
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radius,
        padding: '3.5rem 2.5rem',
        textAlign: 'center',
        boxShadow: theme.shadow,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Element */}
        <div style={{ 
          position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', 
          background: `radial-gradient(circle, ${status === 'success' ? theme.success : status === 'error' ? theme.error : theme.primary}10, transparent)`,
          borderRadius: '50%'
        }} />

        {status === 'verifying' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ 
              width: '80px', height: '80px', margin: '0 auto 2.5rem',
              border: `4px solid ${theme.border}`, borderTopColor: theme.primary,
              borderRadius: '50%', animation: 'spin 1.5s linear infinite'
            }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem' }}>Verifying Transaction</h1>
            <p style={{ color: theme.textSecondary, lineHeight: '1.6' }}>
              Communicating with Khalti secure nodes to confirm your bounty disbursement. Please do not close this window.
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </div>
        )}

        {status === 'success' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ 
              width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 2rem', border: `1px solid ${theme.success}40`, color: theme.success
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: theme.success, marginBottom: '0.75rem' }}>Protocol Verified</h1>
            <p style={{ color: theme.textSecondary, marginBottom: '2.5rem' }}>
              The researcher reward has been successfully processed and recorded.
            </p>
            
            {details && (
              <div style={{ 
                background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '14px', 
                border: `1px solid ${theme.border}`, textAlign: 'left', marginBottom: '2.5rem' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: `1px solid ${theme.border}`, paddingBottom: '0.75rem' }}>
                  <span style={{ color: theme.textSecondary, fontSize: '0.85rem', fontWeight: '600' }}>Amount Distributed</span>
                  <span style={{ fontWeight: '800', color: theme.success, fontSize: '1.1rem' }}>
                    NPR {Number(details.amount).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ color: theme.textSecondary, fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Transaction ID</span>
                  <code style={{ fontSize: '0.85rem', color: theme.primary, wordBreak: 'break-all', fontFamily: 'monospace' }}>{details.transactionId}</code>
                </div>
              </div>
            )}
            <Link to="/dashboard/company" style={{ 
              display: 'block', background: theme.primary, color: 'white', padding: '1rem',
              borderRadius: '12px', textDecoration: 'none', fontWeight: '700', boxShadow: `0 4px 15px rgba(59, 130, 246, 0.4)`
            }}>
              Return to Command Center
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ 
              width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 2rem', border: `1px solid ${theme.error}40`, color: theme.error
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: theme.error, marginBottom: '0.75rem' }}>Transaction Failed</h1>
            <p style={{ color: theme.textSecondary, marginBottom: '2.5rem', lineHeight: '1.6' }}>
              {error}
            </p>
            <Link to="/dashboard/company" style={{ 
              display: 'block', border: `1px solid ${theme.border}`, color: theme.textPrimary,
              padding: '1rem', borderRadius: '12px', textDecoration: 'none', fontWeight: '700',
              background: 'rgba(255,255,255,0.05)'
            }}>
              Return to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerify;