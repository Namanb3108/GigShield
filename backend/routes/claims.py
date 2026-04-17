import uuid
from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ClaimRequest(BaseModel):
    worker_id: str
    city: str
    zone: str
    trigger_type: str
    trigger_reading: str
    policy_id: str


class ClaimUpdateRequest(BaseModel):
    claim_id: str
    status: str


MOCK_CLAIMS = [
    {
        "id": "GS-2026-0041",
        "worker_id": "W-001",
        "worker_name": "Ravi Kumar",
        "city": "Mumbai",
        "zone": "Andheri",
        "trigger_type": "heavy_rain",
        "trigger_reading": "52mm/hr",
        "amount": 847,
        "status": "paid",
        "fraud_score": 0.12,
        "created_at": "2026-03-12T14:30:00",
        "paid_at": "2026-03-12T14:32:18",
    },
    {
        "id": "GS-2026-0028",
        "worker_id": "W-001",
        "worker_name": "Ravi Kumar",
        "city": "Delhi",
        "zone": "Dwarka",
        "trigger_type": "extreme_heat",
        "trigger_reading": "44°C for 3hrs",
        "amount": 610,
        "status": "paid",
        "fraud_score": 0.08,
        "created_at": "2026-02-28T11:00:00",
        "paid_at": "2026-02-28T11:02:45",
    },
    {
        "id": "GS-2026-0019",
        "worker_id": "W-002",
        "worker_name": "Priya Sharma",
        "city": "Chennai",
        "zone": "T.Nagar",
        "trigger_type": "bandh_strike",
        "trigger_reading": "Verified bandh",
        "amount": 1200,
        "status": "paid",
        "fraud_score": 0.15,
        "created_at": "2026-02-14T09:00:00",
        "paid_at": "2026-02-14T09:03:10",
    },
]


@router.post("/initiate")
def initiate_claim(request: ClaimRequest):
    claim_id = f"GS-2026-{str(uuid.uuid4())[:4].upper()}"
    hourly_rate = {"Basic": 62, "Standard": 89, "Premium": 125}.get("Standard", 89)
    lost_hours = 3.5
    payout = round(hourly_rate * lost_hours)

    claim = {
        "id": claim_id,
        "worker_id": request.worker_id,
        "worker_name": "Demo Worker",
        "city": request.city,
        "zone": request.zone,
        "trigger_type": request.trigger_type,
        "trigger_reading": request.trigger_reading,
        "amount": payout,
        "estimated_payout": payout,
        "status": "initiated",
        "fraud_score": 0.0,
        "created_at": datetime.now().isoformat(),
        "next_step": "fraud_check",
    }

    MOCK_CLAIMS.insert(0, claim)

    return {
        "success": True,
        "claim": claim,
        "message": f"Claim {claim_id} initiated — running fraud check",
    }


@router.get("/worker/{worker_id}")
def get_worker_claims(worker_id: str):
    claims = [c for c in MOCK_CLAIMS if c["worker_id"] == worker_id]
    total_paid = sum(c["amount"] for c in claims if c["status"] == "paid")

    return {
        "worker_id": worker_id,
        "total_claims": len(claims),
        "total_paid": total_paid,
        "claims": claims,
    }


@router.get("/all")
def get_all_claims():
    total_payout = sum(c["amount"] for c in MOCK_CLAIMS if c["status"] == "paid")

    return {
        "total_claims": len(MOCK_CLAIMS),
        "total_payout": total_payout,
        "claims": MOCK_CLAIMS,
    }


@router.get("/{claim_id}")
def get_claim(claim_id: str):
    claim = next((c for c in MOCK_CLAIMS if c["id"] == claim_id), None)
    if not claim:
        return {"error": f"Claim {claim_id} not found"}
    return claim


@router.put("/update")
def update_claim_status(request: ClaimUpdateRequest):
    return {
        "success": True,
        "claim_id": request.claim_id,
        "status": request.status,
        "message": f"Claim {request.claim_id} marked as {request.status}",
    }


@router.post("/auto-process/{claim_id}")
def auto_process_claim(claim_id: str):
    claim = next((c for c in MOCK_CLAIMS if c["id"] == claim_id), None)
    if claim:
        claim["status"] = "paid"
        claim["paid_at"] = datetime.now().isoformat()

    return {
        "success": True,
        "claim_id": claim_id,
        "pipeline": [
            {"step": "trigger_detected", "status": "done", "time_ms": 120},
            {"step": "claim_initiated", "status": "done", "time_ms": 340},
            {"step": "fraud_check", "status": "done", "time_ms": 890},
            {"step": "fraud_score", "status": "done", "value": 0.12},
            {"step": "payout_fired", "status": "done", "time_ms": 1200},
            {"step": "upi_credited", "status": "done", "time_ms": 1800},
            {"step": "notification_sent", "status": "done", "time_ms": 2100},
        ],
        "total_time_seconds": 2.1,
        "payout_amount": 847,
        "message": "Claim processed and paid in 2.1 seconds",
    }
