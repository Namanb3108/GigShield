from datetime import datetime, timedelta

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class CreatePolicyRequest(BaseModel):
    worker_id: str
    plan: str
    city: str
    zone: str
    platform: str
    weekly_hours: str


class UpdatePolicyRequest(BaseModel):
    policy_id: str
    new_plan: str


PLANS = {
    "Basic": {
        "name": "Basic",
        "weekly_premium": 29,
        "max_payout": 500,
        "hours_covered": 20,
        "description": "Part-time workers under 20hrs/week",
    },
    "Standard": {
        "name": "Standard",
        "weekly_premium": 59,
        "max_payout": 1200,
        "hours_covered": 40,
        "description": "Regular workers 20-40hrs/week",
    },
    "Premium": {
        "name": "Premium",
        "weekly_premium": 99,
        "max_payout": 2500,
        "hours_covered": 60,
        "description": "Full-time workers 40+hrs/week",
    },
}

MOCK_POLICIES = [
    {
        "id": "POL-001",
        "worker_id": "W-001",
        "worker_name": "Ravi Kumar",
        "plan": "Standard",
        "city": "Mumbai",
        "zone": "Andheri",
        "platform": "Zomato",
        "weekly_premium": 59,
        "max_payout": 1200,
        "status": "active",
        "start_date": "2026-01-01",
        "renewal_date": "2026-04-07",
        "total_paid_in": 413,
        "total_paid_out": 847,
        "claims_count": 1,
    },
]


@router.get("/plans")
def get_all_plans():
    return {
        "plans": list(PLANS.values()),
        "note": "Premiums are dynamically adjusted weekly by AI risk model",
    }


from models.premium import premium_engine

class PremiumEstimateRequest(BaseModel):
    city: str
    zone: str
    platform: str
    weekly_hours: str
    plan: str


@router.post("/premium-estimate")
def premium_estimate(request: PremiumEstimateRequest):
    plan = PLANS.get(request.plan, PLANS["Standard"])
    base_premium = plan["weekly_premium"]
    
    claims = 0  # In real implementation, query from DB
    tenure_months = 1
    
    final_premium, factors = premium_engine.calculate_premium(
        base_premium=base_premium,
        city=request.city,
        zone=request.zone,
        platform=request.platform,
        claims=claims,
        tenure_months=tenure_months
    )
    
    return {
        "success": True,
        "plan": request.plan,
        "base_weekly_premium": base_premium,
        "final_weekly_premium": final_premium,
        "model": "XGBoost",
        "factors": factors
    }

@router.post("/create")
def create_policy(request: CreatePolicyRequest):
    plan = PLANS.get(request.plan)
    if not plan:
        return {"error": f"Plan {request.plan} not found"}

    policy_id = f"POL-{str(len(MOCK_POLICIES) + 1).zfill(3)}"
    start_date = datetime.now()
    renew_date = start_date + timedelta(days=7)

    policy = {
        "id": policy_id,
        "worker_id": request.worker_id,
        "plan": request.plan,
        "city": request.city,
        "zone": request.zone,
        "platform": request.platform,
        "weekly_premium": plan["weekly_premium"],
        "max_payout": plan["max_payout"],
        "status": "active",
        "start_date": start_date.isoformat(),
        "renewal_date": renew_date.isoformat(),
        "note": "Policy active after 48hr cooling-off period",
    }

    return {
        "success": True,
        "policy": policy,
        "message": f"Policy {policy_id} created successfully",
    }


@router.get("/worker/{worker_id}")
def get_worker_policy(worker_id: str):
    policy = next((p for p in MOCK_POLICIES if p["worker_id"] == worker_id), None)
    if not policy:
        # Auto-generate dynamic mock policy for the new worker
        worker = None
        try:
            from routes.auth import MOCK_WORKERS
            worker = next((w for w in MOCK_WORKERS if w["id"] == worker_id), None)
        except Exception:
            pass

        plan_name = worker["plan"] if worker and "plan" in worker else "Standard"
        plan = PLANS.get(plan_name, PLANS["Standard"])
        
        start_date = datetime.now()
        renew_date = start_date + timedelta(days=7)

        policy = {
            "id": f"POL-{str(len(MOCK_POLICIES) + 1).zfill(3)}",
            "worker_id": worker_id,
            "worker_name": worker["name"] if worker else "Dynamic Worker",
            "plan": plan_name,
            "city": worker["city"] if worker else "Mumbai",
            "zone": "Dynamic API Zone",
            "platform": worker["platform"] if worker else "Gig Platform",
            "weekly_premium": plan["weekly_premium"],
            "max_payout": plan["max_payout"],
            "status": "active",
            "start_date": start_date.isoformat(),
            "renewal_date": renew_date.isoformat(),
            "total_paid_in": 0,
            "total_paid_out": 0,
            "claims_count": 0,
        }
        MOCK_POLICIES.append(policy)

    return {
        "success": True,
        "policy": policy,
        "days_until_renewal": 3,
        "coverage_this_week": {
            "heavy_rain": True,
            "extreme_heat": True,
            "severe_aqi": True,
            "flood_alert": True,
            "bandh_strike": True,
            "night_curfew": True,
            "app_downtime": True,
        },
    }


@router.put("/upgrade")
def upgrade_policy(request: UpdatePolicyRequest):
    new_plan = PLANS.get(request.new_plan)
    if not new_plan:
        return {"error": f"Plan {request.new_plan} not found"}

    return {
        "success": True,
        "policy_id": request.policy_id,
        "new_plan": request.new_plan,
        "new_premium": new_plan["weekly_premium"],
        "new_max_payout": new_plan["max_payout"],
        "effective": "Next weekly cycle",
        "message": f"Policy upgraded to {request.new_plan} plan",
    }


@router.put("/pause/{policy_id}")
def pause_policy(policy_id: str):
    return {
        "success": True,
        "policy_id": policy_id,
        "status": "paused",
        "message": "Policy paused — no premiums charged until resumed",
    }


@router.put("/resume/{policy_id}")
def resume_policy(policy_id: str):
    return {
        "success": True,
        "policy_id": policy_id,
        "status": "active",
        "message": "Policy resumed — coverage active immediately",
    }


@router.get("/all")
def get_all_policies():
    active = len([p for p in MOCK_POLICIES if p["status"] == "active"])
    paused = len([p for p in MOCK_POLICIES if p["status"] == "paused"])

    return {
        "total": len(MOCK_POLICIES),
        "active": active,
        "paused": paused,
        "policies": MOCK_POLICIES,
    }


@router.get("/exclusions")
def get_policy_exclusions():
    return {
        "inclusions": [
            {"id": 1, "name": "Heavy Rainfall", "trigger": ">35mm/hr", "source": "OpenWeatherMap"},
            {"id": 2, "name": "Extreme Heat", "trigger": ">42°C for 2+ hrs", "source": "OpenWeatherMap"},
            {"id": 3, "name": "Severe AQI", "trigger": "AQI >350", "source": "CPCB / OpenAQ"},
            {"id": 4, "name": "Flood Alert", "trigger": "IMD flood zone alert", "source": "IMD API"},
            {"id": 5, "name": "Local Bandh/Strike", "trigger": "Verified notification", "source": "News API"},
            {"id": 6, "name": "Night Shift Safety", "trigger": "Curfew after 10pm", "source": "Govt API"},
            {"id": 7, "name": "Platform Downtime", "trigger": "App down 2+ hrs", "source": "Downdetector"},
        ],
        "exclusions": [
            {"id": 1, "name": "War / Civil Unrest", "reason": "Unquantifiable correlated risk"},
            {"id": 2, "name": "Pandemic / Epidemic", "reason": "Simultaneous mass trigger breaks reserve model"},
            {"id": 3, "name": "Pre-existing Platform Disputes", "reason": "Risk existed before policy was taken"},
            {"id": 4, "name": "Alcohol / Substance Impairment", "reason": "Legal liability exclusion"},
            {"id": 5, "name": "Vehicle Accidents", "reason": "Covered under motor insurance"},
            {"id": 6, "name": "Criminal Activity", "reason": "Standard exclusion across all insurance"},
            {"id": 7, "name": "First 48 Hours Cooling-off", "reason": "Prevents instant claim fraud"},
            {"id": 8, "name": "Voluntary Leave / Holiday", "reason": "Personal choice — no disruption event"},
            {"id": 9, "name": "Self-inflicted Platform Ban", "reason": "Moral hazard"},
        ],
    }
