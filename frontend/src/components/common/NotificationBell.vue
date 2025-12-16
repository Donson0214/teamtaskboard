<template>
  <div ref="wrapper" class="relative z-50">
    <button
      @click.stop="toggle"
      class="p-2 rounded-lg relative"
      :class="isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
    >
      <i
        class="fas fa-bell"
        :class="{ 'spin-once': bellSpinning }"
        @animationend="bellSpinning = false"
      ></i>
      <span
        v-if="unreadCount"
        class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center"
      >
        {{ unreadCount }}
      </span>
    </button>

    <transition name="fade-scale">
      <div
        v-if="open"
        class="absolute right-0 mt-3 w-80 rounded-xl border shadow-xl p-3 z-50"
        :class="isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'"
        @click.stop
      >
        <div class="flex items-center justify-between mb-2">
          <div>
            <p class="text-sm font-semibold">Notifications</p>
            <p class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
              {{ statusLabel }}
            </p>
          </div>
          <button
            class="text-[11px] underline"
            :class="isDark ? 'text-indigo-300' : 'text-indigo-600'"
            :disabled="!items.length"
            @click="markAllRead"
          >
            Mark all read
          </button>
        </div>

        <div v-if="store.loading" class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          Loading notifications...
        </div>

        <div v-else-if="!items.length" class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          No notifications yet.
        </div>

        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="n in items"
            :key="n.id"
            class="rounded-lg border px-3 py-2"
            :class="n.read
              ? (isDark ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-700')
              : (isDark ? 'border-indigo-500/40 bg-indigo-900/30' : 'border-indigo-200 bg-indigo-50')"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="space-y-1">
                <p class="text-sm font-medium leading-snug">
                  {{ n.message }}
                </p>
                <p v-if="n.task?.title" class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                  Task: {{ n.task.title }}
                </p>
                <p class="text-[11px]" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
                  {{ formatDate(n.createdAt) }}
                </p>
              </div>

              <div class="flex flex-col items-end gap-2">
                <button
                  v-if="n.task?.boardId || n.task?.board?.id"
                  class="text-[11px] px-2 py-1 rounded border"
                  :class="isDark ? 'border-indigo-500 text-indigo-300 hover:bg-indigo-900/50' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'"
                  @click="goToTask(n)"
                >
                  Open
                </button>
                <button
                  class="text-[11px] underline"
                  :class="isDark ? 'text-slate-300' : 'text-slate-700'"
                  @click="toggleRead(n)"
                >
                  Mark {{ n.read ? 'unread' : 'read' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useNotificationStore } from "@/stores/notificationStore";
import { useThemeStore } from "@/stores/themeStore";

const store = useNotificationStore();
const theme = useThemeStore();
const { isDark } = storeToRefs(theme);
const router = useRouter();

const open = ref(false);
const wrapper = ref(null);
const bellSpinning = ref(false);

const unreadCount = computed(() => store.unreadCount);
const items = computed(() => store.sorted);

const statusLabel = computed(() => {
  if (store.tokenStatus === "registered") return "Push ready via FCM";
  if (store.tokenStatus === "pending") return "Registering device...";
  if (store.tokenStatus === "failed") return "Push unavailable (token save failed)";
  if (store.tokenStatus === "skipped") return "Notifications available via API only";
  return "Inbox is up to date";
});

const triggerSpin = () => {
  bellSpinning.value = false;
  requestAnimationFrame(() => {
    bellSpinning.value = true;
  });
};

const toggle = () => {
  triggerSpin();
  open.value = !open.value;
  if (open.value && !store.items.length && !store.loading) {
    store.fetchNotifications();
  }
};

const openPanel = () => {
  triggerSpin();
  open.value = true;
  if (!store.items.length && !store.loading) {
    store.fetchNotifications();
  }
};

const closePanel = () => {
  open.value = false;
};

const markAllRead = () => store.markAllRead();

const toggleRead = (n) => store.markRead(n.id, !n.read);

const formatDate = (iso) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
};

const goToTask = (n) => {
  const workspaceId =
    n.task?.workspaceId ||
    n.task?.board?.workspaceId;
  const boardId = n.task?.boardId || n.task?.board?.id;

  if (!workspaceId || !boardId) return;

  router.push({ path: `/workspace/${workspaceId}/board/${boardId}` });
  store.markRead(n.id, true);
  open.value = false;
};

const handleOutside = (e) => {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    closePanel();
  }
};

onMounted(() => {
  store.fetchNotifications();
  store.registerDeviceToken();
  store.startListener();
  document.addEventListener("click", handleOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutside);
  store.stopListener();
});

defineExpose({
  toggle,
  openPanel,
  closePanel,
});
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.15s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.spin-once {
  animation: bellSpin 0.6s ease;
}

@keyframes bellSpin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  40% {
    transform: rotate(-18deg) scale(1.05);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>
