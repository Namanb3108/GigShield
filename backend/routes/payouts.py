from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PayoutRequest(BaseModel):
    claim_id: str
    worker_id: str
    amount: float
    upi_id: str | None = "worker@upi"
    trigger_type: str | None = "disruption"


MOCK_PAYOUTS = [
    {
        "id": "PAY-001",
        "claim_id": "GS-2026-0041",
        "worker_id": "W-001",
        "worker_name": "Ravi Kumar",
        "amount": 847,
        "upi_id": "ravi.kumar@upi",
        "status": "success",
        "trigger": "Heavy Rainfall — Andheri",
        "paid_at": "2026-03-12T14:32:18",
        "time_to_pay": "2m 18s",
    },
    {
        "id": "PAY-002",
        "claim_id": "GS-2026-0028",
        "worker_id": "W-001",
        "worker_name": "Ravi Kumar",
        "amount": 610,
        "upi_id": "ravi.kumar@upi",
        "status": "success",
        "trigger": "Extreme Heat — Dwarka",
        "paid_at": "2026-02-28T11:02:45",
        "time_to_pay": "2m 45s",
    },
]


def calculate_payout(plan: str, trigger_duration_hrs: float) -> dict:
    plan_rates = {
        "Basic": {"hourly": 62, "max": 500},
        "Standard": {"hourly": 89, "max": 1200},
        "Premium": {"hourly": 125, "max": 2500},
    }
    rate = plan_rates.get(plan, plan_rates["Standard"])
    raw = round(rate["hourly"] * trigger_duration_hrs)
    capped = min(raw, rate["max"])

    return {
        "hourly_rate": rate["hourly"],
        "trigger_hours": trigger_duration_hrs,
        "raw_payout": raw,
        "capped_at": rate["max"],
        "final_payout": capped,
        "was_capped": raw > rate["max"],
    }


@router.post("/process")
def process_payout(request: PayoutRequest):
    payout = {
        "id": f"PAY-{str(len(MOCK_PAYOUTS) + 1).zfill(3)}",
        "claim_id": request.claim_id,
        "worker_id": request.worker_id,
        "amount": request.amount,
        "upi_id": request.upi_id,
        "status": "success",
        "paid_at": datetime.now().isoformat(),
        "time_to_pay": "2m 18s",
        "razorpay_ref": "RZP_DEMO_123456",
        "message": f"₹{request.amount} credited to {request.upi_id}",
    }

    trigger_name = request.trigger_type.replace('_', ' ').title() if request.trigger_type else "Disruption"
    return {
        "success": True,
        "payout": payout,
        "notification": {
            "whatsapp": f"GigShield: ₹{request.amount} credited to your UPI for {trigger_name} disruption. Claim: {request.claim_id}",
            "sent": True,
        },
    }


@router.get("/worker/{worker_id}")
def get_worker_payouts(worker_id: str):
    payouts = [p for p in MOCK_PAYOUTS if p["worker_id"] == worker_id]
    total_paid = sum(p["amount"] for p in payouts)

    return {
        "worker_id": worker_id,
        "total_payouts": len(payouts),
        "total_amount": total_paid,
        "payouts": payouts,
    }


@router.get("/all")
def get_all_payouts():
    total = sum(p["amount"] for p in MOCK_PAYOUTS)

    return {
        "total_payouts": len(MOCK_PAYOUTS),
        "total_amount": total,
        "avg_time": "2m 31s",
        "payouts": MOCK_PAYOUTS,
    }


@router.post("/calculate")
def calculate_payout_estimate(plan: str, trigger_duration_hrs: float):
    result = calculate_payout(plan, trigger_duration_hrs)
    return {
        "success": True,
        "plan": plan,
        **result,
    }


@router.get("/stats")
def get_payout_stats():
    return {
        "total_paid_this_month": 57400,
        "total_paid_all_time": 284600,
        "avg_payout_amount": 847,
        "avg_time_to_pay": "2m 31s",
        "fastest_payout": "1m 12s",
        "success_rate": "99.8%",
        "razorpay_fees_total": 1420,
    }
