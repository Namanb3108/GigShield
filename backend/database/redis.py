import os
import redis
import logging

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class RedisClient:
    def __init__(self):
        self._cache = {}
        self._use_fallback = False
        try:
            self.client = redis.Redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=1)
            self.client.ping()
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Could not connect to Redis: {e}. Using in-memory fallback.")
            self._use_fallback = True

    def set(self, key: str, value: str, ex: int = None):
        if self._use_fallback:
            self._cache[key] = value
            return True
        else:
            try:
                return self.client.set(key, value, ex=ex)
            except Exception:
                self._cache[key] = value
                return True

    def get(self, key: str):
        if self._use_fallback:
            return self._cache.get(key)
        else:
            try:
                res = self.client.get(key)
                if res is None:
                    return self._cache.get(key)
                return res
            except Exception:
                return self._cache.get(key)

redis_client = RedisClient()
