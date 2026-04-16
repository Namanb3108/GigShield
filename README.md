# 🛵 GigShield — AI-Powered Parametric Income Insurance for Food Delivery Partners

> **Guidewire DEVTrails 2026 | Phase 1 Submission**
> Protecting the earnings of Zomato & Swiggy delivery partners against uncontrollable external disruptions.

---

## 📌 Table of Contents

1. [Problem Context](#1-problem-context)
2. [Chosen Persona](#2-chosen-persona)
3. [Persona-Based Scenarios & Workflow](#3-persona-based-scenarios--workflow)
4. [Weekly Premium Model](#4-weekly-premium-model)
5. [Parametric Triggers](#5-parametric-triggers)
6. [AI/ML Integration Plan](#6-aiml-integration-plan)
7. [🚨 Market Crash — Adversarial Defense & Anti-Spoofing Strategy](#7-market-crash--adversarial-defense--anti-spoofing-strategy)
8. [Platform Choice: Web App](#8-platform-choice-web-app)
9. [Tech Stack & Architecture](#9-tech-stack--architecture)
10. [Development Plan](#10-development-plan)

---

## 1. Problem Context

India's food delivery partners (Zomato, Swiggy) work 8–12 hours/day and earn between ₹15,000–₹25,000/month. External disruptions — heavy rain, floods, extreme heat, curfews, and local strikes — can render them unable to work for hours or even full days, causing 20–30% loss in monthly income. They carry zero financial protection against such events. **GigShield** closes this gap with a fully automated, parametric income insurance product designed for their reality.

> **Coverage Scope:** Loss of income ONLY. Health, life, accidents, and vehicle repairs are strictly excluded.

---

## 2. Chosen Persona

| Attribute | Details |
|---|---|
| **Persona** | Food Delivery Partner |
| **Platforms** | Zomato, Swiggy |
| **City Coverage** | Tier 1 & Tier 2 cities (Mumbai, Chennai, Bengaluru, Hyderabad, Delhi) |
| **Work Pattern** | 6–7 days/week, 8–12 hours/day, peak hours 12–2 PM and 7–10 PM |
| **Avg. Weekly Earning** | ₹3,500 – ₹6,000 |
| **Disruption Sensitivity** | High — outdoor, 2-wheeler-based, weather-dependent work |
| **Tech Literacy** | Medium — comfortable with apps (already uses Zomato/Swiggy partner apps) |

---

## 3. Persona-Based Scenarios & Workflow

### Scenario A — Heavy Rainfall in Mumbai
> Ravi is a Swiggy partner in Andheri. The IMD issues a red alert for heavy rain. Rainfall exceeds 50mm in 3 hours. Swiggy reduces order allocation. Ravi is unable to complete his usual 25 deliveries.

**GigShield Response:**
- Weather API detects rainfall threshold breach in Ravi's operational zone
- System auto-initiates a claim — zero action required from Ravi
- Payout calculated based on estimated lost hours × average hourly earning
- ₹ credited to Ravi's UPI within minutes

---

### Scenario B — Curfew/Strike in Chennai
> Priya delivers for Zomato in T. Nagar. A sudden bandh is called, blocking access to restaurant pickup zones.

**GigShield Response:**
- Social disruption trigger fires based on verified news/government API
- Claim auto-raised for affected zone & time window
- Fraud engine validates Priya's last known GPS location against the disrupted zone
- Payout processed if validation passes

---

### Scenario C — Extreme Heat in Delhi (AQI + Temperature)
> Amit works in Dwarka. AQI crosses 400 + temperature exceeds 43°C. Outdoor work is dangerous and orders drop significantly.

**GigShield Response:**
- Dual-trigger fires: AQI API + Weather API both exceed thresholds
- System identifies Amit's active policy and triggers partial income payout
- Dashboard updates to show "Coverage Activated" status

---

### Application Workflow

```
[Worker Onboarding]
    │
    ▼
[Risk Profiling via AI]  ←── Historical earnings, city, zone, platform
    │
    ▼
[Weekly Policy Purchase]  ←── Dynamic premium shown upfront, UPI payment
    │
    ▼
[Real-Time Disruption Monitoring]  ←── Weather / AQI / Social triggers (24x7)
    │
    ▼
[Auto Claim Initiation]  ←── Zero-touch, triggered automatically
    │
    ▼
[Fraud Detection Engine]  ←── GPS validation, anomaly check, duplicate check
    │
    ▼
[Instant Payout]  ←── UPI / Wallet credit within minutes
    │
    ▼
[Worker Dashboard]  ←── Earnings protected, claim history, active coverage
```

---

## 4. Weekly Premium Model

Gig workers operate and think in weekly cycles — they receive platform settlements weekly. GigShield mirrors this with a **weekly subscription** model.

### Premium Structure

| Coverage Tier | Weekly Premium | Max Weekly Payout | Best For |
|---|---|---|---|
| **Basic** | ₹29 / week | ₹500 | Part-time workers (<20 hrs/week) |
| **Standard** | ₹59 / week | ₹1,200 | Regular workers (20–40 hrs/week) |
| **Premium** | ₹99 / week | ₹2,500 | Full-time workers (40+ hrs/week) |

### Dynamic Pricing Factors (AI-Adjusted)

The base premium is adjusted weekly using the following risk parameters:

| Factor | Impact on Premium |
|---|---|
| City / Zone historical disruption frequency | +/- ₹5–15 |
| Season (monsoon, summer) | +₹10–20 during high-risk seasons |
| Worker's claim history (frequency) | +₹5 if >2 claims in past 4 weeks |
| Platform (Zomato vs Swiggy zone coverage) | Neutral / minor variance |
| Predicted disruption risk next 7 days (ML forecast) | Up to +₹15 |

> The worker sees a simple, transparent weekly price before confirming. No hidden fees. No monthly lock-in.

### Payout Calculation

```
Estimated Lost Hours = Disruption Duration (hrs) × Worker's Active Coverage Hours
Hourly Rate = Worker's Avg Weekly Earning ÷ Avg Weekly Working Hours
Payout = Estimated Lost Hours × Hourly Rate  (capped at Tier Max)
```

---

## 5. Parametric Triggers

These triggers are **objective, verifiable, and automatic** — no manual claim submission needed.

| # | Trigger Name | Data Source | Threshold | Coverage Event |
|---|---|---|---|---|
| 1 | **Heavy Rain** | OpenWeatherMap API | Rainfall > 35mm/hr OR red alert issued | Deliveries halted |
| 2 | **Extreme Heat** | OpenWeatherMap API | Temp > 42°C for 2+ hrs in active zone | Outdoor work unsafe |
| 3 | **Severe AQI / Pollution** | CPCB API / OpenAQ | AQI > 350 (Severe category) | Health risk, order drop |
| 4 | **Flood / Waterlogging** | IMD flood alert API | Flood alert for worker's pincode | Zone inaccessible |
| 5 | **Local Strike / Bandh** | Government notification feed / News API | Verified shutdown in operational zone | Pickup zones closed |

> All triggers are cross-validated against the worker's last known GPS zone before a claim is raised.

---

## 6. AI/ML Integration Plan

### 6.1 Dynamic Premium Calculation (Risk Scoring Model)
- **Model Type:** Gradient Boosted Regression (XGBoost)
- **Inputs:** City, zone, season, worker tenure, historical claim rate, 7-day weather forecast, past disruption frequency per zone
- **Output:** Adjusted weekly premium for each worker
- **Training Data:** Historical weather data (IMD), simulated claim data, zone disruption frequency

### 6.2 Predictive Disruption Forecasting
- **Model Type:** Time-series forecasting (Prophet / LSTM)
- **Inputs:** 30-day rolling weather data, IMD seasonal alerts, historical disruption patterns
- **Output:** Risk score for the upcoming 7 days per city zone
- **Use:** Pre-emptive coverage alerts to workers + insurer reserve planning

### 6.3 Fraud Detection Engine
- **Techniques:** Isolation Forest (anomaly detection) + Rule-based validation layer
- **Signals Monitored:**
  - Worker GPS not in claimed disruption zone
  - Claim raised outside active policy window
  - Duplicate claim for same disruption event
  - Unusually high claim frequency relative to peers in the same zone
- **Output:** Fraud confidence score (0–1); claims above 0.7 flagged for review

### 6.4 Onboarding Risk Profiling
- On registration, the worker's city, zone, platform, and work hours are used to generate an initial risk profile
- ML model assigns them to a risk tier (Low / Medium / High) which initialises their base premium

---

## 7. 🚨 Market Crash — Adversarial Defense & Anti-Spoofing Strategy

> **The Scenario:** 500 delivery partners. Fake GPS. Real payouts. A coordinated fraud ring exploits a parametric insurance platform by spoofing location data during a disruption event — draining the liquidity pool in hours. Simple GPS verification is dead. GigShield's response is a multi-layered adversarial defense system.

### The Core Problem: Why GPS Alone Fails

A single GPS coordinate is trivially spoofable. Fraud rings know this. They register fake workers, plant them inside a disruption zone on paper, and trigger mass claims during a weather event. The insurer pays out — and never knows.

GigShield's answer is **triangulated behavioral trust** — no single signal decides a claim. A fraudster must defeat multiple independent systems simultaneously to succeed.

---

### Layer 1 — Behavioral Fingerprinting (Spotting the Faker)

Real delivery workers have a **predictable behavioral signature** that fraudsters cannot easily replicate at scale:

| Signal | Genuine Worker Pattern | Fraud Ring Pattern |
|---|---|---|
| GPS movement | Constant motion, stop-start delivery loops | Stationary or unnaturally smooth path |
| Order activity log | Drop in orders correlating with disruption | Zero orders even before disruption hit |
| App session data | Active on Zomato/Swiggy partner app | No platform app activity |
| Battery & sensor data | Phone vibration/accelerometer shows movement | Flat/static sensor readings |
| Historical zone presence | Worker regularly operates in claimed zone | First appearance in zone on claim day |

**Implementation:** On every claim, we pull the worker's last 90 minutes of GPS trace. We run it through a movement classifier (trained on genuine delivery route patterns) that scores whether the trace is consistent with a real working delivery partner caught in a disruption — or someone sitting still with a spoofed location.

---

### Layer 2 — Peer Cohort Validation (Catching the Ring)

A coordinated fraud ring will trigger claims in a cluster — same zone, same time, same event. GigShield detects this using **cohort anomaly detection**:

- In any disruption event, we compute the **expected claim rate** for that zone based on historical data and active policy count.
- If the actual claim surge exceeds **2.5× the expected rate**, a ring alert fires.
- Claims from the surge zone are individually re-scored against the cohort: workers with no prior zone history, no platform activity, and static GPS are flagged.
- The ring's own coordination becomes the evidence against them.

> **Key insight:** A genuine mass disruption (real flood, real curfew) produces a gradual claim wave as workers log off one by one. A fraud ring produces a sudden synchronized spike. The timestamp distribution alone is a fraud signal.

---

### Layer 3 — Cross-Platform Activity Correlation

Genuine workers on Zomato/Swiggy leave a verifiable digital trail during their working hours:

- Order acceptance/rejection logs
- Restaurant arrival pings
- Customer delivery confirmations
- In-app earnings entries

GigShield's fraud engine checks whether the claiming worker has **any platform activity in the 2 hours before the disruption trigger**. A worker who hasn't accepted a single order all day but claims income loss is immediately flagged. A genuine worker will have platform logs proving they were actively working when the disruption hit.

---

### Layer 4 — Network Graph Analysis (Identifying Rings)

Individual fraud checks can miss sophisticated rings who train each member to pass basic checks. Network analysis catches what individual scoring misses:

- We build a **social graph** of claimants: shared device IDs, shared UPI accounts, shared registration IPs, or referral chains.
- Clusters of workers who all registered within a short window, from the same IP, with the same referrer = ring signal.
- A single fraudulent node in a network raises the fraud score of connected nodes automatically.

---

### The Decision Framework: Flagging Bad Actors Without Punishing Honest Ones

| Fraud Score | Action | Worker Impact |
|---|---|---|
| 0.0 – 0.40 | Auto-approve | Instant payout. Zero friction. |
| 0.41 – 0.65 | Soft hold (2 hrs) | Payout after brief secondary check. Worker notified. |
| 0.66 – 0.80 | Human review queue | Claims analyst reviews within 4 hours. Worker notified with reason. |
| 0.81 – 1.0 | Auto-reject + flag | Claim denied. Account flagged. Worker can appeal with evidence. |

**Why this is fair:** Genuine workers in a real disruption zone score low across all layers — they have movement, platform activity, and zone history. They sail through instantly. The soft hold at 0.41–0.65 exists for edge cases: a new worker in an unfamiliar zone, or someone whose phone battery died mid-disruption. Only the 0.81+ band is auto-rejected, requiring multiple independent signals all pointing to fraud simultaneously.

---

### Anti-Gaming Design Principles

- **No feedback loop:** Workers never see their fraud score or which signals triggered a review. A fraudster cannot tune their behavior to pass.
- **Score drift:** Each suspicious claim slightly raises the baseline fraud sensitivity for that account — making repeated fraud progressively harder.
- **Delayed ring alerts:** Ring detection runs on a 6-hour delay so genuine individual claims process instantly, while coordinated patterns only emerge after the event window.
- **Appeal with evidence:** Any rejected claimant can submit platform screenshots or bank statements. Human review resolves within 24 hours. Genuine workers are never permanently blocked without evidence.

---

## 8. Platform Choice: Web App

**Why Web over Mobile?**

| Consideration | Reasoning |
|---|---|
| **Accessibility** | Works on any smartphone browser — no app install friction for new users |
| **Admin Dashboard** | Insurer/admin analytics dashboard is best served via web |
| **Faster Development** | Single codebase for worker-facing and admin views |
| **Progressive Web App (PWA)** | Will be PWA-enabled so workers can install it on their home screen, matching a native app feel |

The worker-facing UI will be mobile-first, lightweight, and Hindi/English bilingual.

---

## 9. Tech Stack & Architecture

### Frontend
- **React.js** (Vite) — Component-based, fast
- **Tailwind CSS** — Mobile-first responsive design
- **PWA** — Installable on Android home screen

### Backend
- **FastAPI (Python)** — High-performance REST API
- **PostgreSQL** — Primary database (worker profiles, policies, claims)
- **Redis** — Caching trigger states and active policy lookups

### AI/ML
- **Python (scikit-learn, XGBoost, Prophet)** — Premium calculation & forecasting
- **Isolation Forest** — Fraud anomaly detection
- **Model serving via FastAPI endpoints**

### External Integrations
| Service | Purpose | Mode |
|---|---|---|
| OpenWeatherMap API | Weather triggers | Free tier |
| OpenAQ / CPCB | AQI triggers | Free tier / Mock |
| IMD Alert Feed | Flood/disaster alerts | Mock |
| News API | Strike / bandh detection | Mock |
| Razorpay (Test Mode) | Premium collection & payouts | Sandbox |
| Google Maps / Mapbox | Zone mapping & GPS validation | Free tier |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  GigShield Platform                  │
│                                                     │
│  ┌──────────────┐      ┌──────────────────────────┐ │
│  │  React PWA   │◄────►│     FastAPI Backend       │ │
│  │  (Worker UI) │      │  (REST API + ML Services) │ │
│  └──────────────┘      └──────────┬───────────────┘ │
│                                   │                  │
│  ┌──────────────┐      ┌──────────▼───────────────┐ │
│  │  Admin       │◄────►│  PostgreSQL + Redis       │ │
│  │  Dashboard   │      │  (Data Layer)             │ │
│  └──────────────┘      └──────────┬───────────────┘ │
│                                   │                  │
│                        ┌──────────▼───────────────┐ │
│                        │  External APIs            │ │
│                        │  Weather / AQI / Payment  │ │
│                        └──────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 10. Development Plan

### Phase 1 (Weeks 1–2) — Ideation & Foundation ✅
- [x] Finalise persona: Food Delivery (Zomato/Swiggy)
- [x] Define parametric triggers and weekly premium model
- [x] Design application workflow
- [x] Define AI/ML integration strategy
- [x] Set up GitHub repository
- [ ] Record 2-minute strategy video

### Phase 2 (Weeks 3–4) — Automation & Protection
- [ ] Worker registration & onboarding flow
- [ ] AI-based risk profiling on signup
- [ ] Weekly policy creation with dynamic premium
- [ ] 5 parametric trigger integrations (Weather, AQI, Flood, Strike)
- [ ] Auto claim initiation engine
- [ ] Basic fraud detection layer
- [ ] Razorpay sandbox integration for premium collection

### Phase 3 (Weeks 5–6) — Scale & Optimise
- [ ] Advanced fraud detection (GPS spoofing, duplicate claims)
- [ ] Instant payout simulation via Razorpay test mode
- [ ] Worker dashboard (earnings protected, claim history)
- [ ] Admin/insurer dashboard (loss ratios, disruption forecast)
- [ ] Final demo video (5 min)
- [ ] Pitch deck (PDF)

---

## 👥 Team

SANNSKAR TIWARY
NAMAN BANSAL
KRISHNA PANDOH
JAHNAWI TRIPATHI
DEV VERMA
---

## 📎 Links

- https://github.com/Namanb3108/GigShield.git
- https://drive.google.com/file/d/1cNmKyi0CGn1Z57Otyc2Uuw5r_uMv9n-h/view?usp=sharing

---

*Built for Guidewire DEVTrails 2026 University Hackathon*
