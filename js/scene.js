// ============================================================
// ฉากภาพพิกเซล วาดสดบน canvas 320x180 แล้วขยายแบบ pixelated
// drawScene(canvas, spec) — spec: { kind, place, tod, seed, hero, foe, partner }
// ============================================================
const W = 320, H = 180;

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const hash = str => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

const SKY = {
  dawn:  { sky:['#2b2a4c', '#4f3a65', '#8c4f6e', '#d27a6b', '#f2b27a'], far:'#5b4a6e', near:'#3a2f4d', ground:'#3f5a3a', ground2:'#344b31', sun:'#ffd27a', light:0.85 },
  day:   { sky:['#3d7cc9', '#5a98d8', '#79b2e2', '#9cc9ea', '#c3e0f0'], far:'#7d9bb8', near:'#58789a', ground:'#5f9a4a', ground2:'#4f853e', sun:'#fff3c4', light:1 },
  dusk:  { sky:['#1d1b3a', '#3b2a5a', '#7a3a63', '#c4565a', '#f08a4b'], far:'#4a3058', near:'#2c1f3e', ground:'#3b4a30', ground2:'#2f3c27', sun:'#ff9a4a', light:0.75 },
  night: { sky:['#070b1c', '#0c1430', '#132042', '#1a2b52', '#22365e'], far:'#1c2645', near:'#121a33', ground:'#1d2b22', ground2:'#17231b', sun:'#e8ecff', light:0.5 },
  blood: { sky:['#1a0505', '#3a0b0b', '#5e1212', '#8a1d1d', '#b8352a'], far:'#3a1010', near:'#240808', ground:'#3b1a14', ground2:'#2e140f', sun:'#ff5a3a', light:0.6 },
};

// ---------- พื้นฐานการวาด ----------
let X;
const px = (x, y, w, h, c) => { X.fillStyle = c; X.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round((n >> 16) * f)), g = Math.min(255, Math.round((n >> 8 & 255) * f)), b = Math.min(255, Math.round((n & 255) * f));
  return `rgb(${r},${g},${b})`;
}
function sprite(rows, pal, x, y, s = 2, flip = false) {
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    const c = pal[ch]; if (!c) return;
    const ii = flip ? row.length - 1 - i : i;
    px(x + ii * s, y + j * s, s, s, c);
  }));
}
function disc(cx, cy, r, c) { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); px(cx - w, cy + y, w * 2 + 1, 1, c); } }
function glow(cx, cy, r, color, a = 0.35) {
  X.save(); X.globalAlpha = a;
  for (let k = 3; k >= 1; k--) { X.globalAlpha = a / k; disc(cx, cy, Math.round(r * k / 3 + 2), color); }
  X.restore();
}

function skyBands(p) {
  const bands = p.sky, bh = Math.ceil(110 / bands.length);
  bands.forEach((c, i) => {
    px(0, i * bh, W, bh, c);
    // ขอบแบบดิทเทอร์ระหว่างแถบสี
    if (i < bands.length - 1) for (let x = (i % 2); x < W; x += 2) px(x, (i + 1) * bh - 1, 1, 1, bands[i + 1]);
  });
}
function clouds(r, p, n = 4) {
  for (let k = 0; k < n; k++) {
    const x = r() * W, y = 12 + r() * 40, w = 20 + r() * 30;
    X.save(); X.globalAlpha = 0.5 * p.light;
    px(x, y, w, 4, '#ffffff'); px(x + 5, y - 3, w - 12, 3, '#ffffff'); px(x + 3, y + 4, w - 6, 2, '#dfe6f2');
    X.restore();
  }
}
function stars(r, n = 40) { for (let k = 0; k < n; k++) px(r() * W, r() * 70, 1, 1, r() > 0.7 ? '#ffffff' : '#9fb3e6'); }
function mountains(r, color, base, amp, step) {
  let y = base - r() * amp;
  for (let x = 0; x < W; x += step) {
    y = clamp(y + (r() - 0.5) * amp * 0.9, base - amp, base);
    px(x, y, step, H - y, color);
  }
}
function ground(p, y0, c1 = p.ground, c2 = p.ground2) {
  px(0, y0, W, H - y0, c1);
  for (let y = y0 + 3; y < H; y += 4) for (let x = (y % 8); x < W; x += 8) px(x, y, 2, 1, c2);
}

// ---------- ส่วนประกอบฉาก ----------
function tree(x, y, h, c = '#2f5a35', trunk = '#4a3322') {
  px(x - 1, y - h * 0.35, 3, h * 0.35, trunk);
  for (let i = 0; i < 4; i++) { const w = (4 - i) * h * 0.13 + 3; px(x - w / 2, y - h * 0.3 - i * h * 0.17 - h * 0.18, w, h * 0.2, i % 2 ? shade(c, 1.15) : c); }
}
function roundTree(x, y, h, c = '#3f7a3a', trunk = '#4a3322') { px(x - 1, y - h * 0.4, 3, h * 0.4, trunk); disc(x, y - h * 0.62, Math.round(h * 0.33), c); disc(x - 2, y - h * 0.68, Math.round(h * 0.2), shade(c, 1.2)); }
function hut(x, y, w = 34, wall = '#8a6a44', roof = '#b8954f') {
  px(x, y - 16, w, 16, wall);
  px(x + w / 2 - 3, y - 9, 6, 9, '#3a2a1a');
  px(x + 4, y - 13, 5, 4, '#f5c96a');
  for (let i = 0; i < 9; i++) px(x - 4 + i, y - 16 - i * 1.4, w + 8 - i * 2, 2, i % 2 ? roof : shade(roof, 0.85));
}
function pagoda(x, y, floors = 3, wall = '#b23a2e', roof = '#2d3a46') {
  let w = 26 + floors * 6, yy = y;
  for (let f = 0; f < floors; f++) {
    px(x - w / 2 + 4, yy - 12, w - 8, 12, wall);
    px(x - 2, yy - 8, 4, 8, '#3a1a12');
    px(x - w / 2 - 2, yy - 15, w + 4, 3, roof);
    px(x - w / 2 - 4, yy - 16, 3, 2, roof); px(x + w / 2 + 1, yy - 16, 3, 2, roof); // ชายคางอน
    px(x - w / 2 + 2, yy - 18, w - 4, 3, shade(roof, 1.2));
    yy -= 18; w -= 6;
  }
  px(x - 1, yy - 6, 2, 6, '#e3b45c');
}
function cityWall(y, c = '#6b6258') {
  px(0, y - 22, W, 22, c);
  for (let x = 0; x < W; x += 10) px(x, y - 26, 6, 4, c);
  for (let x = 4; x < W; x += 20) px(x, y - 16, 2, 4, '#2a241e');
  px(W / 2 - 14, y - 20, 28, 20, '#2a201a');
  disc(W / 2, y - 20, 14, '#2a201a');
}
function lantern(x, y) { px(x, y - 6, 1, 6, '#2a1a10'); px(x - 2, y, 5, 6, '#e0402f'); px(x - 1, y + 1, 3, 4, '#ffb36a'); glow(x, y + 3, 4, '#ff8a3a', 0.25); }
function fence(y, x0 = 0, x1 = W, c = '#6a4d30') { px(x0, y - 6, x1 - x0, 1, c); px(x0, y - 3, x1 - x0, 1, c); for (let x = x0; x < x1; x += 7) px(x, y - 8, 2, 8, c); }
function gate(x, y, c = '#b23a2e', plaque = 'สถาบัน') {
  px(x - 30, y - 34, 4, 34, c); px(x + 26, y - 34, 4, 34, c);
  px(x - 38, y - 40, 76, 5, '#2d3a46'); px(x - 34, y - 44, 68, 4, shade('#2d3a46', 1.25));
  px(x - 14, y - 34, 28, 8, '#1a1a1a'); px(x - 12, y - 32, 24, 4, '#e3b45c');
}
function temple(x, y) {
  px(x - 34, y - 40, 68, 40, '#e9e4d8'); px(x - 34, y - 42, 68, 3, '#d4b25a');
  for (let i = -26; i <= 26; i += 13) px(x + i - 2, y - 38, 4, 38, '#cfc8b8');
  px(x - 8, y - 20, 16, 20, '#7a5a2a');
  for (let i = 0; i < 18; i++) px(x - 12 + i * 0.66, y - 42 - i * 2.4, 24 - i * 1.33, 3, i % 2 ? '#f2eee4' : '#e0dacb');
  px(x - 1, y - 92, 2, 10, '#ffd98a'); glow(x, y - 92, 5, '#ffd98a', 0.4);
}
function arenaStands(y) {
  for (let i = 0; i < 5; i++) { px(0, y - 70 + i * 10, W, 10, i % 2 ? '#5a4a3a' : '#4b3d30'); }
  const r = rng(99);
  for (let i = 0; i < 260; i++) px(r() * W, y - 68 + Math.floor(r() * 5) * 10 + 2, 2, 3, ['#d8a', '#ad8', '#8ad', '#dc8', '#eee'][Math.floor(r() * 5)]);
  px(0, y - 20, W, 3, '#8a6a44');
}
function waves(y, c = '#2a6fa8') { px(0, y, W, H - y, c); for (let yy = y + 2; yy < H; yy += 5) for (let x = (yy * 3) % 12; x < W; x += 12) px(x, yy, 6, 1, '#7fc0ea'); }
function fireBits(r, n, y0) { for (let i = 0; i < n; i++) { const x = r() * W, y = y0 - r() * 70; px(x, y, 1 + (r() > 0.6), 1 + (r() > 0.6), r() > 0.5 ? '#ffb347' : '#ff5a2a'); } }
function snow(r, n) { for (let i = 0; i < n; i++) px(r() * W, r() * H, 1, 1, '#ffffff'); }
function tomb(x, y) { px(x - 10, y - 24, 20, 24, '#7d776f'); disc(x, y - 24, 10, '#7d776f'); px(x - 6, y - 26, 12, 2, '#5d5850'); px(x - 4, y - 20, 8, 1, '#5d5850'); px(x - 4, y - 16, 8, 1, '#5d5850'); px(x - 16, y - 2, 32, 4, '#4a3a2a'); }
function crystalBall(x, y, t) { px(x - 6, y - 8, 12, 8, '#5a3a24'); px(x - 8, y, 16, 3, '#3a261a'); glow(x, y - 16, 14, '#8fd8ff', 0.5); disc(x, y - 16, 8, '#bfe9ff'); disc(x - 2, y - 18, 3, '#ffffff'); }
function tent(x, y, c = '#c9b48a') { for (let i = 0; i < 14; i++) px(x - i, y - 14 + i, i * 2, 1, i % 3 ? c : shade(c, 0.8)); px(x - 2, y - 6, 4, 6, '#3a2a1a'); }
function flag(x, y, c = '#c8372d') { px(x, y - 30, 1, 30, '#3a2a1a'); px(x + 1, y - 30, 12, 7, c); px(x + 4, y - 28, 4, 3, '#ffd98a'); }

// ---------- ตัวละคร ----------
const ADULT = ['..hhh..', '.hhhhh.', '.hsssh.', '..sss..', '...s...', '.ccccc.', 'ccacacc', 's.ccc.s', 's.ccc.s', '..ccc..', '..c.c..', '..p.p..', '..p.p..', '.bb.bb.'];
const ADULT_F = ['..hhh..', '.hhhhh.', 'hhsssh.', 'h.sss.h', 'h..s..h', '.ccccc.', 'ccacacc', 's.ccc.s', 's.ccc.s', '.ccccc.', 'ccccccc', '..p.p..', '..p.p..', '.bb.bb.'];
const CHILD = ['..hhh..', '.hhhhh.', '.hsssh.', '..sss..', '.ccccc.', 's.ccc.s', '..ccc..', '..p.p..', '.bb.bb.'];
const ELDER = ['..www..', '.wwwww.', '.wsssw.', '..sws..', '..www..', '.ccccc.', 'ccacacc', 's.ccc.s', 's.ccc.s', '..ccc..', '..c.c..', '..p.p..', '..p.p..', '.bb.bb.'];
const BEAST = ['..........bb..', '.........bbbb.', 'b........bbeb.', '.bbbbbbbbbbbbb', '.bbbbbbbbbbbb.', '.bbbbbbbbbbb..', '.b.b.....b.b..', '.b.b.....b.b..'];

function person(x, feetY, o) {
  const rows = o.age < 12 ? CHILD : o.age >= 60 ? ELDER : (o.gender === 'F' ? ADULT_F : ADULT);
  const s = o.scale || 3, h = rows.length * s, w = 7 * s;
  const pal = { h: o.hair || '#1a1410', s: o.skin || '#e8c39e', c: o.cloth || '#3a5f9a', a: o.accent || '#e3b45c', p: o.pants || '#2a2a33', b: '#1a1210', w: '#e8e4dc' };
  const cx = x + w / 2;
  const rings = o.rings || [];
  const rx = Math.round(4.5 * s + 4), ry = s + 1;
  const ringY = i => feetY - 3 - i * Math.max(2, Math.floor((h - 4) / Math.max(rings.length, 1)));
  if (o.aura) glow(cx, feetY - h / 2, h * 0.75, o.aura, 0.28);
  // ครึ่งหลังของวงแหวน
  rings.forEach((c, i) => ellipseHalf(cx, ringY(i), rx, ry, c, true));
  if (o.shadow !== false) { X.save(); X.globalAlpha = 0.35; px(cx - 4 * s, feetY - 1, 8 * s, 2, '#000'); X.restore(); }
  sprite(rows, pal, x, feetY - h, s, o.flip);
  rings.forEach((c, i) => ellipseHalf(cx, ringY(i), rx, ry, c, false));
  return { cx, top: feetY - h };
}
function ellipseHalf(cx, cy, rx, ry, color, back) {
  X.save(); X.globalAlpha = back ? 0.55 : 0.95;
  for (let a = 0; a < Math.PI * 2; a += 0.06) {
    const s = Math.sin(a);
    if (back ? s > 0 : s <= 0) continue;
    px(cx + Math.cos(a) * rx, cy - s * ry, 2, 1, color);
  }
  X.restore();
}

// ---------- ฉากหลัก ----------
function drawScene(canvas, spec) {
  X = canvas.getContext('2d');
  X.imageSmoothingEnabled = false;
  const r = rng(spec.seed || 1);
  const kind = spec.kind;
  const p = SKY[kind === 'killing' ? 'blood' : spec.tod || 'day'];
  const snowy = spec.place === 'north';
  if (kind === 'awaken') return drawAwaken(spec, r);

  skyBands(p);
  if (spec.tod === 'night' || kind === 'night') stars(r, 50);
  disc(spec.tod === 'dawn' ? 70 : spec.tod === 'dusk' ? 250 : 240, spec.tod === 'day' ? 26 : 60, spec.tod === 'night' ? 9 : 14, p.sun);
  if (spec.tod !== 'night') glow(spec.tod === 'dawn' ? 70 : spec.tod === 'dusk' ? 250 : 240, spec.tod === 'day' ? 26 : 60, 18, p.sun, 0.25);
  clouds(r, p, 3);
  mountains(rng(hash(spec.place) + 1), snowy ? '#c9d3e0' : p.far, 92, 30, 6);
  mountains(rng(hash(spec.place) + 2), snowy ? '#9aa8bb' : p.near, 112, 22, 4);
  const gy = 140;
  if (spec.place === 'fishing' || kind === 'sea') { ground(p, gy - 20, '#c9b07a', '#b39a66'); waves(gy - 6); }
  else if (snowy) ground(p, gy - 20, '#e8eef5', '#cfd9e6');
  else if (kind === 'arena') ground(p, gy - 20, '#c9a46a', '#b08c58');
  else if (kind === 'killing') ground(p, gy - 20, '#3b1a14', '#2a120e');
  else ground(p, gy - 20);

  const L = p.light;
  switch (kind) {
    case 'home': case 'village':
      roundTree(24, gy - 18, 40); hut(150, gy - 20); hut(220, gy - 24, 28); fence(gy - 4, 40, 140); roundTree(300, gy - 20, 34, '#356b32'); tree(270, gy - 22, 30);
      break;
    case 'city': case 'temple':
      cityWall(gy - 20, shade('#6b6258', L)); pagoda(70, gy - 42, 3); pagoda(260, gy - 42, 2, '#9a3a2e');
      if (kind === 'temple') temple(160, gy - 20);
      lantern(110, gy - 52); lantern(212, gy - 52);
      break;
    case 'academy':
      roundTree(30, gy - 20, 44, '#4b8a3e'); pagoda(250, gy - 22, 2, '#7a4a2a'); gate(140, gy - 18);
      break;
    case 'forge':
      hut(190, gy - 20, 60, '#5a4a3a', '#3a3a3a'); px(70, gy - 30, 18, 10, '#2f2f35'); px(66, gy - 34, 26, 5, '#45454d');
      glow(230, gy - 30, 14, '#ff8a3a', 0.45); fireBits(r, 20, gy - 20);
      break;
    case 'forest': case 'hunt':
      for (let i = 0; i < 26; i++) tree(r() * W, gy - 16 + r() * 18, 30 + r() * 40, i % 2 ? '#1f4a2c' : '#2a5c34');
      X.save(); X.globalAlpha = 0.25; px(0, 0, W, H, '#0a2a14'); X.restore();
      break;
    case 'raid':
      hut(60, gy - 20); hut(200, gy - 22, 30, '#5a3a24', '#3a2a1a');
      glow(80, gy - 40, 30, '#ff5a1a', 0.5); glow(215, gy - 40, 26, '#ff5a1a', 0.5); fireBits(r, 80, gy - 10);
      X.save(); X.globalAlpha = 0.25; px(0, 0, W, H, '#ff3a00'); X.restore();
      break;
    case 'road':
      for (let i = 0; i < 40; i++) { const t = i / 40; px(160 - 20 - t * 70, gy - 20 + t * 40, 40 + t * 140, 1, '#9a8060'); }
      for (let i = 0; i < 8; i++) px(r() * W, gy - 10 + r() * 30, 4 + r() * 6, 3, '#6a6058');
      tree(30, gy - 18, 44); tree(290, gy - 16, 50);
      break;
    case 'night':
      X.save(); X.globalAlpha = 0.35; px(0, 0, W, H, '#000818'); X.restore();
      hut(40, gy - 20, 50, '#2a2630', '#1a1820'); px(60, gy - 32, 6, 5, '#f5c96a'); pagoda(250, gy - 22, 2, '#3a2228', '#1a1a22');
      break;
    case 'war':
      for (let i = 0; i < 5; i++) tent(30 + i * 60, gy - 18 + (i % 2) * 6);
      flag(120, gy - 20); flag(220, gy - 22, '#2d5aa8');
      for (let i = 0; i < 40; i++) person(r() * W, gy + 10 + r() * 20, { age: 30, scale: 1, cloth: r() > 0.5 ? '#6a2a2a' : '#2a3a6a', shadow: false });
      break;
    case 'garden': case 'wedding':
      roundTree(60, gy - 18, 60, '#e88fb0'); roundTree(270, gy - 20, 50, '#f2a6c2');
      for (let i = 0; i < 40; i++) px(r() * W, r() * gy, 2, 1, '#ffc6da');
      if (kind === 'wedding') { lantern(120, 40); lantern(200, 40); px(150, 30, 20, 20, '#c8372d'); X.fillStyle = '#ffd98a'; X.font = '16px serif'; X.fillText('囍', 152, 46); }
      break;
    case 'arena':
      arenaStands(gy - 20);
      break;
    case 'killing':
      for (let i = 0; i < 6; i++) pagoda(20 + i * 55, gy - 20, 1 + (i % 3), '#2a0e0e', '#120606');
      fireBits(r, 30, gy - 20);
      break;
    case 'sea':
      glow(160, 60, 30, '#7fe0ff', 0.5); px(158, 40, 4, 50, '#ffd98a'); px(150, 40, 20, 3, '#ffd98a'); px(150, 34, 3, 8, '#ffd98a'); px(158, 32, 4, 8, '#ffd98a'); px(167, 34, 3, 8, '#ffd98a');
      break;
    case 'grave':
      tomb(160, gy); roundTree(260, gy - 16, 50, '#3a4a32');
      for (let i = 0; i < 12; i++) px(130 + r() * 60, gy - 2 + r() * 6, 2, 2, ['#e8e4dc', '#e88fb0', '#ffd98a'][i % 3]);
      break;
  }
  if (snowy) snow(r, 90);

  // ตัวละคร
  const feet = gy + 14;
  if (kind === 'grave') { vignette(); return; }
  const hero = spec.hero;
  if (kind === 'hunt') {
    person(110, feet, hero);
    sprite(BEAST, { b: spec.beastColor || '#2a2a2a', e: '#ff4a3a' }, 180, feet - 32, 4, true);
    glow(190, feet - 22, 8, '#ff3a2a', 0.35);
  } else if (spec.foe) {
    person(110, feet, hero);
    person(190, feet, { ...spec.foe, flip: true });
    for (let i = 0; i < 6; i++) px(150 + r() * 30, feet - 30 + r() * 20, 2, 2, '#fff2a0');
  } else if (spec.partner) {
    person(130, feet, hero);
    person(164, feet, { ...spec.partner, flip: true });
  } else if (spec.family) {
    person(150, feet, hero);
    person(112, feet, { age: 35, gender: 'M', cloth: '#5a4a3a' });
    person(186, feet, { age: 33, gender: 'F', cloth: '#8a4a5a', flip: true });
  } else person(150, feet, hero);
  vignette();
}

function drawAwaken(spec, r) {
  px(0, 0, W, H, '#1a1420');
  for (let i = 0; i < 6; i++) px(20 + i * 50, 20, 8, 110, '#2a2030');
  px(0, 130, W, 50, '#2e2418');
  for (let x = 0; x < W; x += 16) px(x, 130, 1, 50, '#241c12');
  crystalBall(160, 110, 0);
  for (let i = 0; i < 4; i++) person(20 + i * 26, 166, { age: 6, cloth: ['#5a7a5a', '#7a5a4a', '#4a5a7a', '#7a6a4a'][i] });
  person(222, 166, { age: 45, gender: 'M', cloth: '#e9e4d8', accent: '#d4b25a', flip: true });
  person(140, 168, spec.hero);
  for (let i = 0; i < 30; i++) px(120 + r() * 80, 60 + r() * 70, 1, 1, '#bfe9ff');
  vignette();
}

// ภาพตัวละครเดี่ยว (บัตรประจำตัว / แผงวิญญาณยุทธ์)
function drawFigure(canvas, hero, bg = '#0a1020', scale = 2) {
  X = canvas.getContext('2d');
  X.imageSmoothingEnabled = false;
  const w = canvas.width, h = canvas.height;
  px(0, 0, w, h, bg);
  for (let y = 0; y < h; y += 4) px(0, y, w, 1, shade(bg, 1.15));
  person(Math.round(w / 2 - 3.5 * scale), h - 4, { ...hero, scale, shadow: true });
}

function vignette() {
  X.save();
  const g = X.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.45)');
  X.fillStyle = g; X.fillRect(0, 0, W, H);
  X.restore();
}
