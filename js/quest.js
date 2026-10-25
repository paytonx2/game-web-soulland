// ============================================================
// ภารกิจระหว่างช่วงชีวิต — รับแล้วต้องทำให้สำเร็จก่อนเส้นตาย
// ความคืบหน้ามาจาก: กิจกรรม (acts/cats) · เหตุการณ์ (events) · ชนะการประลอง (battles) · เงื่อนไขสะสม (check)
// ภารกิจที่มี finale จะจบด้วยเหตุการณ์พิเศษ (มักเป็นการประลอง)
// ============================================================
const QUESTS = {};
function Q(id, def) { QUESTS[id] = Object.assign({ id, steps: 1, p: 1, deadline: 4, w: 1, track: {} }, def); }
const MAX_QUESTS = 3;

Q('lostPages', { icon: '📜', th: 'ตำราที่หายไป', desc: 'หน้ากระดาษสามแผ่นจากตำราบำเพ็ญโบราณกระจัดกระจาย', hint: 'เรียนรู้ / ผจญภัย', age: [7, 18], cond: s => ['school', 'academy'].includes(pathOf(s).group), steps: 3, p: 0.5, deadline: 4, track: { cats: ['study', 'adv'] },
  offer: 'อาจารย์ห้องสมุดเล่าว่าตำราบำเพ็ญโบราณเล่มหนึ่งถูกฉีกออกเป็นสามส่วนเมื่อร้อยปีก่อน ใครรวบรวมได้จะได้เป็นเจ้าของ',
  reward: s => { add(s, 'wis', 6); s.flags.secretManual = true; if (isCultivator(s)) cultivate(s, 0.8); log(s, 'คุณต่อหน้ากระดาษครบ และเข้าใจเคล็ดบำเพ็ญที่ถูกลืม', 'good'); } });
Q('firstRing', { icon: '🔮', th: 'เตรียมร่างให้พร้อมรับวงแหวนแรก', desc: 'อาจารย์บอกว่าร่างที่แข็งแรงรับวงแหวนอายุสูงได้มากกว่า', hint: 'ฝึกฝนร่างกาย 3 ครั้ง', age: [6, 12], cond: s => isCultivator(s) && !s.rings.length, steps: 3, deadline: 4, track: { cats: ['body'] },
  offer: 'ก่อนออกล่าวงแหวนวงแรก อาจารย์ให้การบ้าน: ฝึกร่างกายให้พร้อม แล้วเขาจะพาไปล่าเอง',
  reward: s => { add(s, 'str', 3); s.flags.huntReady = true; log(s, 'ร่างกายของคุณพร้อมแล้ว — วงแหวนวงต่อไปรับได้อายุสูงขึ้น และมีอาจารย์คุ้มกัน', 'good'); } });
Q('wolfPack', { icon: '🐺', th: 'หมาป่ารังควานหมู่บ้าน', desc: 'สืบหารังของฝูงหมาป่าวายุปีศาจ แล้วกำจัดจ่าฝูง', hint: 'ผจญภัย 2 ครั้ง แล้วสู้กับจ่าฝูง', age: [10, 35], cond: s => isCultivator(s) && s.rings.length >= 1 && (placeOf(s).danger >= 2 || s.familyTier <= 2), steps: 2, p: 0.8, deadline: 3, track: { cats: ['adv'] }, finale: 'qf_wolf',
  offer: 'ฝูงหมาป่าวายุปีศาจลากแพะของชาวบ้านไปทุกคืน ผู้ใหญ่บ้านรวบรวมเงินได้ 30 เหรียญเป็นค่าจ้างให้ใครก็ได้ที่จัดการมัน',
  reward: s => { add(s, 'money', 30); add(s, 'fame', 6); addRoute(s, { common: 1 }); },
  fail: s => { add(s, 'fame', -3); log(s, 'ฝูงหมาป่ายังคงรังควาน ชาวบ้านผิดหวังในตัวคุณ', 'bad'); } });
Q('letter', { icon: '✉️', th: 'จดหมายถึงนครหลวง', desc: 'ส่งจดหมายลับของพ่อค้าใหญ่ให้ถึงมือขุนนางที่นครหลวง', hint: 'ท่องเที่ยวเมืองอื่น', age: [12, 35], steps: 1, deadline: 3, track: { acts: ['travel'] },
  offer: 'พ่อค้าใหญ่ฝากจดหมายปิดผนึกให้ส่งถึงมือขุนนางคนหนึ่งที่นครหลวง "ห้ามเปิดอ่านเด็ดขาด"',
  reward: s => { add(s, 'money', 40); add(s, 'fame', 3); s.flags.nobleFriend = true; log(s, 'ขุนนางผู้รับจดหมายจดจำชื่อคุณไว้ — เส้นสายในนครหลวงเปิดกว้าง', 'good'); } });
Q('medicine', { icon: '💊', th: 'ยาสำหรับแม่', desc: 'แม่ป่วยเรื้อรัง ต้องเก็บเงินให้ได้ 40 เหรียญซื้อยาจากหมอเมืองใหญ่', hint: 'มีเงิน 40 เหรียญ', age: [8, 30], cond: s => s.familyTier <= 2 && s.bg !== 'orphan', deadline: 3, w: 1.5, check: s => s.money >= 40,
  offer: 'หมอบอกว่าแม่ของคุณป่วยหนัก ยาที่รักษาได้ราคา 40 เหรียญทอง และต้องได้ภายในสามปี',
  reward: s => { add(s, 'money', -40); add(s, 'mood', 12); add(s, 'luck', 3); log(s, 'แม่หายดีแล้ว และกอดคุณไว้แน่น', 'good'); },
  fail: s => { add(s, 'mood', -25); log(s, '🕯️ คุณเก็บเงินไม่ทัน… แม่จากไปอย่างสงบ', 'bad'); } });
Q('shrekPrep', { icon: '🎯', th: 'เตรียมสอบเข้าเชร็ค', desc: 'ฝึกให้พร้อมก่อนอายุ 12 เพื่อสอบเข้าสถาบันเชร็ค', hint: 'บำเพ็ญ / เรียนรู้ / ฝึกฝน 4 ครั้ง', age: [8, 11], cond: s => isCultivator(s) && pathOf(s).group === 'school', steps: 4, p: 0.8, deadline: 3, track: { cats: ['cult', 'study', 'body'] },
  offer: 'รุ่นพี่ที่สอบติดเชร็คบอกเคล็ดลับว่าต้องเตรียมตัวทั้งทฤษฎีและร่างกายตั้งแต่เนิ่น ๆ',
  reward: s => { s.flags.shrekPrep = true; add(s, 'wis', 2); add(s, 'agi', 2); log(s, 'คุณพร้อมสำหรับบททดสอบของเชร็คแล้ว (โอกาสสอบผ่านสูงขึ้น)', 'good'); } });
Q('evilHunt', { icon: '👹', th: 'ล่าวิญญาจารย์ชั่วร้ายผู้ลักพาเด็ก', desc: 'สืบเบาะแสรังของวิญญาจารย์ชั่วร้าย แล้วบุกช่วยเด็ก ๆ', hint: 'ผจญภัย / เรียนรู้ 3 ครั้ง แล้วบุกรัง', age: [18, 55], cond: s => isCultivator(s) && s.rings.length >= 2 && s.path !== 'evil', steps: 3, p: 0.5, deadline: 4, track: { cats: ['adv', 'study'] }, finale: 'qf_evil',
  offer: 'เด็กในเมืองหายไปทีละคน ร่องรอยเลือดบนกำแพงชี้ว่าเป็นฝีมือวิญญาจารย์ชั่วร้าย ตำหนักวิญญาณยุทธ์ยังเพิกเฉย',
  reward: s => { add(s, 'fame', 15); add(s, 'money', 80); addRoute(s, { seagod: 1, life: 1 }); if (R.chance(0.2)) giveBone(s, R.i(3000, 20000)); },
  fail: s => { add(s, 'mood', -10); log(s, 'คุณตามรอยไม่ทัน… เด็ก ๆ ไม่ได้กลับบ้านอีกเลย', 'bad'); } });
Q('arenaStar', { icon: '🏟️', th: 'ดาวรุ่งแห่งซั่วทัว', desc: 'ชนะในสนามประลองวิญญาณใหญ่ซั่วทัว 3 ครั้ง', hint: 'ไปประลอง → สนามซั่วทัว', age: [12, 35], cond: s => isCultivator(s) && s.rings.length >= 1, steps: 3, deadline: 5, track: { battles: ['actArena'] },
  offer: 'เจ้าของสนามประลองซั่วทัวยื่นข้อเสนอ: ชนะสามนัด แล้วเขาจะจัดนัดพิเศษพร้อมเงินรางวัลก้อนโต',
  reward: s => { add(s, 'money', 60); add(s, 'fame', 10); s.flags.team = true; } });
Q('masterHerb', { icon: '🌿', th: 'สมุนไพรพันปีให้อาจารย์', desc: 'อาจารย์ต้องการหญ้าหยกพันปีเพื่อปรุงยา', hint: 'ผจญภัย 2 ครั้ง', age: [8, 60], cond: s => !!s.mentor, steps: 2, p: 0.6, deadline: 3, track: { cats: ['adv'] },
  offer: 'อาจารย์ขอให้คุณเข้าป่าหาหญ้าหยกพันปี "ถ้าได้มา ข้าจะปรุงยาให้เจ้าครึ่งหนึ่ง"',
  reward: s => { if (isCultivator(s)) cultivate(s, 1); add(s, 'spi', 4); add(s, 'wis', 2); log(s, 'อาจารย์ปรุงยาให้ และสอนวิธีใช้สมุนไพรเพิ่มเติม', 'good'); } });
Q('restore', { icon: '🏯', th: 'กอบกู้เกียรติตระกูล', desc: 'สะสมเงิน 300 และชื่อเสียง 40 เพื่อยื่นฎีกาขอคืนบรรดาศักดิ์', hint: 'เงิน 300 + ชื่อเสียง 40', age: [14, 70], cond: s => !!s.flags.fallen, deadline: 10, w: 3, check: s => s.money >= 300 && s.fame >= 40,
  offer: 'ตระกูลของคุณตกต่ำ แต่ผู้อาวุโสที่ยังเหลืออยู่บอกว่า ถ้ามีเงินและชื่อเสียงมากพอ ราชสำนักจะพิจารณาคืนบรรดาศักดิ์',
  reward: s => { add(s, 'money', -200); s.flags.fallen = false; changeTier(s, 1, 'ราชสำนักคืนบรรดาศักดิ์ให้ตระกูล'); } });
Q('origin', { icon: '🧬', th: 'ตามหาชาติกำเนิดที่แท้จริง', desc: 'เด็กกำพร้ามีจี้หยกติดตัวมาตั้งแต่เกิด — มันคือเบาะแสเดียว', hint: 'ผจญภัย / สังคม 4 ครั้ง', age: [8, 35], cond: s => s.bg === 'orphan', steps: 4, p: 0.5, deadline: 10, w: 3, track: { cats: ['adv', 'social'] },
  offer: 'หลวงตาในวัดร้างมอบจี้หยกที่ผูกติดผ้าอ้อมของคุณเมื่อวันที่ถูกทิ้งไว้ บนจี้สลักตราของตระกูลหนึ่ง',
  reward: s => { log(s, '🧬 จี้หยกตรงกับตราของตระกูลวิญญาจารย์ที่สาบสูญ — คุณคือทายาทที่ถูกลักพาตัวไปเมื่อแรกเกิด!', 'gold'); changeTier(s, 5 - s.familyTier, 'ตระกูลรับคุณกลับคืนสู่สายเลือด'); s.bg = 'branch'; if (isCultivator(s)) { s.innate = Math.min(10, s.innate + 1); cultivate(s, 1); } add(s, 'money', 150); } });
Q('forge', { icon: '⚒️', th: 'หลอมอาวุธประจำตัว', desc: 'ตีอาวุธคู่กายจากเหล็กที่สะสมไว้', hint: 'ตีเหล็ก 4 ครั้ง', age: [12, 70], cond: s => (s.smith || 0) >= 2 && !s.flags.starBlade, steps: 4, deadline: 5, track: { acts: ['smithwork'] },
  offer: 'ช่างเฒ่าบอกว่าช่างที่แท้จริงต้องมีอาวุธที่ตีด้วยมือตัวเองหนึ่งชิ้น',
  reward: s => { s.flags.starBlade = true; smithExp(s, 4); log(s, '⚔️ อาวุธคู่กายเสร็จสมบูรณ์ — พลังต่อสู้ +10%', 'gold'); } });
Q('wedding', { icon: '💒', th: 'งานแต่งในฝัน', desc: `เก็บเงิน 100 เหรียญจัดงานแต่งให้สมกับความรัก`, hint: 'มีเงิน 100 เหรียญ', age: [17, 45], cond: s => s.partner && !s.flags.married, deadline: 4, w: 2, check: s => s.money >= 100,
  offer: 'คนรักของคุณไม่เคยขออะไร แต่คุณอยากจัดงานแต่งที่ทั้งเมืองต้องจดจำ',
  reward: s => { s.flags.married = true; add(s, 'money', -60); add(s, 'mood', 25); add(s, 'fame', 5); log(s, `💒 งานแต่งกับ${s.partner}ยิ่งใหญ่ที่สุดในรอบสิบปี`, 'gold'); },
  fail: s => { add(s, 'mood', -6); } });
Q('well', { icon: '🪣', th: 'บ่อน้ำของหมู่บ้าน', desc: 'รวมแรงชาวบ้านขุดบ่อน้ำใหม่ก่อนหน้าแล้ง', hint: 'หาเงิน / สังคม 3 ครั้ง', age: [12, 50], cond: s => s.familyTier <= 2, steps: 3, p: 0.6, deadline: 3, track: { cats: ['money', 'social'] },
  offer: 'บ่อน้ำเก่าของหมู่บ้านแห้งขอด ถ้าไม่ขุดใหม่ก่อนหน้าแล้ง ทั้งหมู่บ้านจะลำบาก',
  reward: s => { add(s, 'fame', 8); add(s, 'luck', 4); addRoute(s, { common: 2, life: 1 }); log(s, 'ชาวบ้านสลักชื่อคุณไว้บนขอบบ่อ', 'good'); },
  fail: s => { add(s, 'mood', -5); } });
Q('beastBond', { icon: '🐾', th: 'สายสัมพันธ์กับสัตว์วิญญาณ', desc: 'สัตว์วิญญาณที่คุณเคยช่วยอยากพาไปพบบางสิ่งในป่า', hint: 'ผจญภัย 3 ครั้ง', age: [10, 45], cond: s => !!s.flags.beastFriend, steps: 3, p: 0.6, deadline: 4, track: { cats: ['adv'] },
  offer: 'สัตว์วิญญาณที่คุณเลี้ยงดูส่งเสียงเรียกจากชายป่าทุกคืน ราวกับอยากพาคุณไปที่ไหนสักแห่ง',
  reward: s => { s.flags.redBeast = true; add(s, 'agi', 3); addRoute(s, { beast: 3, life: 1 }); log(s, 'มันพาคุณไปพบรังสัตว์วิญญาณหมื่นปี และฝูงสัตว์ยอมรับคุณเป็นมิตร', 'gold'); } });

// ---------- เหตุการณ์รับภารกิจ (สร้างอัตโนมัติจากรายการ) ----------
// เหตุการณ์รับภารกิจ — เรียกใช้ได้จากไฟล์อื่นที่เพิ่มภารกิจภายหลัง (legend.js)
function questOfferEvent(q) {
  E('qo_' + q.id, { questOffer: q.id, forced: true, once: true, scene: 'village', make: s => ({
    title: `${q.icon} ภารกิจ: ${q.th}`, text: `${q.offer}<br><span class="qhint">🎯 เป้าหมาย: ${q.desc} · วิธีทำ: ${q.hint} · เวลา ${q.deadline} ปี</span>`,
    opts: [
      o('accept', 'รับภารกิจ', `สำเร็จแล้วได้รางวัล${q.fail ? ' · ล้มเหลวมีผลเสีย' : ''}`, { fx: [['', '📜 ภารกิจใหม่']] }),
      o('decline', 'ปฏิเสธ', '', { fxa: [] }),
    ],
  }), pick: { accept: s => startQuest(s, q.id) } });
}
Object.values(QUESTS).forEach(questOfferEvent);
// ฉากจบของภารกิจที่ต้องสู้
E('qf_wolf', { forced: true, once: false, scene: 'hunt', make: s => ({ title: '🐺 จ่าฝูงหมาป่าวายุปีศาจ', text: 'คุณตามรอยมาถึงถ้ำหลังเขา จ่าฝูงร่างใหญ่ตาแดงก่ำยืนขวางปากถ้ำ', opts: [
  o('fight', 'สู้กับจ่าฝูง', 'สนามประลอง (แพ้ไม่ถึงตายแต่บาดเจ็บ)', { fx: [['money', 30], ['fame', 6]] }),
  o('flee', 'ถอย แล้วรายงานว่าสู้ไม่ไหว', 'ภารกิจล้มเหลว', {}),
] }), pick: { fight: s => startBattle(s, 'arena', { title: '🐺 จ่าฝูงหมาป่า', eid: 'qf_wolf', foeName: 'จ่าฝูงหมาป่าวายุปีศาจ', lvlOff: R.i(0, 5) }), flee: s => failQuest(s, 'wolfPack') },
  battleEnd(s, won) { if (won) completeQuest(s, 'wolfPack'); else failQuest(s, 'wolfPack'); } });
E('qf_evil', { forced: true, once: false, scene: 'night', make: s => ({ title: '👹 รังของวิญญาจารย์ชั่วร้าย', text: 'ใต้ซากวิหารร้าง คุณได้ยินเสียงเด็กร้องไห้ วิญญาจารย์ชั่วร้ายหันมายิ้มเห็นฟันเปื้อนเลือด', opts: [
  o('fight', 'บุกช่วยเด็ก ๆ', 'ประลองเป็นตาย', { fx: [['fame', 15], ['money', 80]] }),
  o('report', 'ถอยออกมาแจ้งตำหนัก', 'ภารกิจล้มเหลว', {}),
] }), pick: { fight: s => startBattle(s, 'deathmatch', { title: '👹 วิญญาจารย์ชั่วร้าย', eid: 'qf_evil', foeTitle: 'วิญญาจารย์ชั่วร้าย', lvlOff: R.i(0, 6) }), report: s => failQuest(s, 'evilHunt') },
  battleEnd(s, won) { if (won) completeQuest(s, 'evilHunt'); else if (s.alive) failQuest(s, 'evilHunt'); } });

// ---------- กลไก ----------
function startQuest(s, id) {
  const q = QUESTS[id];
  (s.quests = s.quests || []).push({ id, prog: 0, until: s.age + q.deadline });
  log(s, `📜 รับภารกิจ <b>${q.th}</b> — ${q.hint} (ภายใน ${q.deadline} ปี)`, 'quest');
}
function endQuest(s, id) { s.quests = (s.quests || []).filter(x => x.id !== id); }
function completeQuest(s, id) {
  const q = QUESTS[id]; if (!q || !(s.quests || []).some(x => x.id === id)) return;
  endQuest(s, id); (s.questsDone = s.questsDone || []).push(id);
  log(s, `🏆 ภารกิจสำเร็จ: <b>${q.th}</b>`, 'gold');
  q.reward(s);
}
function failQuest(s, id) {
  const q = QUESTS[id]; if (!q || !(s.quests || []).some(x => x.id === id)) return;
  endQuest(s, id); (s.questsFailed = s.questsFailed || []).push(id);
  log(s, `❌ ภารกิจล้มเหลว: <b>${q.th}</b>`, 'bad');
  if (q.fail) q.fail(s);
}
// เรียกจากกิจกรรม/เหตุการณ์/การประลอง
function questHook(s, type, x) {
  for (const a of [...(s.quests || [])]) {
    const q = QUESTS[a.id], t = q.track;
    if (a.finale) continue;
    const hit = type === 'act' ? ((t.acts || []).includes(x.id) || (t.cats || []).includes(x.cat))
      : type === 'event' ? (t.events || []).includes(x) : (t.battles || []).includes(x);
    if (!hit || !R.chance(q.p)) continue;
    a.prog++;
    log(s, `📜 ภารกิจ「${q.th}」คืบหน้า ${a.prog}/${q.steps}`, 'quest');
    if (a.prog >= q.steps) {
      if (q.finale) { a.finale = true; s.queue.unshift(q.finale); }
      else completeQuest(s, a.id);
    }
  }
}
// ต้นปี: ตรวจภารกิจสะสม เส้นตาย และเสนอภารกิจใหม่
function questYear(s) {
  for (const a of [...(s.quests || [])]) {
    const q = QUESTS[a.id];
    if (q.check && q.check(s)) completeQuest(s, a.id);
    else if (s.age > a.until && !a.finale) failQuest(s, a.id);
  }
  if ((s.quests || []).length >= MAX_QUESTS || !R.chance(0.4)) return;
  const taken = new Set([...(s.quests || []).map(x => x.id), ...(s.questsDone || []), ...(s.questsFailed || [])]);
  const cands = Object.values(QUESTS).filter(q => !taken.has(q.id) && !s.seen['qo_' + q.id] && s.age >= q.age[0] && s.age <= q.age[1] && (!q.lv || (lvl(s) >= q.lv[0] && lvl(s) <= q.lv[1])) && (!q.cond || q.cond(s)));
  if (cands.length) s.queue.push('qo_' + R.wpick(cands, q => q.w).id);
}
