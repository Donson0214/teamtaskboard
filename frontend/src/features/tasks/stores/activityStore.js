import { defineStore } from "pinia";


const DEFAULT_ICON = "fa-bell";
const DEFAULT_BADGE = "bg-gradient-to-br from-purple-500 to-indigo-500";
const DEFAULT_STATUS = "bg-purple-400";

const toIsoString = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
};


const ACTIVITY_MAP = {
  "created task": {
    icon: "fa-plus",
    format: (e) => `${e.user} created task ${e.target}`,
  },
  "moved task": {
    icon: "fa-arrows-left-right",
    format: (e) => `${e.user} moved task ${e.target}`,
  },
  "mentioned in": {
    icon: "fa-at",
    format: (e) => `${e.user} mentioned in ${e.target}`,
  },
};

/* -------------------- store -------------------- */

export const useActivityStore = defineStore("activity", {
  state: () => ({
    events: [],
    seenIds: new Set(),
  }),

  actions: {
    push(entry = {}) {
      const id =
        entry.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      if (this.seenIds.has(id)) return;

      const actionKey = (entry.action || "").toLowerCase();

  
      if (!ACTIVITY_MAP[actionKey]) return;

      const formatter = ACTIVITY_MAP[actionKey];

      const normalized = {
        id,
        user: entry.user || "Someone",
        action: actionKey,
        target: entry.target || "",
        icon: entry.icon || formatter.icon || DEFAULT_ICON,
        badgeBg: entry.badgeBg || DEFAULT_BADGE,
        statusDot: entry.statusDot || DEFAULT_STATUS,
        createdAt: toIsoString(entry.createdAt),
      };

      normalized.message = formatter.format(normalized);

      this.seenIds.add(id);
      this.events = [normalized, ...this.events].slice(0, 50);
    },

    hydrate(entries = [], defaults = {}) {
      entries.forEach((entry) => {
        this.push({
          id: entry.id,
          user: entry.actor || entry.user || defaults.user,
          action: entry.action || entry.details || "",
          target: entry.target || entry.entity || "",
          createdAt: entry.createdAt,
          icon: defaults.icon,
          badgeBg: defaults.badgeBg,
          statusDot: defaults.statusDot,
        });
      });
    },

    clear() {
      this.events = [];
      this.seenIds = new Set();
    },
  },
});
