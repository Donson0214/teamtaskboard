
import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const fallbackSocketUrl = (() => {
  try {
    const parsed = new URL(apiUrl);
    const protocol = parsed.protocol === "https:" ? "wss" : "ws";
    const host = parsed.hostname;
    const port = parsed.port ? `:${parsed.port}` : "";
    return `${protocol}://${host}${port}`;
  } catch {
    return apiUrl.startsWith("https") ? apiUrl.replace(/^https?:/, "wss:") : apiUrl.replace(/^https?:/, "ws:");
  }
})();

const socketUrl = import.meta.env.VITE_SOCKET_URL || fallbackSocketUrl;

export const socket = io(socketUrl, {
  transports: ["websocket"],
});
