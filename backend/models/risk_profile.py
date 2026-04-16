import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

logger = logging.getLogger(__name__)

class RiskProfileModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.is_trained = False
        self._train_mock_data()

    def _train_mock_data(self):
        logger.info("Generating synthetic data for Risk Profile Model...")
        np.random.seed(42)
        n_samples = 1500
        
        # Inputs: city, platform, weekly_hours, season
        # We generate categorical codes
        X = pd.DataFrame({
            "city_code": np.random.randint(0, 5, n_samples),
            "platform_code": np.random.randint(0, 2, n_samples),
            "weekly_hours": np.random.randint(10, 60, n_samples),
            "season_code": np.random.randint(0, 3, n_samples)
        })
        
        # Output: Risk Tier (0=Low, 1=Medium, 2=High)
        # Higher hours + higher season risk -> High Tier
        tier_scores = X["weekly_hours"] / 10 + X["season_code"] * 2
        y = np.where(tier_scores > 7, 2, np.where(tier_scores > 4, 1, 0))
        
        self.model.fit(X, y)
        self.is_trained = True
        logger.info("Risk Profile Model trained.")

    def predict_risk(self, city: str, platform: str, weekly_hours: str):
        if not self.is_trained:
            return "Medium"
            
        cities = ["Mumbai", "Chennai", "Delhi", "Bengaluru", "Hyderabad"]
        city_code = cities.index(city) if city in cities else 0
        platform_code = 1 if platform.lower() == "zomato" else 0
        
        hours = 20
        if "40" in weekly_hours and "+" in weekly_hours:
            hours = 45
        elif "20-40" in weekly_hours:
            hours = 30
        
        input_data = pd.DataFrame({
            "city_code": [city_code],
            "platform_code": [platform_code],
            "weekly_hours": [hours],
            "season_code": [1] # Default mock season
        })
        
        pred = self.model.predict(input_data)[0]
        mapping = {0: "Low", 1: "Medium", 2: "High"}
        return mapping.get(pred, "Medium")

risk_profiler = RiskProfileModel()
