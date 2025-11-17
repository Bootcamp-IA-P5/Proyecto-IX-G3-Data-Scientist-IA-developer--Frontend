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
  ApiError,
} from '../types/api';

// Crear instancia de axios con configuración base
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para responses (manejo de errores global)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: error.message || 'An error occurred',
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
    const response = await apiClient.get<ModelDetailResponse>(`/models/${modelName}`);
    return response.data;
  },
};

export default apiClient;

