
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index.js";
import { useThemeStore } from "./stores/themeStore.js";
import { useAuthStore } from "./stores/authStore.js";

import "./assets/tailwind.css";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const themeStore = useThemeStore(pinia);
themeStore.initTheme();

const authStore = useAuthStore(pinia);

const initApp = async () => {
  authStore.initFromStorage();
  app.use(router);
  app.mount("#app");
};

initApp();
    
