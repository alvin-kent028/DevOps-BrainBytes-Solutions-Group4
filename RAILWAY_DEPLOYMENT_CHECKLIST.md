# Railway Monorepo Deployment Checklist - BrainBytes

## Pre-Deployment (Local)

- [ ] Commit all changes to git
  ```bash
  git add .
  git commit -m "Fix Railway monorepo deployment configuration"
  ```

- [ ] Verify Dockerfiles exist:
  - [ ] `backend/Dockerfile` exists and is valid
  - [ ] `frontend/Dockerfile` exists and is valid
  
- [ ] Verify `.dockerignore` files exist:
  - [ ] `backend/.dockerignore` ✓ Created
  - [ ] `frontend/.dockerignore` ✓ Created

- [ ] Verify `railway.json` configuration:
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

## Railway Project Setup

### Step 1: Deploy Backend Service

1. Go to https://railway.app and log in
2. Create a **New Project**
3. Select **Deploy from GitHub repo**
4. Search for and select `KharlMotorPH-master` repository
5. GitHub will redirect back to Railway - wait for deployment to start

**Backend should now build successfully** with `RAILWAY_DOCKERFILE_PATH=backend/Dockerfile`

### Step 2: Configure Backend Environment Variables

1. In Railway Dashboard, go to **Backend Service** → **Variables**
2. Add these environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `PORT` | `5000` | Backend port |
| `NODE_ENV` | `production` | Production mode |
| `MONGO_URI` | [See Step 3] | MongoDB connection string |
| `HUGGINGFACE_TOKEN` | `your_token_here` | Get from huggingface.co |

3. Save and **Redeploy** the service

### Step 3: Add MongoDB Service

1. In Railway Project, click **Create** → **Database** → **MongoDB**
2. Wait for MongoDB to provision (2-3 minutes)
3. Once ready, copy the connection string from MongoDB service variables
4. Paste into Backend's `MONGO_URI` variable
5. Backend will auto-redeploy with MongoDB connection

**Test:** Go to Backend URL + `/health`, should return `{"status":"ok"}`

### Step 4: Deploy Frontend Service

1. In Railway Project, click **Create** → **GitHub Repo**
2. Select the **same repository** (`KharlMotorPH-master`)
3. Click **Configure**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Port: `3000`

4. Click **Deploy**

### Step 5: Configure Frontend Environment Variables

1. In Railway Dashboard, go to **Frontend Service** → **Variables**
2. Add these environment variables:

| Key | Value | Example |
|-----|-------|---------|
| `NODE_ENV` | `production` | Production mode |
| `NEXT_PUBLIC_API_BASE_URL` | `https://<backend-url>` | See below for backend URL |

3. To get Backend URL:
   - Go to **Backend Service** → **Settings**
   - Copy the public domain (e.g., `https://brainbytes-backend.railway.app`)
   - Paste into Frontend's `NEXT_PUBLIC_API_BASE_URL`

4. Save and **Redeploy** Frontend

## Verification Checklist

- [ ] Backend health check passes: `curl https://<backend-url>/health`
  - Returns: `{"status":"ok"}`

- [ ] Frontend loads: `https://<frontend-url>`
  - Should display BrainBytes UI

- [ ] Frontend connects to backend:
  - Open frontend URL in browser
  - Go to Chat page
  - Try asking a question (should connect to backend API)

- [ ] MongoDB is connected:
  - Backend `/health` returns `{"status":"ok"}`
  - Chat messages are stored (check in MongoDB)

- [ ] Chat history persists:
  - Ask a question, refresh page
  - Previous messages should still appear

## Troubleshooting

### Backend still fails to build
```
Error: RAILWAY_DOCKERFILE_PATH not found
```
- [ ] Verify `railway.json` has correct `RAILWAY_DOCKERFILE_PATH` value
- [ ] Verify `backend/Dockerfile` exists in repo
- [ ] Try manually triggering a redeploy in Railway

### Frontend can't reach backend
```
Error: ECONNREFUSED or CORS error in console
```
- [ ] Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly in Frontend variables
- [ ] Verify Backend URL includes `https://` (not `http://`)
- [ ] Check Backend service is running (view logs)
- [ ] Verify Backend CORS middleware allows frontend origin

### MongoDB connection fails
```
Error: connect ECONNREFUSED
```
- [ ] Verify MongoDB service is running in Railway
- [ ] Verify `MONGO_URI` is set in Backend variables
- [ ] Check MongoDB connection string is correct format
- [ ] View Backend logs for connection error details

### Health check timeout
```
Error: Health check failed
```
- [ ] Verify Backend `/health` endpoint is implemented
- [ ] Check Backend is actually running (view logs)
- [ ] Verify port 5000 is not blocked
- [ ] Increase `healthcheckTimeout` in `railway.json` if needed

## Service URLs (after deployment)

Once deployed, Railway provides URLs like:

```
Backend:  https://brainbytes-backend-[random].railway.app
Frontend: https://brainbytes-frontend-[random].railway.app
MongoDB:  mongodb+srv://[user]:[pass]@[cluster].mongodb.net/[db]
```

Use these in your environment variables and for testing.

## Rollback

If deployment fails:
1. Go to **Deployments** tab in Railway
2. Find the last successful deployment
3. Click **Rollback** to return to previous version
4. Fix issues locally and commit new changes

## Support Resources

- Railway Docs: https://docs.railway.app
- BrainBytes Operations: [docs/operations.md](../docs/operations.md)
- Testing Guide: [docs/testing.md](../docs/testing.md)
