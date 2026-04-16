import logging
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

try:
    from prophet import Prophet
    HAS_PROPHET = True
except ImportError:
    from sklearn.linear_model import LinearRegression
    HAS_PROPHET = False

class DisruptionForecastModel:
    def __init__(self):
        self.models = {}
        self.is_trained = False
        self._train_mock_data()

    def _train_mock_data(self):
        logger.info("Generating synthetic historical disruption data for Forecasting...")
        np.random.seed(42)
        cities = ["Mumbai", "Chennai", "Delhi", "Bengaluru", "Hyderabad"]
        
        # 365 days of mock disruption ratios
        dates = pd.date_range(end=datetime.now(), periods=365)
        
        for city in cities:
            base_risk = np.random.uniform(0.05, 0.25)
            # Add some seasonality (sine wave) + noise
            seasonality = np.sin(np.arange(365) * (2 * np.pi / 365)) * 0.15
            noise = np.random.normal(0, 0.05, 365)
            y = np.clip(base_risk + seasonality + noise, 0, 1.0)
            
            df = pd.DataFrame({"ds": dates, "y": y})
            
            if HAS_PROPHET:
                m = Prophet(yearly_seasonality=True, daily_seasonality=False)
                m.fit(df)
                self.models[city] = m
            else:
                # Fallback to linear interpolation mapped to days
                df['day_of_year'] = df['ds'].dt.dayofyear
                m = LinearRegression()
                m.fit(df[['day_of_year']], df['y'])
                self.models[city] = m
                
        self.is_trained = True
        logger.info(f"Forecast Model trained using {'Prophet' if HAS_PROPHET else 'LinearRegression Fallback'}.")

    def get_7_day_forecast(self, city: str):
        if not self.is_trained or city not in self.models:
            return []
            
        today = datetime.now()
        forecast_dates = [today + timedelta(days=i) for i in range(1, 8)]
        
        if HAS_PROPHET:
            future = pd.DataFrame({"ds": forecast_dates})
            prediction = self.models[city].predict(future)
            probs = np.clip(prediction['yhat'].values, 0, 1)
        else:
            future_doy = pd.DataFrame({"day_of_year": [d.timetuple().tm_yday for d in forecast_dates]})
            probs = np.clip(self.models[city].predict(future_doy), 0, 1)

        result = []
        for i, d in enumerate(forecast_dates):
            prob = probs[i]
            
            # Map probability to risk level
            if prob > 0.6:
                level = "high"
                driver = "Severe Weather Alert"
            elif prob > 0.3:
                level = "medium"
                driver = "Seasonal variance"
            else:
                level = "low"
                driver = "Clear conditions"
                
            result.append({
                "date": d.strftime("%Y-%m-%d"),
                "day_label": d.strftime("%A"),
                "disruption_probability": float(prob),
                "expected_risk_level": level,
                "top_drivers": driver
            })
            
        return result

forecaster = DisruptionForecastModel()
