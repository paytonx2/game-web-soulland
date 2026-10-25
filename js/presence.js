// ============================================================
// จำนวนคนออนไลน์แบบเรียลไทม์ (มุมล่างซ้าย)
// ต้องเปิดผ่าน server.js เท่านั้น — ถ้าเปิดจากโฮสต์ static ที่ไม่มี /presence ตัวนับจะซ่อนตัวเอง
// ============================================================
(() => {
  if (!window.EventSource) return;
  let id;
  try { id = localStorage.getItem('douluo_presence_id'); if (!id) { id = Math.random().toString(36).slice(2, 14); localStorage.setItem('douluo_presence_id', id); } }
  catch (e) { id = Math.random().toString(36).slice(2, 14); }
  const el = document.createElement('div');
  el.className = 'presence'; el.hidden = true; el.title = 'จำนวนคนที่เปิดเว็บอยู่ตอนนี้ (นับแบบเรียลไทม์)';
  document.body.appendChild(el);
  const state = () => (typeof S !== 'undefined' && S && !document.getElementById('game').hidden ? 'playing' : 'landing');
  let cur = state(), ever = false;
  const es = new EventSource(`/presence?id=${id}&state=${cur}`);
  es.onmessage = e => {
    let d; try { d = JSON.parse(e.data); } catch (err) { return; }
    ever = true; el.hidden = false; el.classList.remove('off');
    el.innerHTML = `<i></i><b>${d.online}</b> ออนไลน์<span>⚔️ <b>${d.playing}</b> กำลังเล่น</span>`;
  };
  es.onerror = () => { if (ever) { el.classList.add('off'); } else { el.hidden = true; } };
  // แจ้งเมื่อเปลี่ยนจากหน้าแรกเป็นกำลังเล่น (หรือกลับ)
  setInterval(() => {
    const st = state();
    if (st !== cur) { cur = st; fetch(`/presence/state?id=${id}&state=${st}`, { method: 'POST' }).catch(() => {}); }
  }, 1500);
})();
