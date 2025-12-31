import { firebaseApp, firebaseConfig } from "@/shared/config/firebase.js";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const REQUIRED_CONFIG_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "messagingSenderId",
  "appId",
];

const getMissingConfigKeys = () =>
  REQUIRED_CONFIG_KEYS.filter((key) => !firebaseConfig?.[key]);

let swRegistrationPromise = null;

const buildMessagingSwUrl = () => {
  const params = new URLSearchParams();
  Object.entries(firebaseConfig || {}).forEach(([key, value]) => {
    if (!value) return;
    params.set(key, value);
  });
  const query = params.toString();
  return query ? `/firebase-messaging-sw.js?${query}` : "/firebase-messaging-sw.js";
};

const ensureMessagingServiceWorker = async () => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  if (!swRegistrationPromise) {
    const swUrl = buildMessagingSwUrl();
    swRegistrationPromise = navigator.serviceWorker
      .register(swUrl)
      .catch((err) => {
        console.warn("FCM service worker registration failed:", err?.message || err);
        return null;
      });
  }
  return swRegistrationPromise;
};

export async function requestFcmToken(options = {}) {
  const { requestPermission = false } = options;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  if (typeof Notification === "undefined") return null;

  const currentPermission = Notification.permission;
  if (currentPermission === "denied") return null;
  if (currentPermission !== "granted") {
    if (!requestPermission) return null;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("Missing VITE_FIREBASE_VAPID_KEY; skipping FCM registration.");
    return null;
  }
  const missingKeys = getMissingConfigKeys();
  if (missingKeys.length) {
    console.warn(
      `Missing Firebase config values for FCM: ${missingKeys.join(", ")}`
    );
    return null;
  }

  try {
    const messaging = getMessaging(firebaseApp);
    const serviceWorkerRegistration = await ensureMessagingServiceWorker();
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: serviceWorkerRegistration || undefined,
    });
    return token || null;
  } catch (err) {
    console.warn("FCM token fetch failed:", err.message);
    return null;
  }
}

export async function listenForMessages(handler) {
  const supported = await isSupported().catch(() => false);
  if (!supported) return () => {};

  const messaging = getMessaging(firebaseApp);
  const unsubscribe = onMessage(messaging, (payload) => {
    handler?.(payload);
  });

  return unsubscribe;
}

