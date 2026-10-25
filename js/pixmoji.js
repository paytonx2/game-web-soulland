// ============================================================
// อีโมจิแบบพิกเซล (8-BIT / 16-BIT / 32-BIT)
// แปลงอีโมจิทุกตัวบนหน้าเว็บเป็นภาพพิกเซล: วาดอีโมจิลงแคนวาสขนาดเล็ก → ตัดขอบโปร่งใสให้คม → ลดจำนวนสี → ใส่เส้นขอบเข้ม
// แล้วแสดงแบบขยายไม่เบลอ (image-rendering: pixelated) · ประมวลผลเนื้อหาใหม่อัตโนมัติด้วย MutationObserver
// ============================================================
const PIXMOJI = (() => {
  const RE = /(?:\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]{2})(?:️|⃣|[\u{1F3FB}-\u{1F3FF}]|‍\p{Extended_Pictographic}️?)*/gu;
  const MODES = {
    8: { px: 11, levels: 4, outline: true, th: '8-BIT' },   // 64 สี ความละเอียดต่ำสุด
    16: { px: 16, levels: 6, outline: true, th: '16-BIT' }, // 216 สี
    32: { px: 24, levels: 0, outline: false, th: '32-BIT' },// สีเต็ม ความละเอียดสูงขึ้น
  };
  const KEY = 'douluo_pixmoji_mode';
  let mode = 16;
  try { mode = +localStorage.getItem(KEY) || 16; } catch (e) {}
  if (!MODES[mode]) mode = 16;
  const cache = new Map();
  const FONT = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';

  function sprite(e) {
    const k = mode + e;
    if (cache.has(k)) return cache.get(k);
    const M = MODES[mode], n = M.px, W = n + 2;
    const cv = document.createElement('canvas'); cv.width = cv.height = W;
    const x = cv.getContext('2d', { willReadFrequently: true });
    x.font = `${Math.round(n * 0.86)}px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(e, W / 2, W / 2 + n * 0.06);
    const img = x.getImageData(0, 0, W, W), d = img.data;
    let any = false;
    const q = v => M.levels ? Math.round(v / 255 * (M.levels - 1)) * (255 / (M.levels - 1)) : v;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 110) { d[i + 3] = 0; continue; }
      any = true; const a = d[i + 3] / 255; // ลบการผสมกับพื้นหลัง แล้วทำให้ทึบ
      d[i] = q(Math.min(255, d[i] / a)); d[i + 1] = q(Math.min(255, d[i + 1] / a)); d[i + 2] = q(Math.min(255, d[i + 2] / a)); d[i + 3] = 255;
    }
    if (!any) { cache.set(k, null); return null; } // เบราว์เซอร์วาดอีโมจินี้ไม่ได้ → ใช้ตัวอักษรเดิม
    if (M.outline) {
      const solid = i => d[i * 4 + 3] === 255;
      const edge = [];
      for (let y = 0; y < W; y++) for (let xx = 0; xx < W; xx++) {
        const i = y * W + xx; if (d[i * 4 + 3]) continue;
        if ((xx > 0 && solid(i - 1)) || (xx < W - 1 && solid(i + 1)) || (y > 0 && solid(i - W)) || (y < W - 1 && solid(i + W))) edge.push(i);
      }
      for (const i of edge) { d[i * 4] = 26; d[i * 4 + 1] = 20; d[i * 4 + 2] = 16; d[i * 4 + 3] = 255; }
    }
    x.putImageData(img, 0, 0);
    const url = cv.toDataURL();
    cache.set(k, url);
    return url;
  }

  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'TITLE', 'CANVAS', 'SVG']);
  function convertText(node) {
    const t = node.nodeValue;
    RE.lastIndex = 0;
    if (!RE.test(t)) return;
    RE.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0, m, changed = false;
    while ((m = RE.exec(t))) {
      const url = sprite(m[0]);
      if (!url) continue;
      if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
      const im = document.createElement('img');
      im.className = 'pxe'; im.src = url; im.alt = m[0]; im.draggable = false;
      frag.appendChild(im);
      last = m.index + m[0].length; changed = true;
    }
    if (!changed) return;
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  function scan(root) {
    if (root.nodeType === 3) { if (root.parentNode && !SKIP.has(root.parentNode.nodeName.toUpperCase()) && !root.parentNode.closest('.no-pix')) convertText(root); return; }
    if (root.nodeType !== 1 || SKIP.has(root.nodeName.toUpperCase()) || root.closest('.no-pix')) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => SKIP.has(n.parentNode.nodeName.toUpperCase()) || n.parentNode.closest('.no-pix') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const list = []; while (w.nextNode()) list.push(w.currentNode);
    list.forEach(convertText);
  }
  // รวมการเปลี่ยนแปลงในเฟรมเดียวกันแล้วค่อยประมวลผล
  let queue = new Set(), scheduled = false;
  const flush = () => { scheduled = false; const q = queue; queue = new Set(); for (const n of q) if (n.isConnected) scan(n); };
  const obs = new MutationObserver(ms => {
    for (const m of ms) {
      if (m.type === 'characterData') queue.add(m.target);
      else m.addedNodes.forEach(n => { if (!(n.nodeType === 1 && n.classList.contains('pxe'))) queue.add(n); });
    }
    if (!scheduled && queue.size) { scheduled = true; requestAnimationFrame(flush); }
  });
  function start() { scan(document.body); obs.observe(document.body, { childList: true, subtree: true, characterData: true }); }
  function setMode(m) {
    if (!MODES[m]) return;
    mode = m; try { localStorage.setItem(KEY, m); } catch (e) {}
    document.querySelectorAll('img.pxe').forEach(im => { const u = sprite(im.alt); if (u) im.src = u; });
    document.documentElement.dataset.bit = m;
  }
  const next = () => setMode(mode === 8 ? 16 : mode === 16 ? 32 : 8);
  document.documentElement.dataset.bit = mode;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  return { setMode, next, get mode() { return mode; }, label: () => MODES[mode].th };
})();
