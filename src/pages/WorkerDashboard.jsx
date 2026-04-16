import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import CountUp from '../components/reactbits/CountUp';
import ScrollReveal from '../components/reactbits/ScrollReveal';
import {
  clearWorkerSession,
  getTriggerStatusCity,
  getWorkerClaims,
  getWorkerPayouts,
  getWorkerPolicy,
  getWorkerSession,
} from '../api';

const TRIGGER_KEYS = [
  { key: 'heavy_rain', name: 'Heavy Rainfall' },
  { key: 'extreme_heat', name: 'Extreme Heat' },
  { key: 'severe_aqi', name: 'Severe AQI' },
  { key: 'flood_alert', name: 'Flood Alert' },
  { key: 'bandh_strike', name: 'Local Bandh' },
  { key: 'night_curfew', name: 'Night Shift Safety' },
  { key: 'app_downtime', name: 'Platform Downtime' },
];

const STATUS_META = {
  clear: { label: 'Clear', color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' },
  warning: { label: 'Watch', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' },
  active: { label: 'Triggered', color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5' },
};

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function triggerStatus(trigger) {
  if (trigger?.active) return 'active';
  const reading = String(trigger?.reading || '').toLowerCase();
  if (reading.includes('no ') || reading.includes('operational')) return 'clear';
  return 'warning';
}

function humanizeTriggerName(key) {
  return String(key || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildActivitySeries(claims, payouts) {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - offset));
    const iso = date.toISOString().slice(0, 10);
    const dayLabel = date.toLocaleDateString('en-IN', { weekday: 'short' });
    const dailyClaims = claims.filter((claim) => String(claim.created_at || '').slice(0, 10) === iso);
    const dailyPayouts = payouts.filter((payout) => String(payout.paid_at || '').slice(0, 10) === iso);
    const protectedAmount = dailyPayouts.reduce((sum, payout) => sum + Number(payout.amount || 0), 0);
    return {
      day: dayLabel,
      claims: dailyClaims.length,
      protected: protectedAmount,
      exposure: protectedAmount > 0 ? protectedAmount : dailyClaims.length * 280,
    };
  });
}

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [session, setSession] = useState(null);
  const [policyRes, setPolicyRes] = useState(null);
  const [claimsRes, setClaimsRes] = useState(null);
  const [payoutsRes, setPayoutsRes] = useState(null);
  const [cityTriggers, setCityTriggers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const saved = getWorkerSession();
    if (!saved?.worker) {
      navigate('/login');
      return;
    }
    setSession(saved);

    const workerId = saved.worker.id || saved.worker.worker_id || 'W-001';
    const city = saved.worker.city || 'Mumbai';

    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [policy, claims, payouts, triggers] = await Promise.all([
          getWorkerPolicy(workerId).catch(() => null),
          getWorkerClaims(workerId),
          getWorkerPayouts(workerId),
          getTriggerStatusCity(city).catch(() => null),
        ]);
        if (!cancelled) {
          setPolicyRes(policy);
          setClaimsRes(claims);
          setPayoutsRes(payouts);
          setCityTriggers(triggers);
        }
      } catch (error) {
        if (!cancelled) setLoadError(error.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const worker = session?.worker;
  const policy = policyRes?.policy;
  const claims = claimsRes?.claims || [];
  const payouts = payoutsRes?.payouts || [];

  const triggerRows = useMemo(() => {
    const triggerMap = cityTriggers?.triggers || {};
    return TRIGGER_KEYS.map((item) => {
      const current = triggerMap[item.key];
      const status = triggerStatus(current);
      return {
        key: item.key,
        name: item.name,
        status,
        reading: current?.reading || '--',
        threshold: current?.threshold || '--',
        meta: STATUS_META[status],
      };
    });
  }, [cityTriggers]);

  const activitySeries = useMemo(
    () => buildActivitySeries(claims, payouts),
    [claims, payouts],
  );

  const activeTriggerCount = triggerRows.filter((item) => item.status === 'active').length;
  const watchTriggerCount = triggerRows.filter((item) => item.status === 'warning').length;
  const totalPaidOut = payoutsRes?.total_amount ?? claimsRes?.total_paid ?? 0;
  const avgPayout = payouts.length ? Math.round(totalPaidOut / payouts.length) : 0;
  const latestClaim = claims[0] || null;
  const latestPayout = payouts[0] || null;
  const initial = (worker?.name || 'P').trim().charAt(0).toUpperCase();

  const signOut = () => {
    clearWorkerSession();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F6F4EE', display: 'flex' }}>
      <aside
        style={{
          width: 248,
          background: '#0B1526',
          display: 'flex',
          flexDirection: 'column',
          padding: '28px 0',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 20,
        }}
      >
        <div style={{ padding: '0 24px', marginBottom: 36, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#E8581A', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800 }}>
            GS
          </div>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: '#fff', fontWeight: 700 }}>GigShield</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>PARTNER APP</div>
          </div>
        </div>

        <div style={{ padding: '0 24px 20px', marginBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#E8581A', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, marginBottom: 10 }}>
            {initial}
          </div>
          <div style={{ fontSize: 15, color: '#fff', fontWeight: 700 }}>{worker?.name || 'Delivery Partner'}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
            {(worker?.platform || '--')} · {(worker?.city || '--')}
          </div>
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(21,128,61,0.16)', borderRadius: 999, padding: '5px 10px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: 11, color: '#86EFAC', fontWeight: 700 }}>{policy?.plan || worker?.plan || 'Standard'} cover active</span>
          </div>
        </div>

        {[
          { id: 'overview', label: 'Overview' },
          { id: 'triggers', label: 'Trigger Monitor' },
          { id: 'claims', label: 'Claims & Payouts' },
          { id: 'policy', label: 'Policy Snapshot' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 24px',
              border: 'none',
              background: activeTab === item.id ? 'rgba(232,88,26,0.12)' : 'transparent',
              borderLeft: `3px solid ${activeTab === item.id ? '#E8581A' : 'transparent'}`,
              color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.56)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => navigate('/policy')}
          style={{ marginTop: 10, width: '100%', textAlign: 'left', padding: '12px 24px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.56)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          Coverage & exclusions
        </button>
        <button
          type="button"
          onClick={() => navigate('/forecast')}
          style={{ width: '100%', textAlign: 'left', padding: '12px 24px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.56)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
        >
          7-day forecast
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ padding: '0 16px' }}>
          <button
            type="button"
            onClick={() => navigate('/disruption')}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(232,88,26,0.28)', background: 'rgba(232,88,26,0.12)', color: '#F8D2BF', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 10 }}
          >
            Simulate payout flow
          </button>
          <button
            type="button"
            onClick={signOut}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 248, flex: 1, padding: '36px 40px' }}>
        {loadError ? (
          <div style={{ marginBottom: 18, background: '#FEF2F2', color: '#991B1B', borderRadius: 12, padding: 14, border: '1px solid #FECACA' }}>
            {loadError}
          </div>
        ) : null}
        {loading ? (
          <div style={{ marginBottom: 20, color: '#6B7280', fontSize: 14 }}>Loading live worker data from localhost:8000...</div>
        ) : null}

        {activeTab === 'overview' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, gap: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, color: '#E8581A', marginBottom: 10 }}>LIVE PROTECTION DESK</div>
                <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, color: '#0F2340', marginBottom: 6 }}>
                  Earnings shield for {worker?.name?.split(' ')[0] || 'you'}
                </h1>
                <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 720 }}>
                  This view is now driven by your worker policy, claims, payouts, and city trigger feeds instead of placeholder cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/disruption')}
                style={{ background: '#E8581A', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 18px rgba(232,88,26,0.22)' }}
              >
                Run disruption demo
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 18, marginBottom: 24 }}>
              {[
                { label: 'Paid out to you', value: totalPaidOut, prefix: 'Rs ', note: `${payouts.length} successful payout(s)`, color: '#15803D' },
                { label: 'Weekly premium', value: policy?.weekly_premium ?? session?.premium?.final_weekly_premium ?? 59, prefix: 'Rs ', note: policy?.id ? `Policy ${policy.id}` : 'Current active rate', color: '#0F2340' },
                { label: 'Claims created', value: claims.length, note: latestClaim ? `Latest ${formatDate(latestClaim.created_at)}` : 'No claims yet', color: '#B45309' },
                { label: 'Risk in your city', value: activeTriggerCount, note: `${watchTriggerCount} additional monitor(s) on watch`, color: '#B91C1C' },
              ].map((card, index) => (
                <ScrollReveal key={card.label} delay={index * 0.05}>
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E7E2D8', padding: '20px 22px' }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 10 }}>{card.label}</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 31, lineHeight: 1, color: card.color }}>
                      {card.prefix || ''}
                      <CountUp to={Number(card.value || 0)} duration={1.2} separator="," />
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, color: '#7C8574' }}>{card.note}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 22, marginBottom: 24 }}>
              <ScrollReveal>
                <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontSize: 16, color: '#0F2340', fontWeight: 700 }}>Protection activity, last 7 days</h3>
                      <p style={{ marginTop: 4, fontSize: 13, color: '#8A8F82' }}>Derived from claims and payout history for your worker ID.</p>
                    </div>
                    <div style={{ fontSize: 12, color: '#8A8F82' }}>Avg payout {formatCurrency(avgPayout)}</div>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={activitySeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEE7DA" />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#8A8F82' }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fontSize: 12, fill: '#8A8F82' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Protected amount']} />
                      <Area type="monotone" dataKey="exposure" stroke="#0F2340" fill="rgba(15,35,64,0.08)" strokeWidth={2} />
                      <Area type="monotone" dataKey="protected" stroke="#E8581A" fill="rgba(232,88,26,0.18)" strokeWidth={2.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.08}>
                <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, padding: 24 }}>
                  <h3 style={{ fontSize: 16, color: '#0F2340', fontWeight: 700, marginBottom: 4 }}>Current watchtower</h3>
                  <p style={{ fontSize: 13, color: '#8A8F82', marginBottom: 18 }}>{cityTriggers?.city || worker?.city || '--'} trigger feed</p>
                  {triggerRows.slice(0, 4).map((item) => (
                    <div key={item.key} style={{ border: `1px solid ${item.meta.border}`, background: item.meta.bg, borderRadius: 12, padding: '12px 14px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 13, color: '#0F2340', fontWeight: 700 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{item.reading}</div>
                        </div>
                        <span style={{ padding: '4px 8px', borderRadius: 999, background: '#fff', color: item.meta.color, fontSize: 11, fontWeight: 700 }}>
                          {item.meta.label}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setActiveTab('triggers')}
                    style={{ width: '100%', marginTop: 4, padding: '11px 14px', borderRadius: 10, background: '#0F2340', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Open full trigger monitor
                  </button>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                <InfoCard title="Last claim" value={latestClaim ? humanizeTriggerName(latestClaim.trigger_type) : 'No claims yet'} detail={latestClaim ? `${formatDate(latestClaim.created_at)} · ${latestClaim.status}` : 'Your next disruption will auto-initiate a claim.'} />
                <InfoCard title="Last payout" value={latestPayout ? formatCurrency(latestPayout.amount) : 'No payouts yet'} detail={latestPayout ? `${latestPayout.time_to_pay || '--'} · ${formatDate(latestPayout.paid_at)}` : 'Payouts land here once a claim is approved.'} />
                <InfoCard title="Renewal" value={formatDate(policy?.renewal_date)} detail={policy ? `${policy.plan} plan · max payout ${formatCurrency(policy.max_payout)}` : 'No policy returned for this worker ID.'} />
              </div>
            </ScrollReveal>
          </>
        ) : null}

        {activeTab === 'triggers' ? (
          <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, padding: 26 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: '#0F2340', marginBottom: 8 }}>All 7 trigger monitors</h2>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>
              Connected to <code>/api/triggers/status/{cityTriggers?.city || worker?.city || 'Mumbai'}</code>
            </p>
            <div style={{ display: 'grid', gap: 12 }}>
              {triggerRows.map((item) => (
                <div key={item.key} style={{ border: `1px solid ${item.meta.border}`, background: '#FCFBF8', borderRadius: 14, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F2340', marginBottom: 5 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>Reading: {item.reading}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Threshold: {item.threshold}</div>
                  </div>
                  <div style={{ alignSelf: 'center', padding: '6px 10px', borderRadius: 999, background: item.meta.bg, color: item.meta.color, fontWeight: 700, fontSize: 11 }}>
                    {item.meta.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === 'claims' ? (
          <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid #EFE7D9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: '#0F2340', marginBottom: 6 }}>Claims and payouts</h2>
                <p style={{ fontSize: 14, color: '#6B7280' }}>
                  {claimsRes?.total_claims || 0} claims · {formatCurrency(claimsRes?.total_paid || payoutsRes?.total_amount || 0)} protected so far
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/disruption')}
                style={{ background: '#E8581A', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 16px', fontWeight: 700, cursor: 'pointer' }}
              >
                Create new demo claim
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FBFAF6' }}>
                  {['Claim ID', 'Event', 'Zone', 'Created', 'Amount', 'Status'].map((heading) => (
                    <th key={heading} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, letterSpacing: 1, color: '#8A8F82', textTransform: 'uppercase' }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim.id} style={{ borderTop: '1px solid #F1EBDF' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: 12, color: '#0F2340' }}>{claim.id}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#374151', fontWeight: 600 }}>{humanizeTriggerName(claim.trigger_type)}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#6B7280' }}>{claim.zone}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#6B7280' }}>{formatDate(claim.created_at)}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#15803D', fontWeight: 700 }}>{formatCurrency(claim.amount)}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '5px 10px', borderRadius: 999, background: claim.status === 'paid' ? '#DCFCE7' : '#FEF3C7', color: claim.status === 'paid' ? '#15803D' : '#B45309', fontSize: 11, fontWeight: 700 }}>
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!claims.length ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 24, color: '#9CA3AF' }}>No claims found for this worker yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}

        {activeTab === 'policy' ? (
          <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, padding: 26 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: '#0F2340', marginBottom: 10 }}>Policy snapshot</h2>
            {policy ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
                <PolicyItem label="Policy ID" value={policy.id} />
                <PolicyItem label="Plan" value={policy.plan} />
                <PolicyItem label="Weekly premium" value={formatCurrency(policy.weekly_premium)} />
                <PolicyItem label="Max payout" value={formatCurrency(policy.max_payout)} />
                <PolicyItem label="Status" value={policy.status} />
                <PolicyItem label="Renewal date" value={formatDate(policy.renewal_date)} />
                <PolicyItem label="City / zone" value={`${policy.city} · ${policy.zone}`} />
                <PolicyItem label="Total paid in / out" value={`${formatCurrency(policy.total_paid_in)} / ${formatCurrency(policy.total_paid_out)}`} />
              </div>
            ) : (
              <p style={{ color: '#6B7280', marginBottom: 18 }}>
                No policy was returned for this worker ID. The login flow still works, but the backend demo dataset only contains policies for specific worker IDs like <code>W-001</code>.
              </p>
            )}
            <button
              type="button"
              onClick={() => navigate('/policy')}
              style={{ marginTop: 22, background: '#E8581A', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}
            >
              View inclusions and exclusions
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function InfoCard({ title, value, detail }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', marginBottom: 12 }}>{title}</div>
      <div style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: '#0F2340', marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{detail}</div>
    </div>
  );
}

function PolicyItem({ label, value }) {
  return (
    <div style={{ background: '#FBFAF6', border: '1px solid #F1EBDF', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 15, color: '#0F2340', fontWeight: 700 }}>{value}</div>
    </div>
  );
}
