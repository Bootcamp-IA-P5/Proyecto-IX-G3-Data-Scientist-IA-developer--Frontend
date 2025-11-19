import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno del archivo .env
  const env = loadEnv(mode, process.cwd(), '')
  
  // Obtener la URL del backend desde las variables de entorno
  // En desarrollo, si VITE_API_URL está configurado, usar el proxy para evitar CORS
  const backendUrl = env.VITE_API_URL || 'http://localhost:8000'
  
  console.log('🔧 Vite Proxy Configuration:', {
    mode,
    VITE_API_URL: env.VITE_API_URL,
    backendUrl,
    usingProxy: !!env.VITE_API_URL,
  })

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: backendUrl.startsWith('https'), // Para HTTPS
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
