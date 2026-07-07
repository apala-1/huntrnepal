import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Home = () => {
  const { user } = useAuth();
  const [hoveredStat, setHoveredStat] = useState(null);

  const heroSectionStyle = {
    position: 'relative',
    padding: '8rem 1.5rem',
    textAlign: 'center',
    background: '#0F172A',
    overflow: 'hidden'
  };

  const decorationBlob1 = {
    position: 'absolute',
    top: '-10%',
    left: '-5%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%)',
    filter: 'blur(60px)',
    zIndex: 0
  };

  const decorationBlob2 = {
    position: 'absolute',
    bottom: '10%',
    right: '-5%',
    width: '350px',
    height: '350px',
    background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(20, 184, 166, 0) 70%)',
    filter: 'blur(60px)',
    zIndex: 0
  };

  const titleStyle = {
    fontSize: '3.5rem',
    fontWeight: 800,
    lineHeight: 1.1,
    color: '#F8FAFC',
    marginBottom: '1.5rem',
    position: 'relative',
    zIndex: 1,
    letterSpacing: '-0.03em'
  };

  const subtitleStyle = {
    color: '#94A3B8',
    maxWidth: '600px',
    margin: '0 auto 2.5rem',
    fontSize: '1.2rem',
    lineHeight: '1.6',
    position: 'relative',
    zIndex: 1
  };

  const primaryBtnStyle = {
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    color: 'white',
    padding: '0.8rem 2rem',
    borderRadius: '10px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
    transition: 'all 0.3s ease',
    display: 'inline-block'
  };

  const outlineBtnStyle = {
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#F8FAFC',
    padding: '0.8rem 2rem',
    borderRadius: '10px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    display: 'inline-block'
  };

  const statsSectionStyle = {
    background: '#0F172A',
    padding: '4rem 1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'relative',
    zIndex: 1
  };

  const statCardStyle = (index) => ({
    background: '#162033',
    padding: '2rem',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    textAlign: 'center',
    flex: 1,
    minWidth: '200px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: hoveredStat === index ? 'translateY(-8px)' : 'translateY(0)',
    boxShadow: hoveredStat === index 
      ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)' 
      : 'none'
  });

  return (
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div style={heroSectionStyle}>
        <div style={decorationBlob1}></div>
        <div style={decorationBlob2}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '0.5rem 1rem', 
            background: 'rgba(59, 130, 246, 0.1)', 
            borderRadius: '100px', 
            border: '1px solid rgba(59, 130, 246, 0.2)',
            color: '#3B82F6',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
          }}>
            Protecting Nepal's Digital Frontier 🇳🇵
          </div>

          <h1 style={titleStyle}>
            The Premier Bug Bounty <br/>
            Platform for <span style={{ color: '#3B82F6' }}>Nepal</span>
          </h1>
          
          <p style={subtitleStyle}>
            Uniting elite security researchers with progressive organizations. 
            Identify vulnerabilities, secure infrastructure, and earn rewards while making the internet safer.
          </p>

          <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
            {user ? (
              <Link to="/programs" style={primaryBtnStyle}>
                Browse Programs →
              </Link>
            ) : (
              <>
                <Link to="/register" style={primaryBtnStyle}>
                  Start Hunting →
                </Link>
                <Link to="/login" style={outlineBtnStyle}>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={statsSectionStyle}>
        <div className="container" style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            { value: 'NPR 50K+', label: 'Paid Out', icon: '💰' },
            { value: '20+', label: 'Programs', icon: '🎯' },
            { value: '100+', label: 'Researchers', icon: '⚡' },
            { value: '150+', label: 'Bugs Fixed', icon: '🛡️' }
          ].map((stat, index) => (
            <div 
              key={stat.label} 
              style={statCardStyle(index)}
              onMouseEnter={() => setHoveredStat(index)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{stat.icon}</div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 800, 
                color: '#F8FAFC',
                marginBottom: '0.25rem',
                letterSpacing: '-0.02em'
              }}>
                {stat.value}
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.875rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;