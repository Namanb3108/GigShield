import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CITIES = ['Mumbai', 'Chennai', 'Delhi', 'Bengaluru', 'Hyderabad'];

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('worker'); // worker | admin
  const [tab, setTab] = useState('signin');   // signin | register
  const [screen, setScreen] = useState('form'); // form | otp | success
  const [form, setForm] = useState({ phone: '', city: '', platform: '', name: '', hours: '', email: '', password: '' });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [lang, setLang] = useState('en');

  const T = {
    en: { welcome: 'Welcome back', sub: 'Sign in with your mobile number', register: 'Create your account', regSub: 'Takes less than 2 minutes' },
    hi: { welcome: 'वापस आपका स्वागत है', sub: 'अपने मोबाइल नंबर से साइन इन करें', register: 'अपना खाता बनाएं', regSub: '2 मिनट से कम समय लगता है' },
  };

  const t = T[lang];

  const handleOtpChange = (val, idx) => {
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 3) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', display: 'flex' }}>
      {/* Left panel — branding */}
      <div style={{
        width: '42%', background: 'linear-gradient(160deg, #0F2340 0%, #1A3557 100%)',
        padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,88,26,0.15) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', left: -40, bottom: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,88,26,0.08) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', position: 'relative', zIndex: 1 }} onClick={() => navigate('/')}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E8581A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M12 2L3 7l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></svg>
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#fff' }}>GigShield</span>
        </div>

        {/* Middle content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 20 }}>
            Your earnings,<br />always protected.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: 40 }}>
            Parametric income insurance for Zomato and Swiggy delivery partners. Triggers automatically. Pays instantly.
          </p>

          {/* Feature list */}
          {[
            { icon: '⚡', text: 'Auto payout — no claim forms' },
            { icon: '🛡', text: '5 disruption triggers monitored 24×7' },
            { icon: '📱', text: 'UPI credit within 3 minutes' },
            { icon: '🤖', text: 'AI-powered fraud protection' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(232,88,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom trust badges */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {['IRDAI Registered', 'SOC 2', 'UPI Secured'].map(b => (
            <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E' }} />
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeUp 0.5s ease' }}>

          {/* Role toggle */}
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 10, padding: 4, marginBottom: 32 }}>
            {[{ id: 'worker', label: 'Delivery Partner' }, { id: 'admin', label: 'Admin / Insurer' }].map(r => (
              <button key={r.id} onClick={() => { setRole(r.id); setScreen('form'); setTab('signin'); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600,
                  background: role === r.id ? '#fff' : 'transparent',
                  color: role === r.id ? '#0F2340' : '#6B7280',
                  boxShadow: role === r.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}
              >{r.label}</button>
            ))}
          </div>

          {/* ── WORKER FORM ── */}
          {role === 'worker' && screen === 'form' && (
            <>
              {/* Signin / Register tabs */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 28, borderBottom: '2px solid #F3F4F6' }}>
                {['signin', 'register'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{
                      background: 'none', border: 'none', paddingBottom: 12, fontSize: 15, fontWeight: 700,
                      color: tab === t ? '#0F2340' : '#9CA3AF',
                      borderBottom: `2px solid ${tab === t ? '#E8581A' : 'transparent'}`,
                      marginBottom: -2, transition: 'all 0.2s',
                    }}
                  >{t === 'signin' ? 'Sign In' : 'Register'}</button>
                ))}
                {/* Language toggle */}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 12 }}>
                  {['en', 'hi'].map(l => (
                    <button key={l} onClick={() => setLang(l)}
                      style={{
                        background: lang === l ? '#E8581A' : 'transparent',
                        border: '1px solid ' + (lang === l ? '#E8581A' : '#E5E7EB'),
                        color: lang === l ? '#fff' : '#6B7280',
                        padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      }}
                    >{l === 'en' ? 'EN' : 'हि'}</button>
                  ))}
                </div>
              </div>

              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: '#0F2340', marginBottom: 6 }}>
                {tab === 'signin' ? t.welcome : t.register}
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
                {tab === 'signin' ? t.sub : t.regSub}
              </p>

              {tab === 'register' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <Field label="Full Name" placeholder="Ravi Kumar" value={form.name} onChange={v => setForm({ ...form, name: v })} />
                  <Field label="City" type="select" value={form.city} onChange={v => setForm({ ...form, city: v })} options={CITIES} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 10, marginBottom: 14 }}>
                <Field label="Code" value="+91" readOnly />
                <Field label="Mobile Number" placeholder="98765 43210" type="tel" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <Field label="Platform" type="select" value={form.platform} onChange={v => setForm({ ...form, platform: v })} options={['Zomato', 'Swiggy', 'Both']} />
              </div>

              {tab === 'register' && (
                <div style={{ marginBottom: 14 }}>
                  <Field label="Weekly Working Hours" type="select" value={form.hours} onChange={v => setForm({ ...form, hours: v })} options={['Less than 20 hrs', '20–40 hrs', '40+ hrs']} />
                </div>
              )}

              <button
                onClick={() => setScreen('otp')}
                style={{
                  width: '100%', background: '#E8581A', border: 'none', color: '#fff',
                  padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                  marginTop: 8, transition: 'background 0.2s', boxShadow: '0 4px 16px rgba(232,88,26,0.25)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#C44410'}
                onMouseLeave={e => e.currentTarget.style.background = '#E8581A'}
              >
                {tab === 'signin' ? 'Send OTP →' : 'Get OTP & Continue →'}
              </button>

              <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                {['Google', 'Facebook'].map(p => (
                  <button key={p} style={{
                    flex: 1, padding: '11px', border: '1px solid #E5E7EB', borderRadius: 8,
                    background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#E8581A'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p === 'Google' ? '#4285F4' : '#1877F2' }} />
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── OTP SCREEN ── */}
          {role === 'worker' && screen === 'otp' && (
            <>
              <button onClick={() => setScreen('form')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, padding: 0, cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: '#0F2340', marginBottom: 8 }}>Enter OTP</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 36 }}>Sent to +91 {form.phone || '98765 43210'}</p>

              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                {otp.map((d, i) => (
                  <input key={i} id={`otp-${i}`} maxLength={1} value={d}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    style={{
                      flex: 1, height: 60, border: '1.5px solid ' + (d ? '#E8581A' : '#E5E7EB'),
                      borderRadius: 10, textAlign: 'center', fontSize: 24, fontWeight: 700,
                      color: '#0F2340', outline: 'none', background: '#fff', transition: 'border-color 0.2s',
                    }}
                  />
                ))}
              </div>

              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>Didn't receive? <span style={{ color: '#E8581A', fontWeight: 600, cursor: 'pointer' }}>Resend in 28s</span></div>

              <button
                onClick={() => setScreen('success')}
                style={{
                  width: '100%', background: '#E8581A', border: 'none', color: '#fff',
                  padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                  transition: 'background 0.2s', boxShadow: '0 4px 16px rgba(232,88,26,0.25)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#C44410'}
                onMouseLeave={e => e.currentTarget.style.background = '#E8581A'}
              >
                Verify & Continue →
              </button>

              <div style={{ marginTop: 24, padding: 16, background: '#FFF4EE', borderRadius: 10, borderLeft: '3px solid #E8581A' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#C44410', marginBottom: 4 }}>Demo Mode</div>
                <div style={{ fontSize: 12, color: '#C44410', opacity: 0.8 }}>Enter any 4 digits and tap Verify to proceed</div>
              </div>
            </>
          )}

          {/* ── SUCCESS / REDIRECT ── */}
          {role === 'worker' && screen === 'success' && (
            <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: '#0F2340', marginBottom: 8 }}>You're in!</h2>
              <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 36 }}>Your GigShield account is active. Redirecting to your dashboard...</p>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  width: '100%', background: '#E8581A', border: 'none', color: '#fff',
                  padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                }}
              >
                Go to Dashboard →
              </button>
            </div>
          )}

          {/* ── ADMIN FORM ── */}
          {role === 'admin' && (
            <>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EBF1F8', borderRadius: 6, padding: '5px 12px', marginBottom: 24 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A3557' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1A3557' }}>Restricted — Insurer / Admin Access</span>
              </div>

              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, color: '#0F2340', marginBottom: 6 }}>Admin Sign In</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Access the GigShield insurer dashboard</p>

              <div style={{ marginBottom: 14 }}><Field label="Work Email" placeholder="name@insurer.com" type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} /></div>
              <div style={{ marginBottom: 14 }}><Field label="Password" type="password" placeholder="••••••••••" value={form.password} onChange={v => setForm({ ...form, password: v })} /></div>
              <div style={{ marginBottom: 20 }}>
                <Field label="Organisation" type="select" value="" onChange={() => {}} options={['GigShield Underwriters', 'PolicyBase India', 'Bajaj Allianz Partner']} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151', marginBottom: 24, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#0F2340', width: 16, height: 16 }} />
                Enable two-factor authentication
              </label>

              <button
                onClick={() => navigate('/admin')}
                style={{
                  width: '100%', background: '#0F2340', border: 'none', color: '#fff',
                  padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1A3557'}
                onMouseLeave={e => e.currentTarget.style.background = '#0F2340'}
              >
                Sign In to Dashboard →
              </button>

              <div style={{ marginTop: 20, padding: 16, background: '#EBF1F8', borderRadius: 10, borderLeft: '3px solid #93B4D9' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3557', marginBottom: 4 }}>Demo: click Sign In to enter admin view</div>
              </div>
            </>
          )}

          {/* Bottom disclaimer */}
          <p style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 32, lineHeight: 1.7 }}>
            By continuing, you agree to GigShield's <span style={{ color: '#E8581A', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: '#E8581A', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = 'text', value, onChange, options = [], readOnly = false }) {
  const base = {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 14,
    color: '#111827', background: readOnly ? '#F3F4F6' : '#fff',
    outline: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif',
    transition: 'border-color 0.2s',
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' }}>{label}</label>
      {type === 'select' ? (
        <div style={{ position: 'relative' }}>
          <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, appearance: 'none', cursor: 'pointer' }}>
            <option value="">Select…</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </div>
      ) : (
        <input
          type={type} placeholder={placeholder} value={value}
          readOnly={readOnly}
          onChange={e => onChange?.(e.target.value)}
          style={base}
          onFocus={e => e.target.style.borderColor = '#E8581A'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        />
      )}
    </div>
  );
}
