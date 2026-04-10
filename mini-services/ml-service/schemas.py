"""
Pydantic schemas for ML Service API
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    Low = "Low"
    Moderate = "Moderate"
    High = "High"
    Critical = "Critical"


class ALIFactors(BaseModel):
    """Six ALI factors as per the proposal"""
    task_density: float  # Number of active tasks in 7-day window (normalized 0-1)
    assessment_intensity: float  # Frequency/weight of graded evaluations (0-1)
    deadline_clustering: float  # Overlapping deadlines in 3-day windows (0-1)
    research_load: float  # Thesis/capstone workload intensity (0-1)
    extracurricular_load: float  # Org activities, school events (0-1)
    part_time_work: float  # Hours per week of part-time work (0-1)


class WorkloadInput(BaseModel):
    """Input for ALI prediction"""
    user_id: str
    factors: ALIFactors
    historical_ali: Optional[List[float]] = None  # Last 7 days of ALI scores


class ALIPrediction(BaseModel):
    """Single ALI prediction"""
    date: datetime
    ali_score: float  # 0-100
    risk_level: RiskLevel
    confidence: float  # 0-1


class WorkloadPredictionResponse(BaseModel):
    """Response for workload prediction"""
    user_id: str
    current_ali: float
    current_risk_level: RiskLevel
    forecast_7day: List[ALIPrediction]
    forecast_14day: List[ALIPrediction]
    forecast_30day: List[ALIPrediction]
    peak_date: Optional[datetime]
    peak_score: Optional[float]
    recommendations: List[str]


class SyntheticDataRequest(BaseModel):
    """Request for synthetic data generation"""
    num_samples: int = 1000
    seed: Optional[int] = None


class TrainingResponse(BaseModel):
    """Response for model training"""
    success: bool
    samples_used: int
    r2_score: float
    mae: float
    rmse: float
    feature_importance: dict


class ActivityData(BaseModel):
    """Activity data for ALI calculation"""
    active_tasks: int
    tasks_due_in_7_days: int
    graded_tasks_weight: float
    overlapping_deadlines: int
    thesis_active: bool
    org_memberships: int
    org_positions: int
    work_hours_per_week: int
