import { create } from "zustand"

type SidebarState = "open" | "closed"

type UIStore = {
  sidebar: SidebarState
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebar: "closed",
  openSidebar: () => set({ sidebar: "open" }),
  closeSidebar: () => set({ sidebar: "closed" }),
  toggleSidebar: () =>
    set((state) => ({ sidebar: state.sidebar === "open" ? "closed" : "open" })),
}))
