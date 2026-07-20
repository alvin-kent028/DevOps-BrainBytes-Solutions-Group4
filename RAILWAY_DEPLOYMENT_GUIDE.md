# Railway Deployment Guide - BrainBytes

## What Was Fixed

✅ **railway.json** - Changed `build.builder` from `"DOCKER"` to `"DOCKERFILE"`
- Railway only accepts `"DOCKERFILE"` or `"RAILPACK"` as valid builder values
- This was causing the "Invalid input" parse error during deployment

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
- Railway will auto-detect and deploy

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

### Issue: Build timeout
**Solution:** Ensure `.dockerignore` exists in both `backend/` and `frontend/`:
```
node_modules
.git
.gitignore
```

### Issue: Frontend can't reach backend
**Solution:** In Railway, set the frontend's `NEXT_PUBLIC_API_BASE_URL` to the backend service URL (e.g., `https://brainbytes-backend.railway.app`)

### Issue: MongoDB connection fails
**Solution:** Verify `MONGO_URI` uses Railway's MongoDB plugin or a valid connection string. Test with:
```bash
curl https://<backend-url>/health
```

### Issue: Health check failing
**Solution:** Backend must have the `/health` endpoint. Verify in [backend/app.js](backend/app.js) that the route exists and returns `{ status: "ok" }` when MongoDB is connected.

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
