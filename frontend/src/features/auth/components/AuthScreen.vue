<template>
  <div class="auth-root">
    <div class="bg-image"></div>
    <div class="bg-overlay"></div>
    <div class="demo-float">
      <button
        class="demo-panel-btn"
        @click="handleDemoLogin"
        :disabled="isDemoLoading || isGoogleLoading || isSubmitting"
        type="button"
      >
        {{ isDemoLoading ? "Loading..." : "Demo" }}
      </button>
    </div>

    <div class="center">
      <div class="mdm-panel">
        <div class="panel-actions">
          <button
            class="google-panel-btn"
            @click="handleGoogle"
            :disabled="isGoogleLoading || isSubmitting || isDemoLoading"
            type="button"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" />
          </button>
        </div>

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

        <div class="mdm-divider"></div>

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
              <AppIcon
                :icon="alert.type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'"
                class="text-sm"
              />
              <span>{{ alert.message }}</span>
            </div>

            <div class="form-slider" :class="{ register: activeForm === 'register' }">
              <form class="form" @submit.prevent="handleLogin" novalidate>
                <div class="mdm-input">
                  <AppIcon icon="fa-user" />
                  <input
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    placeholder="Enter Email..."
                  />
                </div>

                <div class="mdm-input password">
                  <AppIcon icon="fa-lock" />
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    placeholder="Enter Password..."
                  />
                  <span class="eye" @click="showPassword = !showPassword">
                    <AppIcon :icon="showPassword ? 'fa-eye-slash' : 'fa-eye'" />
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
                  <AppIcon icon="fa-user" />
                  <input
                    v-model="name"
                    autocomplete="name"
                    placeholder="Full Name..."
                  />
                </div>

                <div class="mdm-input">
                  <AppIcon icon="fa-envelope" />
                  <input
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    placeholder="Email..."
                  />
                </div>

                <div class="mdm-input password">
                  <AppIcon icon="fa-lock" />
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Password..."
                  />
                  <span class="eye" @click="showPassword = !showPassword">
                    <AppIcon :icon="showPassword ? 'fa-eye-slash' : 'fa-eye'" />
                  </span>
                </div>

                <div class="mdm-input password">
                  <AppIcon icon="fa-lock" />
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    placeholder="Confirm Password..."
                  />
                  <span class="eye" @click="showConfirmPassword = !showConfirmPassword">
                    <AppIcon :icon="showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'" />
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
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useWorkspaceStore } from "@/features/workspaces/stores/workspaceStore";
import { useBoardStore } from "@/features/boards/stores/boardStore";

const props = defineProps({
  startTab: {
    type: String,
    default: "login",
  },
});

const router = useRouter();
const auth = useAuthStore();
const workspaceStore = useWorkspaceStore();
const boardStore = useBoardStore();

const normalizeTab = (value) =>
  value === "register" ? "register" : "login";

const SIDEBAR_STORAGE_KEY = "taskflow.sidebarOpen";

const ensureSidebarOpen = () => {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, "1");
  } catch (_) {}
};

const getRedirectPath = () => "/workspace";

const activeForm = ref(normalizeTab(props.startTab));
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const name = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isSubmitting = ref(false);
const isGoogleLoading = ref(false);
const isDemoLoading = ref(false);
const alert = ref({ type: "", message: "" });

const DEMO_WORKSPACE = import.meta.env.VITE_DEMO_WORKSPACE || "Demo Workspace";
const DEMO_BOARD = import.meta.env.VITE_DEMO_BOARD || "Demo Board";
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || "demo@taskflow.dev";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "Demo123!";
const DEMO_BOARD_ICON = "fas fa-layer-group";
const DEMO_BOARD_COLOR = "linear-gradient(135deg,#6366f1,#14b8a6)";

const demoTasks = [
  {
    title: "Project kickoff",
    description: "Align scope, success metrics, and timeline.",
    priority: "high",
    column: "to do",
    dueInDays: 3,
  },
  {
    title: "Design wireframes",
    description: "Create initial layouts for key screens.",
    priority: "medium",
    column: "to do",
    dueInDays: 5,
  },
  {
    title: "Implement auth flow",
    description: "Build login/register UI and connect auth.",
    priority: "urgent",
    column: "in progress",
    dueInDays: 2,
  },
  {
    title: "Set up database",
    description: "Configure Prisma schema and seed data.",
    priority: "high",
    column: "in progress",
    dueInDays: 4,
  },
  {
    title: "Ship staging build",
    description: "Deploy the staging environment for review.",
    priority: "medium",
    column: "done",
    dueInDays: -1,
  },
  {
    title: "Write release notes",
    description: "Summarize changes for the demo release.",
    priority: "low",
    column: "done",
    dueInDays: 1,
  },
];

const passwordMismatch = computed(
  () =>
    activeForm.value === "register" &&
    password.value &&
    confirmPassword.value &&
    password.value !== confirmPassword.value
);

const DEMO_EMAIL_NORMALIZED = DEMO_EMAIL.toLowerCase();

const isDemoCredentials = (candidateEmail, candidatePassword) => {
  if (!candidateEmail || !candidatePassword) return false;
  return (
    String(candidateEmail).trim().toLowerCase() === DEMO_EMAIL_NORMALIZED &&
    candidatePassword === DEMO_PASSWORD
  );
};

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

const setAlert = (type, message) => {
  alert.value = { type, message };
};

const resetFeedback = () => {
  setAlert("", "");
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
  const trimmedEmail = email.value.trim();
  const enteredPassword = password.value;

  if (!trimmedEmail || !enteredPassword) {
    setAlert("error", "Email and password are required.");
    return;
  }

  if (isDemoCredentials(trimmedEmail, enteredPassword)) {
    isSubmitting.value = true;
    try {
      await runDemoLogin();
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  isSubmitting.value = true;
  try {
    const result = await auth.login(trimmedEmail, enteredPassword);
    if (result?.ok) {
      ensureSidebarOpen();
      router.push(getRedirectPath());
    } else {
      setAlert("error", result?.message || "Unable to sign in. Try again.");
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleRegister = async () => {
  resetFeedback();
  if (!name.value.trim() || !email.value.trim() || !password.value || !confirmPassword.value) {
    setAlert("error", "All fields are required to create an account.");
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
      setAlert("success", result.message || "Verification email sent. Please check your inbox.");
      switchForm("login", { preserveAlert: true });
    } else {
      setAlert("error", result?.message || "Unable to register. Please try again.");
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleGoogle = async () => {
  resetFeedback();
  isGoogleLoading.value = true;
  try {
    const result = await auth.googleLogin();
    if (result?.ok) {
      ensureSidebarOpen();
      router.push(getRedirectPath());
    } else {
      setAlert("error", result?.message || "Google sign-in failed. Please try again.");
    }
  } finally {
    isGoogleLoading.value = false;
  }
};

const formatDateInput = (date) => date.toISOString().slice(0, 10);

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const ensureDemoWorkspace = async () => {
  await workspaceStore.loadWorkspaces();
  const existing = (workspaceStore.workspaces || []).find(
    (w) => w.name === DEMO_WORKSPACE
  );
  if (existing) return existing;
  return workspaceStore.createWorkspace(DEMO_WORKSPACE);
};

const ensureDemoBoard = async (workspaceId) => {
  if (!workspaceId) return null;
  let boards = workspaceStore.getBoards(workspaceId);
  if (!boards.length) {
    await workspaceStore.loadBoards(workspaceId);
    boards = workspaceStore.getBoards(workspaceId);
  }
  const existing = (boards || []).find((b) => b.name === DEMO_BOARD);
  if (existing) return existing;
  return workspaceStore.createBoard(
    workspaceId,
    DEMO_BOARD,
    DEMO_BOARD_ICON,
    DEMO_BOARD_COLOR
  );
};

const ensureDemoTasks = async (workspaceId, boardId) => {
  if (!workspaceId || !boardId) return;
  const board = await boardStore.loadBoard(workspaceId, boardId);
  if (!board) return;
  const hasTasks = (boardStore.columns || []).some(
    (col) => (col.tasks || []).length
  );
  if (hasTasks) return;

  const columnMap = new Map(
    (boardStore.columns || []).map((col) => [
      String(col.title || "").toLowerCase(),
      col.id,
    ])
  );
  const fallbackColumnId = boardStore.columns?.[0]?.id || null;

  const createRequests = demoTasks
    .map((task) => {
      const columnId =
        columnMap.get(task.column) || fallbackColumnId;
      if (!columnId) return null;
      const dueDate =
        typeof task.dueInDays === "number"
          ? formatDateInput(addDays(task.dueInDays))
          : "";
      return boardStore.addTask(columnId, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate,
      });
    })
    .filter(Boolean);

  if (createRequests.length) {
    await Promise.all(createRequests);
  }
};

const runDemoLogin = async () => {
  const result = await auth.demoLogin();
  if (result?.ok) {
    ensureSidebarOpen();
    const workspace = await ensureDemoWorkspace();
    if (workspace?.id) {
      const board = await ensureDemoBoard(workspace.id);
      await ensureDemoTasks(workspace.id, board?.id);
      workspaceStore.setCurrentWorkspace(workspace.id);
      router.push("/workspace");
      return result;
    }
    router.push(getRedirectPath());
    return result;
  }
  setAlert("error", result?.message || "Demo sign-in failed. Please try again.");
  return result;
};

const handleDemoLogin = async () => {
  resetFeedback();
  isDemoLoading.value = true;
  try {
    await runDemoLogin();
  } finally {
    isDemoLoading.value = false;
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

.demo-float {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 3;
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
  overflow: hidden;
}

.demo-panel-btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
}

.demo-panel-btn:hover {
  background: rgba(255, 255, 255, 0.28);
}

.panel-actions {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 2;
}

.google-panel-btn {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.18);
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(6px);
}

.google-panel-btn img {
  width: 14px;
  height: 14px;
}


.mdm-left {
  padding: 60px;
  color: white;
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

.mdm-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.25);
  pointer-events: none;
}

.mdm-right {
  padding: 44px 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
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
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
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
  width: 200%;
  transition: transform 0.45s ease;
}

.form-slider.register {
  transform: translateX(-50%);
}

.form {
  width: 50%;
  flex: 0 0 50%;
  max-width: 50%;
}

.mdm-input {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  padding: 10px 6px;
  margin-bottom: 22px;
}

.mdm-input svg {
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  text-align: center;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
  margin-left: 4px;
  font-size: 13px;
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
.google-panel-btn:disabled,
.demo-panel-btn:disabled {
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

