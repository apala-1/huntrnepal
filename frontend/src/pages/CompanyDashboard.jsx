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
      setMessage(err.response?.data?.error || 'Failed to delete program');
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Company Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            {user?.username}
          </p>
        </div>
        <Link to="/programs/create" className="btn btn-primary" style={{ width: 'auto' }}>
          + New Program
        </Link>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Active Programs', value: programs.filter(p => p.is_active).length, color: 'var(--primary)' },
          { label: 'Total Reports', value: reports.length, color: 'var(--text)' },
          { label: 'Needs Review', value: pendingCount, color: 'var(--warning)' },
          { label: 'Resolved', value: reports.filter(r => r.status === 'resolved').length, color: 'var(--success)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.3rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1px' }}>
        {['reports', 'programs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.95rem',
              textTransform: 'capitalize'
            }}
          >
            {tab} {tab === 'reports' && pendingCount > 0 && (
              <span style={{ 
                background: 'var(--warning)',
                color: 'white',
                borderRadius: '999px',
                padding: '0.1rem 0.4rem',
                fontSize: '0.7rem',
                marginLeft: '0.3rem'
              }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading...</p>
      ) : activeTab === 'reports' ? (
        <div className="card">
          {reports.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No reports yet. Create a program to get started.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reports.map(report => (
                <Link 
                  key={report.id} 
                  to={`/reports/${report.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ 
                    padding: '1rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: '0.3rem' }}>
                        {report.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        by {report.researcher_username} · {report.program_title}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <span className={`badge badge-${report.severity}`}>{report.severity}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          {programs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No programs yet.</p>
              <Link to="/programs/create" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
                Create First Program
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
{programs.map(program => (
  <div key={program.id} style={{ 
    padding: '1rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <div>
      <div style={{ fontWeight: 500, marginBottom: '0.3rem' }}>{program.title}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        {program.report_count} reports · NPR {Number(program.min_reward).toLocaleString()} – {Number(program.max_reward).toLocaleString()}
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span className={`badge ${program.is_active ? 'badge-info' : 'badge-medium'}`}>
        {program.is_active ? 'Active' : 'Inactive'}
      </span>
      <Link 
        to={`/programs/${program.id}/edit`}
        style={{
          padding: '0.3rem 0.75rem',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.8rem'
        }}
      >
        Edit
      </Link>
      <button
        onClick={() => handleDeleteProgram(program.id, program.title)}
        style={{
          padding: '0.3rem 0.75rem',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius)',
          background: 'transparent',
          color: 'var(--danger)',
          cursor: 'pointer',
          fontSize: '0.8rem'
        }}
      >
        Delete
      </button>
    </div>
  </div>
))}            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;