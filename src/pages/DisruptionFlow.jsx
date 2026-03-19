import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DISRUPTIONS = [
  { id: 'rain', icon: '🌧', label: 'Heavy Rainfall', city: 'Andheri, Mumbai', reading: '52mm/hr', threshold: '>35mm/hr', color: '#1A3557', payout: 847 },
  { id: 'heat', icon: '🌡', label: 'Extreme Heat', city: 'Dwarka, Delhi', reading: '44°C for 3hrs', threshold: '>42°C 2hrs', color: '#C44410', payout: 610 },
  { id: 'bandh', icon: '🚫', label: 'Local Bandh', city: 'T. Nagar, Chennai', reading: 'Verified bandh', threshold: 'Govt. notification', color: '#7C3AED', payout: 1200 },
];

const STEPS = [
  { id: 0, label: 'Trigger Detected', sub: 'External API threshold breach confirmed', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', duration: 1800 },
  { id: 1, label: 'Claim Initiated', sub: 'Auto-raised — zero worker action', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2', duration: 2000 },
  { id: 2, label: 'Fraud Check', sub: 'GPS validated · No anomalies · Approved', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', duration: 2200 },
  { id: 3, label: 'UPI Payout Sent', sub: 'Credited to registered UPI ID', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6', duration: 0 },
];

export default function DisruptionFlow() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [counter, setCounter] = useState(0);

  const startFlow = (disruption) => {
    setSelected(disruption);
    setRunning(true);
    setStep(0);
    setDone(false);
    setCounter(0);
  };

  useEffect(() => {
    if (!running || step < 0) return;
    if (step >= STEPS.length) { setDone(true); setRunning(false); return; }
    const dur = STEPS[step].duration;
    if (dur === 0) { setDone(true); setRunning(false); return; }
    const t = setTimeout(() => setStep(s => s + 1), dur);
    return () => clearTimeout(t);
  }, [running, step]);

  // Count-up for payout
  useEffect(() => {
    if (!done || !selected) return;
    let start = 0;
    const end = selected.payout;
    const dur = 1200;
    const startTime = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - startTime) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCounter(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [done, selected]);

  const reset = () => { setSelected(null); setRunning(false); setStep(-1); setDone(false); setCounter(0); };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5' }}>
      {/* Top bar */}
      <div style={{ background: '#0F2340', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E8581A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M12 2L3 7l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/></svg>
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>GigShield</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>/ Disruption Simulator</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Worker Dashboard</button>
          <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Admin Dashboard</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#E8581A', marginBottom: 12 }}>LIVE DEMO</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px,5vw,52px)', color: '#0F2340', marginBottom: 16, lineHeight: 1.15 }}>
            Trigger → Claim → Payout
          </h1>
          <p style={{ fontSize: 16, color: '#6B7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
            Select a disruption scenario to see the full automated flow in real time. No human action required.
          </p>
        </div>

        {/* Disruption selector */}
        {!running && !done && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 48 }}>
            {DISRUPTIONS.map((d) => (
              <button key={d.id} onClick={() => startFlow(d)} style={{
                background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 14, padding: '28px 24px',
                textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8581A'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,88,26,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: 36, marginBottom: 14 }}>{d.icon}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#0F2340', marginBottom: 8 }}>{d.label}</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>{d.city}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#E8581A', background: '#FFF4EE', padding: '3px 8px', borderRadius: 4 }}>{d.reading}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', background: '#F3F4F6', padding: '3px 8px', borderRadius: 4 }}>Threshold: {d.threshold}</span>
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F3F4F6', fontSize: 13, fontWeight: 700, color: '#15803D' }}>
                  Estimated payout: ₹{d.payout}
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {/* Running flow */}
        <AnimatePresence>
          {(running || done) && selected && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Trigger banner */}
              <div style={{
                background: '#0F2340', borderRadius: 14, padding: '28px 32px', marginBottom: 32,
                display: 'flex', alignItems: 'center', gap: 20,
              }}>
                <div style={{ fontSize: 40 }}>{selected.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>DISRUPTION DETECTED</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{selected.label}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{selected.city} · {selected.reading} · Threshold: {selected.threshold}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#E8581A', letterSpacing: 1, marginBottom: 4 }}>WORKER AFFECTED</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Ravi Kumar</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Standard Plan · Policy GS-0091</div>
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
                {STEPS.map((s, i) => {
                  const isActive = step === i && running;
                  const isDone = step > i || (done && i === 3);
                  const isPending = step < i && !done;
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0.4, scale: 0.97 }}
                      animate={{ opacity: isPending ? 0.5 : 1, scale: isDone || isActive ? 1 : 0.97 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        background: isDone ? (i === 3 ? '#DCFCE7' : '#fff') : isActive ? '#fff' : '#F9FAFB',
                        border: `1.5px solid ${isDone ? (i === 3 ? '#86EFAC' : '#E8581A') : isActive ? '#E8581A' : '#E5E7EB'}`,
                        borderRadius: 12, padding: '22px 20px', textAlign: 'center',
                        boxShadow: isActive ? '0 4px 20px rgba(232,88,26,0.15)' : 'none',
                        transition: 'all 0.4s',
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isDone ? (i === 3 ? '#15803D' : '#E8581A') : isActive ? 'rgba(232,88,26,0.1)' : '#F3F4F6',
                      }}>
                        {isDone ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : isActive ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8581A" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
                          </motion.div>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d={s.icon}/></svg>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isDone ? (i === 3 ? '#15803D' : '#0F2340') : isActive ? '#0F2340' : '#9CA3AF', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: isDone ? '#6B7280' : '#9CA3AF', lineHeight: 1.4 }}>{s.sub}</div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Payout card */}
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    style={{
                      background: 'linear-gradient(135deg, #0F2340 0%, #1A3557 100%)',
                      borderRadius: 16, padding: '40px 48px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>PAYOUT COMPLETED</div>
                      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 56, fontWeight: 900, color: '#4ADE80', lineHeight: 1 }}>₹{counter}</div>
                      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Credited to Ravi Kumar's UPI</div>
                      <div style={{ marginTop: 16, display: 'flex', gap: 16 }}>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Trigger to payout: <span style={{ color: '#fff', fontWeight: 700 }}>2m 18s</span></div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Claim: <span style={{ color: '#fff', fontWeight: 700 }}>GS-2026-0042</span></div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { label: 'GPS Validated', ok: true },
                        { label: 'Policy Active', ok: true },
                        { label: 'Fraud Score', ok: true, val: '0.12 ✓' },
                        { label: 'Duplicate Check', ok: true },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{item.label}{item.val ? ` — ${item.val}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', gap: 14, marginTop: 28 }}>
                <button onClick={reset} style={{ padding: '12px 24px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#E8581A'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                >← Try Another Scenario</button>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', border: 'none', borderRadius: 8, background: '#0F2340', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Go to Worker Dashboard →</button>
                <button onClick={() => navigate('/admin')} style={{ padding: '12px 24px', border: 'none', borderRadius: 8, background: '#E8581A', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>See Admin View →</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
