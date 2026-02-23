# TradeSupport

An AI-powered stock analysis platform built with a FastAPI backend and a React/Vite frontend. The frontend connects to the backend via REST API and WebSocket to run multi-agent trading analysis in real time.

---

## Project Structure

```
TradeSupport/
├── backend/        # FastAPI Python backend
│   └── render.yaml # Render deployment blueprint
└── frontend/       # React + TypeScript + Vite frontend
```

---

## Backend

### Overview

The backend is a FastAPI application that runs multi-agent trading analysis using LangGraph and various LLM providers. It exposes:

- REST endpoints (`/api/start`, `/api/stop`, `/api/health`, `/api/config`)
- A WebSocket endpoint (`/ws`) for real-time log streaming to the frontend

### Install Packages

Requires **Python 3.10+**.

```bash
cd backend
pip install -r requirements.txt
```

### Run Locally

1. Copy the environment variable template:

```bash
cp backend/.env.example backend/.env
```

2. Edit `backend/.env` and fill in your API keys:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
ALPHA_VANTAGE_API_KEY=...
ALLOWED_ORIGINS=http://localhost:5173
```

3. Start the server:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**.

### Deploy to Render

The repo includes a `render.yaml` blueprint at the project root for one-click deploys.

#### Option A — Blueprint deploy (recommended)

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New → Blueprint**.
3. Connect your GitHub repo — Render will detect `render.yaml` automatically.
4. Set the required environment variables when prompted (see table below).

#### Option B — Manual deploy

1. Go to [render.com](https://render.com) → **New → Web Service**.
2. Connect your GitHub repo.
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/api/health`

#### Environment Variables on Render

Set these under **Environment → Environment Variables** in your Render service:

| Variable               | Description                                     | Required            |
|------------------------|-------------------------------------------------|---------------------|
| `ALLOWED_ORIGINS`      | Comma-separated frontend URLs (your Vercel URL) | Yes                 |
| `OPENAI_API_KEY`       | OpenAI API key                                  | If using OpenAI     |
| `ANTHROPIC_API_KEY`    | Anthropic API key                               | If using Claude     |
| `GOOGLE_API_KEY`       | Google Gemini API key                           | If using Gemini     |
| `OPENROUTER_API_KEY`   | OpenRouter API key                              | If using OpenRouter |
| `XAI_API_KEY`          | xAI Grok API key                                | If using xAI        |
| `ALPHA_VANTAGE_API_KEY`| Alpha Vantage key for market/news data          | Recommended         |

Example value for `ALLOWED_ORIGINS`:
```
https://your-app.vercel.app,http://localhost:5173
```

#### After Deploying the Backend

Update your Vercel frontend environment variables with the Render service URL:

| Variable            | Value                                 |
|---------------------|---------------------------------------|
| `VITE_API_BASE_URL` | `https://your-service.onrender.com`   |
| `VITE_WS_URL`       | `wss://your-service.onrender.com/ws`  |

Then redeploy the frontend:

```bash
cd frontend
vercel --prod
```

---

## Frontend

### Overview

The frontend is a React single-page application (SPA) built with Vite and TypeScript. It allows users to:

- Configure and start a stock analysis (ticker, date, analysts, LLM provider/models)
- Monitor analysis progress in real time via WebSocket
- View the final trade recommendation output

### Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ConfigPanel.tsx       # Left panel — analysis configuration form
│   │   ├── OutputPanel.tsx       # Right panel — live logs and results
│   │   └── fields/               # Individual form field components
│   ├── hooks/
│   │   └── useWebSocket.ts       # WebSocket connection hook (auto-reconnect)
│   ├── services/
│   │   └── api.ts                # REST API calls (start, stop, health, config)
│   ├── styles/
│   │   └── App.css
│   ├── types/
│   │   └── index.ts              # Shared TypeScript types and interfaces
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
├── .env.example                  # Environment variable template
├── vercel.json                   # Vercel deployment config
├── vite.config.ts
└── package.json
```

### Install Packages

Requires **Node.js 18+** and **npm**.

```bash
cd frontend
npm install
```

### Run Locally

1. Copy the environment variable template and fill in your backend URLs:

```bash
cp frontend/.env.example frontend/.env.local
```

2. Edit `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

3. Start the development server:

```bash
cd frontend
npm run dev
```

The app will be available at **http://localhost:5173**.

> Make sure the backend is running locally on port `8000` before starting the frontend.

### Build for Production

```bash
cd frontend
npm run build
```

Output is placed in `frontend/dist/`.

### Deploy to Vercel

#### First-time setup

1. Install the Vercel CLI (if not already installed):

```bash
npm install -g vercel
```

2. Log in to your Vercel account:

```bash
vercel login
```

3. From the `frontend/` directory, run the deployment:

```bash
cd frontend
vercel --prod
```

Follow the interactive prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → select your account or team
- **Link to existing project?** → `N` to create a new project
- **Project name** → e.g. `tradesupport-frontend`
- **Directory** → `./`

#### Subsequent deployments

```bash
cd frontend
vercel --prod
```

#### Deploy to a different account

Remove the existing project link, then log in to the new account:

```bash
rm -rf frontend/.vercel
vercel logout
vercel login
cd frontend
vercel --prod
```

#### Environment Variables on Vercel

After deploying, set the following in your Vercel project dashboard under **Settings → Environment Variables**:

| Variable            | Description              | Example                              |
|---------------------|--------------------------|--------------------------------------|
| `VITE_API_BASE_URL` | Backend REST API base URL | `https://your-service.onrender.com` |
| `VITE_WS_URL`       | Backend WebSocket URL     | `wss://your-service.onrender.com/ws`|

Then redeploy for the variables to take effect:

```bash
cd frontend
vercel --prod
```
