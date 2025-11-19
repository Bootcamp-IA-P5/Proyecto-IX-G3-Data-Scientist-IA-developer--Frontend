const isProduction = import.meta.env.PROD;
const customApiUrl = import.meta.env.VITE_API_URL;
const hasCustomApiUrl = !!customApiUrl;


export const API_URL: string = (() => {
  if (isProduction) {
   
    return customApiUrl || 'https://proyecto-ix-g3-data-scientist-ia-586b.onrender.com';
  } else {
   
    return hasCustomApiUrl ? '/api' : 'http://localhost:8000';
  }
})();

export const ENV = import.meta.env.VITE_ENV || (isProduction ? 'production' : 'development');

