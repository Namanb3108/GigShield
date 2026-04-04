from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import os

load_dotenv()

logging.basicConfig(level=logging.INFO)

from routes.auth import router as auth_router
from routes.policy import router as policy_router
from routes.triggers import router as triggers_router
from routes.claims import router as claims_router
from routes.fraud import router as fraud_router
from routes.payouts import router as payouts_router
from scheduler import start_trigger_monitor

app = FastAPI(
    title="GigShield API",
    description="Parametric Income Insurance for Food Delivery Partners",
    version="1.0.0",
)

frontend_origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(frontend_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,     prefix="/api/auth",     tags=["Authentication"])
app.include_router(policy_router,   prefix="/api/policy",   tags=["Policies"])
app.include_router(triggers_router, prefix="/api/triggers", tags=["Triggers"])
app.include_router(claims_router,   prefix="/api/claims",   tags=["Claims"])
app.include_router(fraud_router,    prefix="/api/fraud",    tags=["Fraud Detection"])
app.include_router(payouts_router,  prefix="/api/payouts",  tags=["Payouts"])

@app.get("/")
def root():
    return {"status": "ok", "app": "GigShield API", "version": "1.0.0", "docs": "/docs"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "database": "connected", "cache": "connected", "triggers": "monitoring"}


@app.on_event("startup")
def _startup():
    start_trigger_monitor()
