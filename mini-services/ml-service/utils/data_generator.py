"""
Synthetic Data Generator for ALI Model Training
Generates realistic academic workload scenarios
"""
import numpy as np
import pandas as pd
from typing import Tuple, List, Dict
from datetime import datetime, timedelta
import random


class SyntheticDataGenerator:
    """
    Generates synthetic academic workload data for ML training
    
    Simulates realistic student scenarios based on:
    - Academic calendar patterns (semestral peaks)
    - Task distribution patterns
    - Assessment scheduling
    - Extracurricular involvement
    - Part-time work scenarios
    """
    
    # Academic calendar phases (relative intensity multipliers)
    ACADEMIC_PHASES = {
        'start': (0, 2, 0.6),      # Weeks 0-2: Low intensity
        'normal': (2, 10, 0.8),    # Weeks 2-10: Normal intensity
        'midterm': (10, 13, 1.3),  # Weeks 10-13: Midterm peak
        'normal2': (13, 16, 0.9),  # Weeks 13-16: Post-midterm lull
        'finals': (16, 18, 1.5),   # Weeks 16-18: Finals peak
    }
    
    def __init__(self, seed: int = None):
        if seed:
            np.random.seed(seed)
            random.seed(seed)
    
    def generate_student_profile(self) -> Dict:
        """Generate a random student profile"""
        year_level = random.choice(['1st Year', '2nd Year', '3rd Year', '4th Year'])
        
        # Research load higher for 4th year (thesis/capstone)
        has_research = year_level == '4th Year' or (year_level == '3rd Year' and random.random() > 0.5)
        
        # Extracurricular involvement
        org_count = random.choices([0, 1, 2, 3], weights=[0.2, 0.4, 0.3, 0.1])[0]
        has_position = org_count > 0 and random.random() > 0.6
        
        # Part-time work
        has_work = random.random() > 0.7
        work_hours = random.randint(10, 25) if has_work else 0
        
        return {
            'year_level': year_level,
            'has_research': has_research,
            'org_count': org_count,
            'has_position': has_position,
            'work_hours_per_week': work_hours
        }
    
    def generate_factor_value(
        self,
        factor_type: str,
        week: int,
        profile: Dict,
        academic_multiplier: float
    ) -> float:
        """Generate a realistic factor value for a given week"""
        
        if factor_type == 'task_density':
            # Base task density varies by week
            base = random.uniform(0.3, 0.7)
            return min(1, base * academic_multiplier)
        
        elif factor_type == 'assessment_intensity':
            # Higher during midterm/finals
            base = random.uniform(0.2, 0.6)
            if week in [10, 11, 12, 16, 17]:  # Exam weeks
                base += random.uniform(0.2, 0.4)
            return min(1, base)
        
        elif factor_type == 'deadline_clustering':
            # Cluster deadlines around exams
            base = random.uniform(0.1, 0.4)
            if week in [9, 10, 15, 16]:  # Pre-exam deadline clustering
                base += random.uniform(0.3, 0.5)
            return min(1, base)
        
        elif factor_type == 'research_load':
            if not profile['has_research']:
                return 0
            # Research peaks before defense (week 16-18)
            base = random.uniform(0.3, 0.6)
            if week >= 14:
                base += random.uniform(0.2, 0.4)
            return min(1, base)
        
        elif factor_type == 'extracurricular_load':
            base = profile['org_count'] * 0.15
            if profile['has_position']:
                base += 0.15
            # Events often happen mid-semester
            if week in [6, 7, 12, 13]:
                base += random.uniform(0.1, 0.2)
            return min(1, base)
        
        elif factor_type == 'part_time_work':
            if profile['work_hours_per_week'] == 0:
                return 0
            # Work hours normalized (max ~30 hours = 1.0)
            return min(1, profile['work_hours_per_week'] / 30)
        
        return random.uniform(0, 1)
    
    def get_academic_multiplier(self, week: int) -> float:
        """Get intensity multiplier for academic week"""
        for phase, (start, end, mult) in self.ACADEMIC_PHASES.items():
            if start <= week < end:
                return mult
        return 1.0
    
    def generate_dataset(
        self,
        num_samples: int = 1000,
        include_temporal: bool = True
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training dataset
        
        Args:
            num_samples: Number of samples to generate
            include_temporal: If True, includes temporal patterns
            
        Returns:
            X: Feature matrix (n_samples, 6)
            y: Target ALI scores (n_samples,)
        """
        feature_names = [
            'task_density',
            'assessment_intensity',
            'deadline_clustering',
            'research_load',
            'extracurricular_load',
            'part_time_work'
        ]
        
        # Feature weights for ALI calculation
        weights = {
            'task_density': 0.20,
            'assessment_intensity': 0.25,
            'deadline_clustering': 0.20,
            'research_load': 0.15,
            'extracurricular_load': 0.10,
            'part_time_work': 0.10
        }
        
        X = []
        y = []
        
        # Generate diverse student profiles
        profiles = [self.generate_student_profile() for _ in range(num_samples // 18)]
        
        for i in range(num_samples):
            # Get a student profile (cycling through)
            profile = profiles[i % len(profiles)]
            
            # Random week in semester (0-17)
            week = i % 18 if include_temporal else random.randint(0, 17)
            academic_mult = self.get_academic_multiplier(week) if include_temporal else 1.0
            
            # Generate factor values
            factors = {}
            for factor in feature_names:
                factors[factor] = self.generate_factor_value(
                    factor, week, profile, academic_mult
                )
            
            # Calculate ALI score with some noise
            ali_score = sum(factors[f] * weights[f] for f in feature_names) * 100
            ali_score += np.random.normal(0, 3)  # Add noise
            ali_score = max(0, min(100, ali_score))
            
            X.append([factors[f] for f in feature_names])
            y.append(ali_score)
        
        return np.array(X), np.array(y)
    
    def generate_time_series(
        self,
        student_profile: Dict,
        num_weeks: int = 18
    ) -> List[Dict]:
        """
        Generate time series data for a single student over a semester
        
        Args:
            student_profile: Student profile dict
            num_weeks: Number of weeks to simulate
            
        Returns:
            List of weekly data points
        """
        feature_names = [
            'task_density',
            'assessment_intensity',
            'deadline_clustering',
            'research_load',
            'extracurricular_load',
            'part_time_work'
        ]
        
        weights = {
            'task_density': 0.20,
            'assessment_intensity': 0.25,
            'deadline_clustering': 0.20,
            'research_load': 0.15,
            'extracurricular_load': 0.10,
            'part_time_work': 0.10
        }
        
        time_series = []
        
        for week in range(num_weeks):
            academic_mult = self.get_academic_multiplier(week)
            
            factors = {}
            for factor in feature_names:
                factors[factor] = self.generate_factor_value(
                    factor, week, student_profile, academic_mult
                )
            
            ali_score = sum(factors[f] * weights[f] for f in feature_names) * 100
            ali_score = max(0, min(100, ali_score))
            
            time_series.append({
                'week': week,
                'factors': factors,
                'ali_score': ali_score,
                'risk_level': self._get_risk_level(ali_score)
            })
        
        return time_series
    
    def _get_risk_level(self, ali_score: float) -> str:
        if ali_score <= 40:
            return 'Low'
        elif ali_score <= 70:
            return 'Moderate'
        elif ali_score <= 85:
            return 'High'
        else:
            return 'Critical'


# Global generator instance
data_generator = SyntheticDataGenerator()
