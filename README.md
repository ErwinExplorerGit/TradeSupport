# TradeSupport

An AI-powered stock analysis platform built with a FastAPI backend and a React/Vite frontend. The frontend connects to the backend via REST API and WebSocket to run multi-agent trading analysis in real time.

---

## Project Structure

```
TradeSupport/
├── backend/        # FastAPI Python backend
└── frontend/       # React + TypeScript + Vite frontend
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
├── public/
├── src/
│   ├── components/
│   │   ├── ConfigPanel.tsx       # Left panel — analysis configuration form
│   │   ├── OutputPanel.tsx       # Right panel — live logs and results
│   │   └── fields/               # Individual form field components
│   │       ├── ReasoningEffortField.tsx
│   │       └── ...
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

---

### Install Packages

Requires **Node.js 18+** and **npm**.

```bash
cd frontend
npm install
```

---

### Run Locally

1. Copy the environment variable template and fill in your backend URLs:

```bash
cp .env.example .env.local
```

2. Edit `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

3. Start the development server:

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

> Make sure the backend is running locally on port `8000` before starting the frontend.

---

### Build for Production

```bash
npm run build
```

Output is placed in `frontend/dist/`.

---

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

| Variable            | Description                              | Example                              |
|---------------------|------------------------------------------|--------------------------------------|
| `VITE_API_BASE_URL` | Backend REST API base URL                | `https://your-backend.onrender.com`  |
| `VITE_WS_URL`       | Backend WebSocket URL                    | `wss://your-backend.onrender.com/ws` |

Then redeploy for the variables to take effect:

```bash
vercel --prod
```
