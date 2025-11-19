// En producción, usar la URL de Render si no se especifica VITE_API_URL
// En desarrollo, usar localhost
const isProduction = import.meta.env.PROD;
const defaultApiUrl = isProduction 
  ? 'https://proyecto-ix-g3-data-scientist-ia-78z0.onrender.com'
  : 'http://localhost:8000';

export const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;
export const ENV = import.meta.env.VITE_ENV || (isProduction ? 'production' : 'development');

