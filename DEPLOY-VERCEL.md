# Deploy en Vercel

## Requisitos
- Cuenta en Vercel
- Repositorio del proyecto en GitHub/GitLab/Bitbucket

## Pasos
1. Ejecuta localmente el build para validar:
   - `npm install`
   - `npm run build`
2. Sube el proyecto a un repositorio Git.
3. Entra a [https://vercel.com](https://vercel.com) e inicia sesión.
4. Haz clic en **Add New Project**.
5. Importa tu repositorio.
6. Vercel detectará Vite automáticamente. Verifica:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
7. Haz clic en **Deploy**.
8. Cuando termine, Vercel te dará una URL pública.

## SPA Routing
Este proyecto ya incluye `vercel.json` con rewrite global a `index.html`, necesario para que React Router funcione al refrescar rutas internas.

## Redeploy
Cada push al repositorio dispara un nuevo deploy automáticamente.