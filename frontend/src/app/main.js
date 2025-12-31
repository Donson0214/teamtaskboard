
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import { registerAppProviders } from "./providers/index.js";

import "@/shared/styles/tailwind.css";

const app = createApp(App);
const { authStore } = registerAppProviders(app);

const initApp = async () => {
  await authStore.initFromStorage();
  app.use(router);
  if (typeof window !== "undefined") {
    window.addEventListener("auth:invalid", () => {
      authStore.logout();
      if (router.currentRoute.value?.meta?.requiresAuth) {
        router.push("/");
      }
    });
  }
  app.mount("#app");
};

initApp();
    
