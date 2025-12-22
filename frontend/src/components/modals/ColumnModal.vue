<template>
  <transition name="fade-scale">
    <div v-if="open" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">
      <div
        class="w-96 rounded-xl shadow-xl p-6 relative"
        :class="isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'"
      >
        <button @click="$emit('cancel')" class="absolute top-3 right-3 text-slate-400 hover:text-red-400">
          <i class="fas fa-times"></i>
        </button>

        <h2 class="text-xl font-bold mb-4">Create Column</h2>

        <label class="text-sm font-medium mb-1">Column Title</label>
        <input
          v-model="title"
          type="text"
          placeholder="Type a column name..."
          class="w-full px-3 py-2 rounded-lg border mb-4"
          :class="isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'"
        />

        <label class="text-sm font-medium mb-1">Color</label>
        <input
          v-model="color"
          type="color"
          class="w-full h-10 px-3 py-2 rounded-lg border mb-4 cursor-pointer"
          :class="isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'"
        />

        <p v-if="error" class="text-red-500 text-sm mb-2">{{ error }}</p>

        <div class="flex justify-end gap-2 mt-4">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 rounded-lg text-sm"
            :class="isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'"
          >
            Cancel
          </button>
          <button
            @click="submit"
            class="px-4 py-2 rounded-lg text-sm text-white"
            :class="isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useThemeStore } from "@/stores/themeStore";

const theme = useThemeStore();
const isDark = computed(() => theme.isDark);

const props = defineProps({ open: Boolean });
const emit = defineEmits(["submit", "cancel"]);

const title = ref("");
const color = ref("#6366f1");
const error = ref(null);

watch(
  () => props.open,
  (val) => {
    if (val) {
      title.value = "";
      color.value = "#6366f1";
      error.value = "";
    }
  }
);

function submit() {
  if (!title.value.trim()) {
    error.value = "Column title is required.";
    return;
  }
  emit("submit", { title: title.value.trim(), color: color.value });
}
</script>

<style>
.fade-scale-enter-active,
.fade-scale-leave-active { transition: all 0.25s ease; }
.fade-scale-enter-from { opacity: 0; transform: scale(.9); }
.fade-scale-leave-to { opacity: 0; transform: scale(.9); }
</style>
