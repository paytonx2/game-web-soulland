// ============================================================
// ล่าวงแหวนด้วยตัวเอง — มินิเกมกดให้ตรงจังหวะ
// เลือกสัตว์แล้ว → เลือกวิธีล่า: ลงมือเอง (มินิเกม) หรือให้ผู้คุ้มกัน/ผู้อาวุโสล่าให้ (ไม่ต้องเล่น)
// ความยากคำนวณจาก: อายุวงแหวน · ล่าเกินขีดจำกัดตัวเองแค่ไหน · ระดับพลังวิญญาณ · พละกำลัง/ความว่องไว/พลังจิต/ปัญญา
// โชคช่วยเรื่องจำนวนครั้งที่พลาดได้ และโอกาสซึมซับวงแหวนสำเร็จ
// ============================================================
function huntGameParams(s, years, compat) {
  const t = ringTierOf(years), ratio = years / ringLimit(s, s.rings.length);
  const over = Math.max(0, ratio - 0.7);                       // ยิ่งล่าเกินตัวยิ่งยาก
  const skill = (effStat(s, 'str') + effStat(s, 'agi')) / 200 * 0.5 + effStat(s, 'spi') / 100 * 0.3 + s.wis / 100 * 0.2;
  const edge = clamp((lvl(s) - (t + 1) * 12) / 40, -0.5, 0.5);  // ระดับพลังสูงกว่าเกณฑ์ของวงแหวนสีนั้นแค่ไหน
  const zone = clamp(0.26 * (1 + skill * 0.8 + edge * 0.6) / (1 + t * 0.22) / (1 + over * 1.2) * (compat ? 1.1 : 1), 0.05, 0.4);
  const speed = clamp(0.55 + t * 0.18 + over * 0.5 - skill * 0.15, 0.45, 1.9);
  const rounds = Math.min(6, 3 + Math.floor(t * 0.8 + over * 2));
  const lives = 1 + (s.luck >= 40 ? 1 : 0) + (s.luck >= 75 ? 1 : 0);
  const score = zone / speed;
  const label = score > 0.4 ? 'ง่าย' : score > 0.25 ? 'ปานกลาง' : score > 0.15 ? 'ยาก' : score > 0.08 ? 'โหดมาก' : 'แทบเป็นไปไม่ได้';
  return { t, ratio, zone, speed, rounds, lives, moving: t >= 3 || over > 0.6, label };
}
// โอกาสซึมซับวงแหวน (หลังล่าสำเร็จ) — แสดงให้ผู้เล่นเห็น
function absorbOdds(s, years, compat) {
  const h = huntCalc(s, years, compat);
  const soft = Math.max(0, h.ratio - 0.6) * 0.2 * (1 - s.luck / 120);
  return h.ratio > 1 ? 1 - h.absorb : 1 - soft;
}
// ผู้เล่นจำลอง (ใช้ในการจำลองสมดุล): โอกาสกดโดนแต่ละครั้งตามขนาดช่องและความเร็ว
function simHuntGame(p) {
  const pHit = clamp(p.zone * 2.2 / Math.sqrt(p.speed) + 0.05, 0.08, 0.95);
  let hits = 0, miss = 0, perfect = 0;
  while (hits < p.rounds && miss < p.lives) { if (R.chance(pHit)) { hits++; if (R.chance(0.25)) perfect++; } else miss++; }
  return { ok: hits >= p.rounds, hits, misses: miss, perfect };
}

E('huntMode', { forced: true, once: false, scene: 'hunt', make: s => {
  const c = s.huntPick, h = huntCalc(s, c.years, c.compat), p = huntGameParams(s, c.years, c.compat), rt = RING_TIERS[h.t];
  const ab = Math.round(absorbOdds(s, c.years, c.compat) * 100), know = s.wis >= 35 || !!s.mentor;
  return { title: `🐾 ${c.th} อายุ ${fmt(c.years)} ปี`, ctx: {},
    text: `คุณแกะรอยจนพบ<b>${c.th}</b> (วงแหวน${rt.th}) มันรับรู้ถึงการมาของคุณแล้ว จะลงมือเองหรือให้คนอื่นจัดการ?<br><span class="qhint">⚔️ ความยากถ้าล่าเอง: <b>${p.label}</b> · ต้องโจมตีเข้าเป้า ${p.rounds} ครั้ง · พลาดได้ ${p.lives - 1} ครั้ง${know ? ` · โอกาสซึมซับวงแหวนสำเร็จ ~${ab}%` : ''}</span>`,
    opts: [
      o('self', 'ลงมือล่าด้วยตัวเอง', 'มินิเกม: เข็มหมุนวนไม่หยุด กด Space / แตะ ตอนเข็มอยู่ในช่องทอง · สำเร็จแล้วได้ประสบการณ์และชื่อเสียงเพิ่ม · พลาดอาจบาดเจ็บหรือตาย', { fx: [['fame', 2], ['str', 1], ['agi', 1]] }),
      o('fight', 'ประลองกับสัตว์วิญญาณตรง ๆ', `ต่อสู้แบบเทิร์นกับ${c.th} · สัตว์จะแกร่งตามอายุวงแหวน · ชนะโดยเลือดเหลือมาก = ซึมซับง่ายขึ้น`, { danger: huntFightDeath(s, c) * 0.4, fx: [['fame', 3], ['str', 1]] }),
      h.free ? o('escort', s.familyTier >= 5 || s.path === 'clan' ? 'ให้ผู้อาวุโสจัดการให้' : 'ให้อาจารย์และทีมคุ้มกันจัดการให้', 'ปลอดภัยกว่ามาก ไม่ต้องเล่น', { danger: h.huntRisk * 0.3 * 0.3 })
        : o('escort', `จ้างทีมคุ้มกันล่าให้ (${fmt(h.cost)} เหรียญ)`, 'ปลอดภัยกว่ามาก ไม่ต้องเล่น', { fx: [['money', -h.cost]], danger: h.huntRisk * 0.3 * 0.3, lock: h.escort ? null : `เงินไม่พอ (ต้องมี ${fmt(h.cost)})` }),
      o('back', 'ถอยออกมา เลือกเป้าหมายใหม่', '', { fx: [] }),
    ] };
}, pick: {
  self: s => { const c = s.huntPick; s.hunt = { ...c, p: huntGameParams(s, c.years, c.compat) }; },
  fight: s => { const c = s.huntPick, h = huntCalc(s, c.years, c.compat); startBattle(s, 'beast', { title: `🐾 ประลองกับ${c.th} ${fmt(c.years)} ปี`, eid: 'huntFight', foeName: c.th, beast: true, years: c.years, lvlOff: clamp(Math.round((h.ratio - 0.8) * 20) + h.t * 2, -8, 40), deathP: huntFightDeath(s, c) }); },
  escort: s => { const c = s.huntPick; s.huntPick = null; resolveHunt(s, c.years, c.th, c.compat, { escort: true }); },
  back: s => { s.huntPick = null; s.yearHunt = false; },
} });

// จบมินิเกม — เรียกจาก UI (หรือผู้เล่นจำลอง)
function finishHuntGame(s, res) {
  const c = s.hunt; if (!c) return;
  s.hunt = null; s.huntPick = null;
  const seg0 = segStart(s), t = c.p.t;
  log(s, `🏹 คุณลงมือล่า${c.th}ด้วยตัวเอง — เข้าเป้า ${res.hits}/${c.p.rounds}${res.perfect ? ` (สมบูรณ์แบบ ${res.perfect})` : ''} · พลาด ${res.misses}`, 'act');
  if (res.misses) hurt(s, res.misses * R.i(3, 8) * (t + 1), `ถูก${c.th}ขย้ำระหว่างล่า`);
  if (s.alive && res.ok) {
    log(s, `⚔️ คุณเอาชนะ${c.th}ได้ด้วยมือตัวเอง!`, 'good');
    add(s, 'fame', 2 + t); add(s, 'str', 1); add(s, 'agi', 1); if (res.perfect >= 2) add(s, 'spi', 2);
    resolveHunt(s, c.years, c.th, c.compat, { self: true, perfect: res.perfect >= Math.ceil(c.p.rounds / 2) });
  } else if (s.alive) {
    const pd = [0.03, 0.06, 0.12, 0.22, 0.35][t] * (1 + Math.max(0, c.p.ratio - 1)) * (1 - s.luck / 300);
    s.yearHunt = true;
    if (R.chance(pd)) die(s, `ถูก${c.th} ${fmt(c.years)} ปีสังหารระหว่างล่าวงแหวนด้วยตัวเอง`);
    else {
      log(s, `💢 ${c.th}เหนือกว่าคุณ คุณหนีออกจากป่ามาได้อย่างหวุดหวิด — ปีนี้ไม่ได้วงแหวน`, 'bad');
      hurt(s, R.i(10, 25) * (1 + t * 0.4), `ถูก${c.th}สังหาร`);
      if (s.alive && R.chance(0.08 + t * 0.04)) randomDisability(s);
    }
  }
  segEnd(s, seg0);
  presentNext(s);
}

// ---------- ประลองกับสัตว์วิญญาณเพื่อชิงวงแหวน ----------
// ระดับของสัตว์ = ระดับผู้เล่น + ส่วนที่ล่าเกินขีดจำกัด · ยิ่งวงแหวนสีสูงยิ่งอันตราย
function huntFightDeath(s, c) { const h = huntCalc(s, c.years, c.compat); return clamp([0.04, 0.08, 0.16, 0.3, 0.45][h.t] * (h.ratio > 1 ? 1 + (h.ratio - 1) * 0.6 : 1) * (1 - s.luck / 300), 0.02, 0.85); }
E('huntFight', { forced: true, once: false, scene: 'hunt', make: s => ({ title: '', text: '', opts: [] }),
  battleEnd(s, won) {
    const c = s.huntPick; s.huntPick = null; s.yearHunt = true;
    if (!c) return;
    if (won) {
      const b = s._lastBattle, left = b ? Math.max(0, b.me.hp) / b.me.hpMax : 0.5;
      log(s, `⚔️ คุณโค่น${c.th}ได้ในการต่อสู้ตัวต่อตัว!${left > 0.6 ? ' (ชนะอย่างเด็ดขาด ร่างกายยังพร้อมซึมซับ)' : ''}`, 'good');
      add(s, 'fame', 3); add(s, 'str', 1);
      resolveHunt(s, c.years, c.th, c.compat, { self: true, perfect: left > 0.6 });
    } else log(s, `${c.th}เหนือกว่าคุณ — ปีนี้ไม่ได้วงแหวน`, 'bad');
  } });
