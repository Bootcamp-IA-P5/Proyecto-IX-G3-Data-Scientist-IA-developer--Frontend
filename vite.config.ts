import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno del archivo .env
  const env = loadEnv(mode, process.cwd(), '')
  

  const backendUrl = env.VITE_API_URL || 'http://localhost:8000'
  
 

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
