"""
HeronPulse ML Service - FastAPI Application
Academic Load Index (ALI) Prediction with Gradient Boosting Regression
"""
import os
import sys
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from schemas import (
    ALIFactors, WorkloadInput, WorkloadPredictionResponse,
    ALIPrediction, SyntheticDataRequest, TrainingResponse,
    ActivityData, RiskLevel
)
from models.ali_model import ali_model
from utils.data_generator import data_generator


# Model path
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'ali_model.joblib')


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup: Try to load existing model or train new one
    print("🚀 Starting ML Service...")
    
    if os.path.exists(MODEL_PATH):
        print("📥 Loading existing model...")
        ali_model.load_model(MODEL_PATH)
        print("✅ Model loaded successfully!")
    else:
        print("🔧 No existing model found. Training new model...")
        # Generate synthetic data and train
        X, y = data_generator.generate_dataset(num_samples=2000)
        metrics = ali_model.train(X, y)
        
        # Save model
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        ali_model.save_model(MODEL_PATH)
        print(f"✅ Model trained and saved! R² = {metrics['r2_score']:.4f}")
    
    yield
    
    # Shutdown: Save model
    print("💾 Saving model before shutdown...")
    if ali_model.is_trained:
        ali_model.save_model(MODEL_PATH)
    print("👋 ML Service stopped.")


app = FastAPI(
    title="HeronPulse ML Service",
    description="Academic Load Index (ALI) Prediction API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== HEALTH CHECK ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "HeronPulse ML Service",
        "status": "healthy",
        "model_loaded": ali_model.is_trained,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model": {
            "loaded": ali_model.is_trained,
            "features": ali_model.feature_names if ali_model.is_trained else []
        },
        "timestamp": datetime.now().isoformat()
    }


# ==================== ALI PREDICTION ====================

@app.post("/api/predict", response_model=WorkloadPredictionResponse)
async def predict_workload(input_data: WorkloadInput):
    """
    Predict workload using ALI model
    
    Returns multi-horizon forecasts (7-day, 14-day, 30-day)
    """
    try:
        # Convert factors to dict
        factors_dict = input_data.factors.model_dump()
        
        # Get current ALI
        current_ali = ali_model.predict(factors_dict)
        current_risk = ali_model.get_risk_level(current_ali)
        
        # Generate forecasts
        forecast_7 = ali_model.predict_forecast(
            factors_dict, 
            input_data.historical_ali, 
            horizon_days=7
        )
        forecast_14 = ali_model.predict_forecast(
            factors_dict, 
            input_data.historical_ali, 
            horizon_days=14
        )
        forecast_30 = ali_model.predict_forecast(
            factors_dict, 
            input_data.historical_ali, 
            horizon_days=30
        )
        
        # Find peak
        all_forecasts = forecast_30
        peak = max(all_forecasts, key=lambda x: x['ali_score'])
        peak_date = datetime.fromisoformat(peak['date']) if peak['ali_score'] > 70 else None
        peak_score = peak['ali_score'] if peak['ali_score'] > 70 else None
        
        # Generate recommendations
        recommendations = generate_recommendations(factors_dict, current_ali, current_risk)
        
        return WorkloadPredictionResponse(
            user_id=input_data.user_id,
            current_ali=round(current_ali, 2),
            current_risk_level=RiskLevel(current_risk),
            forecast_7day=[ALIPrediction(**f) for f in forecast_7],
            forecast_14day=[ALIPrediction(**f) for f in forecast_14],
            forecast_30day=[ALIPrediction(**f) for f in forecast_30],
            peak_date=peak_date,
            peak_score=peak_score,
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/calculate-ali")
async def calculate_ali(factors: ALIFactors):
    """
    Calculate ALI score from raw factors
    Does not use ML model, just weighted calculation
    """
    factors_dict = factors.model_dump()
    ali_score = ali_model.calculate_ali(factors_dict)
    risk_level = ali_model.get_risk_level(ali_score)
    
    return {
        "ali_score": round(ali_score, 2),
        "risk_level": risk_level,
        "factors": factors_dict,
        "factor_contributions": {
            k: round(v * w * 100, 2) 
            for k, v, w in [
                (k, v, ali_model.FEATURE_WEIGHTS[k]) 
                for k, v in factors_dict.items()
            ]
        }
    }


@app.post("/api/calculate-factors", response_model=ALIFactors)
async def calculate_factors(activity: ActivityData):
    """
    Calculate normalized ALI factors from raw activity data
    
    Normalizes raw counts/hours to 0-1 scale
    """
    # Normalize each factor
    task_density = min(1, activity.tasks_due_in_7_days / 10)  # 10+ tasks = max
    
    assessment_intensity = min(1, activity.graded_tasks_weight / 15)  # 15+ weight = max
    
    deadline_clustering = min(1, activity.overlapping_deadlines / 5)  # 5+ overlaps = max
    
    research_load = 0.7 if activity.thesis_active else 0.0
    
    # Org involvement: 0 orgs = 0, 1 org = 0.3, 2+ orgs with position = high
    extracurricular_load = min(1, (activity.org_memberships * 0.25 + activity.org_positions * 0.25))
    
    # Part-time work: 30+ hours = max
    part_time_work = min(1, activity.work_hours_per_week / 30)
    
    return ALIFactors(
        task_density=task_density,
        assessment_intensity=assessment_intensity,
        deadline_clustering=deadline_clustering,
        research_load=research_load,
        extracurricular_load=extracurricular_load,
        part_time_work=part_time_work
    )


# ==================== MODEL MANAGEMENT ====================

@app.post("/api/train", response_model=TrainingResponse)
async def train_model(request: SyntheticDataRequest, background_tasks: BackgroundTasks):
    """
    Train/retrain the ALI model with synthetic data
    """
    try:
        # Generate training data
        X, y = data_generator.generate_dataset(
            num_samples=request.num_samples,
            seed=request.seed
        )
        
        # Train model
        metrics = ali_model.train(X, y)
        
        # Save model
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        ali_model.save_model(MODEL_PATH)
        
        return TrainingResponse(
            success=True,
            samples_used=request.num_samples,
            r2_score=round(metrics['r2_score'], 4),
            mae=round(metrics['mae'], 4),
            rmse=round(metrics['rmse'], 4),
            feature_importance=metrics['feature_importance']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/model/info")
async def get_model_info():
    """Get information about the trained model"""
    return {
        "is_trained": ali_model.is_trained,
        "feature_names": ali_model.feature_names,
        "feature_weights": ali_model.FEATURE_WEIGHTS,
        "risk_thresholds": ali_model.RISK_THRESHOLDS
    }


# ==================== SYNTHETIC DATA ====================

@app.post("/api/generate-synthetic")
async def generate_synthetic_data(request: SyntheticDataRequest):
    """Generate synthetic dataset for analysis"""
    X, y = data_generator.generate_dataset(
        num_samples=request.num_samples,
        seed=request.seed
    )
    
    return {
        "samples": request.num_samples,
        "features": ali_model.feature_names if ali_model.feature_names else [
            'task_density', 'assessment_intensity', 'deadline_clustering',
            'research_load', 'extracurricular_load', 'part_time_work'
        ],
        "ali_stats": {
            "mean": float(np.mean(y)),
            "std": float(np.std(y)),
            "min": float(np.min(y)),
            "max": float(np.max(y))
        },
        "feature_stats": {
            name: {
                "mean": float(np.mean(X[:, i])),
                "std": float(np.std(X[:, i]))
            }
            for i, name in enumerate(ali_model.feature_names or [
                'task_density', 'assessment_intensity', 'deadline_clustering',
                'research_load', 'extracurricular_load', 'part_time_work'
            ])
        }
    }


@app.post("/api/generate-timeseries")
async def generate_timeseries(profile: Dict):
    """Generate time series data for a student profile"""
    time_series = data_generator.generate_time_series(profile)
    
    return {
        "profile": profile,
        "time_series": time_series,
        "peak_week": max(time_series, key=lambda x: x['ali_score'])['week'],
        "avg_ali": np.mean([t['ali_score'] for t in time_series])
    }


# ==================== RECOMMENDATIONS ====================

def generate_recommendations(
    factors: Dict[str, float],
    ali_score: float,
    risk_level: str
) -> List[str]:
    """Generate personalized recommendations based on ALI factors"""
    recommendations = []
    
    # High-risk recommendations
    if risk_level in ['High', 'Critical']:
        recommendations.append(
            "⚠️ Your workload is at a critical level. Consider reaching out to your "
            "academic advisor or professor for support."
        )
    
    # Task density recommendations
    if factors.get('task_density', 0) > 0.7:
        recommendations.append(
            "📋 You have a high concentration of tasks. Consider using the Pomodoro "
            "technique to maintain focus and take scheduled breaks."
        )
    
    # Assessment intensity recommendations
    if factors.get('assessment_intensity', 0) > 0.7:
        recommendations.append(
            "📝 Multiple assessments are due soon. Prioritize by weight and create "
            "a study schedule to avoid cramming."
        )
    
    # Deadline clustering recommendations
    if factors.get('deadline_clustering', 0) > 0.6:
        recommendations.append(
            "⏰ Several deadlines are clustered together. Consider negotiating "
            "extensions or starting early on longer tasks."
        )
    
    # Research load recommendations
    if factors.get('research_load', 0) > 0.6:
        recommendations.append(
            "🔬 Your thesis/capstone workload is significant. Schedule regular "
            "check-ins with your adviser to stay on track."
        )
    
    # Extracurricular recommendations
    if factors.get('extracurricular_load', 0) > 0.6:
        recommendations.append(
            "🎯 High extracurricular involvement detected. Consider delegating "
            "tasks or temporarily reducing activities during peak academic periods."
        )
    
    # Part-time work recommendations
    if factors.get('part_time_work', 0) > 0.6:
        recommendations.append(
            "💼 Your part-time work hours may be affecting your academic performance. "
            "Consider discussing flexible hours with your employer."
        )
    
    # General recommendations based on risk
    if risk_level == 'Low':
        recommendations.append(
            "✅ Your workload is manageable. Great time to get ahead on upcoming tasks "
            "or work on long-term projects."
        )
    elif risk_level == 'Moderate':
        recommendations.append(
            "📊 Your workload is moderate. Stay organized and maintain your current pace."
        )
    
    return recommendations


# ==================== RUN SERVER ====================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.environ.get("PORT", 3030))
    
    print(f"""
    ╔══════════════════════════════════════════════════════════╗
    ║         HeronPulse ML Service - ALI Prediction          ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Port: {port}                                               ║
    ║  Model: Gradient Boosting Regression                     ║
    ║  Features: 6 ALI Factors                                 ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(app, host="0.0.0.0", port=port)
