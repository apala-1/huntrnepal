import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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
    <div className="card">
      <h2 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        DISCUSSION
      </h2>

      {comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          No comments yet. Start the discussion.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          {comments.map(c => (
            <div key={c.id} style={{
              padding: '0.75rem',
              background: 'var(--bg)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {c.username}
                  <span className={`badge badge-${c.role}`} style={{ marginLeft: '0.5rem' }}>
                    {c.role}
                  </span>
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                {c.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment... (visible to researcher and company)"
            rows={3}
          />
        </div>
        <button type="submit" className="btn btn-outline" 
          style={{ width: 'auto' }} disabled={loading}>
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
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
      // Redirect to Khalti payment page
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      setPayError(err.response?.data?.error || 'Payment initiation failed');
      setPaying(false);
    }
  };

  return (
    <div className="card" style={{ background: 'rgba(34,197,94,0.05)', borderColor: 'var(--success)' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--success)' }}>
        💰 Pay Researcher via Khalti
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Reward amount: <strong style={{ color: 'var(--success)' }}>
          NPR {Number(rewardAmount).toLocaleString()}
        </strong>
      </p>
      {payError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{payError}</div>}
      <button
        className="btn btn-primary"
        onClick={handlePay}
        disabled={paying}
        style={{ background: 'var(--success)' }}
      >
        {paying ? 'Redirecting to Khalti...' : '💳 Pay via Khalti'}
      </button>
    </div>
  );
};

const STATUS_COLORS = {
  pending:  { bg: '#fef9c3', color: '#854d0e' },
  triaging: { bg: '#dbeafe', color: '#1e40af' },
  accepted: { bg: '#dcfce7', color: '#15803d' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
  resolved: { bg: '#f3e8ff', color: '#6b21a8' },
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
      .catch(() => setError('Report not found or access denied'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/reports/${id}/status`, statusUpdate);
      setUpdateMsg('Report updated successfully');
      setReport(prev => ({ ...prev, ...statusUpdate }));
    } catch (err) {
      setUpdateMsg(err.response?.data?.error || 'Update failed');
    }
  };

  if (loading) return (
    <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  );

  if (error) return (
    <div className="container" style={{ padding: '2rem' }}>
      <div className="alert alert-error">{error}</div>
    </div>
  );

  const statusStyle = STATUS_COLORS[report.status] || {};

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <Link 
          to={user?.role === 'company' ? '/dashboard/company' : '/dashboard'}
          style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem' }}
        >
          ← Back to Dashboard
        </Link>
      </div>

      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '1rem 0 2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{report.title}</h1>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`badge badge-${report.severity}`}>
              {report.severity.toUpperCase()}
            </span>
            <span style={{ 
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: statusStyle.bg,
              color: statusStyle.color
            }}>
              {report.status.toUpperCase()}
            </span>
            {report.cvss_score && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                CVSS: {report.cvss_score}
              </span>
            )}
          </div>
        </div>
        {report.reward_amount && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.2rem' }}>
              NPR {Number(report.reward_amount).toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Reward</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Meta */}
        <div className="card">
          <h2 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            REPORT INFO
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: 'Program', value: report.program_title },
              { label: 'Company', value: report.company_name },
              { label: 'Researcher', value: report.researcher_username },
              { label: 'Submitted', value: new Date(report.created_at).toLocaleDateString() },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.label}</span>
                <span style={{ fontSize: '0.875rem' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="card">
          <h2 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            DESCRIPTION
          </h2>
          <p style={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{report.description}</p>
        </div>

        {/* Steps */}
        <div className="card">
          <h2 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            STEPS TO REPRODUCE
          </h2>
          <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {report.steps_to_reproduce}
          </pre>
        </div>

        {/* Impact */}
        <div className="card">
          <h2 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            IMPACT
          </h2>
          <p style={{ lineHeight: 1.8 }}>{report.impact}</p>
        </div>

        {/* Company review panel */}
        {user?.role === 'company' && (
          <div className="card">
            <h2 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              REVIEW THIS REPORT
            </h2>
            {updateMsg && (
              <div className={`alert ${updateMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>
                {updateMsg}
              </div>
            )}
            {/* Payment section */}
            {report.status === 'accepted' && report.reward_amount && (
            <div style={{ marginBottom: '1.5rem' }}>
                <PayButton reportId={id} rewardAmount={report.reward_amount} />
            </div>
            )}
            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label>Update Status</label>
                <select
                  value={statusUpdate.status}
                  onChange={e => setStatusUpdate(p => ({ ...p, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="triaging">Triaging</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label>Reward Amount (NPR)</label>
                <input
                  type="number"
                  min="0"
                  value={statusUpdate.reward_amount}
                  onChange={e => setStatusUpdate(p => ({ ...p, reward_amount: e.target.value }))}
                  placeholder="e.g. 15000"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Update Report
              </button>
            </form>
          </div>
        )}
      </div>
      <CommentsSection reportId={id} userRole={user?.role} />
    </div>
  );
};

export default ReportDetail;