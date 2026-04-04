import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import CountUp from '../components/reactbits/CountUp';
import ScrollReveal from '../components/reactbits/ScrollReveal';
import {
  clearAdminSession,
  getAdminSession,
  getAllClaims,
  getAllPolicies,
  getAllPayouts,
  getFraudFlags,
  getFraudStats,
  getPayoutStats,
  resolveFraudFlag,
} from '../api';

const PIE_COLORS = ['#0F2340', '#E8581A', '#15803D', '#B45309', '#BE185D', '#2563EB', '#7C3AED'];
const RISK_META = {
  high: { color: '#B91C1C', bg: '#FEE2E2' },
  medium: { color: '#B45309', bg: '#FEF3C7' },
  low: { color: '#15803D', bg: '#DCFCE7' },
};

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

function monthKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-IN', { month: 'short' });
}

function humanizeTriggerName(key) {
  return String(key || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildClaimTrend(claims) {
  const months = new Map();
  claims.forEach((claim) => {
    const key = monthKey(claim.created_at);
    if (!months.has(key)) {
      months.set(key, { month: key, claims: 0, payouts: 0 });
    }
    const row = months.get(key);
    row.claims += 1;
    if (claim.status === 'paid') row.payouts += Number(claim.amount || 0);
  });
  return Array.from(months.values());
}

function buildCityRows(policies, claims, payouts) {
  const cityMap = new Map();

  policies.forEach((policy) => {
    const city = policy.city || 'Unknown';
    if (!cityMap.has(city)) {
      cityMap.set(city, { city, policies: 0, claims: 0, paid: 0, premium: 0 });
    }
    const row = cityMap.get(city);
    row.policies += 1;
    row.premium += Number(policy.weekly_premium || 0);
  });

  claims.forEach((claim) => {
    const city = claim.city || 'Unknown';
    if (!cityMap.has(city)) {
      cityMap.set(city, { city, policies: 0, claims: 0, paid: 0, premium: 0 });
    }
    const row = cityMap.get(city);
    row.claims += 1;
  });

  payouts.forEach((payout) => {
    const triggerText = String(payout.trigger || '');
    const city = triggerText.includes('—') ? triggerText.split('—').pop().trim() : 'Unknown';
    if (!cityMap.has(city)) {
      cityMap.set(city, { city, policies: 0, claims: 0, paid: 0, premium: 0 });
    }
    const row = cityMap.get(city);
    row.paid += Number(payout.amount || 0);
  });

  return Array.from(cityMap.values()).map((row) => {
    const avgPremium = row.policies ? row.premium / row.policies : 0;
    const lossRatio = avgPremium ? Math.min(999, Math.round((row.paid / avgPremium) * 100)) : 0;
    const risk = lossRatio > 250 || row.claims >= 2 ? 'high' : lossRatio > 120 || row.claims === 1 ? 'medium' : 'low';
    return { ...row, avgPremium: Math.round(avgPremium), lossRatio, risk };
  }).sort((a, b) => b.lossRatio - a.lossRatio);
}

function buildTriggerMix(claims) {
  const totals = new Map();
  claims.forEach((claim) => {
    const key = humanizeTriggerName(claim.trigger_type);
    totals.set(key, (totals.get(key) || 0) + 1);
  });
  const totalClaims = claims.length || 1;
  return Array.from(totals.entries()).map(([name, count], index) => ({
    name,
    value: Math.round((count / totalClaims) * 100),
    rawCount: count,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('overview');
  const [policies, setPolicies] = useState(null);
  const [claims, setClaims] = useState(null);
  const [payouts, setPayouts] = useState(null);
  const [fraud, setFraud] = useState(null);
  const [fraudStats, setFraudStats] = useState(null);
  const [payoutStats, setPayoutStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!getAdminSession()?.admin) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [policyRes, claimRes, payoutRes, fraudRes, fraudStatsRes, payoutStatsRes] = await Promise.all([
          getAllPolicies(),
          getAllClaims(),
          getAllPayouts(),
          getFraudFlags(),
          getFraudStats(),
          getPayoutStats(),
        ]);
        if (!cancelled) {
          setPolicies(policyRes);
          setClaims(claimRes);
          setPayouts(payoutRes);
          setFraud(fraudRes);
          setFraudStats(fraudStatsRes);
          setPayoutStats(payoutStatsRes);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load admin dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (activeNav === 'forecasting') navigate('/forecast');
  }, [activeNav, navigate]);

  const claimRows = claims?.claims || [];
  const payoutRows = payouts?.payouts || [];
  const policyRows = policies?.policies || [];
  const fraudRows = fraud?.flags || [];

  const claimTrend = useMemo(() => buildClaimTrend(claimRows), [claimRows]);
  const cityRows = useMemo(() => buildCityRows(policyRows, claimRows, payoutRows), [policyRows, claimRows, payoutRows]);
  const triggerMix = useMemo(() => buildTriggerMix(claimRows), [claimRows]);

  const paidClaims = claimRows.filter((claim) => claim.status === 'paid').length;
  const flaggedPending = fraudRows.filter((item) => item.status === 'pending_review').length;
  const lossRatio = policies?.total ? Math.round(((payouts?.total_amount || 0) / Math.max(1, policyRows.reduce((sum, item) => sum + Number(item.weekly_premium || 0), 0))) * 100) : 0;

  async function onResolve(flagId, action) {
    setBusy(`${flagId}:${action}`);
    try {
      await resolveFraudFlag(flagId, action);
      setFraud(await getFraudFlags());
    } catch (err) {
      setError(err.message || 'Unable to resolve fraud flag');
    } finally {
      setBusy('');
    }
  }

  function signOut() {
    clearAdminSession();
    navigate('/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F6F4EE', display: 'flex' }}>
      <aside style={{ width: 248, background: '#08111D', display: 'flex', flexDirection: 'column', padding: '28px 0', position: 'fixed', top: 0, left: 0, bottom: 0 }}>
        <div style={{ padding: '0 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#E8581A', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>GS</div>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: '#fff', fontWeight: 700 }}>GigShield</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>INSURER OPS</div>
            </div>
          </div>
        </div>

        {[
          { id: 'overview', label: 'Overview' },
          { id: 'claims', label: 'Claims' },
          { id: 'policies', label: 'Policies' },
          { id: 'fraud', label: 'Fraud Queue', badge: flaggedPending },
          { id: 'forecasting', label: 'Forecasting' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveNav(item.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 24px',
              border: 'none',
              background: activeNav === item.id ? 'rgba(232,88,26,0.12)' : 'transparent',
              borderLeft: `3px solid ${activeNav === item.id ? '#E8581A' : 'transparent'}`,
              color: activeNav === item.id ? '#fff' : 'rgba(255,255,255,0.56)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{item.label}</span>
            {item.badge ? (
              <span style={{ minWidth: 20, height: 20, borderRadius: 999, background: '#B91C1C', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ padding: '0 16px' }}>
          <button type="button" onClick={signOut} style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'rgba(255,255,255,0.64)', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 248, flex: 1, padding: '36px 40px' }}>
        {error ? <div style={{ marginBottom: 18, background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 12, padding: 14 }}>{error}</div> : null}
        {loading ? <div style={{ marginBottom: 18, color: '#6B7280', fontSize: 14 }}>Loading insurer data from localhost:8000...</div> : null}

        {activeNav === 'overview' ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18, marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 12, color: '#E8581A', letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>LIVE PORTFOLIO MONITOR</div>
                <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, color: '#0F2340', marginBottom: 6 }}>Admin dashboard with real aggregates</h1>
                <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 760 }}>
                  Claims, fraud, payouts, trigger mix, and city performance below are derived from backend route data rather than static showcase datasets.
                </p>
              </div>
              <button type="button" onClick={() => navigate('/forecast')} style={{ background: '#0F2340', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>
                Open 7-day forecast
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Active policies', value: policies?.active || 0, color: '#0F2340' },
                { label: 'Claims ingested', value: claims?.total_claims || 0, color: '#E8581A' },
                { label: 'Paid claims', value: paidClaims, color: '#15803D' },
                { label: 'Portfolio loss ratio', value: lossRatio, color: '#B45309', suffix: '%' },
                { label: 'Fraud pending', value: flaggedPending, color: '#B91C1C' },
              ].map((item, index) => (
                <ScrollReveal key={item.label} delay={index * 0.04}>
                  <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.1, fontWeight: 700, marginBottom: 8 }}>{item.label}</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: 30, color: item.color }}>
                      <CountUp to={Number(item.value || 0)} suffix={item.suffix || ''} duration={1.2} separator="," />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: 22, marginBottom: 24 }}>
              <ScrollReveal>
                <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F2340' }}>Claims and payout trend</h3>
                      <p style={{ marginTop: 4, fontSize: 13, color: '#8A8F82' }}>Grouped by claim creation month from the claims dataset.</p>
                    </div>
                    <div style={{ fontSize: 12, color: '#8A8F82' }}>
                      {payoutStats ? `${payoutStats.success_rate} success · avg time ${payoutStats.avg_time_to_pay}` : ''}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={claimTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEE7DA" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8A8F82' }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#8A8F82' }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#8A8F82' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                      <Tooltip formatter={(value, name) => [name === 'payouts' ? formatCurrency(value) : value, name === 'payouts' ? 'Paid out' : 'Claims']} />
                      <Bar yAxisId="left" dataKey="claims" fill="#0F2340" radius={[5, 5, 0, 0]} />
                      <Bar yAxisId="right" dataKey="payouts" fill="#E8581A" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.08}>
                <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F2340', marginBottom: 4 }}>Trigger composition</h3>
                  <p style={{ fontSize: 13, color: '#8A8F82', marginBottom: 16 }}>Share of claims by disruption type.</p>
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie data={triggerMix} cx="50%" cy="50%" innerRadius={52} outerRadius={84} dataKey="value" paddingAngle={2}>
                        {triggerMix.map((entry, index) => (
                          <Cell key={entry.name} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, _name, meta) => [`${value}% (${meta?.payload?.rawCount || 0} claims)`, meta?.payload?.name || 'Trigger']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {triggerMix.slice(0, 4).map((entry) => (
                      <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color }} />
                          <span style={{ fontSize: 13, color: '#374151' }}>{entry.name}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#8A8F82', fontWeight: 700 }}>{entry.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal>
              <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #EFE7D9' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F2340' }}>City portfolio heatmap</h3>
                  <p style={{ marginTop: 4, fontSize: 13, color: '#8A8F82' }}>Joined from policy, claim, and payout datasets.</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FBFAF6' }}>
                      {['City', 'Policies', 'Claims', 'Paid out', 'Loss ratio', 'Risk'].map((heading) => (
                        <th key={heading} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#8A8F82' }}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cityRows.map((row) => (
                      <tr key={row.city} style={{ borderTop: '1px solid #F1EBDF' }}>
                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#0F2340', fontWeight: 700 }}>{row.city}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13 }}>{row.policies}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13 }}>{row.claims}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#15803D', fontWeight: 700 }}>{formatCurrency(row.paid)}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13 }}>{row.lossRatio}%</td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ padding: '5px 10px', borderRadius: 999, background: RISK_META[row.risk].bg, color: RISK_META[row.risk].color, fontSize: 11, fontWeight: 700 }}>
                            {row.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div style={{ background: '#fff', border: '1px solid #F5D5D5', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', background: '#FFF5F5', borderBottom: '1px solid #F5D5D5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 16, color: '#991B1B', fontWeight: 700 }}>Fraud queue snapshot</h3>
                    <p style={{ marginTop: 4, fontSize: 13, color: '#B91C1C' }}>
                      {fraudStats ? `${fraudStats.model_accuracy} model accuracy · avg ${fraudStats.avg_check_time_ms}ms checks` : 'Pending reviews from fraud API'}
                    </p>
                  </div>
                  <button type="button" onClick={() => setActiveNav('fraud')} style={{ background: '#B91C1C', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700, cursor: 'pointer' }}>
                    Open queue
                  </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#FFF8F8' }}>
                      {['Flag', 'Worker', 'City', 'Trigger', 'Score', 'Reason'].map((heading) => (
                        <th key={heading} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#B06A6A' }}>
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fraudRows.slice(0, 5).map((row) => (
                      <tr key={row.id} style={{ borderTop: '1px solid #F5D5D5' }}>
                        <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: 12, color: '#991B1B' }}>{row.id}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 700 }}>{row.worker_name}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13 }}>{row.city}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13 }}>{humanizeTriggerName(row.trigger_type)}</td>
                        <td style={{ padding: '14px 18px', fontSize: 13, color: '#991B1B', fontWeight: 700 }}>{row.fraud_score}</td>
                        <td style={{ padding: '14px 18px', fontSize: 12, color: '#6B7280' }}>{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>
          </>
        ) : null}

        {activeNav === 'claims' ? (
          <DataTable
            title="Claims ledger"
            subtitle={`${claims?.total_claims || 0} claims · ${formatCurrency(claims?.total_payout || 0)} already paid`}
            headers={['Claim ID', 'Worker', 'Event', 'Created', 'Amount', 'Status']}
            rows={claimRows.map((claim) => ([
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0F2340' }}>{claim.id}</span>,
              claim.worker_name,
              humanizeTriggerName(claim.trigger_type),
              monthKey(claim.created_at),
              <span style={{ color: '#15803D', fontWeight: 700 }}>{formatCurrency(claim.amount)}</span>,
              <span style={{ padding: '5px 10px', borderRadius: 999, background: claim.status === 'paid' ? '#DCFCE7' : '#FEF3C7', color: claim.status === 'paid' ? '#15803D' : '#B45309', fontSize: 11, fontWeight: 700 }}>{claim.status}</span>,
            ]))}
          />
        ) : null}

        {activeNav === 'policies' ? (
          <DataTable
            title="Policy book"
            subtitle={`${policies?.total || 0} policies · ${policies?.active || 0} active`}
            headers={['Policy ID', 'Worker', 'City', 'Plan', 'Premium', 'Status']}
            rows={policyRows.map((policy) => ([
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#0F2340' }}>{policy.id}</span>,
              policy.worker_name,
              `${policy.city} · ${policy.zone}`,
              policy.plan,
              <span style={{ fontWeight: 700 }}>{formatCurrency(policy.weekly_premium)}</span>,
              policy.status,
            ]))}
          />
        ) : null}

        {activeNav === 'fraud' ? (
          <div style={{ background: '#fff', border: '1px solid #F5D5D5', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: '#FFF5F5', borderBottom: '1px solid #F5D5D5' }}>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: '#991B1B', marginBottom: 6 }}>Fraud review queue</h2>
              <p style={{ fontSize: 14, color: '#B91C1C' }}>{flaggedPending} items currently need action.</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FFF8F8' }}>
                  {['Flag', 'Worker', 'City', 'Trigger', 'Score', 'Reason', 'Action'].map((heading) => (
                    <th key={heading} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#B06A6A' }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fraudRows.map((row) => (
                  <tr key={row.id} style={{ borderTop: '1px solid #F5D5D5' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontSize: 12, color: '#991B1B' }}>{row.id}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 700 }}>{row.worker_name}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13 }}>{row.city}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13 }}>{humanizeTriggerName(row.trigger_type)}</td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: '#991B1B', fontWeight: 700 }}>{row.fraud_score}</td>
                    <td style={{ padding: '14px 18px', fontSize: 12, color: '#6B7280', maxWidth: 260 }}>{row.reason}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        type="button"
                        disabled={busy === `${row.id}:approve`}
                        onClick={() => onResolve(row.id, 'approve')}
                        style={{ marginRight: 8, background: '#DCFCE7', color: '#15803D', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busy === `${row.id}:reject`}
                        onClick={() => onResolve(row.id, 'reject')}
                        style={{ background: '#FEE2E2', color: '#B91C1C', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function DataTable({ title, subtitle, headers, rows }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #EFE7D9' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, color: '#0F2340', marginBottom: 6 }}>{title}</h2>
        <p style={{ fontSize: 14, color: '#6B7280' }}>{subtitle}</p>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#FBFAF6' }}>
            {headers.map((heading) => (
              <th key={heading} style={{ padding: '12px 18px', textAlign: 'left', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#8A8F82' }}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={index} style={{ borderTop: '1px solid #F1EBDF' }}>
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} style={{ padding: '14px 18px', fontSize: 13, color: '#374151' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
