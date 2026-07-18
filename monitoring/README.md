# BrainBytes Monitoring and Simulation

## Overview
This document describes the BrainBytes observability stack, the custom application metrics, Prometheus configuration, recording rules, alert definitions, and the traffic simulation framework used for testing.

## Architecture
```
+----------------+       +--------------------+       +-------------+
| BrainBytes API | ----> | Prometheus         | ----> | Grafana     |
|  (backend)     |  |    | - scrapes /metrics |       | - dashboards|
+----------------+  |    +--------------------+       +-------------+
                     |
                     |        +-----------------+
                     +------> | Node Exporter   |
                     |        | - system metrics |
                     |        +-----------------+
                     |
                     |        +-----------------+
                     +------> | Alertmanager    |
                              | - receives alerts|
                              +-----------------+
```

### Components
- `Prometheus`: central collector for backend and exporter metrics.
- `Node Exporter`: exposes host-level CPU, memory, and process metrics.
- `Grafana`: dashboarding and visualization layer.
- `Alertmanager`: routes alerts based on configured notifications.
- `Backend /metrics`: application-specific BrainBytes metrics and custom AI/session metrics.
- `Monitoring Simulator`: generates synthetic traffic and error conditions for tests.

### Data Flow
1. BrainBytes backend exposes `/metrics` via `prom-client`.
2. Prometheus scrapes the backend, Node Exporter, and Grafana at job-specific intervals.
3. Prometheus evaluates alert rules and recording rules continuously.
4. Grafana reads Prometheus time series and renders dashboards.
5. Alertmanager receives alerts from Prometheus and applies routing/notification policies.

## Prometheus Configuration
- Backend scrape interval: `15s`
- Node Exporter scrape interval: `30s`
- Grafana scrape interval: `60s`
- Job-specific `scrape_timeout` set to `10s`
- `sample_limit` and `target_limit` set per job to protect the server from bursty exporters
- `recording_rules.yml` contains precomputed metrics for high-frequency queries

## Metrics Catalog
| Metric | Type | Description | Labels | Example Query | Category |
|---|---|---|---|---|---|
| `brainbytes_api_request_total` | Counter | Total number of API requests | `method`, `path`, `status` | `sum(rate(brainbytes_api_request_total[5m])) by (path)` | Application |
| `brainbytes_api_request_errors_total` | Counter | Total API errors | `method`, `path`, `status`, `category` | `sum(rate(brainbytes_api_request_errors_total[5m])) by (category)` | Application |
| `brainbytes_api_request_duration_seconds` | Histogram | API request latency distribution | `method`, `path`, `status` | `histogram_quantile(0.95, sum(rate(brainbytes_api_request_duration_seconds_bucket[5m])) by (le))` | Application |
| `brainbytes_ai_response_time_seconds` | Histogram | AI response latency | none | `histogram_quantile(0.90, sum(rate(brainbytes_ai_response_time_seconds_bucket[5m])) by (le))` | Application |
| `brainbytes_ai_responses_total` | Counter | Total AI response outcomes | `status`, `category` | `sum(rate(brainbytes_ai_responses_total[5m])) by (status)` | Application |
| `brainbytes_active_sessions` | Gauge | Active chat sessions | `region` | `sum(brainbytes_active_sessions) by (region)` | Application |
| `brainbytes_session_duration_seconds` | Histogram | Session duration observations | `channel` | `histogram_quantile(0.90, sum(rate(brainbytes_session_duration_seconds_bucket[5m])) by (le, channel))` | Application |
| `brainbytes_mobile_active_connections` | Gauge | Active mobile connections | `country`, `network` | `sum(brainbytes_mobile_active_connections) by (country, network)` | Business |
| `brainbytes_mobile_connectivity_quality` | Gauge | Mobile network quality score | `country`, `network` | `avg(brainbytes_mobile_connectivity_quality) by (country, network)` | Business |
| `brainbytes_mobile_data_usage_megabytes` | Gauge | Estimated mobile data usage | `country`, `network` | `sum(brainbytes_mobile_data_usage_megabytes) by (country, network)` | Business |

## Query Reference Guide
1. `sum(rate(brainbytes_api_request_total[5m])) by (path)`
   - Shows request volume per endpoint. Use to identify hot paths.
2. `sum(rate(brainbytes_api_request_errors_total[5m])) by (category)`
   - Tracks error traffic by category (client_error/server_error).
3. `job:brainbytes_api_error_rate:ratio` 
   - Precomputed backend error ratio.
4. `job:brainbytes_backend_95th_latency_seconds`
   - 95th percentile API latency from recording rules.
5. `job:brainbytes_ai_response_95th_seconds`
   - 95th percentile AI response latency.
6. `sum(brainbytes_active_sessions) by (region)`
   - Current active session count per region.
7. `histogram_quantile(0.90, sum(rate(brainbytes_session_duration_seconds_bucket[5m])) by (le, channel))`
   - Session duration distribution for each channel.
8. `sum(brainbytes_mobile_active_connections) by (country, network)`
   - Mobile load by geography and network type.
9. `avg(brainbytes_mobile_connectivity_quality) by (country, network)`
   - Average mobile quality score for local networks.
10. `sum(brainbytes_mobile_data_usage_megabytes) by (country, network)`
   - Total mobile data consumption support metric.
11. `process_resident_memory_bytes{job='brainbytes-backend'}`
   - Backend memory usage, useful for detecting leaks.

## Alert Rules
| Alert | Threshold | Justification | Response |
|---|---|---|---|
| `BackendHighErrorRate` | `rate(brainbytes_api_request_errors_total[5m]) > 0.05` for 5m | Indicates application defects or backend failures | Check logs, validate DB, restart backend if persistent |
| `BackendLatencyWarning` | `histogram_quantile(0.95, sum(rate(brainbytes_api_request_duration_seconds_bucket[5m])) by (le)) > 1.5` for 10m | High request latency degrades UX | Inspect slow endpoints, verify CPU/DB health, scale if needed |
| `HighMemoryUsage` | `process_resident_memory_bytes{job='brainbytes-backend'} > 500 * 1024 * 1024` for 5m | Potential memory leak or pressure | Review heap use, clear caches, restart service if necessary |
| `HighAIResponseTime` | `histogram_quantile(0.90, sum(rate(brainbytes_ai_response_time_seconds_bucket[5m])) by (le)) > 2.0` for 5m | AI latency affecting chat responsiveness | Check AI model latency, queueing, and external service health |

### Alert Grouping and Routing
- Alerts are grouped by the backend job and severity labels.
- `severity=critical` alerts route to the AI or Ops team.
- `severity=warning` alerts are used for operational investigation and capacity planning.

## Simulation and Scenario Testing
The `monitoring/traffic_simulator.js` script now supports multiple behavior patterns and scenario coverage.

### Supported scenarios
- `normal`
  - Description: Balanced chat traffic and healthy mobile connectivity.
  - Expected metric behavior: stable request rate, low error ratio, normal AI latency, consistent mobile quality.
- `peakHours`
  - Description: High request volume with ramped user sessions and mobile load.
  - Expected metric behavior: elevated request rate, rising active sessions, higher mobile data usage, normal to slightly higher latency.
- `errorSpike`
  - Description: Invalid requests and overloaded payloads to trigger errors.
  - Expected metric behavior: error counter spike, error ratio increase, AI error outcomes surface.
- `resourceConstraint`
  - Description: Simulated low mobile quality and long-running session durations.
  - Expected metric behavior: increased session duration histogram, low mobile connectivity quality, active sessions remain high.

### Run scenarios
```powershell
cd monitoring
node traffic_simulator.js normal
node traffic_simulator.js peakHours
node traffic_simulator.js errorSpike
node traffic_simulator.js resourceConstraint
```

### Notes
- Use `BASE_URL` to point the simulator at a non-default backend endpoint.
- The simulator exercises internal session metrics and mobile metric ingestion alongside normal chat traffic.
- These scenarios are designed to validate both the Prometheus scrape pipeline and the custom BrainBytes metrics catalog.
