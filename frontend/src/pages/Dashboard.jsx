import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1>Welcome back, {user?.username}! 👋</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Researcher Dashboard — coming soon
      </p>
    </div>
  );
};

export default Dashboard;