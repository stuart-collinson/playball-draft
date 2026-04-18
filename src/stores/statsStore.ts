import { create } from "zustand";

export type StatOption =
  | "current-gw"
  | "worst-gw"
  | "best-gw"
  | "best-waivers"
  | "best-waivers-avg"
  | "one-week-wonders"
  | "best-trades"
  | "best-trades-ppg";

type StatsStore = {
  selectedStat: StatOption;
  setSelectedStat: (stat: StatOption) => void;
};

const useStatsStore = create<StatsStore>((set) => ({
  selectedStat: "current-gw",
  setSelectedStat: (selectedStat) => set({ selectedStat }),
}));

export default useStatsStore;
