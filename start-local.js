const { spawn } = require('child_process');
const net = require('net');

function startProcess(name, command, args, opts = {}) {
  const p = spawn(command, args, Object.assign({ shell: false }, opts));
  p.stdout.on('data', d => process.stdout.write(`[${name}] ${d}`));
  p.stderr.on('data', d => process.stderr.write(`[${name}] ${d}`));
  p.on('exit', (code) => console.log(`[${name}] exited with ${code}`));
  return p;
}

console.log('Starting backend, then test UI when ready...');

let backendProc = null;
let uiProc = null;

function shutdown(code = 0) {
  console.log('Shutting down processes...');
  if (uiProc && !uiProc.killed) uiProc.kill();
  if (backendProc && !backendProc.killed) backendProc.kill();
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

// Start backend and wait for ready message
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port);
  });
}

async function findAvailablePort(start = 8081, max = 8100) {
  for (let p = start; p <= max; p++) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortAvailable(p)) return p;
  }
  throw new Error('No available ports');
}

async function launch() {
  // Start backend only if 3000 is free; otherwise assume backend already running
  const backendPort = 3000;
  const backendAvailable = await isPortAvailable(backendPort);
  if (backendAvailable) {
    backendProc = startProcess('backend', 'node', ['backend/server.js']);
    // wait for ready or timeout
    const readyRegex = /Server running on port\s*(\d+)/i;
    let ready = false;
    const readyPromise = new Promise((resolve) => {
      const onData = (d) => {
        const s = d.toString();
        if (readyRegex.test(s)) { ready = true; backendProc.stdout.removeListener('data', onData); resolve(true); }
      };
      backendProc.stdout.on('data', onData);
      setTimeout(() => resolve(false), 10000);
    });
    await readyPromise;
    if (!ready) console.warn('[start-local] backend did not report ready in time');
  } else {
    console.log('[start-local] port 3000 in use — assuming backend already running');
  }

  // Start UI on first available port
  const uiPort = await findAvailablePort(8081, 8200);
  const env = Object.assign({}, process.env, { PORT: String(uiPort) });
  uiProc = startProcess('test-ui', process.execPath, ['test-ui/server.js'], { env });
  console.log(`[start-local] Test UI should be available at http://localhost:${uiPort}`);
  if (backendAvailable) console.log('[start-local] Backend started on port 3000');
}

launch().catch(err => {
  console.error('[start-local] failed to launch:', err);
  shutdown(1);
});
