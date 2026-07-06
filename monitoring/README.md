# Monitoring and Traffic Simulation

## Overview
This documentation describes the BrainBytes monitoring architecture, custom metrics, alerting rules, PromQL queries, and traffic simulation scenarios.

## Architecture
- `prometheus/prometheus.yml` scrapes backend metrics and both monitoring services.
- `grafana/provisioning` configures Grafana to use Prometheus as its data source.
- `backend/metrics.js` exports custom Prometheus metrics and exposes `/metrics`.
- `monitoring/traffic_simulator.js` generates normal, high-load, and error traffic.

## Custom Metrics Catalog

1. `brainbytes_api_request_total` (Counter)
   - Labels: `method`, `path`, `status`
   - Tracks API request volume.

2. `brainbytes_api_request_errors_total` (Counter)
   - Labels: `method`, `path`, `status`, `category`
   - Tracks backend error counts by status and category.

3. `brainbytes_api_request_duration_seconds` (Histogram)
   - Labels: `method`, `path`, `status`
   - Tracks request latency distributions.

4. `brainbytes_ai_response_time_seconds` (Histogram)
   - Tracks AI response latency.

5. `brainbytes_mobile_active_connections` (Gauge)
   - Labels: `country`, `network`
   - Tracks current mobile connections.

6. `brainbytes_mobile_connectivity_quality` (Gauge)
   - Labels: `country`, `network`
   - Tracks mobile connection quality score.

7. `brainbytes_mobile_data_usage_megabytes` (Gauge)
   - Labels: `country`, `network`
   - Tracks estimated mobile data usage.

## PromQL Queries

1. `rate(brainbytes_api_request_total[5m])`
2. `rate(brainbytes_api_request_errors_total[5m])`
3. `rate(brainbytes_api_request_errors_total[5m]) / rate(brainbytes_api_request_total[5m])`
4. `histogram_quantile(0.95, sum(rate(brainbytes_api_request_duration_seconds_bucket[5m])) by (le))`
5. `histogram_quantile(0.90, sum(rate(brainbytes_ai_response_time_seconds_bucket[5m])) by (le))`
6. `sum(brainbytes_mobile_active_connections) by (country, network)`
7. `avg(brainbytes_mobile_connectivity_quality) by (country, network)`
8. `sum(brainbytes_mobile_data_usage_megabytes) by (country, network)`
9. `sum(rate(brainbytes_api_request_total[5m])) by (method, path)`
10. `sum(rate(brainbytes_api_request_errors_total[5m])) by (method, path)`

## Alert Rules and Response Procedures

- `BackendHighErrorRate`
  - Threshold: > 5% errors over 5 minutes.
  - Response: check backend logs, validate Mongo connectivity, restart backend if error bursts persist.

- `BackendLatencyWarning`
  - Threshold: 95th percentile response time > 1.5s over 10 minutes.
  - Response: inspect slow endpoints, check CPU and memory; consider scaling.

- `HighMemoryUsage`
  - Threshold: memory > 500MiB for 5 minutes.
  - Response: review backend heap/memory usage, clear caches, restart if necessary.

- `HighAIResponseTime`
  - Threshold: 90th percentile AI response time > 2s.
  - Response: check AI service latency, request queueing, or dialogue complexity.

## Traffic Simulation Scenarios

- `normal`: typical chat messages and mobile metrics for PH 4G.
- `highLoad`: 25 rapid messages plus heavy mobile connections.
- `errorBurst`: invalid and oversized requests to trigger backend errors.

### Run Simulator

```powershell
cd monitoring
node traffic_simulator.js normal
node traffic_simulator.js highLoad
node traffic_simulator.js errorBurst
```

## Philippine Context

- Monitor mobile performance, connectivity quality, and data usage for Filipino users.
- Use localized network labels (`PH`, `4G`, `3G`) to expose regional performance.
- Optimize costs by scraping at 15s intervals and using recording rules to reduce query load.
- Prefer lightweight metrics and avoid high-cardinality labels in production.
