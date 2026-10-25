// ============================================================
// กิจกรรมในแต่ละปี — ใช้แต้มเวลา (AP) ปีละ 2–4 แต้ม
// กิจกรรมถูกรวมเป็นหมวด (group): แต่ละหมวดแสดงการ์ดเดียว คือแบบที่เหมาะกับตัวละครที่สุด
// (เรียงตามลำดับความสำคัญในไฟล์ — ตัวแรกที่ทำได้จะถูกเลือก) เพื่อไม่ให้ตัวเลือกลายตา
// กิจกรรมที่ผู้เล่นเลือกบ่อยจะสะสมเป็น "นิสัย" และแต้มเส้นทางลับ (route) แล้วระบบใช้แต้มที่เหลือแทนตามนิสัยนั้น
// ============================================================
const ACTS = [];
// def: { id, group, cat, icon, t, d, ap, rep, tend, route:{เส้นทาง:แต้ม}, when(s), lock(s), fx(s), odds(s), danger(s), noAuto, run(s) }
function A(def) { ACTS.push(Object.assign({ ap: 1, rep: 1, noAuto: false }, def)); }
const ACT_CATS = {
  cult: '🌀 บำเพ็ญ', body: '💪 ฝึกฝน', study: '📖 ความรู้', money: '💰 หาเงิน',
  adv: '🗺️ ผจญภัย', fight: '⚔️ ประลอง', social: '🤝 สังคม', rest: '🍵 พักผ่อน', shop: '🛒 ร้านค้า', dark: '🌑 มืด',
};
const growthPreview = (s, f) => isCultivator(s) && !isBottleneck(s) ? `+${(cultUnit(s) * f * yearCultFactor(s)).toFixed(1)}` : '0';
const inSchool = s => ['school', 'academy'].includes(pathOf(s).group) && s.path !== 'home';
const cultReq = s => isCultivator(s) ? null : 'ต้องมีพลังวิญญาณ';
const cultLock = s => cultReq(s) || (isBottleneck(s) ? 'ติดคอขวด ต้องล่าวงแหวนก่อน' : null);

// ---------- วัยเด็กเล็ก: ดู childhood.js ----------

// ---------- บำเพ็ญ (หมวด cult: เลือกวิธีที่ดีที่สุดที่มี) ----------
A({ id:'xuantian', group:'cult', cat:'cult', icon:'☯️', t:'บำเพ็ญด้วยวิชาเสวียนเทียน (玄天功)', d:'วิชาสำนักถัง บำเพ็ญได้ดีกว่าปกติ', tend:'cult', route:{ limit:0.3 }, rep:2, when: s => s.age >= 6 && s.arts && s.arts.xuantian, lock: cultLock, fx: s => [['soul', growthPreview(s, 0.45)], ['spi', 1]], run: s => { cultivate(s, 0.45, true); add(s, 'spi', R.i(0, 1)); } });
A({ id:'treasury', group:'cult', cat:'cult', icon:'🏺', t:'บำเพ็ญด้วยยาจากคลังตระกูล', d:'สิทธิพิเศษของทายาทตระกูลใหญ่', tend:'cult', route:{ limit:0.2 }, rep:2, when: s => s.age >= 6 && s.familyTier >= 5, lock: cultLock, fx: s => [['soul', growthPreview(s, 0.42)], ['hp', 10]], run: s => { cultivate(s, 0.42, true); add(s, 'hp', 10); } });
A({ id:'meditate', group:'cult', cat:'cult', icon:'🧘', t:'นั่งสมาธิบำเพ็ญพลังวิญญาณ', d:'วิธีมาตรฐานที่ปลอดภัย', tend:'cult', route:{ limit:0.2 }, rep:2, when: s => s.age >= 6, lock: cultLock, fx: s => [['soul', growthPreview(s, 0.35)], ['spi', 1]], run: s => { cultivate(s, 0.35, true); if (R.chance(0.5)) add(s, 'spi', 1); } });
A({ id:'hardcult', cat:'cult', icon:'🔥', t:'บำเพ็ญหักโหมทั้งคืน', d:'พลังเพิ่มมาก แต่ลมปราณอาจย้อนกลับ', tend:'cult', route:{ limit:0.4 }, when: s => s.age >= 10, lock: cultLock, fx: s => [['soul', growthPreview(s, 0.6)], ['mood', -4]], danger: () => 0.004, run: s => {
  cultivate(s, 0.6, true); add(s, 'mood', -4);
  if (R.chance(0.06)) { log(s, '💢 ลมปราณย้อนกลับ!', 'bad'); outcome(s, { hurt: [20, 45], dis: 0.3, die: 0.04, cause: 'ลมปราณย้อนกลับจนเส้นลมปราณแตก' }, false); }
} });
A({ id:'goHunt', cat:'cult', icon:'🔮', t:'ออกล่าวงแหวนวิญญาณ', d:'เลือกสัตว์วิญญาณที่จะล่า', tend:'adv', noAuto:true, when: s => isBottleneck(s), lock: s => s.yearHunt ? 'ล่าไปแล้วปีนี้' : null, fx: () => [['soul', '+วงแหวน']], run: s => { s.huntWait = -1; present(s, 'hunt'); } });

// ---------- ฝึกฝน (หมวด body) ----------
A({ id:'guardspar', group:'body', cat:'body', icon:'🛡️', t:'ฝึกกับองครักษ์ประจำตระกูล', d:'ครูฝึกระดับสูง ปลอดภัย', tend:'body', rep:2, when: s => s.age >= 6 && s.familyTier >= 5, fx: () => [['str', 2], ['agi', 2]], run: s => { add(s, 'str', R.i(1, 2)); add(s, 'agi', R.i(1, 2)); } });
A({ id:'throwing', group:'body', cat:'body', icon:'🎯', t:'ฝึกอาวุธลับและท่าเท้าสำนักถัง', d:'แม่นยำ ว่องไว พลังจิตเฉียบคม', tend:'fight', route:{ smith:0.2 }, rep:2, when: s => s.age >= 8 && (s.weapons.length || s.flags.tangFriend || s.flags.tangSect || s.flags.hiddenWeapon), fx: s => [['agi', s.arts.ghost ? 3 : 2], ['spi', 1]], run: s => { add(s, 'agi', R.i(1, 2) + (s.arts.ghost ? 1 : 0)); add(s, 'spi', R.i(0, 1)); } });
A({ id:'trainbody', group:'body', cat:'body', icon:'🏋️', t:'ฝึกร่างกายและท่าเท้า', d:'แบกหิน วิ่งขึ้นเขา หลบหลีก', tend:'body', rep:2, when: s => s.age >= 6, fx: () => [['str', 2], ['agi', 1], ['hp', -5]], danger: () => 0.002, run: s => {
  add(s, 'str', R.i(1, 2)); add(s, 'agi', R.i(0, 2)); add(s, 'hp', -5);
  if (R.chance(0.03)) { log(s, '🩸 คุณบาดเจ็บระหว่างฝึก', 'bad'); outcome(s, { hurt: [10, 25], dis: 0.12, die: 0.02, cause: 'อุบัติเหตุระหว่างฝึก' }, false); }
} });

// ---------- ความรู้ (หมวด study) ----------
A({ id:'askmaster', group:'study', cat:'study', icon:'🧙', t:'ขอคำชี้แนะจากอาจารย์', d:'อาจารย์วิเคราะห์จุดอ่อนวิญญาณยุทธ์ของคุณ', tend:'study', rep:2, when: s => !!s.mentor && s.age >= 6, fx: () => [['wis', 3], ['spi', 1]], run: s => { add(s, 'wis', R.i(2, 4)); add(s, 'spi', 1); if (R.chance(0.12)) { log(s, `${s.mentor}สอน "ทฤษฎีวิญญาณยุทธ์สิบประการ" ให้คุณเข้าใจวิญญาณยุทธ์ตัวเองลึกซึ้งขึ้น`, 'good'); cultivate(s, 0.3); } } });
A({ id:'lecture', group:'study', cat:'study', icon:'👨‍🏫', t:'เข้าฟังบรรยายของอาจารย์', d:'ความรู้และเทคนิคบำเพ็ญ', tend:'study', rep:2, when: s => inSchool(s), fx: () => [['wis', 3]], run: s => add(s, 'wis', R.i(2, 4)) });
A({ id:'tutor', group:'study', cat:'study', icon:'📚', t:'จ้างครูพิเศษส่วนตัว', d:'ใช้เงิน 20 · ความรู้เพิ่มมาก', tend:'study', when: s => s.age >= 6 && s.familyTier >= 3, lock: s => s.money < 20 ? 'เงินไม่ถึง 20' : null, fx: () => [['money', -20], ['wis', 5]], run: s => { add(s, 'money', -20); add(s, 'wis', R.i(4, 6)); } });
A({ id:'library', group:'study', cat:'study', icon:'📖', t:'อ่านตำราในห้องสมุด', d:'ปัญญาเพิ่ม (นอกสถาบันเสียค่าเข้า 2)', tend:'study', rep:2, when: s => s.age >= 6, lock: s => !inSchool(s) && s.money < 2 ? 'เงินไม่ถึง 2' : null, fx: s => [['wis', 2], ...(inSchool(s) ? [] : [['money', -2]])], run: s => { if (!inSchool(s)) add(s, 'money', -2); add(s, 'wis', R.i(2, 3)); } });
A({ id:'tangmanual', cat:'study', icon:'📕', t:'ศึกษาคัมภีร์ 玄天宝录 ของสำนักถัง', d:'มีโอกาสเรียนวิชาลับสำนักถังเพิ่ม (ขึ้นกับปัญญา)', tend:'study', when: s => (s.flags.tangFriend || s.flags.tangSect || s.flags.hiddenWeapon) && Object.keys(TANG_ARTS).some(k => !s.arts[k]), odds: s => statOdds(s, 'wis', 0.2, 110), fx: () => [['wis', 2], ['', '📕 วิชาใหม่']], run: s => {
  add(s, 'wis', 2);
  if (R.chance(statOdds(s, 'wis', 0.2, 110))) learnArt(s); else log(s, 'คุณยังไม่เข้าใจเคล็ดวิชาในคัมภีร์', 'muted');
} });

// ---------- หาเงิน (หมวด money: งานที่ดีที่สุดตามฐานะ/เส้นทาง) ----------
A({ id:'smithwork', group:'money', cat:'money', icon:'⚒️', t:'ตีเหล็กในโรงตีเหล็ก', d:'ฝึกฝีมือช่าง ได้เงินตามขั้นช่าง', tend:'money', route:{ smith:1 }, rep:2, when: s => s.age >= 10 && (s.smith > 0 || s.path === 'smith' || s.flags.chaosHammer), fx: s => [['money', 6 + (s.smith || 0) * 6], ['str', 2]], run: s => { add(s, 'money', Math.round((6 + (s.smith || 0) * 6) * R.f(0.8, 1.2))); add(s, 'str', R.i(1, 2)); smithExp(s, 0.6 + s.str / 100); } });
A({ id:'bizwork', group:'money', cat:'money', icon:'🏪', t:'ดูแลกิจการค้าขาย', d:'เรียนรู้การค้า ได้กำไรตามกิจการ', tend:'money', route:{ merchant:1 }, rep:2, when: s => s.age >= 8 && (s.familyTier === 3 || s.biz > 0 || ['merchant', 'trader'].includes(s.path)), fx: s => [['money', 10 + (s.biz || 0) * 15], ['wis', 1]], run: s => { add(s, 'money', Math.round((10 + (s.biz || 0) * 15) * R.f(0.8, 1.3))); add(s, 'wis', R.i(0, 1)); } });
A({ id:'guild', group:'money', cat:'money', icon:'📯', t:'รับภารกิจจากกิลด์วิญญาจารย์', d:'เงินดี แต่มีความเสี่ยง', tend:'money', rep:2, when: s => isCultivator(s) && s.rings.length >= 1, fx: s => [['money', 10 + lvl(s) * 2], ['fame', 1]], danger: () => 0.004, run: s => {
  if (R.chance(0.08)) { log(s, 'ภารกิจผิดพลาด! คุณถูกซุ่มโจมตี', 'bad'); outcome(s, { hurt: [15, 40], die: 0.04, cause: 'ตายระหว่างภารกิจกิลด์' }, false); return; }
  add(s, 'money', Math.round((10 + lvl(s) * 2) * R.f(0.8, 1.3))); add(s, 'fame', 1);
} });
A({ id:'teachkids', group:'money', cat:'money', icon:'🏫', t:'สอนหนังสือเด็ก ๆ', d:'ได้เงินและชื่อเสียงเล็กน้อย', tend:'social', rep:2, when: s => s.age >= 18 && s.wis >= 45, fx: () => [['money', 6], ['fame', 1]], run: s => { add(s, 'money', R.i(5, 8)); add(s, 'fame', 1); } });
A({ id:'mine', group:'money', cat:'money', icon:'⛏️', t:'แบกหามในเหมืองแร่', d:'งานหนักค่าแรงต่ำ ที่คนจนพอหาได้', tend:'money', route:{ common:0.5, smith:0.2 }, rep:2, when: s => s.age >= 8 && (s.familyTier <= 2 || s.bg === 'miner'), fx: () => [['money', 4], ['str', 2], ['hp', -6]], danger: () => 0.002, run: s => {
  add(s, 'money', R.i(3, 5)); add(s, 'str', R.i(1, 2)); add(s, 'hp', -6);
  if (R.chance(0.03)) { log(s, 'หินถล่มทับขา!', 'bad'); outcome(s, { hurt: [10, 30], dis: 0.15, die: 0.05, cause: 'เหมืองถล่ม' }, false); }
  else if (R.chance(0.04)) { add(s, 'money', 15); log(s, '💎 คุณขุดเจอผลึกวิญญาณเล็ก ๆ แอบเก็บไปขายได้', 'good'); }
} });
A({ id:'oddjob', group:'money', cat:'money', icon:'🧹', t:'ทำงานรับจ้างทั่วไป', d:'ได้เงินตามฝีมือ', tend:'money', route:{ common:0.3 }, rep:2, when: s => s.age >= 7, fx: s => [['money', Math.round(3 + lvl(s) * 0.6)], ['str', 1]], run: s => { add(s, 'money', Math.round((3 + lvl(s) * 0.6) * R.f(0.8, 1.2))); if (R.chance(0.5)) add(s, 'str', 1); } });
A({ id:'forage', group:'money', cat:'money', icon:'🌿', t:'หาของป่าไปขายในตลาด', d:'เห็ด ผักป่า ไข่นก — พอประทังชีวิต', tend:'adv', route:{ common:0.3 }, rep:2, when: s => s.age >= 5 && s.familyTier <= 2, fx: () => [['money', 2], ['agi', 1]], run: s => { add(s, 'money', R.i(1, 3)); add(s, 'agi', 1); if (R.chance(0.06)) { add(s, 'spi', 2); log(s, '🍄 คุณเจอเห็ดวิญญาณ กินแล้วจิตใจแจ่มใส', 'good'); } } });

// ---------- ผจญภัย (หมวด adv: สลับสถานที่ตามปี) ----------
const advPick = (s, id) => { const ids = ['stardou', 'sunset', 'travel'].filter(x => ACTS.find(a => a.id === x).when(s)); return ids[(s.age + s.birthYear + 30) % Math.max(1, ids.length)] === id; };
A({ id:'stardou', group:'adv', cat:'adv', icon:'🌲', t:'สำรวจชายป่าดาวซิงโต่ว (星斗大森林)', d:'อาจพบสมุนไพร สมบัติ หรือสัตว์วิญญาณดุร้าย', tend:'adv', route:{ common:0.2 }, when: s => s.age >= 10, prefer: s => advPick(s, 'stardou'), danger: () => 0.004, fx: () => [['luck', '?'], ['money', '?']], run: s => {
  const r = Math.random(), cp = combatPower(s);
  if (r < clamp(0.12 - cp / 3000, 0.03, 0.12)) { log(s, '🐺 ฝูงหมาป่าวายุปีศาจล้อมคุณ!', 'bad'); outcome(s, { hurt: [15, 40], dis: 0.08, die: 0.04, cause: 'ถูกสัตว์วิญญาณขย้ำในป่าดาวซิงโต่ว' }, false); }
  else if (r < 0.3 + s.luck / 1000) { s.flags.redBeast = true; log(s, '🐉 คุณพบร่องรอยรังสัตว์วิญญาณหมื่นปี! (ปลดล็อกวงแหวนดำ/แดง)', 'gold'); }
  else if (r < 0.55) { add(s, 'spi', R.i(1, 3)); add(s, 'hp', 15); log(s, '🍄 คุณพบสมุนไพรวิเศษ', 'good'); }
  else { const m = R.i(5, 25); add(s, 'money', m); log(s, `💎 คุณพบซากวิญญาจารย์พร้อมถุงเงิน ${m} เหรียญ`, 'good'); }
} });
A({ id:'sunset', group:'adv', cat:'adv', icon:'🌅', t:'ตามหาสมุนไพรในป่าอาทิตย์อัสดง (落日森林)', d:'ป่าพิษ เต็มไปด้วยสมุนไพรหายาก', tend:'adv', when: s => s.age >= 12, prefer: s => advPick(s, 'sunset'), danger: () => 0.003, fx: () => [['wis', '?'], ['spi', '?']], run: s => {
  if (R.chance(s.flags.poisonRes ? 0.03 : 0.1)) { log(s, '☠️ คุณเหยียบพุ่มไม้พิษ!', 'bad'); outcome(s, { hurt: [10, 30], die: 0.03, cause: 'ถูกพิษในป่าอาทิตย์อัสดง' }, false); return; }
  add(s, 'wis', R.i(1, 3)); add(s, 'spi', R.i(1, 3));
  if (!s.flags.iceFire && lvl(s) >= 20 && R.chance(0.05 + s.luck / 2000)) { s.flags.iceFire = true; add(s, 'str', 8); add(s, 'spi', 8); log(s, '☯️ คุณหลงเข้าไปพบ <b>ตาน้ำหยินหยางน้ำแข็งเพลิง</b> และได้รับการชำระร่าง!', 'gold'); }
} });
A({ id:'travel', group:'adv', cat:'adv', icon:'🐎', t:'ท่องเที่ยวเมืองอื่น', d:'เปิดหูเปิดตา ใช้เงิน 5', tend:'adv', route:{ merchant:0.3 }, when: s => s.age >= 12, prefer: s => advPick(s, 'travel'), lock: s => s.money < 5 ? 'เงินไม่ถึง 5' : null, fx: () => [['money', -5], ['wis', 2], ['luck', 1], ['mood', 4]], run: s => {
  add(s, 'money', -5); add(s, 'wis', 2); add(s, 'mood', 4); add(s, 'luck', 1);
  const p = R.pick(PLACES.filter(x => x.id !== s.place));
  log(s, `คุณเดินทางไปเยือน${p.th} (${p.zh})`, 'muted');
} });

// ---------- ประลอง (การ์ดเดียว เปิดเมนูเลือกสนาม) ----------
A({ id:'duel', cat:'fight', icon:'⚔️', t:'ไปประลอง', d:'เลือกได้: ซ้อมมิตรภาพ · สนามซั่วทัว · สังเวียนเป็นตาย', tend:'fight', route:{ tyrant:0.3 }, noAuto:true, when: s => s.age >= 7 && isCultivator(s), fx: () => [['fame', '+'], ['money', '+']], run: s => present(s, 'duelMenu') });
A({ id:'fusion', cat:'fight', icon:'💫', t:'ฝึกทักษะผสานวิญญาณยุทธ์ (武魂融合技)', d:'ต้องมีเพื่อนร่วมทีม/คนรักที่ใจตรงกัน · ระดับ 30+', tend:'fight', when: s => isCultivator(s) && !s.flags.fusion && lvl(s) >= 30 && (s.flags.team || s.partner || s.friend), odds: s => statOdds(s, 'spi', 0.1, 150), fx: () => [['', '💫 ทักษะผสาน (+10% ต่อสู้)']], run: s => {
  if (R.chance(statOdds(s, 'spi', 0.1, 150))) { s.flags.fusion = R.pick(FUSION_SKILLS); log(s, `💫 คุณกับคู่หูคิดค้น <b>${s.flags.fusion}</b> สำเร็จ!`, 'gold'); add(s, 'fame', 5); }
  else log(s, 'พลังวิญญาณยังไม่ประสานกัน', 'muted');
} });

// ---------- สังคม (หมวด social: คนสำคัญที่สุดตอนนี้) ----------
A({ id:'date', group:'social', cat:'social', icon:'💕', t:'ใช้เวลากับคนรัก', d:'ความรักเบ่งบาน', tend:'social', when: s => !!s.partner, fx: () => [['mood', 10]], run: s => { add(s, 'mood', R.i(8, 12)); if (!s.flags.married && s.age >= 18 && R.chance(0.3)) s.queue.unshift('marriage'); } });
A({ id:'salon', group:'social', cat:'social', icon:'🍷', t:'ร่วมงานเลี้ยงของชนชั้นสูง', d:'สร้างเส้นสายและชื่อเสียง', tend:'social', route:{ tyrant:0.2, merchant:0.2 }, when: s => s.age >= 14 && s.familyTier >= 4, fx: () => [['fame', 3], ['mood', 4]], run: s => {
  add(s, 'fame', R.i(2, 4)); add(s, 'mood', 4);
  if (!s.partner && R.chance(0.15)) { const n = genName(s.gender === 'M' ? 'F' : 'M'); s.partner = n.th; log(s, `💕 คุณถูกใจ ${n.th} ทายาทตระกูลสูงศักดิ์ในงานเลี้ยง`, 'good'); }
} });
A({ id:'festival', group:'social', cat:'social', icon:'🏮', t:'ไปงานเทศกาลโคมไฟหาคู่', d:'อาจพบเนื้อคู่', tend:'social', when: s => s.age >= 15 && s.age <= 45 && !s.partner, odds: s => pct(0.25 + s.fame / 300 + s.luck / 400), fx: () => [['mood', 5]], run: s => {
  add(s, 'mood', 5);
  if (R.chance(pct(0.25 + s.fame / 300 + s.luck / 400))) { const n = genName(s.gender === 'M' ? 'F' : 'M'); s.partner = n.th; log(s, `💕 คุณได้พบ <b>${n.th} (${n.zh})</b> และตกหลุมรักกัน`, 'good'); }
  else log(s, 'สนุกดี แต่ยังไม่พบคนที่ใช่', 'muted');
} });
A({ id:'helpfam', group:'social', cat:'social', icon:'🍲', t:'ส่งเงินช่วยครอบครัว', d:'ใช้เงิน 10 · พ่อแม่ไม่ต้องอดมื้อกินมื้อ', tend:'social', route:{ common:0.5 }, when: s => s.age >= 12 && s.familyTier <= 2 && s.bg !== 'orphan', lock: s => s.money < 10 ? 'เงินไม่ถึง 10' : null, fx: () => [['money', -10], ['mood', 8], ['luck', 2]], run: s => { add(s, 'money', -10); add(s, 'mood', 8); add(s, 'luck', 2); } });
A({ id:'family', group:'social', cat:'social', icon:'🏠', t:'กลับบ้านเยี่ยมครอบครัว', d:'อบอุ่นใจ', tend:'social', when: s => s.age >= 6 && s.bg !== 'orphan', fx: () => [['mood', 8], ['luck', 1]], run: s => { add(s, 'mood', R.i(6, 10)); if (R.chance(0.4)) { const m = Math.max(1, Math.round(familyOf(s).income * 0.15)); add(s, 'money', m); log(s, `แม่แอบใส่เงิน ${m} เหรียญไว้ในห่อผ้าให้`, 'good'); } } });
A({ id:'friends', group:'social', cat:'social', icon:'🍻', t:'สังสรรค์กับเพื่อน', d:'ได้มิตรภาพ อาจได้เพื่อนใหม่', tend:'social', when: s => s.age >= 8, fx: () => [['mood', 6]], run: s => { add(s, 'mood', R.i(4, 8)); if (!s.friend && R.chance(0.35)) { s.friend = genName(R.chance(0.5) ? 'M' : 'F').th; log(s, `🤝 คุณได้เพื่อนสนิทชื่อ ${s.friend}`, 'good'); } } });
A({ id:'charity', cat:'social', icon:'🤲', t:'ช่วยเหลือชาวบ้านยากไร้', d:'ใช้เงิน 5 ได้บุญและชื่อเสียง', tend:'social', route:{ common:0.5 }, when: s => s.age >= 14 && s.money >= 30, fx: () => [['money', -5], ['fame', 2], ['luck', 2]], run: s => { add(s, 'money', -5); add(s, 'fame', 2); add(s, 'luck', 2); } });

// ---------- พักผ่อน (หมวด rest) ----------
A({ id:'doctor', group:'rest', cat:'rest', icon:'🏥', t:'ให้วิญญาจารย์สายรักษาดูอาการ', d:'ใช้เงิน 12 · ฟื้นฟูเต็มที่', tend:'rest', when: s => s.age >= 6 && s.hp < maxHp(s) * 0.6 && s.money >= 12, fx: () => [['money', -12], ['hp', 60]], run: s => { add(s, 'money', -12); add(s, 'hp', 60); } });
A({ id:'rest', group:'rest', cat:'rest', icon:'🍵', t:'พักผ่อนรักษาตัว', d:'ฟื้นฟูสุขภาพและจิตใจ', tend:'rest', rep:2, when: s => s.age >= 6, fx: () => [['hp', 25], ['mood', 6]], run: s => { add(s, 'hp', 25); add(s, 'mood', R.i(4, 8)); } });

// ---------- ร้านค้า (ไม่ใช้แต้มเวลา) ----------
A({ id:'market', cat:'shop', icon:'🛒', t:'ไปตลาด', d:'ยา สมุนไพร ตำรา ไส้กรอกของออสการ์', ap:0, rep:9, noAuto:true, when: s => s.age >= 6, fx: () => [], run: s => present(s, 'shop') });
A({ id:'tangshop', cat:'shop', icon:'🏹', t:'ร้านอาวุธลับสำนักถัง', d:'อาวุธลับเพิ่มพลังต่อสู้', ap:0, rep:9, noAuto:true, when: s => s.age >= 10 && (worldYear(s) >= 25 || s.flags.tangSect || s.flags.tangFriend), fx: () => [], run: s => present(s, 'weaponShop') });

// ---------- สายมืด ----------
A({ id:'drain', cat:'dark', icon:'🩸', t:'ดูดพลังชีวิตชาวบ้าน', d:'วิชามาร พลังพุ่ง แต่ทั่วทวีปจะตามล่า', tend:'dark', route:{ tyrant:1 }, when: s => isCultivator(s) && (s.path === 'evil' || s.flags.darkSeed), lock: cultLock, fx: s => [['soul', growthPreview(s, 0.9)], ['fame', -6], ['mood', -6]], danger: () => 0.02, run: s => {
  cultivate(s, 0.9, true); add(s, 'fame', -6); add(s, 'mood', -6); s.flags.hunted = true;
  if (R.chance(0.1)) { log(s, 'ผู้พิทักษ์ตำหนักวิญญาณยุทธ์ตามมาทัน!', 'bad'); outcome(s, { hurt: [25, 55], die: 0.2, cause: 'ถูกตำหนักวิญญาณยุทธ์ล่าสังหาร' }, false); }
} });

// ---------- กลไกกิจกรรม ----------
function learnArt(s) {
  const left = Object.keys(TANG_ARTS).filter(k => !s.arts[k]);
  if (!left.length) return;
  const k = R.pick(left), a = TANG_ARTS[k];
  s.arts[k] = true;
  if (a.spi) add(s, 'spi', a.spi); if (a.agi) add(s, 'agi', a.agi); if (a.str) add(s, 'str', a.str);
  log(s, `📕 คุณเรียนสำเร็จ: <b>${a.th}</b> — ${a.desc}`, 'gold');
}
const useKey = a => a.group || a.id;
function actState(s, a) {
  if (!a.when(s)) return null;
  const used = s.done[useKey(a)] || 0;
  let lock = a.lock ? a.lock(s) : null;
  if (!lock && used >= a.rep) lock = 'ทำครบแล้วปีนี้';
  if (!lock && a.ap > s.ap) lock = 'แต้มเวลาปีนี้หมดแล้ว';
  if (!lock && (s.pending || s.battle)) lock = 'ต้องตัดสินใจเรื่องตรงหน้าก่อน';
  return { a, lock, used };
}
// แต่ละหมวดแสดงการ์ดเดียว: ตัวที่ prefer ก่อน แล้วตัวแรกที่ไม่ติดล็อกของตัวเอง
function availableActs(s) {
  const out = [], seen = {};
  for (const a of ACTS) {
    const st = actState(s, a);
    if (!st) continue;
    if (!a.group) { out.push(st); continue; }
    (seen[a.group] = seen[a.group] || []).push(st);
  }
  for (const g in seen) {
    const list = seen[g];
    const own = x => !x.a.lock || !x.a.lock(s);
    const pick = list.find(x => x.a.prefer && x.a.prefer(s) && own(x)) || list.find(own) || list[0];
    out.push(pick);
  }
  const order = Object.keys(ACT_CATS);
  return out.sort((x, y) => order.indexOf(x.a.cat) - order.indexOf(y.a.cat));
}
function doAct(s, id, auto = false) {
  const st = actState(s, ACTS.find(x => x.id === id));
  if (!st || st.lock || !s.alive) return;
  const a = st.a;
  s.ap -= a.ap;
  s.done[useKey(a)] = (s.done[useKey(a)] || 0) + 1;
  if (a.tend) s.tend[a.tend] = (s.tend[a.tend] || 0) + (auto ? 0.25 : 1);
  if (a.route) addRoute(s, a.route, auto ? 0.25 : 0.5);
  log(s, `${auto ? '🤖 ' : ''}${a.icon} ${a.t}${auto ? ' <small>(ระบบทำแทนตามนิสัยของคุณ)</small>' : ''}`, 'act');
  if (FLAV[a.id]) log(s, R.pick(FLAV[a.id])(s), 'flav');
  const seg0 = segStart(s);
  a.run(s);
  if (s.alive && !s.battle) { questHook(s, 'act', a); segEnd(s, seg0); }
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
    const tot = Math.max(1, Object.values(s.tend).reduce((a, b) => a + b, 0));
    const pick = R.wpick(cands, x => 1 + 30 * (s.tend[x.a.tend] || 0) / tot + (x.a.cat === 'cult' && isCultivator(s) ? 1 : 0));
    doAct(s, pick.a.id, true);
  }
}

// ---------- เหตุการณ์ร้านค้า เมนูประลอง และผลการประลองของกิจกรรม ----------
E('shop', { forced: true, once: false, scene: 'city', make: s => ({
  title: '🛒 ตลาดวิญญาจารย์', text: `เหรียญทองในกระเป๋า: <b>${fmt(s.money)}</b> — พ่อค้าตะโกนเรียกลูกค้ากันเซ็งแซ่ (ยาบำรุงวิญญาณซื้อได้ปีละ 1 เม็ด)`,
  opts: [...SHOP_ITEMS.filter(x => !x.need || x.need(s)).map(x => o('b_' + x.id, `${x.th} — ${x.price} เหรียญ`, x.desc, {
    fx: [['money', -x.price], ...(x.cult ? [['soul', growthPreview(s, x.cult)]] : x.fx)],
    lock: s.money < x.price ? 'เงินไม่พอ' : x.cult && s.done.pill ? 'ปีนี้กินยาบำรุงไปแล้ว' : x.cult && isBottleneck(s) ? 'ติดคอขวด' : null })),
    o('leave', 'ออกจากตลาด', '', {})],
}), pick: new Proxy({}, { get: (_, k) => s => {
  if (k === 'leave') return;
  const it = SHOP_ITEMS.find(x => 'b_' + x.id === k);
  add(s, 'money', -it.price);
  if (it.cult) { s.done.pill = 1; cultivate(s, it.cult); } else apply(s, it.fx);
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
E('duelMenu', { forced: true, once: false, scene: 'arena', make: s => ({
  title: '⚔️ จะไปประลองที่ไหน?', text: 'เลือกสนามประลองที่จะลงในปีนี้',
  opts: [
    o('spar', '🤼 ประลองซ้อมกับเพื่อน', 'ปลอดภัย ได้ประสบการณ์', { fx: [['fame', 2]] }),
    o('arena', '🏟️ สนามประลองวิญญาณใหญ่ซั่วทัว', 'ชนะได้เงิน ชื่อเสียง และตราประลอง', { fx: [['money', '+'], ['fame', '+']], danger: 0.025, lock: s.age < 12 ? 'อายุ 12 ปีขึ้นไป' : s.rings.length < 1 ? 'ต้องมีวงแหวนอย่างน้อย 1 วง' : null }),
    o('death', '☠️ สังเวียนเป็นตายใต้ดิน', 'รางวัลมหาศาล · แพ้ตาย 75%', { fx: [['money', 20 + lvl(s) * 4], ['fame', 10]], danger: 0.35, lock: s.age < 16 ? 'อายุ 16 ปีขึ้นไป' : s.rings.length < 2 ? 'ต้องมีวงแหวน 2 วง' : null }),
    o('cancel', 'เปลี่ยนใจ ไม่ไปแล้ว', 'คืนแต้มเวลา', {}),
  ],
}), pick: {
  spar: s => startBattle(s, 'spar', { title: '🤼 ประลองซ้อม', eid: 'actSpar', lvlOff: R.i(-3, 3) }),
  arena: s => { addRoute(s, { tyrant: 0.3 }); startBattle(s, 'arena', { title: '🏟️ สนามประลองวิญญาณใหญ่ซั่วทัว', eid: 'actArena' }); },
  death: s => { addRoute(s, { tyrant: 1, killing: 1 }); startBattle(s, 'deathmatch', { title: '☠️ สังเวียนใต้ดิน', eid: 'actDeath' }); },
  cancel: s => { s.ap += 1; s.done.duel = Math.max(0, (s.done.duel || 1) - 1); },
} });
E('actSpar', { forced: true, once: false, make: () => ({ opts: [] }), battleEnd(s, won) { if (won) { add(s, 'fame', 2); cultivate(s, 0.1); } } });
E('actArena', { forced: true, once: false, make: () => ({ opts: [] }), battleEnd(s, won) {
  if (!won) return;
  s.arenaWins = (s.arenaWins || 0) + 1;
  add(s, 'money', 8 + lvl(s) * 2); add(s, 'fame', R.i(3, 6));
  const badge = s.arenaWins >= 20 ? 'ตราวิญญาณสีม่วง' : s.arenaWins >= 8 ? 'ตราวิญญาณสีทอง' : s.arenaWins >= 3 ? 'ตราวิญญาณสีเงิน' : null;
  if (badge && s.arenaBadge !== badge) { s.arenaBadge = badge; log(s, `🏅 สนามประลองมอบ <b>${badge}</b> ให้คุณ (ชนะ ${s.arenaWins} ครั้ง)`, 'gold'); }
} });
E('actDeath', { forced: true, once: false, make: () => ({ opts: [] }), battleEnd(s, won) { if (won) { add(s, 'money', 20 + lvl(s) * 4); add(s, 'fame', 10); s.deathWins = (s.deathWins || 0) + 1; addRoute(s, { killing: 1, asura: 1 }); } } });

// ---------- บรรยายว่าตัวละครทำอะไรจริง ๆ (ทำให้ทุกค่าที่ได้มีที่มา) ----------
const nm2 = s => s.name;
const FLAV = {
  play: [s => 'คุณวิ่งไล่จับแมลงปอกับเด็กข้างบ้านจนตะวันตกดิน', s => 'คุณปีนต้นไม้แข่งกับเพื่อน ถลอกเข่าแต่หัวเราะทั้งวัน'],
  chores: [s => 'คุณช่วยแม่หาบน้ำจากบ่อจนไหล่แดงก่ำ', s => 'คุณผ่าฟืนกองเล็ก ๆ ทั้งที่ขวานหนักกว่าตัว'],
  kidlesson: [s => 'อาจารย์ประจำจวนให้คัดอักษร "ปณิธาน" ร้อยครั้งจนมือสั่น', s => 'คุณดีดพิณผิดสายจนครูถอนหายใจ แต่ก็จำเพลงได้ครบ'],
  kidstory: [s => 'ปู่เล่าเรื่องพรหมยุทธ์ผู้เดินบนน้ำ คุณฟังจนหลับคาตัก'],
  meditate: [s => 'คุณนั่งขัดสมาธิใต้ต้นไม้ใหญ่ ปล่อยให้พลังวิญญาณไหลเวียนครบสามสิบหกรอบ', s => 'ก่อนรุ่งสาง คุณนั่งหันหน้าไปทางตะวันขึ้น ดูดซับลมปราณฟ้าดิน', s => 'คุณหลับตาสัมผัสวิญญาณยุทธ์ในร่าง และค่อย ๆ ขัดเกลามันให้บริสุทธิ์ขึ้น'],
  xuantian: [s => 'คุณเดินลมปราณตามเคล็ดวิชาเสวียนเทียน พลังไหลแรงกว่าการบำเพ็ญธรรมดามาก', s => 'ชั้นของวิชาเสวียนเทียนลึกขึ้นอีกขั้น ร่างกายอุ่นวาบจากภายใน'],
  treasury: [s => 'ผู้ดูแลคลังตระกูลจัดยาบำรุงให้ตามสิทธิ์ของทายาท คุณกลืนยาแล้วบำเพ็ญทั้งคืน'],
  hardcult: [s => 'คุณบำเพ็ญไม่หลับไม่นอนสามวันสามคืน เส้นลมปราณร้อนผ่าวจนน่ากลัว', s => 'คุณดึงพลังฟ้าดินเข้าร่างเกินขีดที่ปลอดภัย เหงื่อไหลเป็นสาย'],
  guardspar: [s => 'องครักษ์ของตระกูลไม่ออมมือ คุณล้มแล้วลุกขึ้นใหม่นับไม่ถ้วน'],
  throwing: [s => 'คุณขว้างเข็มเงินใส่ใบไม้ร่วงจนแม่นขึ้นทีละนิด', s => 'คุณฝึกท่าเท้าเงาภูตบนเสาไม้ยามดึก'],
  trainbody: [s => 'คุณแบกหินขึ้นเขาทุกเช้า และวิ่งลงมาก่อนตะวันขึ้น', s => 'คุณยืนกลางน้ำตกให้น้ำกระแทกร่างจนชาไปทั้งตัว'],
  askmaster: [s => `${s.mentor || 'อาจารย์'}ชี้จุดอ่อนของวิญญาณยุทธ์คุณทีละข้อ คุณจดทุกคำไว้`],
  lecture: [s => 'อาจารย์บรรยายเรื่องความเข้ากันของวงแหวนกับวิญญาณยุทธ์ คุณนั่งแถวหน้าตลอดคาบ'],
  tutor: [s => 'ครูพิเศษที่จ้างมาสอนวิธีอ่านทฤษฎีวิญญาณยุทธ์ที่สถาบันไม่ได้สอน'],
  library: [s => 'คุณขลุกอยู่ในห้องสมุดจนผู้ดูแลต้องมาไล่ออกตอนปิด', s => 'คุณคัดลอกบันทึกสัตว์วิญญาณร้อยชนิดไว้ในสมุดเล่มเล็ก'],
  smithwork: [s => 'เสียงค้อนกระทบทั่งดังทั้งวัน มือของคุณด้านขึ้นอีกชั้น', s => 'คุณหลอมเหล็กกล้าพับซ้ำร้อยครั้งตามที่ช่างเฒ่าสอน'],
  bizwork: [s => 'คุณต่อรองราคากับพ่อค้าต่างเมืองจนได้กำไรงาม', s => 'คุณจัดบัญชีร้านใหม่ทั้งหมด พบว่าลูกจ้างแอบยักยอก'],
  guild: [s => 'กิลด์ส่งคุณไปกำจัดสัตว์วิญญาณที่รบกวนคาราวาน', s => 'คุณคุ้มกันพ่อค้าข้ามหุบเขาที่มีโจรชุกชุม'],
  teachkids: [s => 'เด็ก ๆ ในเมืองนั่งฟังคุณเล่าเรื่องวิญญาณยุทธ์ตาเป็นประกาย'],
  mine: [s => 'คุณแบกหินแร่ขึ้นจากปล่องเหมืองที่มืดและอับอากาศทั้งวัน'],
  oddjob: [s => 'คุณรับจ้างขนสินค้าที่ท่าเรือจนหลังแทบหัก', s => 'คุณรับจ้างล้างจานในโรงเตี๊ยมจนนิ้วเปื่อย'],
  forage: [s => 'คุณเดินเก็บเห็ดและผักป่าตั้งแต่เช้ามืดไปขายในตลาด'],
  stardou: [s => 'คุณเดินตามรอยเท้าสัตว์วิญญาณเข้าไปในป่าดาวซิงโต่ว'],
  sunset: [s => 'คุณสวมผ้าปิดจมูกเดินเข้าป่าอาทิตย์อัสดงที่หมอกพิษลอยต่ำ'],
  travel: [s => 'คุณขึ้นรถม้าโดยสารไปเมืองที่ไม่เคยเห็นมาก่อน'],
  family: [s => 'แม่ทำอาหารโปรดของคุณเต็มโต๊ะ พ่อแอบยิ้มอยู่หลังถ้วยชา'],
  friends: [s => 'คุณกับเพื่อน ๆ ดื่มชาและคุยกันเรื่องความฝันจนดึก'],
  date: [s => `คุณกับ${s.partner || 'คนรัก'}เดินเล่นริมทะเลสาบใต้แสงโคม`],
  salon: [s => 'คุณยกจอกสุราทักทายขุนนางผู้ใหญ่ทีละโต๊ะในงานเลี้ยง'],
  festival: [s => 'โคมนับพันลอยขึ้นฟ้า คุณมองหาใครสักคนในฝูงชน'],
  helpfam: [s => 'คุณส่งเงินกลับบ้านพร้อมจดหมายสั้น ๆ ว่าสบายดี'],
  rest: [s => 'คุณนอนพักทั้งวัน ปล่อยให้แผลเก่าหายช้า ๆ', s => 'คุณนั่งจิบชาดูฝนตกทั้งบ่าย ร่างกายผ่อนคลายลง'],
  doctor: [s => 'วิญญาจารย์สายรักษาวางมือบนแผล แสงเขียวอ่อนไหลเข้าสู่ร่าง'],
  drain: [s => 'คืนนี้หมู่บ้านทั้งหมู่บ้านเงียบสนิท…'],
};
