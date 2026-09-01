type ClubKit = { primary: string; secondary: string }

const CLUB_KITS: Record<string, ClubKit> = {
  ARS: { primary: "#EF0107", secondary: "#FFFFFF" },
  AVL: { primary: "#670E36", secondary: "#95BFE5" },
  BHA: { primary: "#0057B8", secondary: "#FFFFFF" },
  BOU: { primary: "#DA291C", secondary: "#000000" },
  BRE: { primary: "#D20000", secondary: "#FFFFFF" },
  CHE: { primary: "#034694", secondary: "#FFFFFF" },
  COV: { primary: "#78D0F3", secondary: "#0B2D5B" },
  CRY: { primary: "#1B458F", secondary: "#C4122E" },
  EVE: { primary: "#003399", secondary: "#FFFFFF" },
  FUL: { primary: "#FFFFFF", secondary: "#000000" },
  HUL: { primary: "#F5A12D", secondary: "#000000" },
  IPS: { primary: "#0E63AD", secondary: "#FFFFFF" },
  LEE: { primary: "#FFFFFF", secondary: "#1D428A" },
  LIV: { primary: "#C8102E", secondary: "#00B2A9" },
  MCI: { primary: "#6CABDD", secondary: "#1C2C5B" },
  MUN: { primary: "#DA291C", secondary: "#FFFFFF" },
  NEW: { primary: "#241F20", secondary: "#FFFFFF" },
  NFO: { primary: "#DD0000", secondary: "#FFFFFF" },
  SUN: { primary: "#EB172B", secondary: "#FFFFFF" },
  TOT: { primary: "#FFFFFF", secondary: "#132257" },
}

const FALLBACK_CLUB_KIT: ClubKit = { primary: "#D4D4D8", secondary: "#3F3F46" }

export const clubKit = (shortName: string | undefined): ClubKit =>
  CLUB_KITS[shortName ?? ""] ?? FALLBACK_CLUB_KIT
