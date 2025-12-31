import { defineStore } from "pinia";
import api, { API_ERROR_CODES, getApiErrorCode, shouldSuppressApiError } from "@/shared/api/client.js";
import { ensureSocket, socket } from "@/shared/config/socket.js";
import { useAuthStore } from "@/features/auth/stores/authStore";

let fcmModulePromise = null;

const loadFcmModule = async () => {
  if (!fcmModulePromise) {
    fcmModulePromise = import("@/shared/utils/fcm.js").catch((err) => {
      fcmModulePromise = null;
      throw err;
    });
  }
  return fcmModulePromise;
};

const makeNotificationId = (notification = {}) => {
  if (notification.id) return notification.id;
  if (notification._id) return notification._id;
  return globalThis.crypto?.randomUUID?.() || Date.now().toString();
};

const normalizeNotificationItem = (notification = {}, options = {}) => {
  const persisted = options.persisted ?? notification.persisted ?? true;

  return {
    id: options.id || makeNotificationId(notification),
    message: notification.message || "",
    task: notification.task,
    taskId: notification.taskId || notification.task?.id,
    workspaceId: notification.workspaceId,
    actorEmail: notification.actorEmail || notification.actor?.email || null,
    actorId: notification.actorId || null,
    read: typeof notification.read === "boolean" ? notification.read : false,
    createdAt: notification.createdAt || new Date().toISOString(),
    persisted,
  };
};

const getMyEmail = () => {
  try {
    const auth = useAuthStore();
    return (
      auth.user?.email ||
      auth.user?.user?.email ||
      auth.user?.profile?.email ||
      ""
    ).toLowerCase();
  } catch {
    return "";
  }
};

const shouldAcceptNotification = (rawNotif = {}, myEmail = "") => {
  if (!myEmail) return true;

  const me = myEmail.toLowerCase();
  const message = String(rawNotif.message || "").toLowerCase();

  const recipient =
    rawNotif.recipientEmail ||
    rawNotif.to ||
    rawNotif.userEmail ||
    rawNotif.email ||
    rawNotif.receiverEmail ||
    rawNotif.targetEmail;

  const actor =
    rawNotif.actorEmail ||
    rawNotif.actor ||
    rawNotif.from ||
    rawNotif.senderEmail ||
    rawNotif.createdBy ||
    rawNotif.authorEmail;

  const recipientEmail = recipient ? String(recipient).toLowerCase() : null;
  const actorEmail = actor ? String(actor).toLowerCase() : null;

  // If the actor and recipient are the same user, skip (no self-notifications).
  if (recipientEmail && actorEmail && recipientEmail === actorEmail) {
    return false;
  }

  // If notification explicitly targets someone else, ignore.
  if (recipientEmail && recipientEmail !== me) {
    return false;
  }

  // If an actor exists and it is me while the notification has no target, ignore self-actions.
  if (!recipientEmail && actorEmail && actorEmail === me) {
    return false;
  }

  // Explicit workspace leave/assign rules can provide an array of targets.
  if (Array.isArray(rawNotif.targets)) {
    const targets = rawNotif.targets.map((t) => String(t || "").toLowerCase());
    if (targets.length && !targets.includes(me)) return false;
  }

  if (recipient) {
    return recipientEmail === me;
  }


  if (message.includes("@")) {
    return message.includes(`@${me}`);
  }


  if (actor && String(actor).toLowerCase() === me) {
    return false;
  }


  return true;
};



export const useNotificationStore = defineStore("notifications", {
  state: () => ({
    items: [],
    loading: false,
    tokenStatus: "idle",
    listener: null,
    listenerActive: false,
    socketBound: false,
    lastFetchFailedAt: 0,
    fetchCooldownMs: 20000,
    tokenLastAttemptAt: 0,
    tokenCooldownMs: 300000,
  }),

  getters: {
    unreadCount: (state) => state.items.filter((n) => !n.read).length,
    sorted: (state) =>
      [...state.items].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
  },

  actions: {
    upsertNotification(notif) {
      if (!notif?.id) return;

      // De-dupe by message + task to avoid double inserts from socket + fetch/FCM
      const taskKey = notif.task?.id || notif.taskId || null;
      const existingSame = this.items.find(
        (n) =>
          (n.task?.id || n.taskId || null) === taskKey &&
          n.message === notif.message
      );

      const targetId = existingSame?.id || notif.id;
      const merged = existingSame
        ? { ...existingSame, ...notif, id: targetId }
        : { ...notif, id: targetId };

      const idxByTarget = this.items.findIndex((n) => n.id === targetId);

      if (idxByTarget >= 0) {
        this.items.splice(idxByTarget, 1, merged);
      } else {
        this.items = [merged, ...this.items];
      }
    },

    async fetchNotifications() {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) {
        this.items = [];
        this.loading = false;
        return this.items;
      }
      if (this.loading) return this.items;

      const now = Date.now();
      if (
        this.lastFetchFailedAt &&
        now - this.lastFetchFailedAt < this.fetchCooldownMs
      ) {
        return this.items;
      }

      this.loading = true;
      try {
        const res = await api.get("/notifications");
        const list = res.data?.data || res.data || [];
        const normalized = list.map((n) => normalizeNotificationItem(n));
        const seen = new Set();
        this.items = normalized.filter((n) => {
          if (seen.has(n.id)) return false;
          seen.add(n.id);
          return true;
        });
      } catch (err) {
        const code = getApiErrorCode(err);
        if (!shouldSuppressApiError(err)) {
          console.warn("Load notifications failed:", code || err?.message || err);
        }
        if (code === API_ERROR_CODES.SERVER || code === API_ERROR_CODES.NETWORK) {
          this.lastFetchFailedAt = Date.now();
        }
      } finally {
        this.loading = false;
      }
    },

    async markRead(id, read = true) {
      const existing = this.items.find((n) => n.id === id);
      if (existing && existing.persisted === false) {
        this.items = this.items.map((n) =>
          n.id === id ? { ...n, read } : n
        );
        return;
      }

      try {
        await api.put(`/notifications/${id}`, { read });
        this.items = this.items.map((n) =>
          n.id === id ? { ...n, read } : n
        );
      } catch (err) {
        if (!shouldSuppressApiError(err)) {
          console.warn("Mark notification failed:", err?.message || err);
        }
      }
    },

    async markAllRead() {
      try {
        await api.put("/notifications/mark/all");
        this.items = this.items.map((n) => ({ ...n, read: true }));
      } catch (err) {
        if (!shouldSuppressApiError(err)) {
          console.warn("Mark all notifications failed:", err?.message || err);
        }
      }
    },

    async removeNotification(id) {
      try {
        await api.delete(`/notifications/${id}`);
        this.items = this.items.filter((n) => n.id !== id);
        return true;
      } catch (err) {
        if (!shouldSuppressApiError(err)) {
          console.warn("Delete notification failed:", err?.message || err);
        }
        return false;
      }
    },

    async registerDeviceToken(options = {}) {
      const { userInitiated = false } = options;
      const auth = useAuthStore();
      if (!auth.isAuthenticated) {
        this.tokenStatus = "skipped";
        return;
      }
      if (
        this.tokenStatus === "pending" ||
        this.tokenStatus === "registered"
      ) {
        return;
      }
      if (
        this.tokenStatus === "failed" &&
        Date.now() - this.tokenLastAttemptAt < this.tokenCooldownMs
      ) {
        return;
      }
      this.tokenStatus = "pending";
      this.tokenLastAttemptAt = Date.now();

      let token = null;
      let requestFcmToken;
      try {
        ({ requestFcmToken } = await loadFcmModule());
      } catch (err) {
        if (!shouldSuppressApiError(err)) {
          console.warn("Load FCM module failed:", err?.message || err);
        }
        this.tokenStatus = "failed";
        return;
      }

      try {
        token = await requestFcmToken({ requestPermission: userInitiated });
      } catch (err) {
        if (!shouldSuppressApiError(err)) {
          console.warn("Request FCM token failed:", err?.message || err);
        }
        this.tokenStatus = "failed";
        return;
      }

      if (!token) {
        this.tokenStatus = "skipped";
        return;
      }

      try {
        await api.post("/device-tokens", { token, platform: "web" });
        this.tokenStatus = "registered";
      } catch (err) {
        const code = getApiErrorCode(err);
        if (!shouldSuppressApiError(err)) {
          console.warn("Save device token failed:", code || err?.message || err);
        }
        if (code === API_ERROR_CODES.SERVER || code === API_ERROR_CODES.NETWORK) {
          this.tokenLastAttemptAt = Date.now();
        }
        this.tokenStatus = "failed";
      }
    },

    async startListener() {
      if (this.listenerActive || this.socketBound) return;

      const auth = useAuthStore();
      if (!auth.isAuthenticated) return;
      this.listenerActive = true;

      const myEmail = getMyEmail();

      try {
        const connected = await ensureSocket();
        if (connected) {
          const email =
            auth.user?.email ||
            auth.user?.user?.email ||
            auth.user?.profile?.email;
          if (email) socket.emit("joinUser", email);
        }
      } catch (err) {
        if (!shouldSuppressApiError(err)) {
          console.warn("Join user room failed:", err?.message || err);
        }
      }

      /* 🔔 FCM */
      let listenForMessages;
      try {
        ({ listenForMessages } = await loadFcmModule());
      } catch (err) {
        if (!shouldSuppressApiError(err)) {
          console.warn("Load FCM listener failed:", err?.message || err);
        }
      }

      if (listenForMessages) {
        listenForMessages((payload) => {
          const message =
            payload?.notification?.body ||
            payload?.data?.body ||
            payload?.data?.message;

          if (!message) return;

          const raw = {
            message,
            recipientEmail: payload?.data?.recipientEmail,
            actorEmail: payload?.data?.actorEmail,
            task: payload?.data?.taskId
              ? { id: payload.data.taskId }
              : undefined,
            workspaceId: payload?.data?.workspaceId,
          };

          if (!shouldAcceptNotification(raw, myEmail)) return;

          const notificationId = payload?.data?.notificationId;
          const persisted = Boolean(notificationId);

          const incoming = normalizeNotificationItem(
            {
              id: notificationId,
              message,
              task: raw.task,
              workspaceId: raw.workspaceId,
              createdAt: new Date().toISOString(),
            },
            { persisted }
          );

          this.upsertNotification(incoming);
        })
          .then((unsub) => {
            this.listener = typeof unsub === "function" ? unsub : null;
          })
          .catch(() => {
            this.listener = null;
          });
      } else {
        this.listener = null;
      }

      socket.on("notification:new", (notif) => {
        const emailNow = getMyEmail();
        if (!shouldAcceptNotification(notif, emailNow)) return;

        const normalized = normalizeNotificationItem(notif);
        this.upsertNotification(normalized);
      });
      this.socketBound = true;
    },

    stopListener() {
      if (this.listener) {
        this.listener();
        this.listener = null;
      }
      this.listenerActive = false;
      this.socketBound = false;
      socket.off("notification:new");
    },
  },
});

