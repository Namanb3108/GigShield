"""
Background trigger monitor — polls disruption signals every 15 minutes.
In production, persist results and enqueue claim eligibility checks.
"""

import logging
import threading
import time

logger = logging.getLogger("gigshield.scheduler")
_monitor_thread: threading.Thread | None = None


def _poll_triggers() -> None:
    # Late import so FastAPI app loads first
    from routes.triggers import get_all_trigger_status

    out = get_all_trigger_status()
    cities = out.get("cities") or {}
    active = sum(1 for c in cities.values() if c.get("any_active"))
    logger.info(
        "Trigger sweep OK — cities=%s any_active=%s mock=%s",
        len(cities),
        active,
        any(cities.get(c, {}).get("mock_data") for c in cities),
    )


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
