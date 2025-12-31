// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { applyAuthGuards } from "./guards";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

applyAuthGuards(router);

export default router;
