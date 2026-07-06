const fetch = require('node-fetch');
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

async function sendMessage(text, sessionId = 'demo-session') {
  const response = await fetch(`${baseUrl}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sessionId })
  });
  return response.json();
}

async function sendMobileMetrics(metrics) {
  const response = await fetch(`${baseUrl}/internal/mobile-metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics)
  });
  return response.json();
}

async function simulateScenario(name, steps) {
  console.log(`Running scenario: ${name}`);
  for (const step of steps) {
    if (step.type === 'message') {
      const result = await sendMessage(step.text, step.sessionId);
      console.log(`  message -> status: ${JSON.stringify(result).slice(0, 120)}`);
    }
    if (step.type === 'mobileMetrics') {
      const result = await sendMobileMetrics(step.metrics);
      console.log(`  mobileMetrics -> ${JSON.stringify(result)}`);
    }
    if (step.delay) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
    }
  }
}

const scenarios = {
  normal: [
    { type: 'message', text: 'What is the capital of the Philippines?', sessionId: 'normal-1', delay: 500 },
    { type: 'message', text: 'Explain the concept of photosynthesis.', sessionId: 'normal-1', delay: 500 },
    { type: 'mobileMetrics', metrics: { activeConnections: 20, quality: 82, usageMb: 120, country: 'PH', network: '4G' }, delay: 500 }
  ],
  highLoad: [
    ...Array.from({ length: 25 }, (_, i) => ({ type: 'message', text: `High load test message ${i + 1}`, sessionId: 'load-1' })),
    { type: 'mobileMetrics', metrics: { activeConnections: 250, quality: 75, usageMb: 850, country: 'PH', network: '4G' } }
  ],
  errorBurst: [
    { type: 'message', text: '', sessionId: 'error-1' },
    { type: 'message', text: 'A'.repeat(2000), sessionId: 'error-1' },
    { type: 'mobileMetrics', metrics: { activeConnections: 70, quality: 58, usageMb: 340, country: 'PH', network: '3G' } }
  ]
};

async function run() {
  const scenarioName = process.argv[2] || 'normal';
  const scenario = scenarios[scenarioName];
  if (!scenario) {
    console.error('Scenario not found. Use: normal | highLoad | errorBurst');
    process.exit(1);
  }
  await simulateScenario(scenarioName, scenario);
}

run().catch((err) => {
  console.error('Simulator failed:', err.message);
  process.exit(1);
});
