const API_BASE = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');

const WORKER_KEY = 'gigshield_worker';
const ADMIN_KEY = 'gigshield_admin';

export function getApiBase() {
  return API_BASE;
}

export function getWorkerSession() {
  try {
    const raw = localStorage.getItem(WORKER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setWorkerSession(data) {
  localStorage.setItem(WORKER_KEY, JSON.stringify(data));
}

export function clearWorkerSession() {
  localStorage.removeItem(WORKER_KEY);
}

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(data) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(data));
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_KEY);
}

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const init = { ...options, headers };
  if (init.body !== undefined && typeof init.body === 'object' && !(init.body instanceof FormData)) {
    init.body = JSON.stringify(init.body);
  }
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail || data.error || (typeof data.message === 'string' ? data.message : null) || res.statusText;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

/** Auth */
export function sendWorkerOtp(phone, platform) {
  return apiFetch('/api/auth/worker/send-otp', {
    method: 'POST',
    body: { phone, platform },
  });
}

export function verifyWorkerOtp(phone, otp) {
  return apiFetch('/api/auth/worker/verify-otp', {
    method: 'POST',
    body: { phone, otp },
  });
}

export function registerWorker(payload) {
  return apiFetch('/api/auth/worker/register', {
    method: 'POST',
    body: payload,
  });
}

export function adminLogin(payload) {
  return apiFetch('/api/auth/admin/login', {
    method: 'POST',
    body: payload,
  });
}

export function getAuthMe() {
  return apiFetch('/api/auth/me');
}

/** Policy */
export function getPlans() {
  return apiFetch('/api/policy/plans');
}

export function getWorkerPolicy(workerId) {
  return apiFetch(`/api/policy/worker/${encodeURIComponent(workerId)}`);
}

export function getPolicyExclusions() {
  return apiFetch('/api/policy/exclusions');
}

export function premiumEstimate(body) {
  return apiFetch('/api/policy/premium-estimate', {
    method: 'POST',
    body,
  });
}

export function getAllPolicies() {
  return apiFetch('/api/policy/all');
}

/** Triggers */
export function getTriggerStatusAll() {
  return apiFetch('/api/triggers/status');
}

export function getTriggerStatusCity(city) {
  return apiFetch(`/api/triggers/status/${encodeURIComponent(city)}`);
}

export function simulateTrigger(city, triggerType) {
  return apiFetch(`/api/triggers/simulate/${encodeURIComponent(city)}/${encodeURIComponent(triggerType)}`, {
    method: 'POST',
  });
}

export function getForecast7d(city) {
  return apiFetch(`/api/triggers/forecast/${encodeURIComponent(city)}`);
}

/** Claims */
export function initiateClaim(body) {
  return apiFetch('/api/claims/initiate', {
    method: 'POST',
    body,
  });
}

export function getWorkerClaims(workerId) {
  return apiFetch(`/api/claims/worker/${encodeURIComponent(workerId)}`);
}

export function getAllClaims() {
  return apiFetch('/api/claims/all');
}

export function autoProcessClaim(claimId) {
  return apiFetch(`/api/claims/auto-process/${encodeURIComponent(claimId)}`, {
    method: 'POST',
  });
}

/** Fraud */
export function runFraudCheck(body) {
  return apiFetch('/api/fraud/check', {
    method: 'POST',
    body,
  });
}

export function getFraudFlags() {
  return apiFetch('/api/fraud/flags');
}

export function getFraudStats() {
  return apiFetch('/api/fraud/stats');
}

export function resolveFraudFlag(flagId, action) {
  return apiFetch(`/api/fraud/flags/${encodeURIComponent(flagId)}/resolve?action=${encodeURIComponent(action)}`, {
    method: 'PUT',
  });
}

/** Payouts */
export function processPayout(body) {
  return apiFetch('/api/payouts/process', {
    method: 'POST',
    body,
  });
}

export function getWorkerPayouts(workerId) {
  return apiFetch(`/api/payouts/worker/${encodeURIComponent(workerId)}`);
}

export function getAllPayouts() {
  return apiFetch('/api/payouts/all');
}

export function getPayoutStats() {
  return apiFetch('/api/payouts/stats');
}
