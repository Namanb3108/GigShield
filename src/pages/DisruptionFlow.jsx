import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  autoProcessClaim,
  getWorkerPolicy,
  getWorkerSession,
  initiateClaim,
  processPayout,
  runFraudCheck,
  simulateTrigger,
} from '../api';

const SCENARIOS = [
  {
    id: 'heavy_rain',
    label: 'Heavy Rainfall',
    city: 'Mumbai',
    zone: 'Andheri',
    reading: '52mm/hr',
    threshold: '>35mm/hr',
    tone: '#0F2340',
    estimate: 847,
  },
  {
    id: 'extreme_heat',
    label: 'Extreme Heat',
    city: 'Delhi',
    zone: 'Dwarka',
    reading: '44C for 3hrs',
    threshold: '>42C for 2hrs',
    tone: '#C44410',
    estimate: 610,
  },
  {
    id: 'bandh_strike',
    label: 'Local Bandh',
    city: 'Chennai',
    zone: 'T.Nagar',
    reading: 'Verified bandh',
    threshold: 'Govt notification',
    tone: '#6D28D9',
    estimate: 1200,
  },
];

const PIPELINE_STEPS = [
  { id: 'trigger', label: 'Trigger Detected', copy: 'Threshold breach received from the trigger feed.' },
  { id: 'claim', label: 'Claim Initiated', copy: 'Parametric claim created for the worker automatically.' },
  { id: 'fraud', label: 'Fraud Check', copy: 'Isolation Forest + business rules score the claim.' },
  { id: 'payout', label: 'Payout Sent', copy: 'UPI credit and WhatsApp confirmation are issued.' },
];

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function DisruptionFlow() {
  const navigate = useNavigate();
  const [sessionWorker, setSessionWorker] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [selected, setSelected] = useState(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [amountCounter, setAmountCounter] = useState(0);
  const [flow, setFlow] = useState(null);

  useEffect(() => {
    const current = getWorkerSession()?.worker || null;
    setSessionWorker(current);
    if (!current?.id) return;
    getWorkerPolicy(current.id)
      .then((response) => setPolicy(response?.policy || null))
      .catch(() => setPolicy(null));
  }, []);

  const worker = sessionWorker || {
    id: 'W-001',
    name: 'Ravi Kumar',
    city: 'Mumbai',
    platform: 'Zomato',
  };

  const scenarios = useMemo(() => {
    const first = policy
      ? {
          id: 'worker_city_live',
          label: `${worker.city || policy.city} live scenario`,
          city: worker.city || policy.city,
          zone: policy.zone || 'Andheri',
          reading: 'Live policy zone',
          threshold: 'Use policy-linked zone',
          tone: '#15803D',
          estimate: policy.max_payout ? Math.min(policy.max_payout, 847) : 847,
        }
      : null;
    return first ? [first, ...SCENARIOS] : SCENARIOS;
  }, [policy, worker.city]);

  useEffect(() => {
    if (!running || stepIndex < 0) return undefined;
    if (stepIndex >= PIPELINE_STEPS.length - 1) {
      const timeout = setTimeout(() => {
        setRunning(false);
        setDone(true);
      }, 850);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setStepIndex((value) => value + 1), 1200);
    return () => clearTimeout(timeout);
  }, [running, stepIndex]);

  useEffect(() => {
    if (!done || !flow?.amount) return;
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAmountCounter(Math.round(flow.amount * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [done, flow]);

  async function startFlow(scenario) {
    setError('');
    setDone(false);
    setRunning(false);
    setSelected(scenario);
    setFlow(null);
    setAmountCounter(0);
    setStepIndex(-1);
    setLoading(true);

    try {
      const policyId = policy?.id || 'POL-001';
      const policyAgeHours = policy ? 96 : 72;
      const simulated = await simulateTrigger(scenario.city, scenario.id === 'worker_city_live' ? 'heavy_rain' : scenario.id);
      const triggerType = simulated.trigger_type || (scenario.id === 'worker_city_live' ? 'heavy_rain' : scenario.id);

      const initiated = await initiateClaim({
        worker_id: worker.id,
        city: scenario.city,
        zone: scenario.zone,
        trigger_type: triggerType,
        trigger_reading: simulated.reading || scenario.reading,
        policy_id: policyId,
      });

      const claimId = initiated?.claim?.id;
      if (!claimId) throw new Error('Claim initiation did not return an ID');

      const fraud = await runFraudCheck({
        worker_id: worker.id,
        claim_id: claimId,
        city: scenario.city,
        zone: scenario.zone,
        trigger_type: triggerType,
        policy_age_hours: policyAgeHours,
        claims_last_4_weeks: 1,
      });

      const auto = await autoProcessClaim(claimId);
      const amount = Number(auto?.payout_amount || initiated?.claim?.estimated_payout || scenario.estimate);
      const payout = await processPayout({
        claim_id: claimId,
        worker_id: worker.id,
        amount,
        upi_id: `${String(worker.name || 'worker').toLowerCase().replace(/\s+/g, '.')}@upi`,
        trigger_type: triggerType,
      });

      setFlow({
        simulated,
        initiated,
        fraud,
        auto,
        payout,
        amount,
        claimId,
        triggerType,
      });
      setSelected({
        ...scenario,
        reading: simulated.reading || scenario.reading,
        threshold: simulated.threshold || scenario.threshold,
      });
      setStepIndex(0);
      setRunning(true);
    } catch (err) {
      setError(err.message || 'Pipeline failed');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSelected(null);
    setStepIndex(-1);
    setRunning(false);
    setDone(false);
    setLoading(false);
    setError('');
    setFlow(null);
    setAmountCounter(0);
  }

  const whatsappText = flow?.payout?.notification?.whatsapp || '';
  const workerPolicyLine = policy
    ? `${policy.plan} plan · ${policy.city} · ${policy.zone}`
    : `${worker.platform || 'Platform'} · session profile`;

  return (
    <div style={{ minHeight: '100vh', background: '#F6F4EE' }}>
      <div style={{ background: '#0F2340', color: '#fff', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700 }}>GigShield</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Live disruption to payout journey</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => navigate('/dashboard')} style={topButtonStyle}>Worker dashboard</button>
          <button type="button" onClick={() => navigate('/admin')} style={topButtonStyle}>Admin dashboard</button>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 32px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 12, color: '#E8581A', fontWeight: 700, letterSpacing: 1.5, marginBottom: 10 }}>REAL API CHAIN</div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(32px, 5vw, 54px)', color: '#0F2340', marginBottom: 12 }}>
            Trigger to payout in one visible flow
          </h1>
          <p style={{ maxWidth: 760, margin: '0 auto', color: '#6B7280', lineHeight: 1.8 }}>
            This screen now behaves like a real operations simulator: each run calls the backend trigger, claim, fraud, auto-process, and payout routes, then renders the returned payout and WhatsApp notification payload.
          </p>
        </div>

        {error ? <div style={{ marginBottom: 20, background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 12, padding: 14 }}>{error}</div> : null}
        {loading ? <div style={{ marginBottom: 20, color: '#6B7280' }}>Calling localhost:8000 and assembling the payout journey...</div> : null}

        {!selected && !loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => startFlow(scenario)}
                style={{
                  background: '#fff',
                  border: '1px solid #E7E2D8',
                  borderRadius: 16,
                  padding: '22px 20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  boxShadow: '0 8px 18px rgba(15,35,64,0.04)',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${scenario.tone}14`, color: scenario.tone, display: 'grid', placeItems: 'center', fontWeight: 800, marginBottom: 14 }}>
                  {scenario.label.slice(0, 1)}
                </div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 22, color: '#0F2340', marginBottom: 8 }}>{scenario.label}</div>
                <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 6 }}>{scenario.city} · {scenario.zone}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>Reading {scenario.reading} · threshold {scenario.threshold}</div>
                <div style={{ paddingTop: 14, borderTop: '1px solid #F1EBDF', fontSize: 13, color: '#15803D', fontWeight: 700 }}>
                  Estimated payout {formatCurrency(scenario.estimate)}
                </div>
              </button>
            ))}
          </div>
        ) : null}

        <AnimatePresence>
          {selected ? (
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }}>
              <div style={{ background: '#0F2340', color: '#fff', borderRadius: 18, padding: '24px 26px', display: 'flex', justifyContent: 'space-between', gap: 20, margin: '12px 0 22px' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, color: '#F8B99B', marginBottom: 8 }}>ACTIVE SCENARIO</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, marginBottom: 6 }}>{selected.label}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)' }}>
                    {selected.city} · {selected.zone} · {selected.reading} · threshold {selected.threshold}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#F8B99B', fontWeight: 700, marginBottom: 8 }}>WORKER CONTEXT</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{worker.name || 'Delivery partner'}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.68)', marginTop: 4 }}>{workerPolicyLine}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14, marginBottom: 22 }}>
                {PIPELINE_STEPS.map((item, index) => {
                  const completed = stepIndex > index || (done && index === PIPELINE_STEPS.length - 1);
                  const active = stepIndex === index && running;
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: '#fff',
                        border: `1px solid ${completed || active ? '#E8581A' : '#E7E2D8'}`,
                        borderRadius: 14,
                        padding: '20px 18px',
                        boxShadow: active ? '0 10px 20px rgba(232,88,26,0.12)' : 'none',
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: completed ? '#E8581A' : active ? '#FFF4EE' : '#F3F4F6', color: completed ? '#fff' : active ? '#E8581A' : '#9CA3AF', display: 'grid', placeItems: 'center', fontWeight: 800, marginBottom: 12 }}>
                        {completed ? 'OK' : index + 1}
                      </div>
                      <div style={{ fontSize: 15, color: '#0F2340', fontWeight: 700, marginBottom: 6 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>
                        {item.id === 'fraud' && flow?.fraud?.fraud_score != null
                          ? `${item.copy} Score ${flow.fraud.fraud_score}.`
                          : item.copy}
                      </div>
                    </div>
                  );
                })}
              </div>

              {flow ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 20, alignItems: 'start', marginBottom: 18 }}>
                  <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14, marginBottom: 18 }}>
                      <MetricCard label="Claim ID" value={flow.claimId} />
                      <MetricCard label="Fraud score" value={String(flow.fraud?.fraud_score ?? flow.auto?.pipeline?.find((step) => step.step === 'fraud_score')?.value ?? '--')} />
                      <MetricCard label="Processing time" value={`${flow.auto?.total_time_seconds || 2.1}s`} />
                      <MetricCard label="Payout amount" value={formatCurrency(flow.amount)} />
                    </div>

                    {done ? (
                      <div style={{ background: 'linear-gradient(135deg, #0F2340 0%, #1A3557 100%)', borderRadius: 16, padding: '26px 28px', color: '#fff' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#A7F3D0', marginBottom: 10 }}>PAYOUT COMPLETE</div>
                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 54, color: '#4ADE80', lineHeight: 1 }}>{formatCurrency(amountCounter)}</div>
                        <div style={{ marginTop: 10, fontSize: 14, color: 'rgba(255,255,255,0.72)' }}>
                          Credited to {(flow.payout?.payout?.upi_id || 'worker@upi')} for {worker.name}.
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#FBFAF6', border: '1px solid #F1EBDF', borderRadius: 16, padding: '20px 22px', color: '#6B7280' }}>
                        Pipeline staged. Waiting for the visible animation to complete.
                      </div>
                    )}
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #E7E2D8', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ background: '#075E54', color: '#fff', padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700 }}>WhatsApp business message</div>
                      <div style={{ fontSize: 11, opacity: 0.82 }}>Notification mock from payout API</div>
                    </div>
                    <div style={{ background: '#ECE5DD', padding: 16, minHeight: 220 }}>
                      <div style={{ background: '#DCF8C6', borderRadius: 14, padding: '12px 14px', fontSize: 13, color: '#111827', lineHeight: 1.6, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                        {whatsappText || 'Awaiting payout response...'}
                        <div style={{ marginTop: 8, fontSize: 10, textAlign: 'right', color: '#667781' }}>Delivered · demo</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {done ? (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button type="button" onClick={reset} style={actionButtonLight}>Run another scenario</button>
                  <button type="button" onClick={() => navigate('/dashboard')} style={actionButtonDark}>View worker dashboard</button>
                  <button type="button" onClick={() => navigate('/admin')} style={actionButtonOrange}>View admin dashboard</button>
                </div>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={{ background: '#FBFAF6', border: '1px solid #F1EBDF', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 16, color: '#0F2340', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const topButtonStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.18)',
  color: '#fff',
  padding: '8px 14px',
  borderRadius: 8,
  fontWeight: 600,
  cursor: 'pointer',
};

const actionButtonLight = {
  background: '#fff',
  border: '1px solid #E7E2D8',
  color: '#374151',
  padding: '12px 18px',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
};

const actionButtonDark = {
  background: '#0F2340',
  border: 'none',
  color: '#fff',
  padding: '12px 18px',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
};

const actionButtonOrange = {
  background: '#E8581A',
  border: 'none',
  color: '#fff',
  padding: '12px 18px',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
};
