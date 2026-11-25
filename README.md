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
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin login credentials | backend only (Render/API service) |
| `ADMIN_SESSION_SECRET` | Optional signing secret for 12-hour admin sessions | backend only |
| `AI_API_KEY` | API key for an OpenAI-compatible chat-completions provider | backend only |
| `AI_BASE_URL` | Provider HTTPS base URL (for example, ending in `/v1`) | backend only |
| `AI_MODEL` | Chat/vision model name supported by the provider | backend only |

Admin credentials are checked by the backend at login time. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend service's environment (for example, Render), not as `VITE_*` variables on Vercel. Never expose the password in a frontend environment variable because Vite embeds `VITE_*` values in public browser assets.

Ask ABHI uses the configured OpenAI-compatible chat-completions API. The backend retrieves matching portfolio records from MongoDB and instructs the model to answer only from those records; it should say when a detail cannot be verified instead of inventing personal information. The API key is never sent to the browser. Configure `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL` in the backend environment (or root `.env.local` for local development). Use an HTTPS provider URL; HTTP is accepted only for loopback development.

The Admin AI Workspace can extract certificate, education, experience, achievement, project, and journey fields from JPEG, PNG, or WebP images up to 10 MB. The image is sent to the configured AI provider for extraction. Review and correct every field before saving it to the portfolio. Saved conversations are stored in MongoDB so the visitor's browser can resume its own chats and the authenticated admin can review, continue, or delete conversations. Chat history remains until deleted by the admin.

The `.env.local` file is ignored by git. Keep real credentials there and do not commit them.

## Deployment split

- **Render:** deploy the repository using the root `render.yaml` blueprint (Docker context `.` and the root `Dockerfile`) or configure the backend service with the matching Dockerfile. The image copies both `backend/server.js` and `backend/ai-provider.js`. Set the backend variables from `.env.example`, including the AI provider settings, and set `CLIENT_URL` to the Vercel URL.
- **Vercel:** set the project root directory to `frontend`, use build command `npm run build` and output directory `dist`. Set `VITE_API_URL` to the Render backend URL and add only the `VITE_*` variables needed by the frontend.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
