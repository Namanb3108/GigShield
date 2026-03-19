import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CountUp from '../components/reactbits/CountUp';
import ScrollReveal from '../components/reactbits/ScrollReveal';

const earningsData = [
  { day: 'Mon', earned: 680, protected: 680 },
  { day: 'Tue', earned: 720, protected: 720 },
  { day: 'Wed', earned: 0, protected: 520 },
  { day: 'Thu', earned: 810, protected: 810 },
  { day: 'Fri', earned: 890, protected: 890 },
  { day: 'Sat', earned: 950, protected: 950 },
  { day: 'Sun', earned: 700, protected: 700 },
];

const TRIGGERS = [
  { name: 'Heavy Rainfall', icon: '🌧', status: 'clear', zone: 'Andheri, Mumbai' },
  { name: 'Extreme Heat', icon: '🌡', status: 'clear', zone: 'All zones' },
  { name: 'AQI / Pollution', icon: '😷', status: 'warning', zone: 'Bandra — AQI 280' },
  { name: 'Flood Alert', icon: '🌊', status: 'clear', zone: 'All zones' },
  { name: 'Local Bandh', icon: '🚫', status: 'clear', zone: 'All zones' },
];

const CLAIMS = [
  { id: 'GS-2024-0041', date: '12 Mar 2026', event: 'Heavy Rainfall — Andheri', amount: 847, status: 'paid' },
  { id: 'GS-2024-0028', date: '28 Feb 2026', event: 'Extreme Heat — Dwarka', amount: 610, status: 'paid' },
  { id: 'GS-2024-0019', date: '14 Feb 2026', event: 'Local Bandh — T. Nagar', amount: 1200, status: 'paid' },
];

const statusColor = { clear: '#15803D', warning: '#B45309', active: '#DC2626' };
const statusBg = { clear: '#DCFCE7', warning: '#FEF3C7', active: '#FEE2E2' };
const statusLabel = { clear: 'All Clear', warning: 'Elevated', active: 'Triggered' };

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, background: '#0F2340', display: 'flex', flexDirection: 'column',
        padding: '28px 0', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '0 24px', marginBottom: 36, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#E8581A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M12 2L3 7l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/></svg>
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>GigShield</span>
        </div>

        {/* Worker profile */}
        <div style={{ padding: '16px 24px', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E8581A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10 }}>R</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Ravi Kumar</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Zomato · Mumbai</div>
          <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(21,128,61,0.2)', borderRadius: 4, padding: '3px 10px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4ADE80' }}>Standard Plan Active</span>
          </div>
        </div>

        {/* Nav */}
        {[
          { id: 'overview', label: 'Overview', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
          { id: 'triggers', label: 'Trigger Monitor', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
          { id: 'claims', label: 'My Claims', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { id: 'policy', label: 'My Policy', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px',
            background: activeTab === item.id ? 'rgba(232,88,26,0.15)' : 'transparent',
            border: 'none', borderLeft: `3px solid ${activeTab === item.id ? '#E8581A' : 'transparent'}`,
            color: activeTab === item.id ? '#fff' : 'rgba(255,255,255,0.5)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left',
            transition: 'all 0.2s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={item.icon}/></svg>
            {item.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Bottom nav items */}
        <div style={{ padding: '0 16px' }}>
          <button
            onClick={() => navigate('/disruption')}
            style={{
              width: '100%', padding: '11px 16px', borderRadius: 8,
              background: 'rgba(232,88,26,0.15)', border: '1px solid rgba(232,88,26,0.3)',
              color: '#F5C4A8', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 8,
            }}
          >
            🔴 Simulate Disruption
          </button>
          <button onClick={() => navigate('/login')} style={{
            width: '100%', padding: '11px 16px', background: 'none', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', borderRadius: 8, fontSize: 13, cursor: 'pointer',
          }}>Sign Out</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 240, flex: 1, padding: '36px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: '#0F2340', marginBottom: 4 }}>Good morning, Ravi 👋</h1>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Week of 17–23 March 2026 · Standard Plan</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate('/disruption')}
              style={{
                background: '#E8581A', border: 'none', color: '#fff', padding: '10px 20px',
                borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(232,88,26,0.25)',
              }}
            >Simulate Disruption →</button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
          {[
            { label: 'This Week Protected', value: 4270, prefix: '₹', color: '#E8581A', sub: '+₹847 from claim' },
            { label: 'Weekly Premium', value: 59, prefix: '₹', color: '#0F2340', sub: 'Paid via UPI' },
            { label: 'Claims This Month', value: 1, prefix: '', color: '#15803D', sub: '₹847 paid out' },
            { label: 'Active Since', value: 84, prefix: '', suffix: ' days', color: '#6B7280', sub: 'Member since Jan 2026' },
          ].map((card, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 10, textTransform: 'uppercase' }}>{card.label}</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 900, color: card.color, lineHeight: 1 }}>
                  {card.prefix}<CountUp to={card.value} suffix={card.suffix || ''} duration={1.5} />
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>{card.sub}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Earnings chart */}
          <ScrollReveal>
            <div style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F2340' }}>Earnings vs Protected Income</h3>
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>This week — Wednesday payout triggered</p>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', display: 'flex', gap: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 3, background: '#0F2340', borderRadius: 2 }} /> Actual
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 3, background: '#E8581A', borderRadius: 2 }} /> Protected
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={earningsData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={(v, n) => [`₹${v}`, n === 'earned' ? 'Actual' : 'Protected']} />
                  <Area type="monotone" dataKey="protected" stroke="#E8581A" fill="rgba(232,88,26,0.08)" strokeWidth={2} />
                  <Area type="monotone" dataKey="earned" stroke="#0F2340" fill="rgba(15,35,64,0.06)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ScrollReveal>

          {/* Trigger monitor */}
          <ScrollReveal delay={0.1}>
            <div style={{ background: '#fff', borderRadius: 12, padding: '24px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F2340', marginBottom: 4 }}>Trigger Monitor</h3>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>Mumbai · Live</p>
              {TRIGGERS.map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 8, marginBottom: 8,
                  background: t.status === 'warning' ? '#FEF3C7' : '#F9FAFB',
                  border: `1px solid ${t.status === 'warning' ? '#FDE68A' : '#F3F4F6'}`,
                }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F2340' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{t.zone}</div>
                  </div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: statusColor[t.status],
                    background: statusBg[t.status], padding: '3px 8px', borderRadius: 4,
                  }}>{statusLabel[t.status]}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* Claims table */}
        <ScrollReveal>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F2340' }}>Recent Claims</h3>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>Auto-initiated — no action required</p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#E8581A', cursor: 'pointer' }}>View All →</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Claim ID', 'Date', 'Event', 'Amount', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLAIMS.map((c, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 600, color: '#0F2340', fontFamily: 'monospace' }}>{c.id}</td>
                    <td style={{ padding: '14px 24px', fontSize: 13, color: '#6B7280' }}>{c.date}</td>
                    <td style={{ padding: '14px 24px', fontSize: 13, color: '#374151' }}>{c.event}</td>
                    <td style={{ padding: '14px 24px', fontSize: 13, fontWeight: 700, color: '#15803D' }}>₹{c.amount}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#15803D', background: '#DCFCE7', padding: '3px 10px', borderRadius: 4 }}>Paid</span>
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
