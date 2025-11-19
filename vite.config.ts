import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Obtener la URL del backend desde las variables de entorno
// En desarrollo, si VITE_API_URL está configurado, usar el proxy para evitar CORS
const backendUrl = process.env.VITE_API_URL || 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
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
})
