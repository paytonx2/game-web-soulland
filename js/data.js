// ============================================================
// ข้อมูลโลก ตำนานจอมยุทธ์ภูตถังซาน (斗罗大陆)
// ============================================================

// ---------- ชื่อจีน ----------
const SURNAMES = [
  ['หลิน','林'],['เฉิน','陈'],['หวัง','王'],['หลี่','李'],['จาง','张'],['หลิว','刘'],['จ้าว','赵'],
  ['โจว','周'],['อู๋','吴'],['ซุน','孙'],['หู','胡'],['หยาง','杨'],['ซู','苏'],['เยี่ย','叶'],
  ['ไป๋','白'],['ฮั่ว','霍'],['เซียว','萧'],['ฉิน','秦'],['เจียง','江'],['ลู่','陆'],['กู่','古'],
  ['เฟิง','风'],['หาน','韩'],['สวี่','许'],['เซี่ย','谢'],['หลัว','罗'],['มู่','沐'],['หลง','龙'],
  ['เยว่','月'],['ฉู่','楚'],['เหยียน','颜'],['ซ่ง','宋'],['ถัง','汤'],['หม่า','马'],['เซวียน','玄'],
  ['ซือหม่า','司马'],['ซ่างกวน','上官'],['มู่หรง','慕容'],['หนานกง','南宫'],['ตงฟาง','东方'],['โอวหยาง','欧阳'],
];
const GIVEN_M = [
  ['เยว่เฉิน','月尘'],['เทียนหาน','天寒'],['อวี่เฮ่า','雨浩'],['เฟิงอวิ๋น','风云'],['จื่อเซวียน','子轩'],
  ['เฮ่าหราน','浩然'],['อี้ฝาน','一凡'],['ฉางคง','长空'],['เสวียนเทียน','玄天'],['อู๋จี้','无忌'],
  ['ชิงเฟิง','清风'],['ม่อเหยียน','墨言'],['จิ่งอวิ๋น','景云'],['หลิงเซียว','凌霄'],['เจิ้นอวี่','震宇'],
  ['เทียนหลาง','天朗'],['ซิงเหอ','星河'],['ไห่หลาน','海澜'],['เส้าเฉิน','少辰'],['จวิ้นอี้','君逸'],
  ['เจ๋ออวี่','泽宇'],['หมิงเซวียน','明轩'],['ปั๋วเหวิน','博文'],['ฉีเฟิง','启峰'],['อวี่เจ๋อ','宇泽'],
  ['หยุนชิง','云卿'],['จ้านเทียน','战天'],['หลิงเฟิง','凌风'],['เซียวหราน','萧然'],['เฉิงอวี่','承宇'],
];
const GIVEN_F = [
  ['เยว่เอ๋อร์','月儿'],['ปิงเสวี่ย','冰雪'],['หลิงหลิง','玲玲'],['เมิ่งฉิน','梦琴'],['อวี้เหยียน','玉颜'],
  ['ชิงหลัว','青萝'],['ซีเอ๋อร์','溪儿'],['หรงหรง','荣荣'],['ซูซู','素素'],['จื่ออี','紫衣'],
  ['เสวี่ยหลิง','雪灵'],['อวิ๋นเอ๋อร์','云儿'],['เมิ่งเหยา','梦瑶'],['เสี่ยวอู่','小舞'],['ฮวาเหยา','花瑶'],
  ['ซินหราน','欣然'],['อวี่ถง','雨桐'],['หลันซิน','兰心'],['หว่านชิง','婉清'],['ซือเหยา','诗瑶'],
  ['จู๋ชิง','竹清'],['เหยียนหราน','嫣然'],['ลั่วอวี่','落雨'],['ชิวสุ่ย','秋水'],['เฟยเอ๋อร์','菲儿'],
  ['หนิงเซียง','凝香'],['ม่านอวิ๋น','曼云'],['เจ๋อเอ๋อร์','泽儿'],['ฉิงเสวี่ย','晴雪'],['หลีหลัว','璃落'],
];

// ---------- สถานที่เกิด ----------
const PLACES = [
  { id:'shenghun', th:'หมู่บ้านวิญญาณศักดิ์สิทธิ์', zh:'圣魂村', nation:'จักรวรรดิเทียนโต่ว', danger:1, wealth:-1, desc:'หมู่บ้านเล็ก ๆ ใต้การปกครองเมืองนั่วติง บ้านเกิดของถังซาน' },
  { id:'nuoding', th:'เมืองนั่วติง', zh:'诺丁城', nation:'จักรวรรดิเทียนโต่ว', danger:1, wealth:0, desc:'เมืองขนาดกลาง มีสถาบันวิญญาจารย์ขั้นต้นนั่วติง' },
  { id:'suotuo', th:'เมืองซั่วทัว', zh:'索托城', nation:'จักรวรรดิเทียนโต่ว', danger:2, wealth:1, desc:'เมืองการค้า ที่ตั้งสนามประลองวิญญาณใหญ่ซั่วทัว ใกล้สถาบันเชร็ค' },
  { id:'tiandou', th:'นครหลวงเทียนโต่ว', zh:'天斗城', nation:'จักรวรรดิเทียนโต่ว', danger:1, wealth:2, desc:'เมืองหลวงที่รุ่งเรืองที่สุดของจักรวรรดิเทียนโต่ว' },
  { id:'xingluo', th:'นครหลวงซิงหลัว', zh:'星罗城', nation:'จักรวรรดิซิงหลัว', danger:1, wealth:2, desc:'เมืองหลวงจักรวรรดิซิงหลัว ดินแดนแห่งพยัคฆ์ขาว' },
  { id:'wuhun', th:'นครวิญญาณยุทธ์', zh:'武魂城', nation:'ตำหนักวิญญาณยุทธ์', danger:1, wealth:2, desc:'นครศักดิ์สิทธิ์ของตำหนักวิญญาณยุทธ์' },
  { id:'gengxin', th:'เมืองเกิงซิน', zh:'庚辛城', nation:'จักรวรรดิเทียนโต่ว', danger:2, wealth:0, desc:'เมืองแห่งช่างตีเหล็ก' },
  { id:'fishing', th:'หมู่บ้านชาวประมงริมทะเล', zh:'近海渔村', nation:'ชายฝั่งตะวันออก', danger:2, wealth:-1, desc:'หมู่บ้านริมทะเล มีสัตว์วิญญาณทะเลและพายุ' },
  { id:'forestedge', th:'เมืองชายป่าดาวซิงโต่ว', zh:'星斗大森林边镇', nation:'ชายแดน', danger:3, wealth:-1, desc:'เมืองเล็กติดป่าใหญ่ดาวซิงโต่ว สัตว์วิญญาณมักบุกเข้ามา' },
  { id:'sunset', th:'หมู่บ้านป่าอาทิตย์อัสดง', zh:'落日森林村', nation:'จักรวรรดิเทียนโต่ว', danger:2, wealth:-1, desc:'หมู่บ้านใกล้ป่าที่เต็มไปด้วยสมุนไพรและสัตว์พิษ' },
  { id:'north', th:'ชายขอบดินแดนเหนือสุด', zh:'极北之地边缘', nation:'ดินแดนหนาวเหน็บ', danger:3, wealth:-2, desc:'ดินแดนหิมะนิรันดร์ ความหนาวคร่าชีวิตคนทุกฤดูหนาว' },
  { id:'leiting', th:'เมืองเหลยถิง', zh:'雷霆城', nation:'จักรวรรดิเทียนโต่ว', danger:1, wealth:1, desc:'ถิ่นฐานของตระกูลมังกรทรราชสายฟ้าคราม' },
];

// ---------- ฐานะครอบครัว ----------
// ฐานะยิ่งดี ค่าต่าง ๆ ยิ่งได้เปรียบ แต่ไม่ทิ้งห่างจนคนจนหมดโอกาส
// train = ตัวคูณการฝึก, income = เหรียญทองวิญญาณ/ปี, care = คุณภาพการรักษา (0-1)
// p0 = โอกาสไม่มีพลังวิญญาณ, innUp = โอกาสพลังแต่กำเนิดสูงกว่าปกติ, full = โอกาสพลังเต็มขั้น 10
// soulW = น้ำหนักวิญญาณยุทธ์ระดับ 1–5, bias = ค่าเริ่มต้นที่ได้จากการเลี้ยงดู
const FAMILY_TIERS = [
  { id:1, th:'ยากจนข้นแค้น', desc:'กินมื้ออดมื้อ ทำงานหนักตั้งแต่เด็ก', train:0.85, income:1, care:0.5, p0:0.28, innUp:0.08, full:0.004, soulW:[40, 32, 18, 8, 2], bias:{ str:3, agi:2, spi:1, wis:-2, luck:4 }, weight:30, start:0 },
  { id:2, th:'ชาวบ้านธรรมดา', desc:'พอมีพอกิน ได้เรียนหนังสือบ้าง', train:0.92, income:4, care:0.62, p0:0.24, innUp:0.11, full:0.005, soulW:[37, 32, 20, 9, 2], bias:{ str:2, agi:1, spi:1, wis:0, luck:2 }, weight:32, start:2 },
  { id:3, th:'พ่อค้าคหบดี', desc:'มีอันจะกิน ได้เรียนเลขและการค้า', train:1.0, income:25, care:0.75, p0:0.2, innUp:0.15, full:0.006, soulW:[33, 31, 22, 11, 3], bias:{ str:0, agi:1, spi:2, wis:4, luck:1 }, weight:18, start:20 },
  { id:4, th:'ตระกูลขุนนาง', desc:'มีครูส่วนตัว ยาบำรุง และเส้นสาย', train:1.08, income:80, care:0.85, p0:0.15, innUp:0.19, full:0.008, soulW:[30, 31, 24, 12, 3], bias:{ str:1, agi:1, spi:3, wis:6, luck:0 }, weight:11, start:80 },
  { id:5, th:'ตระกูลวิญญาจารย์', desc:'ถูกฝึกวิชาประจำตระกูลตั้งแต่ยังเดินไม่แข็ง', train:1.14, income:120, care:0.9, p0:0.08, innUp:0.24, full:0.01, soulW:[26, 30, 26, 14, 4], bias:{ str:3, agi:3, spi:4, wis:4, luck:0 }, weight:6, start:120 },
  { id:6, th:'สำนักใหญ่ / ราชวงศ์', desc:'สายเลือดสูงส่งที่สุดในทวีป และศัตรูมากที่สุด', train:1.2, income:400, care:0.96, p0:0.05, innUp:0.28, full:0.012, soulW:[23, 30, 27, 15, 5], bias:{ str:4, agi:4, spi:5, wis:7, luck:-2 }, weight:3, start:500 },
];

// ภูมิหลังย่อยในแต่ละฐานะ: mods = ค่าเริ่มต้นเพิ่ม/ลด, money = เงินตั้งต้นเพิ่ม, noIncome = ไม่มีครอบครัวส่งเสีย
const BACKGROUNDS = [
  { tier:1, id:'hunter', th:'ลูกนายพรานยากจน', desc:'โตมากับป่า รู้จักสัตว์ป่าดี', mods:{ agi:3, str:1 } },
  { tier:1, id:'tenant', th:'ลูกชาวนาเช่าที่', desc:'ครอบครัวเป็นหนี้เจ้าที่ดินมาหลายรุ่น', mods:{ str:3, mood:-5 } },
  { tier:1, id:'orphan', th:'เด็กกำพร้าในวัดร้าง', desc:'ไม่มีพ่อแม่ ต้องเอาตัวรอดเอง', mods:{ luck:8, spi:2, mood:-10 }, noIncome:true },
  { tier:1, id:'miner', th:'ลูกคนงานเหมือง', desc:'ฝุ่นแร่ติดตัวตั้งแต่เกิด ร่างกายทนทาน', mods:{ str:4, hp:-10 } },
  { tier:1, id:'fisher', th:'ลูกชาวประมง', desc:'ว่ายน้ำเก่งก่อนเดินได้', mods:{ agi:3, spi:1 } },
  { tier:2, id:'carpenter', th:'ลูกช่างไม้', desc:'มือไม้คล่องแคล่ว ชอบประดิษฐ์', mods:{ agi:2, wis:1 } },
  { tier:2, id:'smithkid', th:'ลูกช่างตีเหล็ก', desc:'ได้ยินเสียงค้อนทั้งวันทั้งคืน', mods:{ str:3 } },
  { tier:2, id:'peddler', th:'ลูกพ่อค้าแผงลอย', desc:'คิดเลขเร็ว ปากหวาน', mods:{ wis:2, luck:2 } },
  { tier:2, id:'soldierkid', th:'ลูกทหารเกณฑ์', desc:'พ่อไปรบไม่ค่อยได้กลับบ้าน', mods:{ str:2, spi:1 } },
  { tier:3, id:'apothecary', th:'ลูกเจ้าของร้านยา', desc:'รู้จักสมุนไพรร้อยชนิด', mods:{ wis:3, hp:10 } },
  { tier:3, id:'silk', th:'ลูกพ่อค้าผ้าไหม', desc:'เดินทางไปหลายเมืองกับกองคาราวาน', mods:{ wis:2, luck:2 }, money:10 },
  { tier:3, id:'inn', th:'ลูกเจ้าของโรงเตี๊ยม', desc:'ได้ยินข่าวลือของยุทธภพทุกวัน', mods:{ wis:2, spi:1 } },
  { tier:4, id:'civil', th:'ลูกขุนนางฝ่ายบุ๋น', desc:'อ่านตำราตั้งแต่สามขวบ', mods:{ wis:4 } },
  { tier:4, id:'general', th:'ลูกแม่ทัพ', desc:'ถูกฝึกวินัยทหารตั้งแต่เด็ก', mods:{ str:3, spi:1 } },
  { tier:4, id:'lord', th:'ลูกเจ้าเมือง', desc:'คนทั้งเมืองรู้จักชื่อตั้งแต่เกิด', mods:{ fame:5 }, money:30 },
  { tier:5, id:'mainline', th:'ทายาทสายตรง', desc:'ถูกคาดหวังให้เป็นประมุขรุ่นต่อไป', mods:{ spi:2, fame:5, mood:-3 } },
  { tier:5, id:'branch', th:'ทายาทสายรอง', desc:'ต้องพิสูจน์ตัวเองให้สายตรงยอมรับ', mods:{ str:2, agi:2 } },
  { tier:5, id:'bastard', th:'ลูกนอกสมรสของผู้อาวุโส', desc:'ถูกดูแคลนในตระกูล แต่มีไฟในใจ', mods:{ spi:4, mood:-10, luck:3 }, money:-80 },
  { tier:6, id:'heir', th:'ทายาทลำดับแรก', desc:'ผู้สืบทอดบัลลังก์ — และเป้าของมือสังหาร', mods:{ fame:15, wis:2 } },
  { tier:6, id:'second', th:'ทายาทลำดับรอง', desc:'อยู่ในเงาของพี่ แต่มีอิสระกว่า', mods:{ agi:2, luck:2 } },
  { tier:6, id:'distant', th:'เชื้อสายห่าง ๆ', desc:'มีสายเลือดสูงส่ง แต่ไม่ค่อยมีใครสนใจ', mods:{ luck:4 }, money:-300 },
];

// ตระกูลที่มีวิญญาณยุทธ์สืบทอด (ฐานะ 5-6)
const CLANS = [
  { id:'haotian', tier:6, th:'สำนักเฮ่าเทียน', zh:'昊天宗', sur:['ถัง','唐'], soul:'haotian', mut:null, place:'tiandou', desc:'หนึ่งในสามสำนักบน วิญญาณยุทธ์อาวุธอันดับหนึ่งของทวีป' },
  { id:'lanba', tier:6, th:'ตระกูลมังกรทรราชสายฟ้าคราม', zh:'蓝电霸王龙家族', sur:['อวี้','玉'], soul:'lanba', mut:'luosanpao', place:'leiting', desc:'หนึ่งในสามสำนักบน วิญญาณยุทธ์สัตว์อันดับหนึ่ง' },
  { id:'qibao', tier:6, th:'สำนักหอแก้วเจ็ดสมบัติ', zh:'七宝琉璃宗', sur:['หนิง','宁'], soul:'qibao', mut:'jiubao', place:'tiandou', desc:'หนึ่งในสามสำนักบน วิญญาณยุทธ์สนับสนุนอันดับหนึ่ง' },
  { id:'wuhundian', tier:6, th:'ตำหนักวิญญาณยุทธ์ สายเลือดเชียน', zh:'武魂殿千氏', sur:['เชียน','千'], soul:'holyangel', mut:null, place:'wuhun', desc:'สายเลือดของสังฆราชตำหนักวิญญาณยุทธ์' },
  { id:'dai', tier:6, th:'ราชวงศ์ไต้แห่งซิงหลัว', zh:'星罗戴氏', sur:['ไต้','戴'], soul:'whitetiger', mut:null, place:'xingluo', desc:'ราชวงศ์จักรวรรดิซิงหลัว สายเลือดพยัคฆ์ขาว' },
  { id:'zhu', tier:5, th:'ตระกูลจู', zh:'朱家', sur:['จู','朱'], soul:'nethercat', mut:null, place:'xingluo', desc:'ตระกูลใหญ่แห่งซิงหลัว สายเลือดวิฬารโลกันตร์' },
  { id:'dugu', tier:5, th:'ตระกูลตู๋กู', zh:'独孤家', sur:['ตู๋กู','独孤'], soul:'greensnake', mut:'greensnakeking', place:'tiandou', desc:'ตระกูลพิษที่โด่งดัง' },
  { id:'tai', tier:5, th:'ตระกูลไท่ (สำนักพลัง)', zh:'力之一族', sur:['ไท่','泰'], soul:'divineape', mut:null, place:'tiandou', desc:'หนึ่งในสี่สำนักธาตุ เชี่ยวชาญพลังมหาศาล' },
  { id:'huyan', tier:5, th:'สำนักเกราะคชสาร', zh:'象甲宗', sur:['ฮูเหยียน','呼延'], soul:'mammoth', mut:null, place:'tiandou', desc:'หนึ่งในสี่สำนักธาตุ ป้องกันไร้เทียมทาน' },
  { id:'xue', tier:6, th:'ราชวงศ์เสวี่ยแห่งเทียนโต่ว', zh:'天斗雪氏', sur:['เสวี่ย','雪'], soul:'swan', mut:null, place:'tiandou', desc:'ราชวงศ์จักรวรรดิเทียนโต่ว' },
  { id:'ma', tier:5, th:'ตระกูลหม่า', zh:'马家', sur:['หม่า','马'], soul:'firephoenix', mut:null, place:'suotuo', desc:'ตระกูลวิญญาจารย์สายเลือดฟีนิกซ์' },
];

// ---------- วิญญาณยุทธ์ ----------
// type: beast สัตว์ / tool อุปกรณ์ / plant พืช / body ร่างกาย / food อาหาร
// tier: 1 ด้อย, 2 ธรรมดา, 3 ดี, 4 ยอดเยี่ยม, 5 ตำนาน
// role: power โจมตีพลัง, agile โจมตีว่องไว, control ควบคุม, defense ป้องกัน, support สนับสนุน, heal รักษา, food อาหาร, none ไร้การต่อสู้
const SOULS = [
  // tier 1
  { id:'hoe', th:'จอบ', zh:'锄头', type:'tool', tier:1, role:'none' },
  { id:'sickle', th:'เคียว', zh:'镰刀', type:'tool', tier:1, role:'none' },
  { id:'bluesilver', th:'หญ้าเงินคราม', zh:'蓝银草', type:'plant', tier:1, role:'control', mut:'bluesilverking' },
  { id:'sausage', th:'ไส้กรอก', zh:'香肠', type:'food', tier:1, role:'food' },
  { id:'mantou', th:'ซาลาเปา', zh:'馒头', type:'food', tier:1, role:'heal' },
  { id:'candy', th:'ถั่วน้ำตาล', zh:'糖豆', type:'food', tier:1, role:'food' },
  { id:'orange', th:'ส้ม', zh:'橘子', type:'food', tier:1, role:'heal' },
  { id:'carrot', th:'แคร์รอต', zh:'胡萝卜', type:'food', tier:1, role:'food' },
  { id:'chicken', th:'น่องไก่', zh:'大鸡腿', type:'food', tier:1, role:'food' },
  { id:'chopstick', th:'ตะเกียบ', zh:'筷子', type:'tool', tier:1, role:'agile' },
  { id:'pipe', th:'ไปป์', zh:'烟斗', type:'tool', tier:1, role:'support' },
  { id:'dog', th:'สุนัข', zh:'狗', type:'beast', tier:1, role:'agile' },
  { id:'pigeon', th:'นกพิราบ', zh:'鸽子', type:'beast', tier:1, role:'agile' },
  { id:'goose', th:'ห่าน', zh:'鹅', type:'beast', tier:1, role:'power' },
  { id:'raccoon', th:'แรคคูน', zh:'浣熊', type:'beast', tier:1, role:'agile' },
  { id:'toad', th:'คางคก', zh:'蟾蜍', type:'beast', tier:1, role:'control' },
  { id:'whitecat', th:'แมวขาวน้อย', zh:'小白猫', type:'beast', tier:1, role:'agile' },
  { id:'willow', th:'ต้นหลิว', zh:'柳树', type:'plant', tier:1, role:'control' },
  { id:'sunflower', th:'ดอกทานตะวัน', zh:'太阳花', type:'plant', tier:1, role:'support' },
  { id:'lotus', th:'ดอกบัว', zh:'莲花', type:'plant', tier:1, role:'heal' },
  { id:'mimosa', th:'ดอกไมยราบ', zh:'含羞草', type:'plant', tier:1, role:'control' },
  { id:'vine', th:'เถาวัลย์', zh:'青藤', type:'plant', tier:1, role:'control' },
  { id:'butterfly', th:'ผีเสื้อ', zh:'蝴蝶', type:'beast', tier:1, role:'support' },
  { id:'book', th:'หนังสือ', zh:'书', type:'tool', tier:1, role:'support' },
  { id:'needle', th:'เข็มเงิน', zh:'银针', type:'tool', tier:1, role:'agile' },
  { id:'shortknife', th:'มีดสั้น', zh:'短刀', type:'tool', tier:1, role:'agile' },
  // tier 2
  { id:'ironhammer', th:'ค้อนเหล็ก', zh:'铁锤', type:'tool', tier:2, role:'power' },
  { id:'longdagger', th:'กริชยาว', zh:'长匕首', type:'tool', tier:2, role:'agile' },
  { id:'shortsword', th:'ดาบสั้น', zh:'短剑', type:'tool', tier:2, role:'agile' },
  { id:'boar', th:'หมูป่าเขาดำ', zh:'黑角山猪', type:'beast', tier:2, role:'power' },
  { id:'bison', th:'วัวป่า', zh:'野牛', type:'beast', tier:2, role:'power' },
  { id:'lonewolf', th:'หมาป่าเดียวดาย', zh:'独狼', type:'beast', tier:2, role:'agile' },
  { id:'ironbear', th:'หมีหลังเหล็ก', zh:'铁背熊', type:'beast', tier:2, role:'power' },
  { id:'eagle', th:'อินทรี', zh:'鹰', type:'beast', tier:2, role:'agile' },
  { id:'firebird', th:'นกไฟ', zh:'火鸟', type:'beast', tier:2, role:'power' },
  { id:'flashbird', th:'นกแฟลช', zh:'闪鸟', type:'beast', tier:2, role:'agile' },
  { id:'lark', th:'นกกระจาบฝน', zh:'百灵鸟', type:'beast', tier:2, role:'support' },
  { id:'owl', th:'นกฮูก', zh:'猫鹰', type:'beast', tier:2, role:'agile' },
  { id:'snowleopard', th:'เสือดาวหิมะ', zh:'雪豹', type:'beast', tier:2, role:'agile' },
  { id:'blacktiger', th:'พยัคฆ์นิลกาฬ', zh:'黑虎', type:'beast', tier:2, role:'power' },
  { id:'seahorse', th:'ม้าน้ำ', zh:'海马', type:'beast', tier:2, role:'support' },
  { id:'starfish', th:'ปลาดาว', zh:'海星', type:'beast', tier:2, role:'defense' },
  { id:'heavyshield', th:'โล่หนัก', zh:'重盾', type:'tool', tier:2, role:'defense' },
  { id:'ironwave', th:'โล่คลื่นเหล็ก', zh:'铁浪盾', type:'tool', tier:2, role:'defense' },
  { id:'bonestaff', th:'คทากระดูก', zh:'骨杖', type:'tool', tier:2, role:'support' },
  { id:'crystalball', th:'ลูกแก้วคริสตัล', zh:'水晶球', type:'tool', tier:2, role:'support' },
  { id:'mirror', th:'กระจกเงา', zh:'明镜', type:'tool', tier:2, role:'support' },
  { id:'bigfan', th:'พัดใหญ่', zh:'大扇子', type:'tool', tier:2, role:'control' },
  { id:'rock', th:'หิน', zh:'岩石', type:'tool', tier:2, role:'defense' },
  { id:'wind', th:'ลม', zh:'风', type:'tool', tier:2, role:'agile' },
  { id:'water', th:'น้ำ', zh:'水', type:'tool', tier:2, role:'control' },
  { id:'sand', th:'ทราย', zh:'沙', type:'tool', tier:2, role:'control' },
  { id:'spark', th:'ประกายไฟ', zh:'火星', type:'tool', tier:2, role:'power' },
  { id:'skeleton', th:'โครงกระดูก', zh:'骷髅', type:'beast', tier:2, role:'power' },
  { id:'marten', th:'พังพอนสายฟ้า', zh:'闪电貂', type:'beast', tier:2, role:'agile' },
  { id:'body', th:'ร่างกาย', zh:'身体', type:'body', tier:2, role:'power' },
  { id:'skin', th:'ผิวหนัง', zh:'皮肤', type:'body', tier:2, role:'defense' },
  { id:'rightarm', th:'แขนขวา', zh:'右臂', type:'body', tier:2, role:'power' },
  { id:'leg', th:'ขา', zh:'腿', type:'body', tier:2, role:'agile' },
  { id:'cigar', th:'ซิการ์', zh:'雪茄', type:'tool', tier:2, role:'support' },
  // tier 3
  { id:'soulspear', th:'ทวนทำลายวิญญาณ', zh:'破魂枪', type:'tool', tier:3, role:'power' },
  { id:'goldlion', th:'ราชาราชสีห์ทองคำ', zh:'黄金狮王', type:'beast', tier:3, role:'power' },
  { id:'flashleopard', th:'เสือดาวอัสนี', zh:'闪电豹', type:'beast', tier:3, role:'agile' },
  { id:'thunderwolf', th:'หมาป่าสายฟ้า', zh:'雷狼', type:'beast', tier:3, role:'agile' },
  { id:'darkgoldbear', th:'หมีทองหม่น', zh:'暗金熊', type:'beast', tier:3, role:'power' },
  { id:'kingkongbear', th:'หมีเพชรจอมพลัง', zh:'大力金刚熊', type:'beast', tier:3, role:'power' },
  { id:'divineape', th:'วานรเทพจอมพลัง', zh:'大力神猿', type:'beast', tier:3, role:'power' },
  { id:'mammoth', th:'แมมมอธเพชร', zh:'猛犸', type:'beast', tier:3, role:'defense' },
  { id:'xuanwushield', th:'โล่เต่าดำ', zh:'玄武盾', type:'tool', tier:3, role:'defense' },
  { id:'rhinoshield', th:'โล่วิญญาณแรด', zh:'灵犀盾', type:'tool', tier:3, role:'defense' },
  { id:'dragonstaff', th:'กระบองผนึกมังกร', zh:'盘龙棍', type:'tool', tier:3, role:'power' },
  { id:'skyaxe', th:'ขวานสะเทือนสวรรค์', zh:'震天斧', type:'tool', tier:3, role:'power' },
  { id:'moonbow', th:'ธนูยิงจันทรา', zh:'射月弓', type:'tool', tier:3, role:'agile' },
  { id:'swan', th:'หงส์', zh:'天鹅', type:'beast', tier:3, role:'support' },
  { id:'greensnake', th:'อสรพิษมรกต', zh:'碧磷蛇', type:'beast', tier:3, role:'control' },
  { id:'icestaff', th:'ไม้เท้าน้ำแข็ง', zh:'冰杖', type:'tool', tier:3, role:'control' },
  { id:'thunderball', th:'ลูกแก้วสายฟ้า', zh:'雷电球', type:'tool', tier:3, role:'power' },
  { id:'jadephoenixqin', th:'กู่ฉินฟีนิกซ์หยก', zh:'玉凰琴', type:'tool', tier:3, role:'support' },
  { id:'soulbell', th:'ระฆังคุมวิญญาณ', zh:'摄魂铃', type:'tool', tier:3, role:'control' },
  { id:'starcrown', th:'มงกุฎดารา', zh:'星冠', type:'tool', tier:3, role:'support' },
  { id:'falcon', th:'เหยี่ยวอัสนี', zh:'闪电隼', type:'beast', tier:3, role:'agile' },
  { id:'shadoweagle', th:'เทพอินทรีเงาคราม', zh:'青影神鹰', type:'beast', tier:3, role:'agile' },
  { id:'goldcroc', th:'ราชาจระเข้ทองคำ', zh:'黄金鳄王', type:'beast', tier:3, role:'defense' },
  { id:'skeletonking', th:'ราชาโครงกระดูก', zh:'骷髅王', type:'beast', tier:3, role:'power' },
  { id:'snowlotus', th:'บัวหิมะ', zh:'雪莲', type:'plant', tier:3, role:'heal' },
  { id:'eyes', th:'ดวงตา', zh:'眼睛', type:'body', tier:3, role:'support' },
  { id:'wings', th:'ปีก', zh:'翅膀', type:'body', tier:3, role:'agile' },
  { id:'brain', th:'สมอง', zh:'大脑', type:'body', tier:3, role:'support' },
  { id:'purplebamboo', th:'ไผ่ม่วง', zh:'紫煌竹', type:'plant', tier:3, role:'control' },
  { id:'piranhasun', th:'ดอกตะวันปิรันย่า', zh:'太阳食人花', type:'plant', tier:3, role:'control' },
  { id:'demonfox', th:'ปีศาจจิ้งจอก', zh:'妖狐', type:'beast', tier:3, role:'control' },
  { id:'softbunny', th:'กระต่ายอรชร', zh:'柔骨兔', type:'beast', tier:3, role:'agile' },
  { id:'ghostleopard', th:'เสือดาวผี', zh:'鬼豹', type:'beast', tier:3, role:'agile' },
  { id:'sunwood', th:'กระบี่ไม้สุริยัน', zh:'阳木剑', type:'tool', tier:3, role:'agile' },
  { id:'mooncrescent', th:'ดาบจันทร์เสี้ยว', zh:'半月刃', type:'tool', tier:3, role:'agile' },
  { id:'thunderumbrella', th:'ร่มอัสนี', zh:'雷伞', type:'tool', tier:3, role:'control' },
  { id:'lightning', th:'สายฟ้า', zh:'雷', type:'tool', tier:3, role:'power' },
  { id:'ice', th:'น้ำแข็ง', zh:'冰', type:'tool', tier:3, role:'control' },
  { id:'fire', th:'ไฟ', zh:'火', type:'tool', tier:3, role:'power' },
  // tier 4
  { id:'sevenkill', th:'กระบี่เจ็ดสังหาร', zh:'七杀剑', type:'tool', tier:4, role:'agile' },
  { id:'whitetiger', th:'พยัคฆ์ขาว', zh:'白虎', type:'beast', tier:4, role:'power' },
  { id:'nethercat', th:'วิฬารโลกันตร์', zh:'幽冥灵猫', type:'beast', tier:4, role:'agile' },
  { id:'firephoenix', th:'ฟีนิกซ์เพลิง', zh:'火凤凰', type:'beast', tier:4, role:'power' },
  { id:'icephoenix', th:'ฟีนิกซ์น้ำแข็ง', zh:'冰凤凰', type:'beast', tier:4, role:'control' },
  { id:'greensnakeking', th:'จักรพรรดิอสรพิษมรกต', zh:'碧磷蛇皇', type:'beast', tier:4, role:'control' },
  { id:'qibao', th:'หอแก้วเจ็ดสมบัติ', zh:'七宝琉璃塔', type:'tool', tier:4, role:'support' },
  { id:'ninefox', th:'จิ้งจอกเก้าหาง', zh:'九尾狐', type:'beast', tier:4, role:'control' },
  { id:'begonia', th:'ไห่ถังเก้าสารัตถะ', zh:'九心海棠', type:'plant', tier:4, role:'heal' },
  { id:'titanape', th:'วานรยักษ์ไททัน', zh:'泰坦巨猿', type:'beast', tier:4, role:'power' },
  { id:'firedragon', th:'มังกรไฟ', zh:'火龙', type:'beast', tier:4, role:'power' },
  { id:'deathscythe', th:'เคียวเทพมรณะ', zh:'死神镰刀', type:'tool', tier:4, role:'power' },
  { id:'purgatoryhalberd', th:'ง้าวเพลิงโลกันตร์', zh:'炼狱戟', type:'tool', tier:4, role:'power' },
  { id:'bonedragon', th:'มังกรกระดูก', zh:'骨龙', type:'beast', tier:4, role:'power' },
  { id:'skyeagle', th:'เทพอินทรีสงครามเวหา', zh:'摩天战鹰', type:'beast', tier:4, role:'agile' },
  { id:'healangel', th:'ทูตสวรรค์แห่งการรักษา', zh:'治愈天使', type:'beast', tier:4, role:'heal' },
  { id:'icesnowmaiden', th:'ธิดาหิมะน้ำแข็ง', zh:'冰天雪女', type:'beast', tier:4, role:'control' },
  { id:'ninephoenixflute', th:'ขลุ่ยเก้าหงส์สถิต', zh:'九凤来仪箫', type:'tool', tier:4, role:'support' },
  { id:'spiriteye', th:'เนตรวิญญาณ', zh:'灵眸', type:'body', tier:4, role:'support' },
  { id:'lightphoenix', th:'ฟีนิกซ์แสง', zh:'光明凤凰', type:'beast', tier:4, role:'heal' },
  { id:'luosanpao', th:'หลัวซานเพ้า (กลายพันธุ์)', zh:'罗三炮', type:'beast', tier:2, role:'support' },
  // tier 5
  { id:'haotian', th:'ค้อนเฮ่าเทียน', zh:'昊天锤', type:'tool', tier:5, role:'power' },
  { id:'lanba', th:'มังกรทรราชสายฟ้าคราม', zh:'蓝电霸王龙', type:'beast', tier:5, role:'power' },
  { id:'holyangel', th:'ทูตสวรรค์ศักดิ์สิทธิ์หกปีก', zh:'六翼天使', type:'beast', tier:5, role:'power' },
  { id:'bluesilverking', th:'จักรพรรดิเงินคราม', zh:'蓝银皇', type:'plant', tier:5, role:'control' },
  { id:'lightdragon', th:'มังกรแสงศักดิ์สิทธิ์', zh:'光明圣龙', type:'beast', tier:5, role:'power' },
  { id:'icescorpion', th:'จักรพรรดิแมงป่องน้ำแข็งมรกต', zh:'冰碧帝皇蝎', type:'beast', tier:5, role:'control' },
  { id:'deathspider', th:'จักรพรรดิแมงมุมแห่งความตาย', zh:'死亡蛛皇', type:'beast', tier:5, role:'control' },
  { id:'purpledragon', th:'มังกรสวรรค์รัศมีม่วงทำลายล้าง', zh:'紫煌灭天龙', type:'beast', tier:5, role:'power' },
  { id:'dragonbutterfly', th:'ผีเสื้อมังกรแห่งแสง', zh:'光明龙神蝶', type:'beast', tier:5, role:'support' },
  { id:'qilin', th:'กิเลนเบญจธาตุ', zh:'五行麒麟', type:'beast', tier:5, role:'power' },
  { id:'goldcrow', th:'อีกาทองคำเพลิงแท้', zh:'金乌真火', type:'beast', tier:5, role:'power' },
  { id:'jiubao', th:'หอแก้วเก้าสมบัติ', zh:'九宝琉璃塔', type:'tool', tier:5, role:'support' },
];
const SOUL_BASE = Object.fromEntries(SOULS.map(s => [s.id, s]));
// วิญญาณยุทธ์กลายพันธุ์ (รหัสขึ้นต้น m:) ถูกสร้างตอนเรียกใช้ครั้งแรก — ดู mutate.js
const SOUL_BY_ID = new Proxy(SOUL_BASE, { get(t, k) { if (typeof k !== 'string' || k in t || !k.startsWith('m:')) return t[k]; const m = buildMutant(k); if (m) t[k] = m; return m; } });

const TIER_INFO = {
  1: { th:'ด้อย', cls:'t1', mult:0.6 },
  2: { th:'ธรรมดา', cls:'t2', mult:0.85 },
  3: { th:'ดี', cls:'t3', mult:1.0 },
  4: { th:'ยอดเยี่ยม', cls:'t4', mult:1.18 },
  5: { th:'ระดับตำนาน', cls:'t5', mult:1.35 },
};
const TYPE_TH = { beast:'สัตว์', tool:'อุปกรณ์', plant:'พืช', body:'ร่างกาย', food:'อาหาร' };
const ROLE_TH = {
  power:'โจมตีพลัง', agile:'โจมตีว่องไว', control:'ควบคุม', defense:'ป้องกัน',
  support:'สนับสนุน', heal:'รักษา', food:'อาหาร(สนับสนุน)', none:'ไม่มีพลังต่อสู้',
};

// ---------- ระดับพลัง ----------
const RANKS = [
  { min:0,  th:'คนธรรมดา', zh:'凡人' },
  { min:1,  th:'วิญญาณยุทธ์ฝึกหัด', zh:'魂士' },
  { min:11, th:'ปรมาจารย์วิญญาณ', zh:'魂师' },
  { min:21, th:'มหาปรมาจารย์วิญญาณ', zh:'大魂师' },
  { min:31, th:'ผู้อาวุโสวิญญาณ', zh:'魂尊' },
  { min:41, th:'บรรพชนวิญญาณ', zh:'魂宗' },
  { min:51, th:'ราชันวิญญาณ', zh:'魂王' },
  { min:61, th:'จักรพรรดิวิญญาณ', zh:'魂帝' },
  { min:71, th:'ปราชญ์วิญญาณ', zh:'魂圣' },
  { min:81, th:'พรหมยุทธ์', zh:'魂斗罗' },
  { min:91, th:'พรหมยุทธ์มีฉายา', zh:'封号斗罗' },
  { min:99, th:'พรหมยุทธ์สุดขีด', zh:'极限斗罗' },
];

// ---------- วงแหวนวิญญาณ ----------
const RING_TIERS = [
  { id:'white',  th:'ขาว',  label:'10 ปี+',      min:10,     max:99,     color:'#f3f3f3', base:'10' },
  { id:'yellow', th:'เหลือง', label:'100 ปี+',    min:100,    max:999,    color:'#f5c518', base:'100' },
  { id:'purple', th:'ม่วง', label:'1,000 ปี+',    min:1000,   max:9999,   color:'#9b4dff', base:'1,000' },
  { id:'black',  th:'ดำ',   label:'10,000 ปี+',   min:10000,  max:99999,  color:'#1b1b1b', base:'10,000' },
  { id:'red',    th:'แดง',  label:'100,000 ปี+',  min:100000, max:180000, color:'#e0242c', base:'100,000' },
];
// ขีดจำกัดอายุวงแหวนที่ร่างกายรับได้ (โดยประมาณตามนิยาย) สำหรับวงที่ 1..9
const RING_LIMITS = [423, 760, 1760, 5000, 12000, 22000, 40000, 70000, 100000];

const SKILL_NAMES = {
  power:   ['ฟาดกระแทก','พลังทวีคูณ','ทุบทลายภูผา','คลื่นพลังคลั่ง','กระแทกสะเทือนพสุธา','ร่างอสูรครองศึก','ร่างแท้วิญญาณยุทธ์','พิฆาตฟ้าดิน','ทำลายล้างสรรพสิ่ง'],
  agile:   ['เงาเคลื่อนพริบตา','กรงเล็บฉีกลม','ร้อยเงาสังหาร','สายฟ้าแลบไร้รอย','กระบวนท่าพายุคลั่ง','เงาแยกร่าง','ร่างแท้วิญญาณยุทธ์','พันกระบวนท่าสังหาร','เงามัจจุราช'],
  control: ['พันธนาการ','ตาข่ายกักขัง','กรงพิษ','สยบพสุธา','กรงขังสวรรค์','อาณาเขตครอบงำ','ร่างแท้วิญญาณยุทธ์','ผนึกฟ้าดิน','อาณาจักรเทพ'],
  defense: ['เกราะวิญญาณ','กำแพงเหล็ก','สะท้อนพลัง','ป้อมปราการ','โล่พิทักษ์ร้อยลี้','ร่างไร้เทียมทาน','ร่างแท้วิญญาณยุทธ์','เกราะเทพอมตะ','พิทักษ์นิรันดร์'],
  support: ['เพิ่มพลัง','เพิ่มความเร็ว','เพิ่มพลังวิญญาณ','ตรวจจับวิญญาณ','เพิ่มพลังเท่าตัว','แบ่งปันพลังจิต','ร่างแท้วิญญาณยุทธ์','อวยพรศักดิ์สิทธิ์','ฟื้นคืนชีพ'],
  heal:    ['รักษาบาดแผล','ฟื้นฟูพลังวิญญาณ','ล้างพิษ','รักษาหมู่','เกราะชีวิต','ฟื้นฟูเต็มขั้น','ร่างแท้วิญญาณยุทธ์','ชุบชีวิตกึ่งตาย','ชีวิตนิรันดร์'],
  food:    ['ฟื้นฟูกำลัง','เพิ่มพละกำลัง','เพิ่มความว่องไว','ฟื้นพลังวิญญาณ','เพิ่มพลังจิต','งานเลี้ยงเทพ','ร่างแท้วิญญาณยุทธ์','อาหารอมตะ','งานเลี้ยงสวรรค์'],
  none:    ['ขุดดิน','ไถพรวน','เก็บเกี่ยว','หว่านเมล็ด','ฟาดหนัก','เกราะดิน','ร่างแท้วิญญาณยุทธ์','พืชพันธุ์ฟ้า','เก็บเกี่ยวชีวิต'],
};

const BONE_PARTS = [
  { id:'head', th:'กระดูกวิญญาณศีรษะ', stat:'spi' },
  { id:'torso', th:'กระดูกวิญญาณลำตัว', stat:'hp' },
  { id:'larm', th:'กระดูกวิญญาณแขนซ้าย', stat:'str' },
  { id:'rarm', th:'กระดูกวิญญาณแขนขวา', stat:'str' },
  { id:'lleg', th:'กระดูกวิญญาณขาซ้าย', stat:'agi' },
  { id:'rleg', th:'กระดูกวิญญาณขาขวา', stat:'agi' },
  { id:'ext', th:'กระดูกวิญญาณภายนอก (外附魂骨)', stat:'str' },
];

// ---------- ความพิการ / บาดเจ็บถาวร ----------
const DISABILITIES = {
  lost_arm:   { th:'แขนขาด', desc:'พละกำลังและการโจมตีลดลงมาก', str:-0.35, combat:-0.2 },
  lame_leg:   { th:'ขาพิการ', desc:'ความว่องไวลดลงอย่างหนัก', agi:-0.45, combat:-0.15 },
  blind_eye:  { th:'ตาบอดข้างหนึ่ง', desc:'ระยะการมองเห็นแคบลง', combat:-0.1, spi:-0.1 },
  meridian:   { th:'เส้นลมปราณเสียหาย', desc:'การบำเพ็ญพลังวิญญาณช้าลงครึ่งหนึ่ง', cult:-0.5 },
  soul_crack: { th:'วิญญาณยุทธ์ร้าว', desc:'พลังวิญญาณยุทธ์ลดลง', combat:-0.25, cult:-0.2 },
  chronic:    { th:'โรคเรื้อรัง', desc:'สุขภาพสูงสุดลดลง ป่วยง่าย', maxhp:-30 },
  scar_face:  { th:'ใบหน้าเสียโฉม', desc:'เสน่ห์ลดลง ชื่อเสียงเติบโตช้า', fame:-0.3 },
};

// ---------- เส้นทางชีวิต ----------
// cult = ตัวคูณการบำเพ็ญ, ค่าอื่นคือการเติบโตต่อปี, inc = รายได้/ปี (ตัวเลข หรือ 'lvlX' = 5 + ระดับ×X)
// group: kid=วัยเด็ก, school=เรียนขั้นต้น, academy=เรียนขั้นสูง/ศิษย์สำนัก, work=วิญญาจารย์ทำงาน, common=คนธรรมดา
const PATHS = {
  child:    { th:'วัยเด็ก', group:'kid', cult:0, wis:0.6 },
  home:     { th:'ช่วยงานครอบครัว', group:'school', cult:0.8, wis:0.3, str:0.6, inc:2 },
  elem:     { th:'นักเรียนสถาบันวิญญาจารย์ขั้นต้น', group:'school', cult:1.1, wis:2.5, inc:-1 },
  work:     { th:'นักเรียนทำงาน (工读生)', group:'school', cult:1.0, wis:2, str:0.7, inc:1 },
  clan:     { th:'ศิษย์สายตรงของตระกูล', group:'school', cult:1.3, wis:2, spi:0.5 },
  shrek:    { th:'ศิษย์สถาบันเชร็ค', group:'academy', cult:1.4, wis:3, str:0.8, agi:0.8 },
  royal:    { th:'นักเรียนสถาบันหลวงเทียนโต่ว', group:'academy', cult:1.2, wis:3, fame:0.5 },
  wuhunac:  { th:'นักเรียนสถาบันตำหนักวิญญาณยุทธ์', group:'academy', cult:1.25, wis:2.5, spi:0.5 },
  mid:      { th:'นักเรียนสถาบันวิญญาจารย์ขั้นกลาง', group:'academy', cult:1.12, wis:2.5, inc:-1 },
  sect:     { th:'ศิษย์สำนักวิญญาจารย์', group:'academy', cult:1.3, wis:1.5, spi:0.6 },
  wander:   { th:'วิญญาจารย์พเนจร', group:'work', cult:1.0, luck:0.4, agi:0.6, inc:3 },
  merc:     { th:'นักล่าวิญญาณรับจ้าง', group:'work', cult:1.05, str:0.6, inc:'lvl1.5' },
  wuhun:    { th:'ผู้ดูแลตำหนักวิญญาณยุทธ์', group:'work', cult:1.15, spi:0.4, inc:'lvl2' },
  army:     { th:'นายทหารจักรวรรดิ', group:'work', cult:1.0, str:0.6, inc:'lvl1.6' },
  guard:    { th:'องครักษ์ราชวงศ์', group:'work', cult:1.05, fame:0.4, inc:'lvl2' },
  teacher:  { th:'อาจารย์สถาบันวิญญาจารย์', group:'work', cult:0.95, wis:1.5, inc:'lvl1.2' },
  elder:    { th:'ผู้อาวุโสสำนัก', group:'work', cult:1.15, fame:0.5, inc:'lvl1.8' },
  merchant: { th:'พ่อค้าวิญญาจารย์', group:'work', cult:0.6, wis:0.5, inc:'lvl3' },
  hermit:   { th:'ผู้บำเพ็ญสันโดษ', group:'work', cult:1.35, spi:0.6, mood:-1 },
  evil:     { th:'วิญญาจารย์ชั่วร้าย (邪魂师)', group:'work', cult:1.45, fame:-0.5, inc:'lvl1' },
  farmer:   { th:'ชาวนา', group:'common', cult:0, str:0.5, inc:4 },
  smith:    { th:'ช่างตีเหล็ก', group:'common', cult:0, str:0.8, inc:6 },
  trader:   { th:'พ่อค้า', group:'common', cult:0, wis:0.6, inc:12 },
  scholar:  { th:'บัณฑิตรับราชการ', group:'common', cult:0, wis:1.5, inc:8 },
  soldier:  { th:'ทหารราบ', group:'common', cult:0, str:0.6, inc:5 },
  retired:  { th:'วางมือจากยุทธภพ', group:'old', cult:0.5, mood:1, wis:0.5 },
};

// ---------- สำนักที่รับศิษย์ ----------
const SECTS = [
  { id:'leiting', th:'สำนักอัสนีพิโรธ', zh:'雷霆门', need:15 },
  { id:'canglang', th:'สำนักหมาป่าคราม', zh:'苍狼宗', need:12 },
  { id:'jingang', th:'สำนักวัชระ', zh:'金刚门', need:15 },
  { id:'yuling', th:'สำนักวิญญาณหยก', zh:'玉灵宗', need:18 },
  { id:'yufeng', th:'ตระกูลบังคับลม', zh:'御风家族', need:16 },
  { id:'pojian', th:'สำนักกระบี่ทลาย', zh:'破剑门', need:20 },
];

// ---------- สัตว์วิญญาณสำหรับล่าวงแหวน ----------
// aff = สายวิญญาณยุทธ์ที่เข้ากัน · big = ต้องรู้แหล่ง (สัตว์หมื่นปี/แสนปี)
const BEASTS = [
  { th:'กระต่ายป่าหูยาว', zh:'长耳兔', aff:'agile', min:10, max:150 },
  { th:'หนูดินฟันเหล็ก', zh:'铁齿地鼠', aff:'power', min:10, max:200 },
  { th:'เห็ดวิญญาณพิษ', zh:'毒灵菇', aff:'control', min:20, max:300 },
  { th:'หญ้าหยกรักษา', zh:'玉疗草', aff:'heal', min:20, max:600 },
  { th:'หมาป่าลมกรด', zh:'疾风狼', aff:'agile', min:60, max:500 },
  { th:'งูมัณฑะละ', zh:'曼陀罗蛇', aff:'control', min:200, max:900 },
  { th:'หมูป่าเขี้ยวเหล็ก', zh:'铁牙野猪', aff:'power', min:100, max:700 },
  { th:'เต่าผาหิน', zh:'岩龟', aff:'defense', min:100, max:900 },
  { th:'นกกระดิ่งลม', zh:'风铃鸟', aff:'support', min:100, max:800 },
  { th:'เถาวัลย์ผี', zh:'鬼藤', aff:'control', min:500, max:1800 },
  { th:'พยัคฆ์ผี', zh:'鬼虎', aff:'power', min:700, max:2800 },
  { th:'หมาป่าวายุปีศาจ', zh:'疾风魔狼', aff:'agile', min:600, max:2500 },
  { th:'แรดเกราะเหล็ก', zh:'铁甲犀', aff:'defense', min:800, max:3500 },
  { th:'ผีเสื้อมายา', zh:'幻蝶', aff:'support', min:800, max:3500 },
  { th:'บัวหิมะพันปี', zh:'千年雪莲', aff:'heal', min:1000, max:4000 },
  { th:'งูหงอนไก่หางหงส์', zh:'凤尾鸡冠蛇', aff:'power', min:1500, max:6000 },
  { th:'แมงป่องพิษเงา', zh:'影毒蝎', aff:'agile', min:2000, max:8000 },
  { th:'หงส์น้ำแข็ง', zh:'冰凤', aff:'support', min:3000, max:12000 },
  { th:'เต่าดำเกราะพิภพ', zh:'玄武龟', aff:'defense', min:4000, max:50000, big:true },
  { th:'แมงมุมปีศาจหน้าคน', zh:'人面魔蛛', aff:'control', min:5000, max:16000, big:true },
  { th:'อินทรีเพลิงนรก', zh:'地狱火鹰', aff:'agile', min:8000, max:30000, big:true },
  { th:'หมีกรงเล็บคลั่งทองหม่น', zh:'暗金恐爪熊', aff:'power', min:10000, max:45000, big:true },
  { th:'จิ้งจอกเก้าหางมายา', zh:'九尾灵狐', aff:'control', min:15000, max:60000, big:true },
  { th:'ต้นไม้ชีวิตหมื่นปี', zh:'万年生命树', aff:'heal', min:12000, max:50000, big:true },
  { th:'หงส์ทองหมื่นปี', zh:'万年金凤', aff:'support', min:12000, max:50000, big:true },
  { th:'วานรยักษ์ไททัน', zh:'泰坦巨猿', aff:'power', min:100000, max:150000, big:true },
  { th:'งูเหลือมวัวฟ้าคราม', zh:'天青牛蟒', aff:'defense', min:100000, max:150000, big:true },
  { th:'กระต่ายกระดูกอ่อนแสนปี', zh:'柔骨兔', aff:'agile', min:100000, max:120000, big:true },
  { th:'จักรพรรดินีหิมะ', zh:'雪帝', aff:'control', min:100000, max:200000, big:true },
];
const AFF_MATCH = { power:['power'], agile:['agile'], control:['control'], defense:['defense'], support:['support', 'heal'], heal:['heal', 'support'], food:['support', 'heal'], none:['power', 'defense'] };

// ---------- เทพที่สืบทอดได้ ----------
// ตามนิยาย: เทพสมุทร เทพอสูร (ถังซาน) · เทพทูตสวรรค์ (เชียนเริ่นเสวี่ย) · เทพรากษส (ปี่ปี่ตง) · เทพสังหาร (เจ้าแห่งเมืองสังหาร)
// และตำแหน่งเทพในจักรวาลโต้วหลัวที่ผูกกับสายวิญญาณยุทธ์ (เทพมังกร เทพแห่งชีวิต เทพแห่งการทำลาย ฯลฯ)
// souls = วิญญาณยุทธ์ที่เข้ากันโดยตรง · roles/types = สายที่เข้ากันบางส่วน · flags = ประสบการณ์ที่เทพมองหา · stat = พรสวรรค์หลัก
const GODS = [
  { id:'seagod', th:'เทพสมุทร', zh:'海神', canon:true, stat:'spi', place:'เกาะเทพสมุทร', scene:'sea', minLvl:70,
    call:'ท้องทะเลเลือกเจ้าแล้ว จงมาแบกรับตรีศูลแห่งสมุทร',
    souls:['water', 'seahorse', 'starfish', 'bluesilverking', 'haotian'], roles:['control'], flags:['seaIsle'],
    trials:['เผชิญคลื่นยักษ์สูงร้อยจั้งกลางทะเลคลั่ง', 'ปราบราชาปลาวาฬปีศาจแห่งทะเลลึก', 'ยืนหยัดบนเสาเทพสมุทรเจ็ดวันเจ็ดคืน', 'ข้ามทะเลเพลิงใต้มหาสมุทร', 'ต้านเสียงร้องของนางเงือกที่กลืนกินจิตวิญญาณ', 'ปราบเจ้าแห่งปีศาจสมุทรทั้งเจ็ด', 'ดูดซับวงแหวนสมุทรสีทอง', 'ทดสอบใจด้วยภาพลวงของคนที่รักที่สุด', 'รับการชำระล้างด้วยสายฟ้าแห่งเทพสมุทร'] },
  { id:'asura', th:'เทพอสูร', zh:'修罗神', canon:true, stat:'str', place:'เมืองสังหาร', scene:'killing', minLvl:70,
    call:'ผู้ที่ย่ำผ่านทะเลโลหิตโดยไม่หลงทาง จงมาตัดสินความดีชั่วแทนข้า',
    souls:['haotian', 'sevenkill', 'deathscythe'], roles:['power', 'agile'], flags:['killing'],
    trials:['สังหารราชันสังหารร้อยคนในสังเวียนนรก', 'ข้ามทะเลโลหิตโดยไม่หยุดพัก', 'ต้านกลิ่นอายสังหารที่กลืนกินสติ', 'ประลองกับเงาของตนเองที่ชั่วร้ายกว่า', 'แบกดาบอสูรหนักหมื่นชั่งขึ้นยอดเขา', 'ตัดสินชะตาผู้บริสุทธิ์และผู้ทำผิด', 'รับกระบี่อสูรเข้าสู่ร่าง'] },
  { id:'angel', th:'เทพทูตสวรรค์', zh:'天使神', canon:true, stat:'wis', place:'นครวิญญาณยุทธ์', scene:'temple', minLvl:70,
    call:'แสงสว่างไม่เคยลืมผู้ที่ศรัทธา จงกางปีกทั้งหกของเจ้า',
    souls:['holyangel', 'healangel', 'lightphoenix', 'lightdragon', 'dragonbutterfly'], roles:['heal'], flags:['wuhunTie', 'renxueFavor'],
    trials:['ตอบคำถามแห่งแสงสว่างเก้าข้อ', 'ชำระใจในเปลวเพลิงศักดิ์สิทธิ์', 'ปกป้องผู้ศรัทธาหนึ่งพันคนจากกองทัพมาร', 'ไขปริศนาตำราทูตสวรรค์โบราณ', 'ยืนหยัดในแสงที่แผดเผาร่าง', 'รับปีกทั้งหกของทูตสวรรค์', 'สละความปรารถนาทางโลก'] },
  { id:'rakshasa', th:'เทพรากษส', zh:'罗刹神', canon:true, stat:'agi', place:'หุบเขามรณะ', scene:'night', minLvl:70,
    call:'ความมืดในใจเจ้าหอมหวานนัก จงมากลืนกินความชั่วร้ายทั้งปวง',
    souls:['deathspider', 'nethercat', 'ghostleopard', 'demonfox', 'skeletonking'], types:[], flags:['darkSeed', 'hunted', 'popeFavor'],
    trials:['ไล่ล่าเงาปีศาจในความมืดนิรันดร์', 'หลบดาบมรณะหนึ่งหมื่นเล่ม', 'ข้ามสะพานด้ายเหนือเหวไร้ก้น', 'ลอบสังหารปีศาจโดยไม่ให้มันรู้ตัว', 'ต้านคำสาปแห่งรากษส', 'กลืนกินความมืดเข้าสู่ร่าง', 'รับเคียวรากษสจากมือเทพ'] },
  { id:'killing', th:'เทพสังหาร', zh:'杀神', canon:true, stat:'str', place:'เมืองสังหาร', scene:'killing', minLvl:60,
    call:'สังเวียนโลหิตจดจำชื่อเจ้า จงมาเป็นเจ้าแห่งการสังหาร',
    souls:['purgatoryhalberd', 'soulspear'], roles:['power'], flags:['killing'], need: s => (s.deathWins || 0) >= 2 || s.flags.killing,
    trials:['ชนะสังเวียนนรกร้อยครั้งติดต่อกัน', 'เดินผ่านถนนแห่งความตายโดยไม่หันหลัง', 'สังหารเงาของศัตรูทุกคนที่เคยพ่ายให้', 'ต้านอาณาเขตสังหารของเจ้าเมืองคนก่อน', 'จารึกชื่อบนศิลาโลหิต'] },
  { id:'destruction', th:'เทพแห่งการทำลาย', zh:'毁灭之神', stat:'str', place:'ภูเขาไฟนิรันดร์', scene:'raid', minLvl:75,
    call:'ทุกสิ่งที่เกิดย่อมดับ จงมาเป็นผู้นำพาการสิ้นสุด',
    souls:['haotian', 'purpledragon', 'skyaxe', 'deathscythe', 'lanba', 'titanape'], roles:['power'], flags:['hunted'],
    trials:['ทุบภูเขาให้แตกด้วยหมัดเดียว', 'ยืนอยู่กลางลาวาเจ็ดวัน', 'ทำลายพันธนาการที่มัดวิญญาณไว้', 'ต้านคลื่นพลังทำลายล้างของเทพองค์ก่อน', 'เลือกว่าจะทำลายสิ่งใด และรักษาสิ่งใดไว้'] },
  { id:'life', th:'เทพแห่งชีวิต', zh:'生命之神', stat:'spi', place:'ป่าศักดิ์สิทธิ์ใจกลางทวีป', scene:'garden', minLvl:70,
    call:'ทุกต้นหญ้าที่เจ้าช่วยไว้กระซิบถึงข้า จงมาดูแลสรรพชีวิต',
    souls:['bluesilver', 'bluesilverking', 'begonia', 'snowlotus', 'lotus', 'willow', 'sunflower', 'purplebamboo', 'healangel'], roles:['heal'], types:['plant'], flags:['beastFriend', 'blessed'],
    trials:['ทำให้ป่าที่ตายแล้วกลับมาผลิบาน', 'ช่วยชีวิตศัตรูที่ใกล้ตาย', 'ฟังเสียงสรรพสัตว์ทั้งพันชนิด', 'แบ่งพลังชีวิตครึ่งหนึ่งให้แผ่นดิน', 'หยั่งรากวิญญาณลงสู่ใจกลางพิภพ'] },
  { id:'dragon', th:'เทพมังกร', zh:'龙神', stat:'str', place:'หุบเขามังกรโบราณ', scene:'hunt', minLvl:72,
    call:'สายเลือดมังกรในตัวเจ้าตื่นแล้ว จงมาครองบัลลังก์แห่งมังกรทั้งปวง',
    souls:['lanba', 'lightdragon', 'firedragon', 'bonedragon', 'purpledragon', 'qilin'], flags:['redBeast'],
    trials:['สยบมังกรอสูรหมื่นปีด้วยแรงกาย', 'ดื่มโลหิตมังกรโบราณ', 'บินฝ่าพายุอัสนีเก้าชั้นฟ้า', 'เรียกมังกรทั้งทวีปให้ก้มหัว', 'หลอมกระดูกมังกรเข้ากับร่าง'] },
  { id:'food', th:'เทพอาหาร', zh:'食神', stat:'wis', place:'ครัวสวรรค์', scene:'city', minLvl:60,
    call:'อาหารของเจ้าเคยฉุดชีวิตผู้คนจากความตาย จงมาเลี้ยงดูสวรรค์และโลก',
    souls:['sausage', 'mantou', 'candy', 'orange', 'carrot', 'chicken'], types:['food'], flags:['oscar'],
    trials:['ปรุงอาหารเลี้ยงกองทัพหมื่นคนในคืนเดียว', 'ฟื้นชีพวิญญาจารย์ที่ใกล้ตายด้วยอาหาร', 'หาวัตถุดิบจากป่าดาวซิงโต่วใจกลาง', 'ทำอาหารที่ทำให้เทพหลั่งน้ำตา', 'หลอมพลังวิญญาณลงในทุกคำ'] },
  { id:'ninecolor', th:'เทพธิดาเก้าสี', zh:'九彩神女', stat:'spi', place:'หอแก้วเก้าชั้นฟ้า', scene:'temple', minLvl:68,
    call:'แสงเก้าสีของเจ้าเสริมพลังผู้อื่นมาทั้งชีวิต ถึงคราวที่เจ้าจะเปล่งแสงเอง',
    souls:['qibao', 'jiubao', 'starcrown', 'jadephoenixqin', 'ninephoenixflute'], roles:['support'], flags:['ningBuff', 'team'],
    trials:['เสริมพลังสหายทั้งเจ็ดพร้อมกันเจ็ดวัน', 'หลอมแสงเจ็ดสีเป็นเก้าสี', 'ปกป้องสำนักจากการล่มสลาย', 'สละพลังตนเพื่อชีวิตผู้อื่น', 'ขึ้นยอดหอแก้วเก้าชั้น'] },
  { id:'phoenix', th:'เทพฟีนิกซ์', zh:'凤凰神', stat:'spi', place:'ภูเขาเพลิงหงส์', scene:'raid', minLvl:70,
    call:'เพลิงในวิญญาณเจ้าไม่เคยมอดดับ จงมาเกิดใหม่จากเถ้าถ่าน',
    souls:['firephoenix', 'icephoenix', 'lightphoenix', 'firebird', 'goldcrow', 'fire', 'spark'], flags:['iceFire'],
    trials:['เผาร่างตนเองในเพลิงศักดิ์สิทธิ์', 'เกิดใหม่จากเถ้าถ่าน', 'ควบคุมเพลิงทั้งเก้าชนิด', 'ดับไฟป่าที่กำลังกลืนกินหมื่นหมู่บ้าน', 'บินผ่านดวงตะวัน'] },
  { id:'tiger', th:'เทพพยัคฆ์ขาว', zh:'白虎神', stat:'str', place:'ยอดเขาพยัคฆ์ซิงหลัว', scene:'hunt', minLvl:70,
    call:'เสียงคำรามของเจ้าเขย่าป่าทั้งผืน จงมาเป็นเจ้าแห่งสัตว์ร้าย',
    souls:['whitetiger', 'blacktiger', 'nethercat', 'goldlion', 'snowleopard', 'flashleopard'], roles:['power'], flags:['team'],
    trials:['สยบพยัคฆ์ขาวหมื่นปีด้วยมือเปล่า', 'คำรามให้สัตว์ทั้งป่าหมอบลง', 'ล่าเหยื่อในความมืดสามวัน', 'ปกป้องฝูงจากหายนะ', 'หลอมเขี้ยวพยัคฆ์เทพเข้ากับวิญญาณ'] },
  { id:'thunder', th:'เทพอัสนี', zh:'雷神', stat:'agi', place:'ยอดเขาอัสนีเก้าชั้น', scene:'night', minLvl:70,
    call:'สายฟ้ายอมก้มหัวให้ความเร็วของเจ้า จงมาครองฟ้าคำราม',
    souls:['lightning', 'thunderball', 'thunderwolf', 'flashleopard', 'marten', 'falcon', 'thunderumbrella', 'lanba'], roles:['agile'],
    trials:['ยืนรับสายฟ้าเก้าสิบเก้าสาย', 'วิ่งแข่งกับสายฟ้า', 'ควบคุมพายุอัสนีทั้งผืนฟ้า', 'หลอมสายฟ้าเป็นอาวุธ', 'ทะลวงเมฆอัสนีชั้นที่เก้า'] },
  { id:'ice', th:'เทพธิดาน้ำแข็ง', zh:'冰神', stat:'spi', place:'ดินแดนเหนือสุด', scene:'night', minLvl:70,
    call:'ความหนาวเหน็บไม่อาจกัดกินใจที่มั่นคงของเจ้า จงมาครองดินแดนน้ำแข็งนิรันดร์',
    souls:['ice', 'icestaff', 'icephoenix', 'icescorpion', 'icesnowmaiden', 'snowleopard', 'snowlotus'], flags:['iceFire'], need: s => s.place === 'north' || s.souls.some(id => ['ice', 'icestaff', 'icephoenix', 'icescorpion', 'icesnowmaiden'].includes(id)),
    trials:['นั่งสมาธิกลางพายุหิมะร้อยวัน', 'แช่แข็งทะเลทั้งผืน', 'ต้านความหนาวสัมบูรณ์', 'ปลุกจักรพรรดินีหิมะให้ยอมรับ', 'หลอมหัวใจเป็นผลึกน้ำแข็ง'] },
  { id:'wisdom', th:'เทพแห่งปัญญา', zh:'智慧之神', stat:'wis', place:'หอคัมภีร์ไร้สิ้นสุด', scene:'academy', minLvl:65,
    call:'ทฤษฎีของเจ้าเปลี่ยนวิญญาจารย์ทั้งรุ่น จงมาเป็นผู้รู้แห่งสวรรค์',
    souls:['book', 'brain', 'eyes', 'spiriteye', 'crystalball', 'mirror'], roles:['support'], flags:['ancientLore', 'secretManual'], need: s => s.wis >= 80,
    trials:['ไขปริศนาที่เทพทั้งหลายยังไม่อาจไข', 'เขียนทฤษฎีวิญญาณยุทธ์ฉบับใหม่', 'สอนศิษย์ไร้พรสวรรค์ให้เป็นพรหมยุทธ์', 'ต้านความลวงทั้งพันชั้น', 'เข้าใจความจริงของฟ้าดิน'] },
  { id:'beast', th:'เทพราชันสัตว์ร้าย', zh:'兽神', stat:'agi', place:'ใจกลางป่าดาวซิงโต่ว', scene:'hunt', minLvl:72,
    call:'สัตว์วิญญาณทั้งป่ายอมรับเจ้าเป็นพวกเดียวกัน จงมาเป็นผู้คุ้มครองเผ่าพันธุ์สัตว์',
    souls:['softbunny', 'titanape', 'divineape', 'kingkongbear', 'darkgoldbear', 'ninefox', 'icescorpion'], types:['beast'], flags:['beastFriend', 'redBeast'],
    trials:['ได้รับการยอมรับจากเอ้อร์หมิงและต้าหมิง', 'หยุดสงครามระหว่างมนุษย์กับสัตว์วิญญาณ', 'วิ่งข้ามป่าดาวซิงโต่วในคืนเดียว', 'ปกป้องสัตว์แสนปีจากนักล่า', 'ฟังเสียงของป่าทั้งผืน'] },
];
