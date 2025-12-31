
<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div
      :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'"
      class="rounded-xl border p-6 w-full max-w-md"
    >
      <h3
        :class="isDark ? 'text-white' : 'text-slate-900'"
        class="text-xl font-bold mb-4"
      >
        Create Workspace
      </h3>

      <form @submit.prevent="create">
        <div class="mb-4">
          <label
            :class="isDark ? 'text-slate-300' : 'text-slate-700'"
            class="block text-sm font-medium mb-2"
          >
            Workspace Name
          </label>

          <input
            v-model="name"
            type="text"
            required
            :class="
              isDark
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            "
            class="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., Design Team"
          />
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            @click="close"
            :class="
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            "
            class="flex-1 px-4 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg"
          >
            Create
          </button>
        </div>
      </form>

      <p v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useThemeStore } from "@/shared/stores/themeStore";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useWorkspaceStore } from "@/features/workspaces/stores/workspaceStore";

const theme = useThemeStore();
const { isDark } = storeToRefs(theme);

const auth = useAuthStore();
const workspaceStore = useWorkspaceStore();

const name = ref("");
const error = ref("");


const emit = defineEmits(["close"]);
const close = () => emit("close");

const create = async () => {
  if (!name.value.trim()) return;

  error.value = "";
  const created = await workspaceStore.createWorkspace(name.value);
  if (!created) {
    error.value = "Failed to create workspace";
    return;
  }

  name.value = "";
  close();
};
</script>

