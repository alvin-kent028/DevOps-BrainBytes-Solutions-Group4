# BrainBytes Monitoring Guide

## 1. Monitoring architecture

- Prometheus scrapes the backend metrics endpoint at `/metrics` and collects alert evaluations from the rule files in `prometheus/`.
- Grafana is provisioned from `grafana/provisioning/` and automatically loads dashboards from `grafana/dashboards/`.
- The backend exposes request, latency, AI timing, and mobile connectivity metrics through `backend/metrics.js`.
- The traffic simulator in `monitoring/traffic_simulator.js` produces normal, high-load, and error-burst traffic so the dashboards can be exercised.

## 2. Where to view the monitoring stack

- Prometheus UI: http://localhost:9090
- Grafana UI: http://localhost:3001 (admin / admin)
- Backend metrics: http://localhost:5000/metrics

## 3. Dashboard catalog

### BrainBytes Error Analysis
- Use this dashboard to identify spikes in error rate, endpoint-level failures, and AI latency regressions.
- It is auto-provisioned from `grafana/dashboards/brainbytes-error-analysis.json`.

### BrainBytes Resource Optimization
- Use this dashboard to inspect memory pressure, request throughput, and mobile connection quality.
- It is auto-provisioned from `grafana/dashboards/brainbytes-resource-optimization.json`.

## 4. Metric dictionary

- `brainbytes_api_request_total`: counter of all incoming requests labeled by method, path, and status.
- `brainbytes_api_request_errors_total`: counter of failing requests labeled by status and category.
- `brainbytes_api_request_duration_seconds`: histogram for request latency.
- `brainbytes_ai_response_time_seconds`: histogram for AI response latency.
- `brainbytes_mobile_active_connections`: gauge for active mobile sessions.
- `brainbytes_mobile_connectivity_quality`: gauge for mobile quality score.
- `brainbytes_mobile_data_usage_megabytes`: gauge for estimated mobile data usage.

## 5. Alert reference

- `BackendHighErrorRate`: critical alert when the error ratio stays above 5% for 5 minutes.
- `BackendLatencyWarning`: warning alert when p95 request latency exceeds 1.5 seconds for 10 minutes.
- `UserExperienceDegradation`: warning/critical alert when error ratio or p95 latency degrades.
- `SessionVolumeDrop`: warning alert when request throughput drops sharply.
- `HighMemoryUsage`: warning alert when backend memory use exceeds 500 MiB.
- `HighAIResponseTime`: critical alert when AI response latency exceeds 2 seconds.

## 6. Alerting configuration

- Prometheus alert rules live in `prometheus/alert_rules.yml`.
- Alert routing is configured in `prometheus/alertmanager.yml` and can be extended to email, Slack, or webhook destinations.

## 7. Demo plan (10-15 minutes)

1. Start the stack with `docker compose up -d`.
2. Open Grafana and browse the two dashboards.
3. Run the simulator in normal mode for 1-2 minutes: `node monitoring/traffic_simulator.js normal`.
4. Run high load for 2-3 minutes: `node monitoring/traffic_simulator.js highLoad`.
5. Trigger the error burst and watch the dashboards and alerts react: `node monitoring/traffic_simulator.js errorBurst`.
6. Use the Prometheus UI to inspect alert state and the `/metrics` endpoint to confirm metrics are flowing.

## 8. Screenshot workflow

- Open each dashboard in Grafana.
- Use the browser’s screenshot tool or the built-in capture command.
- Save screenshots to a folder such as `docs/screenshots/` for your submission package.

## 9. Security and retention

- Keep Grafana credentials private and avoid exposing the UI publicly without auth.
- Retain metrics for at least 7-14 days in development and extend as needed for production.
- Avoid high-cardinality labels in production and keep scrape intervals lightweight.
