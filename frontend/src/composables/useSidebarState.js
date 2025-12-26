import { ref, watch } from "vue";

const SIDEBAR_STORAGE_KEY = "taskflow.sidebarOpen";

const readSidebarState = () => {
  if (typeof window === "undefined") return true;
  try {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === "0" || stored === "false") return false;
    if (stored === "1" || stored === "true") return true;
  } catch (_) {}
  return true;
};

export const useSidebarState = () => {
  const sidebarOpen = ref(readSidebarState());

  watch(sidebarOpen, (value) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, value ? "1" : "0");
    } catch (_) {}
  });

  return { sidebarOpen };
};
