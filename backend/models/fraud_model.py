import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

logger = logging.getLogger(__name__)

class FraudDetectionModel:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.is_trained = False
        self._train_mock_data()

    def _train_mock_data(self):
        logger.info("Generating synthetic anomaly data for Isolation Forest...")
        np.random.seed(42)
        # Normal data
        normal_data = pd.DataFrame({
            "gps_distance_km": np.random.normal(1.5, 1.0, 900), # within 3km of zone
            "claims_last_4_weeks": np.random.randint(0, 2, 900),
            "policy_age_hours": np.random.randint(72, 1000, 900)
        })
        # Anomalous data (fraud rings)
        fraud_data = pd.DataFrame({
            "gps_distance_km": np.random.normal(15.0, 5.0, 100), # spoofed or far
            "claims_last_4_weeks": np.random.randint(2, 6, 100),
            "policy_age_hours": np.random.randint(1, 48, 100)
        })
        
        X = pd.concat([normal_data, fraud_data], ignore_index=True)
        self.model.fit(X)
        self.is_trained = True
        logger.info("Fraud Detection Model (Isolation Forest) trained.")

    def evaluate_claim(self, gps_distance_km: float, claims_last_4_weeks: int, policy_age_hours: int):
        """
        Returns fraud score 0.0 to 1.0
        Combines Isolation Forest anomaly score with explicit business rules.
        """
        flags = []
        base_score = 0.0
        
        # Rule Engine overlay
        if policy_age_hours < 48:
            base_score += 0.40
            flags.append("Policy created within 48 hours cooling-off period")
            
        if claims_last_4_weeks >= 3:
            base_score += 0.30
            flags.append(f"{claims_last_4_weeks} claims in last 4 weeks")
            
        # Isolation Forest overlay
        if self.is_trained:
            input_data = pd.DataFrame({
                "gps_distance_km": [gps_distance_km],
                "claims_last_4_weeks": [claims_last_4_weeks],
                "policy_age_hours": [policy_age_hours]
            })
            
            # Predict returns 1 for normal, -1 for anomaly
            # decision_function returns average anomaly score (negative is more anomalous)
            anomaly_score = self.model.decision_function(input_data)[0]
            
            if anomaly_score < 0:
                base_score += 0.35 + (abs(anomaly_score) * 0.5)
                flags.append("Multi-variate anomaly detected (GPS/Timing inconsistency)")
                
        final_score = min(round(base_score, 2), 1.0)
        return final_score, flags

fraud_engine = FraudDetectionModel()
