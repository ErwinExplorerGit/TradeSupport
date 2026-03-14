# Vercel Deployment Guide

## Current Configuration

The `vercel.json` is configured for **TEST environment** deployment:

- **Build Command:** `npm run build:test`
- **Backend API:** `https://tradesupport.onrender.com`
- **WebSocket:** `wss://tradesupport.onrender.com/ws`

## Deploy to Vercel

```bash
# Deploy to production (uses test environment backend)
vercel --prod

# Or just deploy (preview deployment)
vercel
```

## What Happens on Deploy

1. Vercel runs `npm run build:test`
2. This uses `.env.test` configuration
3. Frontend connects to Render backend at `tradesupport.onrender.com`
4. WebSocket connects to `wss://tradesupport.onrender.com/ws`

## Environment Variables

Environment variables are set in `vercel.json`:

```json
"env": {
  "VITE_API_BASE_URL": "https://tradesupport.onrender.com",
  "VITE_WS_URL": "wss://tradesupport.onrender.com/ws"
}
```

These override the `.env.test` file during Vercel builds.

## For Production Deployment

When you're ready to deploy to production:

1. **Update `vercel.json`:**
   ```json
   {
     "buildCommand": "npm run build:prod",
     "env": {
       "VITE_API_BASE_URL": "https://your-production-backend.com",
       "VITE_WS_URL": "wss://your-production-backend.com/ws"
     }
   }
   ```

2. **Or use Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add production environment variables
   - Trigger redeploy

## Vercel CLI Commands

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (preview)
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List deployments
vercel ls
```

## Troubleshooting

### API Connection Issues

If the frontend can't connect to the backend:

1. Check backend is deployed and running on Render
2. Verify CORS settings in backend allow Vercel domain
3. Check environment variables in Vercel dashboard
4. View browser console for API errors

### WebSocket Connection Issues

1. Ensure backend WebSocket endpoint is working: `wss://tradesupport.onrender.com/ws`
2. Check browser console for WebSocket errors
3. Verify backend allows WebSocket connections from Vercel domain

### Build Failures

1. Check build logs in Vercel dashboard
2. Verify `npm run build:test` works locally
3. Ensure all dependencies are in `package.json`
4. Check for TypeScript errors

## Local Testing Before Deploy

```bash
# Test the build locally
npm run build:test

# Preview the build
npm run preview

# Test against test backend
npm run test
```

## Current Setup Summary

- **Local Development:** `npm run dev` → `localhost:8000`
- **Local Test Mode:** `npm run test` → `tradesupport.onrender.com`
- **Vercel Deployment:** `vercel --prod` → `tradesupport.onrender.com`
- **Production (Future):** Update vercel.json → production backend

✅ Ready to deploy with `vercel --prod`!
