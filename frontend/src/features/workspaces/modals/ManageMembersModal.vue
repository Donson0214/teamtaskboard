<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl w-full max-w-lg p-6">
      <h2 class="text-lg font-semibold mb-4" :class="isDark ? 'text-white' : 'text-slate-900'">
        Manage Members
      </h2>

      <div v-if="!members.length" class="text-sm" :class="isDark ? 'text-slate-300' : 'text-slate-700'">
        No members yet.
      </div>

      <div
        v-for="m in members"
        :key="m.email"
        class="flex items-center justify-between py-2 border-b"
        :class="isDark ? 'border-slate-700' : 'border-slate-200'"
      >
        <div>
          <p class="font-medium" :class="isDark ? 'text-white' : 'text-slate-900'">{{ m.email }}</p>
          <p class="text-xs capitalize" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ m.role }}</p>
        </div>

        <button
          v-if="canRemove(m)"
          class="px-3 py-1 rounded-lg text-sm bg-red-500 hover:bg-red-600 text-white"
          @click="requestRemove(m.email)"
        >
          Remove
        </button>
        <span
          v-else
          class="px-3 py-1 rounded-lg text-xs"
          :class="isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'"
        >
          {{ m.role }}
        </span>
      </div>

      <div class="text-right mt-6">
        <button
          class="px-4 py-2 rounded-lg"
          :class="isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>

  <transition name="fade-scale">
    <div
      v-if="confirmOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4"
      @click.self="cancelRemove"
    >
      <div
        class="w-full max-w-sm rounded-xl border shadow-lg p-4"
        :class="isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'"
      >
        <h3 class="text-sm font-semibold">Remove member</h3>
        <p class="text-xs mt-2" :class="isDark ? 'text-slate-300' : 'text-slate-600'">
          Remove {{ confirmEmail }} from "{{ workspaceName }}"?
        </p>
        <div class="flex justify-end gap-2 mt-4">
          <button
            class="px-3 py-1 rounded-lg text-sm"
            :class="isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
            :disabled="removeLoading"
            @click="cancelRemove"
          >
            Cancel
          </button>
          <button
            class="px-3 py-1 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600 flex items-center gap-2"
            :class="removeLoading ? 'opacity-70 cursor-not-allowed' : ''"
            :disabled="removeLoading"
            @click="confirmRemove"
          >
            <AppIcon v-if="removeLoading" icon="fa-spinner" class="text-[11px] animate-spin" />
            {{ removeLoading ? "Removing..." : "Remove" }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref } from "vue";
import { useWorkspaceStore } from "@/features/workspaces/stores/workspaceStore";
import { useThemeStore } from "@/shared/stores/themeStore";
import { useAuthStore } from "@/features/auth/stores/authStore";

const props = defineProps({
  workspaceId: {
    type: [String, Number],
    required: true,
  },
});
const emit = defineEmits(["close"]);

const ws = useWorkspaceStore();
const theme = useThemeStore();
const auth = useAuthStore();

const isDark = computed(() => theme.isDark);
const members = computed(() => ws.getMembers(props.workspaceId) || []);
const workspace = computed(() => ws.getWorkspaceById(props.workspaceId));
const workspaceName = computed(() => workspace.value?.name || "workspace");

const ownerEmail = computed(() => workspace.value?.members?.find((m) => m.role === "owner")?.email || null);
const isOwner = computed(() => auth.user?.email === ownerEmail.value);

const canRemove = (member) => {
  if (!isOwner.value) return false;
  if (member.role === "owner") return false;
  return true;
};

const confirmOpen = ref(false);
const confirmEmail = ref("");
const removeLoading = ref(false);

const requestRemove = (email) => {
  confirmEmail.value = email;
  confirmOpen.value = true;
};

const cancelRemove = () => {
  confirmOpen.value = false;
  confirmEmail.value = "";
};

const confirmRemove = async () => {
  if (!confirmEmail.value || removeLoading.value) return;
  removeLoading.value = true;
  try {
    const ok = await ws.removeMember(props.workspaceId, confirmEmail.value);
    if (!ok) {
      alert("Failed to remove member");
    }
  } finally {
    removeLoading.value = false;
    cancelRemove();
  }
};
</script>

