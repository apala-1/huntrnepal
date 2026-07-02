import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '3rem' }}>403</h1>
    <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
      You don't have permission to view this page.
    </p>
    <Link to="/" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
      Go Home
    </Link>
  </div>
);

export default Unauthorized;