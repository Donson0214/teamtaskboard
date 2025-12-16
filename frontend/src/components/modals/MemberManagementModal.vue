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
          <i class="fas fa-times" :class="isDark ? 'text-slate-300' : 'text-slate-600'"></i>
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
            <!-- Avatar -->
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
            <!-- ROLE SELECT -->
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
              @click="removeUser(member.email)"
              class="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <i class="fas fa-trash text-red-500 text-sm"></i>
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
</template>

<script setup>
import { reactive, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  workspaceId: {
    type: [String, Number],
    required: true,
  },
});

const workspaceStore = useWorkspaceStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();

const { isDark } = storeToRefs(themeStore);
const { user } = storeToRefs(authStore);


const members = computed(() => {
  return workspaceStore.getMembers(props.workspaceId);
});


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


const changeRole = (email) => {
  workspaceStore.setMemberRole(props.workspaceId, email, localRoles[email]);
};

const removeUser = async (email) => {
  if (!confirm(`Remove ${email} from workspace?`)) return;
  await workspaceStore.removeMember(props.workspaceId, email);
};

watch(
  () => members.value,
  () => syncRoles(),
  { deep: true }
);
</script>
