// ============================================================
// ระบบประลองแบบเทิร์น
// ============================================================
const BATTLE_KINDS = {
  spar:       { th:'ประลองมิตรภาพ', death:0.005, dis:0.02, hurt:[8, 22], surrenderDeath:0 },
  arena:      { th:'สนามประลองวิญญาณ', death:0.05, dis:0.07, hurt:[15, 40], surrenderDeath:0 },
  deathmatch: { th:'ประลองเป็นตาย', death:0.75, dis:0.4, hurt:[30, 70], surrenderDeath:0.4 },
};

function genFoeRings(level) {
  const n = Math.min(9, Math.max(0, Math.floor((level - 1) / 10)));
  const rings = [];
  for (let i = 0; i < n; i++) {
    const lo = Math.log10(RING_LIMITS[i] * 0.12), hi = Math.log10(RING_LIMITS[i] * 0.95);
    rings.push(Math.round(Math.pow(10, R.f(lo, hi))));
  }
  return rings;
}

function combatant(o) {
  const soul = SOUL_BY_ID[o.soul];
  const hpMax = Math.round((80 + o.level * 6 + o.str * 1.2) * (o.hpFrac ?? 1));
  const enMax = Math.round(30 + o.level * 2 + o.spi);
  return {
    name: o.name, level: o.level, soul: o.soul, rings: o.rings,
    str: o.str, agi: o.agi, spi: o.spi, luck: o.luck ?? 30,
    mult: [0, 0.7, 0.85, 1, 1.15, 1.35][soul.tier] * (1 + (soul.over || 0) * 0.12) * (0.5 + ROLE_COMBAT[soul.role] * 0.5) * (o.mult ?? 1),
    hp: Math.max(1, hpMax), hpMax: Math.round(80 + o.level * 6 + o.str * 1.2), en: enMax, enMax,
    shield: 0, buff: 0, stun: false, defending: false,
  };
}

function startBattle(s, kind, opts = {}) {
  const L = lvl(s);
  const fl = clamp(L + (opts.lvlOff ?? R.i(-5, 5)), 1, 99);
  const foeSoul = rollSoul(Math.max(3, s.familyTier), opts.tierMin || 1);
  const foeName = opts.foeName || genName(R.chance(0.5) ? 'M' : 'F').th;
  const foe = combatant({
    name: foeName, level: fl, soul: foeSoul, rings: genFoeRings(fl),
    str: 8 + fl * 0.8 + R.i(0, 20), agi: 8 + fl * 0.8 + R.i(0, 20), spi: 8 + fl * 0.8 + R.i(0, 20),
  });
  const me = combatant({
    name: s.name, level: L, soul: s.souls[0], rings: s.rings.map(r => r.years),
    str: effStat(s, 'str'), agi: effStat(s, 'agi'), spi: effStat(s, 'spi'), luck: s.luck,
    hpFrac: s.hp / maxHp(s),
    mult: 1 + disMod(s, 'combat') + (s.souls.length > 1 ? 0.15 : 0) + (s.flags.killing ? 0.12 : 0) + (s.flags.hiddenWeapon ? 0.08 : 0) + (s.flags.chaosHammer ? 0.06 : 0),
  });
  s.battle = {
    kind, title: opts.title || `⚔️ ${BATTLE_KINDS[kind].th}`, eid: opts.eid || null,
    foeTitle: opts.foeTitle || null, me, foe, turn: 1, over: false, result: null,
    log: [{ t: `${opts.foeTitle ? opts.foeTitle + ' ' : ''}<b>${foe.name}</b> — ระดับ ${fl} (${rankOf(fl).th}) · วิญญาณยุทธ์: ${soulLabel(foeSoul)} · วงแหวน ${foe.rings.length} วง`, c: 'muted' }],
  };
}

const baseAtk = e => (6 + e.level * 0.9 + (SOUL_BY_ID[e.soul].role === 'agile' ? e.agi : e.str) * 0.25) * e.mult * (e.buff > 0 ? 1.3 : 1);
const skillCost = i => 8 + i * 5;

const side = (b, x) => x === b.me ? 'me' : 'foe';
function hit(b, att, def, raw, label) {
  const dodge = clamp(5 + (def.agi - att.agi) * 0.25, 3, 35) / 100;
  if (Math.random() < dodge) { b.log.push({ t: `${def.name} หลบ${label}ได้!`, c: 'muted' }); b.anim.push({ a: side(b, att), t: 'miss', col: b._col, role: b._col ? b._role : null }); return 0; }
  let dmg = raw * R.f(0.85, 1.15);
  const crit = Math.random() < 0.08 + att.luck / 2000;
  if (crit) dmg *= 1.6;
  if (def.defending) dmg *= 0.4;
  if (def.shield > 0) { dmg *= 0.4; def.shield--; }
  dmg = Math.max(1, Math.round(dmg));
  def.hp -= dmg;
  b.anim.push({ a: side(b, att), t: 'hit', n: dmg, crit, col: b._col, role: b._col ? b._role : null, stun: false });
  b.log.push({ t: `${att.name} ใช้${label} ${crit ? '<b>คริติคอล!</b> ' : ''}สร้างความเสียหาย <b>${dmg}</b>`, c: att === b.me ? 'good' : 'bad' });
  return dmg;
}

function act(b, att, def, action) {
  att.defending = false; b._col = null;
  if (att.stun) { att.stun = false; b.log.push({ t: `${att.name} ถูกควบคุม ขยับไม่ได้!`, c: 'warn' }); b.anim.push({ a: side(b, att), t: 'stun' }); return; }
  if (att.buff > 0) att.buff--;
  if (action === 'attack') { hit(b, att, def, baseAtk(att), 'การโจมตีปกติ'); att.en = Math.min(att.enMax, att.en + 5); return; }
  if (action === 'defend') {
    att.defending = true; b.anim.push({ a: side(b, att), t: 'def' }); att.en = Math.min(att.enMax, att.en + 15);
    att.hp = Math.min(att.hpMax, att.hp + Math.round(att.hpMax * 0.04));
    b.log.push({ t: `${att.name} ตั้งท่าป้องกันและรวบรวมพลังวิญญาณ`, c: 'muted' });
    return;
  }
  // ทักษะวงแหวน
  const i = +action.split(':')[1], years = att.rings[i];
  att.en -= skillCost(i);
  b._col = RING_TIERS[ringTierOf(years)].color; b._role = SOUL_BY_ID[att.soul].role;
  const role = SOUL_BY_ID[att.soul].role;
  const pow = baseAtk(att) * (1.2 + ringPower(years) / 35);
  const name = `ทักษะวงแหวนที่ ${i + 1} 「${SKILL_NAMES[role][i]}」`;
  if (role === 'control') { if (hit(b, att, def, pow * 0.7, name) && Math.random() < 0.55) { def.stun = true; b.log.push({ t: `${def.name} ถูกพันธนาการ!`, c: 'warn' }); } }
  else if (role === 'defense') { att.shield = 2; hit(b, att, def, pow * 0.6, name); }
  else if (role === 'support' || role === 'food') { att.buff = 3; b.anim.push({ a: side(b, att), t: 'buff', col: b._col }); b.log.push({ t: `${att.name} ใช้${name} พลังโจมตีเพิ่มขึ้น 30%`, c: 'muted' }); hit(b, att, def, pow * 0.5, 'แรงกระแทกของทักษะ'); }
  else if (role === 'heal') { const h = Math.round(pow * 1.2); att.hp = Math.min(att.hpMax, att.hp + h); b.anim.push({ a: side(b, att), t: 'heal', n: h }); b.log.push({ t: `${att.name} ใช้${name} ฟื้นฟู ${h} HP`, c: 'good' }); hit(b, att, def, pow * 0.3, 'พลังวิญญาณ'); }
  else hit(b, att, def, pow, name);
}

function foeAI(b) {
  const f = b.foe, role = SOUL_BY_ID[f.soul].role;
  const usable = f.rings.map((_, i) => i).filter(i => f.en >= skillCost(i));
  if (role === 'heal' && f.hp < f.hpMax * 0.35 && usable.length) return 'skill:' + usable[usable.length - 1];
  if (usable.length && Math.random() < 0.55) return 'skill:' + R.pick(usable.slice(-3));
  return Math.random() < 0.15 ? 'defend' : 'attack';
}

function battleAction(s, action) {
  const b = s.battle;
  if (!b || b.over) return;
  b.anim = [];
  if (action === 'surrender') { b.over = true; b.result = 'surrender'; b.log.push({ t: 'คุณยอมแพ้', c: 'bad' }); return; }
  if (action.startsWith('skill:') && b.me.en < skillCost(+action.split(':')[1])) return;
  b.log.push({ t: `— เทิร์น ${b.turn} —`, c: 'turn' });
  act(b, b.me, b.foe, action);
  if (b.foe.hp <= 0) { b.over = true; b.result = 'win'; b.log.push({ t: `🏆 ${b.foe.name} พ่ายแพ้!`, c: 'gold' }); return; }
  act(b, b.foe, b.me, foeAI(b));
  if (b.me.hp <= 0) { b.over = true; b.result = 'lose'; b.log.push({ t: '💀 คุณล้มลงไม่อาจลุกขึ้น', c: 'death' }); return; }
  b.turn++;
}

function finishBattle(s) {
  const b = s.battle;
  if (!b || !b.over) return;
  s._delta = [];
  s.battle = null;
  const seg0 = segStart(s);
  const K = BATTLE_KINDS[b.kind];
  const won = b.result === 'win';
  // บาดแผลจากการต่อสู้ติดตัวกลับมา
  s.hp = Math.max(won ? 5 : Math.round(maxHp(s) * 0.35), Math.round(maxHp(s) * Math.max(0, b.me.hp) / b.me.hpMax));
  const label = b.eid ? b.title : K.th;
  if (won) {
    log(s, `🏆 ชนะ${label} — เอาชนะ ${b.foe.name} (ระดับ ${b.foe.level})`, 'good');
    if (isCultivator(s)) s.level = Math.min(ringCap(s), s.level + 0.3 + Math.max(0, b.foe.level - lvl(s)) * 0.1);
    if (!b.eid) {
      if (b.kind === 'spar') add(s, 'fame', 2);
      if (b.kind === 'arena') { add(s, 'money', Math.round((5 + b.foe.level * 1.5) * R.f(0.8, 1.4))); add(s, 'fame', R.i(3, 6)); }
      if (b.kind === 'deathmatch') { add(s, 'money', Math.round((20 + b.foe.level * 4) * R.f(0.8, 1.4))); add(s, 'fame', R.i(8, 14)); }
    }
  } else {
    const surr = b.result === 'surrender';
    log(s, surr ? `🏳️ คุณยอมแพ้ใน${label}` : `💔 แพ้${label} ให้ ${b.foe.name}`, 'bad');
    const pDeath = surr ? K.surrenderDeath : K.death;
    const cause = b.kind === 'deathmatch' ? `ถูก${b.foeTitle || ''} ${b.foe.name} สังหารใน${label}` : `เสียชีวิตจากท่าไม้ตายใน${label}`;
    if (R.chance(pDeath)) die(s, cause);
    else {
      if (!surr) hurt(s, R.i(K.hurt[0], K.hurt[1]), cause, false);
      if (s.alive && !surr && R.chance(K.dis)) randomDisability(s);
      if (!b.eid) add(s, 'fame', -1);
    }
  }
  if (s.alive && b.eid && EVENTS[b.eid].battleEnd) EVENTS[b.eid].battleEnd(s, won);
  if (s.alive && won) questHook(s, 'battle', b.eid || b.kind);
  segEnd(s, seg0);
  presentNext(s);
}
