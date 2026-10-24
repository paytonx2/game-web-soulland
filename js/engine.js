// ============================================================
// เอนจินเกม — ชีวิตเดินด้วยการเลือกเท่านั้น
// เลือก 1 ครั้ง → ผลลัพธ์ → เวลาผ่านไป 1 ช่วง (ตามวัย) → คำถามถัดไป
// ตัวเลือก: { k, t(ชื่อ), d(คำอธิบาย), fx(แสดงผลล่วงหน้า), fxa(ผลที่เกิดแน่นอน — ใช้ทันที), odds, danger, lock(เหตุผลที่เลือกไม่ได้), path, say, years }
// ============================================================

// ---------- สุ่ม ----------
const R = {
  f: (a, b) => a + Math.random() * (b - a),
  i: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  chance: p => Math.random() < p,
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  wpick(items, wf) {
    const ws = items.map(wf), tot = ws.reduce((a, b) => a + b, 0);
    let r = Math.random() * tot;
    for (let k = 0; k < items.length; k++) { r -= ws[k]; if (r <= 0) return items[k]; }
    return items[items.length - 1];
  },
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = n => Math.round(n).toLocaleString('th-TH');
const pct = p => clamp(p, 0, 1);

// ---------- ข้อมูลช่วย ----------
const familyOf = s => FAMILY_TIERS[s.familyTier - 1];
const clanOf = s => s.clan ? CLANS.find(c => c.id === s.clan) : null;
const placeOf = s => PLACES.find(p => p.id === s.place);
const soulOf = s => s.souls.length ? SOUL_BY_ID[s.souls[0]] : null;
const pathOf = s => PATHS[s.path];
const lvl = s => Math.floor(s.level);
function rankOf(level) {
  let r = RANKS[0];
  for (const k of RANKS) if (level >= k.min) r = k;
  return r;
}
function ringTierOf(years) {
  for (let k = RING_TIERS.length - 1; k >= 0; k--) if (years >= RING_TIERS[k].min) return k;
  return 0;
}
const isCultivator = s => s.awakened && s.innate > 0;
const hasDis = (s, id) => s.disabilities.includes(id);
function disMod(s, key) { return s.disabilities.reduce((a, d) => a + (DISABILITIES[d][key] || 0), 0); }
function maxHp(s) {
  const bone = s.bones.filter(b => b.part === 'torso').length * 25;
  return Math.max(30, 100 + lvl(s) * 3 + bone + disMod(s, 'maxhp'));
}
function effStat(s, key) {
  const bones = s.bones.filter(b => BONE_PARTS.find(p => p.id === b.part).stat === key).length * 12;
  return s[key] * (1 + disMod(s, key)) + (isCultivator(s) ? lvl(s) * 0.8 : 0) + bones;
}
function ringPower(years) { return 8 * Math.pow(Math.log10(Math.max(10, years)), 1.6); }
const ROLE_COMBAT = { power:1, agile:1, control:0.95, defense:0.9, support:0.72, heal:0.7, food:0.68, none:0.5 };
function combatPower(s) {
  const soul = soulOf(s);
  const str = effStat(s, 'str'), agi = effStat(s, 'agi'), spi = effStat(s, 'spi');
  if (!isCultivator(s)) return (str * 0.7 + agi * 0.6) * 0.5;
  const rp = s.rings.reduce((a, r) => a + ringPower(r.years), 0);
  let cp = lvl(s) * 12 + rp + str * 0.7 + agi * 0.6 + spi * 0.5;
  cp *= [0, 0.7, 0.85, 1, 1.15, 1.35][soul.tier] * ROLE_COMBAT[soul.role];
  cp *= 1 + disMod(s, 'combat') + (s.souls.length > 1 ? 0.15 : 0) + (s.flags.killing ? 0.12 : 0) + (s.flags.hiddenWeapon ? 0.08 : 0) + artCombat(s) + weaponCombat(s) + (s.flags.fusion ? 0.1 : 0) + (s.flags.starBlade ? 0.1 : 0);
  return cp * (0.6 + 0.4 * s.hp / maxHp(s));
}
function artCombat(s) { return Object.keys(s.arts || {}).reduce((a, k) => a + (TANG_ARTS[k].combat || 0), 0); }
function weaponCombat(s) { return (s.weapons || []).reduce((a, id) => a + HIDDEN_WEAPONS.find(w => w.id === id).combat, 0); }
const worldYear = s => s.birthYear + s.age;
const apMax = s => s.age < 6 ? 2 : s.age < 12 ? 3 : s.age < 60 ? 4 : 3;
function lifespan(s) {
  const L = lvl(s);
  return s.lifeBase + (isCultivator(s) ? L * 0.45 : 0) + (L >= 71 ? 10 : 0) + (L >= 91 ? 20 : 0);
}
function lifeStage(age) {
  if (age < 1) return 'แรกเกิด';
  if (age < 6) return 'วัยเด็กเล็ก';
  if (age < 12) return 'วัยเด็ก';
  if (age < 18) return 'วัยรุ่น';
  if (age < 30) return 'หนุ่มสาว';
  if (age < 50) return 'วัยกลางคน';
  if (age < 70) return 'วัยชรา';
  return 'ผู้เฒ่า';
}
// ยิ่งอายุมาก การเลือกหนึ่งครั้งยิ่งครอบคลุมหลายปี
const stepYears = age => age < 22 ? 1 : age < 55 ? 2 : 3;
// พรสวรรค์สูงสุด ใช้ตัดสินสิทธิ์สืบทอดเทพ
function talent(s) {
  const st = ['str', 'agi', 'spi', 'wis'].map(k => [k, s[k]]).sort((a, b) => b[1] - a[1]);
  return { key: st[0][0], val: st[0][1] + (s.innate === 10 ? 10 : 0) + (s.souls.length > 1 ? 10 : 0) };
}

// ---------- ชื่อ ----------
function genName(gender, clanSur) {
  const sur = clanSur || R.pick(SURNAMES);
  const g = R.pick(gender === 'M' ? GIVEN_M : GIVEN_F);
  return { th: sur[0] + g[0], zh: sur[1] + g[1] };
}

// ---------- กำเนิด ----------
// พลังวิญญาณแต่กำเนิด: ฐานะดีได้เปรียบเล็กน้อย แต่คนจนก็ลุ้นพลังเต็มขั้นได้
// โชค (1–100) ขยับโอกาส: โชคสูงไม่ค่อยไร้พลัง ได้พลังสูงและพลังเต็มขั้นบ่อยขึ้น
function rollInnate(tier, luck = 50) {
  const fam = FAMILY_TIERS[tier - 1], lf = (luck - 50) / 50;
  if (R.chance(fam.p0 * (1 - 0.4 * lf))) return 0;
  if (R.chance(fam.full * (1 + 1.5 * Math.max(0, lf)))) return 10;
  let v = R.i(1, 6);
  if (R.chance(fam.innUp * (1 + 0.7 * lf))) v += R.i(1, 3);
  if (R.chance(0.06)) v += R.i(1, 2); // พรสวรรค์ที่ไม่สนชนชั้น
  return clamp(v, 1, 9);
}
// โชคดันน้ำหนักไปทางวิญญาณยุทธ์ระดับสูง (คนจนดวงดีก็ได้ของดีได้)
function rollSoul(tier, minTier = 1, luck = 50) {
  const w = FAMILY_TIERS[tier - 1].soulW.map((x, i) => x * Math.pow(1 + (luck - 50) / 100, i));
  const t = R.wpick([1, 2, 3, 4, 5].filter(x => x >= minTier), x => w[x - 1]);
  const pool = SOULS.filter(s => s.tier === t && !CLANS.some(c => c.soul === s.id) && s.id !== 'luosanpao' && s.id !== 'jiubao' && s.id !== 'bluesilverking');
  let soul = R.pick(pool);
  if (soul.mut && R.chance(0.02 + Math.max(0, luck - 70) / 800)) soul = SOUL_BY_ID[soul.mut];
  return soul.id;
}
function placeWeight(p, tier) {
  const want = tier >= 4 ? 1.5 : tier <= 2 ? -0.8 : 0.3;
  return Math.max(0.15, 2 - Math.abs(p.wealth - want));
}

function newLife() {
  const gender = R.chance(0.5) ? 'M' : 'F';
  const famT = R.wpick(FAMILY_TIERS, f => f.weight);
  let clan = null;
  if (famT.id >= 5 && R.chance(0.8)) clan = R.pick(CLANS.filter(c => c.tier === famT.id));
  const name = genName(gender, clan ? clan.sur : null);
  const place = clan ? PLACES.find(p => p.id === clan.place) : R.wpick(PLACES, p => placeWeight(p, famT.id));
  const bg = R.pick(BACKGROUNDS.filter(b => b.tier === famT.id));
  const luck = clamp(R.i(1, 95) + (famT.bias.luck || 0) + (bg.mods.luck || 0), 1, 100);
  const innate = rollInnate(famT.id, luck);
  let soul;
  if (clan && R.chance(0.65)) { soul = clan.soul; if (clan.mut && R.chance(0.04 + luck / 2000)) soul = clan.mut; }
  else soul = rollSoul(famT.id, 1, luck);
  const souls = [soul];
  if (R.chance(0.004 + famT.id * 0.0008 + Math.max(0, luck - 80) / 4000)) { let second = rollSoul(famT.id, 3, luck); if (second === soul) second = 'haotian'; souls.push(second); }

  const st = k => clamp(R.i(4, 13) + (famT.bias[k] || 0) + (bg.mods[k] || 0), 1, 40);
  const s = {
    v: 4, id: Date.now().toString(36), birthYear: R.i(-14, 8),
    name: name.th, zh: name.zh, gender,
    familyTier: famT.id, clan: clan ? clan.id : null, place: place.id,
    age: 0, alive: true, cause: null,
    awakened: false, innate, souls,
    level: 0, rings: [], bones: [], hp: 100,
    str: st('str'), agi: st('agi'), spi: st('spi'), wis: st('wis'),
    luck, fame: bg.mods.fame || 0, mood: 70 + (bg.mods.mood || 0), money: Math.max(0, famT.start + (bg.money || 0)),
    bg: bg.id,
    disabilities: [], path: 'child', sect: null,
    mentor: null, partner: null, children: 0, friend: null,
    lifeBase: R.i(55, 76) + Math.round(famT.care * 8),
    flags: {}, seen: {}, boost: 1, huntWait: -1, god: null, title: null,
    log: [], feed: [], pending: null, battle: null,
    peers: [], news: null,
    ap: 2, done: {}, queue: [], tend: {}, arts: {}, weapons: [], skip: 0,
    picks: [], pathHist: [{ age: 0, path: 'child' }],
  };
  if (bg.mods.hp) s.hp += bg.mods.hp;
  s.peers = Array.from({ length: 4 }, () => newPeer());
  s.birthOdds = birthOdds(s);
  pushYear(s);
  log(s, `คุณถือกำเนิดเป็น${gender === 'M' ? 'เด็กชาย' : 'เด็กหญิง'} ชื่อ <b>${s.name} (${s.zh})</b> ที่${place.th} ${place.nation}`, 'big');
  log(s, BIRTH_STORY[famT.id - 1](place), '');
  log(s, `ภูมิหลัง: <b>${bg.th}</b> — ${bg.desc}`, '');
  log(s, `📅 ปีทวีปที่ ${WORLD_EPOCH + s.birthYear} — ${s.birthYear < 0 ? `${-s.birthYear} ปีก่อน` : s.birthYear > 0 ? `${s.birthYear} ปีหลัง` : 'ปีเดียวกับ'}ที่เด็กชายชื่อถังซานลืมตาดูโลก`, 'muted');
  if (clan) log(s, `คุณเกิดในสายเลือด <b>${clan.th} (${clan.zh})</b> — ${clan.desc}`, 'gold');
  return s;
}
const BIRTH_STORY = [
  p => `คุณลืมตาดูโลกในกระท่อมมุงจากหลังเล็กที่${p.th} ข้าวสารในบ้านแทบไม่พอสำหรับปากท้องใหม่ แต่แม่ยังยิ้มทั้งน้ำตา`,
  p => `บ้านหลังเก่าที่${p.th} เต็มไปด้วยเสียงหัวเราะเมื่อคุณเกิด แม่ห่อคุณด้วยผ้าฝ้ายที่ทอเอง`,
  p => `ร้านค้าของครอบครัวที่${p.th} ปิดร้านหนึ่งวันเพื่อฉลองการเกิดของคุณ พ่อแจกขนมให้ทั้งตรอก`,
  p => `จวนขุนนางที่${p.th} จุดโคมแดงทั้งคืน แม่นมและสาวใช้วิ่งวุ่นต้อนรับทายาทคนใหม่`,
  p => `ผู้อาวุโสของตระกูลแตะหน้าผากคุณแล้วพยักหน้า "สายเลือดนี้แรงนัก" — คืนนั้นที่${p.th}มีลมวิญญาณพัดผ่าน`,
  p => `ระฆังทองดังเก้าครั้งทั่ว${p.th} ผู้คนรู้กันทั้งเมืองว่าสายเลือดสูงศักดิ์ได้ทายาทใหม่แล้ว`,
];
function birthOdds(s) {
  const totF = FAMILY_TIERS.reduce((a, f) => a + f.weight, 0);
  const pFam = familyOf(s).weight / totF;
  let pPlace;
  if (s.clan) pPlace = 0.8 / CLANS.filter(c => c.tier === s.familyTier).length;
  else { const tot = PLACES.reduce((a, p) => a + placeWeight(p, s.familyTier), 0); pPlace = placeWeight(placeOf(s), s.familyTier) / tot; }
  return { family: pFam, place: pPlace, total: Math.max(2, Math.round(1 / (0.5 * pFam * pPlace))) };
}

// ---------- เพื่อนรุ่นเดียวกัน ----------
function newPeer() {
  const g = R.chance(0.5) ? 'M' : 'F', t = R.wpick(FAMILY_TIERS, f => f.weight), n = genName(g);
  return { name: n.th, zh: n.zh, g, place: R.pick(PLACES).id, tier: t.id, innate: rollInnate(t.id), soul: rollSoul(t.id), level: 0, rings: 0, alive: true, cause: null, deathAge: null };
}
const PEER_DEATH = ['ป่วยตาย', 'ถูกสัตว์วิญญาณขย้ำ', 'แพ้ประลองจนตาย', 'ร่างระเบิดตอนดูดซับวงแหวน', 'ถูกโจรสังหาร', 'ตายในสงคราม', 'อุบัติเหตุ'];
function tickPeers(s) {
  for (const p of s.peers) {
    if (!p.alive) continue;
    const pd = s.age < 5 ? 0.02 : s.age < 50 ? 0.012 : 0.012 + (s.age - 50) * 0.006;
    if (R.chance(pd)) { p.alive = false; p.deathAge = s.age; p.cause = R.pick(PEER_DEATH); if (!s.news) s.news = `${p.name} คนที่เกิดปีเดียวกับคุณ ${p.cause} ขณะอายุ ${s.age} ปี`; continue; }
    if (s.age === 6) { p.level = p.innate; continue; }
    if (s.age > 6 && p.innate > 0) {
      const before = p.rings, cap = Math.min(99, (p.rings + 1) * 10);
      p.level = Math.min(cap, p.level + p.innate * 0.42 * TIER_INFO[SOUL_BY_ID[p.soul].tier].mult * FAMILY_TIERS[p.tier - 1].train / (1 + Math.max(0, p.level - 20) / 25) * R.f(0.7, 1.3));
      if (p.level >= cap && p.rings < 9 && R.chance(0.7)) { p.rings++; p.level += 1; }
      if (p.rings > before && p.rings >= 3 && !s.news && R.chance(0.5)) s.news = `${p.name} คนรุ่นเดียวกับคุณ ได้รับวงแหวนวิญญาณวงที่ ${p.rings} แล้ว`;
    }
  }
}
const WORLD_NEWS = [
  'ตำหนักวิญญาณยุทธ์ประกาศเก็บภาษีวิญญาจารย์เพิ่มในทุกเมือง', 'มีข่าวลือว่าพรหมยุทธ์เฮ่าเทียนปรากฏตัวที่เมืองชายแดน',
  'สนามประลองวิญญาณใหญ่ซั่วทัวขึ้นค่าเดิมพันเป็นเท่าตัว', 'สถาบันเชร็คเปิดรับ "สัตว์ประหลาด" รุ่นใหม่ คนสมัครล้นหลาม',
  'คลื่นสัตว์วิญญาณโจมตีหมู่บ้านชายป่าดาวซิงโต่ว', 'จักรวรรดิเทียนโต่วและซิงหลัวเจรจาพรมแดนล้มเหลว',
  'พบวิญญาณยุทธ์กลายพันธุ์ในเด็กชาวนาที่เมืองนั่วติง', 'ตระกูลมังกรทรราชสายฟ้าครามจัดงานเลือกทายาท',
  'สำนักหอแก้วเจ็ดสมบัติเปิดขายยาบำรุงวิญญาณ ราคาแพงลิบ', 'มีผู้พบสัตว์วิญญาณแสนปีในป่าดาวซิงโต่ว นักล่าทั่วทวีปมุ่งหน้าไป',
  'วิญญาจารย์ชั่วร้ายลักพาตัวเด็กในเมืองเกิงซิน', 'ราคาเหรียญทองวิญญาณพุ่งขึ้น ข้าวยากหมากแพงทั่วจักรวรรดิ',
  'พายุหิมะจากดินแดนเหนือทำให้กองคาราวานหายไปทั้งขบวน', 'สังฆราชตำหนักวิญญาณยุทธ์ออกตรวจเมืองต่าง ๆ ด้วยตนเอง',
  'การแข่งขันวิญญาจารย์ทั่วทวีปกำลังจะเริ่มขึ้นที่นครวิญญาณยุทธ์', 'ช่างแห่งเกิงซินตีอาวุธลับสำนักถังได้สำเร็จ',
];

// ---------- บันทึก ----------
function pushYear(s) { s.log.push({ age: s.age, lines: [] }); }
function log(s, t, c = '', d) {
  const line = d ? { t, c, d } : { t, c };
  s.log[s.log.length - 1].lines.push(line);
  if (s.feed) s.feed.push({ ...line, age: s.age });
}
// เปิด/ปิด "ช่วง" เพื่อสรุปว่าสาเหตุนี้ทำให้ค่าอะไรเปลี่ยน แล้วบันทึกเป็นแถวชิปต่อท้ายสาเหตุนั้น
const segStart = s => s._delta ? s._delta.length : 0;
function segEnd(s, i0, title) {
  if (!s._delta) return;
  const agg = {};
  for (const [k, n] of s._delta.slice(i0)) agg[k] = (agg[k] || 0) + n;
  const parts = Object.entries(agg).filter(([, n]) => Math.round(n * 10) !== 0).map(([k, n]) => [k, Math.round(n * 10) / 10]);
  if (!parts.length) return;
  if (title) log(s, title, 'passive');
  log(s, '', 'chips', parts);
}

// ---------- เปลี่ยนค่า ----------
const STAT_TH = { str:'พละกำลัง', agi:'ความว่องไว', spi:'พลังจิต', wis:'ปัญญา', luck:'โชค', fame:'ชื่อเสียง', mood:'อารมณ์', money:'เหรียญทอง', hp:'สุขภาพ', soul:'พลังวิญญาณ' };
function add(s, key, n, quiet = false) {
  if (!n) return;
  if (key === 'soul') return addSoul(s, n);
  if (key === 'money') s.money = Math.max(0, s.money + n);
  else if (key === 'hp') s.hp = clamp(s.hp + n, -999, maxHp(s));
  else if (key === 'fame') s.fame = Math.max(0, s.fame + n * (n > 0 ? 1 + disMod(s, 'fame') : 1));
  else {
    // ค่าสถานะยิ่งสูงยิ่งเพิ่มยาก
    if (n > 0 && ['str', 'agi', 'spi', 'wis'].includes(key) && s[key] >= 60) n = Math.floor(n * 0.5) + (R.chance((n * 0.5) % 1) ? 1 : 0);
    if (!n) return;
    s[key] = clamp(s[key] + n, 0, 100);
  }
  if (!quiet && s._delta) s._delta.push([key, n]);
}
function addSoul(s, n) {
  if (!isCultivator(s)) return;
  // รางวัลพลังวิญญาณจากเหตุการณ์ ยิ่งระดับสูงยิ่งได้น้อยลง
  if (n > 0) n *= 1 / (1 + Math.max(0, s.level - 20) / 20);
  const b = lvl(s);
  s.level = clamp(s.level + n, 0, ringCap(s));
  if (s._delta && lvl(s) !== b) s._delta.push(['soul', lvl(s) - b]);
}
function apply(s, fx) { for (const [k, n] of fx || []) if (typeof n === 'number') add(s, k, n); }
function die(s, cause) {
  if (!s.alive) return;
  s.alive = false; s.cause = cause; s.hp = 0; s.pending = null; s.battle = null;
  log(s, `☠️ <b>${cause}</b> — สิ้นชีวิตเมื่ออายุ ${s.age} ปี`, 'death');
}
function hurt(s, n, cause, lethal = true) {
  s.hp -= n;
  if (s._delta) s._delta.push(['hp', -n]);
  if (s.hp <= 0) { if (lethal) die(s, cause); else s.hp = R.i(1, 8); }
}
function disable(s, id) {
  if (hasDis(s, id)) return false;
  s.disabilities.push(id);
  log(s, `♿ คุณได้รับความพิการถาวร: <b>${DISABILITIES[id].th}</b> — ${DISABILITIES[id].desc}`, 'bad');
  s.hp = Math.min(s.hp, maxHp(s));
  return true;
}
function randomDisability(s) {
  const opts = ['lost_arm', 'lame_leg', 'blind_eye', 'meridian', 'soul_crack', 'scar_face', 'chronic'].filter(d => !hasDis(s, d));
  if (opts.length) disable(s, R.pick(opts));
}
const bgOf = s => BACKGROUNDS.find(b => b.id === s.bg) || { th: '', desc: '', mods: {} };
function changeTier(s, d, why) {
  const t = clamp(s.familyTier + d, 1, 6);
  if (t === s.familyTier) return;
  if (d < 0 && s.familyTier >= 4) s.flags.fallen = true;
  s.familyTier = t;
  log(s, `${d > 0 ? '📈' : '📉'} ฐานะของครอบครัวเปลี่ยนเป็น <b>${FAMILY_TIERS[t - 1].th}</b> — ${why}`, d > 0 ? 'gold' : 'bad');
}
function setPath(s, id) {
  if (s.path === id) return;
  s.path = id;
  (s.pathHist = s.pathHist || []).push({ age: s.age, path: id });
  log(s, `🧭 เส้นทางชีวิตใหม่: <b>${PATHS[id].th}</b>`, 'gold');
}
// โอกาสสำเร็จจากค่าสถานะ
// สุ่มเพียงครั้งเดียวต่อปี (ใช้กับเหตุการณ์บังคับที่ถูกเช็กหลายครั้งในปีเดียว)
function yearlyRoll(s, key, p) {
  s.rolls = s.rolls || {};
  if (!s.rolls[key] || s.rolls[key][0] !== s.age) s.rolls[key] = [s.age, R.chance(p)];
  return s.rolls[key][1];
}
const statOdds = (s, key, base = 0.25, div = 130) => pct(clamp(base + effStat(s, key) / div + s.luck / 600, 0.05, 0.95));

// ---------- บำเพ็ญ ----------
function ringCap(s) { return Math.min(99, (s.rings.length + 1) * 10); }
function isBottleneck(s) { return isCultivator(s) && s.level >= ringCap(s) && s.rings.length < 9 && lvl(s) < 99; }
// หน่วยการเติบโตต่อ "การบำเพ็ญเต็มปี" (ไม่สุ่ม) — ใช้ทั้งคำนวณจริงและแสดงตัวอย่าง
// ยิ่งระดับสูงยิ่งช้า: อัจฉริยะพลังเต็มขั้น ~ระดับ 30 ตอน 12 ปี, ~50 ตอน 20 ปี; ระดับ 90+ ต้องใช้เวลาหลายสิบปี
function cultUnit(s) {
  const soul = soulOf(s);
  if (!soul || !isCultivator(s)) return 0;
  const P = pathOf(s), fam = familyOf(s);
  const base = s.innate * 0.3 + (s.innate === 10 ? 0.5 : 0);
  let mult = TIER_INFO[soul.tier].mult * fam.train * (P.cult || 0.8) * (0.75 + s.wis / 100 * 0.45);
  if (s.arts && s.arts.xuantian) mult *= 1.08;
  if (s.flags.ningBuff) mult *= 1.06;
  mult *= s.mentor ? 1.15 : 1;
  // แรงผลักดันจากจุดเปลี่ยนของชีวิต: คู่ปรับ ปณิธาน ตำราลับ
  if (s.flags.rivalry && !s.flags.rivalDone) mult *= 1.05;
  if (s.flags.mottoPower) mult *= 1.04;
  if (s.flags.secretManual) mult *= 1.05;
  mult *= s.souls.length > 1 ? 1.12 : 1;
  mult *= 1 + disMod(s, 'cult');
  mult *= s.mood < 25 ? 0.8 : 1;
  mult = Math.min(mult, 2.1);
  const L = s.level;
  let dim = 1 / (1 + Math.max(0, L - 15) / 12);
  if (L >= 60) dim *= 0.9;
  if (L >= 80) dim *= 0.8;
  if (L >= 90) dim *= 0.75;
  const ageF = s.age > 40 ? Math.max(0.3, 1 - (s.age - 40) / 80) : 1;
  return base * mult * dim * ageF * s.boost;
}
// บำเพ็ญหลายครั้งในปีเดียว ผลจะลดลงเรื่อย ๆ
const yearCultFactor = s => [1, 0.6, 0.4, 0.3, 0.2][Math.min(s.yearCult || 0, 4)];
function cultivate(s, factor = 1, isAct = false) {
  if (!isCultivator(s)) return;
  if (!pathOf(s).cult && factor === 0.6) return;
  const cap = ringCap(s);
  if (s.level >= cap) return;
  let g = cultUnit(s) * factor * R.f(0.8, 1.2);
  if (isAct) { g *= yearCultFactor(s); s.yearCult = (s.yearCult || 0) + 1; }
  const before = lvl(s);
  s.level = Math.min(cap, s.level + g);
  const after = lvl(s);
  if (after > before) {
    if (s._delta) s._delta.push(['soul', after - before]);
    if (rankOf(after).min > before) log(s, `🌀 พลังวิญญาณทะลวงถึง <b>ระดับ ${after}</b> — ก้าวสู่ขั้น <b>${rankOf(after).th} (${rankOf(after).zh})</b>!`, 'gold');
  }
  if (s.level >= cap && s.rings.length < 9) log(s, `⛓️ พลังวิญญาณติดคอขวดที่ระดับ ${cap} — ต้องล่า <b>วงแหวนวิญญาณที่ ${s.rings.length + 1}</b>`, 'warn');
}

// ---------- ล่าวงแหวนวิญญาณ ----------
function ringLimit(s, idx) {
  let f = 0.8 + s.str / 100 * 0.5 + (s.flags.huntReady ? 0.15 : 0) + (s.flags.herb ? 0.5 : 0) + (s.flags.iceFire ? 0.6 : 0) + (s.souls.length > 1 ? 0.2 : 0) + s.bones.length * 0.1;
  return Math.round(RING_LIMITS[idx] * f);
}
const ESCORT_COST = [0, 3, 20, 120, 800];
function huntCalc(s, years, compat) {
  const t = ringTierOf(years), limit = ringLimit(s, s.rings.length);
  const free = s.familyTier >= 5 || s.flags.huntReady || ['clan', 'sect', 'shrek', 'wuhunac', 'royal', 'wuhun', 'elder'].includes(s.path);
  const cost = free ? 0 : ESCORT_COST[t];
  const escort = free || s.money >= cost;
  const huntRisk = [0.01, 0.04, 0.12, 0.28, 0.55][t] * (escort ? 0.3 : 1) * clamp(1 + ((t + 1) * 12 - lvl(s)) / 40, 0.5, 2) * (1 - s.luck / 400) * (compat ? 0.85 : 1);
  const ratio = years / limit;
  const absorb = ratio > 1 ? Math.min(0.97, (ratio - 1) * 1.1) * (1 - s.luck / 300) * (compat ? 0.7 : 1) : 0;
  return { t, limit, cost, free, escort, huntRisk, ratio, absorb, death: clamp(huntRisk * 0.3 + absorb * 0.65, 0, 0.99) };
}
function beastChoices(s) {
  const idx = s.rings.length, limit = ringLimit(s, idx), role = soulOf(s).role;
  const used = new Set(), out = [];
  for (const r of [0.35, 0.75, 1.15, 1.8]) {
    const target = clamp(limit * r, 10, 190000);
    const pool = BEASTS.filter(b => b.min <= target * 1.4 && b.max >= target * 0.7 && !used.has(b.th) && (!b.big || s.flags.redBeast || (b.min < 20000 && idx >= 3)));
    if (!pool.length) continue;
    const b = R.pick(pool); used.add(b.th);
    out.push({ b, years: Math.round(clamp(target * R.f(0.85, 1.15), b.min, b.max)) });
  }
  if (s.flags.redBeast && !out.some(o => o.years >= 100000)) {
    const b = R.pick(BEASTS.filter(x => x.min >= 100000));
    out.push({ b, years: R.i(b.min, Math.min(b.max, b.min + 30000)) });
  }
  return out.sort((a, b) => a.years - b.years).map(o => ({ ...o, compat: o.b.aff === 'any' || (AFF_MATCH[role] || []).includes(o.b.aff) }));
}
function resolveHunt(s, years, beast, compat) {
  s.yearHunt = true;
  const h = huntCalc(s, years, compat), idx = s.rings.length;
  if (!h.free && h.escort && h.cost) { add(s, 'money', -h.cost); log(s, `💰 จ่าย ${fmt(h.cost)} เหรียญจ้างทีมคุ้มกัน`); }
  else if (!h.escort) log(s, '⚠️ เงินไม่พอจ้างทีมคุ้มกัน ต้องล่าเพียงลำพัง!', 'warn');
  log(s, `🐾 คุณเผชิญหน้ากับ<b>${beast}</b> อายุ ${fmt(years)} ปี`);
  if (R.chance(h.huntRisk)) {
    const r = Math.random();
    if (r < 0.3) { die(s, `ถูก${beast} ${fmt(years)} ปีสังหารระหว่างล่าวงแหวน`); return; }
    if (r < 0.6) { log(s, `${beast}ขย้ำคุณอย่างโหดร้าย`, 'bad'); hurt(s, R.i(30, 60), `ถูก${beast}สังหาร`); if (s.alive) randomDisability(s); }
    else { log(s, 'คุณบาดเจ็บหนักและต้องหนีกลับมามือเปล่า', 'bad'); hurt(s, R.i(20, 45), `ถูก${beast}สังหาร`); }
    return;
  }
  if (h.ratio > 1) {
    log(s, `⚡ พลังของวงแหวนเกินขีดจำกัดร่างกาย! (${fmt(years)} / ~${fmt(h.limit)} ปี)`, 'warn');
    if (R.chance(h.absorb)) {
      if (R.chance(0.65)) { die(s, 'ร่างระเบิดเพราะดูดซับวงแหวนวิญญาณเกินขีดจำกัด'); return; }
      log(s, 'คุณรอดตายอย่างหวุดหวิด แต่การดูดซับล้มเหลว', 'bad');
      hurt(s, R.i(40, 70), 'ดูดซับวงแหวนวิญญาณล้มเหลว');
      if (s.alive && R.chance(0.6)) disable(s, R.chance(0.5) ? 'meridian' : 'soul_crack');
      return;
    }
    log(s, 'คุณกัดฟันทนความเจ็บปวดราวร่างจะแหลก และฝ่าฟันมาได้! ร่างกายแข็งแกร่งขึ้นมาก', 'gold');
    add(s, 'str', R.i(3, 7)); add(s, 'spi', R.i(3, 7)); add(s, 'fame', 3);
  }
  const role = soulOf(s).role;
  const ring = { years, skill: SKILL_NAMES[role][idx], beast };
  s.rings.push(ring);
  log(s, `💍 ได้รับ <b>วงแหวนวิญญาณที่ ${idx + 1}</b> สี${RING_TIERS[ringTierOf(years)].th} จาก${beast} (${fmt(years)} ปี) — ทักษะ「<b>${ring.skill}</b>」`, 'gold');
  if (compat) { log(s, '✨ ธาตุของสัตว์วิญญาณเข้ากับวิญญาณยุทธ์ ทักษะทรงพลังเป็นพิเศษ', 'good'); ring.compat = true; }
  const bonus = (1 + (years >= 1000 ? 1 : 0) + (years >= 10000 ? 1 : 0) + (years >= 100000 ? 3 : 0) + (h.ratio > 1 ? 1 : 0) + (compat ? 0.5 : 0)) * (idx >= 6 ? 0.6 : 1);
  addSoul(s, bonus);
  add(s, role === 'agile' ? 'agi' : role === 'power' || role === 'defense' ? 'str' : 'spi', R.i(2, 4) + h.t + (compat ? 2 : 0));
  if (h.t >= 2) add(s, 'fame', h.t * 2);
  const pBone = years >= 100000 ? 0.6 : years >= 10000 ? 0.15 : years >= 1000 ? 0.02 : 0;
  if (R.chance(pBone)) giveBone(s, years);
}
function giveBone(s, years) {
  const owned = s.bones.map(b => b.part), free = BONE_PARTS.filter(p => !owned.includes(p.id));
  if (!free.length) return;
  const part = R.pick(free);
  s.bones.push({ part: part.id, years });
  log(s, `🦴 ได้รับ <b>${part.th}</b> (${fmt(years)} ปี)!`, 'gold');
}

// ---------- พิธีปลุกวิญญาณยุทธ์ ----------
function soulLabel(id) { const x = SOUL_BY_ID[id]; return `${x.th} (${x.zh})`; }
function awaken(s) {
  s.awakened = true;
  if (s.luck >= 80 && SOUL_BY_ID[s.souls[0]].tier <= 2 && R.chance((s.luck - 70) / 100)) {
    const old = SOUL_BY_ID[s.souls[0]];
    s.souls[0] = rollSoul(s.familyTier, 3, s.luck);
    log(s, `🍀 <b>ปาฏิหาริย์แห่งโชคชะตา!</b> ลูกแก้วคริสตัลแตกร้าว แสงที่ควรเป็น${old.th}บิดเกลียวกลายเป็นสิ่งที่ยิ่งใหญ่กว่า`, 'gold');
  }
  if (s.innate === 0 && s.luck >= 88 && R.chance(0.3)) {
    s.innate = R.i(1, 4);
    log(s, '🍀 ลูกแก้วมืดสนิทอยู่นาน… แล้วกะพริบแสงริบหรี่ในวินาทีสุดท้าย — ดวงชะตาไม่ทิ้งคุณ', 'gold');
  }
  const soul = soulOf(s);
  log(s, `✨ วิญญาณยุทธ์ของคุณคือ <b>${soulLabel(soul.id)}</b> — ประเภท${TYPE_TH[soul.type]} · ระดับ${TIER_INFO[soul.tier].th}`, 'gold');
  if (s.souls.length > 1) log(s, `🌟🌟 ปาฏิหาริย์! คุณมี <b>วิญญาณยุทธ์คู่</b>: ${soulLabel(s.souls[1])}`, 'gold');
  if (s.innate === 0) { log(s, '💧 ลูกแก้วคริสตัลไม่ส่องแสง... คุณ <b>ไม่มีพลังวิญญาณแต่กำเนิด</b> ไม่อาจเป็นวิญญาจารย์ได้', 'bad'); add(s, 'mood', -20); }
  else {
    s.level = s.innate;
    log(s, s.innate === 10 ? '🔥 <b>พลังวิญญาณแต่กำเนิดเต็มขั้น (ระดับ 10)!</b> อัจฉริยะหายากที่สุด' : `ลูกแก้วคริสตัลเปล่งแสง — พลังวิญญาณแต่กำเนิด <b>ระดับ ${s.innate}</b>`, s.innate >= 8 ? 'gold' : 'good');
    if (s.innate === 10) { add(s, 'fame', 10); s.flags.genius = true; }
  }
}

// ---------- ทะเบียนเหตุการณ์ ----------
// def: { age:[min,max], w, cond(s), once(default true), scene, make(s,arg) -> {title,text,opts,ctx,scene,years}, pick:{k: fn(s,ctx,opt)}, battleEnd(s,won,ctx) }
const EVENTS = {};
function E(id, def) { EVENTS[id] = Object.assign({ id, once: true, w: 1, forced: false }, def); }

function present(s, id, arg) {
  const ev = EVENTS[id], m = ev.make(s, arg);
  // คำนวณโอกาสตายให้ผู้เล่นเห็นล่วงหน้า ถ้าเหตุการณ์ไม่ได้ระบุเอง
  for (const op of m.opts) {
    if (op.danger !== undefined) continue;
    const d = (op.risk ? op.risk.p * (op.risk.die || 0) : 0) + (op.odds != null && op.lose ? (1 - op.odds) * (op.lose.die || 0) : 0);
    if (d > 0) op.danger = d;
  }
  s.pending ={ eid: id, title: m.title, text: m.text, opts: m.opts, ctx: m.ctx || {}, scene: m.scene || ev.scene || null, years: m.years };
  s.seen[id] = (s.seen[id] || 0) + 1;
}

// ---------- ล่าวงแหวน (บังคับเมื่อติดคอขวด) ----------
E('hunt', {
  forced: true, once: false, scene: 'hunt',
  make(s) {
    const idx = s.rings.length, know = s.wis >= 35 || !!s.mentor;
    const choices = beastChoices(s);
    const opts = choices.map((c, i) => {
      const h = huntCalc(s, c.years, c.compat), rt = RING_TIERS[h.t];
      return { k: 'b' + i, ring: rt.id, t: `${c.b.th} อายุ ${fmt(c.years)} ปี`, d: `วงแหวน${rt.th} · ${c.compat ? '✅ ธาตุเข้ากับวิญญาณยุทธ์' : '❎ ธาตุไม่เข้ากัน'} · ${h.free ? 'มีผู้คุ้มกันให้' : h.escort ? `จ้างคุ้มกัน ${fmt(h.cost)} เหรียญ` : `⚠️ ไม่มีเงินจ้างคุ้มกัน (${fmt(h.cost)})`}`,
        fx: [['soul', `+${1 + (c.years >= 1000) + (c.years >= 10000) * 2 + (c.years >= 100000) * 4 + c.compat}`], ...(h.escort && h.cost && !h.free ? [['money', -h.cost]] : [])],
        danger: know ? h.death : null, unknown: !know };
    });
    if (s.familyTier >= 5 || s.path === 'clan') {
      const y = Math.round(ringLimit(s, idx) * 0.85);
      opts.push({ k: 'clan', t: 'ให้ผู้อาวุโสตระกูลจับสัตว์ที่เหมาะที่สุดมาให้', d: `วงแหวนประมาณ ${fmt(y)} ปี · ธาตุเข้ากันแน่นอน · แต่ผู้คนจะว่าคุณพึ่งพาตระกูล`, fx: [['soul', '+2'], ['fame', -2]], danger: 0.02 });
    }
    opts.push({ k: 'wait', t: 'ยังไม่ล่า รอเตรียมตัวก่อน', d: 'พลังวิญญาณจะหยุดนิ่งจนกว่าจะได้วงแหวน', fx: [] });
    return {
      title: `🔮 ล่าวงแหวนวิญญาณที่ ${idx + 1}`,
      text: `พลังวิญญาณของคุณถึงระดับ ${ringCap(s)} แล้ว คุณออกเดินทางเข้าป่าดาวซิงโต่วเพื่อเลือกสัตว์วิญญาณมาเป็นวงแหวนที่ ${idx + 1} ` + (know ? `ด้วยความรู้ทฤษฎี คุณประเมินว่าร่างกายรับได้ราว <b>${fmt(ringLimit(s, idx))} ปี</b> ยิ่งเกินยิ่งเสี่ยงร่างระเบิด` : 'คุณไม่มีความรู้พอจะประเมินขีดจำกัดของร่างกาย (ต้องมีปัญญา 35+ หรือมีอาจารย์)'),
      ctx: { choices: choices.map(c => ({ th: c.b.th, years: c.years, compat: c.compat })) },
      opts,
    };
  },
  pick: new Proxy({}, { get: (_, k) => (s, ctx) => {
    if (k === 'wait') { s.huntWait = s.age; log(s, 'คุณตัดสินใจรอไปก่อน'); return; }
    if (k === 'clan') { resolveHunt(s, Math.round(ringLimit(s, s.rings.length) * 0.85), 'สัตว์วิญญาณที่ตระกูลจับมา', true); add(s, 'fame', -2); return; }
    const c = ctx.choices[+k.slice(1)];
    resolveHunt(s, c.years, c.th, c.compat);
  } }),
});

// ---------- การไหลของเวลา ----------
function yearTick(s) {
  s.age++;
  pushYear(s);
  tickPeers(s);
  if (!s.news && R.chance(0.4)) s.news = R.pick(WORLD_NEWS);
  const P = pathOf(s), fam = familyOf(s);
  // รายได้ — บอกที่มาทุกครั้ง
  const famInc = s.bg === 'orphan' ? 0 : Math.round(fam.income * (s.age < 18 ? 0.25 : 0.05));
  const workInc = Math.round((typeof P.inc === 'number' ? P.inc : typeof P.inc === 'string' ? 5 + lvl(s) * parseFloat(P.inc.slice(3)) : 0) * (s.flags.mottoWealth ? 1.25 : 1));
  if (s.age < 6) add(s, 'money', famInc + workInc, true);
  else if (famInc || workInc) {
    const i0 = segStart(s);
    add(s, 'money', famInc + workInc);
    segEnd(s, i0, `💰 รายได้ประจำปี${famInc ? ` · ครอบครัวส่งเสีย ${famInc}` : ''}${workInc ? ` · ${workInc > 0 ? 'จากงาน' : 'ค่าใช้จ่าย'}${P.th}` : ''}`);
  }
  // การเติบโตตามเส้นทาง (ความรู้ ร่างกาย ฯลฯ) และการบำเพ็ญประจำวัน
  const i1 = segStart(s);
  for (const k of ['str', 'agi', 'spi', 'wis', 'luck', 'mood', 'fame']) {
    const v = P[k]; if (!v) continue;
    const n = Math.trunc(v) + (R.chance(Math.abs(v % 1)) ? Math.sign(v) : 0);
    if (n) add(s, k, n);
  }
  cultivate(s, 0.6);
  segEnd(s, i1, `🗓️ หนึ่งปีในฐานะ${P.th}${isCultivator(s) && P.cult ? ' — บำเพ็ญทุกเช้าค่ำ' : ''}`);
  const i2 = segStart(s);
  routeTick(s);
  segEnd(s, i2, '🏪 รายได้จากกิจการและอำนาจของคุณ');
  s.hp = Math.min(maxHp(s), s.hp + Math.round(6 + fam.care * 12 + (s.flags.oscar ? 15 : 0)));
  mortality(s);
}
function mortality(s) {
  const fam = familyOf(s), L = isCultivator(s) ? lvl(s) : 0;
  let p = (s.age < 5 ? 0.04 : s.age < 40 ? 0.02 : 0.02 + (s.age - 40) * 0.002);
  p *= (1.4 - fam.care) * (1 - Math.min(0.7, L / 120)) * (s.place === 'north' ? 1.4 : 1) * (hasDis(s, 'chronic') ? 2 : 1);
  if (R.chance(p)) {
    const ill = R.pick(['ไข้หวัดใหญ่', 'ไข้ป่า', 'โรคปอด', 'ไข้ทรพิษ', 'โรคพิษจากสัตว์วิญญาณ', 'โรคลำไส้']);
    let dmg = R.i(10, 35) * (1.4 - fam.care);
    if (R.chance(0.18 * (1.2 - fam.care))) dmg += R.i(30, 70);
    log(s, `🤒 คุณป่วยเป็น${ill}`, 'bad');
    hurt(s, Math.round(dmg), `ป่วยหนักด้วย${ill}`);
    if (!s.alive) return;
  }
  const ls = lifespan(s);
  if (s.age > ls && R.chance(0.15 + (s.age - ls) * 0.05)) { die(s, 'จากไปอย่างสงบด้วยวัยชรา'); return; }
  if (s.age > ls - 8 && R.chance(0.2)) { log(s, '👴 ร่างกายเริ่มร่วงโรยตามวัย'); add(s, 'hp', -10); }
  if (s.mood < 10 && R.chance(0.15)) { log(s, '🌧️ คุณจมดิ่งในความเศร้าจนล้มป่วย', 'bad'); hurt(s, 15, 'ตรอมใจจนสิ้นใจ'); }
}
// ---------- การไหลของเวลา: 1 ปี = เรื่องราวในคิว + กิจกรรมตามแต้มเวลา ----------
function canEndYear(s) { return s.alive && !s.pending && !s.battle; }
function forcedEvent(s) {
  for (const [id, ev] of Object.entries(EVENTS)) if (ev.forced && ev.when && ev.when(s)) return id;
  if (isBottleneck(s) && s.age > s.huntWait && !s.yearHunt) return 'hunt';
  return null;
}
// แสดงเรื่องถัดไปในปีนี้ (ถ้ามี) — เรียกหลังทุกการเลือก/กิจกรรม
function presentNext(s) {
  if (!s.alive || s.pending || s.battle) return;
  const f = forcedEvent(s);
  if (f) return present(s, f);
  while (s.queue.length) {
    const id = s.queue.shift(), ev = EVENTS[id];
    if (ev && (!ev.cond || ev.cond(s)) && !(ev.once && s.seen[id])) return present(s, id);
  }
}
function storyPool(s) {
  return Object.values(EVENTS).filter(ev => !ev.forced && !ev.canon && !ev.route && ev.age && s.age >= ev.age[0] && s.age <= ev.age[1] && (!ev.once || !s.seen[ev.id]) && (!ev.cond || ev.cond(s)));
}
function canonNews(s) {
  const t = CANON_TIMELINE.filter(c => c.wy === worldYear(s));
  return t.length ? '📜 ' + t.map(c => c.t).join(' · ') : null;
}
// จบปี: ใช้แต้มที่เหลือตามนิสัย → เวลาผ่านไป → เตรียมเรื่องราวของปีใหม่
function endYear(s) {
  if (!canEndYear(s)) return;
  if (s.ap > 0) autoSpend(s);
  if (!canEndYear(s)) return;
  s.prevFeed = s.feed.length ? s.feed : s.prevFeed; s.prevD = s.feedD; s.feed = []; s.news = null;
  const n = 1 + (s.skip || 0); s.skip = 0;
  for (let i = 0; i < n && s.alive; i++) yearTick(s);
  s.boost = 1;
  if (!s.alive) return;
  s.ap = apMax(s); s.done = {}; s.yearHunt = false; s.yearCult = 0;
  const cn = canonNews(s); if (cn) s.news = cn;
  const wy = worldYear(s);
  const ce = Object.values(EVENTS).filter(ev => ev.canon && !s.seen[ev.id] && wy >= ev.wy[0] && wy <= ev.wy[1] && (!ev.age || (s.age >= ev.age[0] && s.age <= ev.age[1])) && (!ev.cond || ev.cond(s)));
  if (ce.length) s.queue.push(R.pick(ce).id);
  routeYear(s);
  questYear(s);
  const pool = storyPool(s);
  if (pool.length && R.chance(s.age < 6 ? 0.7 : 0.75)) s.queue.push(R.wpick(pool, e => typeof e.w === 'function' ? e.w(s) : e.w).id);
  if (pool.length > 1 && s.tend.adv > 3 && R.chance(0.3)) s.queue.push(R.wpick(pool, e => typeof e.w === 'function' ? e.w(s) : e.w).id);
  presentNext(s);
}

function choose(s, k) {
  const p = s.pending;
  if (!p) return;
  const o = p.opts.find(x => x.k === k);
  if (!o || o.lock) return;
  s.pending = null;
  log(s, `▸ คุณเลือก: <b>${o.t}</b>`, 'pick', p.title);
  const seg0 = segStart(s);
  s.lastQ = p.title;
  if (!['shop', 'weaponShop'].includes(p.eid)) (s.picks = s.picks || []).push({ age: s.age, eid: p.eid, q: p.title, a: o.t });
  routeHook(s, p.eid, k);
  if (o.fxa) apply(s, o.fxa);
  if (o.path) setPath(s, o.path);
  if (o.flag) s.flags[o.flag] = true;
  if (o.boost) s.boost = o.boost;
  if (o.say) log(s, o.say, o.sayC || '');
  let won = null;
  if (o.odds != null && (o.win || o.lose)) { won = R.chance(o.odds); outcome(s, won ? o.win : o.lose, won); }
  if (o.risk && s.alive && R.chance(o.risk.p)) outcome(s, { say: '⚠️ เกิดเหตุไม่คาดฝัน!', ...o.risk }, false);
  const fn = s.alive && EVENTS[p.eid].pick && EVENTS[p.eid].pick[k];
  if (fn) fn(s, p.ctx, won);
  const yrs = o.years || p.years;
  if (yrs > 1) { s.skip = (s.skip || 0) + yrs - 1; s.ap = 0; log(s, `⏳ ใช้เวลา ${yrs} ปี`, 'muted'); }
  if (s.alive) { questHook(s, 'event', p.eid); segEnd(s, seg0); }
  presentNext(s);
}
// ผลลัพธ์มาตรฐาน: { fx, say, path, flag, hurt:[a,b], dis(โอกาสพิการ), die(โอกาสตาย), cause }
function outcome(s, r, ok) {
  if (!r) return;
  if (r.say) log(s, r.say, ok ? 'good' : 'bad');
  apply(s, r.fx);
  if (r.path) setPath(s, r.path);
  if (r.flag) s.flags[r.flag] = true;
  if (r.die && R.chance(r.die)) { die(s, r.cause || 'เสียชีวิตจากเหตุไม่คาดฝัน'); return; }
  if (r.hurt) hurt(s, R.i(r.hurt[0], r.hurt[1]), r.cause || 'บาดเจ็บสาหัส');
  if (s.alive && r.dis && R.chance(r.dis)) randomDisability(s);
}

function startLife(s) { s.ap = apMax(s); present(s, 'zhuazhou'); }
