// ============================================================
// เส้นทางลับ (หลังบ้าน ผู้เล่นไม่เห็น) และการสืบทอดเทพ
// แต้มเส้นทาง s.route สะสมจากการเลือกและกิจกรรม เมื่อถึงเกณฑ์ เหตุการณ์ของเส้นทางนั้นจะแทรกเข้ามาในชีวิตเอง
// เส้นทาง: smith ช่างตีเหล็ก · tyrant ทรราช · limit พรหมยุทธ์สุดขีด · common คนธรรมดาพลิกชะตา · merchant พ่อค้า
//          killing สายสังหาร และแต้มของเทพแต่ละองค์ (ใช้ id ของเทพ)
// ============================================================
function addRoute(s, obj, mult = 1) {
  s.route = s.route || {};
  for (const k in obj) s.route[k] = (s.route[k] || 0) + obj[k] * mult;
}
const rp = (s, k) => (s.route && s.route[k]) || 0;

// ---------- แต้มเส้นทางจากการเลือกในเหตุการณ์ ----------
const ROUTE_HOOKS = {
  'zhuazhou:sword': { asura: 1, killing: 0.5 }, 'zhuazhou:book': { wisdom: 1.5 }, 'zhuazhou:coin': { merchant: 2 }, 'zhuazhou:crystal': { limit: 1 }, 'zhuazhou:cry': { common: 1 },
  'blacksmith:yes': { smith: 3 }, 'blacksmith:work': { smith: 2 }, 'c_tanghao:apprentice': { smith: 4, destruction: 1 }, 'c_tanghao:wine': { smith: 1 },
  'common6:help': { common: 1 }, 'common6:study': { common: 1, wisdom: 1 }, 'common6:fist': { common: 1 },
  'common12:smith': { smith: 5 }, 'common12:trader': { merchant: 4 }, 'common12:farmer': { common: 2 }, 'common12:scholar': { wisdom: 2, common: 1 },
  'career:merchant': { merchant: 4 }, 'career:hermit': { limit: 3 }, 'career:wuhun': { angel: 1 }, 'career:merc': { killing: 1 },
  'm_inherit:take': { merchant: 4 }, 'm_caravan:go': { merchant: 2 }, 'm_rivalHouse:compete': { merchant: 2 }, 'm_rivalHouse:thugs': { tyrant: 2 }, 'investment:all': { merchant: 2 }, 'p_patron:accept': { merchant: 1 },
  'killingCity:enter': { killing: 3, asura: 3 }, 'darkInvite:join': { tyrant: 4, rakshasa: 3 }, 'dirtyWork:obey': { tyrant: 2, rakshasa: 1 }, 'evilMaster:learn': { rakshasa: 2, tyrant: 1 },
  'r_throne:claim': { tyrant: 4 }, 'n_faction:second': { tyrant: 1 }, 'k_forbidden:steal': { tyrant: 1, limit: 1 }, 'k_feud:lead': { tyrant: 2, killing: 1 }, 'n_fief:raise': { tyrant: 2 }, 'n_fief:lower': { common: 1 },
  'c_hunttangsan:report': { tyrant: 1 }, 'c_hunttangsan:help': { seagod: 1 }, 'c_bibidong:swear': { rakshasa: 3, tyrant: 1 }, 'c_bibidong:elder': { angel: 3 }, 'c_renxue:join': { angel: 3 },
  'c_seagod:pillar': { seagod: 4 }, 'c_seagod:bless': { seagod: 2 }, 'voyage:sail': { seagod: 3 }, 'c_dugubo:poison': { limit: 1 }, 'c_erming:gift': { life: 2 }, 'c_erming:fight': { killing: 1 },
  'beastCub:heal': { life: 2 }, 'p_monk:learn': { limit: 2, wisdom: 1 }, 'master:yes': { wisdom: 2 }, 'c_master:kneel': { wisdom: 3 },
  'c_shrek7:oscar': { food: 3 }, 'c_shrek7:ning': { ninecolor: 3 }, 'c_shrek7:ma': { phoenix: 2 }, 'c_shrek7:dai': { tiger: 2 }, 'c_shrek7:tangsan': { seagod: 2, smith: 1 }, 'c_shrek7:xiaowu': { life: 1 }, 'c_shrek7:zhu': { tiger: 1, rakshasa: 1 },
  'seclusion:long': { limit: 2 }, 'iceFire:dive': { limit: 2, ice: 1, phoenix: 1 }, 'beggar:all': { common: 2, life: 1 }, 'beggar:give': { common: 1 }, 'p_sibling:forest': { life: 1, common: 1 }, 'p_hunger:share': { common: 1 },
  'war:front': { killing: 1, asura: 1 }, 'c_war:alliance': { seagod: 1, asura: 1 }, 'c_war:empire': { tyrant: 2, angel: 1 }, 'succession:duel': { tyrant: 1, killing: 1 }, 'emperor:accept': { tyrant: 1 },
  'titledDuel:accept': { killing: 1 }, 'c_ascend:pray': { seagod: 1 }, 'disciple:yes': { wisdom: 1 }, 'book:write': { wisdom: 2 }, 'p_mine:rescue': { common: 1 },
  'storyteller:ask': { limit: 0.5 }, 'earlyGift:rock': { destruction: 0.5 }, 'earlyGift:poem': { wisdom: 1 }, 'earlyGift:still': { limit: 1 }, 'earlyGift:climb': { thunder: 0.5 },
};
function routeHook(s, eid, key) { const h = ROUTE_HOOKS[eid + ':' + key]; if (h) addRoute(s, h); }

// ---------- ทุกต้นปี: ตรวจพรสวรรค์โดดเด่น และแทรกเหตุการณ์เส้นทาง ----------
function routeYear(s) {
  s.route = s.route || {};
  // อัจฉริยะ: ถึงเกณฑ์ก่อนวัย → เทพจะจับตามอง
  if (!s.flags.prodigy && ((isCultivator(s) && lvl(s) >= 40 && s.age <= 20) || (Math.max(s.str, s.agi, s.spi, s.wis) >= 70 && s.age <= 18) || (s.innate === 10 && s.souls.length > 1))) {
    s.flags.prodigy = true;
  }
  s.routeCD = s.routeCD || {};
  const evs = Object.values(EVENTS).filter(ev => ev.route && !(ev.once && s.seen[ev.id]) && !(s.routeCD[ev.id] != null && s.age - s.routeCD[ev.id] < 3) && s.age >= ev.age[0] && s.age <= ev.age[1] && ev.cond(s));
  if (evs.length && R.chance(0.65)) { const ev = R.pick(evs); s.routeCD[ev.id] = s.age; s.queue.push(ev.id); }
}
// ---------- ทุกปี: รายได้จากกิจการ/ช่าง ----------
function routeTick(s) {
  if (s.biz) add(s, 'money', Math.round(s.biz * 22 * R.f(0.7, 1.3)), true);
  if (s.tyr) { add(s, 'money', s.tyr * 25, true); if (R.chance(0.15)) add(s, 'fame', -2); }
}

// ================= เส้นทางช่างตีเหล็ก =================
const SMITH_RANKS = [0, 3, 7, 12, 19, 28, 39, 52, 68];
const smithTitle = r => r >= 10 ? 'เทพช่าง (神匠)' : r >= 9 ? 'ปราชญ์ช่าง (圣匠)' : `ช่างตีเหล็กขั้น ${r}`;
function smithExp(s, n) {
  if (!s.smith) return;
  s.smithExp = (s.smithExp || 0) + n;
  while (s.smith < 8 && s.smithExp >= SMITH_RANKS[s.smith + 1]) { s.smith++; log(s, `⚒️ ฝีมือช่างก้าวหน้า — คุณเป็น <b>${smithTitle(s.smith)}</b>`, 'gold'); add(s, 'fame', 2); }
}
E('R_smith_start', { route: true, age: [8, 50], cond: s => rp(s, 'smith') >= 3 && !s.smith, scene: 'forge', make: s => ({
  title: '🔥 ช่างเฒ่าแห่งเกิงซิน', text: 'ช่างตีเหล็กชราที่ผู้คนเรียกว่า "มือทอง" สังเกตเห็นวิธีที่คุณจับค้อน "เจ้ามีมือของช่าง มาเป็นศิษย์ข้าไหม? วันหนึ่งเจ้าอาจตีอาวุธให้เทพใช้"',
  opts: [
    o('yes', 'กราบเป็นศิษย์ช่าง', 'เริ่มต้นเส้นทางช่างตีเหล็ก · ตีเหล็กแล้วได้เงินตามขั้นช่าง', { fxa: [['str', 3]] }),
    o('no', 'ปฏิเสธ', '', { fxa: [] }),
  ],
}), pick: { yes: s => { s.smith = 1; s.smithExp = 0; log(s, '⚒️ คุณเป็น <b>ช่างตีเหล็กขั้น 1</b>', 'gold'); } } });
E('R_smith_order', { route: true, age: [14, 80], cond: s => s.smith >= 3, scene: 'forge', make: s => ({
  title: '🗡️ งานสั่งจากตระกูลใหญ่', text: 'ตระกูลวิญญาจารย์สั่งให้คุณตีอาวุธจากเหล็กดำพันปี ค่าจ้างงาม แต่ถ้าทำเสีย ชื่อเสียงจะพังทั้งหมด',
  opts: [
    o('take', 'รับงานและทุ่มฝีมือทั้งหมด', 'ขึ้นกับพละกำลังและปัญญา', { odds: pct(0.35 + (s.str + s.wis) / 300 + s.smith * 0.04), fx: [['money', 60 + s.smith * 20], ['fame', 6]], win: { fx: [['money', 60 + s.smith * 20], ['fame', 6]], say: 'อาวุธที่ตีออกมาส่องประกาย ทั้งตระกูลชื่นชม' }, lose: { fx: [['fame', -6], ['money', -30]], say: 'เหล็กแตกร้าวกลางเตา คุณต้องชดใช้' } }),
    o('no', 'ปฏิเสธเพราะยังไม่มั่นใจ', '', { fxa: [['wis', 1]] }),
  ],
}), pick: { take: (s, c, won) => { if (won) smithExp(s, 4); } } });
E('R_smith_meteor', { route: true, age: [16, 80], cond: s => s.smith >= 5, scene: 'forest', make: s => ({
  title: '☄️ เหล็กจากดวงดาว', text: 'อุกกาบาตตกลงในป่าใกล้เมือง ข้างในคือเหล็กดาราที่ช่างทั้งทวีปใฝ่ฝัน คุณไปถึงก่อนใคร',
  opts: [
    o('forge', 'ตีอาวุธประจำตัวด้วยเหล็กดารา', 'อาวุธคู่กาย พลังต่อสู้ +10%', { fxa: [['fame', 8]], fx: [['', '⚔️ พลังต่อสู้ +10%'], ['fame', 8]] }),
    o('sell', 'ขายให้สำนักใหญ่', 'ได้เงินมหาศาล', { fxa: [['money', 500]] }),
  ],
}), pick: { forge: s => { s.flags.starBlade = true; smithExp(s, 5); log(s, '⚔️ คุณตีอาวุธเหล็กดาราสำเร็จ — อาวุธคู่กายที่ไม่มีใครเหมือน', 'gold'); } } });
E('R_smith_tang', { route: true, age: [14, 80], cond: s => s.smith >= 4 && worldYear(s) >= 25 && !s.flags.tangSect, scene: 'forge', make: s => ({
  title: '🏹 สำนักถังเชิญเป็นช่างอาวุธลับ', text: 'สำนักถังต้องการช่างฝีมือดีช่วยผลิตอาวุธลับส่งทั่วทวีป และพร้อมแบ่งตำราการตีอาวุธลับให้',
  opts: [
    o('join', 'ร่วมงานกับสำนักถัง', 'ได้อาวุธลับและวิชาสำนักถัง', { flag: 'tangSect', fxa: [['money', 80], ['fame', 5]] }),
    o('no', 'ทำงานอิสระต่อ', '', { fxa: [] }),
  ],
}), pick: { join: s => { const w = HIDDEN_WEAPONS.find(x => !s.weapons.includes(x.id)); if (w) { s.weapons.push(w.id); log(s, `🏹 คุณตีอาวุธลับ <b>${w.th}</b> ไว้ใช้เอง`, 'gold'); } learnArt(s); smithExp(s, 4); } } });
E('R_smith_sage', { route: true, age: [30, 95], cond: s => s.smith >= 8, scene: 'temple', make: s => ({
  title: '🏛️ สอบเลื่อนขั้นปราชญ์ช่าง (圣匠)', text: 'สมาคมช่างแห่งทวีปจัดสอบขั้นปราชญ์ช่าง ทั้งทวีปมีไม่ถึงสิบคน ผู้สอบต้องตีอาวุธที่วิญญาจารย์ระดับราชันใช้ได้ภายในสามวัน',
  opts: [
    o('try', 'เข้าสอบ', 'ขึ้นกับพละกำลัง พลังจิต และปัญญา', { odds: pct(0.05 + (s.str + s.spi + s.wis) / 500), fx: [['fame', 30]], win: { fx: [['fame', 30], ['money', 200]], say: '🏅 คุณได้เป็น <b>ปราชญ์ช่าง (圣匠)</b>!' }, lose: { fx: [['fame', -3]], hurt: [10, 25], cause: 'เตาหลอมระเบิด', say: 'อาวุธที่ตีออกมายังไม่ผ่านเกณฑ์' } }),
    o('wait', 'ขอฝึกฝีมือต่ออีกหน่อย', '', { fxa: [] }),
  ],
}), once: false, pick: { try: (s, c, won) => { if (won) { s.smith = 9; s.title = s.title || 'ปราชญ์ช่าง'; } } } });
E('R_smith_god', { route: true, age: [40, 120], cond: s => s.smith === 9, scene: 'forge', make: s => ({
  title: '🔥 ตีศาสตราเทพ (神器)', text: 'คุณได้ยินเสียงเหล็กร้องเรียกในความฝัน — ถึงเวลาตีศาสตราที่แม้แต่เทพยังต้องการ หากสำเร็จ คุณจะเป็น <b>เทพช่าง (神匠)</b> หนึ่งเดียวของยุค แต่เตาหลอมเทพอาจเผาผลาญชีวิตคุณ',
  opts: [
    o('forge', 'จุดเตาหลอมเทพ', 'ใช้พลังทั้งชีวิต', { odds: pct(0.08 + (s.str + s.spi) / 450 + s.luck / 800), fx: [['fame', 100]], win: { fx: [['fame', 100], ['money', 1000]], say: '🔥 ศาสตราเทพถือกำเนิด! คุณคือ <b>เทพช่าง (神匠)</b>' }, lose: { hurt: [40, 80], die: 0.3, cause: 'ถูกเปลวไฟเตาหลอมเทพเผาผลาญ', say: 'เตาหลอมเทพระเบิด!' } }),
    o('no', 'ยังไม่ถึงเวลา', '', { fxa: [] }),
  ],
}), once: false, pick: { forge: (s, c, won) => { if (won) { s.smith = 10; s.title = 'เทพช่าง (神匠)'; s.flags.starBlade = true; } } } });

// ================= เส้นทางทรราช =================
E('R_ty_gang', { route: true, age: [16, 70], cond: s => rp(s, 'tyrant') >= 4 && !s.tyr && isCultivator(s), scene: 'night', make: s => ({
  title: '🗡️ ผู้คนที่ยอมก้มหัว', text: 'วิญญาจารย์นอกกฎหมายกลุ่มหนึ่งเห็นความโหดเหี้ยมของคุณ และขอติดตามเป็นลูกน้อง "ขอแค่ท่านนำทาง พวกเราจะบดขยี้ทุกคนที่ขวางหน้า"',
  opts: [
    o('lead', 'ยอมรับเป็นนาย', 'ได้อำนาจและเงินทุกปี · ผู้คนเริ่มหวาดกลัว', { fxa: [['money', 50], ['fame', -5]] }),
    o('send', 'ไล่ไป', '', { fxa: [['mood', 3]] }),
  ],
}), pick: { lead: s => { s.tyr = 1; addRoute(s, { tyrant: 2 }); } } });
E('R_ty_city', { route: true, age: [20, 80], cond: s => s.tyr === 1 && rp(s, 'tyrant') >= 8 && (lvl(s) >= 45 || s.familyTier >= 5), scene: 'war', make: s => {
  const city = R.pick(PLACES.filter(p => p.wealth >= 0));
  return { title: '🏴 ยึดเมือง', text: `ลูกน้องของคุณมีมากพอจะยึด<b>${city.th}</b> เจ้าเมืองเป็นวิญญาจารย์ที่แข็งแกร่ง`, ctx: { city: city.th }, opts: [
    o('attack', 'บุกยึดเมือง', 'ประลองเป็นตายกับเจ้าเมือง', { fx: [['money', 300], ['fame', 20]] }),
    o('wait', 'ยังไม่ถึงเวลา', '', { fxa: [] }),
  ] };
}, once: false, pick: { attack: (s, c) => { s.tyCity = c.city; startBattle(s, 'deathmatch', { title: `🏴 ศึกยึด${c.city}`, eid: 'R_ty_city', lvlOff: R.i(0, 8), foeTitle: 'เจ้าเมือง' }); } },
  battleEnd(s, won) { if (won) { s.tyr = 2; add(s, 'money', 300); add(s, 'fame', 20); s.flags.hunted = true; s.title = `จอมทรราชแห่ง${s.tyCity}`; log(s, `🏴 คุณยึด${s.tyCity}ได้ ผู้คนเรียกคุณว่า <b>${s.title}</b>`, 'gold'); } } });
E('R_ty_empire', { route: true, age: [30, 110], cond: s => s.tyr === 2 && rp(s, 'tyrant') >= 12 && lvl(s) >= 65, scene: 'war', make: s => {
  const p = pct(0.15 + combatPower(s) / 5000 + rp(s, 'tyrant') / 100);
  return { title: '👑 สถาปนาจักรวรรดิของตนเอง', text: 'อำนาจของคุณแผ่ไปหลายเมือง ถึงเวลาที่จะประกาศตั้งจักรวรรดิ หรือโค่นราชวงศ์เดิมลงจากบัลลังก์ — สองจักรวรรดิและตำหนักวิญญาณยุทธ์จะร่วมมือกันบดขยี้คุณ', ctx: { p }, opts: [
    o('rise', 'ประกาศตั้งจักรวรรดิ', 'ชนะ = จักรพรรดิทรราช / แพ้ = ส่วนใหญ่ตาย', { odds: p, fx: [['fame', 120]], win: { fx: [['fame', 120], ['money', 2000]], say: '👑 คุณขึ้นเป็น <b>จักรพรรดิทรราช</b> ทั่วทวีปสั่นสะท้าน' }, lose: { die: 0.65, hurt: [50, 90], cause: 'ถูกทัพพันธมิตรทั่วทวีปบดขยี้', say: 'ทัพพันธมิตรล้อมเมืองหลวงของคุณ!' } }),
    o('hold', 'พอใจกับอำนาจที่มี', '', { fxa: [] }),
  ] };
}, once: false, pick: { rise: (s, c, won) => { if (won) { s.title = 'จักรพรรดิทรราช'; s.tyr = 3; changeTier(s, 6 - s.familyTier, 'คุณสถาปนาราชวงศ์ใหม่'); } else if (s.alive) { s.tyr = 0; s.title = null; } } } });
E('R_ty_heroes', { route: true, age: [20, 120], cond: s => s.tyr >= 1 && rp(s, 'tyrant') >= 6, scene: 'night', make: s => ({
  title: '⚔️ วีรชนมาปราบทรราช', text: 'กลุ่มวิญญาจารย์หนุ่มสาวที่เรียกตัวเองว่า "ผู้พิทักษ์ธรรม" บุกมาถึงหน้าประตู พวกเขาประกาศจะล้างแค้นให้ชาวบ้าน',
  opts: [
    o('fight', 'บดขยี้พวกมัน', 'ประลองเป็นตาย', { fx: [['fame', 5]] }),
    o('repent', 'ยอมสำนึกผิด ปล่อยวางอำนาจ', 'ทิ้งเส้นทางทรราช', { fxa: [['mood', 10], ['fame', 5], ['money', -Math.floor(s.money * 0.5)]] }),
  ],
}), once: false, pick: { fight: s => startBattle(s, 'deathmatch', { title: '⚔️ ผู้พิทักษ์ธรรม', eid: 'R_ty_heroes', lvlOff: R.i(2, 10), tierMin: 3, foeTitle: 'ผู้นำวีรชน' }), repent: s => { s.tyr = 0; s.route.tyrant = 0; if (s.title && /ทรราช/.test(s.title)) s.title = null; } },
  battleEnd(s, won) { if (won) addRoute(s, { tyrant: 1 }); } });

// ================= เส้นทางพรหมยุทธ์สุดขีด =================
E('R_lim_peak', { route: true, age: [30, 150], cond: s => isCultivator(s) && lvl(s) >= 75 && (rp(s, 'limit') >= 3 || talent(s).val >= 80), scene: 'forest', make: s => ({
  title: '🏔️ ยอดเขาหิมะนิรันดร์', text: 'คุณได้ยินว่าบนยอดเขาสูงสุดของดินแดนเหนือ มีถ้ำที่พรหมยุทธ์สุดขีดในอดีตเคยปลีกวิเวก พลังฟ้าดินที่นั่นเข้มข้นกว่าที่ใด',
  opts: [
    o('go', 'ปลีกวิเวกที่ยอดเขา 3 ปี', 'บำเพ็ญ ×2 · เสี่ยงหนาวตายและลมปราณย้อนกลับ', { years: 3, boost: 2, fx: [['soul', '×2 นาน 3 ปี']], risk: { p: 0.12, hurt: [30, 60], die: 0.25, dis: 0.3, cause: 'สิ้นใจกลางพายุหิมะบนยอดเขา', say: 'พายุหิมะนิรันดร์กลืนกินถ้ำ!' } }),
    o('no', 'ยังไม่พร้อม', '', { fxa: [] }),
  ],
}), pick: { go: s => addRoute(s, { limit: 3 }) } });
E('R_lim_break', { route: true, age: [30, 200], cond: s => isCultivator(s) && lvl(s) >= 95 && lvl(s) < 99 && !s.god, scene: 'sea', make: s => {
  const p = pct(0.2 + s.spi / 220 + rp(s, 'limit') / 40 + s.luck / 600);
  return { title: '⚡ ทะลวงขีดจำกัดของมนุษย์', text: 'พลังของคุณแตะเพดานที่มนุษย์จะไปถึงได้ หากทะลวงสำเร็จ คุณจะเป็น <b>พรหมยุทธ์สุดขีด (极限斗罗)</b> หนึ่งในไม่กี่คนในประวัติศาสตร์ — หากล้มเหลว ร่างอาจแตกสลาย', ctx: { p }, opts: [
    o('break', 'ทุ่มทุกอย่างทะลวงขีดจำกัด', 'สำเร็จ = ระดับ 99 และอายุยืนขึ้นมาก', { odds: p, fx: [['soul', '→99'], ['fame', 80]], win: { fx: [['fame', 80]], say: '⚡ ฟ้าดินสั่นสะเทือน — คุณคือ <b>พรหมยุทธ์สุดขีด</b>!' }, lose: { hurt: [40, 80], die: 0.3, dis: 0.3, cause: 'ร่างแตกสลายขณะทะลวงขีดจำกัด', say: 'พลังย้อนกลับฉีกเส้นลมปราณ!' } }),
    o('wait', 'สะสมพลังต่ออีกหน่อย', '', { fxa: [] }),
  ] };
}, once: false, pick: { break: (s, c, won) => { if (won) { s.level = 99; s.title = 'พรหมยุทธ์สุดขีด'; s.lifeBase += 50; } else if (s.alive) s.level = Math.max(90, s.level - 2); } } });

// ================= คนธรรมดาพลิกชะตา =================
E('R_com_oldman', { route: true, age: [10, 55], cond: s => rp(s, 'common') >= 7 && (!isCultivator(s) || s.innate <= 3) && R.chance(0.5), scene: 'village', make: s => ({
  title: '🍵 ชายชราที่แวะขอน้ำ', text: 'ชายชราเสื้อขาดรุ่งริ่งแวะขอน้ำดื่มทุกวันเป็นเวลาหลายเดือน คุณดูแลเขาอย่างดีโดยไม่หวังอะไร วันสุดท้ายเขาหัวเราะ "เจ้าอยากได้อะไรจากพรหมยุทธ์แก่ ๆ คนนี้?"',
  opts: [
    o('power', 'ขอพลังวิญญาณ', 'เขาจะชำระเส้นลมปราณให้ — อาจปลุกพลังที่หลับใหล', { odds: 0.65, fx: [['soul', '+']], win: { say: '🌟 พลังวิญญาณในร่างคุณตื่นขึ้นอย่างรุนแรง!' }, lose: { hurt: [20, 40], cause: 'เส้นลมปราณรับพลังไม่ไหว', say: 'ร่างกายรับพลังไม่ไหว แต่คุณรอดมาได้' } }),
    o('heal', 'ขอวิชาแพทย์', 'กลายเป็นหมอเทวดาผู้รักษาคนทั้งแผ่นดิน', { fxa: [['wis', 10], ['fame', 10]], flag: 'doctor' }),
    o('gold', 'ขอเงินทอง', 'ครอบครัวจะไม่ลำบากอีก', { fxa: [['money', 300]] }),
  ],
}), pick: {
  power: (s, c, won) => { if (!won) return; if (!isCultivator(s)) { s.awakened = true; s.innate = R.i(4, 7); s.level = s.innate; if (s.path === 'home' || PATHS[s.path].group === 'common') setPath(s, 'wander'); } else { s.innate = Math.min(9, s.innate + R.i(2, 4)); s.level = Math.min(ringCap(s), s.level + 3); } log(s, `พลังวิญญาณแต่กำเนิดของคุณกลายเป็นระดับ ${s.innate}`, 'gold'); },
  heal: s => { s.title = s.title || 'หมอเทวดา'; },
  gold: s => changeTier(s, 1, 'เงินจากชายชราลึกลับเปลี่ยนชีวิตครอบครัว'),
} });
E('R_com_prince', { route: true, age: [12, 60], cond: s => rp(s, 'common') >= 10 && s.familyTier <= 3 && R.chance(0.4), scene: 'road', make: s => ({
  title: '🐎 รถม้าที่ตกเหว', text: 'คุณเห็นรถม้าหรูตกข้างทางระหว่างพายุ ข้างในมีชายหนุ่มแต่งกายสูงศักดิ์บาดเจ็บ ส่วนผู้ติดตามตายหมด',
  opts: [
    o('save', 'แบกเขาข้ามเขาไปหาหมอ', 'เหนื่อยแทบขาดใจ', { fxa: [['hp', -20], ['fame', 10]] }),
    o('rob', 'ค้นของมีค่าแล้วจากไป', 'ได้เงินทันที แต่บาปติดตัว', { fxa: [['money', 120], ['mood', -10]], flag: 'darkSeed' }),
  ],
}), pick: { save: s => { log(s, '👑 ชายผู้นั้นคือองค์ชายแห่งเทียนโต่ว! พระองค์ตอบแทนบุญคุณอย่างมหาศาล', 'gold'); changeTier(s, 2, 'องค์ชายประทานบรรดาศักดิ์ตอบแทนที่ช่วยชีวิต'); add(s, 'money', 200); } } });
E('R_com_invent', { route: true, age: [16, 70], cond: s => rp(s, 'common') >= 12 && !isCultivator(s) && s.wis >= 50, scene: 'village', make: s => ({
  title: '⚙️ สิ่งประดิษฐ์ของคนไร้พลัง', text: 'คนที่ไม่มีพลังวิญญาณต้องใช้สมองแทน คุณคิดค้นกังหันน้ำแบบใหม่ที่ทำให้ไร่นาทั้งอำเภอได้น้ำพอ',
  opts: [
    o('share', 'เผยแพร่ให้ชาวบ้านใช้ฟรี', 'ชื่อเสียงขจรไกล', { fxa: [['fame', 30], ['luck', 5]] }),
    o('sell', 'ขายสิทธิ์ให้พ่อค้าใหญ่', 'ร่ำรวยทันที', { fxa: [['money', 400]] }),
  ],
}), pick: { share: s => { s.title = s.title || 'นักประดิษฐ์ผู้เปลี่ยนแผ่นดิน'; }, sell: s => changeTier(s, 1, 'สิ่งประดิษฐ์ทำให้ครอบครัวร่ำรวย') } });
E('R_com_elder', { route: true, age: [40, 100], cond: s => rp(s, 'common') >= 15 && s.fame >= 30, scene: 'village', make: s => ({
  title: '🏘️ ผู้ใหญ่ที่ทุกคนรัก', text: 'ชาวบ้านทั้งเมืองลงชื่อขอให้คุณเป็นผู้ปกครองเมือง เพราะตลอดชีวิตคุณช่วยเหลือผู้คนโดยไม่เคยหวังผล',
  opts: [
    o('accept', 'รับตำแหน่ง', 'ดูแลบ้านเกิดในบั้นปลาย', { fxa: [['fame', 20], ['mood', 15]] }),
    o('decline', 'ขอใช้ชีวิตเรียบง่ายต่อไป', '', { fxa: [['mood', 10], ['luck', 3]] }),
  ],
}), pick: { accept: s => { s.title = s.title || 'เจ้าเมืองผู้เป็นที่รัก'; } } });

// ================= เส้นทางพ่อค้า =================
E('R_mer_shop', { route: true, age: [14, 60], cond: s => rp(s, 'merchant') >= 6 && !s.biz, scene: 'city', make: s => ({
  title: '🏪 ร้านแรกของตัวเอง', text: 'คุณเก็บเงินและประสบการณ์มากพอจะเปิดร้านของตัวเองแล้ว ทำเลดี ๆ ในตลาดกำลังว่าง',
  opts: [
    o('open', 'ลงทุน 40 เหรียญเปิดร้าน', 'มีรายได้ทุกปี', { fxa: [['money', -40]], lock: s.money < 40 ? 'เงินไม่ถึง 40' : null }),
    o('no', 'ยังไม่พร้อม', '', { fxa: [] }),
  ],
}), once: false, pick: { open: s => { s.biz = 1; log(s, '🏪 ร้านของคุณเปิดแล้ว!', 'good'); } } });
E('R_mer_branch', { route: true, age: [18, 75], cond: s => s.biz === 1 && rp(s, 'merchant') >= 10 && s.money >= 250, scene: 'city', make: s => ({
  title: '🏙️ ขยายสาขาสู่นครหลวง', text: 'ร้านของคุณขายดีจนมีพ่อค้านครหลวงเทียนโต่วชวนร่วมทุนเปิดสาขา',
  opts: [
    o('expand', 'ลงทุน 150 เปิดสาขา', 'ขึ้นกับปัญญา', { odds: statOdds(s, 'wis', 0.35, 120), fx: [['money', -150]], win: { fx: [['money', -150], ['fame', 8]], say: 'สาขาใหม่ขายดีเกินคาด!' }, lose: { fx: [['money', -150]], say: 'หุ้นส่วนโกงเงินหนีไป' } }),
    o('no', 'อยู่อย่างพอดี', '', { fxa: [] }),
  ],
}), once: false, pick: { expand: (s, c, won) => { if (won) s.biz = 2; } } });
E('R_mer_guild', { route: true, age: [25, 90], cond: s => s.biz === 2 && rp(s, 'merchant') >= 15 && s.money >= 800, scene: 'city', make: s => ({
  title: '💰 หอการค้าแห่งทวีป', text: `กิจการของคุณใหญ่พอจะก่อตั้งหอการค้าของตนเอง${worldYear(s) >= 26 && worldYear(s) <= 28 ? ' — ขณะที่สงครามกำลังลุกลาม ทั้งสองฝ่ายต้องการเสบียงอย่างมาก' : ''}`,
  opts: [
    o('found', 'ก่อตั้งหอการค้า', 'กลายเป็นยักษ์ใหญ่ทางการค้า', { fxa: [['money', -300], ['fame', 20]] }),
    o('war', 'ขายเสบียงให้ทั้งสองฝ่ายในสงคราม', 'กำไรมหาศาล แต่ถูกสาปแช่ง', { fxa: [['money', 800], ['fame', -15]], lock: worldYear(s) < 26 || worldYear(s) > 28 ? 'ไม่มีสงครามในตอนนี้' : null }),
    o('no', 'ไม่ขยายอีก', '', { fxa: [] }),
  ],
}), pick: { found: s => { s.biz = 3; changeTier(s, 1, 'หอการค้าของคุณมีอิทธิพลไปทั่ว'); }, war: s => { s.biz = 3; addRoute(s, { tyrant: 2 }); } } });
E('R_mer_richest', { route: true, age: [30, 110], cond: s => s.biz >= 3 && s.money >= 4000, scene: 'city', make: s => ({
  title: '🏆 เศรษฐีอันดับหนึ่งของทวีป', text: 'ทั่วทวีปยอมรับว่าไม่มีใครร่ำรวยกว่าคุณ แม้แต่จักรพรรดิยังต้องยืมเงิน',
  opts: [
    o('legacy', 'ตั้งกองทุนสร้างสถาบันวิญญาจารย์ให้เด็กยากจน', 'ชื่อเสียงคงอยู่ร้อยปี', { fxa: [['money', -1000], ['fame', 60]] }),
    o('more', 'สะสมความมั่งคั่งต่อไป', '', { fxa: [['money', 500]] }),
  ],
}), pick: { legacy: s => { s.title = 'ผู้อุปถัมภ์แห่งทวีป'; }, more: s => { s.title = s.title || 'เศรษฐีอันดับหนึ่งแห่งทวีป'; } } });

// ================= การสืบทอดเทพ =================
// คะแนนความเหมาะสมกับเทพแต่ละองค์: วิญญาณยุทธ์ + สาย + ประสบการณ์ (flag) + แต้มเส้นทาง + พรสวรรค์
function godScore(s, g) {
  let sc = 0;
  const souls = s.souls.map(id => SOUL_BY_ID[id]);
  if (souls.some(x => (g.souls || []).includes(x.base || x.id))) sc += 45;
  else if (souls.some(x => (g.roles || []).includes(x.role) || (g.types || []).includes(x.type))) sc += 15;
  sc += Math.min(40, (g.flags || []).filter(f => s.flags[f]).length * 20);
  sc += Math.min(30, rp(s, g.id) * 4);
  sc += Math.min(33, s[g.stat] / 3);
  if (s.innate >= 9) sc += 10;
  if (s.souls.length > 1) sc += 10;
  sc += Math.max(...souls.map(x => x.tier >= 5 ? 15 : x.tier === 4 ? 8 : 0));
  if (s.flags.prodigy) sc += 15;
  if (g.need && !g.need(s)) sc = 0;
  return sc;
}
function bestGod(s) {
  let best = null, bs = 0;
  for (const g of GODS) {
    const minL = (g.minLvl || 70) - (s.flags.prodigy ? 10 : 0);
    if (lvl(s) < minL) continue;
    const sc = godScore(s, g);
    if (sc > bs) { bs = sc; best = g; }
  }
  return bs >= 95 ? best : null;
}
E('godCall', {
  forced: true,
  when: s => !s.god && !s.seen.godCall && isCultivator(s) && s.age <= 120 && bestGod(s) && yearlyRoll(s, 'god', s.flags.seaIsle || s.flags.godInspired ? 0.35 : 0.18),
  make: s => {
    const g = bestGod(s);
    return {
      title: `🌟 เสียงเรียกจาก${g.th} (${g.zh})`, scene: g.scene,
      text: `แสงศักดิ์สิทธิ์ส่องลงมาจากฟากฟ้า เสียงของ<b>${g.th}</b>ดังก้องในจิตใจ "${g.call}" — มาที่${g.place} แล้วผ่าน<b>บททดสอบเทพทั้ง ${g.trials.length} ขั้น</b> หากล้มเหลว วิญญาณเจ้าจะแหลกสลาย`,
      ctx: { g: g.id },
      opts: [
        o('accept', 'รับการสืบทอดเทพ', `บททดสอบ ${g.trials.length} ขั้น แต่ละขั้นเสี่ยงตายสูง · ผ่านทั้งหมด = กลายเป็นเทพ`, { fx: [['fame', '+'], ['soul', '→100']], danger: 0.5 }),
        o('refuse', 'ปฏิเสธ ขอใช้ชีวิตอย่างมนุษย์', 'โอกาสนี้จะไม่กลับมาอีก', { fxa: [['mood', 5]] }),
      ],
    };
  },
  pick: { accept: (s, c) => { s.god = { id: c.g, stage: 0, fails: 0 }; log(s, `🌟 คุณเดินทางสู่${GODS.find(x => x.id === c.g).place} เพื่อเริ่มบททดสอบ`, 'gold'); } },
});
E('godTrial', {
  forced: true, once: false, when: s => !!s.god,
  make: s => {
    const g = GODS.find(x => x.id === s.god.id), n = s.god.stage, N = g.trials.length;
    const keys = ['str', 'agi', 'spi', 'wis'];
    const pick3 = [g.stat, ...keys.filter(k => k !== g.stat).sort(() => Math.random() - 0.5).slice(0, 2)];
    const verb = { str: 'ใช้พละกำลังฝ่าฟันตรง ๆ', agi: 'อาศัยความว่องไวหาช่องโหว่', spi: 'ใช้พลังจิตต้านทาน', wis: 'ใช้ปัญญาไขความลับของบททดสอบ' };
    const opts = pick3.map(k => {
      const p = pct(clamp(0.05 + s[k] / 200 + s.luck / 800 + (k === g.stat ? 0.1 : 0) + lvl(s) / 1000 - n * (0.14 / N) * 1.5 + (s.flags.prodigy ? 0.04 : 0), 0.05, 0.85));
      return o(k, verb[k], `ใช้${STAT_TH[k]} (${Math.round(s[k])})${k === g.stat ? ' · ทางที่เทพโปรดปราน' : ''}`, {
        odds: p, fx: [[k, 4], ['soul', '+']],
        win: { fx: [[k, 4], ['fame', 5]], say: `✅ คุณผ่านบททดสอบขั้นที่ ${n + 1}!` },
        lose: { hurt: [40, 75], dis: 0.4, die: 0.5, cause: `วิญญาณแตกสลายในบททดสอบ${g.th}ขั้นที่ ${n + 1}`, say: `❌ บททดสอบขั้นที่ ${n + 1} บดขยี้คุณ` },
      });
    });
    opts.push(o('quit', 'ถอนตัวจากการสืบทอด', 'รอดชีวิต แต่มรดกเทพจะสลายไปตลอดกาล', { fxa: [['mood', -20], ['spi', -5]] }));
    return { title: `⚜️ บททดสอบ${g.th} ขั้นที่ ${n + 1}/${N}`, scene: g.scene, years: 1, text: `บททดสอบ: <b>${g.trials[n]}</b>${s.god.fails ? `<br><span style="color:var(--warn)">คุณเคยล้มเหลวมาแล้ว ${s.god.fails} ครั้ง</span>` : ''}`, opts };
  },
  pick: new Proxy({}, { get: (_, k) => (s, c, won) => {
    if (k === 'quit') { log(s, 'แสงศักดิ์สิทธิ์ดับวูบ มรดกเทพสลายหายไป', 'bad'); s.god = null; return; }
    if (!s.alive) return;
    const g = GODS.find(x => x.id === s.god.id);
    if (won) {
      s.god.stage++;
      cultivate(s, 0.8);
      if (s.god.stage >= g.trials.length) {
        s.level = 100; s.title = g.th; add(s, 'fame', 300);
        log(s, `🌟 <b>คุณผ่านบททดสอบทั้งหมด และสืบทอดตำแหน่ง${g.th} (${g.zh})!</b> ร่างของคุณทะยานสู่อาณาจักรเทพ`, 'gold');
        s.alive = false; s.ascended = true; s.cause = `สืบทอดเป็น${g.th} ขึ้นสู่อาณาจักรเทพ`;
      }
    } else s.god.fails++;
  } }),
});
