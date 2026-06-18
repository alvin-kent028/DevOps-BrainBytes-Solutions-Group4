const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const port = process.env.PORT || 8081;
const base = __dirname;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json'
};

// Simple proxy to backend running on localhost:3000 for any /api/* requests.
function proxyToBackend(req, res) {
  const targetHost = 'localhost';
  const targetPort = 3000;
  const parsed = url.parse(req.url);

  const options = {
    hostname: targetHost,
    port: targetPort,
    path: parsed.path,
    method: req.method,
    headers: Object.assign({}, req.headers)
  };

  // Remove hop-by-hop headers that may cause problems
  delete options.headers['accept-encoding'];
  delete options.headers['content-length'];

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.statusCode = 502;
    res.end('Bad Gateway: ' + err.message);
  });

  // Pipe request body
  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  // Proxy API routes
  if (req.url.startsWith('/api/')) {
    return proxyToBackend(req, res);
  }

  // Serve static files for everything else
  let file = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
  // Prevent directory traversal
  if (file.includes('..')) { res.statusCode = 400; res.end('Bad request'); return; }
  const filePath = path.join(base, file);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.end(data);
  });
});

server.listen(port, () => console.log(`Test UI server running on http://localhost:${port}`));
