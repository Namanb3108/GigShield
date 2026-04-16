import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CountUp from '../components/reactbits/CountUp';
import ScrollReveal from '../components/reactbits/ScrollReveal';
import GradientText from '../components/reactbits/GradientText';

const TRIGGERS = [
  { icon: '🌧', label: 'Heavy Rainfall', desc: '>35mm/hr triggers auto payout', color: '#1A3557' },
  { icon: '🌡', label: 'Extreme Heat', desc: 'Temp >42°C for 2+ hours', color: '#C44410' },
  { icon: '😷', label: 'Severe AQI', desc: 'Air quality index >350', color: '#15803D' },
  { icon: '🚫', label: 'Local Bandh', desc: 'Verified strike / curfew zone', color: '#7C3AED' },
  { icon: '🌊', label: 'Flood Alert', desc: 'IMD flood zone activation', color: '#0369A1' },
];

const STEPS = [
  { num: '01', title: 'Onboard in 2 minutes', desc: 'Enter your city, platform and work hours. Our AI generates your risk profile instantly.' },
  { num: '02', title: 'Choose weekly cover', desc: 'Pick Basic, Standard or Premium. Pay ₹29–₹99/week via UPI. No lock-in.' },
  { num: '03', title: 'We monitor 24×7', desc: 'Weather, AQI, IMD and news feeds watched continuously for your zone.' },
  { num: '04', title: 'Auto payout fired', desc: 'Trigger detected → claim raised → fraud check → UPI credit. Zero action needed.' },
];

const PLANS = [
  { name: 'Basic', price: 29, payout: 500, hours: '<20 hrs/week', color: '#F8F7F5', textColor: '#111827', badge: false },
  { name: 'Standard', price: 59, payout: 1200, hours: '20–40 hrs/week', color: '#0F2340', textColor: '#fff', badge: true },
  { name: 'Premium', price: 99, payout: 2500, hours: '40+ hrs/week', color: '#F8F7F5', textColor: '#111827', badge: false },
];

const CITIES = ['Mumbai', 'Chennai', 'Delhi', 'Bengaluru', 'Hyderabad'];

export default function Landing() {
  const navigate = useNavigate();
  const [activeTrigger, setActiveTrigger] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTrigger(a => (a + 1) % TRIGGERS.length), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: '#F8F7F5', minHeight: '100vh' }}>
      <Navbar variant="dark" />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(160deg, #0F2340 0%, #1A3557 60%, #0F2340 100%)',
        minHeight: '100vh', position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', paddingTop: 100,
      }}>
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Orange accent blob */}
        <div style={{
          position: 'absolute', right: '5%', top: '15%', width: 420, height: 420,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,88,26,0.18) 0%, transparent 70%)',
          zIndex: 1, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '-5%', bottom: '10%', width: 300, height: 300,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,88,26,0.1) 0%, transparent 70%)',
          zIndex: 1, pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
              background: 'rgba(232,88,26,0.15)', border: '1px solid rgba(232,88,26,0.3)',
              borderRadius: 100, padding: '6px 16px',
              animation: 'fadeIn 0.5s ease',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8581A', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#F5C4A8', letterSpacing: 1 }}>GUIDEWIRE DEVTRAILS 2026</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(40px, 5vw, 64px)', fontFamily: 'Fraunces, serif',
              color: '#fff', lineHeight: 1.1, marginBottom: 24,
              animation: 'fadeUp 0.7s ease 0.1s both',
            }}>
              Income protection<br />
              for every <GradientText gradient="linear-gradient(90deg,#E8581A,#ff9a6c)">delivery</GradientText><br />
              partner.
            </h1>

            <p style={{
              fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8,
              maxWidth: 480, marginBottom: 40,
              animation: 'fadeUp 0.7s ease 0.25s both',
            }}>
              Parametric income insurance for Zomato and Swiggy partners. When rain, heat, or a bandh stops your deliveries — GigShield pays you automatically. No forms. No waiting.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', animation: 'fadeUp 0.7s ease 0.4s both' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: '#E8581A', border: 'none', color: '#fff',
                  padding: '14px 32px', borderRadius: 8, fontSize: 15, fontWeight: 700,
                  transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(232,88,26,0.35)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#C44410'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#E8581A'; e.currentTarget.style.transform = 'none'; }}
              >
                Get Protected — ₹29/week
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.85)', padding: '14px 32px', borderRadius: 8,
                  fontSize: 15, fontWeight: 600, transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              >
                See How It Works
              </button>
            </div>

            {/* City pills */}
            <div style={{ marginTop: 40, display: 'flex', gap: 8, flexWrap: 'wrap', animation: 'fadeUp 0.7s ease 0.55s both' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Active in:
              </span>
              {CITIES.map(c => (
                <span key={c} style={{
                  fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(255,255,255,0.07)', borderRadius: 4, padding: '3px 10px',
                }}>{c}</span>
              ))}
            </div>
          </div>

          {/* Right — Live trigger card */}
          <div style={{ animation: 'fadeIn 0.8s ease 0.5s both' }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, padding: 32, backdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 20 }}>LIVE DISRUPTION MONITOR</div>

              {TRIGGERS.map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderRadius: 10, marginBottom: 8, transition: 'all 0.3s',
                  background: activeTrigger === i ? 'rgba(232,88,26,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${activeTrigger === i ? 'rgba(232,88,26,0.3)' : 'rgba(255,255,255,0.05)'}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: activeTrigger === i ? 'rgba(232,88,26,0.2)' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>{t.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: activeTrigger === i ? '#fff' : 'rgba(255,255,255,0.6)' }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{t.desc}</div>
                  </div>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: activeTrigger === i ? '#E8581A' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s',
                    boxShadow: activeTrigger === i ? '0 0 8px #E8581A' : 'none',
                  }} />
                </div>
              ))}

              <div style={{
                marginTop: 20, padding: '16px', borderRadius: 10,
                background: 'rgba(21,128,61,0.12)', border: '1px solid rgba(21,128,61,0.2)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#4ADE80' }}>All systems active</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Monitoring 5 trigger types across 5 cities</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '60px 0', borderBottom: '1px solid #E5E7EB' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { value: 2, suffix: 'M+', label: 'Delivery partners eligible' },
              { value: 99, suffix: '%', label: 'Auto claim accuracy' },
              { value: 3, suffix: ' min', label: 'Average payout time' },
              { value: 5, suffix: '', label: 'Disruption triggers monitored' },
            ].map((stat, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '24px 20px',
                borderRight: i < 3 ? '1px solid #E5E7EB' : 'none',
              }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 42, fontWeight: 900, color: '#0F2340', lineHeight: 1 }}>
                  <CountUp from={0} to={stat.value} suffix={stat.suffix} duration={2} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 8, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 0', background: '#F8F7F5' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#E8581A', marginBottom: 14 }}>HOW IT WORKS</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px,4vw,52px)', color: '#0F2340', marginBottom: 16 }}>
                From disruption to payout<br />in minutes — not days
              </h2>
              <p style={{ fontSize: 16, color: 'var(--gray-500)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
                No paperwork, no claim forms, no phone calls. GigShield runs entirely on verified data.
              </p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {STEPS.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div style={{
                  background: '#fff', borderRadius: 12, padding: 28,
                  border: '1px solid #E5E7EB', height: '100%',
                  transition: 'all 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8581A'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,88,26,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'absolute', top: 20, right: 20, fontFamily: 'Fraunces, serif', fontSize: 48, fontWeight: 900, color: 'rgba(232,88,26,0.06)', lineHeight: 1 }}>{step.num}</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#E8581A', marginBottom: 12 }}>{step.num}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0F2340', marginBottom: 10, lineHeight: 1.3 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Flow arrow row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginTop: 40, overflowX: 'auto', padding: '8px 0' }}>
            {['Trigger Detected', 'Claim Raised', 'Fraud Check', 'UPI Payout ✓'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  background: i === 3 ? '#15803D' : '#0F2340', color: '#fff',
                  padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                }}>{step}</div>
                {i < 3 && (
                  <div style={{ padding: '0 10px', color: '#E8581A' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', background: '#fff' }}>
        <div className="container">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: '#E8581A', marginBottom: 14 }}>PRICING</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px,4vw,52px)', color: '#0F2340', marginBottom: 12 }}>
                Simple. Weekly. Transparent.
              </h2>
              <p style={{ fontSize: 16, color: 'var(--gray-500)' }}>No monthly lock-in. Cancel any time. Pay via UPI.</p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, maxWidth: 900, margin: '0 auto' }}>
            {PLANS.map((plan, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div style={{
                  background: plan.color, border: plan.name === 'Standard' ? '2px solid #E8581A' : '1px solid #E5E7EB',
                  borderRadius: 14, padding: '36px 28px', textAlign: 'center',
                  position: 'relative', transition: 'transform 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  {plan.badge && (
                    <div style={{
                      position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                      background: '#E8581A', color: '#fff', fontSize: 11, fontWeight: 700,
                      padding: '4px 16px', borderRadius: 100, letterSpacing: 0.5,
                    }}>MOST POPULAR</div>
                  )}
                  <div style={{ fontSize: 14, fontWeight: 700, color: plan.textColor === '#fff' ? 'rgba(255,255,255,0.6)' : '#6B7280', marginBottom: 16, letterSpacing: 0.5 }}>{plan.name.toUpperCase()}</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 52, fontWeight: 900, color: plan.textColor, lineHeight: 1 }}>₹{plan.price}</div>
                  <div style={{ fontSize: 13, color: plan.textColor === '#fff' ? 'rgba(255,255,255,0.5)' : '#9CA3AF', marginTop: 4, marginBottom: 24 }}>/week</div>
                  <div style={{ height: 1, background: plan.textColor === '#fff' ? 'rgba(255,255,255,0.1)' : '#E5E7EB', marginBottom: 24 }} />
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: plan.textColor }}>₹{plan.payout.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: plan.textColor === '#fff' ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }}>max weekly payout</div>
                  </div>
                  <div style={{ fontSize: 13, color: plan.textColor === '#fff' ? 'rgba(255,255,255,0.6)' : '#6B7280', marginTop: 12, marginBottom: 28, background: plan.name === 'Standard' ? 'rgba(255,255,255,0.08)' : '#F3F4F6', borderRadius: 6, padding: '6px 12px' }}>
                    {plan.hours}
                  </div>
                  {['5 parametric triggers', 'Auto claim — zero forms', 'UPI payout in minutes', 'AI fraud protection'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: plan.textColor === '#fff' ? 'rgba(255,255,255,0.75)' : '#374151', textAlign: 'left' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.name === 'Standard' ? '#F5C4A8' : '#E8581A'} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      width: '100%', marginTop: 24, padding: '13px',
                      background: plan.name === 'Standard' ? '#E8581A' : 'transparent',
                      border: plan.name === 'Standard' ? 'none' : '1px solid #E8581A',
                      color: plan.name === 'Standard' ? '#fff' : '#E8581A',
                      borderRadius: 8, fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#C44410'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#C44410'; }}
                    onMouseLeave={e => {
                      if (plan.name === 'Standard') { e.currentTarget.style.background = '#E8581A'; e.currentTarget.style.color = '#fff'; }
                      else { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E8581A'; e.currentTarget.style.borderColor = '#E8581A'; }
                    }}
                  >
                    Start {plan.name} Plan
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────── */}
      <section style={{ background: '#0F2340', padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(28px,4vw,48px)', color: '#fff', marginBottom: 16 }}>
              Your earnings deserve protection.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
              Join thousands of delivery partners who never lose income to disruptions they can't control.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#E8581A', border: 'none', color: '#fff',
                padding: '16px 40px', borderRadius: 8, fontSize: 16, fontWeight: 700,
                boxShadow: '0 4px 24px rgba(232,88,26,0.4)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#C44410'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E8581A'; e.currentTarget.style.transform = 'none'; }}
            >
              Get Started Free — ₹29/week
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: '#080F1B', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#E8581A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M12 2L3 7l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/></svg>
            </div>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>GigShield</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2026 GigShield. Built for Guidewire DEVTrails 2026.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy', 'Terms', 'IRDAI'].map(l => (
              <span key={l} style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
