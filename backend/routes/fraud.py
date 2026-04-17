import random

from fastapi import APIRouter
from typing import Optional
from pydantic import BaseModel

router = APIRouter()


class FraudCheckRequest(BaseModel):
    worker_id: str
    claim_id: str
    city: str
    zone: str
    trigger_type: str
    worker_lat: Optional[float] = None
    worker_lon: Optional[float] = None
    claims_last_4_weeks: Optional[int] = 0
    policy_age_hours: Optional[int] = 72


FRAUD_FLAGS = [
    {
        "id": "FR-091",
        "worker_id": "W-009",
        "worker_name": "Ankit S.",
        "city": "Delhi",
        "trigger_type": "heavy_rain",
        "fraud_score": 0.82,
        "reason": "GPS outside disruption zone",
        "status": "pending_review",
        "created_at": "2026-03-20T10:30:00",
    },
    {
        "id": "FR-087",
        "worker_id": "W-014",
        "worker_name": "Meena R.",
        "city": "Mumbai",
        "trigger_type": "bandh_strike",
        "fraud_score": 0.76,
        "reason": "3rd claim in 4 weeks",
        "status": "pending_review",
        "created_at": "2026-03-18T14:15:00",
    },
    {
        "id": "FR-083",
        "worker_id": "W-021",
        "worker_name": "Vijay P.",
        "city": "Chennai",
        "trigger_type": "extreme_heat",
        "fraud_score": 0.71,
        "reason": "Duplicate event claim detected",
        "status": "pending_review",
        "created_at": "2026-03-15T09:00:00",
    },
]


from models.fraud_model import fraud_engine

def calculate_fraud_score(request: FraudCheckRequest) -> dict:
    distance = 1.5
    if request.worker_lat and request.worker_lon and random.random() < 0.1:
        distance = 15.0 # Mock random spoofing

    score, flags = fraud_engine.evaluate_claim(
        gps_distance_km=distance,
        claims_last_4_weeks=request.claims_last_4_weeks,
        policy_age_hours=request.policy_age_hours
    )

    return {
        "score": score,
        "flags": flags,
        "decision": "flagged" if score >= 0.7 else "approved",
        "model": "IsolationForest + RuleEngine v2.0",
    }


@router.post("/check")
def run_fraud_check(request: FraudCheckRequest):
    result = calculate_fraud_score(request)

    return {
        "success": True,
        "claim_id": request.claim_id,
        "worker_id": request.worker_id,
        "fraud_score": result["score"],
        "decision": result["decision"],
        "flags": result["flags"],
        "model_used": result["model"],
        "next_step": "payout_blocked" if result["decision"] == "flagged" else "payout_approved",
    }


@router.get("/flags")
def get_fraud_flags():
    pending = [f for f in FRAUD_FLAGS if f.get("status") == "pending_review"]
    return {
        "total_flags": len(FRAUD_FLAGS),
        "pending": len(pending),
        "flags": pending,
    }

@router.put("/flags/{flag_id}/resolve")
def resolve_fraud_flag(flag_id: str, action: str):
    flag = next((f for f in FRAUD_FLAGS if f["id"] == flag_id), None)
    if not flag:
        return {"error": f"Flag {flag_id} not found"}

    flag["status"] = "resolved"

    return {
        "success": True,
        "flag_id": flag_id,
        "action": action,
        "message": f"Flag {flag_id} resolved — claim {action}d",
    }


@router.get("/stats")
def get_fraud_stats():
    return {
        "total_claims_checked": 234,
        "auto_approved": 219,
        "flagged_for_review": 15,
        "rejected": 8,
        "flag_rate_percent": 6.4,
        "model_accuracy": "91.2%",
        "avg_check_time_ms": 340,
    }
