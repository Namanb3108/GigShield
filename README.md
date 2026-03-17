[README.md](https://github.com/user-attachments/files/26063817/README.md)
# GigShield — AI-Powered Parametric Income Insurance for Food Delivery Partners

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
7. [Platform Choice: Web App](#7-platform-choice-web-app)
8. [Tech Stack & Architecture](#8-tech-stack--architecture)
9. [Development Plan](#9-development-plan)

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

## 7. Platform Choice: Web App

**Why Web over Mobile?**

| Consideration | Reasoning |
|---|---|
| **Accessibility** | Works on any smartphone browser — no app install friction for new users |
| **Admin Dashboard** | Insurer/admin analytics dashboard is best served via web |
| **Faster Development** | Single codebase for worker-facing and admin views |
| **Progressive Web App (PWA)** | Will be PWA-enabled so workers can install it on their home screen, matching a native app feel |

The worker-facing UI will be mobile-first, lightweight, and Hindi/English bilingual.

---

## 8. Tech Stack & Architecture

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

## 9. Development Plan

### Phase 1 (Weeks 1–2) — Ideation & Foundation 
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

> *(Add your team member names and roles here)*

---

## 📎 Links

- **Repository:** *(This repo)*
- **Demo Video (Phase 1):** *(Add link after recording)*

---

*Built for Guidewire DEVTrails 2026 University Hackathon*
