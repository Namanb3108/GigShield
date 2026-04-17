from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import random
from models.risk_profile import risk_profiler

router = APIRouter()

MOCK_WORKERS = [
    {
        "id": "W-001",
        "name": "Ravi Kumar",
        "phone": "9876543210",
        "city": "Mumbai",
        "platform": "Zomato",
        "plan": "Standard",
        "risk_tier": "Medium",
    }
]


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
    import urllib.request
    import urllib.parse
    import json
    import os

    otp = str(random.randint(1000, 9999))
    print(f"OTP for {request.phone}: {otp}")

    # Fast2SMS Integration
    api_key = os.getenv("FAST2SMS_API_KEY", "elZoLRAOq7vBPHbjNr0nQ4pyDXI3iG8ChMwJxYVE9smW1fkzKUz5bDKV1QkoPphqIWsYnTZwacOrFguv")
    phone_digits = "".join(filter(str.isdigit, request.phone))[-10:]

    url = "https://www.fast2sms.com/dev/bulkV2"
    params = {
        "authorization": api_key,
        "variables_values": otp,
        "route": "otp",
        "numbers": phone_digits
    }
    querystring = urllib.parse.urlencode(params)
    req = urllib.request.Request(f"{url}?{querystring}", headers={'cache-control': "no-cache"})

    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            print(f"Fast2SMS Response: {res_data}")
    except Exception as e:
        print(f"Fast2SMS SMS Delivery Failed: {e}")

    return {
        "success": True,
        "message": f"OTP sent to {request.phone}",
        "demo_otp": otp,
    }


@router.post("/worker/verify-otp")
def verify_otp(request: OTPVerifyRequest):
    if len(request.otp) == 4 and request.otp.isdigit():
        worker = next((w for w in MOCK_WORKERS if w["phone"] == request.phone), None)
        if not worker:
            worker = {
                "id": "W-001",
                "name": "Ravi Kumar",
                "phone": request.phone,
                "city": "Mumbai",
                "platform": "Zomato",
                "plan": "Standard",
                "risk_tier": "Medium",
            }

        return {
            "success": True,
            "token": f"demo-jwt-{worker['id']}",
            "worker": worker,
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

    worker_id = f"W-{random.randint(100, 999)}"
    
    # Store new worker in memory
    new_worker = {
        "id": worker_id,
        "name": request.name.strip(),
        "phone": request.phone,
        "city": request.city,
        "platform": request.platform,
        "plan": recommended_plan,
        "risk_tier": risk_tier,
    }
    MOCK_WORKERS.append(new_worker)

    return {
        "success": True,
        "message": "Worker registered successfully",
        "worker_id": worker_id,
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
