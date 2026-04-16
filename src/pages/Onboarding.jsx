import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { premiumEstimate, setWorkerSession, getWorkerSession } from '../api';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [premiumData, setPremiumData] = useState(null);
  
  // Try to load the pending session created in Login.jsx (with worker risk tier info)
  const session = getWorkerSession();
  const worker = session?.worker || {
    id: "W-NEW",
    name: "Delivery Partner",
    city: "Mumbai",
    platform: "Zomato",
    plan: "Standard",
    risk_tier: "Medium"
  };

  useEffect(() => {
    if (step === 3 && !premiumData) {
      setLoading(true);
      premiumEstimate({
        city: worker.city,
        zone: "Andheri", // Hardcoding default zone for flow
        platform: worker.platform,
        weekly_hours: "40",
        plan: worker.plan
      }).then(res => {
        setPremiumData(res);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [step, worker, premiumData]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);
  
  const finishOnboarding = () => {
    // In actual flow, you'd integrate Razorpay sandbox here.
    // For now we simulate payment and redirect.
    setWorkerSession({ token: session?.token || "demo", worker });
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F6F4EE', padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 500, background: '#fff', borderRadius: 20, boxShadow: '0 12px 32px rgba(15,35,64,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #E7E2D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#E8581A', letterSpacing: 1.2 }}>GIGSHIELD ONBOARDING</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Step {step} of 4</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: 18, height: 4, borderRadius: 2, background: step >= i ? '#0F2340' : '#E5E7EB' }} />
            ))}
          </div>
        </div>

        <div style={{ padding: '40px 32px', flex: 1 }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, color: '#0F2340', marginBottom: 12 }}>Personal Details</h2>
                <p style={{ color: '#6B7280', marginBottom: 32 }}>Verify your profile information before evaluating risk.</p>
                
                <div style={{ display: 'grid', gap: 16 }}>
                  <div style={inputMock}>Name: <b>{worker.name}</b></div>
                  <div style={inputMock}>City: <b>{worker.city}</b></div>
                  <div style={inputMock}>Platform: <b>{worker.platform}</b></div>
                </div>
                
                <button onClick={handleNext} style={{ ...btnPrimary, marginTop: 40 }}>Evaluate My Risk {'->'} </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, color: '#0F2340', marginBottom: 12 }}>AI Risk Profile</h2>
                <p style={{ color: '#6B7280', marginBottom: 32 }}>Our classification model evaluated your profile parameters.</p>
                
                <div style={{ background: '#F8F9FA', border: '1px solid #E5E7EB', borderRadius: 16, padding: '30px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', letterSpacing: 1, marginBottom: 16 }}>YOUR RISK TIER</div>
                  
                  <div style={{ width: 120, height: 120, borderRadius: '50%', border: `8px solid ${worker.risk_tier === "High" ? "#DC2626" : worker.risk_tier === "Low" ? "#15803D" : "#D97706"}`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#0F2340' }}>
                    {worker.risk_tier}
                  </div>
                  
                  <div style={{ fontSize: 14, color: '#374151' }}>Based on {worker.city} weather extremes and {worker.platform} dispatch zones.</div>
                </div>
                
                <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
                  <button onClick={handleBack} style={btnSecondary}>Back</button>
                  <button onClick={handleNext} style={btnPrimary}>Generate Dynamic Premium {'->'}</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, color: '#0F2340', marginBottom: 12 }}>Dynamic Premium</h2>
                <p style={{ color: '#6B7280', marginBottom: 24 }}>XGBoost adjusted pricing based on hyper-local data.</p>
                
                {loading || !premiumData ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Running ML models...</div>
                ) : (
                  <>
                    <div style={{ background: '#0F2340', color: '#fff', borderRadius: 16, padding: '24px 20px', marginBottom: 20 }}>
                      <div style={{ fontSize: 12, letterSpacing: 1.2, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>FINAL WEEKLY PREMIUM</div>
                      <div style={{ fontSize: 44, fontFamily: 'Fraunces, serif', margin: '8px 0' }}>Rs {premiumData.final_weekly_premium}<span style={{fontSize: 16, opacity: 0.8}}>/wk</span></div>
                      <div style={{ fontSize: 13, color: '#A7F3D0' }}>Base {premiumData.plan} plan: Rs {premiumData.base_weekly_premium}/wk</div>
                    </div>

                    <div style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 1, marginBottom: 12 }}>FACTOR BREAKDOWN</div>
                      {premiumData.factors?.map((f, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < premiumData.factors.length-1 ? '1px solid #F3F4F6' : 'none' }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{f.name}</div>
                            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{f.detail}</div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#E8581A' }}>x{f.multiplier}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                  <button onClick={handleBack} style={btnSecondary}>Back</button>
                  <button onClick={handleNext} disabled={loading} style={btnPrimary}>Proceed to Coverage {'->'}</button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, color: '#0F2340', marginBottom: 12 }}>Activate Cover</h2>
                <p style={{ color: '#6B7280', marginBottom: 24 }}>Sandbox checkout for Razorpay integration.</p>

                <div style={{ background: '#FFF4EE', border: '1px solid #F8D2BF', borderRadius: 16, padding: '24px', textAlign: 'center', marginBottom: 32 }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" style={{ height: 24, marginBottom: 16 }} />
                  <div style={{ fontSize: 18, color: '#111827', fontWeight: 600, marginBottom: 8 }}>Pay Rs {premiumData?.final_weekly_premium || 59}</div>
                  <div style={{ fontSize: 13, color: '#C44410' }}>First 48 hours cooling-off applies automatically.</div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
                  <button onClick={handleBack} style={btnSecondary}>Back</button>
                  <button onClick={finishOnboarding} style={btnPrimary}>Simulate Payment</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

const inputMock = {
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #E5E7EB',
  fontSize: '15px',
  color: '#374151',
  background: '#F9FAFB'
};

const btnPrimary = {
  flex: 1,
  padding: '16px',
  borderRadius: '12px',
  background: '#E8581A',
  color: '#fff',
  fontWeight: 700,
  fontSize: '15px',
  border: 'none',
  cursor: 'pointer'
};

const btnSecondary = {
  padding: '16px 24px',
  borderRadius: '12px',
  background: '#F3F4F6',
  color: '#374151',
  fontWeight: 700,
  fontSize: '15px',
  border: 'none',
  cursor: 'pointer'
};
