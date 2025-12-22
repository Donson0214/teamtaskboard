<template>
  <div class="auth-root">
    <div class="bg-image"></div>
    <div class="bg-overlay"></div>

    <div class="center">
      <div class="mdm-panel">
        <button
          class="google-panel-btn"
          @click="handleGoogle"
          :disabled="isGoogleLoading || isSubmitting"
          type="button"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" />
        </button>

        <div class="mdm-left">
          <h2 class="mdm-title">Task Flow</h2>
          <div class="mdm-line"></div>
          <p class="mdm-text">
            Organize tasks, collaborate with your team,
            and track progress in one shared workspace.
          </p>
          <button class="mdm-know-more" @click="switchForm('register')" type="button">
            Get Started
          </button>
        </div>

        <div class="mdm-right">
          <div class="mdm-logo">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="7" height="7" rx="1.5" />
              <rect x="14" y="4" width="7" height="7" rx="1.5" />
              <rect x="3" y="15" width="7" height="7" rx="1.5" />
              <rect x="14" y="15" width="7" height="7" rx="1.5" />
            </svg>
          </div>

          <div class="mdm-form">
            <div
              v-if="alert.message"
              class="feedback"
              :class="alert.type"
              role="status"
            >
              <i
                :class="
                  alert.type === 'error'
                    ? 'fa-solid fa-circle-exclamation'
                    : 'fa-regular fa-circle-check'
                "
              ></i>
              <span>{{ alert.message }}</span>
            </div>

            <div class="form-slider" :class="{ register: activeForm === 'register' }">
              <form class="form" @submit.prevent="handleLogin" novalidate>
                <div class="mdm-input">
                  <i class="fa-regular fa-user"></i>
                  <input
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    placeholder="Enter Email..."
                  />
                </div>

                <div class="mdm-input password">
                  <i class="fa-solid fa-lock"></i>
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    placeholder="Enter Password..."
                  />
                  <span class="eye" @click="showPassword = !showPassword">
                    <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                  </span>
                </div>

                <button class="mdm-login-btn" :disabled="isSubmitting">
                  {{ isSubmitting ? "Signing in..." : "SIGN IN" }}
                </button>

                <p class="switch-text">
                  Don't have an account?
                  <span @click="switchForm('register')">Sign up</span>
                </p>
              </form>

              <form class="form" @submit.prevent="handleRegister" novalidate>
                <div class="mdm-input">
                  <i class="fa-regular fa-user"></i>
                  <input
                    v-model="name"
                    autocomplete="name"
                    placeholder="Full Name..."
                  />
                </div>

                <div class="mdm-input">
                  <i class="fa-regular fa-envelope"></i>
                  <input
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    placeholder="Email..."
                  />
                </div>

                <div class="mdm-input password">
                  <i class="fa-solid fa-lock"></i>
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Password..."
                  />
                  <span class="eye" @click="showPassword = !showPassword">
                    <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                  </span>
                </div>

                <div class="mdm-input password">
                  <i class="fa-solid fa-lock"></i>
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Confirm Password..."
                  />
                  <span class="eye" @click="showConfirmPassword = !showConfirmPassword">
                    <i :class="showConfirmPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                  </span>
                </div>

                <p v-if="passwordMismatch" class="error-text">
                  Passwords do not match
                </p>

                <button class="mdm-login-btn" :disabled="passwordMismatch || isSubmitting">
                  {{ isSubmitting ? "Creating..." : "CREATE ACCOUNT" }}
                </button>

                <p class="switch-text">
                  Already have an account?
                  <span @click="switchForm('login')">Sign in</span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  startTab: {
    type: String,
    default: "login",
  },
});

const router = useRouter();
const auth = useAuthStore();

const normalizeTab = (value) =>
  value === "register" ? "register" : "login";

const isAuthRoute = (path) => ["/auth", "/login", "/register"].includes(path);

const getRedirectPath = () => {
  const redirect = router.currentRoute.value?.query?.redirect;
  if (
    typeof redirect === "string" &&
    redirect.startsWith("/") &&
    !redirect.startsWith("//")
  ) {
    const cleaned = redirect.split("?")[0];
    if (isAuthRoute(cleaned)) return "/workspace";
    return redirect;
  }
  return "/workspace";
};

const activeForm = ref(normalizeTab(props.startTab));
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const name = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isSubmitting = ref(false);
const isGoogleLoading = ref(false);
const alert = ref({ type: "", message: "" });
const isAuthenticated = computed(() => auth.isAuthenticated);

const passwordMismatch = computed(
  () =>
    activeForm.value === "register" &&
    password.value &&
    confirmPassword.value &&
    password.value !== confirmPassword.value
);

onMounted(() => {
  if (!auth.isReady && !auth.hydrating) {
    auth.initFromStorage();
  }
});

watch(
  () => props.startTab,
  (value) => {
    const next = normalizeTab(value);
    if (next !== activeForm.value) {
      activeForm.value = next;
      resetFeedback();
      clearSensitiveFields();
    }
  }
);

watch(
  () => [isAuthenticated.value, router.currentRoute.value.path],
  ([authed, path]) => {
    if (!authed || !isAuthRoute(path)) return;
    router.replace(getRedirectPath());
  },
  { immediate: true }
);

const resetFeedback = () => {
  alert.value = { type: "", message: "" };
};

const clearSensitiveFields = () => {
  password.value = "";
  confirmPassword.value = "";
  showPassword.value = false;
  showConfirmPassword.value = false;
};

const switchForm = (form, { preserveAlert = false } = {}) => {
  const next = normalizeTab(form);
  if (next === activeForm.value) return;
  activeForm.value = next;
  if (!preserveAlert) resetFeedback();
  clearSensitiveFields();
  if (router.currentRoute.value.path === "/auth") {
    router.replace({
      query: { ...router.currentRoute.value.query, tab: next },
    });
  }
};

const handleLogin = async () => {
  resetFeedback();
  if (!email.value || !password.value) {
    alert.value = { type: "error", message: "Email and password are required." };
    return;
  }

  isSubmitting.value = true;
  try {
    const result = await auth.login(email.value.trim(), password.value);
    if (result?.ok) {
      router.push(getRedirectPath());
    } else {
      alert.value = {
        type: "error",
        message: result?.message || "Unable to sign in. Try again.",
      };
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleRegister = async () => {
  resetFeedback();
  if (!name.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value) {
    alert.value = { type: "error", message: "All fields are required to create an account." };
    return;
  }
  if (passwordMismatch.value) return;

  isSubmitting.value = true;
  try {
    const result = await auth.register(
      name.value.trim(),
      email.value.trim(),
      password.value
    );
    if (result?.ok) {
      alert.value = {
        type: "success",
        message: result.message || "Verification email sent. Please check your inbox.",
      };
      switchForm("login", { preserveAlert: true });
    } else {
      alert.value = {
        type: "error",
        message: result?.message || "Unable to register. Please try again.",
      };
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleGoogle = async () => {
  resetFeedback();
  isGoogleLoading.value = true;
  try {
    const result = await auth.googleLogin({ preferRedirect: true });
    if (result?.ok) {
      if (!result.redirect) {
        router.push(getRedirectPath());
      }
    } else {
      alert.value = {
        type: "error",
        message: result?.message || "Google sign-in failed. Please try again.",
      };
    }
  } finally {
    isGoogleLoading.value = false;
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap");

.auth-root {
  font-family: "Poppins", sans-serif;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.mdm-know-more {
  margin-top: 26px;
  padding: 8px 22px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.85);
  background: transparent;
  color: white;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.mdm-know-more:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 1);
}

.bg-image {
  position: absolute;
  inset: 0;
  background: url("@/assets/img/b1.png") center / cover no-repeat;
  filter: blur(3px);
  transform: scale(1.04);
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(30, 40, 60, 0.55);
}

.center {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mdm-panel {
  width: 1100px;
  height: 460px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
  border-radius: 10px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  position: relative;
}

.mdm-panel::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.25);
  pointer-events: none;
  z-index: 0;
}

.google-panel-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.18);
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
  z-index: 2;
}

.google-panel-btn img {
  width: 14px;
  height: 14px;
}

.mdm-left {
  padding: 60px;
  color: white;
  position: relative;
  z-index: 1;
}

.mdm-title {
  font-size: 22px;
}
.mdm-line {
  width: 32px;
  height: 2px;
  background: white;
  margin: 12px 0;
}

.mdm-text {
  font-size: 13px;
  opacity: 0.9;
  max-width: 320px;
}

.mdm-right {
  padding: 44px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  position: relative;
  z-index: 1;
}

.mdm-logo svg {
  width: 42px;
  height: 42px;
  stroke: #ffffff;
  stroke-width: 1.8;
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
  margin-bottom: 18px;
}

.mdm-form {
  width: 260px;
  overflow: hidden;
  box-sizing: border-box;
}

.feedback {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.4;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feedback.error {
  background: rgba(255, 99, 99, 0.14);
  border-color: rgba(255, 99, 99, 0.35);
  color: #ffd1d1;
}

.feedback.success {
  background: rgba(99, 255, 171, 0.14);
  border-color: rgba(99, 255, 171, 0.35);
  color: #d0ffe8;
}

.form-slider {
  display: flex;
  --form-gap: 2px;
  width: 200%;
  gap: var(--form-gap);
  transition: transform 0.45s ease;
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

.form-slider.register {
  transform: translate3d(calc(-50% - var(--form-gap)), 0, 0);
}

.form {
  width: 50%;
  flex: 0 0 50%;
  box-sizing: border-box;
  backface-visibility: hidden;
}

.mdm-input {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  padding: 10px 0;
  margin-bottom: 22px;
}

.mdm-input input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 13px;
}

.password {
  position: relative;
}

.eye {
  cursor: pointer;
  opacity: 0.85;
}

.mdm-login-btn {
  width: 100%;
  padding: 10px;
  border-radius: 18px;
  background: white;
  color: #111;
  font-size: 12px;
  border: none;
}

.mdm-login-btn:disabled,
.google-panel-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.switch-text {
  margin-top: 12px;
  font-size: 12px;
  text-align: center;
  opacity: 0.85;
}

.switch-text span {
  text-decoration: underline;
  cursor: pointer;
}

.error-text {
  font-size: 11px;
  color: #ffb4b4;
  margin-bottom: 8px;
}
</style>
