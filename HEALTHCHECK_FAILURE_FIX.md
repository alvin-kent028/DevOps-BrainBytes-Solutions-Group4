# Railway Healthcheck Failure - MongoDB Setup Guide

## Why the Healthcheck Failed

The deployment process reached:
- ✅ Initialization - passed
- ✅ Build - passed (40 seconds)
- ✅ Deploy - passed (2 seconds)
- ❌ **Network > Healthcheck - FAILED**

**Root Cause:** The backend health endpoint (`/health`) requires MongoDB to be connected. MongoDB hasn't been provisioned in Railway yet, so it returns **503 Service Unavailable** instead of **200 OK**.

## Solution: Set Up MongoDB First

### Step 1: Add MongoDB to Your Railway Project

1. Go to your **Railway Project Dashboard**
2. Click **Create** or **+** button
3. Select **Database** → **MongoDB**
4. Wait for MongoDB to provision (2-3 minutes)
5. Once ready, the MongoDB service will appear in your project

### Step 2: Connect Backend to MongoDB

1. Go to the **Backend Service** 
2. Click **Variables**
3. Add this variable:
   ```
   MONGO_URI = <copy from MongoDB service>
   ```

**To get MongoDB connection string:**
- Go to **MongoDB Service** → **Variables**
- Look for a variable like `MONGO_URL` or `DATABASE_URL`
- Copy the entire connection string
- Paste it into Backend's `MONGO_URI` variable

Example format:
```
mongodb+srv://user:password@cluster.mongodb.net/brainbytes?retryWrites=true&w=majority
```

### Step 3: Redeploy Backend

1. In **Backend Service**, click **Redeploy**
2. Watch the deployment progress:
   - Initialization → Build → Deploy → **Network > Healthcheck** (should now PASS)
3. Once healthcheck passes, click **Post-deploy** (if configured)

### Step 4: Verify Health Endpoint

Once deployed successfully:
```bash
curl https://<your-backend-url>/health
```

Should return:
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2026-07-20T07:30:00.000Z",
  "db": "connected"
}
```

## What I Fixed in railway.json

Updated the health check configuration for better reliability:

```json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 60,
    "healthcheckInterval": 10,
    "healthcheckRetries": 5
  }
}
```

- **Increased timeout** from 30s → 60s (gives MongoDB more time to connect)
- **Added interval** of 10s between health checks
- **Added 5 retries** so temporary connection issues don't fail the deployment

## Deployment Order (CORRECT)

1. ✅ Add **MongoDB service** FIRST
2. ✅ Configure **Backend** with MONGO_URI
3. ✅ Deploy **Backend** (healthcheck will pass)
4. ✅ Add **Frontend** service  
5. ✅ Configure **Frontend** with NEXT_PUBLIC_API_BASE_URL

## Complete Environment Variables Setup

### Backend Service Variables
```
NODE_ENV = production
PORT = 5000
MONGO_URI = <from MongoDB service>
HUGGINGFACE_TOKEN = <your token>
```

### Frontend Service Variables
```
NODE_ENV = production
NEXT_PUBLIC_API_BASE_URL = <your backend service URL from Railway>
```

## Troubleshooting

### Still failing healthcheck after MongoDB setup?

**Check 1: Is MONGO_URI set?**
- Go to Backend Service → Variables
- Verify `MONGO_URI` exists and has a valid connection string
- Click **Redeploy**

**Check 2: View Backend Logs**
- Go to Backend Service → Deploy Logs
- Look for MongoDB connection errors
- Check if connection string is valid

**Check 3: Test MongoDB Connection**
```bash
# From local terminal (if you have MongoDB tools)
mongosh "<your-mongo-uri>"
```

**Check 4: Increase Healthcheck Timeout Further**
- Edit `railway.json`
- Increase `healthcheckTimeout` to 90 or 120
- Commit and push changes
- Railway will auto-redeploy

### MongoDB service won't provision?
- Check Railway project credits/limits
- Ensure you have resource quota available
- Try creating a new MongoDB service

### Connection string format wrong?
- Verify format: `mongodb+srv://` or `mongodb://`
- Check for special characters in password (might need URL encoding)
- Ensure database name is included in connection string

## Next Steps

1. ✅ Commit the updated `railway.json` to git:
   ```bash
   git add railway.json
   git commit -m "Improve healthcheck resilience: increase timeout, add retries"
   git push
   ```

2. ✅ In Railway Dashboard:
   - Add MongoDB service
   - Set Backend's `MONGO_URI` 
   - Trigger Backend redeploy

3. ✅ Once Backend healthcheck passes:
   - Add Frontend service
   - Set Frontend's `NEXT_PUBLIC_API_BASE_URL`
   - Deploy Frontend

4. ✅ Test end-to-end:
   - Open frontend URL
   - Try sending a message
   - Verify it reaches backend
   - Check MongoDB for stored messages

## Support Resources

- Railway MongoDB Plugin: https://docs.railway.app/databases/mongodb
- Healthcheck Configuration: https://docs.railway.app/deploy/deployments#health-checks
- MongoDB Connection String: https://docs.mongodb.com/manual/reference/connection-string/
