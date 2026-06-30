# Operations Runbook

This document covers the operational practices that don't live in code: staging,
monitoring, scaling, and rollback. It exists because our mentor feedback flagged
that the written docs described practices that didn't match the actual pipeline —
this file is meant to stay honest about what's actually configured vs. what's
still a TODO, and it should be updated whenever that changes.

## 1. Environments

| Environment | Where it runs | How it's triggered | Status |
|---|---|---|---|
| Local dev | `docker-compose.yml` on a dev machine | `docker compose up` | Working |
| CI (test) | GitHub Actions runners | every push / PR | Working |
| Production | Railway (`brainbytes-backend`, `brainbytes-frontend`, MongoDB) | `deploy` job on push to `main`/`master` | Working |
| Staging | Not set up yet | — | **TODO** |

### Setting up staging (action item)
Railway supports multiple environments per project natively, so this doesn't need
a second project:

1. In the Railway dashboard, open the project and use **New Environment** to create
   a `staging` environment. This clones service configuration but gives you
   separate variables and a separate MongoDB instance.
2. Add a second job to `ci.yml` (or a separate workflow) that deploys to staging
   when a PR is opened against `main`, using `railway up --environment staging`.
3. Set `RAILWAY_STAGING_TOKEN` as a GitHub secret if staging needs a different
   project token than production.
4. Treat `main` as "what's in staging" and only fast-forward to a `production`
   branch (or tag) once staging has been manually checked. Alternatively, keep
   the current single-branch flow but require a manual approval gate
   (`environment:` protection rules in GitHub Actions) before the `deploy` job
   runs, so a human signs off after seeing staging is healthy.

## 2. Rollback Procedure

Two layers of protection exist:

**Automatic (already in place):** `railway.json` sets `healthcheckPath: /health`.
Railway will not route production traffic to a new deployment until that
endpoint returns `200`. The backend's `/health` route (added in `backend/app.js`)
returns `200` only when the database connection is live, and `503` otherwise —
so a deployment that can't reach Mongo never goes live, and the previous
working deployment keeps serving traffic.

**Manual rollback (when a bad deploy still gets through, e.g. a bug that only
shows up after the healthcheck passes):**

1. Open the Railway dashboard → the affected service → **Deployments** tab.
2. Find the last known-good deployment, click the three-dot menu, and choose
   **Redeploy**. This redeploys that exact build, no rebuild needed, and is the
   fastest path back to a working state.
3. In parallel, revert the bad commit in git (`git revert <sha>`) and push, so
   the next automated deploy doesn't reintroduce the bug.
4. Note in the team channel / issue tracker what broke and why, so it can be
   added as a regression test.

CI now has a **Verify Backend Deployment Health** step (`ci.yml`) that polls
`/health` after deploy and fails the workflow with an explicit rollback
instruction if it doesn't recover within ~100 seconds. This requires a
`BACKEND_PUBLIC_URL` GitHub secret (e.g. `https://brainbytes-backend.up.railway.app`)
to be set — without it, the check will fail by default. Add it under
**Repo Settings → Secrets and variables → Actions**.

## 3. Monitoring & Alerting (action item — not yet configured)

Nothing currently watches the app between deploys. Recommended minimum setup:

- **Uptime monitoring:** point a free tier of [UptimeRobot](https://uptimerobot.com)
  or [Better Stack](https://betterstack.com) at `/health` on both services,
  checking every 5 minutes, alerting to email/Discord on failure.
- **Log access:** Railway retains logs per deployment in the dashboard
  (`railway logs` from the CLI also streams them). No external log aggregation
  is set up; for a class project this is probably fine, but note it as a known
  gap rather than implying log retention exists.
- **Error tracking:** consider a free Sentry project for the backend to catch
  unhandled exceptions in production instead of relying on someone noticing
  the chat stops responding.

## 4. Scaling & Resource Limits

Current Railway plan gives each service a shared micro-vCPU and 512MB RAM, with
`numReplicas: 1` and no autoscaling (see `railway.json`). This is a **billing
plan setting**, not something expressible in `railway.json` — Railway's free/hobby
tier doesn't currently support per-service autoscaling rules in code. To change
this:

1. Open the service in the Railway dashboard → **Settings → Resources**, and
   increase the memory/vCPU allocation (requires a paid plan tier for higher
   limits).
2. If horizontal scaling is needed, raise `numReplicas` in `railway.json` — but
   note this only works for stateless services (the frontend and backend), not
   MongoDB, and multiple backend replicas will need to share the same Mongo
   instance, which they already do via `MONGO_URI`.
3. Until then, document the limit honestly: this is a class project sized for
   light concurrent use, not classroom-wide simultaneous traffic.

## 5. Container Vulnerability Scanning

`ci.yml` now runs [Trivy](https://aquasecurity.github.io/trivy/) against the
built backend and frontend Docker images on every push/PR, failing the build on
CRITICAL/HIGH severity CVEs with an available fix. This catches vulnerable base
images and OS packages baked into the container, which `npm audit` alone can't see
since `npm audit` only checks Node dependencies, not the underlying Alpine image.
