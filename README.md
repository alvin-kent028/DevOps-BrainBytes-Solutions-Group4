# DevOps BrainBytes Solutions Group 4

BrainBytes is a full-stack AI tutor app with a Next.js frontend and an Express/MongoDB backend. The app lets students ask questions, receive AI-assisted responses, and review their conversation history.

## Project Structure

- `backend/` - Express API, MongoDB models, AI helper logic, and Jest tests
- `frontend/` - Next.js UI, React components, and Jest tests
- `.github/workflows/` - GitHub Actions CI workflow
- `docs/` - Testing and submission documentation

## Features

- AI tutor chat experience with subject filtering
- Conversation history and message rendering
- Backend safety checks and fallback responses
- Frontend and backend automated tests
- ESLint validation for both apps

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- MongoDB locally or in Docker

### Install Dependencies

Run these from the repository root:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

### Environment Variables

Create `backend/.env` with your backend settings. A sample is available in `.env.example`.

Suggested values:

```env
HUGGINGFACE_TOKEN=your_token_here
MONGO_URI=mongodb://mongo:27017/brainbytes
PORT=5000
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Running the App

BACKEND
Open a terminal in backend

Install dependencies:
npm install

Create backend/.env if needed:
"MONGO_URI=mongodb://localhost:27017/brainbytes
PORT=5000
HUGGINGFACE_TOKEN=your_token_here"

Start backend:
npm start


FRONTEND
Open a terminal in frontend

Install dependencies:
npm install

Start frontend:
npm run dev

Open the UI at:
http://localhost:3000


Run lint checks with:

```powershell
cd backend
npm run lint

cd ..\frontend
npm run lint
```

## Documentation

- Testing documentation: [docs/testing.md](docs/testing.md)
- Operations runbook (staging, monitoring, scaling, rollback): [docs/operations.md](docs/operations.md)

## Required GitHub Secrets

Set these under **Repo Settings → Secrets and variables → Actions** for the CI/CD
pipeline in `.github/workflows/ci.yml` to work:

| Secret | Used for |
|---|---|
| `RAILWAY_TOKEN` | Authenticating the Railway CLI in the `deploy` job |
| `BACKEND_PUBLIC_URL` | Post-deploy health check (e.g. `https://brainbytes-backend.up.railway.app`) |

## Health Check

The backend exposes `GET /health`, returning `200` with `{ status: "ok" }` when
connected to MongoDB, or `503` with `{ status: "degraded" }` if the database
connection is down. This is used by Railway's `healthcheckPath` (see
`railway.json`), the Docker `HEALTHCHECK` instruction, and CI's post-deploy
verification step.

## Submission Evidence

- GitHub Actions workflow: `.github/workflows/ci.yml`
- Backend & Frontend test screenshot: https://drive.google.com/drive/folders/1abq3wNguP8k7tWo3dOXrcQr5Z24SPrmP?usp=drive_link 
- GitHub Actions workflow screenshot: https://drive.google.com/drive/folders/14AU3VHofriBGxurz8_N-pQb-IWk1_Oow?usp=drive_link
- ESLint screenshot: https://drive.google.com/drive/folders/1LgQJZU1CuJ98P7AYoTirHjT6RahUpqxT?usp=drive_link 

## Resources

- Video: https://drive.google.com/file/d/17vgHT4nCi5vfZlhChjQZLzOkY4DMPDzc/view?usp=drivesdk
- External documentation: https://docs.google.com/document/d/12nML8XkBnVguc78j4sLNAx57mDtpozM-NP1UUZrumk8/edit?usp=drivesdk


