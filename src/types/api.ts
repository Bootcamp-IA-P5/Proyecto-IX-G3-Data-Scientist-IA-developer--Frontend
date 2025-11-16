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

