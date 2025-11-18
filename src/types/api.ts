// Tipos para las respuestas de la API
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Health Check
export interface HealthResponse {
  status: string;
  message: string;
}

// System Status
export interface StatusResponse {
  api_status: string;
  models_loaded: number;
  available_models: string[];
}

// Single Prediction Request
export interface PredictionRequest {
  age: number;
  hypertension: 0 | 1;
  heart_disease: 0 | 1;
  avg_glucose_level: number;
  bmi: number;
  gender: 'Male' | 'Female' | 'Other';
  ever_married: 'Yes' | 'No';
  work_type: string;
  Residence_type: 'Urban' | 'Rural';
  smoking_status: string;
  model_name?: string;
}

// Single Prediction Response
export interface PredictionResponse {
  prediction: 0 | 1;
  probability: number;
  model_used: string;
  confidence: 'Low' | 'Medium' | 'High';
}

// Batch Prediction Request
export interface BatchPredictionRequest {
  data: Omit<PredictionRequest, 'model_name'>[];
  model_name?: string;
}

// Batch Prediction Response
export interface BatchPredictionResponse {
  predictions: PredictionResponse[];
  total: number;
  model_used: string;
}

// Extended Prediction Result for UI
export interface PredictionResult extends PredictionResponse {
  risk: number; // probability * 100 (0-100)
  riskLevel: 'high' | 'medium' | 'low'; // derived from probability
  recommendations: string[]; // generated in frontend
  riskFactors: { factor: string; impact: 'high' | 'medium' | 'low' }[]; // generated in frontend
}

// Models List Response
export interface ModelsListResponse {
  models: string[];
}

// Model Detail Response
export interface ModelDetailResponse {
  name: string;
  version?: string;
  type?: string;
  model_type?: string;
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    auc_roc?: number;
  };
  hyperparameters?: Record<string, any>;
  feature_importance?: Array<{
    feature: string;
    importance: number;
  }>;
}

// Statistics Overview Response
export interface StatsOverviewResponse {
  total_predictions: number;
  stroke_predictions: number;
  no_stroke_predictions: number;
  average_probability: number;
}

// Risk Distribution Response
export interface RiskDistributionResponse {
  low_risk: number;
  medium_risk: number;
  high_risk: number;
  distribution: {
    Low: number;
    Medium: number;
    High: number;
  };
}

// Models Compare Response
export interface ModelsCompareResponse {
  models: string[];
  best_model: string;
  metrics: Record<string, {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    auc_roc: number;
  }>;
}

// Control Center Response
export interface ControlCenterComponent {
  name: string;
  status: 'operational' | 'warning' | 'error';
  percentage: number;
  message: string;
  details?: {
    models_loaded?: number;
    total_models?: number;
    total_mb?: number;
    models_mb?: number;
  };
}

export interface ModelHealth {
  model_name: string;
  is_loaded: boolean;
  is_available: boolean;
  file_size_mb: number | null;
  status: string;
  metrics_available: boolean;
}

export interface ControlCenterConfiguration {
  environment: string;
  debug: boolean;
  host: string;
  port: number;
  api_version: string;
  models_directory: string;
  data_directory: string;
}

export interface ControlCenterResponse {
  api_status: string;
  environment: string;
  version: string;
  components: ControlCenterComponent[];
  total_models: number;
  models_loaded: number;
  models_health: ModelHealth[];
  total_storage_mb: number;
  models_storage_mb: number;
  total_predictions: number;
  average_response_time_ms: number | null;
  alerts: string[];
  warnings: string[];
  configuration: ControlCenterConfiguration;
}

