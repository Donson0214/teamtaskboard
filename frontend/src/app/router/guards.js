import { useAuthStore } from "@/features/auth/stores/authStore";

export const applyAuthGuards = (router) => {
  router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore();

    if (!auth.isReady) {
      await auth.initFromStorage();
    }

    const isAuthPage =
      to.path === "/login" || to.path === "/register" || to.path === "/auth";

    if (isAuthPage && auth.isAuthenticated) {
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
};
