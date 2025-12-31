import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    isDark:
      localStorage.getItem("theme") === "dark" ? true : false,
    sidebarOpen: true,
  }),

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark;
      localStorage.setItem("theme", this.isDark ? "dark" : "light");
    },
    setTheme(isDark) {
      this.isDark = isDark;
      localStorage.setItem("theme", isDark ? "dark" : "light");
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
  },
});
