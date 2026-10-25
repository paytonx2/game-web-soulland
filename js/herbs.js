// ============================================================
// สมุนไพรวิญญาณ — เจอระหว่างผจญภัย กินแล้วได้หลายอย่างพร้อมกัน แต่มีพิษ/ผลข้างเคียง
// tox = โอกาสเกิดพิษเมื่อกินสด · cult = ผลต่อการบำเพ็ญ (เฉพาะผู้มีพลังวิญญาณ) · life = อายุขัย
// ============================================================
const HERBS = [
  { id: 'lingzhi', th: 'เห็ดหลินจือม่วง', zh: '紫灵芝', w: 10, fx: [['wis', 3], ['luck', 2], ['hp', 10]], tox: 0.12, price: 20, side: 'เห็ดพิษหน้าตาเหมือนกันขึ้นอยู่ข้าง ๆ' },
  { id: 'ginseng', th: 'โสมวิญญาณร้อยปี', zh: '百年灵参', w: 9, fx: [['hp', 25], ['str', 2], ['agi', 1]], life: 1, tox: 0.08, price: 30, side: 'ฤทธิ์ร้อนแรง เลือดกำเดาไหลได้' },
  { id: 'dragongrass', th: 'หญ้าเลือดมังกร', zh: '龙血草', w: 7, fx: [['str', 3], ['hp', 15]], cult: 0.3, tox: 0.12, price: 35, side: 'เลือดร้อนพล่านจนเส้นเลือดอาจแตก' },
  { id: 'thunder', th: 'หญ้าอัสนีม่วง', zh: '紫电草', w: 6, fx: [['agi', 4], ['spi', 2]], cult: 0.3, tox: 0.15, price: 40, side: 'กระแสไฟฟ้าในต้นไหลเข้าหัวใจ' },
  { id: 'dream', th: 'รากไม้ฝันกลางวัน', zh: '梦魂根', w: 4, fx: [['luck', 4], ['spi', 3], ['mood', 10]], tox: 0.12, price: 50, side: 'อาจหลงอยู่ในภาพหลอนไม่ตื่น' },
  { id: 'snowlotus', th: 'บัวหิมะพันปี', zh: '千年雪莲', w: 4, fx: [['spi', 3], ['wis', 2], ['hp', 10]], cult: 0.6, tox: 0.06, price: 80, side: 'ความเย็นจัดอาจทำร้ายเส้นลมปราณ' },
  { id: 'ninefire', th: 'ผลเพลิงเก้าแฉก', zh: '九叶火果', w: 3, fx: [['str', 4], ['spi', 2], ['hp', 10]], cult: 0.8, tox: 0.2, price: 90, side: 'ไฟในผลอาจเผาอวัยวะภายใน' },
  { id: 'icegrass', th: 'หญ้าน้ำแข็งแปดแฉก', zh: '八角玄冰草', w: 1.5, fx: [['spi', 4], ['agi', 2], ['wis', 1]], cult: 0.9, tox: 0.15, price: 150, side: 'ร่างอาจแข็งเป็นน้ำแข็ง', rare: true },
  { id: 'fireapricot', th: 'ดอกเพลิงซิ่งเจียวซู', zh: '烈火杏娇疏', w: 1.5, fx: [['str', 4], ['hp', 15], ['agi', 1]], cult: 0.9, tox: 0.15, price: 150, side: 'เปลวไฟในดอกอาจเผาเส้นลมปราณ', rare: true },
  { id: 'qiluo', th: 'ทิวลิปฉีหลัว', zh: '绮罗郁金香', w: 0.6, fx: [['str', 2], ['agi', 2], ['spi', 2], ['wis', 2], ['hp', 20]], cult: 1.2, life: 3, tox: 0.05, price: 300, side: 'แทบไม่มีพิษ แต่พลังมหาศาลเกินร่างเด็ก', rare: true },
];
const HERB_BY_ID = Object.fromEntries(HERBS.map(h => [h.id, h]));
const HERB_PLACES = ['forestedge', 'sunset', 'shenghun', 'north'];
const herbScale = (h, k) => h.fx.map(([key, n]) => [key, Math.round(n * k)]).filter(([, n]) => n);
const herbPrev = (s, h, k = 1) => [...herbScale(h, k), ...(h.cult && isCultivator(s) ? [['soul', `บำเพ็ญ +${(h.cult * k * 0.35).toFixed(1)} ปี`]] : []), ...(h.life ? [['', `⏳ อายุขัย +${Math.round(h.life * k)}`]] : [])];
function eatHerb(s, h, k, toxP) {
  if (R.chance(toxP)) {
    log(s, `☠️ พิษของ${h.th}กำเริบ — ${h.side}`, 'bad');
    hurt(s, R.i(15, 40) * (h.rare ? 1.3 : 1), `พิษจาก${h.th}`);
    if (s.alive && R.chance(0.2)) randomDisability(s);
    if (s.alive && R.chance(0.5)) { for (const [key, n] of herbScale(h, k * 0.4)) add(s, key, n); log(s, 'แม้จะถูกพิษ ร่างกายก็ยังดูดซับฤทธิ์ยาได้บางส่วน', 'warn'); }
    return;
  }
  for (const [key, n] of herbScale(h, k)) add(s, key, n);
  if (h.cult && isCultivator(s)) cultivate(s, h.cult * k * 0.35);
  if (h.life) s.lifeBase += Math.round(h.life * k);
  log(s, `🌿 ฤทธิ์ของ${h.th}แผ่ซ่านทั่วร่าง`, 'good');
  if (h.rare && typeof canMutate === 'function' && canMutate(s) && isCultivator(s) && R.chance(0.06)) mutateSoul(s, rollMutation(s, { good: 15 }), `ฤทธิ์ของ${h.th}กระตุ้นวิญญาณยุทธ์`);
}
function pickHerb(s) {
  const lf = 1 + Math.max(0, s.luck - 50) / 40;
  return R.wpick(HERBS, h => h.w * (h.rare ? lf : 1) * (h.w <= 4 && HERB_PLACES.includes(s.place) ? 1.5 : 1));
}

E('h_find', { age: [3, 95], w: s => 0.35 + (HERB_PLACES.includes(s.place) ? 0.4 : 0) + (['merc', 'wander', 'hermit', 'farmer'].includes(s.path) ? 0.3 : 0) + (s.flags.herb ? 0.4 : 0), once: false, scene: 'forest', make: s => {
  const h = pickHerb(s), brew = s.wis >= 35 || s.bg === 'apothecary' || !!s.mentor || s.path === 'hermit';
  return { title: `🌿 พบ${h.th} (${h.zh})`, ctx: { id: h.id },
    text: `${s.age < 12 ? 'ระหว่างวิ่งเล่นในป่า' : 'ระหว่างเดินทาง'} คุณพบ<b>${h.th}</b>${h.rare ? ' สมุนไพรระดับตำนานที่วิญญาจารย์ทั้งทวีปตามหา' : ''} ขึ้นอยู่ใต้ร่มไม้ — ${h.side}`,
    opts: [
      o('eat', 'กินสด ๆ ตรงนั้นเลย', `ได้ครบทุกอย่าง · พิษ ${Math.round(h.tox * 100)}%`, { fx: herbPrev(s, h, 1), danger: h.tox * 0.15 }),
      o('brew', 'นำกลับไปต้มเป็นยาอย่างถูกวิธี', brew ? `ฤทธิ์ 80% · พิษเหลือ ${Math.round(h.tox * 30)}%` : '', { fx: herbPrev(s, h, 0.8), lock: brew ? null : 'ต้องมีความรู้เรื่องยา (ปัญญา 35+ / มีอาจารย์ / ลูกร้านยา)' }),
      o('sell', 'นำไปขายร้านยา', `${h.rare ? 'ราคาสูงลิ่ว' : 'ได้เงินก้อนหนึ่ง'}`, { fxa: [['money', h.price]] }),
      o('give', s.age < 12 ? 'นำไปให้พ่อแม่' : s.mentor ? `มอบให้${s.mentor}` : 'มอบให้หมอในหมู่บ้าน', 'ได้น้ำใจและชื่อเสียง', { fxa: [['mood', 5], ['fame', h.rare ? 6 : 2], ['luck', 1]] }),
    ] };
}, pick: { eat: (s, c) => { const h = HERB_BY_ID[c.id]; eatHerb(s, h, 1, h.tox); }, brew: (s, c) => { const h = HERB_BY_ID[c.id]; eatHerb(s, h, 0.8, h.tox * 0.3); } } });
