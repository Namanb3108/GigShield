import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getForecast7d } from '../api';

const CITIES = ['Mumbai', 'Chennai', 'Delhi', 'Bengaluru', 'Hyderabad'];

export default function Forecast7Day() {
  const navigate = useNavigate();
  const [city, setCity] = useState('Mumbai');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError('');
      try {
        const r = await getForecast7d(city);
        if (!cancelled) setData(r);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Forecast failed');
      }
    })();
    return () => { cancelled = true; };
  }, [city]);

  const chartData = (data?.forecast || []).map((d) => ({
    ...d,
    probPct: Math.round((d.disruption_probability || 0) * 100),
  }));

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5' }}>
      <div style={{ background: '#080F1B', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#fff' }}>GigShield</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>7-day disruption forecast (Prophet demo)</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={city} onChange={(e) => setCity(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: '#0F2340', color: '#fff', fontSize: 13 }}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="button" onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Admin</button>
          <button type="button" onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Worker</button>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, color: '#0F2340', marginBottom: 8 }}>Next 7 days — {city}</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>
          {data?.model || 'Prophet'} · {error ? error : `GET /api/triggers/forecast/${city}`}
        </p>

        <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #E5E7EB', marginBottom: 28 }}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="day_label" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tickFormatter={(v) => `${v}%`} domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Disruption probability']} />
              <Area type="monotone" dataKey="probPct" stroke="#E8581A" fill="rgba(232,88,26,0.12)" strokeWidth={2} name="P(disruption)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {chartData.map((d, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0F2340' }}>{d.day_label}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Driver: {d.top_drivers}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#E8581A' }}>{d.probPct}%</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: d.expected_risk_level === 'high' ? '#DC2626' : d.expected_risk_level === 'medium' ? '#D97706' : '#15803D' }}>{d.expected_risk_level?.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
