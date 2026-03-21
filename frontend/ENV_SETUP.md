# Frontend Environment Configuration

## Available Scripts

### Development (Local)
```bash
npm run dev
```
- Uses `.env.development`
- API: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws`
- For local development with local backend

### Test (Render Deployment)
```bash
npm run test
```
- Uses `.env.test`
- API: `https://tradesupport.onrender.com`
- WebSocket: `wss://tradesupport.onrender.com/ws`
- For testing against deployed backend

### Production
```bash
npm run prod
```
- Uses `.env.production`
- API: `http://localhost:8000` (configured for localhost for now)
- WebSocket: `ws://localhost:8000/ws`
- Update `.env.production` when production URL is ready

## Build Scripts

### Build for Test
```bash
npm run build:test
```
Builds the app with test environment variables.

### Build for Production
```bash
npm run build:prod
```
Builds the app with production environment variables.

## Environment Files

- `.env.development` - Local development configuration
- `.env.test` - Test environment (Render) configuration
- `.env.production` - Production environment configuration
- `.env.local` - Local overrides (not committed to git)

## Environment Variables

All environment files support the following variables:

- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_WS_URL` - WebSocket connection URL

## Usage Examples

```bash
# Start local development
npm run dev

# Test against deployed backend
npm run test

# Run production build locally
npm run prod

# Build for test deployment
npm run build:test

# Build for production deployment
npm run build:prod
```

## Notes

- `.env.local` takes precedence over other env files
- Vite automatically loads the correct `.env` file based on the `--mode` flag
- All env variables must be prefixed with `VITE_` to be exposed to client code

## Vercel Deployment

### Test Environment Deployment

The `vercel.json` configuration is set up for test environment deployment:

```json
{
  "buildCommand": "npm run build:test",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_BASE_URL": "https://tradesupport.onrender.com",
    "VITE_WS_URL": "wss://tradesupport.onrender.com/ws"
  }
}
```

**When you deploy to Vercel**, it will:
1. Use `npm run build:test` to build the app
2. Connect to the test backend at `https://tradesupport.onrender.com`
3. Use WebSocket at `wss://tradesupport.onrender.com/ws`

**To deploy:**
```bash
vercel --prod
```

### Switching to Production

When ready for production, update `vercel.json`:
1. Change `buildCommand` to `"npm run build:prod"`
2. Update `env` variables to point to your production backend
3. Redeploy with `vercel --prod`
