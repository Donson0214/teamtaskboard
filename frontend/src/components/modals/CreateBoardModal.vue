<template>
  <div
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div
      :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'"
      class="w-full max-w-md border rounded-lg shadow-xl shadow-black/20 p-6"
    >
      <h2
        :class="isDark ? 'text-white' : 'text-slate-900'"
        class="text-xl font-semibold mb-4"
      >
        Create Board
      </h2>

      <form @submit.prevent="submit">
        <!-- Board Name -->
        <label
          class="block text-sm font-medium mb-1"
          :class="isDark ? 'text-slate-300' : 'text-slate-700'"
        >
          Board Name
        </label>
        <input
          v-model="name"
          type="text"
          required
          placeholder="e.g., Sprint Planning"
          class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
          :class="isDark
            ? 'bg-slate-800 border-slate-700 text-white'
            : 'bg-white border-slate-300 text-slate-900'"
        />

        <!-- Icon -->
        <label
          class="block text-sm font-medium mt-4 mb-1"
          :class="isDark ? 'text-slate-300' : 'text-slate-700'"
        >
          Icon
        </label>

        <div class="grid grid-cols-6 gap-2">
          <button
            v-for="ic in icons"
            :key="ic"
            type="button"
            @click="icon = ic"
            :class="[
              'p-2 rounded-lg border flex items-center justify-center text-lg',
              icon === ic
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : isDark
                  ? 'border-slate-700 hover:border-slate-500'
                  : 'border-slate-300 hover:border-slate-400'
            ]"
          >
            <i :class="ic"></i>
          </button>
        </div>

        <!-- Board Color -->
        <label
          class="block text-sm font-medium mt-4 mb-1"
          :class="isDark ? 'text-slate-300' : 'text-slate-700'"
        >
          Board Color
        </label>

        <div class="grid grid-cols-6 gap-2">
          <button
            v-for="c in colors"
            :key="c"
            type="button"
            @click="color = c"
            class="w-8 h-8 rounded-lg border"
            :style="{ background: c }"
            :class="color === c
              ? 'border-purple-500 scale-110'
              : isDark
                ? 'border-slate-700'
                : 'border-slate-300'"
          ></button>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            type="button"
            @click="close"
            class="flex-1 py-2 rounded-lg font-medium"
            :class="isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-white'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="loading"
            class="flex-1 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-60"
          >
            {{ loading ? "Creating..." : "Create" }}
          </button>
        </div>
      </form>

      <p v-if="error" class="text-sm text-red-500 mt-3">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useThemeStore } from "@/stores/themeStore";

const props = defineProps({
  workspaceId: { type: [String, Number], required: true },
});

const emit = defineEmits(["close", "created"]);

const workspaceStore = useWorkspaceStore();
const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

const name = ref("");
const icon = ref("fas fa-clipboard");
const color = ref("linear-gradient(135deg,#667eea,#764ba2)");
const loading = ref(false);
const error = ref("");

const icons = [
  "fas fa-clipboard",
  "fas fa-bolt",
  "fas fa-bug",
  "fas fa-rocket",
  "fas fa-tasks",
  "fas fa-palette",
  "fas fa-cog",
  "fas fa-project-diagram",
];

const colors = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#ff9a9e,#fad0c4)",
  "linear-gradient(135deg,#a1c4fd,#c2e9fb)",
  "linear-gradient(135deg,#f6d365,#fda085)",
  "linear-gradient(135deg,#84fab0,#8fd3f4)",
  "linear-gradient(135deg,#d4fc79,#96e6a1)",
];

const close = () => emit("close");

const submit = async () => {
  if (!name.value.trim()) {
    error.value = "Board name is required";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const board = await workspaceStore.createBoard(
      props.workspaceId,
      name.value,
      icon.value,
      color.value
    );

    emit("created", board);
    close();
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || "Failed to create board";
  } finally {
    loading.value = false;
  }
};
</script>
