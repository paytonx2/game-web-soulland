// ============================================================
// UI — ซ้าย: ข้อมูลตัวละครทั้งหมด / กลาง: ฉาก + เส้นเวลา / ขวา: ทางแยกของชีวิต
// ชีวิตเดินด้วยการเลือกเท่านั้น (กดเลข 1–9 ได้)
// ============================================================
const $ = id => document.getElementById(id);
const SAVE_KEY = 'douluo_life_save_v4', GRAVE_KEY = 'douluo_life_graves_v1';
let S = null, lastFx = [], actCat = 'all', playing = true, speed = 1, waited = 0;
const YEAR_MS = 14000, IDLE_MS = 3500;

const IC = { hp:'❤️', soul:'🌀', cp:'⚔️', str:'💪', agi:'💨', spi:'🧠', wis:'📖', luck:'🍀', fame:'🏅', mood:'😊', money:'💰', life:'⏳' };
const COL = { hp:'#e2574c', soul:'#6aa8ff', str:'#f08a4b', agi:'#6fd08c', spi:'#b48cff', wis:'#5ad1d1', luck:'#9be37a', fame:'#f2c14e', mood:'#ffd98a', money:'#f2c14e' };
const TIER_COL = { 1:'#b9b0a2', 2:'#8fd0ff', 3:'#7ee3a6', 4:'#c79bff', 5:'#ffcf5a' };
const CLOTH = ['#6b4f33', '#5a6a4a', '#3a5f9a', '#7a2a3a', '#2a4a6a', '#e9e4d8'];
const TOD_TH = { dawn:'รุ่งอรุณ', day:'กลางวัน', dusk:'ยามเย็น', night:'ยามค่ำคืน' };
const KIND_TH = { home:'บ้าน', village:'หมู่บ้าน', city:'ในเมือง', temple:'ตำหนัก', academy:'สถาบันวิญญาจารย์', forge:'โรงตีเหล็ก', forest:'ป่าลึก', hunt:'ป่าดาวซิงโต่ว', raid:'หมู่บ้านลุกเป็นไฟ', road:'เส้นทางเปลี่ยว', night:'ใต้แสงจันทร์', war:'สนามรบ', garden:'สวนท้อ', wedding:'งานมงคล', arena:'สนามประลอง', killing:'เมืองสังหาร', sea:'ทะเลเทพสมุทร', grave:'สุสาน', awaken:'พิธีปลุกวิญญาณยุทธ์' };
const CITY_PLACES = ['nuoding', 'suotuo', 'tiandou', 'xingluo', 'wuhun', 'gengxin', 'leiting'];

// ---------- คำบรรยายค่าสถานะ ----------
const lvlWord = (v, words, cuts) => { const i = cuts.findIndex(c => v < c); return words[i === -1 ? words.length - 1 : i]; };
function describe(k, s) {
  const v = s[k];
  switch (k) {
    case 'hp': return lvlWord(s.hp / maxHp(s) * 100, ['ใกล้ตาย', 'ร่อแร่', 'ออด ๆ แอด ๆ', 'ปกติ', 'แข็งแรงดี'], [10, 30, 55, 80]);
    case 'mood': return lvlWord(v, ['ทุกข์ระทม', 'เหนื่อยใจ', 'เฉย ๆ', 'แจ่มใส', 'สุขล้น'], [20, 40, 60, 80]);
    case 'str': return lvlWord(v, ['อ่อนแอ', 'ธรรมดา', 'แข็งแรง', 'ทรงพลัง', 'พละกำลังเทพ'], [15, 35, 60, 85]);
    case 'agi': return lvlWord(v, ['เชื่องช้า', 'ปกติ', 'คล่องแคล่ว', 'ปราดเปรียว', 'ดั่งสายลม'], [15, 35, 60, 85]);
    case 'spi': return lvlWord(v, ['จิตอ่อน', 'ปกติ', 'จิตมั่นคง', 'จิตแกร่ง', 'จิตดั่งเหล็กกล้า'], [15, 35, 60, 85]);
    case 'wis': return lvlWord(v, ['ไม่รู้หนังสือ', 'อ่านออกเขียนได้', 'มีความรู้', 'รอบรู้ทฤษฎี', 'ปราชญ์'], [10, 25, 45, 70]);
    case 'luck': return lvlWord(v, ['ดวงซวย', 'ดวงธรรมดา', 'ดวงดี', 'ดวงเฮง', 'โชคฟ้าประทาน'], [20, 45, 65, 85]);
    case 'fame': return lvlWord(v, ['ไม่มีใครรู้จัก', 'คนในละแวกรู้จัก', 'มีชื่อในเมือง', 'โด่งดังทั่วจักรวรรดิ', 'ระบือทั่วทวีป'], [5, 20, 60, 150]);
    case 'money': return lvlWord(v, ['ยากจน', 'พอกิน', 'มีอันจะกิน', 'ร่ำรวย', 'มั่งคั่งมหาศาล'], [5, 30, 150, 600]);
  }
  return '';
}
const STAT_HELP = {
  hp:'ต่ำเกินไปจะป่วยตายง่าย', soul:'บำเพ็ญทุกปีตามเส้นทางชีวิต ทุก 10 ระดับต้องล่าวงแหวน', str:'การโจมตีสายพลัง · รับวงแหวนอายุสูงได้', agi:'หลบหลีก · วิ่งหนี · โจมตีสายว่องไว',
  spi:'พลังวิญญาณในการต่อสู้ · ต้านพิษ', wis:'บำเพ็ญเร็วขึ้น · 35+ ประเมินขีดจำกัดวงแหวนได้', luck:'พบของวิเศษ · รอดตาย',
  mood:'ทุกข์มากบำเพ็ญช้า ป่วยง่าย', fame:'ยิ่งดังยิ่งถูกจ้องลอบสังหาร', money:'จ้างทีมคุ้มกัน รักษาตัว ค่าเล่าเรียน',
};
function pathFx(P) {
  const parts = [];
  if (P.cult) parts.push(`บำเพ็ญ ×${P.cult}`);
  for (const k of ['wis', 'str', 'agi', 'spi', 'luck', 'fame', 'mood']) if (P[k]) parts.push(`${IC[k]}${P[k] > 0 ? '+' : ''}${P[k]}/ปี`);
  if (P.inc) parts.push(`💰${typeof P.inc === 'number' ? (P.inc > 0 ? '+' : '') + P.inc : '+ตามระดับ'}/ปี`);
  return parts.join(' · ');
}

// ---------- บันทึก ----------
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } }
function graves() { try { return JSON.parse(localStorage.getItem(GRAVE_KEY)) || []; } catch (e) { return []; } }
function addGrave(s) {
  const g = graves();
  if (g.find(x => x.id === s.id)) return;
  g.unshift({ id: s.id, name: s.name, zh: s.zh, age: s.age, cause: s.cause, level: lvl(s), rings: s.rings.length, soul: s.awakened ? s.souls.map(x => SOUL_BY_ID[x].th).join(' + ') : '—', title: s.title, ascended: !!s.ascended, path: PATHS[s.path].th, story: lifeStory(s).plain, score: lifeScore(s) });
  try { localStorage.setItem(GRAVE_KEY, JSON.stringify(g.slice(0, 40))); } catch (e) {}
}

// ---------- ทำงานแล้ววาดใหม่ ----------
function run(fn) {
  const feedBefore = S.feed;
  S._delta = [];
  fn();
  const agg = {};
  for (const [k, n] of S._delta) agg[k] = (agg[k] || 0) + n;
  delete S._delta;
  if (S.feed !== feedBefore) S.feedD = {};
  for (const k in agg) S.feedD[k] = (S.feedD[k] || 0) + agg[k];
  lastFx = Object.entries(agg).filter(([, n]) => Math.round(n));
  save(); render();
  waited = 0;
  // มีเรื่องให้ตัดสินใจใหม่ แต่กล่องตัวเลือกอยู่นอกจอ → เลื่อนให้เห็น
  if ((S.pending || S.battle || S.hunt) && isMobile() && mtab !== 'play') setTab('play');
  if ((S.pending || S.battle || S.hunt) && !$('game').hidden) { const r = $('eventBox').getBoundingClientRect(); if (r.top > innerHeight - 120 || r.bottom < 80) $('eventBox').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (!S.alive) { addGrave(S); setTimeout(showTomb, 1600); }
}
function pickOpt(k) { run(() => choose(S, k)); }

// ---------- ข้อมูลฉาก ----------
function heroSpec(s) {
  return {
    age: s.age, gender: s.gender, cloth: s.path === 'evil' ? '#3a1020' : CLOTH[s.familyTier - 1], accent: s.familyTier >= 6 ? '#d4b25a' : '#e3b45c',
    rings: s.rings.map(r => RING_TIERS[ringTierOf(r.years)].color),
    aura: isCultivator(s) ? TIER_COL[soulOf(s).tier] : null,
  };
}
function sceneSpec(s) {
  const seed = hash(s.id) + s.age * 17;
  const spec = { seed, tod: ['dawn', 'day', 'day', 'dusk', 'night', 'day'][seed % 6], place: s.place, hero: heroSpec(s) };
  if (!s.alive) return { ...spec, kind: s.ascended ? 'sea' : 'grave', tod: 'dusk' };
  if (s.hunt) return { ...spec, kind: 'hunt', tod: 'dusk' };
  if (s.battle) {
    const b = s.battle;
    spec.kind = { bandits:'road', assassin:'night', killingCity:'killing', evilMaster:'night', bully:'academy', darkInvite:'night', mercJob:'road' }[b.eid] || 'arena';
    if (spec.kind === 'night') spec.tod = 'night';
    spec.foe = { age: 25, gender: b.foe.name.length % 2 ? 'M' : 'F', cloth: '#6a2a2a', rings: b.foe.rings.map(y => RING_TIERS[ringTierOf(y)].color), aura: TIER_COL[SOUL_BY_ID[b.foe.soul].tier] };
    return spec;
  }
  const p = s.pending;
  let kind = p && p.scene;
  if (!kind) {
    const city = CITY_PLACES.includes(s.place);
    kind = s.age < 6 ? (city ? 'city' : 'home') : { elem:'academy', work:'academy', clan:'temple', shrek:'academy', royal:'academy', wuhunac:'temple', mid:'academy', sect:'temple', wuhun:'temple', army:'war', guard:'city', teacher:'academy', elder:'temple', merc:'road', wander:'road', hermit:'forest', evil:'night', merchant:'city', smith:'forge', farmer:'village', trader:'road' }[s.path] || (city ? 'city' : 'village');
  }
  spec.kind = kind;
  if (kind === 'night') spec.tod = 'night';
  if (kind === 'home' && s.age < 8) spec.family = true;
  if (['garden', 'wedding'].includes(kind) || (s.flags.married && s.partner && s.age % 3 === 0 && kind !== 'hunt')) spec.partner = { age: Math.max(16, s.age), gender: s.gender === 'M' ? 'F' : 'M', cloth: '#a8436a' };
  return spec;
}

// ---------- ชิป ----------
function chip(k, n) {
  const ic = IC[k] || '';
  if (typeof n === 'string') return `<span class="c nt">${ic} ${n}</span>`;
  const r = Math.round(n);
  if (!r) return '';
  return `<span class="c ${r > 0 ? 'up' : 'dn'}">${ic} ${r > 0 ? '+' : '−'}${fmt(Math.abs(r))}</span>`;
}
const chips = fx => (fx || []).map(([k, n]) => chip(k, n)).join('');

// ---------- วาดทั้งหมด ----------
function render() { renderTop(); renderLeft(); renderScene(); renderStory(); renderEvent(); }

function renderTop() {
  const s = S;
  $('tbName').innerHTML = `${s.name}<small>อายุ ${s.age} ปี · ปีทวีป ${WORLD_EPOCH + worldYear(s)}</small>`;
  renderTime();
  const items = [['hp', Math.max(0, Math.round(s.hp)), s.hp / maxHp(s) * 100], ['soul', isCultivator(s) ? lvl(s) : '—', s.level], ['str', s.str, s.str], ['agi', s.agi, s.agi], ['spi', s.spi, s.spi], ['wis', s.wis, s.wis], ['mood', s.mood, s.mood], ['luck', s.luck, s.luck], ['fame', fmt(s.fame), Math.min(100, s.fame / 3)]];
  $('tbStats').innerHTML = items.map(([k, v, p]) => `<span class="tbs" title="${STAT_TH[k]}"><i>${IC[k]}</i><span class="mini" style="--c:${COL[k]}"><b style="width:${clamp(p, 0, 100)}%"></b></span>${v}</span>`).join('') + `<span class="tbs" title="เหรียญทองวิญญาณ"><i>💰</i>${fmt(s.money)}</span>`;
}

function renderLeft() {
  const s = S, fam = familyOf(s), place = placeOf(s), clan = clanOf(s), P = pathOf(s), d = s.feedD || {};
  const badge = k => { const n = Math.round(d[k] || 0); return n ? `<span class="dl ${n > 0 ? 'up' : 'dn'}">${n > 0 ? '+' : ''}${n}</span>` : ''; };
  const row = (k, label, val, p, desc) => `<div class="st" title="${STAT_HELP[k] || ''}"><span class="ic">${IC[k]}</span><span class="lb">${label}</span><span class="vl">${badge(k)}${val}</span>${p == null ? '' : `<span class="br" style="--c:${COL[k]}"><b style="width:${clamp(p, 0, 100)}%"></b></span>`}<span class="ds">${desc}</span></div>`;
  const rank = rankOf(isCultivator(s) ? lvl(s) : 0);

  let soul;
  if (!s.awakened) soul = `<div class="note">❔ ยังไม่ถูกปลุก — พิธีปลุกเมื่ออายุ 6 ปี${clan ? `<br>สายเลือดตระกูล: ${SOUL_BY_ID[clan.soul].th}` : ''}</div>`;
  else {
    soul = s.souls.map((id, i) => { const x = SOUL_BY_ID[id], T = TIER_INFO[x.tier]; return `<div class="sn ${T.cls}">${i ? '🌟 ' : ''}${x.th} <span class="zh">${x.zh}</span></div><div class="note">${TYPE_TH[x.type]} · ${T.th} · ${ROLE_TH[x.role]}</div>`; }).join('');
    if ((s.mutations || []).length) soul += `<div class="mutlog">${s.mutations.map(m => `<div class="mu ${m.kind}">🧬 อายุ ${m.age}: ${MUT_KIND_TH[m.kind]} — ${m.from} → <b>${m.to}</b></div>`).join('')}</div>`;
    soul += `<div class="kv"><span class="k">พลังแต่กำเนิด</span><span class="v">${s.innate ? `ระดับ ${s.innate}${s.innate === 10 ? ' 🔥' : ''}` : 'ไม่มี'}</span><span class="k">ขั้นพลัง</span><span class="v">${rank.th} <span class="zh">${rank.zh}</span></span></div>`;
    if (isCultivator(s)) soul += `<div class="rings">${Array.from({ length: 9 }, (_, i) => { const r = s.rings[i]; if (!r) return `<div class="rr e"><span class="orb empty">${i + 1}</span><small>ระดับ ${(i + 1) * 10}</small></div>`; const rt = RING_TIERS[ringTierOf(r.years)]; return `<div class="rr" title="${r.beast || ''}"><span class="orb" style="--rc:${rt.color}">${i + 1}</span><span><b>${fmt(r.years)} ปี</b> ${r.compat ? '✨' : ''}<small>「${r.skill}」${r.beast ? ' · ' + r.beast : ''}</small></span></div>`; }).join('')}</div>`;
  }
  const BLESS = {
    herb:'🌺 ชำระร่างด้วยสมุนไพรเซียน', iceFire:'☯️ ตาน้ำหยินหยางน้ำแข็งเพลิง', killing:'🩸 อาณาเขตสังหาร (+12% ต่อสู้)', hiddenWeapon:'📕 อาวุธลับสำนักถัง (+8% ต่อสู้)', chaosHammer:'⚒️ วิชาค้อนโกลาหล',
    genius:'🔥 อัจฉริยะพลังเต็มขั้น', redBeast:'🐉 รู้แหล่งสัตว์หมื่นปี/แสนปี', hunted:'👁️ ถูกเพ่งเล็ง (เสี่ยงลอบสังหาร)', wuhunTie:'⛪ ผูกพันตำหนักวิญญาณยุทธ์', blessed:'✨ พรจากขอทานลึกลับ',
    beastFriend:'🐾 มีสหายสัตว์วิญญาณ', team:'👥 มีทีมวิญญาจารย์', seaIsle:'🔱 เคยเหยียบเกาะเทพสมุทร', darkSeed:'🌑 เมล็ดพันธุ์แห่งความมืดในใจ', ancientLore:'📜 ความรู้จารึกโบราณ', secretManual:'📘 ตำราลับห้องสมุด',
  };
  const blessings = Object.keys(BLESS).filter(k => s.flags[k]).map(k => `<span class="chip">${BLESS[k]}</span>`).join('');
  const god = s.god ? GODS.find(g => g.id === s.god.id) : null;

  $('left').innerHTML = `
    <div class="idcard"><canvas id="portrait" width="28" height="32"></canvas>
      <div><div class="nm">${s.name}</div><div class="zh">${s.zh}</div><div class="sub">${s.gender === 'M' ? '♂ ชาย' : '♀ หญิง'} · อายุ ${s.age} ปี · ${lifeStage(s.age)}</div></div>
      <div class="idmeta"><span class="k">บ้านเกิด</span><span>${place.th}</span><span class="k">ภูมิหลัง</span><span>${bgOf(s).th}${clan ? ` · ${clan.th}` : ''}</span>${s.title ? `<span class="k">ฉายา</span><span class="gold">👑 ${s.title}</span>` : ''}</div>
      <div class="rankbox"><span class="k">ฐานะ</span> <span class="dia">${'◆'.repeat(s.familyTier)}${'◇'.repeat(6 - s.familyTier)}</span> <span class="v">${fam.th}</span></div>
    </div>
    <section class="lsec"><h4>🧭 เส้นทางชีวิต</h4><div class="pathname">${P.th}${s.sect ? ` · ${(SECTS.find(x => x.id === s.sect) || { th: 'สำนักถัง (唐门)' }).th}` : ''}</div><div class="note">${pathFx(P) || '—'}</div>${god ? `<div class="godbar">⚜️ บททดสอบ${god.th} ${s.god.stage}/7</div>` : ''}</section>
    <section class="lsec"><h4>🧬 แนวทางชีวิต <small>(ระบบประเมินจากการเลือกของคุณ)</small></h4>${tendHtml(s)}</section>
    <section class="lsec"><h4>📊 สถานะชีวิต</h4><div class="stgrid">
      ${row('money', 'เงินทอง', fmt(s.money), null, describe('money', s))}
      ${row('hp', 'สุขภาพ', `${Math.max(0, Math.round(s.hp))}/${maxHp(s)}`, s.hp / maxHp(s) * 100, describe('hp', s))}
      ${row('soul', 'พลังวิญญาณ', isCultivator(s) ? `Lv.${lvl(s)}` : '—', isCultivator(s) ? s.level / 99 * 100 : 0, isCultivator(s) ? `${rank.th}${isBottleneck(s) ? ' · ⛓️ ติดคอขวด' : ''}` : s.awakened ? 'ไม่มีพลังวิญญาณ' : 'รอพิธีปลุก')}
      ${row('mood', 'อารมณ์', s.mood, s.mood, describe('mood', s))}
      ${row('str', 'พละกำลัง', s.str, s.str, describe('str', s))}
      ${row('agi', 'ความว่องไว', s.agi, s.agi, describe('agi', s))}
      ${row('spi', 'พลังจิต', s.spi, s.spi, describe('spi', s))}
      ${row('wis', 'ปัญญา', s.wis, s.wis, describe('wis', s))}
      ${row('luck', 'โชค', s.luck, s.luck, describe('luck', s))}
      ${row('fame', 'ชื่อเสียง', fmt(s.fame), Math.min(100, s.fame / 3), describe('fame', s))}
      <div class="st"><span class="ic">⚔️</span><span class="lb">พลังต่อสู้</span><span class="vl">${fmt(combatPower(s))}</span></div>
      <div class="st"><span class="ic">⏳</span><span class="lb">อายุขัยโดยประมาณ</span><span class="vl">~${Math.round(lifespan(s))}</span></div>
    </div></section>
    <section class="lsec"><h4>🐉 วิญญาณยุทธ์ & วงแหวน</h4>${soul}</section>
    ${Object.keys(s.arts).length || s.weapons.length || s.flags.fusion || s.arenaBadge ? `<section class="lsec"><h4>📕 วิชาและอาวุธลับ</h4>${Object.keys(s.arts).map(k => `<div class="note">📕 ${TANG_ARTS[k].th}</div>`).join('')}${s.weapons.map(id => `<div class="note">🏹 ${HIDDEN_WEAPONS.find(w => w.id === id).th}</div>`).join('')}${s.flags.fusion ? `<div class="note">💫 ${s.flags.fusion}</div>` : ''}${s.arenaBadge ? `<div class="note">🏅 ${s.arenaBadge} (ชนะ ${s.arenaWins})</div>` : ''}</section>` : ''}
    ${s.bones.length ? `<section class="lsec"><h4>🦴 กระดูกวิญญาณ</h4>${s.bones.map(b => { const p = BONE_PARTS.find(x => x.id === b.part); return `<div class="note">${p.th} · ${fmt(b.years)} ปี</div>`; }).join('')}</section>` : ''}
    <section class="lsec"><h4>🩹 ร่างกาย</h4>${s.disabilities.length ? s.disabilities.map(x => `<div class="note bad">♿ ${DISABILITIES[x].th} — ${DISABILITIES[x].desc}</div>`).join('') : '<div class="note">ร่างกายสมบูรณ์</div>'}${blessings ? `<div class="chipsw">${blessings}</div>` : ''}</section>
    <section class="lsec"><h4>👥 ความสัมพันธ์</h4><div class="kv">
      <span class="k">อาจารย์</span><span class="v">${s.mentor || '—'}</span>
      <span class="k">เพื่อนสนิท</span><span class="v">${s.friend || '—'}</span>
      <span class="k">คู่ครอง</span><span class="v">${s.partner ? s.partner + (s.flags.married ? ' (สมรส)' : '') : '—'}</span>
      <span class="k">บุตร</span><span class="v">${s.children || '—'}</span>
      ${s.disciple ? `<span class="k">ศิษย์</span><span class="v">${s.disciple}</span>` : ''}
    </div></section>`;
  drawFigure($('portrait'), { ...heroSpec(s), rings: [], aura: null }, '#1a1917', 2);
}

function tendHtml(s) {
  const tot = Object.values(s.tend || {}).reduce((a, b) => a + b, 0);
  const top = topTendency(s);
  if (!tot) return '<div class="note">ยังประเมินไม่ได้ — เลือกทำกิจกรรมแล้วระบบจะเรียนรู้นิสัยของคุณ</div>';
  const rows = Object.entries(s.tend).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `<div class="tend"><span>${TENDENCIES[k].icon} ${TENDENCIES[k].th}</span><span class="tbar"><b style="width:${v / tot * 100}%"></b></span></div>`).join('');
  return `${top ? `<div class="pathname">${TENDENCIES[top].icon} ${TENDENCIES[top].th}</div>` : ''}${rows}<div class="note">แต้มเวลาที่เหลือตอนจบปี ระบบจะใช้แทนตามนิสัยนี้</div>`;
}

// ---------- กิจกรรมในปีนี้ ----------
function renderActs() {
  const s = S, el = $('actBox');
  if (!el) return;
  const list = availableActs(s);
  const cats = ['all', ...Object.keys(ACT_CATS).filter(c => list.some(x => x.a.cat === c))];
  if (!cats.includes(actCat)) actCat = 'all';
  const shown = list.filter(x => actCat === 'all' || x.a.cat === actCat);
  const busy = s.pending || s.battle;
  const pips = Array.from({ length: apMax(s) }, (_, i) => `<i class="${i < s.ap ? 'on' : ''}"></i>`).join('');
  el.innerHTML = `<div class="acts-head"><h3>📅 ปีนี้ทำอะไรดี? <small>อายุ ${s.age} ปี · ปีทวีป ${WORLD_EPOCH + worldYear(s)}</small></h3><div class="ap" title="แต้มเวลาในปีนี้">⏳ แต้มเวลา <span class="pips">${pips}</span> ${s.ap}/${apMax(s)}</div></div>
    <div class="cats">${cats.map(c => `<button class="cat ${c === actCat ? 'on' : ''}" data-cat="${c}">${c === 'all' ? '✨ ทั้งหมด' : ACT_CATS[c]}</button>`).join('')}</div>
    <div class="actgrid">${shown.map(x => actCard(s, x)).join('') || '<div class="note">ไม่มีกิจกรรมในหมวดนี้</div>'}</div>
    <div class="nextrow"><button class="pbtn next" id="btnNextYear" ${busy ? 'disabled' : ''}>ใช้ชีวิตปีถัดไป ⏭ <small>(Enter)</small></button>
      <div class="countdown" title="เวลาเดินอัตโนมัติ"><b id="cdBar"></b><span id="cdText"></span></div></div>`;
}
function actCard(s, x) {
  const a = x.a, fx = a.fx ? a.fx(s) : [];
  const odds = a.odds ? a.odds(s) : null, danger = a.danger ? a.danger(s) : null;
  const side = danger ? `<span class="risk">☠️ ${(danger * 100).toFixed(danger < 0.01 ? 1 : 0)}%</span>` : odds != null ? `<span class="okp">🎲 ${Math.round(odds * 100)}%</span>` : '';
  return `<button class="actc ${x.lock ? 'locked' : ''} ${a.secret ? 'secret' : ''}" data-act="${a.id}" ${x.lock ? 'disabled' : ''} title="${a.d}${x.lock ? ' — 🔒 ' + x.lock : ''}">
    <span class="ai">${a.icon}</span><span class="ab">${a.secret ? '<span class="stag">✨ ทางลับ · โชคของคุณเปิดทางนี้</span>' : ''}<b>${a.t}</b><small>${a.d}</small>${fx.length ? `<span class="chips">${chips(fx)}</span>` : ''}${x.lock ? `<span class="lock">🔒 ${x.lock}</span>` : ''}</span>
    <span class="aside">${a.ap ? `<span class="cost">⏳${a.ap}</span>` : '<span class="cost free">ฟรี</span>'}${a.rep > 1 && a.rep < 9 ? `<span class="rep">${x.used}/${a.rep}</span>` : ''}${side}</span></button>`;
}

// ---------- เวลาเดินอัตโนมัติ ----------
function renderTime() {
  $('btnPlay').textContent = playing ? '⏸' : '▶';
  $('btnPlay').classList.toggle('on', !playing);
  document.querySelectorAll('.spd').forEach(b => b.classList.toggle('on', +b.dataset.spd === speed && playing));
}
function timerWait() { return (S.ap > 0 ? YEAR_MS : IDLE_MS) / speed; }
function tick() {
  if (!S || $('game').hidden) return;
  const live = S.alive && playing && !S.pending && !S.battle && !S.hunt && $('overlay').hidden;
  if (live) waited += 250;
  const w = timerWait(), bar = $('cdBar'), txt = $('cdText');
  if (bar) {
    bar.style.width = (live ? Math.min(100, waited / w * 100) : 0) + '%';
    txt.textContent = !S.alive ? '' : !playing ? '⏸ หยุดเวลาอยู่' : (S.pending || S.battle) ? 'รอการตัดสินใจ' : `ปีถัดไปใน ${Math.max(0, Math.ceil((w - waited) / 1000))} วิ`;
  }
  if (live && waited >= w) nextYearNow();
}
function nextYearNow() { if (S && canEndYear(S)) run(() => endYear(S)); waited = 0; }

function renderScene() {
  const spec = sceneSpec(S);
  drawScene($('scene'), spec);
  $('sceneCap').textContent = `${TOD_TH[spec.tod] || ''} · ${KIND_TH[spec.kind] || ''} · ${placeOf(S).th}`;
  $('sceneFx').innerHTML = lastFx.slice(0, 6).map(([k, n]) => `<span class="fx ${n > 0 ? 'up' : 'dn'}">${IC[k] || ''} ${n > 0 ? '+' : '−'}${fmt(Math.abs(n))}</span>`).join('');
  lastFx = [];
}

function yearTone(y) {
  const cs = y.lines.map(l => l.c);
  if (cs.includes('death')) return 'death';
  if (cs.includes('gold')) return 'gold';
  const bad = cs.filter(c => c === 'bad').length, good = cs.filter(c => c === 'good').length;
  return bad > good ? 'bad' : good ? 'good' : 'calm';
}
function lifeMapHtml(s) {
  const tone = {};
  s.log.forEach(y => tone[y.age] = yearTone(y));
  return `<div class="lifemap">${Array.from({ length: 100 }, (_, i) => `<i class="${tone[i] || ''} ${i === s.age && s.alive ? 'now' : ''}" title="อายุ ${i}"></i>`).join('')}</div>`;
}
function renderStory() {
  const s = S;
  const peer = p => {
    const soul = s.age >= 6 ? SOUL_BY_ID[p.soul] : null;
    const st = !p.alive ? `☠️ ${p.cause} (อายุ ${p.deathAge})` : s.age < 6 ? `${lifeStage(s.age)} · ${PLACES.find(x => x.id === p.place).th}` : p.innate ? `Lv.${Math.floor(p.level)} · ${soul.th} · วงแหวน ${p.rings}` : `คนธรรมดา · ${soul.th}`;
    return `<div class="peer ${p.alive ? '' : 'dead'}"><b>${p.name}</b> ${p.g === 'M' ? '♂' : '♀'}<small>${st}</small></div>`;
  };
  const d = s.feedD || {}, sum = Object.entries(d).map(([k, n]) => chip(k, n)).join('');
  $('storyBox').innerHTML = `<div class="yhead"><div class="yage"><b>${s.age}</b><small>ปี</small></div><div class="yt"><b>เรื่องราวปีนี้</b><small>${lifeStage(s.age)} · ${pathOf(s).th} · ปีทวีป ${WORLD_EPOCH + worldYear(s)}</small></div></div>
    ${s.news ? `<div class="news"><span class="tag">ข่าวทวีป</span><span>${s.news}</span></div>` : ''}
    <div class="entries" id="entries">${feedHtml(s) || '<div class="entry calm empty"><div class="eh"><span class="ek">ต้นปี</span><b>ปีใหม่เริ่มต้นขึ้น</b></div><div class="eb"><p class="flav">ยังไม่มีเรื่องราว — เลือกสิ่งที่จะทำตรงกลาง แล้วเรื่องราวของคุณจะถูกบันทึกที่นี่</p></div></div>'}</div>
    ${sum ? `<div class="ysum"><span>รวมผลทั้งปี</span><div class="chips">${sum}</div></div>` : ''}
    ${questBoxHtml(s)}
    <details class="peersbox"><summary>👥 คนที่เกิดปีเดียวกับคุณ (${s.peers.filter(p => p.alive).length}/${s.peers.length} ยังมีชีวิต)</summary><div class="peers">${s.peers.map(peer).join('')}</div></details>`;
  const en = $('entries'); if (en) en.scrollTop = en.scrollHeight;
  const cards = $('storyBox').querySelectorAll('#entries > .entry');
  $('mLast').innerHTML = cards.length && s.feed && s.feed.length ? cards[cards.length - 1].outerHTML + '<button class="mmore" data-goto="story">📖 อ่านเรื่องราวทั้งปี</button>' : '';
  const n = (s.feed || []).length;
  if (n > storyLen && mtab !== 'story') $('mtStory').classList.add('dot');
  storyLen = n;
}

// ---------- กล่องทางแยกของชีวิต ----------
let keyMap = [];
// หนึ่งบรรทัดของบันทึก: แถวชิป = ผลที่ได้จากสาเหตุก่อนหน้า
function lineHtml(l) {
  if (l.c === 'chips') return Array.isArray(l.d) ? `<div class="chips seg">${chips(l.d)}</div>` : '';
  return `<p class="${l.c}">${l.t}</p>`;
}
// แบ่งบันทึกของปีเป็น "ตอน": ทุกกิจกรรม/ทุกการตัดสินใจเริ่มตอนใหม่ พร้อมเหตุผลและผลลัพธ์ของมัน
function storyEntries(feed) {
  const out = []; let cur = null;
  for (const l of feed) {
    const head = l.c === 'act' || l.c === 'pick';
    if (head || !cur || cur.age !== l.age) {
      cur = { age: l.age, head: head ? l : null, lines: [] }; out.push(cur);
      if (head) continue;
    }
    cur.lines.push(l);
  }
  return out;
}
function entryHtml(e, i, isNew, first) {
  const tone = yearTone(e), h = e.head;
  let head;
  if (h && h.c === 'pick') head = `<div class="eh"><span class="ek">ทางแยก</span><b>${h.d || 'การตัดสินใจ'}</b></div><div class="es">${h.t.replace('▸ ', '')}</div>`;
  else if (h) head = `<div class="eh"><span class="ek">${h.t.startsWith('🤖') ? 'ทำตามนิสัย' : 'กิจกรรม'}</span><b>${h.t.replace('🤖 ', '')}</b></div>`;
  else head = `<div class="eh"><span class="ek">${first ? 'ต้นปี' : 'ชีวิตดำเนินไป'}</span><b>${first ? `เข้าสู่อายุ ${e.age} ปี` : `อายุ ${e.age} ปี`}</b></div>`;
  const body = e.lines.map(lineHtml).join('');
  return `<article class="entry ${tone} ${isNew ? 'new' : ''}">${head}${body ? `<div class="eb">${body}</div>` : ''}</article>`;
}
let shownFeed = 0;
function feedHtml(s) {
  let prev = '';
  if (s.prevFeed && s.prevFeed.length) prev = `<details class="prev"><summary>📜 ย้อนดูปีที่แล้ว (อายุ ${s.prevFeed[0].age} ปี)</summary>${storyEntries(s.prevFeed).map((e, i) => entryHtml(e, i, false, i === 0)).join('')}</details>`;
  if (!s.feed || !s.feed.length) { shownFeed = 0; return prev; }
  const es = storyEntries(s.feed), grew = s.feed.length > shownFeed;
  shownFeed = s.feed.length;
  return prev + es.map((e, i) => entryHtml(e, i, grew && i === es.length - 1, i === 0)).join('');
}
// ภารกิจที่กำลังทำ
function questBoxHtml(s) {
  const qs = s.quests || [];
  if (!qs.length) return '';
  return `<div class="quests"><div class="qhead">📜 ภารกิจที่รับไว้</div>${qs.map(a => {
    const q = QUESTS[a.id], left = a.until - s.age;
    const tag = a.finale ? '<span class="qleft go">⚔️ พร้อมปะทะ</span>' : `<span class="qleft ${left <= 1 ? 'urg' : ''}">เหลือ ${Math.max(0, left)} ปี</span>`;
    const bar = q.steps > 1 ? `<div class="qbar"><b style="width:${a.prog / q.steps * 100}%"></b></div><small>${a.prog}/${q.steps}</small>` : '';
    return `<div class="qcard"><div class="qt">${q.icon} <b>${q.th}</b>${tag}</div><div class="qd">🎯 ${q.hint}</div>${bar ? `<div class="qprog">${bar}</div>` : ''}</div>`;
  }).join('')}</div>`;
}
function optHtml(c, i) {
  const rt = c.ring ? RING_TIERS.find(r => r.id === c.ring) : null;
  let side = '';
  if (c.unknown) side = '<div class="side risk">เสี่ยงตาย<b>???</b></div>';
  else if (c.danger) side = `<div class="side ${c.danger > 0.25 ? 'dead' : 'risk'}">เสี่ยงตาย<b>${Math.max(1, Math.round(c.danger * 100))}%</b></div>`;
  else if (c.odds != null) side = `<div class="side ${c.odds >= 0.6 ? 'ok' : 'risk'}">สำเร็จ<b>${Math.round(c.odds * 100)}%</b></div>`;
  const extra = c.danger && c.odds != null ? `<div class="odds">🎲 โอกาสสำเร็จ ~${Math.round(c.odds * 100)}%</div>` : '';
  const fx = [...(c.fx || c.fxa || [])];
  if (c.path) fx.push(['', `🧭 ${PATHS[c.path].th}`]);
  if (c.boost) fx.push(['soul', `×${c.boost} ช่วงนี้`]);
  if (c.years > 1) fx.push(['', `⏳ ${c.years} ปี`]);
  return `<button class="opt ${c.secret ? 'secret' : ''}" data-k="${i}" ${c.lock ? 'disabled' : ''}><span class="num">${i + 1}</span><span>${c.secret ? '<span class="stag">✨ ทางลับ</span>' : ''}<span class="tt">${rt ? `<span class="rdot" style="background:${rt.color}"></span>` : ''}${c.t}</span>${c.d ? `<div class="dd">${c.d}</div>` : ''}${c.lock ? `<div class="lock">🔒 ${c.lock}</div>` : ''}${fx.length ? `<div class="chips">${chips(fx)}</div>` : ''}${extra}</span>${side}</button>`;
}
function renderEvent() {
  const s = S;
  keyMap = [];
  let h = `<div class="ev-head"><b>${s.hunt ? 'ล่าวงแหวน' : s.battle ? 'การประลอง' : s.pending ? 'ทางแยกของชีวิต' : 'ปีนี้'}</b>${lifeStage(s.age)} · อายุ ${s.age} ปี</div>`;
  if (s.hunt) h += huntGameHtml(s.hunt);
  else if (s.battle) h += battleHtml(s.battle);
  else if (s.pending) {
    const p = s.pending;
    h += `<div class="q-title"><span class="bolt">⚡</span>${p.title}</div><div class="q-text">${p.text}</div><div class="opts">`;
    p.opts.forEach((c, i) => { keyMap.push(() => { if (!c.lock) pickOpt(c.k); }); h += optHtml(c, i); });
    h += '</div>';
  } else if (s.alive) {
    h += '<div id="actBox" class="acts"></div>';
  } else {
    h += `<div class="q-title">${s.ascended ? '🌟 ขึ้นสู่อาณาจักรเทพ' : '🕯️ ชีวิตนี้จบลงแล้ว'}</div><div class="q-text">${s.cause}</div>
      <div class="btns"><button class="pbtn" id="evTomb">📖 ดูเรื่องราวชีวิต & แชร์</button><button class="pbtn ghost" id="evNew">เกิดใหม่</button></div>`;
  }
  $('eventBox').innerHTML = h;
  renderActs();
  if (s.hunt) startHuntGame();
  const bl = $('eventBox').querySelector('.blog'); if (bl) bl.scrollTop = bl.scrollHeight;
}

function fighterHtml(f, me) {
  const soul = SOUL_BY_ID[f.soul];
  const st = [f.stun ? '😵 ถูกควบคุม' : '', f.shield > 0 ? `🛡️ เกราะ ${f.shield}` : '', f.buff > 0 ? `⬆️ เสริมพลัง ${f.buff}` : '', f.defending ? '🛡️ ป้องกัน' : ''].filter(Boolean).join(' · ');
  return `<div class="fighter"><div class="fn">${me ? '🧑' : '👤'} ${f.name}</div><div style="color:var(--muted)">Lv.${f.level} · <span class="${TIER_INFO[soul.tier].cls}">${soul.th}</span> · ${f.rings.length} วง</div>
    <div class="mbar hp"><b style="width:${Math.max(0, f.hp / f.hpMax * 100)}%"></b></div><div class="mlab"><span>❤️ HP</span><span>${Math.max(0, Math.round(f.hp))}/${f.hpMax}</span></div>
    <div class="mbar en"><b style="width:${f.en / f.enMax * 100}%"></b></div><div class="mlab"><span>🌀 พลัง</span><span>${Math.round(f.en)}/${f.enMax}</span></div>
    <div class="fstat">${st}</div></div>`;
}
function battleHtml(b) {
  const K = BATTLE_KINDS[b.kind];
  let h = `<div class="q-title"><span class="bolt">⚔️</span>${b.title}</div><div class="note">${K.th} · ถ้าแพ้เสี่ยงตาย ${Math.round(K.death * 100)}%</div>
    <div class="fighters">${fighterHtml(b.me, true)}${fighterHtml(b.foe, false)}</div>
    <div class="blog">${b.log.map(l => `<div class="${l.c}">${l.t}</div>`).join('')}</div><div class="opts">`;
  const opt = (i, title, desc, side, dis = false, color = '') => `<button class="opt" data-k="${i}" ${dis ? 'disabled' : ''}><span class="num">${i + 1}</span><span><span class="tt">${color ? `<span class="rdot" style="background:${color}"></span>` : ''}${title}</span><div class="dd">${desc}</div></span>${side}</button>`;
  if (b.over) {
    keyMap.push(() => run(() => finishBattle(S)));
    h += opt(0, b.result === 'win' ? '🏆 ชนะ! ไปต่อ' : '➡️ ดูผลลัพธ์', b.result === 'win' ? 'รับรางวัลจากการประลอง' : 'ชะตากรรมของคุณจะถูกตัดสิน', '');
  } else {
    const role = SOUL_BY_ID[b.me.soul].role;
    const acts = [['attack', '⚔️ โจมตีปกติ', '+5 พลังวิญญาณ', '', false, ''], ['defend', '🛡️ ตั้งรับ', 'ลดความเสียหาย 60% · +15 พลัง', '', false, '']];
    b.me.rings.forEach((y, i) => acts.push([`skill:${i}`, `วงแหวนที่ ${i + 1}「${SKILL_NAMES[role][i]}」`, `${ROLE_TH[role]} · ${fmt(y)} ปี`, `<div class="side">ใช้พลัง<b>${skillCost(i)}</b></div>`, b.me.en < skillCost(i), RING_TIERS[ringTierOf(y)].color]));
    acts.push(['surrender', '🏳️ ยอมแพ้', K.surrenderDeath ? 'คู่ต่อสู้อาจไม่ไว้ชีวิต' : 'ยุติการประลอง', K.surrenderDeath ? `<div class="side dead">เสี่ยงตาย<b>${Math.round(K.surrenderDeath * 100)}%</b></div>` : '', false, '']);
    acts.forEach(([a, t, d, side, dis, col], i) => {
      keyMap.push(() => { if (!dis && !animBusy) { battleAction(S, a); save(); playBattle(S.battle, () => { renderScene(); renderEvent(); }); } });
      h += opt(i, t, d, side, dis, col);
    });
  }
  return h + '</div>';
}

// ---------- แอนิเมชันการต่อสู้: พุ่งเข้าใส่ · แสงวงแหวน · ตัวเลขความเสียหาย ----------
let animBusy = false;
const POS = { me: 110, foe: 190 };
function floatNum(text, x, cls) {
  const fr = $('scene').closest('.scene-frame'), el = document.createElement('div');
  el.className = 'dmg ' + cls; el.textContent = text;
  el.style.left = (x / 320 * 100) + '%';
  fr.appendChild(el); setTimeout(() => el.remove(), 1100);
}
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const sparks = (x, y, n, color, k) => Array.from({ length: n }, (_, i) => { const ang = i / n * Math.PI * 2 + i, d = 4 + k * 26; return { x: x + Math.cos(ang) * d, y: y + Math.sin(ang) * d * 0.7, color: i % 3 ? color : '#fff', a: 1 - k, s: 2 }; });
// ภาพหนึ่งเฟรมของเหตุการณ์ ev ที่เวลา t (0–1)
function fxFrame(ev, t, feet) {
  const me = ev.a === 'me', self = me ? POS.me : POS.foe, tgt = me ? POS.foe : POS.me, dir = me ? 1 : -1, A = {}, cy = feet - 18;
  const mk = me ? 'hx' : 'fx', tk = me ? 'fx' : 'hx', col = ev.col || '#fff3c4';
  const hitAt = (k, power) => {
    if (ev.t === 'miss') { A[tk] = Math.round(-dir * 16 * Math.sin(Math.min(1, k * 2) * Math.PI)); return; }
    A[tk] = Math.round(Math.sin(k * Math.PI * 7) * 3 * (1 - k) + dir * (power ? 10 : 5) * (1 - k));
    A.parts = sparks(tgt, cy, power ? 14 : 8, col, k);
    if (k < 0.35) A.slash = { x: tgt, a: 1 - k / 0.35, color: col };
    if (ev.crit && k < 0.3) A.flash = { color: '#fff3c4', a: 0.5 * (1 - k / 0.3) };
  };
  if (ev.t === 'hit' || ev.t === 'miss') {
    if (!ev.col) {
      // โจมตีปกติ: พุ่งเข้าประชิด (มีภาพติดตา) → ปะทะ → กระโดดกลับ
      const D2 = 56 * dir;
      if (t < 0.35) { const k = ease(t / 0.35); A[mk] = Math.round(D2 * k); A.ghosts = [0.25, 0.5, 0.75].map(f => ({ x: self + D2 * k * f, a: 0.18 * f, foe: !me })); }
      else if (t < 0.6) { A[mk] = D2; hitAt((t - 0.35) / 0.25, false); }
      else { const k = ease((t - 0.6) / 0.4); A[mk] = Math.round(D2 * (1 - k)); }
      return A;
    }
    // ทักษะวงแหวน: รวมพลัง → ปล่อยพลังตามสาย → ระเบิดที่เป้า
    A.tint = { color: col, a: 0.12 * Math.sin(Math.min(1, t) * Math.PI) };
    if (t < 0.3) { const k = t / 0.3; A.aura = { x: self, color: col, a: 0.35 + 0.4 * k, r: 14 + k * 14 }; A.rays = { x: self, color: col, a: k, t }; A.parts = sparks(self, cy, 10, col, 1 - k).map(p => ({ ...p, a: k })); return A; }
    const role = ev.role;
    if (t < 0.6) {
      const k = (t - 0.3) / 0.3;
      if (role === 'agile') { const D2 = 70 * dir * ease(k); A[mk] = Math.round(D2); A.ghosts = [0.2, 0.45, 0.7].map(f => ({ x: self + D2 * f, a: 0.3 * f, foe: !me })); A.aura = { x: self + D2, color: col, a: 0.5 }; }
      else if (role === 'control') A.chains = { x0: self, x1: tgt, p: ease(k), t, color: col, a: 0.9 };
      else if (role === 'power' || role === 'defense') A.orb = { x: self + (tgt - self) * ease(k), r: 6 + k * 3, color: col, dir };
      else A.beam = { x0: self, x1: self + (tgt - self) * ease(k), w: 6, color: col, a: 0.9 };
      A.aura = A.aura || { x: self, color: col, a: 0.4 * (1 - k) };
      return A;
    }
    const k = (t - 0.6) / 0.4;
    if (role === 'agile') A[mk] = Math.round(70 * dir * (1 - ease(k)));
    if (role === 'control') A.chains = { x0: self, x1: tgt, p: 1, t, color: col, a: 1 - k };
    A.burst = { x: tgt, r: 10 + k * 34, color: col, a: 1 - k };
    hitAt(k, true);
    return A;
  }
  // ทักษะกับตัวเอง
  const c = { heal: '#7fe8a0', buff: '#ffd36a', def: '#8ec5ff', stun: '#c58bff' }[ev.t] || col;
  A.aura = { x: self, color: c, a: 0.55 * (1 - t), r: 16 + t * 10 };
  if (ev.t === 'def') A.shield = { x: self, color: c, a: 1 - t * 0.7 };
  else if (ev.t === 'stun') A.chains = { x0: self, x1: self, p: 1, t, color: c, a: 1 - t };
  else { A.rays = { x: self, color: c, a: 1 - t, t }; A.parts = Array.from({ length: 10 }, (_, i) => ({ x: self - 14 + (i * 37 % 28), y: cy + 16 - t * 40 - (i % 4) * 6, color: c, a: 1 - t, s: 2 })); }
  return A;
}
function playBattle(b, done) {
  const seq = (b && b.anim) || [];
  if (!seq.length) return done();
  animBusy = true; $('eventBox').classList.add('busy');
  const canvas = $('scene'), fr = canvas.closest('.scene-frame'), base = sceneSpec(S), feet = 154;
  let i = 0;
  const next = () => {
    if (i >= seq.length) { animBusy = false; $('eventBox').classList.remove('busy'); return done(); }
    const ev = seq[i++], me = ev.a === 'me', self = me ? POS.me : POS.foe, tgt = me ? POS.foe : POS.me;
    const T = ev.t === 'hit' || ev.t === 'miss' ? (ev.col ? 980 : 640) : 560, hitT = ev.col ? 0.6 : 0.35, t0 = performance.now();
    let shown = false;
    const frame = now => {
      const t = Math.min(1, (now - t0) / T);
      drawScene(canvas, { ...base, anim: fxFrame(ev, t, feet) });
      const isAtk = ev.t === 'hit' || ev.t === 'miss';
      if (!shown && (!isAtk || t >= hitT)) {
        shown = true;
        if (ev.t === 'miss') floatNum('หลบ!', tgt, 'miss');
        else if (ev.t === 'hit') { floatNum((ev.crit ? 'คริ! ' : '') + '−' + ev.n, tgt, (me ? 'out' : 'in') + (ev.crit ? ' crit' : '')); if (ev.crit || ev.col) { fr.classList.remove('shake'); void fr.offsetWidth; fr.classList.add(ev.crit ? 'shake' : 'shake-s'); } }
        else floatNum({ heal: '+' + ev.n, buff: 'พลัง↑', def: 'ตั้งรับ', stun: 'ถูกควบคุม' }[ev.t], self, ev.t);
      }
      if (t < 1) requestAnimationFrame(frame); else { drawScene(canvas, { ...base, anim: {} }); setTimeout(next, 80); }
    };
    requestAnimationFrame(frame);
  };
  next();
}

// ---------- มินิเกมล่าวงแหวน: กดให้ตรงจังหวะ ----------
let HG = null;
function huntGameHtml(c) {
  const p = c.p, rt = RING_TIERS[p.t];
  return `<div class="q-title"><span class="bolt">🏹</span>ล่า${c.th} อายุ ${fmt(c.years)} ปี</div>
    <div class="note">ความยาก <b>${p.label}</b> · กด <b>Space</b> หรือแตะปุ่ม ตอนเข็มอยู่ในช่องทอง · ตรงกลางช่อง = โจมตีสมบูรณ์แบบ</div>
    <div class="hgame" style="--rc:${rt.color}">
      <div class="hg-top"><span id="hgRound"></span><span id="hgLives"></span></div>
      <div class="hg-bar" id="hgBar"><div class="hg-zone" id="hgZone"><i></i></div><div class="hg-cur" id="hgCur"></div></div>
      <div class="hg-msg" id="hgMsg">เตรียมตัว…</div>
      <button class="pbtn hg-btn" id="hgBtn">⚔️ จู่โจม! <small>(Space)</small></button>
    </div>`;
}
function hgNewZone(g) {
  g.zw = g.c.p.zone; g.zx = 0.06 + Math.random() * (0.88 - g.zw);
}
function startHuntGame() {
  if (HG && HG.c === S.hunt) { hgPaint(); return; }
  const c = S.hunt;
  HG = { c, hits: 0, misses: 0, perfect: 0, speed: c.p.speed, phase: 'ready', t0: performance.now() + 1400, until: performance.now() + 1400 };
  hgNewZone(HG);
  const loop = now => { if (!HG || HG.c !== c) return; hgTick(now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
const hgPos = (g, now) => { const u = Math.max(0, (now - g.t0) / 1000 * g.speed) % 2; return u < 1 ? u : 2 - u; };
const hgZoneX = (g, now) => g.c.p.moving ? clamp(g.zx + Math.sin(now / 650) * 0.12, 0.02, 0.98 - g.zw) : g.zx;
function hgPaint(now = performance.now()) {
  const g = HG; if (!g) return;
  const cur = $('hgCur'), zone = $('hgZone'); if (!cur) return;
  cur.style.left = (g.phase === 'ready' ? 0 : hgPos(g, now) * 100) + '%';
  zone.style.left = hgZoneX(g, now) * 100 + '%'; zone.style.width = g.zw * 100 + '%';
  $('hgRound').innerHTML = `🎯 เข้าเป้า <b>${g.hits}/${g.c.p.rounds}</b>`;
  $('hgLives').innerHTML = '❤️'.repeat(g.c.p.lives - g.misses) + '🖤'.repeat(g.misses);
}
function hgTick(now) {
  const g = HG;
  if (g.phase === 'ready') { const left = Math.ceil((g.until - now) / 470); $('hgMsg') && ($('hgMsg').textContent = left > 0 ? `เตรียมตัว… ${left}` : 'ลงมือ!'); if (now >= g.until) { g.phase = 'play'; g.t0 = now; } }
  else if (g.phase === 'pause' && now >= g.until) { g.phase = 'play'; g.t0 = now; }
  hgPaint(now);
}
function huntPress() {
  const g = HG; if (!g) return;
  hgTick(performance.now()); // อัปเดตสถานะเผื่อ requestAnimationFrame ถูกหน่วง (แท็บเบื้องหลัง)
  if (g.phase !== 'play') return;
  const now = performance.now(), pos = hgPos(g, now), zx = hgZoneX(g, now), mid = zx + g.zw / 2, bar = $('hgBar');
  const hit = pos >= zx && pos <= zx + g.zw, perfect = hit && Math.abs(pos - mid) <= g.zw * 0.18;
  if (hit) { g.hits++; if (perfect) g.perfect++; floatNum(perfect ? 'สมบูรณ์แบบ!' : 'เข้าเป้า!', POS.foe, perfect ? 'out crit' : 'out'); }
  else { g.misses++; floatNum('พลาด!', POS.me, 'in'); const fr = $('scene').closest('.scene-frame'); fr.classList.remove('shake'); void fr.offsetWidth; fr.classList.add('shake'); }
  bar.classList.remove('hit', 'miss', 'perfect'); void bar.offsetWidth; bar.classList.add(perfect ? 'perfect' : hit ? 'hit' : 'miss');
  $('hgMsg').textContent = perfect ? '💥 โจมตีจุดตายสมบูรณ์แบบ!' : hit ? '⚔️ เข้าเป้า! สัตว์วิญญาณเซถอย' : '💢 พลาด! สัตว์วิญญาณโต้กลับ';
  const p = g.c.p;
  if (g.hits >= p.rounds || g.misses >= p.lives) {
    g.phase = 'done';
    const res = { ok: g.hits >= p.rounds, hits: g.hits, misses: g.misses, perfect: g.perfect };
    $('hgMsg').textContent = res.ok ? '🏆 คุณล้มสัตว์วิญญาณได้แล้ว!' : '☠️ สัตว์วิญญาณเหนือกว่าคุณ…';
    hgPaint(now);
    setTimeout(() => { HG = null; run(() => finishHuntGame(S, res)); }, 1100);
    return;
  }
  if (hit) { hgNewZone(g); g.speed *= 1.07; }
  g.phase = 'pause'; g.until = now + 420;
  hgPaint(now);
}

// ---------- overlay ----------
function overlay(html, art = false) { $('ovCard').innerHTML = html; $('overlay').hidden = false; $('overlay').classList.toggle('art', art); $('overlay').scrollTop = 0; }
function closeOverlay() { $('overlay').hidden = true; }

function showLanding() {
  const sv = load();
  const canContinue = sv && sv.alive && sv.v === 4;
  const gr = graves();
  const legend = [['hp', 'สุขภาพ'], ['soul', 'พลังวิญญาณ'], ['str', 'พละกำลัง'], ['agi', 'ความว่องไว'], ['spi', 'พลังจิต'], ['wis', 'ปัญญา'], ['mood', 'อารมณ์'], ['luck', 'โชค'], ['fame', 'ชื่อเสียง'], ['money', 'เหรียญทอง']];
  const feats = [
    ['🎲', 'เกิดเป็นใครก็ได้', 'ชื่อ เพศ บ้านเกิด ฐานะ และวิญญาณยุทธ์ถูกสุ่มทั้งหมด ลูกชาวนาหรือองค์ชายก็เป็นได้'],
    ['🍀', 'โชคพลิกชะตา', 'ยิ่งดวงดี ยิ่งมีโอกาสปลุกได้วิญญาณยุทธ์ชั้นยอด แม้เกิดในกระท่อมก็ยังเปลี่ยนชีวิตได้'],
    ['📜', 'ภารกิจและทางแยก', 'ภารกิจระหว่างทาง คู่ปรับตลอดกาล สายเลือดลับ ทุกการเลือกมีผลและมีเหตุผลรองรับ'],
    ['⚔️', 'ประลองแบบเทิร์น', 'ใช้ทักษะวงแหวนสู้ศัตรู จะประลองมิตรภาพหรือประลองเป็นตายก็ได้ แต่ความตายรออยู่ทุกที่'],
    ['🔱', 'สืบทอดเทพ', 'อัจฉริยะที่โดดเด่นพอ เทพสมุทร เทพอสูร หรือเทพองค์อื่นอาจเลือกคุณ แต่บททดสอบโหดร้าย'],
    ['📖', 'เรื่องเล่าของคุณ', 'เมื่อสิ้นอายุขัย ชีวิตทั้งหมดถูกเรียบเรียงเป็นเรื่องเล่า บันทึกเป็นรูปหรือแชร์ให้เพื่อนได้'],
  ];
  overlay(`<div class="land">
    <section class="hero">
      <canvas id="ovScene" width="320" height="180"></canvas><span class="seal">斗罗大陆</span>
      <div class="hero-in">
        <div class="emblem" aria-hidden="true">${['#f5f5f5', '#f5c518', '#9b4dff', '#1b1b1b', '#e0263a', '#ffb02e'].map((c, i) => `<i style="--c:${c};--i:${i}"></i>`).join('')}<span>魂</span></div>
        <div class="kicker">斗罗大陆 · DOULUO LIFE SIMULATOR</div>
        <h1 class="title">เกิดในโลกวิญญาจารย์</h1>
        <p class="lede">ชีวิตหนึ่งชีวิต ในยุคเดียวกับ<b>ถังซาน</b> เลือกเกิดไม่ได้ แต่เลือกทางเดินได้ทุกปี</p>
        <div class="btns cta"><button class="pbtn big" id="ovBorn">✦ เริ่มชีวิตใหม่</button>${canContinue ? `<button class="pbtn ghost" id="ovCont">ใช้ชีวิตต่อ · ${sv.name} อายุ ${sv.age}</button>` : ''}</div>
        ${gr.length ? `<div class="hero-note">🪦 หอบรรพชนของคุณมี ${gr.length} ชีวิต · สูงสุด Lv.${Math.max(...gr.map(g => g.level))}</div>` : ''}
      </div>
    </section>
    <section class="feats">${feats.map(([i, t, d]) => `<div class="feat"><span class="fi">${i}</span><b>${t}</b><small>${d}</small></div>`).join('')}</section>
    <details class="howto"><summary>❓ ค่าสถานะแต่ละตัวหมายถึงอะไร · วิธีเล่น</summary>
      <div class="legend">${legend.map(([k, t]) => `<div><span>${IC[k]}</span><b>${t}</b><small>${STAT_HELP[k]}</small></div>`).join('')}</div>
      <div class="note">ทุกปีมีแต้มเวลาให้ใช้ทำกิจกรรม · ทุกตัวเลือกบอกผลล่วงหน้า · กดเลข 1–9 เพื่อเลือก · Enter = ปีถัดไป · Space = หยุดเวลา</div>
    </details>
  </div>`, true);
  drawScene($('ovScene'), { kind: 'city', tod: 'dusk', place: 'tiandou', seed: 7, hero: { age: 20, gender: 'M', cloth: '#3a2a12', rings: ['#f5c518', '#9b4dff', '#9b4dff', '#1b1b1b'], aura: '#ffd36a' }, foe: { age: 20, gender: 'F', cloth: '#5a1a1a', rings: ['#f5c518', '#f5c518', '#9b4dff'], aura: '#ff9d4a' } });
  $('ovBorn').onclick = showBirth;
  if (canContinue) $('ovCont').onclick = () => { S = sv; closeOverlay(); startGame(); };
}

// สรุปข้อได้เปรียบ/เสียเปรียบของฐานะ ให้เห็นว่าคนจนลำบากกว่าแต่ยังมีโอกาส
function tierPerks(s) {
  const f = familyOf(s), w = f.soulW, tot = w.reduce((a, b) => a + b, 0);
  const good = Math.round((w[3] + w[4]) / tot * 100), legend = (w[4] / tot * 100).toFixed(1);
  const stats = ['str', 'agi', 'spi', 'wis'].map(k => `${IC[k]} ${s[k]}`).join(' · ');
  const row = (ic, t, v, cls = '') => `<div class="perk ${cls}"><span>${ic} ${t}</span><b>${v}</b></div>`;
  const lw = w.map((x, i) => x * Math.pow(1 + (s.luck - 50) / 100, i)), lt = lw.reduce((a, b) => a + b, 0);
  const lgood = Math.round((lw[3] + lw[4]) / lt * 100), lf = (s.luck - 50) / 50;
  const miracle = s.luck >= 80 ? Math.round((s.luck - 70)) : 0;
  const luckBox = `<div class="luckbox ${s.luck >= 70 ? 'hi' : s.luck < 35 ? 'lo' : ''}"><div class="lh">🍀 ดวงชะตา ${s.luck}/100 <small>${s.luck >= 80 ? 'ฟ้าลิขิตให้โดดเด่น' : s.luck >= 60 ? 'ดวงดี' : s.luck >= 35 ? 'ดวงปานกลาง' : 'ดวงตก'}</small></div>
    <div class="lrow"><span>โอกาสได้วิญญาณยุทธ์ยอดเยี่ยมขึ้นไป</span><b>${good}% → <em>${lgood}%</em></b></div>
    <div class="lrow"><span>โอกาสไร้พลังวิญญาณ</span><b>${Math.round(f.p0 * 100)}% → <em>${Math.round(f.p0 * (1 - 0.4 * lf) * 100)}%</em></b></div>
    ${miracle ? `<div class="lrow gold"><span>✨ ปาฏิหาริย์ตอนปลุก (ถ้าได้วิญญาณยุทธ์ธรรมดา)</span><b>${miracle}%</b></div>` : ''}
    <div class="lnote">${s.luck >= 70 ? 'ด้วยดวงขนาดนี้ แม้เกิดมาลำบากก็มีโอกาสพลิกชีวิตตอนพิธีปลุกอายุ 6 ขวบ' : 'โชคมีผลต่อพิธีปลุกวิญญาณยุทธ์ตอน 6 ขวบ และโชคเพิ่มได้ระหว่างทาง'}</div></div>`;
  return `<div class="perks"><div class="ph">⚖️ ชะตาตามฐานะ <small>ยิ่งฐานะดียิ่งได้เปรียบ แต่ทุกคนมีโอกาส</small></div>
    ${row('🌀', 'ตัวคูณการฝึก', '×' + f.train, f.train >= 1.08 ? 'up' : f.train < 1 ? 'dn' : '')}
    ${row('🏥', 'คุณภาพการรักษาเมื่อป่วย', Math.round(f.care * 100) + '%', f.care >= 0.85 ? 'up' : f.care < 0.65 ? 'dn' : '')}
    ${row('💧', 'โอกาสไม่มีพลังวิญญาณ', Math.round(f.p0 * 100) + '%', f.p0 <= 0.1 ? 'up' : f.p0 >= 0.24 ? 'dn' : '')}
    ${row('🐉', 'โอกาสวิญญาณยุทธ์ยอดเยี่ยมขึ้นไป', good + '% (ตำนาน ' + legend + '%)', good >= 17 ? 'up' : good <= 11 ? 'dn' : '')}
    ${row('🔥', 'โอกาสพลังเต็มขั้น 10', (f.full * 100).toFixed(1) + '%', '')}
    ${row('💰', 'ครอบครัวส่งเสียต่อปี', s.bg === 'orphan' ? 'ไม่มี (กำพร้า)' : f.income * 0.25 < 1 ? 'แทบไม่มี' : fmt(f.income * 0.25) + ' เหรียญ', f.income >= 80 ? 'up' : f.income <= 4 ? 'dn' : '')}
    <div class="perk"><span>📊 ค่าเริ่มต้น</span><b>${stats}</b></div></div>${luckBox}`;
}
function showBirth() {
  const s = newLife();
  const fam = familyOf(s), place = placeOf(s), clan = clanOf(s), o = s.birthOdds;
  const tot = FAMILY_TIERS.reduce((a, f) => a + f.weight, 0);
  overlay(`<div class="landing">
    <div class="scene-frame"><canvas id="ovScene" width="320" height="180"></canvas><div class="scene-cap">รุ่งเช้าวันที่ลืมตาดูโลก · ${place.th}</div></div>
    <div class="panel birth">
      <div class="tag"><b>เกิด</b>แรกเกิด · ทะเบียนกำเนิดเลขที่ ${s.id.toUpperCase()}</div>
      <h2>คุณคือ${s.gender === 'M' ? 'เด็กชาย' : 'เด็กหญิง'}${s.name} <span class="zh" style="font-size:20px">${s.zh}</span></h2>
      <p>${s.log[0].lines[1].t}${clan ? ` สายเลือด<b class="gold">${clan.th}</b>ไหลเวียนอยู่ในตัวคุณ` : ''} วิญญาณยุทธ์ของคุณจะถูกปลุกเมื่ออายุ 6 ปี</p>
      <div class="bgrid">
        <div class="bcell"><div class="k">บ้านเกิด</div><div class="v">${place.th}</div><div class="o">โอกาส ${(o.place * 100).toFixed(1)}% · ${place.nation}</div></div>
        <div class="bcell"><div class="k">เพศ</div><div class="v">${s.gender === 'M' ? 'ชาย' : 'หญิง'}</div><div class="o">โอกาส 50%</div></div>
        <div class="bcell"><div class="k">ฐานะครอบครัว</div><div class="v">${clan ? clan.th : fam.th}</div><div class="o">โอกาส ${(o.family * 100).toFixed(1)}%</div></div>
        <div class="bcell"><div class="k">โอกาสเกิดแบบนี้ทั้งชุด</div><div class="v">1 ใน ${fmt(o.total)}</div><div class="o">ของเด็กที่เกิดปีเดียวกันในทวีป</div></div>
        <div class="bcell wide"><div class="k">ภูมิหลัง</div><div class="v">${bgOf(s).th}</div><div class="o">${bgOf(s).desc}</div></div>
      </div>
      ${tierPerks(s)}
      <div class="chart">${FAMILY_TIERS.map(f => `<div class="${f.id === fam.id ? 'me' : ''}"><span>${Math.round(f.weight / tot * 100)}%</span><b style="height:${f.weight / 32 * 80}px"></b>${f.th}</div>`).join('')}</div>
      <div class="money-box"><span class="big">💰 ${fmt(s.money)}</span><span>เหรียญทองวิญญาณของครอบครัว · ดวงชะตา 🍀 ${s.luck}/100</span></div>
      <div class="btns"><button class="pbtn" id="ovGo">ต่อไป</button><button class="pbtn ghost" id="ovRe">ขอเกิดใหม่</button></div>
    </div></div>`, true);
  drawScene($('ovScene'), { kind: CITY_PLACES.includes(s.place) ? 'city' : 'home', tod: 'dawn', place: s.place, seed: hash(s.id), family: true, hero: { age: 1, gender: s.gender, cloth: '#e8e4dc', rings: [] } });
  $('ovRe').onclick = showBirth;
  $('ovGo').onclick = () => { S = s; S.feed = []; S.feedD = {}; startLife(S); closeOverlay(); save(); startGame(); };
}

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.className = 'show';
  clearTimeout(t._h); t._h = setTimeout(() => t.className = '', 2600);
}
const cardFile = s => `ชีวิตของ${s.name}.png`;
async function cardBlob(s) { const cv = await lifeCardCanvas(s); return new Promise(r => cv.toBlob(r, 'image/png')); }
async function saveCard(s) {
  const blob = await cardBlob(s);
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = cardFile(s);
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('💾 บันทึกการ์ดชีวิตเป็นรูปภาพแล้ว');
}
async function copyStory(s) {
  try { await navigator.clipboard.writeText(lifeStory(s).plain); toast('📋 คัดลอกเรื่องราวแล้ว — วางแชร์ได้เลย'); }
  catch (e) { toast('คัดลอกไม่สำเร็จ ลองใช้ปุ่มบันทึกไฟล์ข้อความแทน'); }
}
function saveText(s) {
  const blob = new Blob([lifeStory(s).plain], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `ชีวิตของ${s.name}.txt`;
  document.body.appendChild(a); a.click(); a.remove();
  toast('📄 บันทึกไฟล์ข้อความแล้ว');
}
async function shareStory(s) {
  const st = lifeStory(s);
  try {
    if (navigator.share) {
      const file = new File([await cardBlob(s)], cardFile(s), { type: 'image/png' });
      const data = { title: `ชีวิตของ${s.name}`, text: st.plain };
      if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
      await navigator.share(data);
      return;
    }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  copyStory(s);
}

function showTomb() {
  const s = S, st = lifeStory(s);
  overlay(`<div class="endwrap">
    <div class="panel tomb-card">
      <h2 class="title" style="font-size:30px">${s.ascended ? '🌟 ขึ้นสู่อาณาจักรเทพ' : 'ณ ที่นี้ ผู้กล้าได้หลับใหล'}</h2>
      <div class="stone"><div class="nm">${s.name}</div><div class="zh">${s.zh}</div>${s.title ? `<div class="gold">${s.title}</div>` : ''}<div>อายุ ${s.age} ปี</div></div>
      <div class="verdict">${st.verdict}</div>
      <div class="cause">${s.cause}</div>
      <div class="score">คะแนนชีวิต <b>${fmt(st.score)}</b></div>
      ${lifeMapHtml(s)}
      <div class="sharebar">
        <button class="pbtn" id="bSave">💾 บันทึกเป็นรูปภาพ</button>
        <button class="pbtn ghost" id="bShare">🔗 แชร์</button>
        <button class="pbtn ghost" id="bCopy">📋 คัดลอกเรื่องราว</button>
        <button class="pbtn ghost" id="bTxt">📄 ไฟล์ข้อความ</button>
      </div>
      <div class="btns" style="justify-content:center"><button class="pbtn ghost" id="ovClose">📜 บันทึกชีวิตทั้งหมด</button><button class="pbtn" id="ovNew">🔄 เกิดใหม่</button></div>
    </div>
    <div class="panel story">
      <h3 class="sth">📖 เรื่องราวชีวิตของ${s.name}</h3>
      ${st.paragraphs.map(p => `<p>${p}</p>`).join('')}
      ${st.highlights.length ? `<h4>✨ ช่วงเวลาสำคัญ</h4><ul>${st.highlights.map(h => `<li><b>อายุ ${h.age}</b> · ${h.t}</li>`).join('')}</ul>` : ''}
      <h4>🖼️ การ์ดชีวิต (สำหรับแชร์)</h4>
      <div class="cardprev" id="cardPrev">กำลังวาดการ์ด...</div>
    </div>
  </div>`);
  $('ovClose').onclick = () => { closeOverlay(); showLog(); };
  $('ovNew').onclick = showBirth;
  $('bSave').onclick = () => saveCard(s);
  $('bShare').onclick = () => shareStory(s);
  $('bCopy').onclick = () => copyStory(s);
  $('bTxt').onclick = () => saveText(s);
  lifeCardCanvas(s).then(cv => { const img = new Image(); img.src = cv.toDataURL('image/png'); img.alt = 'การ์ดชีวิต'; const box = $('cardPrev'); if (box) { box.innerHTML = ''; box.appendChild(img); } });
}
function showLog() {
  overlay(`<div class="panel tomb-card" style="width:min(760px,100%)"><h2 class="title" style="font-size:28px">📜 บันทึกชีวิต</h2>
    <div>${S.log.map(y => `<div class="logyear"><span class="a">${y.age} ปี</span><div>${y.lines.map(lineHtml).join('') || '<p class="muted">ชีวิตดำเนินไปอย่างเรียบง่าย</p>'}</div></div>`).join('')}</div>
    <div class="btns" style="justify-content:center"><button class="pbtn" id="ovClose">ปิด</button></div></div>`);
  $('ovClose').onclick = closeOverlay;
}
function showGraves() {
  const g = graves();
  overlay(`<div class="panel tomb-card"><h2 class="title" style="font-size:28px">🪦 หอบรรพชน</h2>
    ${g.length ? g.map((x, i) => `<div class="item" style="text-align:left"><b>${x.name}</b> <span class="zh">${x.zh}</span>${x.title ? ` · <span class="gold">${x.title}</span>` : ''}${x.score ? ` · คะแนน ${fmt(x.score)}` : ''}<br>อายุ ${x.age} ปี · Lv.${x.level} · วงแหวน ${x.rings} · ${x.soul}${x.path ? ` · ${x.path}` : ''}<br><small style="color:${x.ascended ? 'var(--gold)' : 'var(--red)'}">${x.cause}</small>${x.story ? `<details><summary>📖 อ่านเรื่องราว</summary><pre class="gstory">${x.story}</pre><button class="pbtn ghost sm2" data-copy="${i}">📋 คัดลอก</button></details>` : ''}</div>`).join('') : '<div class="note">ยังไม่มีผู้ล่วงลับ</div>'}
    <div class="btns" style="justify-content:center"><button class="pbtn" id="ovClose">ปิด</button></div></div>`);
  $('ovClose').onclick = closeOverlay;
  $('ovCard').querySelectorAll('[data-copy]').forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(g[+b.dataset.copy].story); toast('📋 คัดลอกเรื่องราวแล้ว'); } catch (e) { toast('คัดลอกไม่สำเร็จ'); } });
}
function showHelp() {
  overlay(`<div class="panel tomb-card" style="text-align:left"><h2 class="title" style="font-size:28px">❓ วิธีเล่น</h2>
    <p>🎲 ทุกอย่างสุ่มตั้งแต่เกิด: ชื่อจีน เพศ บ้านเกิด ฐานะครอบครัว วิญญาณยุทธ์ พลังแต่กำเนิด</p>
    <p>📅 ทุกปีมี <b>แต้มเวลา</b> 2–4 แต้ม ใช้ทำกิจกรรมได้หลายอย่าง (บำเพ็ญ ฝึก เรียน หาเงิน ผจญภัย ประลอง ไปตลาด ฯลฯ) อยากข้ามปีกดได้ทันที หรือปล่อยให้เวลาเดินเองอัตโนมัติ (หยุด/เร่งได้ที่แถบบน)</p><p>🧬 ระบบประเมิน <b>นิสัย</b> จากกิจกรรมที่คุณเลือกบ่อย แล้วใช้แต้มที่เหลือแทนให้ตามนิสัยนั้น</p><p>⚡ ระหว่างปีจะมี <b>ทางแยกของชีวิต</b> และเหตุการณ์ตามนิยาย (ถังซาน เสี่ยวอู่ เชร็ค ตำหนักวิญญาณยุทธ์ สงคราม ฯลฯ) ให้ตัดสินใจ</p>
    <p>🧭 <b>เส้นทางชีวิต</b> (เรียน สำนัก ทหาร พเนจร ฯลฯ) ให้ผลทุกปี เช่น เข้าเรียนได้ปัญญา เข้าสำนักบำเพ็ญเร็ว และเปลี่ยนเรื่องราวที่จะเจอ</p>
    <p>💍 ถึงคอขวดทุก 10 ระดับต้อง<b>เลือกสัตว์วิญญาณ</b>ที่จะล่า ยิ่งอายุสูงยิ่งแรงแต่เสี่ยงร่างระเบิด สัตว์ที่ธาตุเข้ากับวิญญาณยุทธ์จะปลอดภัยกว่าและได้โบนัส</p>
    <p>🌟 ถ้าพรสวรรค์ (พละกำลัง/ว่องไว/พลังจิต/ปัญญา) โดดเด่นมากและพลังถึงระดับ 60 เทพอาจเรียกคุณ — ผ่านบททดสอบ 7 ขั้นที่เสี่ยงตายทุกขั้นเพื่อเป็นเทพ</p>
    <p>☠️ ตายได้ทุกเมื่อ: ป่วย ถูกลอบสังหาร แพ้ประลอง อุบัติเหตุ สัตว์วิญญาณ สงคราม หรือพิการถาวร</p>
    <div class="btns" style="justify-content:center"><button class="pbtn" id="ovClose">เข้าใจแล้ว</button></div></div>`);
  $('ovClose').onclick = closeOverlay;
}

// ---------- เริ่มเกม ----------
function startGame() { $('topbar').hidden = false; $('game').hidden = false; $('mtabs').hidden = false; setTab('play'); render(); }
// ---------- มือถือ: แท็บ เล่น / เรื่องราว / ตัวละคร ----------
let mtab = 'play', storyLen = 0;
const isMobile = () => matchMedia('(max-width: 860px)').matches;
function setTab(t) {
  mtab = t; document.body.dataset.mtab = t;
  document.querySelectorAll('.mtab').forEach(b => b.classList.toggle('on', b.dataset.t === t));
  if (t === 'story') { $('mtStory').classList.remove('dot'); const en = $('entries'); if (en) en.scrollTop = en.scrollHeight; }
  if (isMobile()) window.scrollTo({ top: 0 });
}
$('mtabs').onclick = e => { const b = e.target.closest('.mtab'); if (b) setTab(b.dataset.t); };

$('btnLog').onclick = showLog;
$('btnPlay').onclick = () => { playing = !playing; renderTime(); };
document.querySelectorAll('.spd').forEach(b => b.onclick = () => { speed = +b.dataset.spd; playing = true; renderTime(); });
setInterval(tick, 250);
$('btnGraves').onclick = showGraves;
$('btnHelp').onclick = showHelp;
$('btnNew').onclick = () => { if (!S || !S.alive || confirm('ละทิ้งชีวิตนี้และเกิดใหม่?')) showBirth(); };
$('overlay').onclick = e => { if (e.target.id === 'overlay' && S && S.alive && !$('game').hidden) closeOverlay(); };
$('eventBox').onclick = e => {
  const o = e.target.closest('[data-k]');
  if (o && !o.disabled) { const f = keyMap[+o.dataset.k]; if (f) f(); return; }
  const c = e.target.closest('[data-cat]');
  if (c) { actCat = c.dataset.cat; renderActs(); return; }
  const a = e.target.closest('[data-act]');
  if (a && !a.disabled) { run(() => doAct(S, a.dataset.act)); return; }
  if (e.target.closest('#btnNextYear')) { nextYearNow(); return; }
  if (e.target.closest('#hgBtn') || e.target.closest('#hgBar')) { huntPress(); return; }
  if (e.target.id === 'evTomb') showTomb();
  if (e.target.id === 'evNew') showBirth();
};
document.addEventListener('keydown', e => {
  if (!$('overlay').hidden) { if (e.key === 'Escape' && S && S.alive && !$('game').hidden) closeOverlay(); return; }
  if (!S || ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (S.hunt) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) huntPress(); } return; }
  if (/^[1-9]$/.test(e.key)) { const f = keyMap[+e.key - 1]; if (f) { e.preventDefault(); f(); } }
  else if (e.key === 'Enter') { e.preventDefault(); nextYearNow(); }
  else if (e.key === ' ') { e.preventDefault(); playing = !playing; renderTime(); }
});

showLanding();

$('mLast').onclick = e => { if (e.target.closest('[data-goto]')) setTab('story'); };
