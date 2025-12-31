import axios from "axios";

const API_ERROR_CODES = {
  AUTH_MISSING: "AUTH_MISSING",
  AUTH_INVALID: "AUTH_INVALID",
  BACKOFF: "API_BACKOFF",
  NOT_FOUND: "API_NOT_FOUND",
  SERVER: "API_SERVER",
  NETWORK: "API_NETWORK",
};

const envApiUrl = import.meta.env.VITE_API_URL;
const browserOrigin =
  typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "";

const normalizedApiHost = (envApiUrl || browserOrigin || "http://localhost:5000")
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

const api = axios.create({
  baseURL: `${normalizedApiHost}/api`,
});

let authReady = false;
let authReadyResolve;
let authToken = null;
let authLocked = false;
let backoffUntil = 0;
const BACKOFF_MS = 15000;
const authReadyPromise = new Promise((resolve) => {
  authReadyResolve = resolve;
});

const getToken = () => authToken || localStorage.getItem("token");
const isBackoffActive = () => backoffUntil && Date.now() < backoffUntil;

const blockRequests = (ms = BACKOFF_MS) => {
  backoffUntil = Date.now() + ms;
};

export const setAuthReady = (ready = true) => {
  authReady = ready;
  if (ready && authReadyResolve) {
    authReadyResolve();
    authReadyResolve = null;
  }
};

export const setAuthToken = (token) => {
  authToken = token || null;
  authLocked = false;
};

export const getApiErrorCode = (error) => {
  if (!error) return null;
  if (error.code) return error.code;
  const status = error.response?.status;
  if (status === 401 || status === 403) return API_ERROR_CODES.AUTH_INVALID;
  if (status === 404) return API_ERROR_CODES.NOT_FOUND;
  if (status >= 500) return API_ERROR_CODES.SERVER;
  if (!error.response) return API_ERROR_CODES.NETWORK;
  return null;
};

export const shouldSuppressApiError = (error) => {
  const code = getApiErrorCode(error);
  return (
    code === API_ERROR_CODES.AUTH_MISSING ||
    code === API_ERROR_CODES.AUTH_INVALID ||
    code === API_ERROR_CODES.BACKOFF
  );
};

api.interceptors.request.use(async (config) => {
  if (!authReady) {
    await authReadyPromise;
  }

  if (isBackoffActive()) {
    const err = new Error("API temporarily unavailable");
    err.code = API_ERROR_CODES.BACKOFF;
    err.retryAt = backoffUntil;
    return Promise.reject(err);
  }

  if (authLocked) {
    const err = new Error("Authentication required");
    err.code = API_ERROR_CODES.AUTH_INVALID;
    return Promise.reject(err);
  }

  const token = getToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

  const err = new Error("Authentication token missing");
  err.code = API_ERROR_CODES.AUTH_MISSING;
  return Promise.reject(err);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      authLocked = true;
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(new CustomEvent("auth:invalid"));
      }
      if (!error.code) error.code = API_ERROR_CODES.AUTH_INVALID;
    } else if (status === 404) {
      if (!error.code) error.code = API_ERROR_CODES.NOT_FOUND;
    } else if (status >= 500) {
      blockRequests();
      if (!error.code) error.code = API_ERROR_CODES.SERVER;
    } else if (!error.response) {
      blockRequests();
      if (!error.code) error.code = API_ERROR_CODES.NETWORK;
    }

    error.apiStatus = status || null;
    return Promise.reject(error);
  }
);

export { API_ERROR_CODES };
export default api;
