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
  people text[] not null check (cardinality(people) between 1 and 2),
  title text not null,
  description text not null,
  archive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists survival_streaks (
  id uuid primary key default gen_random_uuid(),
  league text not null check (league in ('premiership', 'championship')),
  person text not null,
  weeks_since_loss integer not null default 0 check (weeks_since_loss >= 0),
  as_of_season text not null,
  as_of_gameweek integer not null check (as_of_gameweek between 0 and 38),
  archive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists survival_streaks_person_key
  on survival_streaks (person) where archive = false;

create table if not exists cups (
  id uuid primary key default gen_random_uuid(),
  season text not null,
  name text not null,
  format text not null check (format in ('knockout', 'two_legs')),
  draw_seed text not null check (draw_seed ~ '^[0-9a-f]{64}$'),
  draw_entrants text[] not null check (cardinality(draw_entrants) = 16),
  round_of_16_gameweek integer not null check (round_of_16_gameweek between 1 and 38),
  quarter_final_gameweek integer not null check (quarter_final_gameweek between 1 and 38),
  semi_final_gameweek integer not null check (semi_final_gameweek between 1 and 38),
  final_gameweek integer not null check (final_gameweek between 1 and 38),
  archive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cups_rounds_in_order check (
    case when format = 'two_legs'
      then quarter_final_gameweek > round_of_16_gameweek + 1
       and semi_final_gameweek > quarter_final_gameweek + 1
       and final_gameweek > semi_final_gameweek + 1
      else quarter_final_gameweek > round_of_16_gameweek
       and semi_final_gameweek > quarter_final_gameweek
       and final_gameweek > semi_final_gameweek
    end
  )
);

create table if not exists cup_ties (
  id uuid primary key default gen_random_uuid(),
  cup_id uuid not null references cups(id) on delete cascade,
  round text not null check (round in ('round_of_16', 'quarter_final', 'semi_final', 'final')),
  position integer not null check (position between 0 and 7),
  person_one text,
  person_two text,
  person_one_leg_one integer,
  person_two_leg_one integer,
  person_one_leg_two integer,
  person_two_leg_two integer,
  winner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cup_ties_slot_unique unique (cup_id, round, position),
  constraint cup_ties_winner_is_a_participant
    check (winner is null or winner = person_one or winner = person_two)
);

create index if not exists cup_ties_cup_id_idx on cup_ties (cup_id);
