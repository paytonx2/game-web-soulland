// ============================================================
// ช่วงชีวิตระดับสูง (ระดับ 50+ / 80+ / 99)
// · การเดินทางหลายปี (ข้ามเวลา): ท่องยุทธภพ · ปิดด่านบำเพ็ญ · เปิดสำนักสอนศิษย์ · บุกป่าลึก — เสี่ยงตายแต่ได้ของตอบแทน
// · เหตุการณ์ประจำปีชุดใหม่สำหรับระดับ 80+ (เหตุการณ์วัยเยาว์ออกน้อยลง)
// · ภารกิจแยกตามช่วงระดับ (ภารกิจช่วงต้นไม่โผล่ซ้ำตอนระดับสูง)
// ============================================================

// ---------- อาจารย์จากไป: ล้างสถานะอาจารย์ (ภารกิจ/กิจกรรมที่ต้องมีอาจารย์จะไม่โผล่อีก) ----------
function mentorPass(s) {
  s.flags.mentorGone = true;
  if (s.mentor) s.lateMentor = s.mentor;
  s.mentor = null;
  if ((s.quests || []).some(q => q.id === 'masterHerb')) { endQuest(s, 'masterHerb'); log(s, 'ภารกิจสมุนไพรให้อาจารย์สิ้นสุดลง — ท่านไม่อยู่รับมันแล้ว', 'muted'); }
}

// ---------- น้ำหนักเหตุการณ์ตามช่วงระดับ ----------
// ระดับ 80+: เหตุการณ์ชุดตำนาน (hl) ออกบ่อยขึ้น เหตุการณ์ทั่วไปออกน้อยลง
function storyTierWeight(s, e) {
  const L = isCultivator(s) ? lvl(s) : 0;
  if (e.hl) return L >= 80 ? 3 : 0;
  if (e.mid) return L >= 50 && L < 80 ? 2 : 0;
  return L >= 80 ? 0.4 : 1;
}

// ---------- ภารกิจเดิม: จำกัดช่วงระดับ ----------
const QUEST_LV = { wolfPack: [0, 50], letter: [0, 55], well: [0, 50], arenaStar: [0, 60], masterHerb: [0, 70], evilHunt: [20, 75], beastBond: [0, 75], forge: [0, 85] };
for (const [k, lv] of Object.entries(QUEST_LV)) if (QUESTS[k]) QUESTS[k].lv = lv;

// ---------- ภารกิจช่วงกลาง (ระดับ 50–79) ----------
Q('m_escort', { icon: '🛡️', th: 'คุ้มกันขบวนเครื่องราชบรรณาการ', desc: 'คุ้มกันขบวนจากนครหลวงไปยังชายแดนให้ปลอดภัย', hint: 'ผจญภัย 2 ครั้ง', age: [25, 80], lv: [50, 79], steps: 2, p: 0.7, deadline: 2, track: { cats: ['adv'] },
  offer: 'ราชสำนักต้องการวิญญาจารย์ระดับสูงคุ้มกันขบวนเครื่องราชบรรณาการที่โจรทั้งแผ่นดินจับตามอง',
  reward: s => { add(s, 'money', 200); add(s, 'fame', 15); s.flags.nobleFriend = true; },
  fail: s => { add(s, 'fame', -8); log(s, 'ขบวนถูกปล้นกลางทาง ราชสำนักไม่พอใจ', 'bad'); } });
Q('m_evilSect', { icon: '🩸', th: 'กวาดล้างลัทธิวิญญาจารย์ชั่วร้าย', desc: 'ตามล่าหัวหน้าลัทธิที่ใช้เลือดเด็กบำเพ็ญ', hint: 'ผจญภัย / เรียนรู้ 3 ครั้ง แล้วบุกรัง', age: [25, 85], lv: [55, 79], cond: s => s.path !== 'evil', steps: 3, p: 0.6, deadline: 4, track: { cats: ['adv', 'study'] }, finale: 'mf_evilSect',
  offer: 'ตำหนักวิญญาณยุทธ์ประกาศค่าหัวหัวหน้าลัทธิวิญญาจารย์ชั่วร้าย ผู้ที่ตามล่าก่อนหน้าไม่มีใครกลับมา',
  reward: s => { add(s, 'fame', 30); add(s, 'money', 400); if (R.chance(0.35)) giveBone(s, R.i(10000, 50000)); },
  fail: s => { add(s, 'fame', -6); } });
Q('m_arenaKing', { icon: '👑', th: 'ราชันย์แห่งสนามประลอง', desc: 'ชนะสนามประลองซั่วทัว 5 ครั้ง เพื่อชิงตำแหน่งราชันย์', hint: 'ประลองที่สนามซั่วทัว 5 ครั้ง', age: [20, 70], lv: [50, 79], steps: 5, deadline: 5, track: { battles: ['actArena'] },
  offer: 'สนามประลองซั่วทัวจัดศึกชิงตำแหน่งราชันย์ประจำทศวรรษ ผู้ชนะจะถูกจารึกชื่อบนกำแพงสนาม',
  reward: s => { add(s, 'fame', 40); add(s, 'money', 300); s.arenaBadge = 'ราชันย์แห่งซั่วทัว'; } });

// ---------- ภารกิจช่วงตำนาน (ระดับ 80+) ----------
Q('h_beastKing', { icon: '🐉', th: 'ศึกราชันย์สัตว์วิญญาณ', desc: 'สืบหาราชันย์สัตว์วิญญาณแสนปีที่นำคลื่นสัตว์บุกมนุษย์ แล้วปราบมัน', hint: 'ผจญภัย 3 ครั้ง แล้วปะทะราชันย์', age: [30, 150], lv: [80, 100], steps: 3, p: 0.6, deadline: 5, track: { cats: ['adv'] }, finale: 'hf_beastKing',
  offer: 'สัตว์วิญญาณแสนปีตัวหนึ่งรวบรวมฝูงสัตว์นับแสนบุกเมืองชายแดน พรหมยุทธ์ทุกคนถูกขอให้ลงมือ',
  reward: s => { add(s, 'fame', 80); if (R.chance(0.7)) giveBone(s, R.i(100000, 150000)); s.flags.redBeast = true; },
  fail: s => { add(s, 'fame', -15); log(s, 'เมืองชายแดนแตก ผู้คนนับหมื่นต้องอพยพ', 'bad'); } });
Q('h_disciple', { icon: '🧑‍🏫', th: 'ปั้นศิษย์สืบทอด', desc: 'ฝึกศิษย์คนหนึ่งให้กลายเป็นวิญญาจารย์ชั้นยอด', hint: 'เรียนรู้ / สังคม 4 ครั้ง', age: [30, 150], lv: [80, 100], steps: 4, p: 0.6, deadline: 6, track: { cats: ['study', 'social'] },
  offer: 'เด็กกำพร้าคนหนึ่งคุกเข่าหน้าที่พักของคุณสามวันสามคืน ขอเป็นศิษย์ ดวงตาเขามีไฟแบบเดียวกับคุณตอนเด็ก',
  reward: s => { s.disciple = s.disciple || genName(R.chance(0.5) ? 'M' : 'F').th; add(s, 'fame', 25); add(s, 'wis', 4); s.flags.heirStrong = true; log(s, `ศิษย์ของคุณ ${s.disciple} ชนะการแข่งขันวิญญาจารย์รุ่นเยาว์ทั่วทวีป — ชื่อของคุณถูกเล่าขานในฐานะอาจารย์`, 'gold'); } });
Q('h_sect', { icon: '⛩️', th: 'ก่อตั้งสำนักของตนเอง', desc: 'สะสมทรัพย์ 3,000 และชื่อเสียง 250 เพื่อเปิดสำนัก', hint: 'เงิน 3,000 + ชื่อเสียง 250', age: [35, 150], lv: [80, 100], cond: s => !s.flags.ownSect, deadline: 12, w: 1.5, check: s => s.money >= 3000 && s.fame >= 250,
  offer: 'ศิษย์และผู้ติดตามจำนวนมากขอให้คุณตั้งสำนักของตัวเอง แต่การตั้งสำนักต้องใช้ทั้งทรัพย์และบารมี',
  reward: s => { add(s, 'money', -2000); s.flags.ownSect = true; s.title = s.title || `เจ้าสำนัก${R.pick(['เมฆา', 'อัสนี', 'ธารา', 'วายุ', 'ดารา'])}`; add(s, 'fame', 40); log(s, '⛩️ สำนักของคุณเปิดประตูรับศิษย์รุ่นแรก — มีรายได้ประจำทุกปี', 'gold'); } });
Q('h_longevity', { icon: '🍑', th: 'ตามหาผลท้อพันปี', desc: 'ผลไม้ที่ต่ออายุขัยได้ ซ่อนอยู่ในหุบเขาต้องห้าม', hint: 'ผจญภัย 3 ครั้ง', age: [55, 200], lv: [80, 100], steps: 3, p: 0.5, deadline: 5, track: { cats: ['adv'] },
  offer: 'อายุขัยของคุณเหลือไม่มาก ผู้รู้บอกว่าในหุบเขาต้องห้ามมีผลท้อที่ต่อชีวิตได้นับสิบปี',
  reward: s => { s.lifeBase += 12; add(s, 'hp', 40); log(s, '🍑 ผลท้อพันปีต่ออายุขัยของคุณออกไปอีกราว 12 ปี', 'gold'); } });
Q('h_ruins', { icon: '🏛️', th: 'สำรวจซากวิหารเทพโบราณ', desc: 'ไขปริศนาซากวิหารที่โผล่ขึ้นจากทะเลทราย', hint: 'เรียนรู้ / ผจญภัย 4 ครั้ง', age: [30, 200], lv: [85, 100], steps: 4, p: 0.5, deadline: 6, track: { cats: ['study', 'adv'] },
  offer: 'พายุทรายเปิดเผยซากวิหารโบราณ ผนังสลักภาพเทพที่ไม่มีใครรู้จัก',
  reward: s => { s.flags.godInspired = true; add(s, 'wis', 6); add(s, 'luck', 5); addRoute(s, { limit: 3 }); log(s, 'คุณเข้าใจร่องรอยเทพในวิหาร — เส้นทางสู่ความเป็นเทพชัดเจนขึ้น', 'gold'); } });
for (const id of ['m_escort', 'm_evilSect', 'm_arenaKing', 'h_beastKing', 'h_disciple', 'h_sect', 'h_longevity', 'h_ruins']) questOfferEvent(QUESTS[id]);

E('mf_evilSect', { forced: true, once: false, scene: 'night', make: s => ({ title: '🩸 รังลัทธิวิญญาจารย์ชั่วร้าย', text: 'หัวหน้าลัทธินั่งบนบัลลังก์กระดูก ล้อมรอบด้วยสาวกนับร้อย "มาถึงนี่ได้ ก็คงไม่ได้กลับ"', opts: [
  o('fight', 'บุกเข้าไปสังหารหัวหน้าลัทธิ', 'ประลองเป็นตาย', { fx: [['fame', 30], ['money', 400]] }),
  o('retreat', 'ถอยออกมา', 'ภารกิจล้มเหลว', {}),
] }), pick: { fight: s => startBattle(s, 'deathmatch', { title: '🩸 หัวหน้าลัทธิชั่วร้าย', eid: 'mf_evilSect', foeTitle: 'หัวหน้าลัทธิ', lvlOff: R.i(2, 6) }), retreat: s => failQuest(s, 'm_evilSect') },
  battleEnd(s, won) { if (won) completeQuest(s, 'm_evilSect'); else if (s.alive) failQuest(s, 'm_evilSect'); } });
E('hf_beastKing', { forced: true, once: false, scene: 'hunt', make: s => ({ title: '🐉 ราชันย์สัตว์วิญญาณแสนปี', text: 'ร่างมหึมาโผล่จากหมอก เสียงคำรามทำให้ภูเขาสั่น — นี่คือราชันย์ที่นำคลื่นสัตว์บุกมนุษย์', opts: [
  o('fight', 'ปะทะราชันย์สัตว์วิญญาณ', 'อาจได้กระดูกวิญญาณแสนปี · อันตรายถึงชีวิต', { danger: 0.12, fx: [['fame', 80], ['', '🦴 กระดูกแสนปี']] }),
  o('retreat', 'ถอยทัพ', 'ภารกิจล้มเหลว', {}),
] }), pick: { fight: s => startBattle(s, 'beast', { title: '🐉 ราชันย์สัตว์วิญญาณแสนปี', eid: 'hf_beastKing', foeName: 'ราชันย์สัตว์วิญญาณ', beast: true, years: 120000, lvlOff: R.i(3, 8), deathP: 0.25 }), retreat: s => failQuest(s, 'h_beastKing') },
  battleEnd(s, won) { if (won) completeQuest(s, 'h_beastKing'); else if (s.alive) failQuest(s, 'h_beastKing'); } });

// ---------- เหตุการณ์ประจำปีชุดตำนาน (ระดับ 80+) ----------
const HL = (id, def) => E(id, Object.assign({ hl: true, age: [20, 200], cond: s => isCultivator(s) && lvl(s) >= 80 }, def));
HL('hl_challenger', { w: 2, once: false, scene: 'arena', make: s => ({ title: '⚡ อัจฉริยะรุ่นใหม่ท้าประลอง', text: `เด็กหนุ่มระดับ ${Math.max(40, lvl(s) - 25)} ยืนขวางทาง "ข้าได้ยินชื่อท่านมานาน วันนี้ขอชี้แนะสักกระบวนท่า"`, opts: [
  o('teach', 'ชี้แนะอย่างเมตตา', 'ชื่อเสียงดี เขาจะจดจำบุญคุณ', { fxa: [['fame', 6], ['wis', 1]] }),
  o('crush', 'สั่งสอนให้รู้ที่ต่ำที่สูง', 'สะใจ แต่ถูกมองว่ารังแกเด็ก', { fxa: [['fame', -3], ['mood', 3]] }),
  o('spar', 'ประลองจริงจังด้วยพลังเท่ากัน', 'ประลองมิตรภาพ ได้ประสบการณ์', { fx: [['fame', 4]] }),
] }), pick: { spar: s => startBattle(s, 'spar', { title: '⚡ ประลองกับอัจฉริยะรุ่นใหม่', lvlOff: 0 }), teach: s => { if (R.chance(0.3)) { s.disciple = s.disciple || genName(R.chance(0.5) ? 'M' : 'F').th; log(s, `${s.disciple}ขอเป็นศิษย์ของคุณ`, 'good'); } } } });
HL('hl_emperor', { w: 1.5, scene: 'city', make: s => ({ title: '👑 คำเชิญจากจักรพรรดิ', text: 'จักรพรรดิส่งราชโองการเชิญคุณเป็นผู้พิทักษ์ราชวงศ์ ตำแหน่งที่มีเกียรติสูงสุดรองจากองค์จักรพรรดิ', opts: [
  o('accept', 'รับตำแหน่งผู้พิทักษ์', 'ทรัพย์และอำนาจ แต่ต้องรับใช้ราชวงศ์', { path: 'guard', fxa: [['money', 800], ['fame', 30]] }),
  o('refuse', 'ปฏิเสธ "ข้าเป็นของยุทธภพ"', 'อิสระ · ยุทธภพนับถือ', { fxa: [['fame', 15], ['mood', 6]] }),
] }), pick: { accept: s => addRoute(s, { tyrant: 1 }), refuse: s => addRoute(s, { limit: 1 }) } });
HL('hl_war', { w: 1.5, scene: 'war', make: s => ({ title: '⚔️ สงครามสองจักรวรรดิ', text: 'จักรวรรดิเทียนโต่วกับซิงหลัวประกาศสงคราม ทั้งสองฝ่ายต้องการพรหมยุทธ์อย่างคุณ', opts: [
  o('lead', 'ออกรบเป็นแม่ทัพ', 'ชื่อเสียงมหาศาล · เสี่ยงตายในสนามรบ', { odds: pct(0.6 + lvl(s) / 500), danger: 0.06, fx: [['fame', 60], ['money', 600]], win: { fx: [['fame', 60], ['money', 600]], say: 'กองทัพของคุณชนะศึกครั้งประวัติศาสตร์' }, lose: { hurt: [30, 60], die: 0.2, dis: 0.25, cause: 'สิ้นชีพในสงครามสองจักรวรรดิ', say: 'พรหมยุทธ์ฝ่ายตรงข้ามรุมโจมตีคุณ' } }),
  o('mediate', 'เป็นคนกลางเจรจาสงบศึก', 'ต้องมีปัญญาและชื่อเสียง', { odds: pct(0.3 + s.wis / 200 + s.fame / 1500), fx: [['fame', 40]], win: { fx: [['fame', 40], ['luck', 3]], say: 'ทั้งสองฝ่ายยอมสงบศึก ผู้คนนับล้านรอดชีวิต' }, lose: { fx: [['fame', -10]], say: 'การเจรจาล้มเหลว ทั้งสองฝ่ายมองคุณเป็นศัตรู' } }),
  o('neutral', 'วางตัวเป็นกลาง', '', { fxa: [['mood', -3]] }),
] }) });
HL('hl_beastTide', { w: 1.2, scene: 'forest', make: s => ({ title: '🌊 คลื่นสัตว์วิญญาณหมื่นปี', text: 'ฝูงสัตว์วิญญาณหมื่นปีทะลักออกจากป่าใหญ่ เมืองที่คุณเคยอยู่กำลังจะถูกกลืน', opts: [
  o('hold', 'ยืนหยัดเฝ้าประตูเมืองคนเดียว', 'ตำนานหรือความตาย', { odds: pct(0.55 + lvl(s) / 400), danger: 0.05, fx: [['fame', 45]], win: { fx: [['fame', 45], ['str', 3]], say: 'คุณยืนหยัดสามวันสามคืน ฝูงสัตว์ถอยกลับป่า' }, lose: { hurt: [30, 60], die: 0.15, cause: 'ถูกคลื่นสัตว์วิญญาณกลืน', say: 'ฝูงสัตว์ทะลวงแนวป้องกัน' } }),
  o('evacuate', 'นำผู้คนอพยพ', 'ปลอดภัย ชาวเมืองซาบซึ้ง', { fxa: [['fame', 15], ['mood', 4]] }),
] }) });
HL('hl_lifespan', { w: s => s.age > lifespan(s) - 15 ? 3 : 0, scene: 'night', make: s => ({ title: '⏳ อายุขัยใกล้หมด', text: 'แม้พลังจะสูงส่ง ร่างกายก็เริ่มร่วงโรย คุณรู้ว่าเวลาเหลือไม่มาก', opts: [
  o('seek', 'ตามหายาต่ออายุ', 'อายุขัย +6 ปี · อาจเสียเวลาเปล่า', { odds: 0.5, fx: [['', '⏳ +6 ปี']], win: { say: 'คุณได้ยาต่ออายุจากหมอเทวดาในหุบเขา' }, lose: { fx: [['mood', -6]], say: 'การตามหาสูญเปล่า' } }),
  o('legacy', 'ใช้เวลาที่เหลือเขียนตำราถ่ายทอดวิชา', 'ชื่อเสียงคงอยู่ชั่วนิรันดร์', { fxa: [['fame', 30], ['wis', 3]] }),
  o('peace', 'อยู่กับคนที่รักอย่างสงบ', 'ใจสงบ', { fxa: [['mood', 20]] }),
] }), pick: { seek: (s, c, won) => { if (won) s.lifeBase += 6; } } });
HL('hl_titledDuel', { w: 1.2, scene: 'arena', make: s => ({ title: '🗡️ พรหมยุทธ์อีกคนท้าชิงอันดับ', text: 'พรหมยุทธ์จากสำนักคู่แข่งส่งสาส์นท้าดวลเพื่อชิงอันดับในทำเนียบพรหมยุทธ์แห่งทวีป', opts: [
  o('accept', 'รับคำท้า (สนามประลอง)', 'ชนะ = อันดับและชื่อเสียงพุ่ง', { fx: [['fame', 35]] }),
  o('death', 'ท้ากลับเป็นการประลองเป็นตาย', 'ชนะ = ได้ทุกอย่างของอีกฝ่าย', { danger: 0.3, fx: [['fame', 60], ['money', 800]] }),
  o('decline', 'ปฏิเสธ', 'ชื่อเสียงลดเล็กน้อย', { fxa: [['fame', -6]] }),
] }), pick: { accept: s => startBattle(s, 'arena', { title: '🗡️ ศึกชิงอันดับพรหมยุทธ์', eid: 'hl_titledDuel', foeTitle: 'พรหมยุทธ์', lvlOff: R.i(-2, 3) }), death: s => startBattle(s, 'deathmatch', { title: '💀 ศึกเป็นตายชิงอันดับ', eid: 'hl_titledDuel', foeTitle: 'พรหมยุทธ์', lvlOff: R.i(-1, 4) }) },
  battleEnd(s, won) { if (won) { add(s, 'fame', 35); log(s, '🗡️ ชื่อของคุณขยับขึ้นในทำเนียบพรหมยุทธ์แห่งทวีป', 'gold'); } } });
HL('hl_limit', { w: s => lvl(s) >= 99 ? 4 : 0, scene: 'temple', make: s => ({ title: '🌌 ขีดจำกัดระดับ 99', text: 'พลังของคุณถึงจุดสูงสุดที่มนุษย์จะไปได้ ระดับ 99 ไม่มีบันไดขั้นต่อไป มีแต่หน้าผาสู่ความเป็นเทพ', opts: [
  o('meditate', 'ปิดด่านทำความเข้าใจขีดจำกัด', 'ปัญญาและพลังจิต · เส้นทางสู่ความเป็นเทพ', { fxa: [['spi', 4], ['wis', 4]] }),
  o('travel', 'ท่องโลกเพื่อหาความหมายของพลัง', 'โชคและชื่อเสียง', { fxa: [['luck', 4], ['fame', 20]] }),
  o('teach', 'ส่งต่อพลังให้คนรุ่นหลัง', 'ตำนานในฐานะอาจารย์', { fxa: [['fame', 30], ['mood', 8]] }),
] }), pick: { meditate: s => { addRoute(s, { limit: 2 }); s.flags.godInspired = true; } } });
HL('hl_sectIncome', { w: s => s.flags.ownSect ? 2 : 0, once: false, scene: 'temple', make: s => ({ title: '⛩️ เรื่องวุ่นในสำนัก', text: 'ศิษย์สองฝ่ายในสำนักของคุณทะเลาะกันเรื่องตำแหน่งผู้สืบทอด', opts: [
  o('wise', 'ตัดสินอย่างยุติธรรม', 'ปัญญาและชื่อเสียง', { fxa: [['fame', 8], ['wis', 2]] }),
  o('test', 'ให้ประลองกันต่อหน้าศิษย์ทั้งสำนัก', 'สำนักแข็งแกร่ง แต่บาดหมาง', { fxa: [['fame', 5], ['mood', -3]] }),
] }) });

// ---------- การเดินทางหลายปี (ข้ามเวลา) ----------
const JOURNEYS = {
  wander5: { th: 'ท่องยุทธภพ 5 ปี', y: 5, p: 0.016, min: 50, d: 'ชื่อเสียง เงิน ประสบการณ์ศึก อาจได้กระดูกวิญญาณ' },
  wander10: { th: 'ท่องยุทธภพ 10 ปี', y: 10, p: 0.016, min: 50, d: 'ได้มากกว่าเท่าตัว แต่เสี่ยงนานกว่า' },
  seclusion: { th: 'ปิดด่านบำเพ็ญ 10 ปี', y: 10, p: 0.008, min: 50, d: 'พลังวิญญาณ พลังจิต ปัญญา · เสี่ยงธาตุไฟเข้าแทรก' },
  teach: { th: 'เปิดสำนักสอนศิษย์ 10 ปี', y: 10, p: 0.004, min: 70, d: 'ชื่อเสียง รายได้ และศิษย์สืบทอด · ปลอดภัย' },
  abyss: { th: 'บุกใจกลางป่าดาวซิงโต่ว 5 ปี', y: 5, p: 0.045, min: 80, d: 'กระดูกวิญญาณแสนปี สมุนไพรเทวะ · อันตรายสูงมาก' },
};
const journeyRisk = (s, j) => clamp(j.p * (1 - s.luck / 400) * (lvl(s) >= 90 ? 0.85 : 1) * (s.disabilities.length ? 1.3 : 1), 0.002, 0.2);
const journeyDeath = (s, j) => 1 - Math.pow(1 - journeyRisk(s, j), j.y);
A({ id: 'journey', cat: 'adv', icon: '🧭', t: 'ออกเดินทางหลายปี', d: 'ท่องยุทธภพ ปิดด่าน หรือเปิดสำนัก — ข้ามไปหลายปีในครั้งเดียว', ap: 0, tend: 'adv', noAuto: true,
  when: s => isCultivator(s) && lvl(s) >= 50 && s.age < lifespan(s) - 3, fx: () => [['', '⏳ 5–10 ปี']], run: s => s.queue.unshift('journeyMenu') });
E('journeyMenu', { forced: true, once: false, scene: 'road', make: s => ({ title: '🧭 ออกเดินทางหลายปี', text: `คุณระดับ ${lvl(s)} แล้ว ชีวิตแต่ละปีในเมืองเริ่มซ้ำเดิม จะออกไปไกลแค่ไหน? <span class="qhint">ระหว่างเดินทาง เวลาจะผ่านไปหลายปีในครั้งเดียว · กลับมาพร้อมของตอบแทน หรืออาจไม่ได้กลับมา</span>`,
  opts: [
    ...Object.entries(JOURNEYS).map(([k, j]) => o(k, j.th, j.d, { danger: journeyDeath(s, j), lock: lvl(s) < j.min ? `ต้องระดับ ${j.min}+` : s.age + j.y > lifespan(s) + 5 ? 'อายุขัยเหลือไม่พอ' : null, fx: [['', `⏳ ${j.y} ปี`]] })),
    o('cancel', 'ยังไม่ไป', '', { fxa: [] }),
  ] }),
  pick: new Proxy({}, { get: (_, k) => s => {
    const j = JOURNEYS[k]; if (!j) return;
    let dieAt = null; for (let y = 1; y <= j.y; y++) if (R.chance(journeyRisk(s, j))) { dieAt = y; break; }
    s.journey = { k, y: j.y, dieAt, startAge: s.age };
    s.skip = (dieAt || j.y) - 1; s.ap = 0;
    log(s, `🧭 คุณออกเดินทาง — ${j.th}`, 'act');
  } }),
});
// เรียกจาก endYear หลังเวลาผ่านไปครบ
function finishJourney(s) {
  const J = s.journey, j = JOURNEYS[J.k]; s.journey = null;
  if (!j) return;
  const seg0 = segStart(s), L = lvl(s), Y = J.dieAt ? J.dieAt : j.y;
  if (J.dieAt) {
    const cause = { wander5: 'ถูกรุมสังหารระหว่างท่องยุทธภพ', wander10: 'ถูกรุมสังหารระหว่างท่องยุทธภพ', seclusion: 'ธาตุไฟเข้าแทรกระหว่างปิดด่าน', teach: 'ถูกลอบสังหารในสำนัก', abyss: 'สิ้นชีพในใจกลางป่าดาวซิงโต่ว' }[J.k];
    log(s, `☠️ ปีที่ ${J.dieAt} ของการเดินทาง…`, 'death'); die(s, cause); return;
  }
  const tales = { wander: ['ปราบกลุ่มโจรที่ปล้นหมู่บ้านชายเขา', 'ช่วยเมืองหนึ่งจากโรคระบาด', 'ประลองกับยอดฝีมือนิรนามบนยอดเขา', 'พบสหายร่วมทางที่ร่วมเป็นร่วมตายกันหลายปี', 'ค้นพบถ้ำของวิญญาจารย์โบราณ', 'ปกป้องขบวนพ่อค้าจากสัตว์วิญญาณ'],
    seclusion: ['เข้าใจวิญญาณยุทธ์ของตัวเองลึกซึ้งขึ้น', 'ทะลวงคอขวดทางจิตใจ', 'คิดค้นวิธีใช้ทักษะวงแหวนแบบใหม่'],
    teach: ['ศิษย์รุ่นแรกจบการศึกษา', 'สำนักชนะการแข่งขันวิญญาจารย์รุ่นเยาว์', 'ชื่อสำนักขจรไปทั่วแคว้น'],
    abyss: ['ฝ่าดงสัตว์วิญญาณหมื่นปี', 'พบทะเลสาบที่สัตว์วิญญาณแสนปีอาศัย', 'รอดจากพายุพลังวิญญาณใจกลางป่า'] };
  const type = J.k.startsWith('wander') ? 'wander' : J.k;
  const ts = [...tales[type]].sort(() => Math.random() - 0.5).slice(0, Math.min(3, Math.ceil(Y / 3)));
  log(s, `🧭 กลับจากการเดินทาง ${Y} ปี — ${ts.join(' · ')}`, 'gold');
  if (type === 'wander') {
    add(s, 'fame', R.i(4, 7) * Y); add(s, 'money', Math.round((30 + L * 2) * Y * R.f(0.7, 1.3))); add(s, 'agi', Math.ceil(Y / 3)); add(s, 'luck', Math.ceil(Y / 4));
    s.fights = (s.fights || 0) + Y * 3; cultivate(s, 0.5 * Y);
    if (R.chance(1 - Math.pow(0.93, Y))) giveBone(s, R.i(5000, 60000));
    if (R.chance(0.15)) { add(s, 'hp', -30); if (R.chance(0.3)) randomDisability(s); }
  } else if (type === 'seclusion') {
    cultivate(s, 1.2 * Y); add(s, 'spi', Math.ceil(Y / 2)); add(s, 'wis', Math.ceil(Y / 3));
    if (L >= 99) { addRoute(s, { limit: Y * 0.4 }); log(s, 'การปิดด่านที่ระดับ 99 พาคุณเข้าใกล้ขีดจำกัดของมนุษย์ยิ่งขึ้น', 'good'); }
    if (R.chance(0.25)) { s.flags.secretManual = true; log(s, 'คุณคิดค้นเคล็ดบำเพ็ญของตัวเองขึ้นมาได้ (บำเพ็ญเร็วขึ้นถาวร)', 'good'); }
  } else if (type === 'teach') {
    add(s, 'fame', 5 * Y); add(s, 'money', 40 * Y); add(s, 'wis', Math.ceil(Y / 2)); add(s, 'mood', 10);
    s.disciple = s.disciple || genName(R.chance(0.5) ? 'M' : 'F').th; s.flags.heirStrong = true;
  } else if (type === 'abyss') {
    add(s, 'fame', 40); add(s, 'str', 3); s.fights = (s.fights || 0) + 15; s.flags.redBeast = true;
    if (R.chance(0.6)) giveBone(s, R.i(60000, 150000));
    if (R.chance(0.3)) { s.lifeBase += 5; log(s, 'คุณพบสมุนไพรเทวะที่ต่ออายุขัยได้ 5 ปี', 'gold'); }
  }
  segEnd(s, seg0);
}
