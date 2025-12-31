export const routes = [
  { path: "/", component: () => import("@/features/marketing/pages/LandingPage.vue") },
  {
    path: "/auth",
    component: () => import("@/features/auth/components/AuthScreen.vue"),
    props: (route) => ({ startTab: route.query.tab || "login" }),
  },
  { path: "/login", component: () => import("@/features/auth/pages/LoginView.vue") },
  { path: "/register", component: () => import("@/features/auth/pages/RegisterView.vue") },
  {
    path: "/workspace",
    component: () => import("@/features/workspaces/pages/WorkspacesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard",
    name: "DashboardView",
    component: () => import("@/features/dashboard/pages/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/workspace/:workspaceId",
    name: "BoardView",
    component: () => import("@/features/boards/pages/BoardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/workspace/:workspaceId/board/:boardId",
    name: "TaskView",
    component: () => import("@/features/tasks/pages/TaskView.vue"),
    meta: { requiresAuth: true },
  },

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
];
