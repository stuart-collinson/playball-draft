import { create } from "zustand";

export type StatOption =
  | "worst-gw"
  | "best-gw"
  | "best-waivers"
  | "best-waivers-avg";

type StatsStore = {
  selectedStat: StatOption;
  setSelectedStat: (stat: StatOption) => void;
};

const useStatsStore = create<StatsStore>((set) => ({
  selectedStat: "worst-gw",
  setSelectedStat: (selectedStat) => set({ selectedStat }),
}));

export default useStatsStore;
