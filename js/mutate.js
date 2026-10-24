// ============================================================
// วิญญาณยุทธ์กลายพันธุ์ — เปลี่ยนได้ระหว่างชีวิต ดีสุดขีดหรือพังยับก็ได้
// รหัสวิญญาณยุทธ์กลายพันธุ์: "m:<คีย์1>+<คีย์2>:<วิญญาณยุทธ์ต้นแบบ>" — สร้างตัวจริงตอนเรียกใช้ (SOUL_BY_ID เป็น Proxy)
// ============================================================
const MUTATIONS = {
  // ดี
  king:    { th: 'ราชา', zh: '王', kind: 'good', d: 1, w: 10, desc: 'วิวัฒน์ขึ้นเป็นราชาแห่งเผ่าพันธุ์ของมัน' },
  twin:    { th: 'ธาตุคู่', zh: '双极', kind: 'good', d: 1, w: 7, desc: 'ธาตุตรงข้ามสองธาตุหลอมรวมกันได้อย่างสมดุล', stat: { spi: 4 } },
  ancient: { th: 'สายเลือดโบราณ', zh: '古血', kind: 'good', d: 1, w: 6, desc: 'สายเลือดโบราณที่หลับใหลในวิญญาณยุทธ์ตื่นขึ้น', stat: { str: 4 } },
  emperor: { th: 'จักรพรรดิ', zh: '皇', kind: 'good', d: 2, w: 2, desc: 'ก้าวข้ามขีดจำกัดของเผ่าพันธุ์ กลายเป็นจักรพรรดิแห่งวิญญาณยุทธ์' },
  divine:  { th: 'เทวะ', zh: '神', kind: 'good', d: 3, w: 0.5, minLuck: 70, desc: 'ร่องรอยของเทพปรากฏขึ้น ปาฏิหาริย์ที่ร้อยปีจะมีสักครั้ง', stat: { luck: 3 } },
  // ร้าย
  wither:  { th: 'เหี่ยวเฉา', zh: '枯', kind: 'bad', d: -1, w: 9, desc: 'พลังไหลออกจากวิญญาณยุทธ์เหมือนน้ำรั่วจากโอ่งร้าว' },
  crack:   { th: 'แตกร้าว', zh: '裂', kind: 'bad', d: -1, w: 6, desc: 'วิญญาณยุทธ์แตกร้าว ร่างกายรับแรงสะท้อนกลับ', stat: { hp: -20 } },
  dud:     { th: 'ไร้แก่น', zh: '废', kind: 'bad', d: -2, w: 2, desc: 'การกลายพันธุ์ล้มเหลวสิ้นเชิง แทบไม่เหลือพลังอะไรเลย', stat: { mood: -15 } },
  // แปลก (ได้อย่างเสียอย่าง)
  demon:   { th: 'อสูรมืด', zh: '邪', kind: 'wild', d: 1, w: 6, flag: 'darkSeed', desc: 'แข็งแกร่งขึ้น แต่ความมืดค่อย ๆ กัดกินจิตใจ', stat: { mood: -10 } },
  berserk: { th: 'คลุ้มคลั่ง', zh: '狂', kind: 'wild', d: 1, w: 5, role: 'power', life: -8, desc: 'พลังโจมตีพุ่งทะยาน แต่เผาผลาญอายุขัย (อายุขัย −8 ปี)' },
  shift:   { th: 'แปรสภาพ', zh: '异', kind: 'wild', d: 0, w: 7, role: 'random', desc: 'ธรรมชาติของวิญญาณยุทธ์เปลี่ยนไปโดยสิ้นเชิง ทักษะใหม่ไม่เหมือนเดิม' },
  frost:   { th: 'หิมะนิรันดร์', zh: '冰', kind: 'wild', d: 0, w: 4, role: 'control', desc: 'กลายเป็นธาตุน้ำแข็ง เปลี่ยนเป็นสายควบคุม', stat: { spi: 3 } },
};
const MUT_KIND_TH = { good: 'กลายพันธุ์ขั้นสูง', bad: 'กลายพันธุ์ล้มเหลว', wild: 'กลายพันธุ์ผิดแผก' };
const MUT_ROLES = ['power', 'agile', 'control', 'defense', 'support', 'heal'];

const parseSoulId = id => {
  if (!String(id).startsWith('m:')) return { keys: [], base: id };
  const [, k, base] = id.split(':');
  return { keys: k.split('+'), base };
};
// สร้างวิญญาณยุทธ์กลายพันธุ์จากรหัส (เรียกโดย Proxy ของ SOUL_BY_ID)
function buildMutant(id) {
  const { keys, base } = parseSoulId(id), b = SOUL_BASE[base];
  if (!b) return undefined;
  let tier = b.tier, role = b.role, th = b.th, zh = b.zh;
  for (const k of keys) {
    const m = MUTATIONS[k]; if (!m) continue;
    tier += m.d;
    if (m.role === 'random') role = MUT_ROLES.filter(r => r !== role)[[...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % (MUT_ROLES.length - 1)];
    else if (m.role) role = m.role;
    th = `${th}${m.th}`; zh = m.zh + zh;
  }
  const t = clamp(tier, 1, 5);
  return { ...b, id, base, th, zh, tier: t, role, over: tier - t, mutKeys: keys, mut: null };
}

function rollMutation(s, o = {}) {
  const lf = s.luck - 50, have = parseSoulId(s.souls[0]).keys;
  const kw = { good: Math.max(5, 38 + lf * 0.5 + (o.good || 0)), bad: Math.max(4, 34 - lf * 0.35 + (o.bad || 0)), wild: Math.max(5, 32 + (o.wild || 0)) };
  const kind = o.kind || R.wpick(Object.keys(kw), k => kw[k]);
  const cands = Object.entries(MUTATIONS).filter(([k, m]) => m.kind === kind && !have.includes(k) && (!m.minLuck || s.luck >= m.minLuck));
  return cands.length ? R.wpick(cands, ([, m]) => m.w * (o.big && m.d >= 2 ? 3 : 1))[0] : null;
}
// โอกาสโดยประมาณของแต่ละแบบ (แสดงให้ผู้เล่นเห็นก่อนเลือก)
function mutOdds(s, o = {}) {
  const lf = s.luck - 50;
  const g = Math.max(5, 38 + lf * 0.5 + (o.good || 0)), b = Math.max(4, 34 - lf * 0.35 + (o.bad || 0)), w = Math.max(5, 32 + (o.wild || 0)), t = g + b + w;
  return `ดี ${Math.round(g / t * 100)}% · ผิดแผก ${Math.round(w / t * 100)}% · พัง ${Math.round(b / t * 100)}%`;
}
const canMutate = s => s.awakened && (s.mutations || []).length < 3;

function mutateSoul(s, key, why) {
  if (!key) return;
  const old = SOUL_BY_ID[s.souls[0]], m = MUTATIONS[key];
  const { keys, base } = parseSoulId(s.souls[0]);
  let nid = `m:${[...keys, key].join('+')}:${base}`;
  // วิญญาณยุทธ์ที่มีร่างกลายพันธุ์ตามนิยาย (เช่น หญ้าเงินคราม → จักรพรรดิหญ้าเงินคราม) ใช้ร่างนั้นเมื่อกลายพันธุ์ดีครั้งแรก
  if (m.kind === 'good' && !keys.length && old.mut && SOUL_BASE[old.mut] && R.chance(0.6)) nid = old.mut;
  s.souls[0] = nid;
  const nw = SOUL_BY_ID[nid];
  (s.mutations = s.mutations || []).push({ age: s.age, key, kind: m.kind, from: old.th, to: nw.th });
  log(s, `🧬 <b>วิญญาณยุทธ์กลายพันธุ์!</b> ${why}`, m.kind === 'bad' ? 'bad' : 'gold');
  log(s, `${old.th} → <b>${nw.th} (${nw.zh})</b> · ระดับ${TIER_INFO[old.tier].th} → <b>${TIER_INFO[nw.tier].th}</b>${nw.role !== old.role ? ` · สาย${ROLE_TH[old.role]} → ${ROLE_TH[nw.role]}` : ''} — ${m.desc}`, m.kind === 'bad' ? 'bad' : m.kind === 'good' ? 'good' : 'warn');
  for (const [k, n] of Object.entries(m.stat || {})) add(s, k, n);
  if (m.flag) s.flags[m.flag] = true;
  if (m.life) s.lifeBase += m.life;
  if (nw.role !== old.role && s.rings.length) { s.rings.forEach((r, i) => r.skill = SKILL_NAMES[nw.role][i]); log(s, 'ทักษะวงแหวนทั้งหมดเปลี่ยนรูปตามวิญญาณยุทธ์ใหม่', 'muted'); }
  if (m.kind === 'good') addRoute(s, { limit: 0.5 * m.d });
  if (key === 'demon') addRoute(s, { rakshasa: 2, tyrant: 1 });
}

// ---------- เหตุการณ์ ----------
E('mu_stir', { age: [8, 70], w: s => 0.5 + (soulOf(s) && soulOf(s).tier <= 2 ? 0.6 : 0), cond: s => canMutate(s) && isCultivator(s), scene: 'night', make: s => ({
  title: '🧬 วิญญาณยุทธ์สั่นสะท้าน', text: `กลางดึก ${soulOf(s).th}ของคุณปรากฏออกมาเอง มันบิดตัวและเปล่งแสงแปลกประหลาด ราวกับกำลังจะกลายเป็นสิ่งใหม่ ถ้าปล่อยไว้ อาจกลายพันธุ์ไปในทางที่ดีหรือร้ายก็ได้`,
  opts: [
    o('let', 'ปล่อยให้มันกลายพันธุ์ตามธรรมชาติ', `ลุ้นดวง (${mutOdds(s)})`, { fx: [['', '🧬 กลายพันธุ์']] }),
    o('guide', 'ใช้สมาธิประคองการเปลี่ยนแปลง', `พลังจิตสูงช่วยให้ผลดีขึ้น (${mutOdds(s, { good: s.spi / 4, bad: -s.spi / 8 })}) แต่อาจบาดเจ็บ`, { fx: [['', '🧬 กลายพันธุ์'], ['hp', -10]], risk: { p: 0.1, hurt: [10, 25], cause: 'พลังวิญญาณย้อนกลับ', say: 'พลังวิญญาณย้อนเข้าเส้นลมปราณ!' } }),
    o('seal', 'กดมันไว้ ไม่ยอมเสี่ยง', 'ปลอดภัย ได้ฝึกพลังจิต', { fxa: [['spi', 2]] }),
  ],
}), pick: {
  let: s => mutateSoul(s, rollMutation(s), 'คุณปล่อยให้วิญญาณยุทธ์เปลี่ยนแปลงตามใจมัน'),
  guide: s => { add(s, 'hp', -10); if (s.alive) mutateSoul(s, rollMutation(s, { good: s.spi / 4, bad: -s.spi / 8 }), 'พลังจิตของคุณประคองทิศทางของการเปลี่ยนแปลง'); },
} });

E('mu_fruit', { age: [10, 60], w: 0.5, cond: s => canMutate(s), scene: 'forest', make: s => ({
  title: '🍇 ผลไม้ประหลาดใต้ต้นไม้ร้อยปี', text: 'ในป่าลึก คุณพบผลไม้สีม่วงเรืองแสงที่สัตว์วิญญาณไม่กล้าเข้าใกล้ ชาวบ้านเล่าว่าใครกินแล้ว วิญญาณยุทธ์จะเปลี่ยนไปตลอดกาล บ้างกลายเป็นยอดคน บ้างพังทั้งชีวิต',
  opts: [
    o('eat', 'กินมันเลย!', `ผลลัพธ์สุดขั้ว (${mutOdds(s, { bad: 12, wild: 6 })}) · มีพิษ`, { danger: 0.03, fx: [['', '🧬 กลายพันธุ์']], risk: { p: 0.2, hurt: [15, 35], die: 0.15, cause: 'พิษของผลไม้กลายพันธุ์', say: 'พิษแล่นเข้าเส้นเลือด!' } }),
    o('sell', 'เก็บไปขายพ่อค้ายา', 'ได้เงินก้อนหนึ่ง', { fxa: [['money', R.i(30, 80)]] }),
    o('leave', 'ปล่อยไว้ที่เดิม', 'ไม่เสี่ยง', { fxa: [['luck', 1]] }),
  ],
}), pick: { eat: s => mutateSoul(s, rollMutation(s, { bad: 12, wild: 6, big: true }), 'ผลไม้ประหลาดหลอมรวมกับวิญญาณยุทธ์ของคุณ') } });

E('mu_theory', { age: [8, 35], w: 1.0, cond: s => canMutate(s) && soulOf(s) && soulOf(s).tier <= 2 && isCultivator(s), scene: 'academy', make: s => {
  const p = pct(0.25 + s.wis / 200 + s.luck / 400 + (s.mentor ? 0.08 : 0));
  return { title: '📖 "ไม่มีวิญญาณยุทธ์ขยะ มีแต่วิญญาจารย์ขยะ"', ctx: { p },
    text: `นักทฤษฎีวิญญาณยุทธ์ผู้หนึ่งเห็น${soulOf(s).th}ของคุณ แล้วบอกว่าวิญญาณยุทธ์นี้มีศักยภาพซ่อนอยู่ ถ้าฝึกตามสูตรของเขาอย่างเคร่งครัดหนึ่งปี อาจปลุกการกลายพันธุ์ขั้นสูงได้ (ปัญญาและโชคช่วยเพิ่มโอกาส)`,
    opts: [
      o('train', 'ฝึกตามสูตรของเขาอย่างเคร่งครัด', 'ใช้เวลาเต็มปี · สำเร็จ = กลายพันธุ์ไปทางดีแน่นอน', { odds: p, fx: [['', '🧬 กลายพันธุ์ขั้นสูง']], win: { say: 'สูตรได้ผล! วิญญาณยุทธ์ตอบสนอง' }, lose: { fx: [['wis', 3]], say: 'วิญญาณยุทธ์ยังเหมือนเดิม แต่คุณเข้าใจมันมากขึ้น' } }),
      o('ask', 'ขอแค่คำแนะนำ', 'ได้ความรู้', { fxa: [['wis', 3]] }),
      o('scoff', 'ไม่เชื่อ เป็นแค่คนพูดเก่ง', '', { fxa: [] }),
    ] };
}, pick: { train: (s, c, won) => { s.ap = 0; if (won) mutateSoul(s, rollMutation(s, { kind: 'good' }), 'สูตรฝึกของนักทฤษฎีปลุกศักยภาพที่ซ่อนอยู่'); } } });

E('mu_ritual', { age: [16, 60], w: s => s.flags.darkSeed || s.path === 'evil' ? 2.5 : 0.6, cond: s => canMutate(s) && isCultivator(s), scene: 'night', make: s => ({
  title: '🩸 พิธีเลือดต้องห้าม', text: 'วิญญาจารย์ชั่วร้ายในหน้ากากเสนอพิธีหลอมเลือดสัตว์วิญญาณเข้ากับวิญญาณยุทธ์ "พลังที่เจ้าใฝ่ฝัน แลกกับนิดหน่อยเท่านั้น"',
  opts: [
    o('accept', 'เข้าร่วมพิธี', `ส่วนใหญ่ได้พลังแบบมืด (${mutOdds(s, { wild: 40, bad: 5 })}) · ชื่อเสียงเสีย`, { danger: 0.08, fx: [['', '🧬 กลายพันธุ์'], ['fame', -8]], risk: { p: 0.12, hurt: [25, 50], die: 0.5, cause: 'ร่างแหลกในพิธีเลือดต้องห้าม', say: 'เลือดสัตว์วิญญาณต่อต้านร่างของคุณ!' } }),
    o('report', 'แสร้งตกลง แล้วแจ้งตำหนักวิญญาณยุทธ์', 'ชื่อเสียงเพิ่ม เสี่ยงถูกล้างแค้น', { fxa: [['fame', 8]], risk: { p: 0.1, hurt: [10, 30], cause: 'ถูกลัทธิมืดล้างแค้น', say: 'พวกมันตามมาล้างแค้น!' } }),
    o('refuse', 'ปฏิเสธและจากไป', '', { fxa: [] }),
  ],
}), pick: { accept: s => { add(s, 'fame', -8); mutateSoul(s, rollMutation(s, { wild: 40, bad: 5 }), 'เลือดสัตว์วิญญาณหลอมเข้ากับวิญญาณยุทธ์ของคุณ'); addRoute(s, { tyrant: 1, rakshasa: 2 }); } } });

E('mu_second', { forced: true, once: true, when: s => !s.seen.mu_second && canMutate(s) && isCultivator(s) && lvl(s) >= 50 && yearlyRoll(s, 'secondAwk', 0.15), scene: 'temple', make: s => ({
  title: '🌌 การตื่นครั้งที่สองของวิญญาณยุทธ์', text: `ทะลวงระดับ ${lvl(s)} ได้ไม่นาน ${soulOf(s).th}ของคุณสั่นสะท้านรุนแรง วิญญาจารย์บางคนจะตื่นครั้งที่สองเมื่อพลังถึงจุดหนึ่ง และนี่คือโอกาสของคุณ จะชี้นำมันไปทางไหน?`,
  opts: [
    o('steer', 'ชี้นำด้วยความเข้าใจในวิญญาณยุทธ์', `ปัญญาและพลังจิตช่วยให้ผลดี (${mutOdds(s, { good: 15 + s.wis / 6, bad: -10 })})`, { fx: [['', '🧬 ตื่นครั้งที่สอง']] }),
    o('wild', 'ปลดปล่อยมันให้สุดทาง', `เสี่ยงสูง ได้สูง (${mutOdds(s, { wild: 15 })}) · มีโอกาสได้ร่างจักรพรรดิมากขึ้น`, { danger: 0.04, fx: [['', '🧬 ตื่นครั้งที่สอง']], risk: { p: 0.08, hurt: [20, 40], cause: 'พลังวิญญาณระเบิดระหว่างตื่นครั้งที่สอง', say: 'พลังวิญญาณพุ่งพล่านเกินควบคุม!' } }),
    o('seal', 'ผนึกไว้ รักษาวิญญาณยุทธ์เดิม', 'ไม่เปลี่ยนแปลง ได้พลังจิตเล็กน้อย', { fxa: [['spi', 3]] }),
  ],
}), pick: {
  steer: s => mutateSoul(s, rollMutation(s, { good: 15 + s.wis / 6, bad: -10 }), 'การตื่นครั้งที่สองเกิดขึ้นตามทิศทางที่คุณชี้นำ'),
  wild: s => mutateSoul(s, rollMutation(s, { wild: 15, big: true }), 'คุณปล่อยพลังที่ตื่นขึ้นให้ไหลไปสุดทาง'),
} });
