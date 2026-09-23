# Portfolio Website

## Local environment setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your local values. Keep backend secrets out of `VITE_*` variables.
3. Start the app with `npm run dev`.

The frontend is an independent service in `frontend/` and uses `VITE_API_URL` for API requests. The backend is an independent service in `backend/`. In local development the frontend points to port `5001`; in Vercel, set it to the deployed Render URL. The Express server accepts Render's `PORT` value and restricts CORS using `CLIENT_URL`.

## Environment variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | Express/Render API port | `5001` locally |
| `VITE_PORT` | Vite dev server port | `5173` |
| `VITE_API_URL` | Render API base URL | `http://localhost:5001` |
| `CLIENT_URL` | Allowed frontend origin(s), comma-separated | `http://localhost:5173` |
| `MONGODB_URI` | Backend MongoDB connection string | backend only |
| `CLOUDINARY_*` | Backend Cloudinary credentials | backend only |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Backend admin credentials | backend only |
| `VITE_ADMIN_USERNAME` | Local dashboard username | `admin` |
| `VITE_ADMIN_PASSWORD` | Local dashboard password | `change-this-password` |

The `.env.local` file is ignored by git. Keep real credentials there and do not commit them.

## Deployment split

- **Render:** deploy the `backend` directory as a Node web service with build command `npm install`, start command `npm start`, and health check `/api/health`. Add the backend variables from `.env.example`; set `CLIENT_URL` to the Vercel URL.
- **Vercel:** set the project root directory to `frontend`, use build command `npm run build` and output directory `dist`. Set `VITE_API_URL` to the Render backend URL and add only the `VITE_*` variables needed by the frontend.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
