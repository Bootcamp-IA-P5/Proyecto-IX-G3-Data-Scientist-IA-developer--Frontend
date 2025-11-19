# Guía de Despliegue en Render

## Opción 1: Usando Buildpack de Node.js (Recomendado)

Render detectará automáticamente que es un proyecto Node.js y usará el buildpack correspondiente.

### Configuración en Render Dashboard:

1. **Nuevo Static Site** o **Nuevo Web Service**
2. **Configuración:**
   - **Build Command:** `npm ci && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
   - **Root Directory:** `.` (raíz del proyecto)

3. **Variables de Entorno:**
   - `VITE_API_URL`: URL de tu backend (ej: `https://tu-backend.onrender.com`)

4. **Health Check Path:** `/` o `/health`

## Opción 2: Usando Docker

Si prefieres usar Docker:

1. **Nuevo Web Service**
2. **Dockerfile Path:** `Dockerfile`
3. **Docker Context:** `.` (raíz del proyecto)
4. **Variables de Entorno:**
   - `VITE_API_URL`: URL de tu backend

## Notas Importantes:

- Render construye el proyecto en cada push
- Las variables de entorno deben empezar con `VITE_` para que Vite las incluya en el build
- El puerto debe ser configurado en Render (por defecto usa el que expone el contenedor o servicio)
- Para SPA routing, Render maneja automáticamente el redirect a `index.html`

## Verificación:

Después del despliegue, verifica:
- ✅ La aplicación carga correctamente
- ✅ Las rutas funcionan (SPA routing)
- ✅ Las llamadas al API funcionan (verifica CORS en el backend)
- ✅ Los assets estáticos se cargan correctamente

