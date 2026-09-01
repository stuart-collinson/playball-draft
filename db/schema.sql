create table if not exists forfeits (
  id uuid primary key default gen_random_uuid(),
  season text not null,
  gameweek text not null check (gameweek = 'annual' or gameweek ~ '^([1-9]|[12][0-9]|3[0-8])$'),
  league text not null check (league in ('premiership', 'championship')),
  type text not null,
  sub_type text,
  person text not null,
  title text not null,
  description text,
  media_kind text not null check (media_kind in ('photo', 'video')),
  media_path text not null,
  thumb_path text not null,
  media_size_bytes integer not null,
  archive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists luck_of_the_week (
  id uuid primary key default gen_random_uuid(),
  season text not null,
  gameweek text not null check (gameweek = 'annual' or gameweek ~ '^([1-9]|[12][0-9]|3[0-8])$'),
  league text not null check (league in ('premiership', 'championship')),
  person text not null,
  title text not null,
  description text not null,
  archive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
