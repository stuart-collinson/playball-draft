// ─── League Details  (/api/league/{id}/details) ──────────────────────────────

export type LeagueInfo = {
  admin_entry: number;
  closed: boolean;
  draft_dt: string;
  draft_pick_time_limit: number;
  draft_status: string;
  draft_tz_show: string;
  id: number;
  ko_rounds: number;
  make_code_public: boolean;
  max_entries: number;
  min_entries: number;
  name: string;
  scoring: string;
  start_event: number;
  stop_event: number;
  trades: string;
  transaction_mode: string;
  variety: string;
  drafts: LeagueDraft[];
  is_renewed: boolean;
};

export type LeagueDraft = {
  id: number;
  draft_started: boolean;
  draft_completed: string;
  draft_dt: string;
  event: number;
  league: number;
  order_method: string;
};

export type LeagueEntry = {
  entry_id: number;
  entry_name: string;
  id: number;
  joined_time: string;
  player_first_name: string;
  player_last_name: string;
  short_name: string;
  waiver_pick: number;
};

export type Standing = {
  event_total: number;
  last_rank: number;
  league_entry: number;
  rank: number;
  rank_sort: number;
  total: number;
};

export type LeagueDetailsResponse = {
  league: LeagueInfo;
  league_entries: LeagueEntry[];
  standings: Standing[];
};

// ─── Draft Choices  (/api/draft/{id}/choices) ────────────────────────────────

export type DraftChoice = {
  choice_time: string;
  element: number;
  entry: number;
  entry_name: string;
  id: number;
  index: number;
  draft: number;
  league: number;
  pick: number;
  player_first_name: string;
  player_last_name: string;
  round: number;
  seconds_to_pick: number | null;
  was_auto: boolean;
};

export type ElementStatus = {
  element: number;
  in_accepted_trade: boolean;
  owner: number | null;
  status: string;
};

export type DraftChoicesResponse = {
  choices: DraftChoice[];
  idle: unknown[];
  element_status: ElementStatus[];
};

// ─── Transactions  (/api/draft/league/{id}/transactions) ─────────────────────

export type Transaction = {
  added: string;
  element_in: number;
  element_out: number;
  entry: number;
  event: number;
  id: number;
  index: null;
  kind: "f" | "w" | string;
  priority: null;
  result: string;
  note: string | null;
};

export type TransactionsResponse = {
  transactions: Transaction[];
};

// ─── Entry History  (/api/entry/{id}/history) ────────────────────────────────

export type EntryHistoryEvent = {
  entry: number;
  event: number;
  points: number;
  total_points: number;
  rank: number;
  rank_sort: number;
};

export type EntryHistoryResponse = {
  history: EntryHistoryEvent[];
};

// ─── Entry Event Picks  (/api/entry/{id}/event/{event}) ──────────────────────

export type EntryEventPick = {
  element: number;
  position: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  multiplier: number;
};

export type EntryEventPicksResponse = {
  picks: EntryEventPick[];
  entry_history: EntryHistoryEvent;
};

// ─── Bootstrap Static  (/api/bootstrap-static/) ──────────────────────────────

export type FplTeam = {
  code: number;
  draw: number;
  form: string | null;
  id: number;
  loss: number;
  name: string;
  played: number;
  points: number;
  position: number;
  short_name: string;
  strength: number;
  team_division: null;
  unavailable: boolean;
  win: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
  pulse_id: number;
};

export type FplEvent = {
  id: number;
  name: string;
  deadline_time: string;
  release_time: string | null;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number;
  deadline_time_epoch: number;
  deadline_time_game_offset: number;
  highest_score: number;
  is_previous: boolean;
  is_current: boolean;
  is_next: boolean;
  cup_leagues_created: boolean;
  h2h_ko_matches_created: boolean;
  can_enter: boolean;
  can_manage: boolean;
  released: boolean;
  ranked_count: number;
  overrides: {
    rules: Record<string, unknown>;
    scoring: Record<string, unknown>;
    element_types: unknown[];
    pick_multiplier: null;
  };
  chip_plays: Array<{ chip_name: string; num_played: number }>;
  most_selected: number;
  most_transferred_in: number;
  top_element: number;
  top_element_info: { id: number; points: number };
  transfers_made: number;
  most_captained: number;
  most_vice_captained: number;
};

export type FplElement = {
  can_transact: boolean;
  can_select: boolean;
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  code: number;
  cost_change_event: number;
  cost_change_event_fall: number;
  cost_change_start: number;
  cost_change_start_fall: number;
  price_change_percent: string;
  dreamteam_count: number;
  element_type: number;
  ep_next: string | null;
  ep_this: string | null;
  event_points: number;
  first_name: string;
  form: string;
  id: number;
  in_dreamteam: boolean;
  news: string;
  news_added: string | null;
  now_cost: number;
  photo: string;
  points_per_game: string;
  removed: boolean;
  second_name: string;
  selected_by_percent: string;
  special: boolean;
  squad_number: number | null;
  status: string;
  team: number;
  team_code: number;
  total_points: number;
  transfers_in: number;
  transfers_in_event: number;
  transfers_out: number;
  transfers_out_event: number;
  value_form: string;
  value_season: string;
  web_name: string;
  known_name: string;
  region: number | null;
  team_join_date: string | null;
  birth_date: string | null;
  has_temporary_code: boolean;
  opta_code: string | null;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  clearances_blocks_interceptions: number;
  recoveries: number;
  tackles: number;
  defensive_contribution: number;
  starts: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  corners_and_indirect_freekicks_order: string | null;
  corners_and_indirect_freekicks_text: string;
  direct_freekicks_order: string | null;
  direct_freekicks_text: string;
  penalties_order: string | null;
  penalties_text: string;
  scout_risks: unknown[];
  scout_news_link: string;
  influence_rank: number;
  influence_rank_type: number;
  creativity_rank: number;
  creativity_rank_type: number;
  threat_rank: number;
  threat_rank_type: number;
  ict_index_rank: number;
  ict_index_rank_type: number;
  expected_goals_per_90: number;
  saves_per_90: number;
  expected_assists_per_90: number;
  expected_goal_involvements_per_90: number;
  expected_goals_conceded_per_90: number;
  goals_conceded_per_90: number;
  now_cost_rank: number;
  now_cost_rank_type: number;
  form_rank: number;
  form_rank_type: number;
  points_per_game_rank: number;
  points_per_game_rank_type: number;
  selected_rank: number;
  selected_rank_type: number;
  starts_per_90: number;
  clean_sheets_per_90: number;
  defensive_contribution_per_90: number;
};

export type FplElementType = {
  id: number;
  plural_name: string;
  plural_name_short: string;
  singular_name: string;
  singular_name_short: string;
  squad_select: number;
  squad_min_select: number;
  squad_max_select: number;
  squad_min_play: number;
  squad_max_play: number;
  ui_shirt_specific: boolean;
  sub_positions_locked: boolean;
  element_count: number;
};

export type BootstrapStaticResponse = {
  elements: FplElement[];
  teams: FplTeam[];
  events: { current: number; next: number; data: FplEvent[] };
  element_types: FplElementType[];
  total_players: number;
};
