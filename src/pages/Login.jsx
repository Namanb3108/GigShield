import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminLogin,
  premiumEstimate,
  registerWorker,
  sendWorkerOtp,
  setAdminSession,
  setWorkerSession,
  verifyWorkerOtp,
} from '../api';

const CITIES = ['Mumbai', 'Chennai', 'Delhi', 'Bengaluru', 'Hyderabad'];
const HOURS = ['Less than 20 hrs', '20-40 hrs', '40+ hrs'];
const PLATFORMS = ['Zomato', 'Swiggy', 'Both'];
const DEFAULT_ZONE_BY_CITY = {
  Mumbai: 'Andheri',
  Chennai: 'T.Nagar',
  Delhi: 'Dwarka',
  Bengaluru: 'Koramangala',
  Hyderabad: 'Hitech City',
};

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function hoursToPlan(hours) {
  if (hours.includes('Less')) return 'Basic';
  if (hours.includes('40+')) return 'Premium';
  return 'Standard';
}

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('worker');
  const [tab, setTab] = useState('signin');
  const [screen, setScreen] = useState('form');
  const [form, setForm] = useState({
    phone: '',
    city: '',
    platform: '',
    name: '',
    hours: '',
    email: '',
    password: '',
    org: '',
  });
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [premiumData, setPremiumData] = useState(null);
  const [pendingSession, setPendingSession] = useState(null);

  useEffect(() => {
    if (role === 'worker' && screen === 'success') {
      const timeout = setTimeout(() => navigate('/dashboard'), 900);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [navigate, role, screen]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleOtpChange(value, index) {
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  async function onSendOtp() {
    setError('');
    const phone = normalizePhone(form.phone);
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    if (!form.platform) {
      setError('Select a platform');
      return;
    }
    if (tab === 'register' && (!form.name.trim() || !form.city || !form.hours)) {
      setError('Complete name, city, platform, and weekly hours');
      return;
    }

    setLoading(true);
    try {
      const response = await sendWorkerOtp(phone, form.platform);
      setDemoOtp(response.demo_otp || '');
      setScreen('otp');
    } catch (err) {
      setError(err.message || 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyOtp() {
    setError('');
    const code = otp.join('');
    if (!/^\d{4}$/.test(code)) {
      setError('Enter the 4-digit OTP');
      return;
    }

    const phone = normalizePhone(form.phone);
    setLoading(true);
    try {
      const verified = await verifyWorkerOtp(phone, code);

      if (tab === 'signin') {
        setWorkerSession({ token: verified.token, worker: verified.worker });
        setPendingSession({ token: verified.token, worker: verified.worker });
        setScreen('success');
        return;
      }

      const registered = await registerWorker({
        name: form.name.trim(),
        phone,
        city: form.city,
        platform: form.platform,
        hours: form.hours,
      });

      const worker = {
        id: registered.worker_id || 'W-002',
        name: form.name.trim(),
        phone,
        city: form.city,
        platform: form.platform,
        plan: hoursToPlan(form.hours),
        risk_tier: registered.risk_tier || 'Medium',
      };

      setWorkerSession({ token: verified.token, worker });
      navigate('/onboarding');
      
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  function onPremiumContinue() {
    if (pendingSession) {
      setWorkerSession(pendingSession);
    }
    setScreen('success');
  }

  async function onAdminSignIn() {
    setError('');
    if (!form.email.trim() || !form.password || !form.org) {
      setError('Enter email, password, and organisation');
      return;
    }

    setLoading(true);
    try {
      const response = await adminLogin({
        email: form.email.trim(),
        password: form.password,
        organisation: form.org,
      });
      setAdminSession({ token: response.token, admin: response.admin });
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Admin sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F6F4EE', display: 'flex' }}>
      <div style={{ width: '42%', background: 'linear-gradient(160deg, #0F2340 0%, #1A3557 100%)', padding: '56px 48px', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -70, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,88,26,0.16), transparent 70%)' }} />
        <div style={{ position: 'absolute', left: -60, bottom: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,88,26,0.10), transparent 70%)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 44, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#E8581A', display: 'grid', placeItems: 'center', fontWeight: 800 }}>GS</div>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700 }}>GigShield</div>
              <div style={{ fontSize: 12, opacity: 0.6, letterSpacing: 1 }}>PARAMETRIC INCOME COVER</div>
            </div>
          </div>

          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 42, lineHeight: 1.1, marginBottom: 18 }}>
            Onboard like a product,
            <br />
            not a mockup.
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.72)', maxWidth: 430, marginBottom: 34 }}>
            OTP login, worker registration, AI premium pricing, and insurer sign-in all connect to the FastAPI backend so the experience feels alive from the first screen.
          </p>

          {[
            'Worker OTP and registration through /api/auth',
            'AI premium pricing through /api/policy/premium-estimate',
            '7 disruption inclusions and 9 exclusions in policy view',
            'Admin route ready for live claims, fraud, and payouts',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(232,88,26,0.16)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>
                OK
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.74)' }}>{item}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {['Auto payout', 'Fraud guardrail', 'Worker-first UX'].map((badge) => (
            <div key={badge} style={{ border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999, padding: '8px 12px', fontSize: 12, color: 'rgba(255,255,255,0.72)' }}>
              {badge}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: 450 }}>
          <div style={{ display: 'flex', background: '#ECE7DB', borderRadius: 12, padding: 4, marginBottom: 30 }}>
            {[
              { id: 'worker', label: 'Delivery Partner' },
              { id: 'admin', label: 'Admin / Insurer' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setRole(item.id);
                  setScreen('form');
                  setTab('signin');
                  setError('');
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: 10,
                  padding: '11px 10px',
                  background: role === item.id ? '#fff' : 'transparent',
                  color: role === item.id ? '#0F2340' : '#6B7280',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {role === 'worker' && screen === 'form' ? (
            <>
              <div style={{ display: 'flex', gap: 22, marginBottom: 24, borderBottom: '2px solid #ECE7DB' }}>
                {['signin', 'register'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTab(item)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      paddingBottom: 12,
                      marginBottom: -2,
                      borderBottom: `2px solid ${tab === item ? '#E8581A' : 'transparent'}`,
                      color: tab === item ? '#0F2340' : '#9CA3AF',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {item === 'signin' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: '#0F2340', marginBottom: 8 }}>
                {tab === 'signin' ? 'Welcome back' : 'Create your GigShield account'}
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 26 }}>
                {tab === 'signin'
                  ? 'Use your mobile number to load the worker dashboard.'
                  : 'Register, verify OTP, and see your AI premium before entering the app.'}
              </p>

              {tab === 'register' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <Field label="Full name" value={form.name} onChange={(value) => updateField('name', value)} placeholder="Ravi Kumar" />
                  <Field label="City" type="select" value={form.city} onChange={(value) => updateField('city', value)} options={CITIES} />
                </div>
              ) : null}

              <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 10, marginBottom: 14 }}>
                <Field label="Code" value="+91" readOnly />
                <Field label="Mobile" value={form.phone} onChange={(value) => updateField('phone', value)} placeholder="98765 43210" type="tel" />
              </div>

              <div style={{ marginBottom: 14 }}>
                <Field label="Platform" type="select" value={form.platform} onChange={(value) => updateField('platform', value)} options={PLATFORMS} />
              </div>

              {tab === 'register' ? (
                <div style={{ marginBottom: 14 }}>
                  <Field label="Weekly hours" type="select" value={form.hours} onChange={(value) => updateField('hours', value)} options={HOURS} />
                </div>
              ) : null}

              {error ? <ErrorBanner message={error} /> : null}

              <button type="button" onClick={onSendOtp} disabled={loading} style={primaryButtonStyle}>
                {loading ? 'Sending...' : tab === 'signin' ? 'Send OTP ->' : 'Get OTP and continue ->'}
              </button>
            </>
          ) : null}

          {role === 'worker' && screen === 'otp' ? (
            <>
              <button type="button" onClick={() => setScreen('form')} style={{ border: 'none', background: 'transparent', color: '#6B7280', fontWeight: 700, cursor: 'pointer', marginBottom: 24 }}>
                {'<- Back'}
              </button>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: '#0F2340', marginBottom: 8 }}>Enter OTP</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Sent to +91 {form.phone || '9876543210'}</p>

              <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    value={digit}
                    maxLength={1}
                    onChange={(event) => handleOtpChange(event.target.value, index)}
                    style={{ width: 56, height: 56, borderRadius: 12, border: '1px solid #E7E2D8', textAlign: 'center', fontSize: 24, fontWeight: 700, color: '#0F2340', outline: 'none' }}
                  />
                ))}
              </div>

              <div style={{ marginBottom: 18, padding: 14, borderRadius: 12, background: '#FFF4EE', border: '1px solid #F8D2BF', color: '#C44410', fontSize: 13 }}>
                Demo mode: use OTP <strong>{demoOtp || 'from API response'}</strong>. The backend accepts any 4-digit OTP in the demo route.
              </div>

              {error ? <ErrorBanner message={error} /> : null}

              <button type="button" onClick={onVerifyOtp} disabled={loading} style={primaryButtonStyle}>
                {loading ? 'Verifying...' : 'Verify and continue ->'}
              </button>
            </>
          ) : null}

          {role === 'worker' && screen === 'premium' && premiumData?.success ? (
            <>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: '#0F2340', marginBottom: 8 }}>Your AI premium breakdown</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 22 }}>
                This screen is populated by <code>/api/policy/premium-estimate</code> with plan, zone, city climate, and exposure factors.
              </p>

              <div style={{ background: '#0F2340', borderRadius: 16, padding: '22px 24px', color: '#fff', marginBottom: 18 }}>
                <div style={{ fontSize: 12, letterSpacing: 1.2, fontWeight: 700, color: 'rgba(255,255,255,0.46)', marginBottom: 8 }}>FINAL WEEKLY PREMIUM</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 44, lineHeight: 1 }}>
                  Rs {premiumData.final_weekly_premium}
                  <span style={{ fontSize: 17, opacity: 0.7 }}>/week</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', marginTop: 10 }}>
                  Base {premiumData.plan} plan · Rs {premiumData.base_weekly_premium}/week · {premiumData.model}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 18 }}>
                <PremiumMini label="Recommended plan" value={premiumData.plan} />
                <PremiumMini label="Risk tier" value={pendingSession?.worker?.risk_tier || 'Medium'} />
                <PremiumMini label="Zone" value={DEFAULT_ZONE_BY_CITY[form.city] || 'Andheri'} />
              </div>

              <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, padding: '16px 18px', marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Factor breakdown</div>
                {(premiumData.factors || []).map((factor) => (
                  <div key={factor.name} style={{ padding: '10px 0', borderBottom: '1px solid #F2EBDD' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ fontSize: 13, color: '#374151' }}>{factor.name}</div>
                      <div style={{ fontSize: 13, color: '#0F2340', fontWeight: 700 }}>x{factor.multiplier}</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{factor.detail}</div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={onPremiumContinue} style={primaryButtonStyle}>
                Continue to dashboard {'->'}
              </button>
            </>
          ) : null}

          {role === 'worker' && screen === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px', background: '#DCFCE7', color: '#15803D', display: 'grid', placeItems: 'center', fontSize: 32, fontWeight: 800 }}>OK</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: '#0F2340', marginBottom: 8 }}>You are in</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 18 }}>
                Session created for {(pendingSession?.worker?.name || 'your worker profile')}. Redirecting to the live dashboard now.
              </p>
              <div style={{ marginBottom: 22, background: '#FBFAF6', border: '1px solid #E7E2D8', borderRadius: 14, padding: '16px 18px', textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>Session summary</div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
                  Worker: {pendingSession?.worker?.name || form.name || 'Ravi Kumar'}<br />
                  City: {pendingSession?.worker?.city || form.city || 'Mumbai'}<br />
                  Platform: {pendingSession?.worker?.platform || form.platform || 'Zomato'}<br />
                  Plan: {pendingSession?.worker?.plan || 'Standard'}
                </div>
              </div>
              <button type="button" onClick={() => navigate('/dashboard')} style={primaryButtonStyle}>
                Open dashboard {'->'}
              </button>
            </div>
          ) : null}

          {role === 'admin' ? (
            <>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EAF0F7', borderRadius: 999, padding: '7px 12px', marginBottom: 24 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1A3557' }} />
                <span style={{ fontSize: 12, color: '#1A3557', fontWeight: 700 }}>Insurer-only access</span>
              </div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: '#0F2340', marginBottom: 8 }}>Admin sign in</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
                Connected to <code>/api/auth/admin/login</code> through <code>api.js</code>.
              </p>

              <div style={{ marginBottom: 14 }}>
                <Field label="Work email" value={form.email} onChange={(value) => updateField('email', value)} placeholder="name@insurer.com" type="email" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <Field label="Password" value={form.password} onChange={(value) => updateField('password', value)} placeholder="••••••••" type="password" />
              </div>
              <div style={{ marginBottom: 18 }}>
                <Field label="Organisation" type="select" value={form.org} onChange={(value) => updateField('org', value)} options={['GigShield Underwriters', 'PolicyBase India', 'Bajaj Allianz Partner']} />
              </div>

              {error ? <ErrorBanner message={error} /> : null}

              <button type="button" onClick={onAdminSignIn} disabled={loading} style={{ ...primaryButtonStyle, background: '#0F2340', boxShadow: '0 6px 18px rgba(15,35,64,0.18)' }}>
                {loading ? 'Signing in...' : 'Open admin dashboard ->'}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = 'text', value, onChange, options = [], readOnly = false }) {
  const baseStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid #E7E2D8',
    background: readOnly ? '#F3F1EB' : '#fff',
    color: '#111827',
    fontSize: 14,
    outline: 'none',
  };

  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 11, color: '#8A8F82', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</label>
      {type === 'select' ? (
        <select value={value} onChange={(event) => onChange(event.target.value)} style={baseStyle}>
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange?.(event.target.value)}
          style={baseStyle}
        />
      )}
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div style={{ marginBottom: 14, background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', fontSize: 13 }}>
      {message}
    </div>
  );
}

function PremiumMini({ label, value }) {
  return (
    <div style={{ background: '#FBFAF6', border: '1px solid #E7E2D8', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#0F2340', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const primaryButtonStyle = {
  width: '100%',
  border: 'none',
  borderRadius: 12,
  background: '#E8581A',
  color: '#fff',
  padding: '14px 16px',
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 6px 18px rgba(232,88,26,0.20)',
};
