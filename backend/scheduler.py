import logging
import threading
import time
import random
from datetime import datetime

logger = logging.getLogger("gigshield.scheduler")
_monitor_thread: threading.Thread | None = None

def _send_twilio_notification(worker_phone, amount, trigger_type, claim_id):
    logger.info(f"[TWILIO MOCK] Sent SMS to {worker_phone}:")
    logger.info(f"'GigShield: ₹{amount} credited to your UPI for {trigger_type} disruption. Claim: {claim_id}'")

def _poll_triggers() -> None:
    from routes.triggers import get_all_trigger_status
    from database.postgres import SessionLocal, Policy, Claim, Payout
    from models.fraud_model import fraud_engine
    import uuid

    out = get_all_trigger_status()
    cities = out.get("cities") or {}
    
    db = SessionLocal()
    try:
        total_claims_created = 0
        for city_name, data in cities.items():
            if not data.get("any_active"):
                continue
                
            active_triggers = [k for k, v in data.get("triggers", {}).items() if v]
            if not active_triggers:
                continue
                
            primary_trigger = active_triggers[0]
            
            # Find active policies in this city
            active_policies = db.query(Policy).filter(Policy.city == city_name, Policy.status == "active").all()
            for policy in active_policies:
                # Mock isolation forest check
                claim_id = f"GS-{datetime.now().year}-{random.randint(1000, 9999)}"
                score, flags = fraud_engine.evaluate_claim(
                    gps_distance_km=1.5,
                    claims_last_4_weeks=0,
                    policy_age_hours=100
                )
                
                status = "approved" if score < 0.7 else "flagged"
                amount = policy.max_payout if status == "approved" else 0.0
                
                # We could persist this, but for the scheduler simulation, logging is fine
                # Or persist to DB:
                claim = Claim(
                    id=claim_id,
                    worker_id=policy.worker_id,
                    city=policy.city,
                    zone=policy.zone,
                    trigger_type=primary_trigger,
                    trigger_reading="System Threshold Met",
                    estimated_payout=amount,
                    amount=amount,
                    status=status,
                    fraud_score=score
                )
                db.add(claim)
                
                if status == "approved":
                    payout_id = f"PAY-{random.randint(10000, 99999)}"
                    payout = Payout(
                        id=payout_id,
                        claim_id=claim_id,
                        worker_id=policy.worker_id,
                        amount=amount,
                        upi_id="worker@upi",
                        status="completed",
                        time_to_pay="2.1s"
                    )
                    db.add(payout)
                    _send_twilio_notification("+919876543210", int(amount), primary_trigger, claim_id)
                
                total_claims_created += 1
                
        db.commit()
        logger.info(f"Trigger sweep OK — created {total_claims_created} claims.")
        
    except Exception as e:
        logger.error(f"Error in claim generation logic: {e}")
        db.rollback()
    finally:
        db.close()


def _loop() -> None:
    while True:
        try:
            _poll_triggers()
        except Exception:
            logger.exception("Trigger sweep failed")
        time.sleep(15 * 60)


def start_trigger_monitor() -> threading.Thread:
    global _monitor_thread
    if _monitor_thread and _monitor_thread.is_alive():
        logger.info("Trigger monitor already running")
        return _monitor_thread

    t = threading.Thread(target=_loop, name="gigshield-trigger-monitor", daemon=True)
    t.start()
    _monitor_thread = t
    logger.info("Trigger monitor started (interval 15m)")
    return t
