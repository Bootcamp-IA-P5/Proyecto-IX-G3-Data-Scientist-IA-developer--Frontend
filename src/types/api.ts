export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface HealthResponse {
  status: string;
  message: string;
}


export interface StatusResponse {
  api_status: string;
  models_loaded: number;
  available_models: string[];
}

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

export interface PredictionResponse {
  prediction: 0 | 1;
  probability: number;
  model_used: string;
  confidence: 'Low' | 'Medium' | 'High';
}


export interface BatchPredictionRequest {
  data: Omit<PredictionRequest, 'model_name'>[];
  model_name?: string;
}


export interface BatchPredictionResponse {
  predictions: PredictionResponse[];
  total: number;
  model_used: string;
}


export interface PredictionResult extends PredictionResponse {
  risk: number;
  riskLevel: 'high' | 'medium' | 'low'; 
  recommendations: string[];
  riskFactors: { factor: string; impact: 'high' | 'medium' | 'low' }[]; 


export interface ModelsListResponse {
  models: string[];
}


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
    importance?: number;
    coefficient?: number;
    abs_coefficient?: number;
    odds_ratio?: number;
  }>;
  optimal_threshold?: number;
  confusion_matrix?: {
    true_negative?: number;
    false_positive?: number;
    false_negative?: number;
    true_positive?: number;
  } | number[][];
  confusion_matrix_info?: {
    matrix?: number[][];
    values?: number[][]; 
    labels?: string[] | {
      predicted?: string[];
      actual?: string[];
    };
    true_negative?: number;
    false_positive?: number;
    false_negative?: number;
    true_positive?: number;
    total?: number;
    accuracy?: number;
    error_rate?: number;
    metrics?: {
      accuracy?: number;
      precision?: number;
      recall?: number;
      f1_score?: number;
      specificity?: number;
    };
  };
  roc_curve?: {
    fpr: number[];
    tpr: number[];
    auc: number;
    description?: string;
  };
  precision_recall_curve?: {
    precision: number[];
    recall: number[];
    f1: number;
    description?: string;
  };
}


export interface StatsOverviewResponse {
  total_predictions: number;
  stroke_predictions: number;
  no_stroke_predictions: number;
  average_probability: number;
}


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


export interface DatasetOverviewResponse {
  total_samples: number;
  total_features: number;
  stroke_cases: number;
  no_stroke_cases: number;
  class_balance: {
    stroke: number; 
    no_stroke: number;
  };
  missing_values: number;
}


export interface AgeDistribution {
  range: string;
  count: number;
  stroke_rate: number;
}

export interface GenderStats {
  count: number;
  stroke_rate: number;
}

export interface MaritalStatusStats {
  count: number;
  stroke_rate: number;
}

export interface DemographicsResponse {
  age: {
    mean: number;
    median: number;
    std: number;
    distribution: AgeDistribution[];
  };
  gender: {
    Male: GenderStats;
    Female: GenderStats;
    Other?: GenderStats;
  };
  marital_status: {
    Yes: MaritalStatusStats;
    No: MaritalStatusStats;
  };
}


export interface ClinicalConditionStats {
  present: { count: number; stroke_rate: number };
  absent: { count: number; stroke_rate: number };
}

export interface GlucoseDistribution {
  range: string;
  count: number;
  stroke_rate: number;
}

export interface BMICategory {
  name: string;
  count: number;
  stroke_rate: number;
}

export interface SmokingStatusStats {
  count: number;
  stroke_rate: number;
}

export interface ClinicalStatsResponse {
  hypertension: ClinicalConditionStats;
  heart_disease: ClinicalConditionStats;
  avg_glucose_level: {
    mean: number;
    median: number;
    distribution: GlucoseDistribution[];
  };
  bmi: {
    mean: number;
    categories: BMICategory[];
  };
  smoking_status: {
    'never smoked': SmokingStatusStats;
    'formerly smoked': SmokingStatusStats;
    smokes: SmokingStatusStats;
    Unknown?: SmokingStatusStats;
  };
}


export interface CorrelationFactor {
  feature: string;
  correlation: number;
  importance: 'High' | 'Medium' | 'Low';
}

export interface CorrelationsResponse {
  correlation_matrix: Record<string, number>;
  top_risk_factors: CorrelationFactor[];
}


export interface HighRiskProfile {
  id: number;
  name: string;
  criteria: string;
  count: number;
  stroke_rate: number;
  avg_risk_score: number;
}

export interface HighRiskProfilesResponse {
  profiles: HighRiskProfile[];
}

