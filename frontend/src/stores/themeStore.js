
import { defineStore } from "pinia";

const applyDocumentTheme = (isDark) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", isDark);
  document.body?.setAttribute("data-theme", isDark ? "dark" : "light");
};

export const useThemeStore = defineStore("theme", {
  state: () => ({
    
    isDark: (() => {
      const stored =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("theme")
          : null;
      if (stored) return stored === "dark";
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      return !!prefersDark;
    })(),
  }),

  actions: {
    initTheme() {
      applyDocumentTheme(this.isDark);
    },
    toggleTheme() {
      this.isDark = !this.isDark;
      localStorage.setItem("theme", this.isDark ? "dark" : "light");
      applyDocumentTheme(this.isDark);
    },
   
    setTheme(mode) {
      this.isDark = mode === "dark";
      localStorage.setItem("theme", this.isDark ? "dark" : "light");
      applyDocumentTheme(this.isDark);
    },
  },
});
