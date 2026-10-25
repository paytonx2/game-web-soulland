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

  const plain = [`📜 ชีวิตของ${s.name} (${s.zh}) — ${lifeVerdict(s)}`, `อายุ ${s.age} ปี · ปีทวีป ${wy0}–${wy1}`, '', ...P, '', '✨ ช่วงเวลาสำคัญ', ...hl.map(h => `• อายุ ${h.age}: ${h.t}`), '', '— เกิดในโลกวิญญาจารย์ (斗罗大陆 · A Douluo Life)'].join('\n');
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
// ---------- ชื่อเสียงเป็นคำ (ไม่แสดงตัวเลข) ----------
const FAME_RANKS = [[0, 'ไม่มีใครรู้จัก', 'ใช้ชีวิตอย่างเงียบงัน'], [15, 'คนในละแวกรู้จัก', 'เป็นที่รู้จักในหมู่บ้าน'], [40, 'มีชื่อในเมือง', 'ผู้คนในเมืองรู้จักชื่อ'], [90, 'เลื่องลือทั้งแคว้น', 'ชื่อขจรไปทั้งแคว้น'], [180, 'ดังทั้งจักรวรรดิ', 'ทั้งจักรวรรดิรู้จัก'], [350, 'เลื่องลือทั่วทวีป', 'ถูกเล่าขานทั่วทวีป'], [700, 'ตำนานแห่งทวีป', 'จารึกในประวัติศาสตร์']];
const fameRank = f => { let r = FAME_RANKS[0]; for (const x of FAME_RANKS) if (f >= x[0]) r = x; return { th: r[1], sub: r[2] }; };
const wealthWord = m => m >= 5000 ? 'มั่งคั่งมหาศาล' : m >= 1000 ? 'ร่ำรวย' : m >= 200 ? 'มีอันจะกิน' : m >= 30 ? 'พอกินพอใช้' : 'ยากจน';

// ---------- จุดเด่นของชีวิต (เรียงตามความสำคัญ) ----------
function lifeStandouts(s) {
  const out = [];
  const god = s.god ? GODS.find(g => g.id === s.god.id) : null;
  if (s.ascended) out.push({ k: 'god', lb: 'สืบทอดเทพ', v: s.cause.replace(/ขึ้นสู่อาณาจักรเทพ/, '').trim() || 'ขึ้นสู่อาณาจักรเทพ', sub: 'ผ่านบททดสอบเทพครบทุกด่าน' });
  else if (god) out.push({ k: 'god', lb: 'ผู้เข้ารับบททดสอบเทพ', v: `${god.th}`, sub: `ผ่านแล้ว ${s.god.stage}/${god.trials ? god.trials.length : 7} ด่าน` });
  if (s.rings.length) {
    const r = s.rings.reduce((a, b) => b.years > a.years ? b : a);
    out.push({ k: 'skill', lb: 'ทักษะที่แกร่งที่สุด', v: `「${r.skill}」`, sub: `วงแหวน${RING_TIERS[ringTierOf(r.years)].th} ${fmt(r.years)} ปี${r.beast ? ' · ' + r.beast : ''}` });
  }
  if (s.bones.length) out.push({ k: 'bone', lb: 'กระดูกวิญญาณ', v: s.bones.map(b => BONE_PARTS.find(x => x.id === b.part).th).join(' · '), sub: `${s.bones.length} ชิ้น · สูงสุด ${fmt(Math.max(...s.bones.map(b => b.years)))} ปี` });
  if ((s.weapons || []).length) out.push({ k: 'weapon', lb: 'อาวุธลับสำนักถัง', v: s.weapons.map(id => HIDDEN_WEAPONS.find(w => w.id === id).th.split(' (')[0]).join(' · '), sub: `${s.weapons.length} ชิ้น` });
  if (s.flags.starBlade) out.push({ k: 'weapon', lb: 'อาวุธคู่กาย', v: 'อาวุธที่ตีด้วยมือตัวเอง', sub: 'พลังต่อสู้ +10%' });
  if (s.flags.fusion) out.push({ k: 'skill', lb: 'ทักษะผสานวิญญาณยุทธ์', v: s.flags.fusion, sub: 'สร้างร่วมกับคู่หู' });
  if (Object.keys(s.arts || {}).length) out.push({ k: 'art', lb: 'วิชาสำนักถัง', v: Object.keys(s.arts).map(k => TANG_ARTS[k].th.split(' (')[0]).join(' · '), sub: `${Object.keys(s.arts).length} วิชา` });
  if ((s.mutations || []).length) { const m = s.mutations[s.mutations.length - 1]; out.push({ k: 'mut', lb: 'วิญญาณยุทธ์กลายพันธุ์', v: m.to, sub: `จาก${m.from} · ${s.mutations.length} ครั้ง` }); }
  if (s.flags.killing) out.push({ k: 'skill', lb: 'อาณาเขตสังหาร', v: 'รอดจากเมืองสังหาร', sub: 'พลังต่อสู้ +12%' });
  if (s.arenaBadge) out.push({ k: 'art', lb: 'สนามประลองซั่วทัว', v: s.arenaBadge, sub: `ชนะ ${s.arenaWins} ครั้ง` });
  return out;
}

// ---------- การ์ดชีวิตสำหรับแชร์ (หลายขนาด) ----------
const CARD_SIZES = {
  story: { w: 1080, h: 1920, th: 'สตอรี่', ratio: '9:16' },
  portrait: { w: 1080, h: 1350, th: 'โพสต์', ratio: '4:5' },
  square: { w: 1080, h: 1080, th: 'จัตุรัส', ratio: '1:1' },
  wide: { w: 1920, h: 1080, th: 'แนวนอน', ratio: '16:9' },
};
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
const CC = { GOLD: '#d9b86c', GOLD2: '#f1e2bc', INK: '#ece6da', MUTED: '#b3ab9d', SEAL: '#b8322a', HEAD: 'Mitr, sans-serif', BODY: 'Sarabun, sans-serif' };
// จัดข้อความให้พอดีโดยไม่ตัดทิ้ง: ลดขนาดตัวอักษรจนบรรทัดไม่เกิน maxLines (ถ้าถึงขนาดเล็กสุดแล้วยังเกิน ก็ขึ้นบรรทัดเพิ่ม)
function fitLines(c, text, maxW, size, min, maxLines, weight, fam) {
  let z = size;
  for (;;) {
    c.font = `${weight} ${z}px ${fam}`;
    const ls = wrapLines(c, String(text), maxW);
    if (ls.length <= maxLines || z <= min) return { lines: ls, size: z };
    z = Math.max(min, z - 2);
  }
}
function drawLines(c, fl, x, y, color, lh = 1.4) { c.fillStyle = color; for (const l of fl.lines) { c.fillText(l, x, y); y += fl.size * lh; } return y; }
const isDark = col => { const n = parseInt(col.slice(1), 16); return ((n >> 16) + ((n >> 8) & 255) + (n & 255)) < 160; };
// ส่วนประกอบของการ์ด: วาดที่ (x, y) กว้าง w แล้วคืนค่า y ถัดไป
const CardPart = {
  header(c, s, x, y, w, big) {
    const pw = big ? 210 : 150, ph = big ? 240 : 172;
    const fig = document.createElement('canvas'); fig.width = 30; fig.height = 38;
    drawFigure(fig, { ...heroSpec(s), rings: [], aura: null, age: Math.max(s.age, 8) }, '#1a1917', 2);
    c.save(); c.imageSmoothingEnabled = false; c.fillStyle = 'rgba(0,0,0,0.45)'; roundRect(c, x, y, pw, ph, 16); c.fill();
    c.drawImage(fig, x + pw * 0.05, y + 4, pw * 0.9, ph - 8); c.restore();
    c.strokeStyle = CC.GOLD; c.lineWidth = 3; roundRect(c, x, y, pw, ph, 16); c.stroke();
    const nx = x + pw + 28, nw = w - pw - 28;
    const nm = fitLines(c, s.name, nw, big ? 70 : 56, 34, 1, 700, `Charm, ${CC.HEAD}`);
    let ty = drawLines(c, nm, nx, y - nm.size * 0.05, CC.GOLD2, 1.3);
    c.fillStyle = CC.MUTED; c.font = `600 ${big ? 40 : 32}px "Noto Serif SC", serif`; c.fillText(s.zh, nx, ty); ty += big ? 58 : 46;
    ty = drawLines(c, fitLines(c, `${s.gender === 'M' ? 'ชาย' : 'หญิง'} · อายุ ${s.age} ปี · ปีทวีป ${WORLD_EPOCH + s.birthYear}–${WORLD_EPOCH + worldYear(s)}`, nw, big ? 28 : 24, 18, 1, 400, CC.BODY), nx, ty, CC.INK, 1.42);
    ty = drawLines(c, fitLines(c, `${placeOf(s).th} · ${familyOf(s).th}`, nw, big ? 26 : 22, 17, 1, 400, CC.BODY), nx, ty, CC.MUTED, 1.42);
    return Math.max(y + ph, ty) + 24;
  },
  verdict(c, s, x, y, w, st, fz = 44) {
    if (s.title) {
      const t = fitLines(c, s.title, w - 48, Math.round(fz * 0.72), 18, 1, 600, CC.HEAD), tw = Math.min(w, c.measureText(t.lines[0]).width + 48), th = t.size * 1.8;
      c.fillStyle = CC.SEAL; roundRect(c, x, y, tw, th * t.lines.length / 1 , 10); c.fill();
      let ty = y + t.size * 0.38; for (const l of t.lines) { c.fillStyle = '#fff3e6'; c.fillText(l, x + 24, ty); ty += th; }
      y += th * t.lines.length + 16;
    }
    return drawLines(c, fitLines(c, st.verdict, w, fz, 24, 2, 600, CC.HEAD), x, y, CC.GOLD, 1.42) + 6;
  },
  cause(c, s, x, y, w, lines = 3, fz = 30) {
    const fl = fitLines(c, s.ascended ? s.cause : `จากไปเพราะ${s.cause.replace(/^เสียชีวิต/, '')}`, w - 56, fz, 18, lines, 400, CC.BODY);
    const ch = fz * 2.2 + fl.lines.length * fl.size * 1.5;
    c.fillStyle = 'rgba(184,50,42,0.16)'; roundRect(c, x, y, w, ch, 16); c.fill();
    c.fillStyle = CC.SEAL; roundRect(c, x, y, 8, ch, 4); c.fill();
    c.fillStyle = '#e8a79c'; c.font = `500 ${Math.round(fz * 0.8)}px ${CC.HEAD}`; c.fillText(s.ascended ? 'จุดจบแห่งตำนาน' : 'จุดจบของชีวิต', x + 30, y + fz * 0.55);
    c.font = `400 ${fl.size}px ${CC.BODY}`; drawLines(c, fl, x + 30, y + fz * 1.85, CC.INK, 1.5);
    return y + ch + 26;
  },
  tiles(c, s, x, y, w, cols = 3, gh = 150) {
    const fr = fameRank(s.fame);
    const fam = [s.partner ? (s.flags.married ? 'สมรส' : 'มีคนรัก') : 'โสด', s.children ? `บุตร ${s.children}` : ''].filter(Boolean).join(' · ');
    const stats = [
      ['ระดับพลังวิญญาณ', isCultivator(s) ? `Lv.${lvl(s)}` : 'ไร้พลัง', isCultivator(s) ? rankOf(lvl(s)).th : 'คนธรรมดา'],
      ['วงแหวนวิญญาณ', `${s.rings.length} วง`, s.rings.length ? `แก่สุด ${fmt(Math.max(...s.rings.map(r => r.years)))} ปี` : 'ยังไม่มีวงแหวน'],
      ['ชื่อเสียง', fr.th, fr.sub],
      ['ผ่านศึก', `${s.fights || 0} ครั้ง`, `ชนะ ${s.fightWins || 0} ครั้ง`],
      ['ฐานะตอนจากไป', wealthWord(s.money), `${fmt(s.money)} เหรียญทอง`],
      ['ครอบครัว', fam, s.partner ? `คู่ชีวิต: ${s.partner}` : 'ไม่มีคู่ครอง'],
    ];
    const gap = 16, gw = (w - gap * (cols - 1)) / cols, tw = gw - 40;
    stats.forEach(([lb, v, sub], i) => {
      const gx = x + (i % cols) * (gw + gap), gy = y + Math.floor(i / cols) * (gh + gap);
      c.fillStyle = 'rgba(40,38,34,0.92)'; roundRect(c, gx, gy, gw, gh, 16); c.fill();
      c.strokeStyle = 'rgba(217,184,108,0.35)'; c.lineWidth = 2; roundRect(c, gx, gy, gw, gh, 16); c.stroke();
      const s1 = Math.round(gh * 0.155), s2 = Math.round(gh * 0.27), s3 = Math.round(gh * 0.145);
      drawLines(c, fitLines(c, lb, tw, s1, 12, 1, 500, CC.HEAD), gx + 20, gy + gh * 0.1, CC.MUTED);
      const fv = fitLines(c, v, tw, s2, Math.round(s2 * 0.55), 1, 600, CC.HEAD);
      drawLines(c, fv, gx + 20, gy + gh * 0.33 + (s2 - fv.size) * 0.5, CC.GOLD2);
      drawLines(c, fitLines(c, sub, tw, s3, 11, 1, 400, CC.BODY), gx + 20, gy + gh * 0.7, CC.MUTED);
    });
    return y + Math.ceil(stats.length / cols) * (gh + gap) + 14;
  },
  soul(c, s, x, y, w, fz = 36) {
    c.fillStyle = CC.GOLD; c.font = `500 ${Math.round(fz * 0.78)}px ${CC.HEAD}`; c.fillText('วิญญาณยุทธ์', x, y); y += fz * 1.3;
    const soulTxt = s.awakened ? s.souls.map(id => `${SOUL_BY_ID[id].th} (${TIER_INFO[SOUL_BY_ID[id].tier].th})`).join(' + ') : 'จากไปก่อนพิธีปลุก';
    y = drawLines(c, fitLines(c, soulTxt, w, fz, 20, 2, 600, CC.HEAD), x, y, CC.INK, 1.4);
    const ex = [s.awakened ? `พลังแต่กำเนิด ${s.innate}` : '', (s.mutations || []).length ? `กลายพันธุ์ ${s.mutations.length} ครั้ง` : ''].filter(Boolean).join(' · ');
    if (ex) y = drawLines(c, fitLines(c, ex, w, Math.round(fz * 0.72), 16, 1, 400, CC.BODY), x, y, CC.MUTED, 1.4);
    y += 12;
    const step = w / 9, rr = Math.min(30, step * 0.36);
    for (let i = 0; i < 9; i++) {
      const cx = x + step * i + step / 2, r = s.rings[i];
      c.beginPath(); c.arc(cx, y + rr, rr, 0, Math.PI * 2);
      if (r) {
        const col = RING_TIERS[ringTierOf(r.years)].color;
        if (isDark(col)) { c.lineWidth = rr * 0.42; c.strokeStyle = 'rgba(255,255,255,0.55)'; c.stroke(); c.beginPath(); c.arc(cx, y + rr, rr, 0, Math.PI * 2); }
        c.lineWidth = rr * 0.3; c.strokeStyle = col; c.shadowColor = isDark(col) ? '#000' : col; c.shadowBlur = 14; c.stroke(); c.shadowBlur = 0;
      } else { c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,0.12)'; c.stroke(); }
    }
    return y + rr * 2 + 30;
  },
  // จุดเด่น: แสดงเท่าที่พื้นที่พอ (ไม่ล้นทับส่วนอื่น และไม่ตัดข้อความ)
  standouts(c, s, x, y, w, max, fz = 28, limitY = Infinity) {
    const list = lifeStandouts(s).slice(0, max);
    if (!list.length || y + fz * 5 > limitY) return y;
    c.fillStyle = CC.GOLD; c.font = `500 ${fz}px ${CC.HEAD}`; c.fillText('จุดเด่นของชีวิต', x, y); y += fz * 1.6;
    const tw = w - 62;
    for (const it of list) {
      const fv = fitLines(c, it.v, tw, fz, Math.round(fz * 0.7), 2, 600, CC.HEAD);
      const fs = fitLines(c, it.sub, tw, Math.round(fz * 0.78), Math.round(fz * 0.6), 1, 400, CC.BODY);
      const hgt = fz * 0.4 + fz * 1.15 + fv.lines.length * fv.size * 1.35 + fs.lines.length * fs.size * 1.4 + fz * 0.45;
      if (y + hgt > limitY) break;
      const isGod = it.k === 'god';
      const g = c.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, isGod ? 'rgba(217,184,108,0.38)' : 'rgba(217,184,108,0.16)'); g.addColorStop(1, 'rgba(217,184,108,0.03)');
      c.fillStyle = g; roundRect(c, x, y, w, hgt, 14); c.fill();
      if (isGod) { c.save(); c.shadowColor = '#ffd36a'; c.shadowBlur = 24; c.strokeStyle = 'rgba(255,211,106,0.7)'; c.lineWidth = 3; roundRect(c, x, y, w, hgt, 14); c.stroke(); c.restore(); }
      c.strokeStyle = isGod ? '#f1e2bc' : 'rgba(217,184,108,0.45)'; c.lineWidth = isGod ? 3 : 1.5; roundRect(c, x, y, w, hgt, 14); c.stroke();
      c.fillStyle = { god: '#ffd36a', skill: '#e2574c', weapon: '#8fe3ff', bone: '#ece6da', art: '#b48cff', mut: '#6fd08c' }[it.k] || CC.GOLD;
      roundRect(c, x + 14, y + 14, 8, hgt - 28, 4); c.fill();
      let ty = y + fz * 0.4;
      ty = drawLines(c, fitLines(c, it.lb, tw, Math.round(fz * 0.78), 14, 1, 500, CC.HEAD), x + 40, ty, CC.MUTED, 1.45);
      c.font = `600 ${fv.size}px ${CC.HEAD}`; ty = drawLines(c, fv, x + 40, ty, isGod ? '#ffe9a8' : CC.GOLD2, 1.35);
      c.font = `400 ${fs.size}px ${CC.BODY}`; drawLines(c, fs, x + 40, ty, CC.MUTED, 1.4);
      y += hgt + 12;
    }
    return y + 14;
  },
  moments(c, s, x, y, w, st, max, limitY, fz = 28) {
    const hl = st.highlights.filter(h => !/^(💰|🗓️)/.test(h.t)).slice(0, max);
    if (!hl.length || y > limitY - fz * 4) return y;
    c.fillStyle = CC.GOLD; c.font = `500 ${fz}px ${CC.HEAD}`; c.fillText('ช่วงเวลาสำคัญ', x, y); y += fz * 1.7;
    for (const h of hl) {
      const t = h.t.replace(/^[^\p{L}\p{N}]+/u, '').replace('ระดับระดับ', 'ระดับ');
      const fl = fitLines(c, t, w - fz * 4.6, fz, Math.round(fz * 0.75), 2, 400, CC.BODY);
      if (y + fl.lines.length * fl.size * 1.45 > limitY) break; // ไม่พอที่ — ข้ามทั้งรายการ ไม่ตัดครึ่ง
      c.fillStyle = 'rgba(217,184,108,0.2)'; roundRect(c, x, y - 2, fz * 3.7, fz * 1.45, 10); c.fill();
      c.fillStyle = CC.GOLD2; c.font = `500 ${Math.round(fz * 0.85)}px ${CC.HEAD}`; c.textAlign = 'center'; c.fillText(`อายุ ${h.age}`, x + fz * 1.85, y + fz * 0.15); c.textAlign = 'left';
      c.font = `400 ${fl.size}px ${CC.BODY}`; y = drawLines(c, fl, x + fz * 4.4, y, CC.INK, 1.45);
      y += fz * 0.55;
    }
    return y;
  },
  lifemap(c, s, x, y, w, perRow = 25) {
    const cell = w / perRow;
    c.fillStyle = CC.MUTED; c.font = `400 22px ${CC.BODY}`; c.fillText('แผนที่ชีวิต · 1 ช่อง = 1 ปี', x, y); y += 38;
    const tone = {}; s.log.forEach(yy => tone[yy.age] = yearTone(yy));
    const COLS = { good: '#4f9e74', bad: '#b8483f', gold: '#d9b86c', calm: '#4a4439', death: '#ff6b5e' };
    for (let i = 0; i < 100; i++) { c.fillStyle = COLS[tone[i]] || 'rgba(255,255,255,0.05)'; roundRect(c, x + (i % perRow) * cell + 2, y + Math.floor(i / perRow) * cell + 2, cell - 4, cell - 4, 4); c.fill(); }
    return y + Math.ceil(100 / perRow) * cell + 10;
  },
};
async function lifeCardCanvas(s, size = 'story') {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const Z = CARD_SIZES[size] || CARD_SIZES.story, W = Z.w, H = Z.h, st = lifeStory(s);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'); c.textBaseline = 'top';
  // พื้นหลัง: ภาพหมึกจีน + เงาไล่ระดับให้อ่านง่าย
  c.fillStyle = '#0b0b0a'; c.fillRect(0, 0, W, H);
  const bg = await cardBg(), tall = H > W;
  if (bg) {
    const sc = tall ? Math.max(W / bg.width, (H * 0.42) / bg.height) : Math.max(W / bg.width, H / bg.height);
    const bw = bg.width * sc, bh = bg.height * sc;
    c.globalAlpha = 0.9; c.drawImage(bg, tall ? (W - bw) / 2 + 60 : W - bw, tall ? -40 : (H - bh) / 2, bw, bh); c.globalAlpha = 1;
  }
  let g;
  if (tall) { g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(11,11,10,0.25)'); g.addColorStop(0.12, 'rgba(11,11,10,0.5)'); g.addColorStop(H > 1500 ? 0.36 : 0.42, 'rgba(11,11,10,0.94)'); g.addColorStop(1, '#0b0b0a'); }
  else { g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(11,11,10,0.96)'); g.addColorStop(0.55, 'rgba(11,11,10,0.9)'); g.addColorStop(1, 'rgba(11,11,10,0.7)'); }
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // กรอบทอง + ตราประทับ
  c.strokeStyle = 'rgba(217,184,108,0.75)'; c.lineWidth = 3; c.strokeRect(28, 28, W - 56, H - 56);
  c.strokeStyle = 'rgba(217,184,108,0.3)'; c.lineWidth = 1.5; c.strokeRect(40, 40, W - 80, H - 80);
  for (const [x, y, sx, sy] of [[28, 28, 1, 1], [W - 28, 28, -1, 1], [28, H - 28, 1, -1], [W - 28, H - 28, -1, -1]]) {
    c.fillStyle = CC.GOLD; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 46 * sx, y); c.lineTo(x + 46 * sx, y + 8 * sy); c.lineTo(x + 8 * sx, y + 8 * sy); c.lineTo(x + 8 * sx, y + 46 * sy); c.lineTo(x, y + 46 * sy); c.closePath(); c.fill();
  }
  c.fillStyle = CC.SEAL; roundRect(c, W - 150, 74, 74, 150, 8); c.fill();
  c.strokeStyle = 'rgba(255,230,210,0.5)'; c.lineWidth = 3; roundRect(c, W - 144, 80, 62, 138, 6); c.stroke();
  c.fillStyle = '#f6e6d8'; c.font = '46px "Ma Shan Zheng", "Noto Serif SC", serif'; c.textAlign = 'center'; c.fillText('斗', W - 113, 92); c.fillText('罗', W - 113, 152); c.textAlign = 'left';
  const pad = 76, kick = y => { c.fillStyle = CC.GOLD; c.font = `500 28px ${CC.HEAD}`; c.fillText('เกิดในโลกวิญญาจารย์', pad, y); c.fillStyle = CC.MUTED; c.font = `400 22px ${CC.HEAD}`; c.fillText('DOULUO LIFE · บันทึกชีวิตหนึ่งชีวิต', pad, y + 42); };
  const foot = () => { c.fillStyle = 'rgba(217,184,108,0.75)'; c.font = `400 22px ${CC.BODY}`; c.textAlign = 'center'; c.fillText('เกิดในโลกวิญญาจารย์ — เกมจำลองชีวิตในโลกตำนานจอมยุทธ์ภูตถังซาน', W / 2, H - 74); c.textAlign = 'left'; };
  const P = CardPart, inner = W - pad * 2;
  if (size === 'story') {
    kick(84);
    let y = P.header(c, s, pad, 170, inner - 110, true);
    y = P.verdict(c, s, pad, y, inner, st);
    y = P.cause(c, s, pad, y, inner, 2);
    y = P.tiles(c, s, pad, y, inner, 3, 150);
    y = P.soul(c, s, pad, y + 6, inner);
    // ลำดับความสำคัญ: จุดเด่น → ช่วงเวลาสำคัญ → แผนที่ชีวิต (แสดงเท่าที่พื้นที่เหลือ ไม่ตัดข้อความ)
    y = P.standouts(c, s, pad, y, inner, 4, 28, H - 130);
    const mapTop = H - 300, roomForMap = y < mapTop - 20;
    y = P.moments(c, s, pad, y, inner, st, 3, roomForMap ? mapTop - 30 : H - 130);
    if (y < mapTop - 10) P.lifemap(c, s, pad, mapTop, inner);
  } else if (size === 'portrait') {
    kick(84);
    let y = P.header(c, s, pad, 170, inner - 110, true);
    y = P.verdict(c, s, pad, y, inner, st, 40);
    y = P.cause(c, s, pad, y, inner, 1, 28);
    y = P.tiles(c, s, pad, y, inner, 3, 124);
    y = P.standouts(c, s, pad, y, inner, 2, 24, H - 110);
    if (y < H - 280) P.soul(c, s, pad, y, inner, 28);
  } else if (size === 'square') {
    kick(80);
    const cw = (inner - 40) / 2, rx = pad + cw + 40;
    let y = P.header(c, s, pad, 160, cw - 10, false);
    y = P.verdict(c, s, pad, y, cw, st, 32);
    y = P.cause(c, s, pad, y, cw, 2, 24);
    P.soul(c, s, pad, y, cw, 26);
    let ry = P.tiles(c, s, rx, 250, cw, 2, 118);
    P.standouts(c, s, rx, ry, cw, 3, 22, H - 110);
  } else {
    kick(84);
    const lw = 820, rx = pad + lw + 70, rw = W - rx - pad - 90;
    let y = P.header(c, s, pad, 170, lw, true);
    y = P.verdict(c, s, pad, y, lw, st, 40);
    y = P.cause(c, s, pad, y, lw, 2, 28);
    P.soul(c, s, pad, y, lw, 30);
    let ry = P.tiles(c, s, rx, 250, rw, 3, 128);
    ry = P.standouts(c, s, rx, ry, rw, 3, 24, H - 120);
    P.moments(c, s, rx, ry, rw, st, 3, H - 120, 24);
  }
  foot();
  return cv;
}
function roundRect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
