# Backend Refactoring Documentation

## Overview

The backend has been refactored into a microservices-ready architecture. All services are now organized in their own folders under `backend/services/` for better modularity and maintainability.

## Updated Folder Structure

```
backend/
├── main.py                    # FastAPI application entry point
├── requirements.txt           # Python dependencies
├── models/                    # Shared data models
│   ├── __init__.py
│   ├── analysis_request.py
│   ├── analysis_response.py
│   ├── analysis_state.py
│   └── ...
├── services/                  # All microservices
│   ├── __init__.py           # Services module exports
│   ├── trading-service/      # Trading analysis service
│   │   ├── __init__.py
│   │   ├── service.py        # TradingService class
│   │   └── routes.py         # Trading API endpoints
│   └── auth-service/         # Authentication service
│       ├── __init__.py
│       ├── service.py        # AuthService class
│       └── routes.py         # Auth API endpoints
├── tradingagents/            # Trading agents framework
└── results/                  # Analysis results storage
```

## Services Overview

### 1. Trading Service (`trading-service/`)

**Purpose:** Manages trading analysis and market research

**Components:**
- `service.py` - TradingService class with analysis logic
- `routes.py` - API routes for trading operations

**Endpoints:**
- `GET /api/trading/health` - Trading service health check
- `GET /api/trading/config` - Get configuration options (tickers, models, etc.)
- `POST /api/trading/start` - Start a new trading analysis
- `POST /api/trading/stop` - Stop the currently running analysis

**Features:**
- Real-time trading analysis via trading agents framework
- Mock mode for testing without full framework
- Support for multiple LLM providers (OpenAI, Anthropic, Google, etc.)
- WebSocket streaming for analysis logs

### 2. Auth Service (`auth-service/`)

**Purpose:** Simple authentication service

**Components:**
- `service.py` - AuthService class with hardcoded credentials
- `routes.py` - API routes for authentication

**Endpoints:**
- `POST /api/auth/login` - Login with username and password

**Hardcoded Credentials:**
- `admin` / `admin123`
- `user` / `user123`
- `demo` / `demo123`

**Response:**
- Success: `{"message": "logged in", "username": "..."}`
- Failure: HTTP 401 Unauthorized

## What Was Refactored (DRY Principles Applied)

### 1. **Service Separation**
- **Before:** All service logic mixed in `main.py`
- **After:** Each service in its own folder with clear structure
- **Benefit:** Services can be developed, tested, and deployed independently

### 2. **Route Organization**
- **Before:** All routes defined in `main.py` (~300+ lines)
- **After:** Routes separated into service-specific `routes.py` files
- **Benefit:** Easier to maintain and extend each service

### 3. **Service Logic Isolation**
- **Before:** `TradingService` in `services/trading_service.py`
- **After:** Each service has dedicated `service.py` for business logic
- **Benefit:** Clear separation between API routes and business logic

### 4. **Shared Components**
- **Kept:** Models remain shared in `backend/models/`
- **Reason:** Data models are used across services (DRY principle)

### 5. **Main Application Cleanup**
- **Before:** 350+ lines with all logic
- **After:** ~100 lines focused on app initialization and WebSocket
- **Removed:** Duplicate endpoints now in service routers
- **Kept:** Global state management, WebSocket endpoint, root endpoint

## Local Run Instructions

### Prerequisites

1. **Python 3.9 or higher**
2. **Virtual environment** (recommended)

### Setup Steps

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # On macOS/Linux
   # OR
   .venv\Scripts\activate  # On Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys if using real trading agents
   ```

5. **Run the backend server:**
   ```bash
   python main.py
   ```

   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Verify Installation

1. **Check main health:**
   ```bash
   curl http://localhost:8000/
   ```
   Expected: `{"status": "ok", "service": "TradingAgent WebSocket API", "version": "1.0.0"}`

2. **Check overall health:**
   ```bash
   curl http://localhost:8000/api/health
   ```

3. **Test auth service:**
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
   ```
   Expected: `{"message": "logged in", "username": "admin"}`

4. **Test trading service:**
   ```bash
   curl http://localhost:8000/api/trading/config
   ```

5. **Access API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Testing WebSocket Connection

Connect to `ws://localhost:8000/ws` for real-time analysis streaming.

## API Endpoints Summary

| Method | Endpoint | Service | Description |
|--------|----------|---------|-------------|
| GET | `/` | Main | Root health check |
| GET | `/api/health` | Main | Detailed health check |
| GET | `/api/trading/config` | Trading | Get configuration options |
| POST | `/api/trading/start` | Trading | Start trading analysis |
| POST | `/api/trading/stop` | Trading | Stop trading analysis |
| POST | `/api/auth/login` | Auth | Login endpoint |
| WS | `/ws` | Main | WebSocket for real-time logs |

## Development Notes

### Adding a New Service

1. Create a new folder under `backend/services/`:
   ```
   backend/services/your-service/
   ├── __init__.py
   ├── service.py      # Business logic
   └── routes.py       # API endpoints
   ```

2. Define your service class in `service.py`

3. Create API routes in `routes.py` using FastAPI's `APIRouter`

4. Register in `services/__init__.py`:
   ```python
   from .your_service import YourService
   __all__ = [..., "YourService"]
   ```

5. Include router in `main.py`:
   ```python
   from services.your_service import router as your_router
   app.include_router(your_router)
   ```

### Service Communication

Services currently share:
- Models (from `backend/models/`)
- Global state (via callback functions)
- WebSocket broadcasting (for trading service)

For future microservice deployment, consider:
- Message queues (RabbitMQ, Redis)
- Service mesh (Istio, Linkerd)
- API Gateway pattern

## Architecture Benefits

✅ **Modularity:** Each service is self-contained  
✅ **Scalability:** Services can be scaled independently  
✅ **Maintainability:** Clear code organization  
✅ **Testability:** Services can be tested in isolation  
✅ **DRY:** No code duplication, shared models  
✅ **Flexibility:** Easy to add/remove services  

## Next Steps (Not Included)

This refactoring intentionally **excludes**:
- ❌ Frontend changes
- ❌ Docker containerization
- ❌ Kubernetes deployment
- ❌ JWT/token authentication
- ❌ Database integration
- ❌ Additional auth features (signup, logout, refresh tokens)

These can be added later as needed for production deployment.
