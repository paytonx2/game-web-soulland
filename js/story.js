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
async function lifeCardCanvas(s) {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const st = lifeStory(s), W = 1080, pad = 70, inner = W - pad * 2;
  const cv = document.createElement('canvas'), c = cv.getContext('2d');
  // ผ่านแรก: วัดความสูง
  const blocks = [];
  c.font = '400 30px Sarabun, sans-serif';
  for (const p of st.paragraphs) blocks.push({ lines: wrapLines(c, p, inner), font: '400 30px Sarabun, sans-serif', lh: 46, color: '#efeaff', gap: 18 });
  c.font = '400 26px Sarabun, sans-serif';
  const hlLines = st.highlights.map(h => wrapLines(c, `อายุ ${h.age} · ${h.t}`, inner - 30));
  const sceneH = Math.round(inner * 9 / 16);
  let H = pad + 40 + 80 + 50 + 40 + sceneH + 30 + 60 + 70;
  for (const b of blocks) H += b.lines.length * b.lh + b.gap;
  H += 70 + hlLines.reduce((a, l) => a + l.length * 38 + 8, 0) + 40 + 10 * 48 + 260;
  cv.width = W; cv.height = H;

  // พื้นหลัง
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1b1440'); g.addColorStop(0.5, '#110d26'); g.addColorStop(1, '#0a0916');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const rg = c.createRadialGradient(W * 0.2, 0, 10, W * 0.2, 0, 700);
  rg.addColorStop(0, 'rgba(167,123,255,0.35)'); rg.addColorStop(1, 'rgba(167,123,255,0)');
  c.fillStyle = rg; c.fillRect(0, 0, W, 700);
  c.strokeStyle = 'rgba(247,201,94,0.55)'; c.lineWidth = 4; c.strokeRect(24, 24, W - 48, H - 48);

  let y = pad + 20;
  c.textBaseline = 'top';
  c.fillStyle = '#c9a8ff'; c.font = '500 26px Mitr, sans-serif'; c.fillText('เกิดในโลกวิญญาจารย์ · 斗罗大陆', pad, y); y += 50;
  c.fillStyle = '#ffe7a8'; c.font = '600 64px Mitr, sans-serif'; c.fillText(s.name, pad, y);
  c.font = '600 64px Mitr, sans-serif'; const nw = c.measureText(s.name).width;
  c.fillStyle = '#a39cc8'; c.font = '600 40px "Noto Serif SC", serif'; c.fillText(s.zh, pad + nw + 24, y + 16);
  y += 86;
  c.fillStyle = '#f7c95e'; c.font = '500 30px Mitr, sans-serif';
  c.fillText(`${st.verdict}${s.title ? ' · ' + s.title : ''}`, pad, y); y += 46;
  c.fillStyle = '#a39cc8'; c.font = '400 26px Sarabun, sans-serif';
  c.fillText(`อายุ ${s.age} ปี · ปีทวีป ${WORLD_EPOCH + s.birthYear}–${WORLD_EPOCH + worldYear(s)} · คะแนนชีวิต ${fmt(st.score)}`, pad, y); y += 50;

  // ภาพฉาก
  const sc = document.createElement('canvas'); sc.width = 320; sc.height = 180;
  drawScene(sc, sceneSpec(s));
  c.imageSmoothingEnabled = false;
  c.drawImage(sc, pad, y, inner, sceneH);
  c.strokeStyle = '#f7c95e'; c.lineWidth = 3; c.strokeRect(pad, y, inner, sceneH);
  y += sceneH + 26;

  // แถบค่าหลัก
  const stats = [`🌀 Lv.${isCultivator(s) ? lvl(s) : '—'}`, `💍 ${s.rings.length} วง`, `🦴 ${s.bones.length}`, `🏅 ${fmt(s.fame)}`, `💰 ${fmt(s.money)}`, `👶 ${s.children}`];
  c.font = '500 26px Mitr, sans-serif'; let x = pad;
  for (const t of stats) {
    const w = c.measureText(t).width + 28;
    c.fillStyle = 'rgba(167,123,255,0.18)'; roundRect(c, x, y, w, 44, 12); c.fill();
    c.fillStyle = '#efeaff'; c.fillText(t, x + 14, y + 8); x += w + 12;
  }
  // จุดวงแหวน
  y += 64;
  s.rings.forEach((r, i) => { c.beginPath(); c.arc(pad + 18 + i * 44, y, 15, 0, Math.PI * 2); c.lineWidth = 6; c.strokeStyle = RING_TIERS[ringTierOf(r.years)].color; c.stroke(); });
  y += s.rings.length ? 40 : 0;

  // เรื่องราว
  for (const b of blocks) {
    c.font = b.font; c.fillStyle = b.color;
    for (const l of b.lines) { c.fillText(l, pad, y); y += b.lh; }
    y += b.gap;
  }
  // ช่วงเวลาสำคัญ
  if (hlLines.length) {
    y += 10; c.fillStyle = '#ffe7a8'; c.font = '500 32px Mitr, sans-serif'; c.fillText('✨ ช่วงเวลาสำคัญ', pad, y); y += 54;
    c.font = '400 26px Sarabun, sans-serif';
    for (const ls of hlLines) { c.fillStyle = '#f7c95e'; c.fillText('•', pad, y); c.fillStyle = '#d9d2f5'; for (const l of ls) { c.fillText(l, pad + 30, y); y += 38; } y += 8; }
  }
  // แผนที่ชีวิต
  y += 24; c.fillStyle = '#c9a8ff'; c.font = '500 26px Mitr, sans-serif'; c.fillText('แผนที่ชีวิต · 1 ช่อง = 1 ปี', pad, y); y += 44;
  const tone = {}; s.log.forEach(yy => tone[yy.age] = yearTone(yy));
  const COLS = { good: '#2fb47c', bad: '#c9465f', gold: '#f7c95e', calm: '#5a4d93', death: '#000000' };
  const cell = inner / 20;
  for (let i = 0; i < 100; i++) {
    c.fillStyle = COLS[tone[i]] || 'rgba(255,255,255,0.06)';
    roundRect(c, pad + (i % 20) * cell + 3, y + Math.floor(i / 20) * cell + 3, cell - 6, cell - 6, 6); c.fill();
    if (tone[i] === 'death') { c.strokeStyle = '#ff5f7e'; c.lineWidth = 2; c.stroke(); }
  }
  y += cell * 5 + 30;
  c.fillStyle = '#6f6894'; c.font = '400 22px Sarabun, sans-serif';
  c.fillText('สร้างจากเกม "เกิดในโลกวิญญาจารย์" — เกมจำลองชีวิตตามนิยายตำนานจอมยุทธ์ภูตถังซาน', pad, y);
  // ตัดภาพให้พอดีเนื้อหา
  const out = document.createElement('canvas'); out.width = W; out.height = Math.min(H, y + 70);
  const oc = out.getContext('2d'); oc.drawImage(cv, 0, 0);
  oc.strokeStyle = 'rgba(247,201,94,0.55)'; oc.lineWidth = 4; oc.strokeRect(24, 24, W - 48, out.height - 48);
  return out;
}
function roundRect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
