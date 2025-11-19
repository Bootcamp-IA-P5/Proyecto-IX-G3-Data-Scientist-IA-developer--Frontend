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
  DatasetOverviewResponse,
  DemographicsResponse,
  ClinicalStatsResponse,
  CorrelationsResponse,
  HighRiskProfilesResponse,
  ApiError,
} from '../types/api';


const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
});


apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
   
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


export const strokeApi = {

  getHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },

  getStatus: async (): Promise<StatusResponse> => {
    const response = await apiClient.get<StatusResponse>('/status');
    return response.data;
  },


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

 
  predictBatch: async (
    data: BatchPredictionRequest
  ): Promise<BatchPredictionResponse> => {
    const response = await apiClient.post<BatchPredictionResponse>(
      '/predict/batch',
      data
    );
    return response.data;
  },

 
  getModels: async (): Promise<ModelsListResponse> => {
    const response = await apiClient.get<ModelsListResponse>('/models');
    return response.data;
  },


  getModelDetail: async (modelName: string): Promise<ModelDetailResponse> => {
    
    const encodedModelName = encodeURIComponent(modelName);
    const response = await apiClient.get<ModelDetailResponse>(`/models/${encodedModelName}`);
    return response.data;
  },


  getStatsOverview: async (): Promise<StatsOverviewResponse> => {
    const response = await apiClient.get<StatsOverviewResponse>('/stats/overview');
    return response.data;
  },

 
  getRiskDistribution: async (): Promise<RiskDistributionResponse> => {
    const response = await apiClient.get<RiskDistributionResponse>('/stats/risk-distribution');
    return response.data;
  },

  getModelsCompare: async (): Promise<ModelsCompareResponse> => {
    const response = await apiClient.get<ModelsCompareResponse>('/stats/models/compare');
    return response.data;
  },


  getControlCenter: async (): Promise<ControlCenterResponse> => {
    const response = await apiClient.get<ControlCenterResponse>('/control-center');
    return response.data;
  },


  getDatasetOverview: async (): Promise<DatasetOverviewResponse> => {
    const response = await apiClient.get<DatasetOverviewResponse>('/statistics/overview');
    return response.data;
  },

 
  getDemographics: async (): Promise<DemographicsResponse> => {
    const response = await apiClient.get<DemographicsResponse>('/statistics/demographics');
    return response.data;
  },

  getClinicalStats: async (): Promise<ClinicalStatsResponse> => {
    const response = await apiClient.get<ClinicalStatsResponse>('/statistics/clinical');
    return response.data;
  },

 
  getCorrelations: async (): Promise<CorrelationsResponse> => {
    const response = await apiClient.get<CorrelationsResponse>('/statistics/correlations');
    return response.data;
  },

 
  getHighRiskProfiles: async (): Promise<HighRiskProfilesResponse> => {
    const response = await apiClient.get<HighRiskProfilesResponse>('/statistics/high-risk-profiles');
    return response.data;
  },
};

export default apiClient;

