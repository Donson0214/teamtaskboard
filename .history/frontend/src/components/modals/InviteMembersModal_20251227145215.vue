<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div
      :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'"
      class="w-full max-w-md rounded-lg border shadow-lg p-6"
    >
      
      <div class="flex items-center justify-between mb-4">
        <h2 :class="isDark ? 'text-white' : 'text-slate-900'" class="text-xl font-bold">
          Invite Members
        </h2>

        <button
          @click="$emit('close')"
          class="p-2 rounded-lg"
          :class="isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'"
        >
          <AppIcon icon="fa-times" :class="isDark ? 'text-slate-300' : 'text-slate-600'" />
        </button>
      </div>

      
      <form @submit.prevent="sendInvite">
        <div class="space-y-4">
          
          <div>
            <label class="block text-sm font-medium mb-1"
              :class="isDark ? 'text-slate-300' : 'text-slate-700'"
            >
              Email
            </label>
            <input
              v-model="email"
              type="email"
              required
              :disabled="isSending"
              placeholder="example@gmail.com"
              class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
              :class="isDark
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900'"
            />
          </div>

          
          <div>
            <label class="block text-sm font-medium mb-1"
              :class="isDark ? 'text-slate-300' : 'text-slate-700'"
            >
              Role
            </label>
            <select
              v-model="role"
              required
              :disabled="isSending"
              class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
              :class="isDark
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900'"
            >
              <option value="member">Member </option>
              <option value="guest">Guest </option>
            </select>
          </div>
        </div>

        
        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 rounded-lg font-medium"
            :class="isDark ? 'bg-slate-800 hover:bg-slate-700 text-white'
                           : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="isSending"
            class="flex-1 px-4 py-2 rounded-lg font-medium text-white 
                   bg-gradient-to-r from-purple-600 to-blue-600 
                   hover:from-purple-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Send Invite
          </button>
        </div>
      </form>

      
      <p v-if="errorMessage"
         class="mt-4 text-sm text-red-500 font-medium">
        {{ errorMessage }}
      </p>

     
      <p v-if="successMessage"
         class="mt-4 text-sm text-green-500 font-medium">
        {{ successMessage }}
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useThemeStore } from "@/stores/themeStore";

const props = defineProps({
  workspaceId: {
    type: [String, Number],
    required: true,
  },
});
const emit = defineEmits(["close"]);

const workspaceStore = useWorkspaceStore();
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

const email = ref("");
const role = ref("member");

const errorMessage = ref("");
const successMessage = ref("");
const isSending = ref(false);
let closeTimer = null;

const sendInvite = async () => {
  if (isSending.value) return;
  errorMessage.value = "";
  successMessage.value = "";

  const trimmedEmail = email.value.trim();
  if (!trimmedEmail) {
    errorMessage.value = "Please enter an email address.";
    return;
  }

  const ws = workspaceStore.getWorkspaceById(props.workspaceId);
  if (!ws) {
    errorMessage.value = "Workspace not found.";
    return;
  }

  const normalizedEmail = trimmedEmail.toLowerCase();
  const pendingInvites = ws.pendingInvites;
  if (pendingInvites && pendingInvites.has(normalizedEmail)) {
    errorMessage.value = "Invitation already in progress.";
    return;
  }
  const already = ws.members.find((m) => m.email?.toLowerCase?.() === normalizedEmail);
  if (already) {
    errorMessage.value = "This email is already a member of the workspace.";
    return;
  }

  isSending.value = true;
  try {
    const invited = await workspaceStore.inviteMember(
      props.workspaceId,
      trimmedEmail,
      role.value
    );
    if (!invited) {
      errorMessage.value = "Failed to send invitation.";
      return;
    }

    successMessage.value = `Invitation sent to ${trimmedEmail}.`;

    
    email.value = "";
    role.value = "member";

    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      successMessage.value = "";
      errorMessage.value = "";
      emit("close");
    }, 600);
  } finally {
    isSending.value = false;
  }
};

onBeforeUnmount(() => {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
});
</script>
