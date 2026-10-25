// ============================================================
// ไอคอนพิกเซล (แทนอีโมจิทั้งหมดบนหน้าเว็บ)
// สไปรต์วาดมือขนาด 8×8 จุด · อีโมจิทุกตัวถูกจับคู่กับสไปรต์ที่ความหมายใกล้ที่สุด (สลับสีได้)
// อีโมจิที่ไม่มีในตาราง → แสดงเป็นอัญมณีพิกเซล จึงไม่มีอีโมจิแบบปกติหลุดมาให้เห็น
// โหมด: 8-BIT (สไปรต์ล้วน) · 16-BIT (+ขอบดำ) · 32-BIT (+ขอบดำ +แสงเงา)
// ============================================================
const PIXMOJI = (() => {
  // ---------- จานสี ----------
  const PAL = {
    k: '#1a1410', e: '#3a3630', S: '#6e6a64', s: '#c8c0b0', w: '#ffffff',
    y: '#ffe08a', g: '#f2c14e', G: '#a8781e', o: '#f08a4b', r: '#e2574c', R: '#8e2a22',
    m: '#f2c4a0', t: '#c79a6a', T: '#7a5230', n: '#6fd08c', N: '#2f7a44',
    c: '#8fe3ff', b: '#5f9cf0', B: '#2f4f9e', p: '#b48cff', P: '#6a3fb0', i: '#ff8fc4',
  };
  // ---------- สไปรต์ 8×8 ('.' = โปร่งใส) ----------
  const SP = {
    heart: ['.RR..RR.', 'RrrRRrrR', 'RwrrrrrR', 'RrrrrrrR', '.RrrrrR.', '..RrrR..', '...RR...', '........'],
    star: ['...yy...', '...yy...', 'yyyggyyy', '.yggggy.', '..gggg..', '.gg..gg.', '.g....g.', '........'],
    sparkle: ['...y....', '...y..w.', '.yyyyy..', '...y....', '...y.y..', '.w..yyy.', '.....y..', '........'],
    sword: ['......ss', '.....sws', '....sws.', '...sws..', 'T.sws...', '.TTs....', '.TT.....', 'T..T....'],
    swords: ['s......s', 'ws....sw', '.ws..sw.', '..wssw..', '..tsst..', '.tT..Tt.', 'tT....Tt', 'T......T'],
    bow: ['..tT....', '.t..s...', 't...s...', 't.wwsww>', 't...s...', '.t..s...', '..tT....', '........'],
    dagger: ['.......s', '......ws', '.....ws.', '....ws..', '..Tws...', '..TT....', '.T......', 'T.......'],
    shield: ['.bbbbbb.', 'bBBwBBBb', 'bBwgwBBb', 'bBBwBBBb', 'bBBBBBBb', '.bBBBBb.', '..bBBb..', '...bb...'],
    hammer: ['.ssssss.', '.sSSSSs.', '.ssssss.', '...tT...', '...tT...', '...tT...', '...tT...', '...TT...'],
    pick: ['.ssss...', 's....s..', '...tT.s.', '..tT....', '.tT.....', 'tT......', 'T.......', '........'],
    scroll: ['.tttttt.', 'tyyyyyyt', '.yeeeey.', '.yyyyyy.', '.yeeeey.', '.yyyyyy.', 'tyyyyyyt', '.tttttt.'],
    book: ['.RRRRRR.', 'RrrrrrrR', 'RrgyyrrR', 'RrrrrrrR', 'RrrrrrrR', 'RrrrrrrR', 'RRRRRRRw', '.wwwwwww'],
    books: ['bB.rR.nN', 'bB.rR.nN', 'bB.rR.nN', 'bB.rR.nN', 'bB.rR.nN', 'bB.rR.nN', 'bB.rR.nN', 'TTTTTTTT'],
    crown: ['........', 'y..y..y.', 'gg.gg.gg', 'gggggggg', 'grgbgrgg', 'gggggggg', 'GGGGGGGG', '........'],
    trophy: ['gggggggg', 'gyggggGg', '.gyggGg.', '..gggg..', '...gG...', '...gG...', '..gggg..', '.GGGGGG.'],
    medal: ['.r....b.', '..r..b..', '...rb...', '..gggg..', '.gyggGg.', '.ggggGg.', '..gGGg..', '........'],
    coin: ['..T..T..', '...TT...', '..gggg..', '.gyggGg.', 'ggyGGggg', 'gggGgggG', '.gggggG.', '..GGGG..'],
    gem: ['........', '..cccc..', '.cwcccc.', 'cccccccb', '.ccccbb.', '..cbbb..', '...bb...', '........'],
    flame: ['...r....', '..rr....', '..ror.r.', '.roorrr.', '.royyor.', 'royyyyor', 'royyyyor', '.roooor.'],
    skull: ['.ssssss.', 'ssssssss', 'skksskks', 'skksskks', 'ssssssss', '.sssSss.', '..sSsS..', '..ssss..'],
    bolt: ['....yy..', '...yy...', '..yy....', '.yyyyyy.', '....yy..', '...yy...', '..yy....', '.y......'],
    drop: ['...r....', '...r....', '..rrr...', '..rrr...', '.rwrrr..', '.rrrrr..', '..rrr...', '........'],
    swirl: ['..pppp..', '.p....p.', 'p..pp..p', 'p.p..p.p', 'p.p.pp.p', 'p..p...p', '.p....p.', '..pppp..'],
    orb: ['..pppp..', '.pwppPp.', 'pwpppPPp', 'pppppPPp', 'ppppPPPp', '.ppPPPp.', '..pppp..', '.TTTTTT.'],
    yinyang: ['..wwkk..', '.wwwwkk.', 'wwkwwkkk', 'wwwwkkkk', 'wwwkkkkk', 'wwwkkwkk', '.wwkkkk.', '..wwkk..'],
    leaf: ['......nn', '....nnnn', '...nnnNn', '..nnnNnn', '.nnnNnn.', '.nnNnn..', '.Nnn....', 'N.......'],
    clover: ['.nn..nn.', 'nnnnnnnn', 'nnnNNnnn', '.nnNNnn.', 'nnnNNnnn', 'nnnnnnnn', '.nn.Nnn.', '....N...'],
    flower: ['..i..i..', '.iiiiii.', 'iiiyyiii', '.iyyyyi.', 'iiiyyiii', '.iiiiii.', '..iNNi..', '...N....'],
    tree: ['...nn...', '..nnnn..', '.nnnnnn.', '..nnnn..', '.nnnnnn.', 'nnnnnnnn', '...TT...', '...TT...'],
    paw: ['.t....t.', 't.t..t.t', '.t....t.', '...tt...', '..tttt..', '.tttttt.', '.tttttt.', '..t..t..'],
    wolf: ['s.....s.', 'ss...ss.', 'ssssssss', 'skssskss', 'ssssssss', '.ssskss.', '..ssss..', '...ss...'],
    dragon: ['.n....n.', 'nNn..nNn', '.nnnnnn.', 'nnyknyk.', 'nnnnnnnn', '.nnrrrn.', '..nnnn..', '.n.nn.n.'],
    tiger: ['o.....o.', 'oo...oo.', 'oooooooo', 'okookoo.', 'kooooook', '.oowwoo.', '..okko..', '...oo...'],
    person: ['...kk...', '..kmmk..', '..mmmm..', '...mm...', '.bbbbbb.', 'b.bbbb.b', '..b..b..', '..k..k..'],
    sage: ['...pp...', '..pppp..', '.pmmmmp.', '..mwwm..', '.ppwwpp.', 'p.pppp.p', '..pppp..', '..p..p..'],
    monk: ['...mm...', '..mmmm..', '..mmmm..', '...mm...', '.oooooo.', 'oooyyooo', '.oooooo.', '..o..o..'],
    group: ['.kk..kk.', 'kmmkkmmk', '.mm..mm.', 'bbbbrrrr', 'bbbbrrrr', 'b.bbrr.r', '.b..r..r', '........'],
    baby: ['..yyyy..', '.ymmmmy.', '.mkmmkm.', '.mmmmmm.', '..mrrm..', '.wwwwww.', '.wwwwww.', '..w..w..'],
    elder: ['..ssss..', '.smmmms.', '.mkmmkm.', '.mmmmmm.', '.msssm..', '.ssssss.', '..tttt..', '..t..t..'],
    fist: ['........', '.mmmmmm.', 'mmkmkmkm', 'mmmmmmmm', 'mmmmmmmm', '.mmmmmm.', '..rrrr..', '..rrrr..'],
    brain: ['..iiii..', '.iiIiii.', 'iIiiiIii', 'iiiIiiii', 'iIiiiiIi', '.iiiIii.', '..iiii..', '...ii...'],
    hand: ['........', '.m.m.m..', '.m.m.m.m', '.mmmmm.m', 'mmmmmmmm', '.mmmmmmm', '..mmmmm.', '...mmm..'],
    potion: ['...ss...', '...ss...', '..s..s..', '.s....s.', 's.nnnn.s', 's.nnnn.s', 's.nnnn.s', '.ssssss.'],
    pill: ['........', '..rrww..', '.rrrwww.', '.rrrwww.', '..rrww..', '........', '........', '........'],
    bowl: ['...w.w..', '..w.w...', '........', 'ssssssss', 'sccccccs', '.sccccs.', '..ssss..', '........'],
    cup: ['..w.w...', '...w....', 'nnnnnn..', 'nNNNNnnn', 'nNNNNn.n', 'nNNNNnnn', '.nnnn...', 'NNNNNN..'],
    moon: ['..yyy...', '.yy.....', 'yy......', 'yy......', 'yy......', 'yy......', '.yy.....', '..yyy...'],
    sun: ['...y....', '.y.y.y..', '..ggg...', 'yggggg.y', '..ggg...', '.y.y.y..', '...y....', '........'],
    night: ['k.w...k.', 'kkk.y.kk', 'kwkkkkkk', 'kkkky.kk', 'kkkkkkwk', 'kykkkkkk', 'kkkwkkyk', 'kkkkkkkk'],
    hourglass: ['tttttttt', '.y....y.', '..yyyy..', '...yy...', '...yy...', '..y..y..', '.yyyyyy.', 'tttttttt'],
    target: ['..rrrr..', '.rwwwwr.', 'rwrrrrwr', 'rwrkkrwr', 'rwrkkrwr', 'rwrrrrwr', '.rwwwwr.', '..rrrr..'],
    candle: ['...y....', '..yoy...', '...o....', '..wwww..', '..wwws..', '..wwws..', '..wwws..', '.ssssss.'],
    dice: ['wwwwwww.', 'wkwwwkws', 'wwwwwwws', 'wwwkwwws', 'wwwwwwws', 'wkwwwkws', 'wwwwwwws', '.sssssss'],
    check: ['........', '......nn', '.....nn.', 'nn..nn..', '.nnnn...', '..nn....', '........', '........'],
    cross: ['r......r', '.r....r.', '..r..r..', '...rr...', '...rr...', '..r..r..', '.r....r.', 'r......r'],
    warn: ['...yy...', '...yy...', '..yyyy..', '..ykky..', '.yykkyy.', '.yyyyyy.', 'yyykkyyy', 'yyyyyyyy'],
    lock: ['..ssss..', '.s....s.', '.s....s.', 'gggggggg', 'gggkkggg', 'gggkkggg', 'gggggggg', 'GGGGGGGG'],
    chain: ['ss......', 's.s.....', '.ss.ss..', '...s.s..', '...ss.ss', '.....s.s', '......ss', '........'],
    eye: ['........', '..ssss..', '.swwwws.', 'swwbbwws', 'swwbkwws', '.swwwws.', '..ssss..', '........'],
    ring: ['...cc...', '..cwwc..', '..gggg..', '.g....g.', 'g......g', 'g......g', '.g....g.', '..gggg..'],
    mask: ['r......r', 'rr....rr', 'rrrrrrrr', 'rkyrrykr', 'rrrrrrrr', 'rrwrrwrr', '.rRRRRr.', '..rrrr..'],
    compass: ['..ssss..', '.s..r.s.', 's...r..s', 's..rww.s', 's.wwb..s', 's...b..s', '.s..b.s.', '..ssss..'],
    map: ['tyyytyyy', 'tyryyyyt', 'tyyrytyt', 'tyyyryyt', 'tynyyryt', 'tnnyyyyt', 'tyyytyyt', 'tttttttt'],
    house: ['...rr...', '..rrrr..', '.rrrrrr.', 'rrrrrrrr', '.tttttt.', '.tyttyt.', '.ttTTtt.', '.ttTTtt.'],
    temple: ['...RR...', '.rrrrrr.', 'r.rrrr.r', '..tyyt..', '.rrrrrr.', 'rRrrrrRr', '.tyttyt.', '.ttTTtt.'],
    shop: ['rwrwrwrw', 'rwrwrwrw', '........', '.tttttt.', '.tyyttt.', '.tyytTt.', '.ttttTt.', 'TTTTTTTT'],
    lantern: ['...TT...', '..rrrr..', '.rryyrr.', '.ryyyyr.', '.ryyyyr.', '.rryyrr.', '..rrrr..', '...yy...'],
    gate: ['RRRRRRRR', '.rrrrrr.', '.r....r.', '.rrrrrr.', '.r....r.', '.r....r.', '.r....r.', '.r....r.'],
    wave: ['........', '..bb....', '.bccb..b', 'bc..cbbc', 'bbbbbbbb', 'bBbbBbbB', 'BBBBBBBB', '........'],
    mountain: ['...w....', '..wsw...', '..sss...', '.sssSs..', '.ssSSSs.', 'sSSSSSSs', 'SSSSSSSS', '........'],
    snow: ['...c....', '.c.c.c..', '..ccc...', 'ccc.ccc.', '..ccc...', '.c.c.c..', '...c....', '........'],
    bone: ['ss....ss', 'sss..sss', '.ssssss.', '..ssss..', '..ssss..', '.ssssss.', 'sss..sss', 'ss....ss'],
    scales: ['...gg...', 'gggggggg', 'g..gg..g', 'g..gg..g', 'gg.gg.gg', '...gg...', '...gg...', '.gggggg.'],
    flag: ['.kkkkk..', '.krrrrk.', '.krrrrrk', '.krrrrk.', '.kkkkk..', '.k......', '.k......', '.k......'],
    bell: ['...gg...', '..gyyg..', '.gyyyyg.', '.gyyyyg.', '.gyyyyg.', 'gggggggg', '...gg...', '........'],
    question: ['..yyyy..', '.yy..yy.', '.....yy.', '....yy..', '...yy...', '...yy...', '........', '...yy...'],
    play: ['.y......', '.yyy....', '.yyyyy..', '.yyyyyyy', '.yyyyy..', '.yyy....', '.y......', '........'],
    pause: ['........', '.yy..yy.', '.yy..yy.', '.yy..yy.', '.yy..yy.', '.yy..yy.', '.yy..yy.', '........'],
    next: ['........', 'y..y..yy', 'yy.yy.yy', 'yyyyyyyy', 'yyyyyyyy', 'yy.yy.yy', 'y..y..yy', '........'],
    save: ['bbbbbbb.', 'bsssssbb', 'bsssssbb', 'bbbbbbbb', 'bwwwwwwb', 'bwkkkkwb', 'bwwwwwwb', 'bbbbbbbb'],
    link: ['........', '.ss.....', 's..s....', 's..sss..', '.sss..s.', '....s..s', '.....ss.', '........'],
    reload: ['..nnnn..', '.n....nn', 'n....nnn', 'n.......', 'n.......', 'n....n..', '.n..n...', '..nn....'],
    gamepad: ['........', '.ssssss.', 'ssssssss', 'skssssrs', 'kkkssbsr', 'skssssbs', 'ss.ss.ss', '........'],
    chart: ['.......n', '......nn', '...n..n.', '..nnnn..', '.nn.....', 'n.......', 'kkkkkkkk', '........'],
    chartdown: ['r.......', 'rr......', '.r..r...', '..rrrr..', '.....rr.', '......r.', 'kkkkkkkk', '........'],
    calendar: ['.k....k.', 'rrrrrrrr', 'wwwwwwww', 'wkwkwkww', 'wwwwwwww', 'wkwkwkww', 'wwwwwwww', 'ssssssss'],
    smile: ['..yyyy..', '.yyyyyy.', 'yykyykyy', 'yyyyyyyy', 'ykyyyyky', 'yykkkkyy', '.yyyyyy.', '..yyyy..'],
    shock: ['..yyyy..', '.yyyyyy.', 'ykkyykky', 'yyyyyyyy', 'yyykkyyy', 'yyykkyyy', '.yyyyyy.', '..yyyy..'],
    sad: ['..yyyy..', '.yyyyyy.', 'yykyykyy', 'ycyyyycy', 'yyykkyyy', 'yykyykyy', '.yyyyyy.', '..yyyy..'],
    medic: ['........', '..wwww..', '..wrrw..', 'wwwrrwww', 'wrrrrrrw', 'wwwrrwww', '..wrrw..', '..wwww..'],
    gift: ['.r.rr.r.', '..rrrr..', 'pppprppp', 'pppprppp', '.ppprpp.', '.ppprpp.', '.ppprpp.', '.ppppPp.'],
    dot: ['........', '..nnnn..', '.nnwnnn.', '.nnnnnn.', '.nnnnnn.', '.nnnnnn.', '..nnnn..', '........'],
    male: ['....bbbb', '......bb', '..bbbb.b', '.b....b.', '.b....b.', '.b....b.', '..bbbb..', '........'],
    female: ['..iiii..', '.i....i.', '.i....i.', '.i....i.', '..iiii..', '...ii...', '.iiiiii.', '...ii...'],
    robot: ['...s....', '.ssssss.', 'sbsssbss', 'ssssssss', 's.kkkk.s', '.ssssss.', '.s.ss.s.', '.s.ss.s.'],
    tomb: ['..ssss..', '.ssssss.', '.sskkss.', '.ssssss.', '.skkkks.', '.ssssss.', '.ssssss.', 'nnnnnnnn'],
    ghost: ['..wwww..', '.wwwwww.', 'wwkwwkww', 'wwwwwwww', 'wwwkkwww', 'wwwwwwww', 'wwwwwwww', 'w.ww.w.w'],
    boat: ['...w....', '...ww...', '...www..', '...wwww.', '...t....', 'tttttttt', '.tTTTTt.', 'bbbbbbbb'],
    wind: ['........', 'ccccc...', '.....c..', 'cccccc..', '........', 'ccccccc.', '.......c', '.....cc.'],
    mushroom: ['..rrrr..', '.rwrrwr.', 'rrrrrrrr', 'rwrrrwrr', '...mm...', '...mm...', '..mmmm..', '........'],
    bug: ['.k....k.', '..k..k..', '..nnnn..', '.nNnnNn.', 'knnnnnnk', '.nNnnNn.', 'k.nnnn.k', '........'],
    bread: ['........', '..tttt..', '.tyyyyt.', 'tyyyyyyt', 'tyyyyyyt', 'tttttttt', '.TTTTTT.', '........'],
    meat: ['....tt..', '...tTtt.', '..tTttt.', '.trrtt..', 'rrrr....', 'ws......', 'w.......', '........'],
    fish: ['........', '....bb..', 'b..bbbb.', 'bbbbbkbb', 'bbbbbbbb', 'b..bbbb.', '....bb..', '........'],
    horse: ['.....tt.', '....tkt.', '...tttt.', 'ttttttt.', 'tttttt..', 'tttttt..', 't.t..t..', 't.t..t..'],
    bird: ['........', '.....kk.', '....kkyk', 'k..kkkk.', 'kkkkkkk.', '.kkkkk..', '...y.y..', '........'],
    snake: ['....nnn.', '...n.kn.', '...nnnrr', '..nn....', '.nn.....', 'nn..nnn.', 'n..nn.nn', '.nnn....'],
    plus: ['........', '...nn...', '...nn...', '.nnnnnn.', '.nnnnnn.', '...nn...', '...nn...', '........'],
    minus: ['........', '........', '........', '.rrrrrr.', '.rrrrrr.', '........', '........', '........'],
    arrowup: ['...nn...', '..nnnn..', '.nnnnnn.', '...nn...', '...nn...', '...nn...', '...nn...', '........'],
    arrowright: ['........', '....y...', '....yy..', 'yyyyyyy.', 'yyyyyyyy', '....yy..', '....y...', '........'],
    pin: ['..rrrr..', '.rrwrrr.', '.rrrrrr.', '..rrrr..', '...rr...', '...ss...', '...s....', '...s....'],
    feather: ['......ww', '.....wsw', '....wsw.', '...wsw..', '..wsw...', '.wsw....', '.s......', 's.......'],
    globe: ['..bbbb..', '.bnnbbb.', 'bnnnbbnb', 'bbnbbnnb', 'bbbbnnnb', 'bnbbbnbb', '.bbbbbb.', '..bbbb..'],
    note: ['.wwwwww.', '.wkkkkw.', '.wwwwww.', '.wkkkkw.', '.wwwwww.', '.wkkkww.', '.wwwwww.', '.ssssss.'],
    box: ['tttttttt', 'tTTttTTt', 'tttttttt', 'tTttttTt', 'tTttttTt', 'tTttttTt', 'tTTTTTTt', 'tttttttt'],
  };
  // ---------- จับคู่อีโมจิ → สไปรต์ [ชื่อ, สลับสี] ----------
  const M = {};
  const map = (names, sp, tint) => { for (const e of [...names.matchAll(/\S+/g)].map(x => x[0])) M[e] = [sp, tint]; };
  map('❤ 🫀', 'heart'); map('💕 💗 💞 💖 💓 💝 🩷', 'heart', { r: 'i', R: 'p' }); map('💔', 'heart', { r: 'S', R: 'e' }); map('🖤', 'heart', { r: 'e', R: 'k', w: 'S' }); map('💙', 'heart', { r: 'b', R: 'B' }); map('💚', 'heart', { r: 'n', R: 'N' });
  map('🌟 ⭐ 🌠', 'star'); map('✨ 💫 🎆 🎇', 'sparkle');
  map('⚔ 🤺', 'swords'); map('🗡 🔪', 'dagger'); map('🏹', 'bow'); map('🛡', 'shield'); map('🔱', 'sword', { s: 'c', w: 'w' });
  map('⚒ 🔨 🪓 🪚 ⚙ 🔧', 'hammer'); map('⛏', 'pick');
  map('📜 🗒 📃', 'scroll'); map('📖 📕 📘 📒 📗 📙 📓', 'book'); map('📚', 'books'); map('📋 📝 📄 🧾 ✉ 📨', 'note');
  map('👑 🤴 👸', 'crown'); map('🏆', 'trophy'); map('🏅 🥇 🎖 🥈 🥉 ⚜', 'medal');
  map('💰 🪙 💸 💹', 'coin'); map('💎 🔷 🔶', 'gem');
  map('🔥 ☄ 🌋', 'flame'); map('☠ 💀', 'skull'); map('👻', 'ghost'); map('⚡ 💥', 'bolt');
  map('🩸', 'drop'); map('💧 💦', 'drop', { r: 'b', w: 'c' });
  map('🌀', 'swirl'); map('🔮', 'orb'); map('☯', 'yinyang'); map('🧬', 'swirl', { p: 'b' });
  map('🌿 🍃 🌱 🍂 🌾', 'leaf'); map('🍀 ☘', 'clover'); map('🌺 🌸 🪷 🥀 💐 🌷', 'flower'); map('🌲 🌳 🎄', 'tree');
  map('🐾', 'paw'); map('🐺 🐕 🐈 🦊 🐀 🐰 🐻 🦍', 'wolf'); map('🐉 🐲 🦎', 'dragon'); map('🐯 🐅', 'tiger'); map('🐍', 'snake'); map('🐎 🐴 🐫 🐪', 'horse'); map('🐔 🐦 🦅 🦋 🐣', 'bird'); map('🐟 🐠', 'fish'); map('🦠 🐛 🐞', 'bug');
  map('🧑 👤 🧍 🧒 🙋 🧑‍🏫 👨‍🏫 👨‍🌾 🤵', 'person'); map('🧙 🧝', 'sage'); map('🧘 📿', 'monk'); map('👥 👨‍👩‍👧 👪', 'group'); map('👶 🍼 🧸', 'baby'); map('🧓 👴 👵', 'elder');
  map('💪 👊 🥋 🤼 🏋', 'fist'); map('🧠', 'brain'); map('🤝 🤲 🙇 👋 ✋ 🙏', 'hand');
  map('🍵 ☕ 🍶 🍺 🍷 🍻', 'cup'); map('💊', 'pill'); map('🧪 ⚗', 'potion'); map('🍲 🍚 🥣 🍜', 'bowl'); map('🍄', 'mushroom'); map('🍞 🥟 🍬 🍎 🍇', 'bread'); map('🍖 🍗', 'meat');
  map('🌑 🌙 🌕 🌛', 'moon'); map('🌅 🌇 ☀ 🌄', 'sun'); map('🌌 🌃', 'night');
  map('⏳ ⌛ ⏰', 'hourglass'); map('🎯', 'target'); map('🕯', 'candle'); map('🎲', 'dice');
  map('✅ ✔ ☑', 'check'); map('❌ ❎ ✖', 'cross'); map('⚠ 🚨', 'warn'); map('🔒 🔐 🗝', 'lock'); map('⛓', 'chain'); map('🔗', 'link'); map('👁 👀', 'eye'); map('💍 💒', 'ring');
  map('👹 😤 😠 👺 🎭', 'mask'); map('🧭', 'compass'); map('🗺', 'map');
  map('🏡 🏠 🏘 🏚', 'house'); map('🏯 🏛 ⛪ 🏫 🗼 🏙 🏰 🏟', 'temple'); map('🏪 🛒 🏬', 'shop'); map('🏮 🎐', 'lantern'); map('⛩', 'gate');
  map('🌊 🌧 ⛈', 'wave'); map('🗻 🏔', 'mountain'); map('❄ ☃', 'snow'); map('🦴', 'bone'); map('⚖', 'scales'); map('🏴 🏳 🚩', 'flag'); map('🔔 📯 📣 📢', 'bell');
  map('❓ ❔', 'question'); map('▶ ⏵', 'play'); map('⏸', 'pause'); map('⏭', 'next'); map('💾', 'save'); map('🔄 🔁', 'reload'); map('🎮 🕹', 'gamepad');
  map('📊 📈', 'chart'); map('📉', 'chartdown'); map('📅 🗓', 'calendar'); map('😊 🙂 😄 🎉', 'smile'); map('😱 😵 😨', 'shock'); map('😢 😭', 'sad');
  map('🏥 🩺 🩹 🤒 ♿', 'medic'); map('🎁', 'gift'); map('🟢', 'dot'); map('🔴', 'dot', { n: 'r' }); map('♂', 'male'); map('♀', 'female'); map('🤖', 'robot'); map('🪦 🗿', 'tomb');
  map('⛵ 🚢', 'boat'); map('💨 🌬', 'wind'); map('⬆', 'arrowup'); map('➡', 'arrowright'); map('📍 📌', 'pin'); map('🪶 🖋 🖌', 'feather'); map('🌍 🌏', 'globe');
  map('📦 🧺 🪣 🪵 🧱 🧹 🏺 🪨', 'box'); map('🎎 🪭 🪀 🎓 🎁', 'gift'); map('🧮 🪟 📏 ♟', 'note'); map('💭 💬', 'note'); map('🧮', 'dice');
  map('💢 💥', 'bolt', { y: 'r' }); map('🥈', 'medal', { g: 's', G: 'S', y: 'w' }); map('🥉', 'medal', { g: 'o', G: 'T', y: 't' }); map('⛰', 'mountain'); map('🎵 🎶', 'bell'); map('🐟', 'fish'); map('🪖', 'shield'); map('🛏', 'house'); map('🎪', 'temple'); map('🛤', 'map'); map('🦊', 'wolf', { s: 'o' });

  const KEY = 'douluo_pixmoji_mode';
  const MODES = { 8: '8-BIT', 16: '16-BIT', 32: '32-BIT' };
  let mode = 16;
  try { mode = +localStorage.getItem(KEY) || 16; } catch (e) {}
  if (!MODES[mode]) mode = 16;
  const cache = new Map();
  const norm = e => e.replace(/️/g, '').replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');

  function sprite(e) {
    const k = mode + e;
    if (cache.has(k)) return cache.get(k);
    const [name, tint] = M[norm(e)] || M[norm(e).split('‍')[0]] || ['gem'];
    const rows = SP[name] || SP.gem, pad = mode === 8 ? 0 : 1, W = 8 + pad * 2;
    const cv = document.createElement('canvas'); cv.width = cv.height = W;
    const x = cv.getContext('2d');
    const solid = [];
    rows.forEach((row, yy) => [...row.padEnd(8, '.').slice(0, 8)].forEach((ch, xx) => {
      if (ch === '.' || ch === '>') return;
      const col = PAL[(tint && tint[ch]) || ch] || PAL[ch.toLowerCase()] || PAL.s;
      x.fillStyle = col; x.fillRect(xx + pad, yy + pad, 1, 1); solid.push((yy + pad) * W + xx + pad);
    }));
    if (pad) { // 16/32-BIT: ขอบดำรอบรูป
      const has = new Set(solid);
      x.fillStyle = PAL.k;
      for (let yy = 0; yy < W; yy++) for (let xx = 0; xx < W; xx++) {
        const i = yy * W + xx; if (has.has(i)) continue;
        if (has.has(i - 1) && xx > 0 || has.has(i + 1) && xx < W - 1 || has.has(i - W) || has.has(i + W)) x.fillRect(xx, yy, 1, 1);
      }
    }
    if (mode === 32) { // แสงด้านซ้ายบน เงาด้านขวาล่าง
      const d = x.getImageData(0, 0, W, W), p = d.data;
      for (let yy = 0; yy < W; yy++) for (let xx = 0; xx < W; xx++) {
        const i = (yy * W + xx) * 4; if (!p[i + 3] || (p[i] === 26 && p[i + 1] === 20)) continue;
        const f = xx + yy < W * 0.7 ? 1.12 : xx + yy > W * 1.3 ? 0.82 : 1;
        p[i] = Math.min(255, p[i] * f); p[i + 1] = Math.min(255, p[i + 1] * f); p[i + 2] = Math.min(255, p[i + 2] * f);
      }
      x.putImageData(d, 0, 0);
    }
    const url = cv.toDataURL();
    cache.set(k, url);
    return url;
  }

  const RE = /(?:\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]{2})(?:️|⃣|[\u{1F3FB}-\u{1F3FF}]|‍\p{Extended_Pictographic}️?)*/gu;
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'TITLE', 'CANVAS', 'SVG']);
  function convertText(node) {
    const t = node.nodeValue;
    RE.lastIndex = 0;
    if (!RE.test(t)) return;
    RE.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0, m;
    while ((m = RE.exec(t))) {
      if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
      const im = document.createElement('img');
      im.className = 'pxe'; im.src = sprite(m[0]); im.alt = m[0]; im.draggable = false;
      frag.appendChild(im);
      last = m.index + m[0].length;
    }
    if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  const skipEl = el => !el || SKIP.has(el.nodeName.toUpperCase()) || (el.closest && el.closest('.no-pix'));
  function scan(root) {
    if (root.nodeType === 3) { if (!skipEl(root.parentNode)) convertText(root); return; }
    if (root.nodeType !== 1 || skipEl(root)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => skipEl(n.parentNode) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const list = []; while (w.nextNode()) list.push(w.currentNode);
    list.forEach(convertText);
  }
  // ประมวลผลทันทีที่เนื้อหาเปลี่ยน (ไมโครทาสก์ ก่อนเบราว์เซอร์วาดภาพ) — ไม่เห็นอีโมจิแบบเดิมแวบขึ้นมา
  let queue = new Set(), scheduled = false;
  const flush = () => { scheduled = false; const q = queue; queue = new Set(); for (const n of q) if (n.isConnected) scan(n); };
  const obs = new MutationObserver(ms => {
    for (const m of ms) {
      if (m.type === 'characterData') queue.add(m.target);
      else m.addedNodes.forEach(n => { if (!(n.nodeType === 1 && n.classList.contains('pxe'))) queue.add(n); });
    }
    if (!scheduled && queue.size) { scheduled = true; queueMicrotask(flush); }
  });
  // ชื่อหน้าต่าง/ทูลทิป (title) ไม่แสดงรูปได้ → ลบอีโมจิออกจากข้อความเหล่านั้น
  const cleanTitles = root => (root.querySelectorAll ? root.querySelectorAll('[title]') : []).forEach(el => { const t = el.getAttribute('title'); if (RE.test(t)) { RE.lastIndex = 0; el.setAttribute('title', t.replace(RE, '').replace(/\s{2,}/g, ' ').trim()); } RE.lastIndex = 0; });
  function start() { scan(document.body); cleanTitles(document.body); obs.observe(document.body, { childList: true, subtree: true, characterData: true }); setInterval(() => cleanTitles(document.body), 2000); }
  function setMode(m) {
    if (!MODES[m]) return;
    mode = m; try { localStorage.setItem(KEY, m); } catch (e) {}
    document.querySelectorAll('img.pxe').forEach(im => { im.src = sprite(im.alt); });
    document.documentElement.dataset.bit = m;
  }
  const next = () => setMode(mode === 8 ? 16 : mode === 16 ? 32 : 8);
  document.documentElement.dataset.bit = mode;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  return { setMode, next, sprite, get mode() { return mode; }, label: () => MODES[mode], has: e => !!M[norm(e)] };
})();
