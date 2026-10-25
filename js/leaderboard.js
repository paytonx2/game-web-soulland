// ============================================================
// ท็อปบอร์ด (Supabase)
// · ส่งได้เฉพาะตอนจบชีวิต: ระดับ 70 ขึ้นไป หรือสืบทอดเป็นเทพ · ส่งได้ครั้งเดียวต่อหนึ่งชีวิต
// · ใช้ publishable key เท่านั้น (เปิดเผยได้) — ห้ามใส่ secret key ในหน้าเว็บเด็ดขาด
// · สิทธิ์และการตรวจความถูกต้องอยู่ที่ฐานข้อมูล (supabase/leaderboard.sql)
// ============================================================
const LB = {
  url: '', // ← Project URL เช่น https://xxxxxxxx.supabase.co (Project Settings → Data API)
  key: 'sb_publishable_MGVkSaeGlcuWcur0aOgjpA_Kmt5fF4U',
  table: 'leaderboard',
};
const lbReady = () => /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(LB.url);
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// คำต้องห้าม (ตรงกับรายการในฐานข้อมูล — ตรวจก่อนส่งเพื่อบอกผู้เล่นทันที)
const LB_BANNED = ['ควย', 'เหี้ย', 'เหี่ย', 'สัส', 'สัด', 'เย็ด', 'แตด', 'ระยำ', 'จัญไร', 'ชาติหมา', 'ส้นตีน', 'อีดอก', 'ดอกทอง', 'กะหรี่', 'อีกะหรี่', 'พ่อมึง', 'แม่มึง', 'ไอ้สัตว์', 'อีสัตว์', 'หน้าหี', 'หีแม่',
  'fuck', 'fck', 'fuk', 'shit', 'bitch', 'cunt', 'dick', 'pussy', 'nigger', 'nigga', 'faggot', 'asshole', 'whore', 'slut', 'porn', 'sex'];
const lbBanned = t => { const n = String(t || '').toLowerCase().replace(/[\s.\-_*@#$%!~0-9]/g, ''); return LB_BANNED.some(w => n.includes(w)); };

const lbEligible = s => !s.alive && (lvl(s) >= 70 || !!s.ascended);
const lbSentKey = 'douluo_lb_sent';
const lbSent = () => { try { return JSON.parse(localStorage.getItem(lbSentKey)) || []; } catch (e) { return []; } };
const lbMark = id => { try { localStorage.setItem(lbSentKey, JSON.stringify([...lbSent(), id].slice(-200))); } catch (e) {} };

function lbPayload(s, player) {
  const god = s.god ? GODS.find(g => g.id === s.god.id) : null;
  const top = s.rings.length ? s.rings.reduce((a, b) => b.years > a.years ? b : a) : null;
  const godName = s.ascended ? (s.cause.match(/สืบทอดเป็น(\S+)/) || [])[1] || (god && god.th) || 'เทพ' : god ? god.th : null;
  return {
    life_id: s.id, player_name: player.trim(), char_name: s.name, char_zh: s.zh, gender: s.gender, age: s.age,
    level: isCultivator(s) ? lvl(s) : 0, rank: isCultivator(s) ? rankOf(lvl(s)).th : 'คนธรรมดา', title: s.title || null,
    fame: Math.max(0, Math.round(s.fame)), birthplace: placeOf(s).th, family: familyOf(s).th,
    soul: s.awakened ? s.souls.map(id => `${SOUL_BY_ID[id].th} (${TIER_INFO[SOUL_BY_ID[id].tier].th})`).join(' + ') : null,
    mutated: (s.mutations || []).length > 0, rings: s.rings.map(r => Math.round(r.years)), bones: s.bones.length,
    top_skill: top ? `「${top.skill}」${fmt(top.years)} ปี` : null, god: godName, god_stage: s.god ? s.god.stage : null,
    ascended: !!s.ascended, cause: s.cause, fights: s.fights || 0, game_version: s.v,
  };
}
async function lbSubmit(s, player) {
  if (!lbReady()) throw new Error('ระบบท็อปบอร์ดยังไม่ได้ตั้งค่า');
  const res = await fetch(`${LB.url}/rest/v1/${LB.table}`, {
    method: 'POST', headers: { apikey: LB.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(lbPayload(s, player)),
  });
  if (res.status === 409) { lbMark(s.id); throw new Error('ชีวิตนี้ถูกส่งขึ้นท็อปบอร์ดไปแล้ว'); }
  if (!res.ok) { let m = ''; try { m = (await res.json()).message || ''; } catch (e) {} throw new Error(m || `ส่งไม่สำเร็จ (${res.status})`); }
  lbMark(s.id);
}
async function lbFetch(tab) {
  if (!lbReady()) throw new Error('ระบบท็อปบอร์ดยังไม่ได้ตั้งค่า');
  let q = 'select=*&order=ascended.desc,level.desc,ring_total.desc,fame.desc,created_at.asc&limit=100';
  if (tab === 'gods') q += '&god=not.is.null';
  if (tab === 'week') q += `&created_at=gte.${new Date(Date.now() - 7 * 864e5).toISOString()}`;
  const res = await fetch(`${LB.url}/rest/v1/${LB.table}?${q}`, { headers: { apikey: LB.key } });
  if (!res.ok) throw new Error(`โหลดไม่สำเร็จ (${res.status})`);
  return res.json();
}

// ---------- ส่วนส่งในหน้าสรุปหลังตาย ----------
function lbTombHtml(s) {
  if (!lbEligible(s)) return `<div class="lbsend off"><b>🏆 ท็อปบอร์ด</b><small>ส่งได้เมื่อจากไปด้วยระดับ 70 ขึ้นไป หรือสืบทอดเป็นเทพ (ชีวิตนี้ระดับ ${isCultivator(s) ? lvl(s) : 0})</small></div>`;
  if (!lbReady()) return '<div class="lbsend off"><b>🏆 ท็อปบอร์ด</b><small>ระบบท็อปบอร์ดยังไม่ได้ตั้งค่า</small></div>';
  if (lbSent().includes(s.id)) return '<div class="lbsend done"><b>🏆 ส่งขึ้นท็อปบอร์ดแล้ว</b><button class="pbtn ghost" id="lbOpen">ดูท็อปบอร์ด</button></div>';
  let last = ''; try { last = localStorage.getItem('douluo_player') || ''; } catch (e) {}
  return `<div class="lbsend"><b>🏆 ส่งชีวิตนี้ขึ้นท็อปบอร์ด</b><small>ใส่ชื่อของคุณ (ผู้เล่น) ได้ไม่เกิน 20 ตัวอักษร · ส่งได้ครั้งเดียว</small>
    <div class="lbrow"><input id="lbName" maxlength="20" placeholder="ชื่อผู้เล่น" value="${esc(last)}" autocomplete="nickname"><button class="pbtn" id="lbSend">ส่งขึ้นบอร์ด</button></div><div class="lbmsg" id="lbMsg"></div></div>`;
}
function lbTombBind(s) {
  const open = $('lbOpen'); if (open) open.onclick = () => showLeaderboard();
  const btn = $('lbSend'); if (!btn) return;
  btn.onclick = async () => {
    const name = $('lbName').value.trim(), msg = $('lbMsg');
    if (!name) { msg.textContent = 'กรุณาใส่ชื่อผู้เล่น'; return; }
    if (lbBanned(name)) { msg.textContent = 'ชื่อมีคำไม่เหมาะสม ลองชื่ออื่น'; return; }
    try { localStorage.setItem('douluo_player', name); } catch (e) {}
    btn.disabled = true; msg.textContent = 'กำลังส่ง…';
    try { await lbSubmit(s, name); msg.textContent = ''; toast('🏆 ส่งขึ้นท็อปบอร์ดแล้ว'); $('lbBox').innerHTML = lbTombHtml(s); lbTombBind(s); }
    catch (e) { msg.textContent = e.message; btn.disabled = false; }
  };
}

// ---------- หน้าท็อปบอร์ด ----------
let lbTab = 'all';
function lbRowHtml(r, i) {
  const fr = fameRank(r.fame), medal = ['🥇', '🥈', '🥉'][i] || `<span class="no">${i + 1}</span>`;
  const rings = (r.rings || []).map(y => `<i style="--rc:${RING_TIERS[ringTierOf(y)].color}"></i>`).join('');
  return `<details class="lbr ${r.ascended ? 'god' : ''}">
    <summary>
      <span class="lbn">${medal}</span>
      <span class="lbc"><b>${esc(r.char_name)}</b> <span class="zh">${esc(r.char_zh)}</span><small>เล่นโดย ${esc(r.player_name)} · ${esc(r.birthplace)}</small></span>
      <span class="lbl"><b>Lv.${r.level}</b><small>${esc(r.rank)}</small></span>
      <span class="lbt">${r.ascended ? `<em class="gtag">สืบทอด${esc(r.god)}</em>` : r.title ? `<em>${esc(r.title)}</em>` : ''}<small>${esc(fr.th)}</small></span>
      <span class="lbrings">${rings}</span>
    </summary>
    <div class="lbd">
      <div><small>วิญญาณยุทธ์</small>${esc(r.soul || '—')}${r.mutated ? ' · กลายพันธุ์' : ''}</div>
      <div><small>ทักษะที่แกร่งที่สุด</small>${esc(r.top_skill || '—')}</div>
      <div><small>ฐานะ · อายุ</small>${esc(r.family)} · ${r.age} ปี</div>
      <div><small>ผ่านศึก · กระดูกวิญญาณ</small>${r.fights} ครั้ง · ${r.bones} ชิ้น</div>
      ${r.god && !r.ascended ? `<div><small>บททดสอบเทพ</small>${esc(r.god)} ผ่าน ${r.god_stage ?? 0} ด่าน</div>` : ''}
      <div class="wide"><small>จุดจบ</small>${esc(r.cause)}</div>
    </div></details>`;
}
async function showLeaderboard() {
  const tabs = [['all', 'ทั้งหมด'], ['gods', 'ผู้สืบทอดเทพ'], ['week', '7 วันล่าสุด']];
  overlay(`<div class="panel lbpanel"><div class="lbhead"><h2 class="title lbtitle">🏆 ท็อปบอร์ด</h2><button class="pbtn ghost" id="lbClose">ปิด</button></div>
    <div class="lbtabs">${tabs.map(([k, t]) => `<button class="cat ${k === lbTab ? 'on' : ''}" data-lbt="${k}">${t}</button>`).join('')}</div>
    <div class="lbnote">ชีวิตที่จากไปด้วยระดับ 70 ขึ้นไป หรือสืบทอดเป็นเทพ · เรียงตาม ผู้สืบทอดเทพ → ระดับ → อายุวงแหวนรวม → ชื่อเสียง</div>
    <div class="lblist" id="lbList"><div class="cardload">กำลังโหลด…</div></div></div>`, true);
  $('lbClose').onclick = () => { if (S && !S.alive) showTomb(); else if (S && !$('game').hidden) closeOverlay(); else showLanding(); };
  document.querySelectorAll('[data-lbt]').forEach(b => b.onclick = () => { lbTab = b.dataset.lbt; showLeaderboard(); });
  try {
    const rows = await lbFetch(lbTab);
    $('lbList').innerHTML = rows.length ? rows.map(lbRowHtml).join('') : '<div class="note">ยังไม่มีใครขึ้นท็อปบอร์ดในหมวดนี้ — เป็นคนแรกสิ!</div>';
  } catch (e) { const l = $('lbList'); if (l) l.innerHTML = `<div class="note">${esc(e.message)}</div>`; }
}
