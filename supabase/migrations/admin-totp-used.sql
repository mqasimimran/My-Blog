-- Remembers which 2FA codes have already been used, so a code can't be
-- reused (replayed) to log in a second time. `step` is the 30-second time
-- window the code belongs to; the PRIMARY KEY makes "claim this code" a
-- single atomic operation — the database itself refuses a second claim,
-- even if two logins arrive at the same instant.
-- Written only by your server (service-role key); private to everyone else.
create table if not exists admin_totp_used (
  step bigint primary key,
  used_at timestamptz not null default now()
);
alter table admin_totp_used enable row level security;
revoke all on admin_totp_used from anon, authenticated;
