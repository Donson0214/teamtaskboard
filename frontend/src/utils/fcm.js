import { firebaseApp } from "@/firebase.js";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

export async function requestFcmToken() {
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  if (typeof Notification === "undefined") return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("Missing VITE_FIREBASE_VAPID_KEY; skipping FCM registration.");
    return null;
  }

  try {
    const messaging = getMessaging(firebaseApp);
    const token = await getToken(messaging, { vapidKey });
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
