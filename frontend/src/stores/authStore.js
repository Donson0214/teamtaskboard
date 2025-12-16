import { defineStore } from "pinia";
import { auth, provider } from "@/firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import api from "@/api.js";


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
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
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

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        return {
          ok: true,
          message: "Verification email sent. Check your inbox, confirm, then sign in.",
        };
      } catch (err) {
        console.error("Register error:", err);
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
            console.error("Verification email send error:", sendErr);
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

        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("token", token);

        return { ok: true };
      } catch (err) {
        console.error("Login error:", err);
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
        console.error("Resend verification error:", err);
        return { ok: false, message: mapAuthError(err) };
      }
    },

    
    async googleLogin() {
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const token = await user.getIdToken();

        this.user = normalizeUser(user);
        this.token = token;

        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("token", token);

        return { ok: true };
      } catch (err) {
        console.error("Google login error:", err);
        return {
          ok: false,
          message: mapAuthError(err),
        };
      }
    },

    
    initFromStorage() {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (user) this.user = JSON.parse(user);
      if (token) this.token = token;
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      signOut(auth).catch((err) =>
        console.error("Firebase sign out failed:", err)
      );
    },
  },
});
