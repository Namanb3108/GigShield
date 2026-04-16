import random
import logging
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Try to import xgboost, fallback to a Scikit-Learn regressor or simple model
try:
    import xgboost as xgb
    HAS_XGBOOST = True
except Exception as e:
    from sklearn.ensemble import RandomForestRegressor
    HAS_XGBOOST = False
    logger.warning(f"XGBoost failed to load: {e}. Falling back to RandomForestRegressor.")

class DynamicPremiumModel:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self._train_mock_data()

    def _train_mock_data(self):
        logger.info("Generating synthetic data for Premium Model...")
        np.random.seed(42)
        n_samples = 1000
        
        # Synthetic features: 
        # city (0..4), zone_risk (1-10), season_risk (1-3), claims (0-5), tenure_months (1-48), platform (0-1)
        X = pd.DataFrame({
            "city_code": np.random.randint(0, 5, n_samples),
            "zone_risk": np.random.randint(1, 11, n_samples),
            "season_risk": np.random.randint(1, 4, n_samples),
            "claims": np.random.randint(0, 6, n_samples),
            "tenure_months": np.random.randint(1, 49, n_samples),
            "platform_code": np.random.randint(0, 2, n_samples)
        })
        
        # Base premium + risk additions - tenure discount
        # Target: dynamic multiplier or flat addition
        y = (50 + 
             X["zone_risk"] * 5 + 
             X["season_risk"] * 10 + 
             X["claims"] * 15 - 
             (X["tenure_months"] / 12) * 2)
        
        if HAS_XGBOOST:
            self.model = xgb.XGBRegressor(n_estimators=50, max_depth=3, learning_rate=0.1, random_state=42)
            self.model.fit(X, y)
        else:
            self.model = RandomForestRegressor(n_estimators=50, max_depth=3, random_state=42)
            self.model.fit(X, y)
            
        self.is_trained = True
        logger.info(f"Premium Model trained using {'XGBoost' if HAS_XGBOOST else 'RandomForestFallback'}")

    def calculate_premium(self, base_premium: float, city: str, zone: str, platform: str, claims: int = 0, tenure_months: int = 6):
        if not self.is_trained:
            return base_premium, []
            
        # Feature encoding
        cities = ["Mumbai", "Chennai", "Delhi", "Bengaluru", "Hyderabad"]
        city_code = cities.index(city) if city in cities else 0
        platform_code = 1 if platform.lower() == "zomato" else 0
        
        # Mocking hyper-local zone risk based on string length (hash simulation)
        zone_risk = (len(zone) % 10) + 1 
        season_risk = 2 # e.g., Monsoon=3, Summer=2, Winter=1 (mock)
        
        # Build dataframe
        input_data = pd.DataFrame({
            "city_code": [city_code],
            "zone_risk": [zone_risk],
            "season_risk": [season_risk],
            "claims": [claims],
            "tenure_months": [tenure_months],
            "platform_code": [platform_code]
        })
        
        prediction = self.model.predict(input_data)[0]
        
        # Model predicts a completely derived premium value. Let's create factors to explain it.
        # We blend the prediction with the base premium for realism
        diff = prediction - 50 # 50 is our synthetic base
        final_premium = round(base_premium + diff)
        final_premium = max(29, final_premium) # Floor
        
        factors = []
        if zone_risk > 5:
            factors.append({"name": "Hyper-local risk", "multiplier": "1.15", "detail": f"{zone} has high historical disruption"})
        else:
            factors.append({"name": "Safe zone discount", "multiplier": "0.95", "detail": f"{zone} has robust weather resilience"})
            
        if season_risk > 1:
            factors.append({"name": "Seasonality", "multiplier": "1.10", "detail": "Current season carries higher disruption likelihood"})
            
        if tenure_months > 12:
            factors.append({"name": "Loyalty discount", "multiplier": "0.90", "detail": f"{tenure_months}+ months platform tenure"})
            
        factors.append({"name": "Base Coverage", "multiplier": "1.0", "detail": f"Standard coverage logic"})
        
        return final_premium, factors

premium_engine = DynamicPremiumModel()
