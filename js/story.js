// ============================================================
// สรุปเรื่องราวชีวิตตอนจบเกม + การ์ดภาพสำหรับบันทึก/แชร์
// ============================================================
const stripTags = t => String(t).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// เหตุการณ์ที่ควรเล่าซ้ำในบทสรุป
const STORY_EIDS = ['school6', 'common6', 'grad12', 'common12', 'career', 'tournament', 'godCall', 'retire', 'killingCity', 'marriage', 'succession', 'emperor', 'darkInvite', 'titled'];

function lifeScore(s) {
  const ringPts = s.rings.reduce((a, r) => a + Math.round(Math.log10(r.years) * 40), 0);
  return Math.round(lvl(s) * 20 + ringPts + s.fame + s.bones.length * 120 + (s.title ? 500 : 0) + (s.ascended ? 3000 : 0) + s.age * 5 + s.children * 30 + Math.min(500, s.money / 10));
}
function lifeVerdict(s) {
  if (s.ascended) return 'ตำนานผู้ก้าวข้ามความเป็นมนุษย์';
  if (lvl(s) >= 91) return 'พรหมยุทธ์ผู้ถูกจารึกในประวัติศาสตร์';
  if (lvl(s) >= 71) return 'ปราชญ์วิญญาณผู้ยิ่งใหญ่';
  if (lvl(s) >= 51) return 'วิญญาจารย์ผู้มีชื่อเสียง';
  if (s.age < 12) return 'ชีวิตที่สั้นเกินไป';
  if (!isCultivator(s)) return s.age >= 60 ? 'คนธรรมดาที่ใช้ชีวิตจนสุดทาง' : 'คนธรรมดาในโลกของวิญญาจารย์';
  if (s.path === 'evil') return 'ผู้หลงทางในความมืด';
  return 'วิญญาจารย์ธรรมดาคนหนึ่งของทวีป';
}

function lifeStory(s) {
  const fam = familyOf(s), place = placeOf(s), clan = clanOf(s);
  const P = [];
  const he = s.gender === 'M' ? 'เขา' : 'เธอ';
  const wy0 = WORLD_EPOCH + s.birthYear, wy1 = WORLD_EPOCH + worldYear(s);
  const rel = s.birthYear < 0 ? `${-s.birthYear} ปีก่อนถังซานถือกำเนิด` : s.birthYear > 0 ? `${s.birthYear} ปีหลังถังซานถือกำเนิด` : 'ปีเดียวกับที่ถังซานถือกำเนิด';

  // วัยเด็กและกำเนิด
  P.push(`${s.name} (${s.zh}) ถือกำเนิดเป็น${s.gender === 'M' ? 'เด็กชาย' : 'เด็กหญิง'}ใน${clan ? clan.th : 'ครอบครัว' + fam.th}ที่${place.th} ${place.nation} ในปีทวีปที่ ${wy0} — ${rel}`);
  if (s.awakened) {
    const souls = s.souls.map(id => SOUL_BY_ID[id]);
    let t = `เมื่ออายุ 6 ปี ${he}ปลุกวิญญาณยุทธ์${s.souls.length > 1 ? 'คู่' : ''} ${souls.map(x => `${x.th} (${TIER_INFO[x.tier].th})`).join(' และ ')}`;
    t += s.innate ? ` พร้อมพลังวิญญาณแต่กำเนิดระดับ ${s.innate}${s.innate === 10 ? ' ซึ่งเป็นอัจฉริยะหายากที่สุด' : ''}` : ' แต่ไม่มีพลังวิญญาณแม้แต่นิดเดียว จึงต้องใช้ชีวิตแบบคนธรรมดา';
    P.push(t);
  } else P.push(`${he}จากไปก่อนจะได้เข้าพิธีปลุกวิญญาณยุทธ์`);

  // เส้นทางชีวิต
  const hist = (s.pathHist || []).filter(h => h.path !== 'child');
  if (hist.length) P.push(`เส้นทางชีวิตของ${he}: ` + hist.map(h => `อายุ ${h.age} เป็น${PATHS[h.path].th}`).join(' → '));

  // การตัดสินใจครั้งสำคัญ
  const key = (s.picks || []).filter(p => STORY_EIDS.includes(p.eid) || p.eid.startsWith('c_')).slice(0, 8);
  if (key.length) P.push('การตัดสินใจที่เปลี่ยนชีวิต: ' + key.map(p => `อายุ ${p.age} ในเรื่อง「${stripTags(p.q).replace(/^\S+\s/, '')}」${he}เลือก "${stripTags(p.a)}"`).join(' · '));

  // พลังและวงแหวน
  if (isCultivator(s)) {
    let t = `${he}บำเพ็ญจนถึงระดับ ${lvl(s)} ขั้น${rankOf(lvl(s)).th}`;
    if (s.rings.length) {
      const best = s.rings.reduce((a, r) => r.years > a.years ? r : a);
      const tally = RING_TIERS.map((rt, i) => [rt.th, s.rings.filter(r => ringTierOf(r.years) === i).length]).filter(x => x[1]).map(([n, c]) => `${n} ${c}`).join(' ');
      t += ` มีวงแหวนวิญญาณ ${s.rings.length} วง (${tally}) วงที่ทรงพลังที่สุดคือ ${fmt(best.years)} ปีจาก${best.beast || 'สัตว์วิญญาณ'}`;
    }
    if (s.bones.length) t += ` และครอบครอง${s.bones.map(b => BONE_PARTS.find(x => x.id === b.part).th).join(', ')}`;
    P.push(t);
  }
  const extras = [];
  if (s.title) extras.push(`ได้รับฉายา "${s.title}"`);
  if (Object.keys(s.arts || {}).length) extras.push(`เรียนวิชาสำนักถัง ${Object.keys(s.arts).map(k => TANG_ARTS[k].th.split(' (')[0]).join(', ')}`);
  if ((s.weapons || []).length) extras.push(`พกอาวุธลับ ${s.weapons.map(id => HIDDEN_WEAPONS.find(w => w.id === id).th.split(' (')[0]).join(', ')}`);
  if (s.flags.fusion) extras.push(`คิดค้น${s.flags.fusion}`);
  if (s.arenaBadge) extras.push(`ได้${s.arenaBadge}จากสนามประลองซั่วทัว`);
  if (s.flags.killing) extras.push('รอดออกมาจากเมืองสังหาร');
  if (s.flags.iceFire) extras.push('ชำระร่างในตาน้ำหยินหยางน้ำแข็งเพลิง');
  if (s.flags.tangFriend) extras.push('เคยเป็นสหายของถังซาน');
  if (s.mentor) extras.push(`เป็นศิษย์ของ${s.mentor}`);
  if (extras.length) P.push(`ตลอดชีวิต${he}${extras.join(' · ')}`);

  // ครอบครัว
  const fm = [];
  if (s.partner) fm.push(s.flags.married ? `แต่งงานกับ${s.partner}` : `มีคนรักชื่อ${s.partner}`);
  if (s.children) fm.push(`มีบุตร ${s.children} คน`);
  if (s.friend) fm.push(`เพื่อนสนิทคือ${s.friend}`);
  if (s.disabilities.length) fm.push(`ต้องอยู่กับ${s.disabilities.map(d => DISABILITIES[d].th).join(', ')}`);
  const top = topTendency(s);
  if (top) fm.push(`ผู้คนจดจำ${he}ในฐานะ${TENDENCIES[top].th}`);
  if (fm.length) P.push(fm.join(' · '));

  // บทสุดท้าย
  P.push(s.ascended ? `ในปีทวีปที่ ${wy1} ขณะอายุ ${s.age} ปี ${he}${s.cause} — ชื่อของ${he}กลายเป็นตำนานชั่วนิรันดร์`
    : `ในปีทวีปที่ ${wy1} ${he}จากไปเมื่ออายุ ${s.age} ปี — ${s.cause}`);

  // ช่วงเวลาสำคัญ (จากบันทึกสีทอง/ความตาย)
  const hl = [];
  for (const y of s.log) for (const l of y.lines) if (['gold', 'death'].includes(l.c) && hl.length < 9) hl.push({ age: y.age, t: stripTags(l.t) });

  const plain = [`📜 ชีวิตของ${s.name} (${s.zh}) — ${lifeVerdict(s)}`, `อายุ ${s.age} ปี · ปีทวีป ${wy0}–${wy1} · คะแนนชีวิต ${fmt(lifeScore(s))}`, '', ...P, '', '✨ ช่วงเวลาสำคัญ', ...hl.map(h => `• อายุ ${h.age}: ${h.t}`), '', '— เกิดในโลกวิญญาจารย์ (斗罗大陆 · A Douluo Life)'].join('\n');
  return { paragraphs: P, highlights: hl, plain, verdict: lifeVerdict(s), score: lifeScore(s) };
}

// ---------- วาดการ์ดชีวิตเป็นภาพ ----------
const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('th', { granularity: 'word' }) : null;
function wrapLines(ctx, text, maxW) {
  const words = seg ? [...seg.segment(text)].map(x => x.segment) : [...text];
  const lines = []; let cur = '';
  for (const w of words) {
    if (ctx.measureText(cur + w).width > maxW && cur) { lines.push(cur); cur = w.trimStart(); }
    else cur += w;
  }
  if (cur) lines.push(cur);
  return lines;
}
// การ์ดชีวิตสำหรับแชร์ ขนาด 9:16 (1080×1920) — อ่านง่ายบนมือถือ/สตอรี่
let cardBgP = null;
const cardBg = () => cardBgP || (cardBgP = new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = 'assets/bg-ink.webp'; }));
// ตัดบรรทัดตามความกว้าง แล้วจำกัดจำนวนบรรทัด (ใส่ … ท้ายบรรทัดสุดท้าย)
function clampLines(c, text, maxW, n) {
  const ls = wrapLines(c, text, maxW);
  if (ls.length <= n) return ls;
  const out = ls.slice(0, n); let last = out[n - 1];
  while (last && c.measureText(last + '…').width > maxW) last = last.slice(0, -1);
  out[n - 1] = last + '…'; return out;
}
async function lifeCardCanvas(s) {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const st = lifeStory(s), W = 1080, H = 1920, pad = 76, inner = W - pad * 2;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'); c.textBaseline = 'top';
  const GOLD = '#d9b86c', GOLD2 = '#f1e2bc', INK = '#ece6da', MUTED = '#b3ab9d', SEAL = '#b8322a';
  const HEAD = 'Mitr, sans-serif', BODY = 'Sarabun, sans-serif';

  // ---------- พื้นหลัง: ภาพหมึกจีน + ไล่เงาให้อ่านตัวอักษรได้ชัด ----------
  c.fillStyle = '#0b0b0a'; c.fillRect(0, 0, W, H);
  const bg = await cardBg();
  if (bg) { const sc = Math.max(W / bg.width, 760 / bg.height); const bw = bg.width * sc, bh = bg.height * sc; c.globalAlpha = 0.9; c.drawImage(bg, (W - bw) / 2 + 60, -40, bw, bh); c.globalAlpha = 1; }
  let g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(11,11,10,0.25)'); g.addColorStop(0.2, 'rgba(11,11,10,0.55)'); g.addColorStop(0.36, 'rgba(11,11,10,0.94)'); g.addColorStop(1, '#0b0b0a');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // กรอบทองสองชั้น + มุมประดับ
  c.strokeStyle = 'rgba(217,184,108,0.75)'; c.lineWidth = 3; c.strokeRect(28, 28, W - 56, H - 56);
  c.strokeStyle = 'rgba(217,184,108,0.3)'; c.lineWidth = 1.5; c.strokeRect(40, 40, W - 80, H - 80);
  for (const [x, y, sx, sy] of [[28, 28, 1, 1], [W - 28, 28, -1, 1], [28, H - 28, 1, -1], [W - 28, H - 28, -1, -1]]) {
    c.fillStyle = GOLD; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 46 * sx, y); c.lineTo(x + 46 * sx, y + 8 * sy); c.lineTo(x + 8 * sx, y + 8 * sy); c.lineTo(x + 8 * sx, y + 46 * sy); c.lineTo(x, y + 46 * sy); c.closePath(); c.fill();
  }
  // ตราประทับชาด
  c.fillStyle = SEAL; roundRect(c, W - 150, 74, 74, 150, 8); c.fill();
  c.strokeStyle = 'rgba(255,230,210,0.5)'; c.lineWidth = 3; roundRect(c, W - 144, 80, 62, 138, 6); c.stroke();
  c.fillStyle = '#f6e6d8'; c.font = '46px "Ma Shan Zheng", "Noto Serif SC", serif'; c.textAlign = 'center';
  c.fillText('斗', W - 113, 92); c.fillText('罗', W - 113, 152); c.textAlign = 'left';

  // ---------- หัวการ์ด ----------
  let y = 84;
  c.fillStyle = GOLD; c.font = `500 28px ${HEAD}`; c.fillText('เกิดในโลกวิญญาจารย์', pad, y);
  c.fillStyle = MUTED; c.font = `400 22px ${HEAD}`; c.fillText('DOULUO LIFE · บันทึกชีวิตหนึ่งชีวิต', pad, y + 40);

  // ภาพตัวละครพิกเซล
  y = 420;
  const fig = document.createElement('canvas'); fig.width = 30; fig.height = 38;
  drawFigure(fig, { ...heroSpec(s), age: Math.max(s.age, 8) }, '#1a1917', 2);
  c.save(); c.imageSmoothingEnabled = false;
  c.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(c, pad, y - 250, 210, 240, 18); c.fill();
  c.drawImage(fig, pad + 10, y - 246, 190, 232); c.restore();
  c.strokeStyle = GOLD; c.lineWidth = 3; roundRect(c, pad, y - 250, 210, 240, 18); c.stroke();
  // ชื่อ
  const nx = pad + 240;
  c.fillStyle = GOLD2; c.font = `700 70px Charm, ${HEAD}`;
  const nm = clampLines(c, s.name, W - nx - 170, 1)[0]; c.fillText(nm, nx, y - 262);
  c.fillStyle = MUTED; c.font = '600 40px "Noto Serif SC", serif'; c.fillText(s.zh, nx, y - 160);
  c.fillStyle = INK; c.font = `400 28px ${BODY}`;
  c.fillText(`${s.gender === 'M' ? 'ชาย' : 'หญิง'} · อายุ ${s.age} ปี · ปีทวีป ${WORLD_EPOCH + s.birthYear}–${WORLD_EPOCH + worldYear(s)}`, nx, y - 100);
  c.fillStyle = MUTED; c.font = `400 26px ${BODY}`;
  c.fillText(clampLines(c, `${placeOf(s).th} · ${familyOf(s).th}`, W - nx - pad, 1)[0], nx, y - 60);

  // ฉายา / คำตัดสินชีวิต
  y += 20;
  if (s.title) {
    c.font = `600 32px ${HEAD}`; const tw = c.measureText(s.title).width + 48;
    c.fillStyle = SEAL; roundRect(c, pad, y, tw, 58, 10); c.fill();
    c.fillStyle = '#fff3e6'; c.fillText(s.title, pad + 24, y + 10); y += 76;
  }
  c.fillStyle = GOLD; c.font = `600 44px ${HEAD}`;
  for (const l of clampLines(c, st.verdict, inner, 2)) { c.fillText(l, pad, y); y += 60; }

  // จุดจบ
  y += 10;
  c.font = `400 30px ${BODY}`;
  const cause = clampLines(c, s.ascended ? s.cause : `จากไปเพราะ${s.cause.replace(/^เสียชีวิต/, '')}`, inner - 56, 3);
  const ch = 70 + cause.length * 44;
  c.fillStyle = 'rgba(184,50,42,0.16)'; roundRect(c, pad, y, inner, ch, 16); c.fill();
  c.fillStyle = SEAL; roundRect(c, pad, y, 8, ch, 4); c.fill();
  c.fillStyle = '#e8a79c'; c.font = `500 24px ${HEAD}`; c.fillText(s.ascended ? 'จุดจบแห่งตำนาน' : 'จุดจบของชีวิต', pad + 30, y + 18);
  c.fillStyle = INK; c.font = `400 30px ${BODY}`; let cy = y + 56; for (const l of cause) { c.fillText(l, pad + 30, cy); cy += 44; }
  y += ch + 30;

  // ---------- ค่าสำคัญ 3×2 ----------
  const stats = [
    ['ระดับพลังวิญญาณ', isCultivator(s) ? `Lv.${lvl(s)}` : '—', isCultivator(s) ? rankOf(lvl(s)).th : 'ไม่มีพลังวิญญาณ'],
    ['วงแหวนวิญญาณ', `${s.rings.length} วง`, s.rings.length ? `สูงสุด ${fmt(Math.max(...s.rings.map(r => r.years)))} ปี` : 'ยังไม่มีวงแหวน'],
    ['คะแนนชีวิต', fmt(st.score), 'จากความสำเร็จทั้งหมด'],
    ['ชื่อเสียง', fmt(s.fame), s.fame >= 200 ? 'ทั้งทวีปรู้จัก' : s.fame >= 60 ? 'มีชื่อเสียงในแคว้น' : 'คนรู้จักไม่มาก'],
    ['ผ่านศึก', `${s.fights || 0} ครั้ง`, `ชนะ ${s.fightWins || 0} ครั้ง`],
    ['ทรัพย์สิน', fmt(s.money), 'เหรียญทองวิญญาณ'],
  ];
  const gw = (inner - 2 * 18) / 3, gh = 150;
  stats.forEach(([lb, v, sub], i) => {
    const gx = pad + (i % 3) * (gw + 18), gy = y + Math.floor(i / 3) * (gh + 18);
    c.fillStyle = 'rgba(40,38,34,0.92)'; roundRect(c, gx, gy, gw, gh, 16); c.fill();
    c.strokeStyle = 'rgba(217,184,108,0.35)'; c.lineWidth = 2; roundRect(c, gx, gy, gw, gh, 16); c.stroke();
    c.fillStyle = MUTED; c.font = `500 23px ${HEAD}`; c.fillText(lb, gx + 22, gy + 16);
    c.fillStyle = GOLD2; c.font = `600 46px ${HEAD}`; c.fillText(clampLines(c, v, gw - 40, 1)[0], gx + 22, gy + 48);
    c.fillStyle = MUTED; c.font = `400 22px ${BODY}`; c.fillText(clampLines(c, sub, gw - 40, 1)[0], gx + 22, gy + 108);
  });
  y += gh * 2 + 18 + 34;

  // ---------- วิญญาณยุทธ์ & วงแหวน ----------
  c.fillStyle = GOLD; c.font = `500 28px ${HEAD}`; c.fillText('วิญญาณยุทธ์', pad, y); y += 46;
  c.fillStyle = INK; c.font = `600 36px ${HEAD}`;
  const soulTxt = s.awakened ? s.souls.map(id => `${SOUL_BY_ID[id].th} (${TIER_INFO[SOUL_BY_ID[id].tier].th})`).join(' + ') : 'จากไปก่อนพิธีปลุก';
  for (const l of clampLines(c, soulTxt, inner, 2)) { c.fillText(l, pad, y); y += 50; }
  const extra = [s.awakened ? `พลังแต่กำเนิด ${s.innate}` : '', (s.mutations || []).length ? `กลายพันธุ์ ${s.mutations.length} ครั้ง` : '', s.bones.length ? `กระดูกวิญญาณ ${s.bones.length} ชิ้น` : '', s.god ? 'ผู้รับบททดสอบเทพ' : ''].filter(Boolean).join(' · ');
  if (extra) { c.fillStyle = MUTED; c.font = `400 26px ${BODY}`; c.fillText(clampLines(c, extra, inner, 1)[0], pad, y + 2); y += 44; }
  y += 14;
  const rr = 30, step = inner / 9;
  for (let i = 0; i < 9; i++) {
    const cx = pad + step * i + step / 2, r = s.rings[i];
    c.beginPath(); c.arc(cx, y + rr, rr, 0, Math.PI * 2);
    if (r) { const col = RING_TIERS[ringTierOf(r.years)].color; c.lineWidth = 9; c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 14; c.stroke(); c.shadowBlur = 0; }
    else { c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.12)'; c.stroke(); }
  }
  y += rr * 2 + 40;

  // ---------- ช่วงเวลาสำคัญ ----------
  const hl = st.highlights.filter(h => !/^(💰|🗓️)/.test(h.t)).slice(0, 4);
  if (hl.length) {
    c.fillStyle = GOLD; c.font = `500 28px ${HEAD}`; c.fillText('ช่วงเวลาสำคัญ', pad, y); y += 48;
    for (const h of hl) {
      if (y > H - 300) break;
      c.fillStyle = 'rgba(217,184,108,0.2)'; roundRect(c, pad, y, 104, 40, 10); c.fill();
      c.fillStyle = GOLD2; c.font = `500 24px ${HEAD}`; c.textAlign = 'center'; c.fillText(`อายุ ${h.age}`, pad + 52, y + 6); c.textAlign = 'left';
      c.fillStyle = INK; c.font = `400 28px ${BODY}`;
      const t = h.t.replace(/^[^\p{L}\p{N}]+/u, '').replace('ระดับระดับ', 'ระดับ');
      for (const l of clampLines(c, t, inner - 128, 2)) { c.fillText(l, pad + 124, y + 2); y += 40; }
      y += 16;
    }
  }

  // ---------- แผนที่ชีวิต (ล่างสุด) ----------
  const mapY = H - 250, cell = inner / 25;
  c.fillStyle = MUTED; c.font = `400 22px ${BODY}`; c.fillText('แผนที่ชีวิต · 1 ช่อง = 1 ปี', pad, mapY - 38);
  const tone = {}; s.log.forEach(yy => tone[yy.age] = yearTone(yy));
  const COLS = { good: '#4f9e74', bad: '#b8483f', gold: '#d9b86c', calm: '#4a4439', death: '#ff6b5e' };
  for (let i = 0; i < 100; i++) {
    c.fillStyle = COLS[tone[i]] || 'rgba(255,255,255,0.05)';
    roundRect(c, pad + (i % 25) * cell + 2, mapY + Math.floor(i / 25) * cell + 2, cell - 4, cell - 4, 4); c.fill();
  }
  c.fillStyle = 'rgba(217,184,108,0.75)'; c.font = `400 22px ${BODY}`; c.textAlign = 'center';
  c.fillText('เกิดในโลกวิญญาจารย์ — เกมจำลองชีวิตในโลกตำนานจอมยุทธ์ภูตถังซาน', W / 2, H - 70); c.textAlign = 'left';
  return cv;
}
function roundRect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
