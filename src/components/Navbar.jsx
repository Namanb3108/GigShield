import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ variant = 'dark' }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isDark = variant === 'dark';
  const bg = isDark
    ? scrolled ? 'rgba(15,35,64,0.97)' : 'transparent'
    : scrolled ? 'rgba(255,255,255,0.97)' : '#fff';
  const textColor = isDark ? '#fff' : '#111827';
  const border = scrolled ? isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E5E7EB' : 'none';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: bg, borderBottom: border,
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      transition: 'all 0.3s ease',
      padding: scrolled ? '14px 0' : '20px 0',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #E8581A, #C44410)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2L3 7l9 5 9-5-9-5z"/>
              <path d="M3 12l9 5 9-5"/>
              <path d="M3 17l9 5 9-5"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: isDark ? '#fff' : '#0F2340', letterSpacing: '-0.03em' }}>
            GigShield
          </span>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { label: 'Product', id: 'product' },
            { label: 'How it Works', id: 'how-it-works' },
            { label: 'Pricing', id: 'pricing' }
          ].map(link => (
            <span key={link.label} style={{
              fontSize: 14, fontWeight: 500,
              color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--gray-500)',
              cursor: 'pointer', transition: 'color 0.2s',
            }}
              onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={e => e.target.style.color = isDark ? '#fff' : '#111827'}
              onMouseLeave={e => e.target.style.color = isDark ? 'rgba(255,255,255,0.7)' : 'var(--gray-500)'}
            >{link.label}</span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none', border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#E5E7EB'}`,
              color: isDark ? '#fff' : '#111827', padding: '9px 20px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#E8581A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#E5E7EB'}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: '#E8581A', border: 'none', color: '#fff',
              padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#C44410'}
            onMouseLeave={e => e.currentTarget.style.background = '#E8581A'}
          >
            Get Protected
          </button>
        </div>
      </div>
    </nav>
  );
}
