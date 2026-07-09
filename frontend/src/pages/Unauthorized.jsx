import { Link } from 'react-router-dom';

const Unauthorized = () => {
  // ── Premium Theme ──
  const theme = {
    bg: '#0F172A',
    surface: '#162033',
    border: 'rgba(255,255,255,0.08)',
    primary: '#3B82F6',
    error: '#EF4444',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    radius: '24px',
    shadow: '0 20px 50px rgba(0,0,0,0.5)',
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
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Elements */}
      <div style={{ 
        position: 'absolute', 
        top: '10%', 
        left: '10%', 
        width: '300px', 
        height: '300px', 
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05), transparent)', 
        borderRadius: '50%',
        filter: 'blur(60px)'
      }} />
      <div style={{ 
        position: 'absolute', 
        bottom: '10%', 
        right: '10%', 
        width: '400px', 
        height: '400px', 
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.03), transparent)', 
        borderRadius: '50%',
        filter: 'blur(80px)'
      }} />

      <div style={{ 
        maxWidth: '500px', 
        width: '100%',
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: theme.radius,
        padding: '4rem 2.5rem',
        textAlign: 'center',
        boxShadow: theme.shadow,
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(10px)'
      }}>
        {/* Shield Icon Decoration */}
        <div style={{ 
          width: '100px', 
          height: '100px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          borderRadius: '30px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 2.5rem',
          border: `1px solid ${theme.error}30`,
          color: theme.error,
          boxShadow: `0 10px 30px rgba(239, 68, 68, 0.15)`
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>

        <h1 style={{ 
          fontSize: '5rem', 
          fontWeight: '900', 
          margin: '0 0 1rem', 
          letterSpacing: '-0.05em',
          lineHeight: '1',
          background: `linear-gradient(to bottom, ${theme.textPrimary}, ${theme.textSecondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          opacity: 0.2
        }}>
          403
        </h1>
        
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Access <span style={{ color: theme.error }}>Denied</span>
        </h2>
        
        <p style={{ 
          color: theme.textSecondary, 
          fontSize: '1.05rem', 
          lineHeight: '1.6', 
          marginBottom: '3rem',
          maxWidth: '320px',
          margin: '0 auto 3rem'
        }}>
          You do not have the required clearance to access this secure sector of HuntrNepal.
        </p>
        
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: theme.primary,
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '14px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1rem',
            boxShadow: `0 8px 20px rgba(59, 130, 246, 0.3)`,
            transition: theme.transition
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = `0 12px 25px rgba(59, 130, 246, 0.4)`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 8px 20px rgba(59, 130, 246, 0.3)`;
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Return to HQ
        </Link>

        {/* Technical Footer */}
        <div style={{ 
          marginTop: '4rem', 
          paddingTop: '2rem', 
          borderTop: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem'
        }}>
          <div style={{ fontSize: '0.7rem', color: theme.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Error Log: <span style={{ color: theme.error }}>Unauthorized_Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;