const fetch = require('node-fetch');
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

async function sendMessage(text, sessionId = 'demo-session', channel = 'web') {
  const response = await fetch(`${baseUrl}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sessionId, channel })
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
      const result = await sendMessage(step.text, step.sessionId, step.channel);
      console.log(`  message -> ${step.sessionId} -> ${JSON.stringify(result).slice(0, 120)}`);
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
    { type: 'message', text: 'What is the capital of the Philippines?', sessionId: 'normal-1', channel: 'web', delay: 300 },
    { type: 'message', text: 'Explain the concept of photosynthesis.', sessionId: 'normal-1', channel: 'web', delay: 700 },
    { type: 'message', text: 'How can I improve my study routine?', sessionId: 'normal-2', channel: 'mobile', delay: 600 },
    { type: 'mobileMetrics', metrics: { activeConnections: 35, quality: 84, usageMb: 140, country: 'PH', network: '4G' }, delay: 500 }
  ],
  peakHours: [
    ...Array.from({ length: 40 }, (_, i) => ({
      type: 'message',
      text: `Peak hour message ${i + 1}`,
      sessionId: `peak-${Math.floor(i / 5) + 1}`,
      channel: i % 2 === 0 ? 'web' : 'mobile',
      delay: 100
    })),
    { type: 'mobileMetrics', metrics: { activeConnections: 420, quality: 78, usageMb: 1900, country: 'PH', network: '4G' }, delay: 200 }
  ],
  errorSpike: [
    { type: 'message', text: '', sessionId: 'error-1', channel: 'web', delay: 100 },
    { type: 'message', text: 'A'.repeat(2000), sessionId: 'error-1', channel: 'web', delay: 100 },
    { type: 'message', text: 'Generate a very large response for testing.', sessionId: 'error-2', channel: 'mobile', delay: 100 },
    { type: 'mobileMetrics', metrics: { activeConnections: 85, quality: 55, usageMb: 420, country: 'PH', network: '3G' }, delay: 500 }
  ],
  resourceConstraint: [
    { type: 'message', text: 'Simulate slow mobile response.', sessionId: 'resource-1', channel: 'mobile', delay: 1200 },
    { type: 'message', text: 'Run a long conversation session.', sessionId: 'resource-1', channel: 'mobile', delay: 1500 },
    { type: 'mobileMetrics', metrics: { activeConnections: 95, quality: 48, usageMb: 680, country: 'PH', network: '3G' }, delay: 500 }
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
