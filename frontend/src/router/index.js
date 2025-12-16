// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

import LandingPage from "@/views/LandingPage.vue";
import AuthScreen from "@/components/auth/AuthScreen.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import WorkspacesView from "@/views/WorkspacesView.vue";
import BoardView from "@/views/BoardView.vue";
import TaskView from "@/views/TaskView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: LandingPage },
    {
      path: "/auth",
      component: AuthScreen,
      props: (route) => ({ startTab: route.query.tab || "login" }),
    },
    { path: "/login", component: LoginView },
    { path: "/register", component: RegisterView },
    {
      path: "/workspace",
      component: WorkspacesView,
      meta: { requiresAuth: true },
    },
    {
      path: "/workspace/:workspaceId",
      name: "BoardView",
      component: BoardView,
      meta: { requiresAuth: true },
    },
    {
      path: "/workspace/:workspaceId/board/:boardId",
      name: "TaskView",
      component: TaskView,
      meta: { requiresAuth: true },
    },
    // Legacy plural path support
    {
      path: "/workspaces/:workspaceId/board/:boardId",
      redirect: (to) => ({
        name: "TaskView",
        params: {
          workspaceId: to.params.workspaceId,
          boardId: to.params.boardId,
        },
      }),
    },
  ],
});


router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (!auth.user) {
    auth.initFromStorage();
  }

  const isAuthPage =
    to.path === "/login" || to.path === "/register" || to.path === "/auth";

  if (
    isAuthPage &&
    auth.isAuthenticated
  ) {
    return next("/workspace");
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({
      path: "/auth",
      query: { tab: "login", redirect: to.fullPath },
    });
  }

  next();
});

export default router;
