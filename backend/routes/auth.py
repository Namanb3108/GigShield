from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import random
from models.risk_profile import risk_profiler

router = APIRouter()


class WorkerLoginRequest(BaseModel):
    phone: str
    platform: str


class AdminLoginRequest(BaseModel):
    email: str
    password: str
    organisation: str


class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str


class RegisterRequest(BaseModel):
    name: str
    phone: str
    city: str
    platform: str
    hours: str


@router.post("/worker/send-otp")
def send_otp(request: WorkerLoginRequest):
    otp = str(random.randint(1000, 9999))
    print(f"OTP for {request.phone}: {otp}")
    return {
        "success": True,
        "message": f"OTP sent to {request.phone}",
        "demo_otp": otp,
    }


@router.post("/worker/verify-otp")
def verify_otp(request: OTPVerifyRequest):
    if len(request.otp) == 4 and request.otp.isdigit():
        return {
            "success": True,
            "token": "demo-jwt-token-worker-123",
            "worker": {
                "id": "W-001",
                "name": "Ravi Kumar",
                "phone": request.phone,
                "city": "Mumbai",
                "platform": "Zomato",
                "plan": "Standard",
                "risk_tier": "Medium",
            },
        }
    raise HTTPException(status_code=400, detail="Invalid OTP")


@router.post("/worker/register")
def register_worker(request: RegisterRequest):
    risk_tier = risk_profiler.predict_risk(
        city=request.city,
        platform=request.platform,
        weekly_hours=request.hours
    )
    
    # Recommendation logic based on hours
    recommended_plan = "Standard"
    if "40" in request.hours and "+" in request.hours:
        recommended_plan = "Premium"
    elif "Less" in request.hours or "20" in request.hours and "40" not in request.hours:
        recommended_plan = "Basic"
    return {
        "success": True,
        "message": "Worker registered successfully",
        "worker_id": f"W-{random.randint(100, 999)}",
        "risk_tier": risk_tier,
        "recommended_plan": recommended_plan,
    }


@router.post("/admin/login")
def admin_login(request: AdminLoginRequest):
    return {
        "success": True,
        "token": "demo-jwt-token-admin-456",
        "admin": {
            "id": "A-001",
            "email": request.email,
            "organisation": request.organisation,
            "role": "insurer",
        },
    }


@router.get("/me")
def get_current_user():
    return {
        "id": "W-001",
        "name": "Ravi Kumar",
        "phone": "+91 98765 43210",
        "city": "Mumbai",
        "platform": "Zomato",
        "plan": "Standard",
        "risk_tier": "Medium",
        "member_since": "2026-01-01",
    }
