import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPolicyExclusions } from '../api';

export default function PolicyExclusions() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await getPolicyExclusions();
        if (!cancelled) setData(r);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const inc = data?.inclusions || [];
  const exc = data?.exclusions || [];

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5' }}>
      <div style={{ background: '#0F2340', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E8581A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M12 2L3 7l9 5 9-5-9-5z"/></svg>
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>GigShield</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>/ Coverage & exclusions</span>
        </div>
        <button type="button" onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Back to dashboard</button>
      </div>

      <div className="container" style={{ padding: '48px 24px', maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, color: '#0F2340', marginBottom: 12 }}>What’s covered — and what isn’t</h1>
        <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 40, lineHeight: 1.7 }}>
          Data from <code style={{ background: '#E5E7EB', padding: '2px 6px', borderRadius: 4 }}>GET /api/policy/exclusions</code>. Seven parametric inclusions and nine standard exclusions for GigShield parametric income cover.
        </p>

        {error && <div style={{ padding: 14, background: '#FEF2F2', color: '#991B1B', borderRadius: 8, marginBottom: 24 }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <section style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#15803D', marginBottom: 16 }}>INCLUSIONS (7)</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {inc.map((row) => (
                <li key={row.id} style={{ padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ fontWeight: 700, color: '#0F2340', marginBottom: 4 }}>{row.name}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>Trigger: {row.trigger}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Source: {row.source}</div>
                </li>
              ))}
              {!inc.length && !error && <li style={{ color: '#9CA3AF' }}>Loading…</li>}
            </ul>
          </section>

          <section style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#B91C1C', marginBottom: 16 }}>EXCLUSIONS (9)</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {exc.map((row) => (
                <li key={row.id} style={{ padding: '14px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ fontWeight: 700, color: '#0F2340', marginBottom: 4 }}>{row.name}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{row.reason}</div>
                </li>
              ))}
              {!exc.length && !error && <li style={{ color: '#9CA3AF' }}>Loading…</li>}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
