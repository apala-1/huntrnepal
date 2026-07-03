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
      setError('Missing payment parameters');
      return;
    }

    api.get(`/payments/verify?pidx=${pidx}&payment_id=${paymentId}`)
      .then(res => {
        setStatus('success');
        setDetails(res.data);
      })
      .catch(err => {
        setStatus('error');
        setError(err.response?.data?.error || 'Payment verification failed');
      });
  }, [searchParams]);

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '500px', textAlign: 'center' }}>
      {status === 'verifying' && (
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h1>Verifying Payment</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Please wait while we confirm your payment with Khalti...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h1 style={{ color: 'var(--success)' }}>Payment Successful!</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 2rem' }}>
            The reward has been processed via Khalti.
          </p>
          {details && (
            <div className="card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                    NPR {Number(details.amount).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Transaction ID</span>
                  <code style={{ fontSize: '0.8rem' }}>{details.transactionId}</code>
                </div>
              </div>
            </div>
          )}
          <Link to="/dashboard/company" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h1 style={{ color: 'var(--danger)' }}>Payment Failed</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 2rem' }}>
            {error}
          </p>
          <Link to="/dashboard/company" className="btn btn-outline">
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
};

export default PaymentVerify;