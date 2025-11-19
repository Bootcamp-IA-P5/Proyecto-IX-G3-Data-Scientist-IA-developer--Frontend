// En producción, usar la URL de Render si no se especifica VITE_API_URL
// En desarrollo, usar el proxy de Vite (/api) si VITE_API_URL está configurado,
// o localhost directamente si no está configurado
const isProduction = import.meta.env.PROD;
const customApiUrl = import.meta.env.VITE_API_URL;
const hasCustomApiUrl = !!customApiUrl;

// En desarrollo con VITE_API_URL configurado, usar el proxy de Vite para evitar CORS
// En producción, usar VITE_API_URL si está configurado, o la URL por defecto
// En desarrollo sin VITE_API_URL, usar localhost directamente
export const API_URL: string = (() => {
  if (isProduction) {
    // En producción, usar VITE_API_URL o la URL por defecto
    return customApiUrl || 'https://proyecto-ix-g3-data-scientist-ia-586b.onrender.com';
  } else {
    // En desarrollo, si hay VITE_API_URL, usar el proxy para evitar CORS
    // El proxy está configurado en vite.config.ts para redirigir /api a VITE_API_URL
    return hasCustomApiUrl ? '/api' : 'http://localhost:8000';
  }
})();

export const ENV = import.meta.env.VITE_ENV || (isProduction ? 'production' : 'development');

// Log para debugging (solo en desarrollo)
if (!isProduction) {
  console.log('🔧 API Configuration:', {
    VITE_API_URL: customApiUrl,
    isProduction,
    hasCustomApiUrl,
    usingProxy: hasCustomApiUrl,
    finalApiUrl: API_URL,
  });
}

