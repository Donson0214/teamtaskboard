import { createPinia } from "pinia";
import { useThemeStore } from "@/shared/stores/themeStore.js";
import { useAuthStore } from "@/features/auth/stores/authStore.js";
import AppIcon from "@/shared/components/base/AppIcon.vue";

export const registerAppProviders = (app) => {
  const pinia = createPinia();
  app.use(pinia);
  app.component("AppIcon", AppIcon);

  const themeStore = useThemeStore(pinia);
  themeStore.initTheme();

  const authStore = useAuthStore(pinia);

  return { pinia, authStore };
};
