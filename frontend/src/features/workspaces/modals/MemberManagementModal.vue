<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-lg rounded-lg border shadow-lg p-6"
      :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'"
    >
     
      <div class="flex items-center justify-between mb-4">
        <h2
          class="text-xl font-bold"
          :class="isDark ? 'text-white' : 'text-slate-900'"
        >
          Manage Members
        </h2>

        <button
          @click="$emit('close')"
          class="p-2 rounded-lg"
          :class="isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'"
        >
          <AppIcon icon="fa-times" :class="isDark ? 'text-slate-300' : 'text-slate-600'" />
        </button>
      </div>

      
      <div class="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        <div
          v-for="member in members"
          :key="member.email"
          class="flex items-center justify-between p-3 rounded-lg border shadow-sm"
          :class="isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'"
        >
          
          <div class="flex items-center gap-3">
            
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"
              :class="isDark ? 'bg-slate-700' : 'bg-slate-400'"
            >
              {{ member.email[0].toUpperCase() }}
            </div>

            <div>
              <p
                class="font-medium"
                :class="isDark ? 'text-white' : 'text-slate-900'"
              >
                {{ member.email }}
              </p>

              <p
                class="text-xs"
                :class="isDark ? 'text-slate-400' : 'text-slate-600'"
              >
                {{ member.role }}
              </p>
            </div>
          </div>

          
          <div class="flex items-center gap-2">
            
            <select
              v-if="isOwner && member.email !== ownerEmail"
              v-model="localRoles[member.email]"
              @change="changeRole(member.email)"
              class="px-3 py-1 rounded-lg border text-sm"
              :class="isDark
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'"
            >
              <option value="member">Member</option>
              <option value="guest">Guest</option>
            </select>

            <span
              v-else
              class="px-3 py-1 text-sm rounded-lg"
              :class="isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'"
            >
              {{ member.role }}
            </span>

            
            <button
              v-if="isOwner && member.email !== ownerEmail"
              @click="requestRemove(member.email)"
              class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <AppIcon icon="fa-trash" class="text-red-500 text-sm" />
            </button>
          </div>
        </div>
      </div>

      
      <div class="flex justify-end mt-6">
        <button
          class="px-4 py-2 rounded-lg font-medium"
          :class="isDark ? 'bg-slate-800 hover:bg-slate-700 text-white'
                         : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
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
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
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
import { reactive, computed, watch, ref } from "vue";
import { storeToRefs } from "pinia";
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

const workspaceStore = useWorkspaceStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();

const { isDark } = storeToRefs(themeStore);
const { user } = storeToRefs(authStore);


const members = computed(() => {
  return workspaceStore.getMembers(props.workspaceId);
});
const workspace = computed(() => workspaceStore.getWorkspaceById(props.workspaceId));
const workspaceName = computed(() => workspace.value?.name || "workspace");


const ownerEmail = computed(() => {
  const ws = workspaceStore.getWorkspaceById(props.workspaceId);
  const owner = ws?.members?.find((m) => m.role === "owner");
  return owner?.email || null;
});


const isOwner = computed(() => {
  return user.value?.email === ownerEmail.value;
});


const localRoles = reactive({});
const syncRoles = () => {
  Object.keys(localRoles).forEach((k) => delete localRoles[k]);
  members.value.forEach((m) => {
    localRoles[m.email] = m.role;
  });
};
syncRoles();


const changeRole = async (email) => {
  const updated = await workspaceStore.setMemberRole(
    props.workspaceId,
    email,
    localRoles[email]
  );
  if (!updated) {
    alert("Failed to update member role");
    syncRoles();
  }
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
    const ok = await workspaceStore.removeMember(props.workspaceId, confirmEmail.value);
    if (!ok) {
      alert("Failed to remove member");
    }
  } finally {
    removeLoading.value = false;
    cancelRemove();
  }
};

const membersSignature = computed(() =>
  (members.value || []).map((m) => `${m.email}:${m.role}`).join("|")
);

watch(membersSignature, () => syncRoles());
</script>

