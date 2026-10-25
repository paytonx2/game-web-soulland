// เซิร์ฟเวอร์ไฟล์ static + นับคนออนไลน์แบบเรียลไทม์ (ไม่มี dependency) — รัน: node server.js แล้วเปิด http://localhost:5173
// /presence      : Server-Sent Events — เปิดค้างไว้ = ออนไลน์ เซิร์ฟเวอร์ส่งจำนวนล่าสุดทุกครั้งที่มีคนเข้า/ออก/เปลี่ยนสถานะ
// /presence/state: POST ?id=&state=landing|playing — แจ้งว่ากำลังอยู่หน้าแรกหรือกำลังเล่น
// นับตาม id ของเบราว์เซอร์ (หลายแท็บของคนเดียวกันนับเป็นหนึ่ง)
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, PORT = process.env.PORT || 5173;
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.webp':'image/webp', '.jpg':'image/jpeg' };

const conns = new Set(); // { res, id, state }
const cleanId = s => String(s || '').replace(/[^a-z0-9]/gi, '').slice(0, 32) || 'anon' + Math.random().toString(36).slice(2, 8);
const cleanState = s => (s === 'playing' ? 'playing' : 'landing');
function counts() {
  const byId = new Map();
  for (const c of conns) if (byId.get(c.id) !== 'playing') byId.set(c.id, c.state);
  let playing = 0; for (const st of byId.values()) if (st === 'playing') playing++;
  return { online: byId.size, playing };
}
let pending = null;
function broadcast() { // รวมการแจ้งเตือนที่เกิดถี่ ๆ ให้เป็นครั้งเดียว
  if (pending) return;
  pending = setTimeout(() => {
    pending = null;
    const msg = `data: ${JSON.stringify(counts())}\n\n`;
    for (const c of conns) c.res.write(msg);
  }, 150);
}
setInterval(() => { for (const c of conns) c.res.write(': ping\n\n'); }, 25000); // กันพร็อกซีตัดการเชื่อมต่อ

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/presence' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    res.write('retry: 5000\n\n');
    const c = { res, id: cleanId(url.searchParams.get('id')), state: cleanState(url.searchParams.get('state')) };
    conns.add(c); broadcast();
    req.on('close', () => { conns.delete(c); broadcast(); });
    return;
  }
  if (url.pathname === '/presence/state' && req.method === 'POST') {
    const id = cleanId(url.searchParams.get('id')), st = cleanState(url.searchParams.get('state'));
    for (const c of conns) if (c.id === id) c.state = st;
    broadcast();
    res.writeHead(204); return res.end();
  }
  let p = decodeURIComponent(url.pathname);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Douluo Life running at http://localhost:${PORT}`));
