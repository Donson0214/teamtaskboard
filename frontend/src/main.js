
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index.js";
import { useThemeStore } from "./stores/themeStore.js";
import { useAuthStore } from "./stores/authStore.js";
import AppIcon from "./components/common/AppIcon.vue";

import "./assets/tailwind.css";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.component("AppIcon", AppIcon);

const themeStore = useThemeStore(pinia);
themeStore.initTheme();

const authStore = useAuthStore(pinia);

const initApp = async () => {
  await authStore.initFromStorage();
  app.use(router);
  if (typeof window !== "undefined") {
    window.addEventListener("auth:invalid", () => {
      authStore.logout();
      if (router.currentRoute.value?.meta?.requiresAuth) {
        router.push({
          path: "/auth",
          query: { tab: "login" },
        });
      }
    });
  }
  app.mount("#app");
};

initApp();
    
