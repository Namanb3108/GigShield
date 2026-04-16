import os
import logging
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gigshield_fallback.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info(f"Connected to DB using {DATABASE_URL}")
except Exception as e:
    logger.error(f"Failed to connect to DB: {e}")
    # Fallback guaranteed to be sqlite
    engine = create_engine("sqlite:///./gigshield_fallback.db", connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Worker(Base):
    __tablename__ = "workers"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, unique=True, index=True)
    city = Column(String)
    platform = Column(String)
    plan = Column(String)
    risk_tier = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Policy(Base):
    __tablename__ = "policies"
    id = Column(String, primary_key=True, index=True)
    worker_id = Column(String, index=True)
    plan = Column(String)
    city = Column(String)
    zone = Column(String)
    platform = Column(String)
    weekly_premium = Column(Float)
    max_payout = Column(Float)
    status = Column(String, default="active")
    start_date = Column(DateTime)
    renewal_date = Column(DateTime)

class Claim(Base):
    __tablename__ = "claims"
    id = Column(String, primary_key=True, index=True)
    worker_id = Column(String, index=True)
    city = Column(String)
    zone = Column(String)
    trigger_type = Column(String)
    trigger_reading = Column(String)
    estimated_payout = Column(Float)
    amount = Column(Float, nullable=True)
    status = Column(String)
    fraud_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)

class Payout(Base):
    __tablename__ = "payouts"
    id = Column(String, primary_key=True, index=True)
    claim_id = Column(String, index=True)
    worker_id = Column(String, index=True)
    amount = Column(Float)
    upi_id = Column(String)
    status = Column(String)
    paid_at = Column(DateTime, default=datetime.utcnow)
    time_to_pay = Column(String)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
