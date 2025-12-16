import { defineStore } from "pinia";
import api from "@/api.js";
import { listenForMessages, requestFcmToken } from "@/utils/fcm.js";
import { socket } from "@/socket.js";
import { useAuthStore } from "@/stores/authStore";

/* -------------------- helpers -------------------- */

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
    workspaceId: notification.workspaceId,
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

/**
 * 🔐 FINAL notification filter
 * - assignments → only assignee
 * - mentions → only mentioned email
 * - self actions → ignored
 */
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

  // 1️⃣ Explicit recipient → ONLY that user
  if (recipient) {
    return String(recipient).toLowerCase() === me;
  }

  // 2️⃣ Mention notification → ONLY if my email is mentioned
  if (message.includes("@")) {
    return message.includes(`@${me}`);
  }

  // 3️⃣ Ignore self-triggered notifications
  if (actor && String(actor).toLowerCase() === me) {
    return false;
  }

  // 4️⃣ Default allow
  return true;
};

/* -------------------- store -------------------- */

export const useNotificationStore = defineStore("notifications", {
  state: () => ({
    items: [],
    loading: false,
    tokenStatus: "idle",
    listener: null,
  }),

  getters: {
    unreadCount: (state) => state.items.filter((n) => !n.read).length,
    sorted: (state) =>
      [...state.items].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
  },

  actions: {
    async fetchNotifications() {
      this.loading = true;
      try {
        const res = await api.get("/notifications");
        const list = res.data?.data || res.data || [];
        this.items = list.map((n) => normalizeNotificationItem(n));
      } catch (err) {
        console.error("Load notifications failed:", err);
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
        console.error("Mark notification failed:", err);
      }
    },

    async markAllRead() {
      try {
        await api.put("/notifications/mark/all");
        this.items = this.items.map((n) => ({ ...n, read: true }));
      } catch (err) {
        console.error("Mark all notifications failed:", err);
      }
    },

    async registerDeviceToken() {
      if (
        this.tokenStatus === "pending" ||
        this.tokenStatus === "registered"
      ) {
        return;
      }
      this.tokenStatus = "pending";

      const token = await requestFcmToken();
      if (!token) {
        this.tokenStatus = "skipped";
        return;
      }

      try {
        await api.post("/device-tokens", { token, platform: "web" });
        this.tokenStatus = "registered";
      } catch (err) {
        console.error("Save device token failed:", err);
        this.tokenStatus = "failed";
      }
    },

    startListener() {
      if (this.listener) return;

      const myEmail = getMyEmail();

      try {
        const auth = useAuthStore();
        const email =
          auth.user?.email ||
          auth.user?.user?.email ||
          auth.user?.profile?.email;
        if (email) socket.emit("joinUser", email);
      } catch (err) {
        console.warn("Join user room failed:", err.message);
      }

      /* 🔔 FCM */
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

        this.items = [incoming, ...this.items];
      })
        .then((unsub) => {
          this.listener = unsub;
        })
        .catch(() => {
          this.listener = null;
        });

      /* 🔔 Socket */
      socket.on("notification:new", (notif) => {
        const emailNow = getMyEmail();
        if (!shouldAcceptNotification(notif, emailNow)) return;

        const normalized = normalizeNotificationItem(notif);
        this.items = [normalized, ...this.items];
      });
    },

    stopListener() {
      if (this.listener) {
        this.listener();
        this.listener = null;
      }
      socket.off("notification:new");
    },
  },
});
