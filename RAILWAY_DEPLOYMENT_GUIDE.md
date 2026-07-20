# Railway Deployment Guide - BrainBytes

## What Was Fixed

✅ **railway.json** - Updated for monorepo structure
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "context": "."
  },
  "variables": {
    "RAILWAY_DOCKERFILE_PATH": "backend/Dockerfile"
  }
}
```
- Tells Railway to look for backend/Dockerfile (not root)
- Sets correct builder to "DOCKERFILE"
- This fixes: "Failed to find Dockerfile at root" error in monorepo

✅ **.dockerignore files** - Added to both `backend/` and `frontend/`
- Speeds up Docker builds by excluding unnecessary files
- Reduces image size and build time

✅ **frontend/Dockerfile** - Upgraded to production-ready multi-stage build
- Uses Node.js 20 (matching backend)
- Implements proper Next.js build stage
- Runs as non-root user for security
- Optimized for Railway's container environment

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Fix Railway deployment configuration"
git push origin main
```

### 2. Connect to Railway
- Go to https://railway.app
- Click "New Project"
- Select "Deploy from GitHub repo"
- Authorize and select this repository
- Railway will auto-detect it's a monorepo and build the backend service

### 2b. Set Up Multiple Services (Backend + Frontend)

Since this is a monorepo, you need **separate Railway services** for backend and frontend:

**For Backend Service (from initial deployment):**
- Railway auto-detects the Dockerfile path from `railway.json`
- Build should now succeed with `RAILWAY_DOCKERFILE_PATH=backend/Dockerfile`

**For Frontend Service (add new service):**
1. In Railway Dashboard, click "New" → "GitHub Repo Service"
2. Select the **same repository**
3. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm run build` (automatic with Next.js detection)
   - Start Command: `npm start`
   - Port: `3000`
   - Create a `railway.json` or set environment variables (see below)

**Alternative: Create separate railway.json per service**
Place in subdirectory if needed, or use service-level env vars in Railway UI.

### 3. Configure Environment Variables in Railway

#### For Backend Service
Set these in Railway Dashboard > Variables:

```
PORT=5000
NODE_ENV=production
HUGGINGFACE_TOKEN=your_token_here
MONGO_URI=${{ Mongo.MONGO_URL }}
```

#### For Frontend Service
Set these in Railway Dashboard > Variables:

```
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://<your-backend-service-url>
```

#### For MongoDB Service
- Add a MongoDB plugin directly from Railway Dashboard
- It will automatically generate `MONGO_URL` which the backend can reference

### 4. Service Configuration in Railway

**Backend Service:**
- Root Directory: `backend`
- Start Command: `npm start`
- Port: `5000`
- Health Check: `/health`

**Frontend Service:**
- Root Directory: `frontend`
- Start Command: `npm start`
- Port: `3000`

**MongoDB Service:**
- Use Railway's built-in MongoDB plugin (recommended)
- Or reference external MongoDB connection string

### 5. Deployment Order
1. Deploy MongoDB first (if using Railway plugin)
2. Deploy Backend (depends on MongoDB)
3. Deploy Frontend (depends on Backend URL)

## Common Issues & Solutions

### Issue: "Failed to build an image" / "Dockerfile not found at root"
**Cause:** Railway is looking in the repo root, but Dockerfiles are in backend/ and frontend/
**Solution:** The `railway.json` now includes `RAILWAY_DOCKERFILE_PATH: backend/Dockerfile` which tells Railway where to find the Dockerfile. This should be fixed.

### Issue: Build timeout
**Solution:** `.dockerignore` files have been added to both `backend/` and `frontend/` to exclude unnecessary files. If still timing out:
- Check Railway logs for the specific bottleneck
- Ensure MongoDB is provisioned before backend starts
- Consider increasing instance resources in Railway Settings

### Issue: Frontend can't reach backend
**Solution:** In Railway, set the frontend's `NEXT_PUBLIC_API_BASE_URL` to the backend service URL (e.g., `https://brainbytes-backend.railway.app`)

### Issue: MongoDB connection fails
**Solution:** Verify `MONGO_URI` uses Railway's MongoDB plugin or a valid connection string. Test with:
```bash
curl https://<backend-url>/health
```
Should return: `{"status":"ok"}`

### Issue: Health check failing
**Solution:** Backend must have the `/health` endpoint. Verify in [backend/app.js](backend/app.js) that the route exists and returns `{ status: "ok" }` when MongoDB is connected.

### Issue: Monorepo build fails - "RAILWAY_DOCKERFILE_PATH not recognized"
**Solution:** This is a service-level variable that Railway reads during the build process. Make sure:
1. The root `railway.json` includes the variable in the `variables` section
2. For multiple services, each service needs its own configuration pointing to its Dockerfile

## Verify Deployment

Once deployed, test these endpoints:

1. **Health Check:**
   ```bash
   curl https://<backend-service-url>/health
   ```
   Should return: `{"status":"ok"}`

2. **Frontend:**
   ```
   https://<frontend-service-url>
   ```
   Should display the BrainBytes UI

3. **Chat API:**
   ```bash
   curl https://<backend-service-url>/api/chat
   ```
   Should work with proper authentication

## Quick Checklist

- [ ] Fixed `railway.json` (builder: "DOCKERFILE")
- [ ] Updated frontend Dockerfile for production
- [ ] Set up MongoDB on Railway
- [ ] Configured backend environment variables
- [ ] Configured frontend environment variables
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` to backend URL
- [ ] Verified `/health` endpoint works
- [ ] Tested frontend can reach backend
- [ ] Tested chat functionality end-to-end

## Documentation References

- Backend tests: [docs/testing.md](docs/testing.md)
- Operations guide: [docs/operations.md](docs/operations.md)
- Health check: See [backend/app.js](backend/app.js) for `/health` implementation

## Support

If you encounter issues:
1. Check Railway deployment logs (Deployments tab)
2. Review backend console logs for errors
3. Verify all environment variables are set correctly
4. Test MongoDB connectivity with health endpoint
