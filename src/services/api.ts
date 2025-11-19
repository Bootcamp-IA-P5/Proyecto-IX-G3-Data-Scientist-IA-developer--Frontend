import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { API_URL } from '../utils/constants';
import type {
  HealthResponse,
  StatusResponse,
  PredictionRequest,
  PredictionResponse,
  BatchPredictionRequest,
  BatchPredictionResponse,
  ModelsListResponse,
  ModelDetailResponse,
  StatsOverviewResponse,
  RiskDistributionResponse,
  ModelsCompareResponse,
  ControlCenterResponse,
  ApiError,
} from '../types/api';

// Crear instancia de axios con configuración base
// Timeout aumentado a 30s para dar tiempo al backend de Render (free tier) a "despertar"
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos para dar tiempo al backend de Render a responder
});

// Log para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🌐 API Client configured with baseURL:', API_URL);
}

// Interceptor para responses (manejo de errores global)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Mejorar mensajes de error para timeouts
    let errorMessage = error.message || 'An error occurred';
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorMessage = 'El servidor está tardando en responder. Esto puede ocurrir si el backend está "durmiendo" (plan gratuito de Render). Por favor, espera unos segundos e intenta de nuevo.';
    } else if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      errorMessage = 'Error de conexión. Verifica que el backend esté ejecutándose y accesible.';
    }
    
    const apiError: ApiError = {
      message: errorMessage,
      status: error.response?.status || 500,
      errors: error.response?.data as Record<string, string[]> | undefined,
    };
    return Promise.reject(apiError);
  }
);

// Servicios específicos para los endpoints del backend
export const strokeApi = {
  // Health Check
  getHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },

  // System Status
  getStatus: async (): Promise<StatusResponse> => {
    const response = await apiClient.get<StatusResponse>('/status');
    return response.data;
  },

  // Single Prediction
  predict: async (
    data: PredictionRequest,
    modelName?: string
  ): Promise<PredictionResponse> => {
    const params = modelName ? { model_name: modelName } : {};
    const response = await apiClient.post<PredictionResponse>('/predict', data, {
      params,
    });
    return response.data;
  },

  // Batch Prediction
  predictBatch: async (
    data: BatchPredictionRequest
  ): Promise<BatchPredictionResponse> => {
    const response = await apiClient.post<BatchPredictionResponse>(
      '/predict/batch',
      data
    );
    return response.data;
  },

  // Get Models List
  getModels: async (): Promise<ModelsListResponse> => {
    const response = await apiClient.get<ModelsListResponse>('/models');
    return response.data;
  },

  // Get Model Detail
  getModelDetail: async (modelName: string): Promise<ModelDetailResponse> => {
    // Codificar el nombre del modelo para la URL (por si tiene caracteres especiales)
    const encodedModelName = encodeURIComponent(modelName);
    const response = await apiClient.get<ModelDetailResponse>(`/models/${encodedModelName}`);
    return response.data;
  },

  // Statistics Overview
  getStatsOverview: async (): Promise<StatsOverviewResponse> => {
    const response = await apiClient.get<StatsOverviewResponse>('/stats/overview');
    return response.data;
  },

  // Risk Distribution
  getRiskDistribution: async (): Promise<RiskDistributionResponse> => {
    const response = await apiClient.get<RiskDistributionResponse>('/stats/risk-distribution');
    return response.data;
  },

  // Models Compare
  getModelsCompare: async (): Promise<ModelsCompareResponse> => {
    const response = await apiClient.get<ModelsCompareResponse>('/stats/models/compare');
    return response.data;
  },

  // Control Center
  getControlCenter: async (): Promise<ControlCenterResponse> => {
    const response = await apiClient.get<ControlCenterResponse>('/control-center');
    return response.data;
  },
};

export default apiClient;

