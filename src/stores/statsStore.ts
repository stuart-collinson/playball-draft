import { create } from "zustand";

export type StatOption =
  | "recent-gw"
  | "worst-gw"
  | "best-gw"
  | "best-waivers"
  | "best-waivers-avg";

type StatsStore = {
  selectedStat: StatOption;
  setSelectedStat: (stat: StatOption) => void;
};

const useStatsStore = create<StatsStore>((set) => ({
  selectedStat: "recent-gw",
  setSelectedStat: (selectedStat) => set({ selectedStat }),
}));

export default useStatsStore;
