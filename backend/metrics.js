const client = require('prom-client');

collectDefaultMetrics();

const apiRequestCounter = new client.Counter({
  name: 'brainbytes_api_request_total',
  help: 'Total number of API requests received',
  labelNames: ['method', 'path', 'status']
});

const apiRequestErrorCounter = new client.Counter({
  name: 'brainbytes_api_request_errors_total',
  help: 'Total number of backend API errors',
  labelNames: ['method', 'path', 'status', 'category']
});

const apiDurationHistogram = new client.Histogram({
  name: 'brainbytes_api_request_duration_seconds',
  help: 'API request duration distribution',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const aiResponseHistogram = new client.Histogram({
  name: 'brainbytes_ai_response_time_seconds',
  help: 'AI response generation latency',
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const mobileActiveConnectionsGauge = new client.Gauge({
  name: 'brainbytes_mobile_active_connections',
  help: 'Current number of active mobile user connections',
  labelNames: ['country', 'network']
});

const mobileConnectivityQualityGauge = new client.Gauge({
  name: 'brainbytes_mobile_connectivity_quality',
  help: 'Mobile connectivity quality score from 0 to 100',
  labelNames: ['country', 'network']
});

const mobileDataUsageGauge = new client.Gauge({
  name: 'brainbytes_mobile_data_usage_megabytes',
  help: 'Estimated mobile data usage in megabytes',
  labelNames: ['country', 'network']
});

function collectDefaultMetrics() {
  client.collectDefaultMetrics({ timeout: 5000 });
}

function registerRequestMetrics(req, res, next) {
  const timer = apiDurationHistogram.startTimer({ method: req.method, path: req.path, status: 'pending' });

  res.on('finish', () => {
    const labels = {
      method: req.method,
      path: req.path,
      status: String(res.statusCode)
    };

    apiRequestCounter.inc(labels);

    if (res.statusCode >= 400) {
      const category = res.statusCode >= 500 ? 'server_error' : 'client_error';
      apiRequestErrorCounter.inc({ ...labels, category });
    }

    timer(labels);
  });

  next();
}

function observeAIResponseTime(durationSeconds) {
  if (typeof durationSeconds === 'number') {
    aiResponseHistogram.observe(durationSeconds);
  }
}

function updateMobileMetrics({ activeConnections = 0, quality = 100, usageMb = 0, country = 'PH', network = '4G' } = {}) {
  mobileActiveConnectionsGauge.set({ country, network }, activeConnections);
  mobileConnectivityQualityGauge.set({ country, network }, quality);
  mobileDataUsageGauge.set({ country, network }, usageMb);
}

async function metricsEndpoint(req, res) {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
}

module.exports = {
  registerRequestMetrics,
  metricsEndpoint,
  observeAIResponseTime,
  updateMobileMetrics
};
