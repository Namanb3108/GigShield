import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import CountUp from '../components/reactbits/CountUp';
import ScrollReveal from '../components/reactbits/ScrollReveal';

const claimData = [
  { month: 'Oct', claims: 42, payouts: 38200 },
  { month: 'Nov', claims: 58, payouts: 51600 },
  { month: 'Dec', claims: 31, payouts: 27400 },
  { month: 'Jan', claims: 74, payouts: 68100 },
  { month: 'Feb', claims: 89, payouts: 82000 },
  { month: 'Mar', claims: 63, payouts: 57400 },
];

const CITY_DATA = [
  { city: 'Mumbai', policies: 2840, claims: 34, risk: 'high', lossRatio: 72 },
  { city: 'Chennai', policies: 1920, claims: 18, risk: 'medium', lossRatio: 58 },
  { city: 'Delhi', policies: 3120, claims: 41, risk: 'high', lossRatio: 81 },
  { city: 'Bengaluru', policies: 2250, claims: 12, risk: 'low', lossRatio: 44 },
  { city: 'Hyderabad', policies: 1480, claims: 9, risk: 'low', lossRatio: 38 },
];

const FRAUD_FLAGS = [
  { id: 'FR-091', worker: 'Ankit S.', city: 'Delhi', event: 'Heavy Rain', score: 0.82, reason: 'GPS outside disruption zone' },
  { id: 'FR-087', worker: 'Meena R.', city: 'Mumbai', event: 'Bandh', score: 0.76, reason: '3rd claim in 4 weeks' },
  { id: 'FR-083', worker: 'Vijay P.', city: 'Chennai', event: 'Extreme Heat', score: 0.71, reason: 'Duplicate event claim detected' },
];

const PIE_DATA = [
  { name: 'Heavy Rain', value: 38, color: '#1A3557' },
  { name: 'Extreme Heat', value: 24, color: '#E8581A' },
  { name: 'Bandh / Strike', value: 19, color: '#15803D' },
  { name: 'AQI / Pollution', value: 12, color: '#B45309' },
  { name: 'Flood Alert', value: 7, color: '#7C3AED' },
];

const riskColor = { high: '#DC2626', medium: '#D97706', low: '#15803D' };
const riskBg = { high: '#FEE2E2', medium: '#FEF3C7', low: '#DCFCE7' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('overview');

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#080F1B', display: 'flex', flexDirection: 'column',
        padding: '28px 0', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        <div style={{ padding: '0 24px', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#E8581A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M12 2L3 7l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/></svg>
            </div>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>GigShield</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5 }}>INSURER PORTAL</div>
        </div>

        {[
          { id: 'overview', label: 'Overview', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
          { id: 'claims', label: 'Claims', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2' },
          { id: 'policies', label: 'Policies', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
          { id: 'fraud', label: 'Fraud Flags', icon: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', badge: 3 },
          { id: 'forecasting', label: 'Forecasting', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px',
            background: activeNav === item.id ? 'rgba(232,88,26,0.12)' : 'transparent',
            border: 'none', borderLeft: `3px solid ${activeNav === item.id ? '#E8581A' : 'transparent'}`,
            color: activeNav === item.id ? '#fff' : 'rgba(255,255,255,0.45)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left',
            transition: 'all 0.2s', position: 'relative',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={item.icon}/></svg>
            {item.label}
            {item.badge && (
              <span style={{ marginLeft: 'auto', background: '#DC2626', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.badge}</span>
            )}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ padding: '0 16px' }}>
          <button onClick={() => navigate('/login')} style={{
            width: '100%', padding: '11px', background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.35)', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          }}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, flex: 1, padding: '36px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: '#0F2340' }}>Insurer Dashboard</h1>
            <p style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>March 2026 · All cities · Standard view</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button style={{ padding: '9px 18px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Export Report</button>
            <button style={{ padding: '9px 18px', background: '#0F2340', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>+ Add Policy Rule</button>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Active Policies', value: 11610, color: '#0F2340' },
            { label: 'Claims This Month', value: 63, color: '#E8581A' },
            { label: 'Payouts (₹)', value: 57400, color: '#15803D', prefix: '₹', separator: ',' },
            { label: 'Loss Ratio', value: 58, suffix: '%', color: '#B45309' },
            { label: 'Fraud Flagged', value: 3, color: '#DC2626' },
          ].map((k, i) => (
            <ScrollReveal key={i} delay={i * 0.04}>
              <div style={{ background: '#fff', borderRadius: 10, padding: '18px 20px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>{k.label}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 900, color: k.color, lineHeight: 1 }}>
                  {k.prefix || ''}<CountUp to={k.value} suffix={k.suffix || ''} separator={k.separator || ''} duration={1.5} />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Claims chart */}
          <ScrollReveal>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F2340', marginBottom: 4 }}>Claims & Payouts — Last 6 Months</h3>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Volume and value trends</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={claimData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v, n) => [n === 'claims' ? v : `₹${v.toLocaleString()}`, n === 'claims' ? 'Claims' : 'Payouts']} />
                  <Bar yAxisId="left" dataKey="claims" fill="#0F2340" radius={[4,4,0,0]} />
                  <Bar yAxisId="right" dataKey="payouts" fill="#E8581A" radius={[4,4,0,0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ScrollReveal>

          {/* Trigger breakdown */}
          <ScrollReveal delay={0.1}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F2340', marginBottom: 4 }}>Claims by Trigger Type</h3>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 12 }}>March 2026</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: 4 }}>
                {PIE_DATA.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#374151' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                    {d.name} ({d.value}%)
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* City risk table */}
        <ScrollReveal>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0F2340' }}>City-wise Loss Ratio & Risk</h3>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>Active policies, claims, and risk classification per city</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['City', 'Active Policies', 'Claims (Mar)', 'Loss Ratio', 'Risk Level'].map(h => (
                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CITY_DATA.map((row, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 700, color: '#0F2340' }}>{row.city}</td>
                    <td style={{ padding: '14px 24px', fontSize: 14, color: '#374151' }}>{row.policies.toLocaleString()}</td>
                    <td style={{ padding: '14px 24px', fontSize: 14, color: '#374151' }}>{row.claims}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3, maxWidth: 120 }}>
                          <div style={{ width: `${row.lossRatio}%`, height: '100%', borderRadius: 3, background: row.lossRatio > 70 ? '#DC2626' : row.lossRatio > 55 ? '#D97706' : '#15803D', transition: 'width 1s ease' }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: row.lossRatio > 70 ? '#DC2626' : '#374151', minWidth: 36 }}>{row.lossRatio}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: riskColor[row.risk], background: riskBg[row.risk], padding: '3px 10px', borderRadius: 4, textTransform: 'capitalize' }}>{row.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        {/* Fraud flags */}
        <ScrollReveal>
          <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #FEE2E2', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #FEE2E2', background: '#FFF5F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#991B1B' }}>⚠ Fraud Detection Flags</h3>
                <p style={{ fontSize: 13, color: '#B91C1C', marginTop: 2 }}>3 claims require manual review · AI confidence score &gt;0.7</p>
              </div>
              <button style={{ background: '#DC2626', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Review All</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FFF5F5' }}>
                  {['Flag ID', 'Worker', 'City', 'Event', 'Fraud Score', 'Reason', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FRAUD_FLAGS.map((f, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #FEE2E2' }}>
                    <td style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: '#DC2626', fontFamily: 'monospace' }}>{f.id}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#0F2340' }}>{f.worker}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#6B7280' }}>{f.city}</td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#374151' }}>{f.event}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                          <div style={{ width: `${f.score * 100}%`, height: '100%', background: '#DC2626', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{f.score}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#6B7280' }}>{f.reason}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ fontSize: 11, fontWeight: 600, color: '#15803D', background: '#DCFCE7', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Approve</button>
                        <button style={{ fontSize: 11, fontWeight: 600, color: '#DC2626', background: '#FEE2E2', border: 'none', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
