
import { io } from "socket.io-client";

const normalizeBaseUrl = (value) =>
  (value || "").replace(/\/api\/?$/, "").replace(/\/$/, "");

const defaultApiUrl = "http://localhost:5000";
const apiUrl = normalizeBaseUrl(
  import.meta.env.VITE_API_URL || defaultApiUrl
);
const socketUrl = normalizeBaseUrl(import.meta.env.VITE_SOCKET_URL || apiUrl);

export const socket = io(socketUrl, {
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: false,
  timeout: 20000,
});

let authToken = null;
let connecting = false;
let connectPromise = null;
let retryCount = 0;
let retryTimer = null;
let coreListenersBound = false;

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 800;
const MAX_DELAY_MS = 30000;

const resetRetry = () => {
  retryCount = 0;
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
};

const scheduleReconnect = () => {
  if (!authToken) return;
  if (retryCount >= MAX_RETRIES) return;

  const delay = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * Math.pow(2, retryCount));
  retryCount += 1;

  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = setTimeout(() => {
    connectSocket();
  }, delay);
};

const bindCoreListeners = () => {
  if (coreListenersBound) return;
  coreListenersBound = true;

  socket.on("connect", () => {
    resetRetry();
  });

  socket.on("disconnect", (reason) => {
    if (reason !== "io client disconnect") {
      scheduleReconnect();
    }
  });

  socket.on("connect_error", () => {
    scheduleReconnect();
  });
};

export const setSocketAuthToken = (token) => {
  authToken = token || null;
  socket.auth = authToken ? { token: authToken } : {};

  if (!authToken) {
    disconnectSocket();
  }
};

export const connectSocket = () => {
  if (!authToken) {
    return Promise.resolve(false);
  }

  if (socket.connected) {
    return Promise.resolve(true);
  }

  if (connecting && connectPromise) {
    return connectPromise;
  }

  bindCoreListeners();
  connecting = true;

  connectPromise = new Promise((resolve) => {
    const onConnect = () => {
      cleanup();
      connecting = false;
      resolve(true);
    };

    const onError = () => {
      cleanup();
      connecting = false;
      resolve(false);
    };

    const cleanup = () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
      socket.off("connect_timeout", onError);
    };

    socket.once("connect", onConnect);
    socket.once("connect_error", onError);
    socket.once("connect_timeout", onError);
    socket.connect();
  });

  return connectPromise;
};

export const disconnectSocket = () => {
  resetRetry();
  connecting = false;
  connectPromise = null;
  if (socket.connected || socket.active) {
    socket.disconnect();
  }
};

export const ensureSocket = async () => {
  if (socket.connected) return true;
  return connectSocket();
};
