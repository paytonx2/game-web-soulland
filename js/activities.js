// ============================================================
// กิจกรรมในแต่ละปี — ใช้แต้มเวลา (AP) ปีละ 2–4 แต้ม
// กิจกรรมที่ผู้เล่นเลือกบ่อยจะสะสมเป็น "นิสัย" แล้วระบบใช้แต้มที่เหลือแทนตามนิสัยนั้นเมื่อจบปี
// ============================================================
const ACTS = [];
// def: { id, cat, icon, t, d, ap, rep, tend, when(s), lock(s)->เหตุผล|null, fx(s)->ตัวอย่างผล, odds(s), danger(s), noAuto, run(s) }
function A(def) { ACTS.push(Object.assign({ ap: 1, rep: 1, noAuto: false }, def)); }
const ACT_CATS = {
  cult: '🌀 บำเพ็ญ', body: '💪 ฝึกฝน', study: '📖 ความรู้', money: '💰 หาเงิน',
  adv: '🗺️ ผจญภัย', fight: '⚔️ ประลอง', social: '🤝 สังคม', rest: '🍵 พักผ่อน', shop: '🛒 ร้านค้า', dark: '🌑 มืด',
};
const growthPreview = (s, f) => isCultivator(s) && !isBottleneck(s) ? `+${(cultUnit(s) * f).toFixed(1)}` : '0';
function cultUnit(s) {
  const soul = soulOf(s);
  if (!soul || !isCultivator(s)) return 0;
  const base = s.innate * 0.42 + (s.innate === 10 ? 0.6 : 0);
  const mult = TIER_INFO[soul.tier].mult * familyOf(s).train * (pathOf(s).cult || 0.8) * (0.7 + s.wis / 100 * 0.6) * (s.mentor ? 1.2 : 1) * (s.souls.length > 1 ? 1.15 : 1) * (1 + disMod(s, 'cult'));
  return base * mult / (1 + Math.max(0, s.level - 20) / 11) * (s.age > 40 ? Math.max(0.3, 1 - (s.age - 40) / 80) : 1);
}
const inSchool = s => ['school', 'academy'].includes(pathOf(s).group) && s.path !== 'home';
const cultReq = s => isCultivator(s) ? null : 'ต้องมีพลังวิญญาณ';

// ---------- วัยเด็กเล็ก ----------
A({ id:'play', cat:'body', icon:'🪁', t:'วิ่งเล่นกับเด็กในหมู่บ้าน', d:'ร่างกายคล่องแคล่ว อารมณ์ดี', tend:'body', rep:2, when: s => s.age < 6, fx: () => [['agi', 2], ['mood', 4]], run: s => { add(s, 'agi', R.i(1, 2)); add(s, 'mood', R.i(3, 6)); } });
A({ id:'chores', cat:'money', icon:'🧺', t:'ช่วยพ่อแม่ทำงานบ้าน', d:'พละกำลังเพิ่ม พ่อแม่ชื่นใจ', tend:'social', when: s => s.age < 6, fx: () => [['str', 2], ['mood', 2]], run: s => { add(s, 'str', R.i(1, 2)); add(s, 'mood', 2); } });
A({ id:'kidstory', cat:'study', icon:'📜', t:'ฟังปู่ย่าเล่านิทานวิญญาจารย์', d:'ปัญญาเพิ่ม', tend:'study', when: s => s.age < 6, fx: () => [['wis', 2]], run: s => add(s, 'wis', R.i(1, 3)) });
A({ id:'kidnap', cat:'rest', icon:'😴', t:'นอนกลางวัน', d:'ฟื้นฟูร่างกาย', tend:'rest', when: s => s.age < 6, fx: () => [['hp', 15]], run: s => add(s, 'hp', 15) });
A({ id:'kidwander', cat:'adv', icon:'🐞', t:'แอบออกไปสำรวจท้ายหมู่บ้าน', d:'โชคดีอาจเจอของดี', tend:'adv', when: s => s.age >= 3 && s.age < 6, fx: () => [['luck', 2]], danger: () => 0.01, run: s => {
  if (R.chance(0.1)) { log(s, 'คุณตกคูน้ำ ขาเจ็บไปหลายวัน', 'bad'); hurt(s, R.i(5, 15), 'อุบัติเหตุในวัยเด็ก'); }
  else if (R.chance(0.3)) { add(s, 'money', 1); log(s, 'คุณเจอเหรียญทองตกอยู่ข้างทาง!', 'good'); } else add(s, 'luck', 1);
} });

// ---------- บำเพ็ญ ----------
A({ id:'meditate', cat:'cult', icon:'🧘', t:'นั่งสมาธิบำเพ็ญพลังวิญญาณ', d:'วิธีมาตรฐานที่ปลอดภัย', tend:'cult', rep:2, when: s => s.age >= 6, lock: s => cultReq(s) || (isBottleneck(s) ? 'ติดคอขวด ต้องล่าวงแหวนก่อน' : null), fx: s => [['soul', growthPreview(s, 0.35)], ['spi', 1]], run: s => { cultivate(s, 0.35); if (R.chance(0.5)) add(s, 'spi', 1); } });
A({ id:'hardcult', cat:'cult', icon:'🔥', t:'บำเพ็ญหักโหมทั้งคืน', d:'พลังเพิ่มมาก แต่ลมปราณอาจย้อนกลับ', tend:'cult', when: s => s.age >= 8, lock: s => cultReq(s) || (isBottleneck(s) ? 'ติดคอขวด' : null), fx: s => [['soul', growthPreview(s, 0.65)], ['mood', -4]], danger: () => 0.004, run: s => {
  cultivate(s, 0.65); add(s, 'mood', -4);
  if (R.chance(0.06)) { log(s, '💢 ลมปราณย้อนกลับ!', 'bad'); outcome(s, { hurt: [20, 45], dis: 0.3, die: 0.04, cause: 'ลมปราณย้อนกลับจนเส้นลมปราณแตก' }, false); }
} });
A({ id:'herbbath', cat:'cult', icon:'🛁', t:'แช่น้ำยาสมุนไพรบำรุงวิญญาณ', d:'ใช้เงิน 15 · บำเพ็ญและฟื้นฟูร่างกาย', tend:'cult', when: s => s.age >= 8, lock: s => cultReq(s) || (s.money < 15 ? 'เงินไม่ถึง 15' : isBottleneck(s) ? 'ติดคอขวด' : null), fx: s => [['money', -15], ['soul', growthPreview(s, 0.4)], ['hp', 15]], run: s => { add(s, 'money', -15); cultivate(s, 0.4); add(s, 'hp', 15); } });
A({ id:'xuantian', cat:'cult', icon:'☯️', t:'ฝึกวิชาเสวียนเทียน (玄天功)', d:'วิชาสำนักถัง บำเพ็ญได้ดีกว่าปกติ', tend:'cult', when: s => s.arts && s.arts.xuantian, lock: s => cultReq(s) || (isBottleneck(s) ? 'ติดคอขวด' : null), fx: s => [['soul', growthPreview(s, 0.5)], ['spi', 2]], run: s => { cultivate(s, 0.5); add(s, 'spi', R.i(1, 2)); } });
A({ id:'goHunt', cat:'cult', icon:'🔮', t:'ออกล่าวงแหวนวิญญาณ', d:'เลือกสัตว์วิญญาณที่จะล่า', tend:'adv', ap:1, noAuto:true, when: s => isBottleneck(s), lock: s => s.yearHunt ? 'ล่าไปแล้วปีนี้' : null, fx: () => [['soul', '+วงแหวน']], run: s => { s.huntWait = -1; present(s, 'hunt'); } });

// ---------- ฝึกฝน ----------
A({ id:'trainbody', cat:'body', icon:'🏋️', t:'ฝึกร่างกายหนัก', d:'แบกหิน วิ่งขึ้นเขา', tend:'body', rep:2, when: s => s.age >= 6, fx: () => [['str', 3], ['agi', 1], ['hp', -5]], danger: () => 0.002, run: s => {
  add(s, 'str', R.i(2, 3)); add(s, 'agi', R.i(0, 1)); add(s, 'hp', -5);
  if (R.chance(0.03)) { log(s, '🩸 คุณบาดเจ็บระหว่างฝึก', 'bad'); outcome(s, { hurt: [10, 25], dis: 0.12, die: 0.02, cause: 'อุบัติเหตุระหว่างฝึก' }, false); }
} });
A({ id:'trainagi', cat:'body', icon:'💨', t:'ฝึกท่าเท้าและการหลบหลีก', d:'ความว่องไวเพิ่ม (มากขึ้นถ้ารู้ก้าวเงาภูตมายา)', tend:'body', when: s => s.age >= 6, fx: s => [['agi', s.arts && s.arts.ghost ? 4 : 2]], run: s => add(s, 'agi', R.i(1, 2) + (s.arts && s.arts.ghost ? 2 : 0)) });
A({ id:'throwing', cat:'body', icon:'🎯', t:'ฝึกขว้างอาวุธลับ', d:'แม่นยำ ว่องไว พลังจิตเฉียบคม', tend:'fight', when: s => s.age >= 8 && (s.weapons.length || s.flags.tangFriend || s.flags.tangSect || s.flags.hiddenWeapon), fx: () => [['agi', 2], ['spi', 2]], run: s => { add(s, 'agi', R.i(1, 2)); add(s, 'spi', R.i(1, 2)); } });
A({ id:'sparfriend', cat:'fight', icon:'🤼', t:'ประลองซ้อมกับเพื่อน', d:'ประลองมิตรภาพ ได้ประสบการณ์', tend:'fight', noAuto:true, when: s => s.age >= 7, lock: cultReq, fx: () => [['fame', 2], ['soul', '+0.3']], run: s => startBattle(s, 'spar', { title:'🤼 ประลองซ้อม', eid:'actSpar', lvlOff:R.i(-3, 3) }) });

// ---------- ความรู้ ----------
A({ id:'library', cat:'study', icon:'📚', t:'อ่านตำราในห้องสมุด', d:'ปัญญาเพิ่ม (นอกสถาบันเสียค่าเข้า 2)', tend:'study', rep:2, when: s => s.age >= 6, lock: s => !inSchool(s) && s.money < 2 ? 'เงินไม่ถึง 2' : null, fx: s => [['wis', 3], ...(inSchool(s) ? [] : [['money', -2]])], run: s => { if (!inSchool(s)) add(s, 'money', -2); add(s, 'wis', R.i(2, 3)); } });
A({ id:'lecture', cat:'study', icon:'👨‍🏫', t:'เข้าฟังบรรยายของอาจารย์', d:'ความรู้และเทคนิคบำเพ็ญ', tend:'study', when: s => inSchool(s), fx: s => [['wis', 3], ['soul', growthPreview(s, 0.15)]], run: s => { add(s, 'wis', R.i(2, 4)); cultivate(s, 0.15); } });
A({ id:'askmaster', cat:'study', icon:'🧙', t:`ขอคำชี้แนะจากอาจารย์`, d:'อาจารย์วิเคราะห์จุดอ่อนวิญญาณยุทธ์ของคุณ', tend:'study', when: s => !!s.mentor, fx: () => [['wis', 4], ['spi', 1]], run: s => { add(s, 'wis', R.i(3, 5)); add(s, 'spi', 1); if (R.chance(0.15)) { log(s, `${s.mentor}สอน "ทฤษฎีวิญญาณยุทธ์สิบประการ" ให้คุณเข้าใจวิญญาณยุทธ์ตัวเองลึกซึ้งขึ้น`, 'good'); add(s, 'soul', 1); } } });
A({ id:'tangmanual', cat:'study', icon:'📕', t:'ศึกษาคัมภีร์ 玄天宝录 ของสำนักถัง', d:'มีโอกาสเรียนวิชาลับสำนักถังเพิ่ม (ขึ้นกับปัญญา)', tend:'study', when: s => (s.flags.tangFriend || s.flags.tangSect || s.flags.hiddenWeapon) && Object.keys(TANG_ARTS).some(k => !s.arts[k]), odds: s => statOdds(s, 'wis', 0.2, 110), fx: () => [['wis', 2], ['', '📕 วิชาใหม่']], run: s => {
  add(s, 'wis', 2);
  if (R.chance(statOdds(s, 'wis', 0.2, 110))) learnArt(s); else log(s, 'คุณยังไม่เข้าใจเคล็ดวิชาในคัมภีร์', 'muted');
} });
A({ id:'teachkids', cat:'study', icon:'🏫', t:'สอนหนังสือเด็ก ๆ', d:'ได้ชื่อเสียงและเงินเล็กน้อย', tend:'social', when: s => s.age >= 18 && s.wis >= 40, fx: () => [['fame', 1], ['money', 4], ['wis', 1]], run: s => { add(s, 'fame', 1); add(s, 'money', 4); add(s, 'wis', 1); } });

// ---------- หาเงิน ----------
A({ id:'oddjob', cat:'money', icon:'🧹', t:'ทำงานรับจ้างทั่วไป', d:'ได้เงินตามฝีมือ', tend:'money', rep:2, when: s => s.age >= 7, fx: s => [['money', Math.round(3 + lvl(s) * 0.6)], ['str', 1]], run: s => { add(s, 'money', Math.round((3 + lvl(s) * 0.6) * R.f(0.8, 1.2))); if (R.chance(0.5)) add(s, 'str', 1); } });
A({ id:'guild', cat:'money', icon:'📯', t:'รับภารกิจจากกิลด์วิญญาจารย์', d:'เงินดี แต่มีความเสี่ยง', tend:'money', when: s => isCultivator(s) && s.rings.length >= 1, fx: s => [['money', 10 + lvl(s) * 2], ['fame', 1]], danger: () => 0.008, run: s => {
  if (R.chance(0.08)) { log(s, 'ภารกิจผิดพลาด! คุณถูกซุ่มโจมตี', 'bad'); outcome(s, { hurt: [15, 40], die: 0.04, cause: 'ตายระหว่างภารกิจกิลด์' }, false); return; }
  add(s, 'money', Math.round((10 + lvl(s) * 2) * R.f(0.8, 1.3))); add(s, 'fame', 1);
} });
A({ id:'forge', cat:'money', icon:'⚒️', t:'ตีเหล็กขาย', d:'ได้เงินและพละกำลัง', tend:'money', when: s => s.age >= 10 && (s.path === 'smith' || s.flags.chaosHammer || s.place === 'gengxin' || s.place === 'shenghun'), fx: () => [['money', 7], ['str', 2]], run: s => { add(s, 'money', R.i(5, 9)); add(s, 'str', R.i(1, 2)); } });
A({ id:'sellparts', cat:'money', icon:'🦴', t:'ล่าสัตว์วิญญาณขายชิ้นส่วน', d:'ขายหนังและกระดูกสัตว์', tend:'adv', when: s => isCultivator(s) && s.age >= 10, fx: s => [['money', 8 + lvl(s)]], danger: () => 0.006, run: s => {
  if (R.chance(0.07)) { log(s, 'สัตว์วิญญาณตัวใหญ่กว่าที่คิด!', 'bad'); outcome(s, { hurt: [15, 35], die: 0.04, cause: 'ถูกสัตว์วิญญาณสังหาร' }, false); return; }
  add(s, 'money', Math.round((8 + lvl(s)) * R.f(0.7, 1.3)));
} });
A({ id:'speculate', cat:'money', icon:'📈', t:'ค้าขายเก็งกำไรในตลาด', d:'ลงทุน 20 เหรียญ', tend:'money', when: s => s.age >= 14, lock: s => s.money < 20 ? 'ต้องมีเงิน 20' : null, odds: s => statOdds(s, 'wis', 0.3, 120), fx: () => [['money', '±20']], run: s => {
  if (R.chance(statOdds(s, 'wis', 0.3, 120))) { add(s, 'money', R.i(15, 35)); log(s, 'คุณได้กำไร!', 'good'); } else { add(s, 'money', -20); log(s, 'ขาดทุน', 'bad'); }
} });

// ---------- ผจญภัย ----------
A({ id:'stardou', cat:'adv', icon:'🌲', t:'สำรวจชายป่าดาวซิงโต่ว (星斗大森林)', d:'อาจพบสมุนไพร สมบัติ หรือสัตว์วิญญาณดุร้าย', tend:'adv', when: s => s.age >= 10, danger: s => 0.004, fx: () => [['luck', '?'], ['money', '?']], run: s => {
  const r = Math.random(), cp = combatPower(s);
  if (r < clamp(0.12 - cp / 3000, 0.03, 0.12)) { log(s, '🐺 ฝูงหมาป่าวายุปีศาจล้อมคุณ!', 'bad'); outcome(s, { hurt: [15, 40], dis: 0.08, die: 0.04, cause: 'ถูกสัตว์วิญญาณขย้ำในป่าดาวซิงโต่ว' }, false); }
  else if (r < 0.3 + s.luck / 1000) { s.flags.redBeast = true; log(s, '🐉 คุณพบร่องรอยรังสัตว์วิญญาณหมื่นปี! (ปลดล็อกวงแหวนดำ/แดง)', 'gold'); }
  else if (r < 0.55) { add(s, 'spi', R.i(1, 3)); add(s, 'hp', 15); log(s, '🍄 คุณพบสมุนไพรวิเศษ', 'good'); }
  else { const m = R.i(5, 25); add(s, 'money', m); log(s, `💎 คุณพบซากวิญญาจารย์พร้อมถุงเงิน ${m} เหรียญ`, 'good'); }
} });
A({ id:'sunset', cat:'adv', icon:'🌅', t:'ตามหาสมุนไพรในป่าอาทิตย์อัสดง (落日森林)', d:'ป่าพิษ เต็มไปด้วยสมุนไพรหายาก', tend:'adv', when: s => s.age >= 12, danger: () => 0.003, fx: () => [['wis', '?'], ['spi', '?']], run: s => {
  if (R.chance(s.flags.poisonRes ? 0.03 : 0.1)) { log(s, '☠️ คุณเหยียบพุ่มไม้พิษ!', 'bad'); outcome(s, { hurt: [10, 30], die: 0.03, cause: 'ถูกพิษในป่าอาทิตย์อัสดง' }, false); return; }
  add(s, 'wis', R.i(1, 3)); add(s, 'spi', R.i(1, 3));
  if (!s.flags.iceFire && lvl(s) >= 20 && R.chance(0.06 + s.luck / 2000)) { s.flags.iceFire = true; add(s, 'str', 8); add(s, 'spi', 8); log(s, '☯️ คุณหลงเข้าไปพบ <b>ตาน้ำหยินหยางน้ำแข็งเพลิง</b> และได้รับการชำระร่าง!', 'gold'); }
} });
A({ id:'travel', cat:'adv', icon:'🐎', t:'ท่องเที่ยวเมืองอื่น', d:'เปิดหูเปิดตา ใช้เงิน 5', tend:'adv', when: s => s.age >= 12, lock: s => s.money < 5 ? 'เงินไม่ถึง 5' : null, fx: () => [['money', -5], ['wis', 2], ['luck', 1], ['mood', 4]], run: s => {
  add(s, 'money', -5); add(s, 'wis', 2); add(s, 'mood', 4); add(s, 'luck', 1);
  const p = R.pick(PLACES.filter(x => x.id !== s.place));
  log(s, `คุณเดินทางไปเยือน${p.th} (${p.zh})`, 'muted');
} });

// ---------- ประลอง ----------
A({ id:'arena', cat:'fight', icon:'🏟️', t:'ลงสนามประลองวิญญาณใหญ่ซั่วทัว', d:'ชนะได้เงิน ชื่อเสียง และตราประลอง · แพ้อาจตาย 5%', tend:'fight', noAuto:true, when: s => s.age >= 12 && isCultivator(s), lock: s => s.rings.length < 1 ? 'ต้องมีวงแหวนอย่างน้อย 1 วง' : null, fx: s => [['money', '+'], ['fame', '+']], danger: () => 0.025, run: s => startBattle(s, 'arena', { title:'🏟️ สนามประลองวิญญาณใหญ่ซั่วทัว', eid:'actArena' }) });
A({ id:'deathduel', cat:'fight', icon:'☠️', t:'ประลองเป็นตายใต้ดิน', d:'รางวัลมหาศาล · แพ้ตาย 75%', tend:'fight', noAuto:true, when: s => s.age >= 16 && isCultivator(s), lock: s => s.rings.length < 2 ? 'ต้องมีวงแหวน 2 วง' : null, fx: s => [['money', 20 + lvl(s) * 4], ['fame', 10]], danger: () => 0.35, run: s => startBattle(s, 'deathmatch', { title:'☠️ สังเวียนใต้ดิน', eid:'actDeath' }) });

// ---------- สังคม ----------
A({ id:'family', cat:'social', icon:'🏠', t:'กลับบ้านเยี่ยมครอบครัว', d:'อบอุ่นใจ', tend:'social', when: s => s.age >= 6 && !s.once_parents_gone, fx: () => [['mood', 8], ['luck', 1]], run: s => { add(s, 'mood', R.i(6, 10)); if (R.chance(0.4)) { const m = Math.max(1, Math.round(familyOf(s).income * 0.15)); add(s, 'money', m); log(s, `แม่แอบใส่เงิน ${m} เหรียญไว้ในห่อผ้าให้`, 'good'); } } });
A({ id:'friends', cat:'social', icon:'🍻', t:'สังสรรค์กับเพื่อน', d:'ได้มิตรภาพ อาจได้เพื่อนใหม่', tend:'social', when: s => s.age >= 8, fx: () => [['mood', 6]], run: s => { add(s, 'mood', R.i(4, 8)); if (!s.friend && R.chance(0.35)) { s.friend = genName(R.chance(0.5) ? 'M' : 'F').th; log(s, `🤝 คุณได้เพื่อนสนิทชื่อ ${s.friend}`, 'good'); } } });
A({ id:'date', cat:'social', icon:'💕', t:'ใช้เวลากับคนรัก', d:'ความรักเบ่งบาน', tend:'social', when: s => !!s.partner, fx: () => [['mood', 10]], run: s => { add(s, 'mood', R.i(8, 12)); if (!s.flags.married && s.age >= 18 && R.chance(0.3)) s.queue.unshift('marriage'); } });
A({ id:'festival', cat:'social', icon:'🏮', t:'ไปงานเทศกาลโคมไฟหาคู่', d:'อาจพบเนื้อคู่', tend:'social', when: s => s.age >= 15 && s.age <= 45 && !s.partner, odds: s => pct(0.25 + s.fame / 300 + s.luck / 400), fx: () => [['mood', 5]], run: s => {
  add(s, 'mood', 5);
  if (R.chance(pct(0.25 + s.fame / 300 + s.luck / 400))) { const n = genName(s.gender === 'M' ? 'F' : 'M'); s.partner = n.th; log(s, `💕 คุณได้พบ <b>${n.th} (${n.zh})</b> และตกหลุมรักกัน`, 'good'); }
  else log(s, 'สนุกดี แต่ยังไม่พบคนที่ใช่', 'muted');
} });
A({ id:'fusion', cat:'fight', icon:'💫', t:'ฝึกทักษะผสานวิญญาณยุทธ์ (武魂融合技)', d:'ต้องมีเพื่อนร่วมทีม/คนรักที่ใจตรงกัน · ระดับ 30+', tend:'fight', when: s => isCultivator(s) && !s.flags.fusion && (s.flags.team || s.partner || s.friend), lock: s => lvl(s) < 30 ? 'ต้องระดับ 30+' : null, odds: s => statOdds(s, 'spi', 0.1, 150), fx: () => [['', '💫 ทักษะผสาน (+10% ต่อสู้)']], run: s => {
  if (R.chance(statOdds(s, 'spi', 0.1, 150))) { s.flags.fusion = R.pick(FUSION_SKILLS); log(s, `💫 คุณกับคู่หูคิดค้น <b>${s.flags.fusion}</b> สำเร็จ!`, 'gold'); add(s, 'fame', 5); }
  else log(s, 'พลังวิญญาณยังไม่ประสานกัน', 'muted');
} });
A({ id:'charity', cat:'social', icon:'🤲', t:'ช่วยเหลือชาวบ้านยากไร้', d:'ใช้เงิน 5 ได้บุญและชื่อเสียง', tend:'social', when: s => s.age >= 10, lock: s => s.money < 5 ? 'เงินไม่ถึง 5' : null, fx: () => [['money', -5], ['fame', 2], ['luck', 2]], run: s => { add(s, 'money', -5); add(s, 'fame', 2); add(s, 'luck', 2); } });

// ---------- พักผ่อน ----------
A({ id:'rest', cat:'rest', icon:'🍵', t:'พักผ่อนรักษาตัว', d:'ฟื้นฟูสุขภาพและจิตใจ', tend:'rest', rep:2, when: s => s.age >= 6, fx: () => [['hp', 25], ['mood', 6]], run: s => { add(s, 'hp', 25); add(s, 'mood', R.i(4, 8)); } });
A({ id:'doctor', cat:'rest', icon:'🏥', t:'ให้วิญญาจารย์สายรักษาดูอาการ', d:'ใช้เงิน 12 · ฟื้นฟูเต็มที่', tend:'rest', when: s => s.age >= 6 && s.hp < maxHp(s) * 0.8, lock: s => s.money < 12 ? 'เงินไม่ถึง 12' : null, fx: () => [['money', -12], ['hp', 60]], run: s => { add(s, 'money', -12); add(s, 'hp', 60); } });

// ---------- ร้านค้า (ไม่ใช้แต้มเวลา) ----------
A({ id:'market', cat:'shop', icon:'🛒', t:'ไปตลาด', d:'ซื้อยา สมุนไพร ตำรา ไส้กรอกของออสการ์', ap:0, rep:9, noAuto:true, when: s => s.age >= 6, fx: () => [], run: s => present(s, 'shop') });
A({ id:'tangshop', cat:'shop', icon:'🏹', t:'ร้านอาวุธลับสำนักถัง (唐门)', d:'ซื้ออาวุธลับเพิ่มพลังต่อสู้', ap:0, rep:9, noAuto:true, when: s => s.age >= 10 && (worldYear(s) >= 25 || s.flags.tangSect || s.flags.tangFriend), fx: () => [], run: s => present(s, 'weaponShop') });

// ---------- สายมืด ----------
A({ id:'drain', cat:'dark', icon:'🩸', t:'ดูดพลังชีวิตชาวบ้าน', d:'วิชามาร พลังพุ่ง แต่ทั่วทวีปจะตามล่า', tend:'dark', noAuto:false, when: s => isCultivator(s) && (s.path === 'evil' || s.flags.darkSeed), fx: s => [['soul', growthPreview(s, 1)], ['fame', -6], ['mood', -6]], danger: () => 0.02, run: s => {
  cultivate(s, 1); add(s, 'fame', -6); add(s, 'mood', -6); s.flags.hunted = true;
  if (R.chance(0.1)) { log(s, 'ผู้พิทักษ์ตำหนักวิญญาณยุทธ์ตามมาทัน!', 'bad'); outcome(s, { hurt: [25, 55], die: 0.2, cause: 'ถูกตำหนักวิญญาณยุทธ์ล่าสังหาร' }, false); }
} });

// ---------- กิจกรรมตามชนชั้น ----------
A({ id:'mine', cat:'money', icon:'⛏️', t:'แบกหามในเหมืองแร่', d:'งานหนักค่าแรงต่ำ ที่คนจนพอหาได้', tend:'money', rep:2, when: s => s.age >= 8 && (s.familyTier <= 2 || s.bg === 'miner'), fx: () => [['money', 4], ['str', 2], ['hp', -6]], danger: () => 0.002, run: s => {
  add(s, 'money', R.i(3, 5)); add(s, 'str', R.i(1, 2)); add(s, 'hp', -6);
  if (R.chance(0.03)) { log(s, 'หินถล่มทับขา!', 'bad'); outcome(s, { hurt: [10, 30], dis: 0.15, die: 0.05, cause: 'เหมืองถล่ม' }, false); }
  else if (R.chance(0.04)) { add(s, 'money', 15); log(s, '💎 คุณขุดเจอผลึกวิญญาณเล็ก ๆ แอบเก็บไปขายได้', 'good'); }
} });
A({ id:'forage', cat:'money', icon:'🌿', t:'หาของป่าไปขายในตลาด', d:'เห็ด ผักป่า ไข่นก — พอประทังชีวิต', tend:'adv', when: s => s.age >= 5 && s.familyTier <= 2, fx: () => [['money', 2], ['agi', 1]], run: s => { add(s, 'money', R.i(1, 3)); add(s, 'agi', 1); if (R.chance(0.06)) { add(s, 'spi', 2); log(s, '🍄 คุณเจอเห็ดวิญญาณ กินแล้วจิตใจแจ่มใส', 'good'); } } });
A({ id:'helpfam', cat:'social', icon:'🍲', t:'ส่งเงินช่วยครอบครัว', d:'ใช้เงิน 10 · พ่อแม่ไม่ต้องอดมื้อกินมื้อ', tend:'social', when: s => s.age >= 12 && s.familyTier <= 2, lock: s => s.money < 10 ? 'เงินไม่ถึง 10' : null, fx: () => [['money', -10], ['mood', 8], ['luck', 2]], run: s => { add(s, 'money', -10); add(s, 'mood', 8); add(s, 'luck', 2); } });
A({ id:'shopwork', cat:'money', icon:'🏪', t:'ช่วยดูแลกิจการของครอบครัว', d:'เรียนรู้การค้า ได้ส่วนแบ่ง', tend:'money', when: s => s.age >= 8 && s.familyTier === 3, fx: () => [['money', 10], ['wis', 1]], run: s => { add(s, 'money', R.i(8, 14)); add(s, 'wis', 1); } });
A({ id:'tutor', cat:'study', icon:'👨‍🏫', t:'จ้างครูพิเศษส่วนตัว', d:'ใช้เงิน 20 · ความรู้เพิ่มมาก', tend:'study', when: s => s.age >= 5 && s.familyTier >= 3, lock: s => s.money < 20 ? 'เงินไม่ถึง 20' : null, fx: () => [['money', -20], ['wis', 5]], run: s => { add(s, 'money', -20); add(s, 'wis', R.i(4, 6)); } });
A({ id:'salon', cat:'social', icon:'🍷', t:'ร่วมงานเลี้ยงของชนชั้นสูง', d:'สร้างเส้นสายและชื่อเสียง', tend:'social', when: s => s.age >= 14 && s.familyTier >= 4, fx: () => [['fame', 3], ['mood', 4]], run: s => {
  add(s, 'fame', R.i(2, 4)); add(s, 'mood', 4);
  if (!s.partner && R.chance(0.15)) { const n = genName(s.gender === 'M' ? 'F' : 'M'); s.partner = n.th; log(s, `💕 คุณถูกใจ ${n.th} ทายาทตระกูลสูงศักดิ์ในงานเลี้ยง`, 'good'); }
} });
A({ id:'treasury', cat:'cult', icon:'🏺', t:'เบิกยาบำรุงจากคลังตระกูล', d:'สิทธิพิเศษของทายาทตระกูลใหญ่', tend:'cult', when: s => s.age >= 6 && s.familyTier >= 5, lock: s => cultReq(s) || (isBottleneck(s) ? 'ติดคอขวด' : null), fx: () => [['soul', '+0.8'], ['hp', 15]], run: s => { add(s, 'soul', 0.8); add(s, 'hp', 15); } });
A({ id:'guardspar', cat:'body', icon:'🛡️', t:'ฝึกกับองครักษ์ประจำตระกูล', d:'ครูฝึกระดับสูง ปลอดภัย', tend:'body', when: s => s.age >= 6 && s.familyTier >= 5, fx: () => [['str', 2], ['agi', 2]], run: s => { add(s, 'str', R.i(1, 3)); add(s, 'agi', R.i(1, 2)); } });

// ---------- กลไกกิจกรรม ----------
function learnArt(s) {
  const left = Object.keys(TANG_ARTS).filter(k => !s.arts[k]);
  if (!left.length) return;
  const k = R.pick(left), a = TANG_ARTS[k];
  s.arts[k] = true;
  if (a.spi) add(s, 'spi', a.spi); if (a.agi) add(s, 'agi', a.agi); if (a.str) add(s, 'str', a.str);
  log(s, `📕 คุณเรียนสำเร็จ: <b>${a.th}</b> — ${a.desc}`, 'gold');
}
function actState(s, a) {
  if (!a.when(s)) return null;
  const used = s.done[a.id] || 0;
  let lock = a.lock ? a.lock(s) : null;
  if (!lock && used >= a.rep) lock = 'ทำครบแล้วปีนี้';
  if (!lock && a.ap > s.ap) lock = 'แต้มเวลาปีนี้หมดแล้ว';
  if (!lock && (s.pending || s.battle)) lock = 'ต้องตัดสินใจเรื่องตรงหน้าก่อน';
  return { a, lock, used };
}
function availableActs(s) { return ACTS.map(a => actState(s, a)).filter(Boolean); }
function doAct(s, id, auto = false) {
  const st = actState(s, ACTS.find(x => x.id === id));
  if (!st || st.lock || !s.alive) return;
  const a = st.a;
  s.ap -= a.ap;
  s.done[id] = (s.done[id] || 0) + 1;
  if (a.tend) s.tend[a.tend] = (s.tend[a.tend] || 0) + (auto ? 0.25 : 1);
  log(s, `${auto ? '🤖 ' : ''}${a.icon} ${a.t}${auto ? ' <small>(ระบบทำแทนตามนิสัยของคุณ)</small>' : ''}`, 'act');
  a.run(s);
  presentNext(s);
}
// นิสัยเด่นที่ระบบประเมินจากการเลือก
function topTendency(s) {
  const e = Object.entries(s.tend || {}).sort((a, b) => b[1] - a[1]);
  return e.length && e[0][1] >= 2 ? e[0][0] : null;
}
function autoSpend(s) {
  let guard = 0;
  while (s.ap > 0 && s.alive && !s.pending && !s.battle && guard++ < 8) {
    const cands = availableActs(s).filter(x => !x.lock && !x.a.noAuto && x.a.ap > 0);
    if (!cands.length) break;
    const pick = R.wpick(cands, x => 1 + 3 * (s.tend[x.a.tend] || 0) / Math.max(1, Object.values(s.tend).reduce((a, b) => a + b, 0)) * 10 + (x.a.cat === 'cult' && isCultivator(s) ? 1 : 0));
    doAct(s, pick.a.id, true);
  }
}

// ---------- เหตุการณ์ร้านค้าและผลการประลองของกิจกรรม ----------
E('shop', { forced: true, once: false, scene: 'city', make: s => ({
  title: '🛒 ตลาดวิญญาจารย์', text: `เหรียญทองในกระเป๋า: <b>${fmt(s.money)}</b> — พ่อค้าตะโกนเรียกลูกค้ากันเซ็งแซ่`,
  opts: [...SHOP_ITEMS.filter(x => !x.need || x.need(s)).map(x => o('b_' + x.id, `${x.th} — ${x.price} เหรียญ`, x.desc, { fx: [['money', -x.price], ...x.fx], lock: s.money < x.price ? 'เงินไม่พอ' : null })),
    o('leave', 'ออกจากตลาด', '', {})],
}), pick: new Proxy({}, { get: (_, k) => s => {
  if (k === 'leave') return;
  const it = SHOP_ITEMS.find(x => 'b_' + x.id === k);
  add(s, 'money', -it.price); apply(s, it.fx);
  present(s, 'shop');
} }) });
E('weaponShop', { forced: true, once: false, scene: 'forge', make: s => ({
  title: '🏹 ร้านอาวุธลับสำนักถัง', text: `อาวุธลับแต่ละชิ้นเพิ่มพลังต่อสู้ถาวร · เหรียญทอง: <b>${fmt(s.money)}</b>`,
  opts: [...HIDDEN_WEAPONS.filter(w => !s.weapons.includes(w.id)).map(w => o('w_' + w.id, `${w.th} — ${fmt(w.price)} เหรียญ`, `พลังต่อสู้ +${Math.round(w.combat * 100)}%${w.need ? ` · ต้องระดับ ${w.need}+` : ''}`, { fx: [['money', -w.price]], lock: s.money < w.price ? 'เงินไม่พอ' : lvl(s) < w.need ? `ต้องระดับ ${w.need}` : null })),
    o('leave', 'ออกจากร้าน', '', {})],
}), pick: new Proxy({}, { get: (_, k) => s => {
  if (k === 'leave') return;
  const w = HIDDEN_WEAPONS.find(x => 'w_' + x.id === k);
  add(s, 'money', -w.price); s.weapons.push(w.id);
  log(s, `🏹 คุณได้รับ <b>${w.th}</b>`, 'gold');
  present(s, 'weaponShop');
} }) });
E('actSpar', { forced: true, once: false, make: () => ({ opts: [] }), battleEnd(s, won) { if (won) add(s, 'fame', 2); } });
E('actArena', { forced: true, once: false, make: () => ({ opts: [] }), battleEnd(s, won) {
  if (!won) return;
  s.arenaWins = (s.arenaWins || 0) + 1;
  add(s, 'money', 8 + lvl(s) * 2); add(s, 'fame', R.i(3, 6));
  const badge = s.arenaWins >= 20 ? 'ตราวิญญาณสีม่วง' : s.arenaWins >= 8 ? 'ตราวิญญาณสีทอง' : s.arenaWins >= 3 ? 'ตราวิญญาณสีเงิน' : null;
  if (badge && s.arenaBadge !== badge) { s.arenaBadge = badge; log(s, `🏅 สนามประลองมอบ <b>${badge}</b> ให้คุณ (ชนะ ${s.arenaWins} ครั้ง)`, 'gold'); }
} });
E('actDeath', { forced: true, once: false, make: () => ({ opts: [] }), battleEnd(s, won) { if (won) { add(s, 'money', 20 + lvl(s) * 4); add(s, 'fame', 10); } } });
