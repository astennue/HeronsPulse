"""
Academic Load Index (ALI) Prediction Model
Using Gradient Boosting Regression as per the proposal
"""
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import os
from typing import Tuple, List, Dict, Optional
from datetime import datetime, timedelta


class ALIPredictor:
    """
    ALI Prediction Model using Gradient Boosting Regression
    
    The ALI score (0-100) is a composite of 6 factors:
    1. Task Density - active tasks in 7-day window
    2. Assessment Intensity - frequency/weight of graded evaluations
    3. Deadline Clustering - overlapping deadlines in 3-day windows
    4. Research Load - thesis/capstone workload
    5. Extracurricular Load - org activities, events
    6. Part-time Work Interference - employment hours
    """
    
    # Feature weights based on proposal (can be tuned)
    FEATURE_WEIGHTS = {
        'task_density': 0.20,
        'assessment_intensity': 0.25,
        'deadline_clustering': 0.20,
        'research_load': 0.15,
        'extracurricular_load': 0.10,
        'part_time_work': 0.10
    }
    
    # Risk thresholds
    RISK_THRESHOLDS = {
        'Low': (0, 40),
        'Moderate': (41, 70),
        'High': (71, 85),
        'Critical': (86, 100)
    }
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = list(self.FEATURE_WEIGHTS.keys())
        
    def calculate_ali(self, factors: Dict[str, float]) -> float:
        """
        Calculate ALI score from normalized factor values
        
        Args:
            factors: Dictionary with normalized (0-1) values for each factor
            
        Returns:
            ALI score between 0-100
        """
        ali = 0.0
        for feature, weight in self.FEATURE_WEIGHTS.items():
            ali += factors.get(feature, 0) * weight * 100
        return min(100, max(0, ali))
    
    def get_risk_level(self, ali_score: float) -> str:
        """Determine risk level from ALI score"""
        if ali_score <= 40:
            return 'Low'
        elif ali_score <= 70:
            return 'Moderate'
        elif ali_score <= 85:
            return 'High'
        else:
            return 'Critical'
    
    def train(self, X: np.ndarray, y: np.ndarray) -> Dict:
        """
        Train the GBR model
        
        Args:
            X: Feature matrix (n_samples, n_features)
            y: Target ALI scores (n_samples,)
            
        Returns:
            Training metrics
        """
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train GBR model with hyperparameters from proposal
        self.model = GradientBoostingRegressor(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=5,
            min_samples_split=5,
            min_samples_leaf=3,
            subsample=0.8,
            random_state=42
        )
        
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True
        
        # Calculate metrics
        y_pred = self.model.predict(X_test_scaled)
        
        metrics = {
            'r2_score': r2_score(y_test, y_pred),
            'mae': mean_absolute_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'feature_importance': dict(zip(
                self.feature_names,
                self.model.feature_importances_.tolist()
            ))
        }
        
        return metrics
    
    def predict(self, factors: Dict[str, float]) -> float:
        """
        Predict ALI score using trained model
        
        Args:
            factors: Dictionary with normalized (0-1) values for each factor
            
        Returns:
            Predicted ALI score
        """
        if not self.is_trained:
            # Fallback to weighted calculation if model not trained
            return self.calculate_ali(factors)
        
        # Prepare features
        X = np.array([[factors.get(f, 0) for f in self.feature_names]])
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        return min(100, max(0, prediction))
    
    def predict_forecast(
        self,
        current_factors: Dict[str, float],
        historical_ali: Optional[List[float]] = None,
        horizon_days: int = 30
    ) -> List[Dict]:
        """
        Generate multi-horizon ALI forecast
        
        Args:
            current_factors: Current normalized factor values
            historical_ali: Last 7 days of ALI scores (for trend analysis)
            horizon_days: Number of days to forecast
            
        Returns:
            List of daily forecasts
        """
        forecasts = []
        base_date = datetime.now()
        
        # Analyze trend from historical data
        trend = 0.0
        if historical_ali and len(historical_ali) >= 3:
            # Simple linear trend
            x = np.arange(len(historical_ali))
            trend = np.polyfit(x, historical_ali, 1)[0]
        
        current_ali = self.predict(current_factors)
        
        for day in range(1, horizon_days + 1):
            # Simulate factor changes (in real app, these would come from scheduled tasks)
            # Add some variability based on typical academic patterns
            variation = np.sin(day * np.pi / 7) * 0.1  # Weekly pattern
            noise = np.random.normal(0, 0.02)  # Small random noise
            
            # Adjust factors with trend and variation
            adjusted_factors = {}
            for feature in self.feature_names:
                base_value = current_factors.get(feature, 0)
                # Apply trend and variation
                adjusted_value = base_value * (1 + trend * day / 100 + variation + noise)
                adjusted_factors[feature] = max(0, min(1, adjusted_value))
            
            predicted_ali = self.predict(adjusted_factors)
            
            forecasts.append({
                'date': (base_date + timedelta(days=day)).isoformat(),
                'ali_score': round(predicted_ali, 2),
                'risk_level': self.get_risk_level(predicted_ali),
                'confidence': max(0.5, 1 - (day / (horizon_days * 2)))  # Confidence decreases with horizon
            })
        
        return forecasts
    
    def save_model(self, path: str):
        """Save trained model to disk"""
        if self.is_trained:
            joblib.dump({
                'model': self.model,
                'scaler': self.scaler,
                'feature_names': self.feature_names
            }, path)
    
    def load_model(self, path: str):
        """Load trained model from disk"""
        if os.path.exists(path):
            data = joblib.load(path)
            self.model = data['model']
            self.scaler = data['scaler']
            self.feature_names = data['feature_names']
            self.is_trained = True


# Global model instance
ali_model = ALIPredictor()
