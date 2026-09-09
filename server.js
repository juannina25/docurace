const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'docurace.json');
const ALLOWED_FILES = new Set(['index.html', 'admin.html', 'admin.js', 'database.js', 'script.js', 'styles.css']);

function emptyData() {
  return { players: {}, scores: {} };
}

function readData() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return {
      players: data.players && typeof data.players === 'object' ? data.players : {},
      scores: data.scores && typeof data.scores === 'object' ? data.scores : {}
    };
  } catch {
    return emptyData();
  }
}

function writeData(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temporaryFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(temporaryFile, DATA_FILE);
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

function serveStatic(request, response) {
  const requested = request.url === '/' ? 'index.html' : decodeURIComponent(request.url.slice(1).split('?')[0]);
  if (!ALLOWED_FILES.has(requested)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  const filePath = path.join(ROOT, requested);
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8'
  };
  response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
}

function handleData(request, response) {
  if (request.method === 'GET') {
    sendJson(response, 200, readData());
    return;
  }
  if (request.method !== 'PUT') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  let body = '';
  request.on('data', chunk => {
    body += chunk;
    if (body.length > 2 * 1024 * 1024) request.destroy();
  });
  request.on('end', () => {
    try {
      const incoming = JSON.parse(body);
      if (!incoming || typeof incoming !== 'object' || typeof incoming.players !== 'object' || typeof incoming.scores !== 'object') {
        sendJson(response, 400, { error: 'Invalid data format' });
        return;
      }
      writeData({ players: incoming.players, scores: incoming.scores });
      sendJson(response, 200, { ok: true });
    } catch {
      sendJson(response, 400, { error: 'Invalid JSON' });
    }
  });
}

const server = http.createServer((request, response) => {
  if (request.url.split('?')[0] === '/api/data') {
    handleData(request, response);
    return;
  }
  serveStatic(request, response);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`DocuRace disponible en http://localhost:${PORT}`);
});
