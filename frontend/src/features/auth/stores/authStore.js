import { defineStore } from "pinia";
import { auth, provider } from "@/shared/config/firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  signOut,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { setAuthReady, setAuthToken } from "@/shared/api/client.js";
import { disconnectSocket, setSocketAuthToken } from "@/shared/config/socket.js";


function mapAuthError(err) {
  const code = err?.code || "";
  const messages = {
    "auth/invalid-credential": "Invalid email or password.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/email-already-in-use": "That email is already registered.",
    "auth/missing-password": "Password is required.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "Account not found. Please register first.",
  };
  return messages[code] || err?.message || "Something went wrong. Please try again.";
}

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    email: user.email,
    name: user.displayName || user.name || null,
    photoURL: user.photoURL || user.imageUrl || null,
  };
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    ready: false,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
    isReady: (s) => s.ready,
    userInitials: (s) => {
      const source = s.user?.name || s.user?.email || "";
      if (!source) return "";
      const parts = source.split(/[\s@._-]+/).filter(Boolean);
      const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || "");
      return initials.join("");
    },
  },

  actions: {
    
    async register(name, email, password) {
      try {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(userCred.user, { displayName: name });

        await sendEmailVerification(userCred.user);

        
        await signOut(auth);
        this.user = null;
        this.token = null;
        this.ready = true;
        setAuthToken(null);
        setSocketAuthToken(null);
        setAuthReady(true);

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        return {
          ok: true,
          message: "Verification email sent. Check your inbox, confirm, then sign in.",
        };
      } catch (err) {
        console.warn("Register error:", err);
        return {
          ok: false,
          message: mapAuthError(err),
        };
      }
    },

    
    async login(email, password) {
      try {
        const userCred = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        
        if (!userCred.user.emailVerified) {
          try {
            await sendEmailVerification(userCred.user);
          } catch (sendErr) {
            console.warn("Verification email send error:", sendErr);
          }
          await signOut(auth);
          return {
            ok: false,
            needsVerification: true,
            message: "Please verify your email. We just sent you a new verification link.",
          };
        }

        const token = await userCred.user.getIdToken();

        this.user = normalizeUser(userCred.user);
        this.token = token;
        this.ready = true;
        setAuthToken(token);
        setSocketAuthToken(token);
        setAuthReady(true);

        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("token", token);

        return { ok: true };
      } catch (err) {
        console.warn("Login error:", err);
        return {
          ok: false,
          message: mapAuthError(err),
        };
      }
    },

    
    async resendVerification(email, password) {
      try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        if (user.emailVerified) {
          await signOut(auth);
          return {
            ok: true,
            message: "Your email is already verified. Try signing in again.",
          };
        }

        await sendEmailVerification(user);
        await signOut(auth);
        return {
          ok: true,
          message: "Verification email resent. Check your inbox to verify, then sign in.",
        };
      } catch (err) {
        console.warn("Resend verification error:", err);
        return { ok: false, message: mapAuthError(err) };
      }
    },

    
    async googleLogin() {
      try {
        await setPersistence(auth, browserLocalPersistence);

        // Try popup first for smoother local dev; fall back to redirect if blocked/unsupported
        try {
          const cred = await signInWithPopup(auth, provider);
          if (cred?.user) {
            const freshToken = await cred.user.getIdToken();
            this.user = normalizeUser(cred.user);
            this.token = freshToken;
            this.ready = true;
            setAuthToken(freshToken);
            setSocketAuthToken(freshToken);
            setAuthReady(true);
            localStorage.setItem("user", JSON.stringify(this.user));
            localStorage.setItem("token", freshToken);
            return { ok: true, popup: true };
          }
          return { ok: false, message: "Google sign-in failed. Please try again." };
        } catch (popupErr) {
          const code = popupErr?.code || "";
          const shouldFallback =
            code === "auth/operation-not-supported-in-this-environment" ||
            code === "auth/popup-blocked";
          if (!shouldFallback) {
            if (code === "auth/popup-closed-by-user") {
              return { ok: false, message: "Google sign-in was canceled." };
            }
            console.warn("Google popup error:", popupErr);
            return { ok: false, message: mapAuthError(popupErr) };
          }
          // fallback to redirect
          await signInWithRedirect(auth, provider);
          return { ok: true, redirect: true };
        }
      } catch (err) {
        console.warn("Google login error:", err);
        return {
          ok: false,
          message: mapAuthError(err),
        };
      }
    },

    async demoLogin() {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        console.warn("Demo persistence setup failed:", err);
      }

      try {
        const demoEmail =
          import.meta.env.VITE_DEMO_EMAIL || "demo@taskflow.dev";
        const demoPassword =
          import.meta.env.VITE_DEMO_PASSWORD || "Demo123!";
        const demoName =
          import.meta.env.VITE_DEMO_NAME || "Demo User";

        let cred = null;
        try {
          cred = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
        } catch (err) {
          const code = err?.code || "";
          if (code === "auth/too-many-requests") {
            return { ok: false, message: mapAuthError(err) };
          }
          const shouldCreate =
            code === "auth/user-not-found" ||
            code === "auth/invalid-credential" ||
            code === "auth/wrong-password";
          if (!shouldCreate) {
            return { ok: false, message: mapAuthError(err) };
          }
          const created = await createUserWithEmailAndPassword(
            auth,
            demoEmail,
            demoPassword
          );
          try {
            await updateProfile(created.user, { displayName: demoName });
          } catch (profileErr) {
            console.warn("Demo profile update failed:", profileErr);
          }
          cred = created;
        }

        if (!cred?.user) {
          return { ok: false, message: "Demo login unavailable." };
        }

        const freshToken = await cred.user.getIdToken();
        this.user = normalizeUser(cred.user);
        this.token = freshToken;
        this.ready = true;
        setAuthToken(freshToken);
        setSocketAuthToken(freshToken);
        setAuthReady(true);
        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("token", freshToken);
        return { ok: true };
      } catch (err) {
        console.warn("Demo login error:", err);
        return {
          ok: false,
          message: mapAuthError(err) || "Demo login failed.",
        };
      }
    },

    
    async initFromStorage() {
      const cachedUser = localStorage.getItem("user");
      const cachedToken = localStorage.getItem("token");
      if (cachedUser) this.user = JSON.parse(cachedUser);
      if (cachedToken) this.token = cachedToken;

      const commitUser = (u, t) => {
        this.user = normalizeUser(u);
        this.token = t;
        this.ready = true;
        setAuthToken(t);
        setSocketAuthToken(t);
        setAuthReady(true);
        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("token", t);
      };

      return new Promise(async (resolve) => {
        try {
          await setPersistence(auth, browserLocalPersistence);
        } catch (err) {
          console.warn("Set persistence failed:", err);
        }

        try {
          const redirectResult = await getRedirectResult(auth);
          if (redirectResult?.user) {
            const freshToken = await redirectResult.user.getIdToken();
            commitUser(redirectResult.user, freshToken);
            return resolve();
          }
        } catch (err) {
          console.warn("Handle Google redirect failed:", err);
        }

        const current = auth.currentUser;
        if (current && !this.token) {
          try {
            const t = await current.getIdToken();
            commitUser(current, t);
            return resolve();
          } catch (err) {
            console.warn("Restore current user failed:", err);
          }
        }

        const off = onAuthStateChanged(auth, async (u) => {
          if (!u) {
            this.ready = true;
            setAuthToken(this.token);
            setSocketAuthToken(this.token);
            setAuthReady(true);
            off();
            return resolve();
          }
          try {
            const fresh = await u.getIdToken();
            commitUser(u, fresh);
          } catch (err) {
            console.warn("Auth state listener failed:", err);
          } finally {
            off();
            resolve();
          }
        });
      }).finally(() => {
        if (!this.ready) {
          this.ready = true;
          setAuthToken(this.token);
          setSocketAuthToken(this.token);
          setAuthReady(true);
        }
      });
    },

    logout() {
      this.user = null;
      this.token = null;
      this.ready = true;
      setAuthToken(null);
      setSocketAuthToken(null);
      setAuthReady(true);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      disconnectSocket();
      signOut(auth).catch((err) =>
        console.warn("Firebase sign out failed:", err)
      );
    },
  },
});


