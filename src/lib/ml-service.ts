/**
 * ML Service Client
 * Handles communication with the Python ML microservice
 */

const ML_SERVICE_PORT = 3030;

interface ALIFactors {
  task_density: number;
  assessment_intensity: number;
  deadline_clustering: number;
  research_load: number;
  extracurricular_load: number;
  part_time_work: number;
}

interface WorkloadInput {
  user_id: string;
  factors: ALIFactors;
  historical_ali?: number[];
}

interface ALIPrediction {
  date: string;
  ali_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidence: number;
}

interface WorkloadPredictionResponse {
  user_id: string;
  current_ali: number;
  current_risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  forecast_7day: ALIPrediction[];
  forecast_14day: ALIPrediction[];
  forecast_30day: ALIPrediction[];
  peak_date: string | null;
  peak_score: number | null;
  recommendations: string[];
}

interface ActivityData {
  active_tasks: number;
  tasks_due_in_7_days: number;
  graded_tasks_weight: number;
  overlapping_deadlines: number;
  thesis_active: boolean;
  org_memberships: number;
  org_positions: number;
  work_hours_per_week: number;
}

interface TrainingResponse {
  success: boolean;
  samples_used: number;
  r2_score: number;
  mae: number;
  rmse: number;
  feature_importance: Record<string, number>;
}

/**
 * Get the ML service URL with proper port transformation
 */
function getMLServiceUrl(endpoint: string): string {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'http://localhost:3030' 
    : 'http://localhost:3030';
  return `${baseUrl}${endpoint}`;
}

/**
 * Check if ML service is healthy
 */
export async function checkMLServiceHealth(): Promise<{
  healthy: boolean;
  modelLoaded: boolean;
}> {
  try {
    const response = await fetch(getMLServiceUrl('/health'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return { healthy: false, modelLoaded: false };
    }

    const data = await response.json();
    return {
      healthy: data.status === 'healthy',
      modelLoaded: data.model?.loaded || false,
    };
  } catch {
    return { healthy: false, modelLoaded: false };
  }
}

/**
 * Predict workload using ALI model
 */
export async function predictWorkload(
  input: WorkloadInput
): Promise<WorkloadPredictionResponse | null> {
  try {
    const response = await fetch(getMLServiceUrl('/api/predict'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      console.error('ML service error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to predict workload:', error);
    return null;
  }
}

/**
 * Calculate ALI score directly (without ML model)
 */
export async function calculateALI(
  factors: ALIFactors
): Promise<{
  ali_score: number;
  risk_level: string;
  factors: ALIFactors;
  factor_contributions: Record<string, number>;
} | null> {
  try {
    const response = await fetch(getMLServiceUrl('/api/calculate-ali'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(factors),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to calculate ALI:', error);
    return null;
  }
}

/**
 * Calculate normalized ALI factors from raw activity data
 */
export async function calculateFactors(
  activity: ActivityData
): Promise<ALIFactors | null> {
  try {
    const response = await fetch(getMLServiceUrl('/api/calculate-factors'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to calculate factors:', error);
    return null;
  }
}

/**
 * Get model information
 */
export async function getModelInfo(): Promise<{
  is_trained: boolean;
  feature_names: string[];
  feature_weights: Record<string, number>;
  risk_thresholds: Record<string, [number, number]>;
} | null> {
  try {
    const response = await fetch(getMLServiceUrl('/api/model/info'), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get model info:', error);
    return null;
  }
}

/**
 * Retrain the model with new synthetic data
 */
export async function trainModel(params: {
  num_samples?: number;
  seed?: number;
}): Promise<TrainingResponse | null> {
  try {
    const response = await fetch(getMLServiceUrl('/api/train'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to train model:', error);
    return null;
  }
}

// Export types
export type {
  ALIFactors,
  WorkloadInput,
  ALIPrediction,
  WorkloadPredictionResponse,
  ActivityData,
  TrainingResponse,
};
