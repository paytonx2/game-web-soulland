-- ============================================================
-- อัปเดตท็อปบอร์ด #2: คะแนนความเก่ง (power) — วิญญาณยุทธ์ดีจะได้คะแนนสูงและเบียดอันดับได้
-- วิธีใช้: SQL Editor → New query → วางทั้งไฟล์ → Run (รันซ้ำได้)
-- คะแนนคำนวณที่ฐานข้อมูลเท่านั้น ผู้เล่นส่งค่ามาเองไม่ได้
-- ============================================================

alter table public.leaderboard add column if not exists soul_tier int not null default 1;
alter table public.leaderboard add column if not exists soul_over int not null default 0;
alter table public.leaderboard add column if not exists twin_soul boolean not null default false;
alter table public.leaderboard add column if not exists power int not null default 0;

alter table public.leaderboard drop constraint if exists lb_soul_tier_chk;
alter table public.leaderboard add constraint lb_soul_tier_chk check (soul_tier between 1 and 5);
alter table public.leaderboard drop constraint if exists lb_soul_over_chk;
alter table public.leaderboard add constraint lb_soul_over_chk check (soul_over between -2 and 3);

create index if not exists leaderboard_power_idx on public.leaderboard (power desc, level desc, created_at asc);

-- คะแนนความเก่ง
--   ระดับ × 100                         (ระดับ 99 = 9,900)
-- + พลังวงแหวนแต่ละวง ≈ 80 × log10(อายุ)^1.6   (วงแสนปี ≈ 1,050)
-- + ระดับวิญญาณยุทธ์: ด้อย 0 · ธรรมดา 0 · ดี 400 · ยอดเยี่ยม 900 · ตำนาน 1,600 (+ กลายพันธุ์เกินขั้น 400/ขั้น)
-- + วิญญาณยุทธ์คู่ 800 · กระดูกวิญญาณ 400/ชิ้น
-- + สืบทอดเทพ 5,000 (หรือ 300 ต่อด่านบททดสอบเทพที่ผ่าน)
-- + ชื่อเสียง (สูงสุด 1,000) + ประสบการณ์ศึก 2/ครั้ง (สูงสุด 500)
create or replace function public.lb_power(lv int, rings int[], tier int, over int, twin boolean, bones int, ascended boolean, god_stage int, fame int, fights int)
returns int language sql immutable as $$
  select (
    lv * 100
    + coalesce((select sum(round(80 * power(log(greatest(10, x)::numeric), 1.6)))::int from unnest(rings) x), 0)
    + (array[0, 0, 400, 900, 1600])[least(greatest(tier, 1), 5)]
    + greatest(-2, least(over, 3)) * 400
    + case when twin then 800 else 0 end
    + bones * 400
    + case when ascended then 5000 else coalesce(god_stage, 0) * 300 end
    + least(greatest(fame, 0), 1000)
    + least(greatest(fights, 0) * 2, 500)
  )::int;
$$;

create or replace function public.lb_validate() returns trigger
language plpgsql as $$
declare r int;
begin
  if new.level < 70 and not new.ascended then raise exception 'ต้องระดับ 70 ขึ้นไป หรือสืบทอดเป็นเทพ'; end if;
  if new.level > (cardinality(new.rings) + 1) * 10 then raise exception 'ระดับไม่สอดคล้องกับจำนวนวงแหวน'; end if;
  foreach r in array new.rings loop
    if r < 10 or r > 200000 then raise exception 'อายุวงแหวนผิดปกติ'; end if;
  end loop;
  if new.age < 10 then raise exception 'อายุไม่สมเหตุสมผล'; end if;
  if public.lb_has_banned(new.player_name) or public.lb_has_banned(new.char_name) or public.lb_has_banned(new.title) then
    raise exception 'ชื่อมีคำไม่เหมาะสม';
  end if;
  -- คำนวณเองที่เซิร์ฟเวอร์ ไม่เชื่อค่าจากเครื่องผู้เล่น
  new.ring_total := coalesce((select sum(x) from unnest(new.rings) x), 0);
  new.power := public.lb_power(new.level, new.rings, new.soul_tier, new.soul_over, new.twin_soul, new.bones, new.ascended, new.god_stage, new.fame, new.fights);
  new.created_at := now();
  if (select count(*) from public.leaderboard where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'ระบบยุ่งอยู่ ลองใหม่อีกครู่';
  end if;
  return new;
end;
$$;

-- คำนวณคะแนนให้รายการเก่าที่มีอยู่แล้ว
update public.leaderboard set power = public.lb_power(level, rings, soul_tier, soul_over, twin_soul, bones, ascended, god_stage, fame, fights);

notify pgrst, 'reload schema';
