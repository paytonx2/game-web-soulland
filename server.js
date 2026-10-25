// เซิร์ฟเวอร์ไฟล์ static แบบไม่มี dependency (ใช้ทดสอบในเครื่อง) — รัน: node server.js แล้วเปิด http://localhost:5173
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, PORT = process.env.PORT || 5173;
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.webp':'image/webp', '.jpg':'image/jpeg' };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Douluo Life running at http://localhost:${PORT}`));
