-- ============================================================
-- ท็อปบอร์ด "เกิดในโลกวิญญาจารย์"
-- วิธีใช้: Supabase Dashboard → SQL Editor → New query → วางทั้งไฟล์นี้ → Run (รันซ้ำได้ ไม่พัง)
-- สิทธิ์: ผู้เล่นทั่วไป (publishable key) อ่านได้ทั้งหมด และเพิ่มได้อย่างเดียว — แก้/ลบไม่ได้
-- ลบรายการที่โกงหรือชื่อไม่เหมาะสม: Table Editor → leaderboard → เลือกแถว → Delete
-- ตั้งค่าใหม่ตั้งแต่ต้น: รันไฟล์นี้ แล้วรัน 002_power_score.sql ต่อ
-- ============================================================

create table if not exists public.leaderboard (
  id           uuid primary key default gen_random_uuid(),
  life_id      text not null unique check (char_length(life_id) between 4 and 40),
  player_name  text not null check (char_length(player_name) between 1 and 20),
  char_name    text not null check (char_length(char_name) between 1 and 40),
  char_zh      text check (char_length(char_zh) <= 20),
  gender       text check (gender in ('M', 'F')),
  age          int  not null check (age between 6 and 300),
  level        int  not null check (level between 1 and 100),
  rank         text check (char_length(rank) <= 40),
  title        text check (char_length(title) <= 60),
  fame         int  not null default 0 check (fame between 0 and 1000000),
  birthplace   text check (char_length(birthplace) <= 60),
  family       text check (char_length(family) <= 40),
  soul         text check (char_length(soul) <= 120),
  mutated      boolean not null default false,
  rings        int[] not null default '{}' check (cardinality(rings) <= 9),
  ring_total   bigint not null default 0,
  bones        int  not null default 0 check (bones between 0 and 6),
  top_skill    text check (char_length(top_skill) <= 120),
  god          text check (char_length(god) <= 60),
  god_stage    int  check (god_stage between 0 and 20),
  ascended     boolean not null default false,
  cause        text check (char_length(cause) <= 240),
  fights       int  not null default 0 check (fights between 0 and 100000),
  game_version int,
  created_at   timestamptz not null default now()
);

create index if not exists leaderboard_rank_idx on public.leaderboard (ascended desc, level desc, ring_total desc, fame desc);
create index if not exists leaderboard_created_idx on public.leaderboard (created_at desc);

-- ---------- คำต้องห้าม (ตรวจชื่อผู้เล่น ชื่อตัวละคร และฉายา) ----------
create or replace function public.lb_has_banned(t text) returns boolean
language sql immutable as $$
  select exists (
    select 1 from unnest(array[
      'ควย','เหี้ย','เหี่ย','สัส','สัด','เย็ด','แตด','ระยำ','จัญไร','ชาติหมา','ส้นตีน','อีดอก','ดอกทอง','กะหรี่','อีกะหรี่','พ่อมึง','แม่มึง','ไอ้สัตว์','อีสัตว์','หน้าหี','หีแม่',
      'fuck','fck','fuk','shit','bitch','cunt','dick','pussy','nigger','nigga','faggot','asshole','whore','slut','porn','sex'
    ]) as w
    where regexp_replace(lower(coalesce(t, '')), '[\s\.\-_\*@#$%!~0-9]', '', 'g') like '%' || w || '%'
  );
$$;

-- ---------- ตรวจความสมเหตุสมผลก่อนบันทึก (กันการแก้ค่ามาโกงแบบหยาบ ๆ) ----------
create or replace function public.lb_validate() returns trigger
language plpgsql as $$
declare r int;
begin
  -- เงื่อนไขขึ้นบอร์ด: ระดับ 70 ขึ้นไป หรือสืบทอดเป็นเทพ
  if new.level < 70 and not new.ascended then raise exception 'ต้องระดับ 70 ขึ้นไป หรือสืบทอดเป็นเทพ'; end if;
  -- ทุก 10 ระดับต้องมีวงแหวน 1 วง (ระดับสูงสุด = (จำนวนวงแหวน + 1) × 10)
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
  new.created_at := now();
  -- กันส่งถล่ม: ทั้งระบบรับไม่เกิน 30 รายการใน 1 นาที
  if (select count(*) from public.leaderboard where created_at > now() - interval '1 minute') >= 30 then
    raise exception 'ระบบยุ่งอยู่ ลองใหม่อีกครู่';
  end if;
  return new;
end;
$$;

drop trigger if exists lb_validate_trg on public.leaderboard;
create trigger lb_validate_trg before insert on public.leaderboard for each row execute function public.lb_validate();

-- ---------- สิทธิ์ (Row Level Security) ----------
alter table public.leaderboard enable row level security;
drop policy if exists "lb read" on public.leaderboard;
drop policy if exists "lb insert" on public.leaderboard;
create policy "lb read" on public.leaderboard for select to anon, authenticated using (true);
create policy "lb insert" on public.leaderboard for insert to anon, authenticated with check (true);
-- ไม่มี policy สำหรับ update / delete → ผู้เล่นแก้หรือลบไม่ได้

grant select, insert on public.leaderboard to anon, authenticated;
revoke update, delete on public.leaderboard from anon, authenticated;
