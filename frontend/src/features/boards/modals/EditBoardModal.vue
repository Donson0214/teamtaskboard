// frontend/src/features/boards/modals/EditBoardModal.vue
<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="w-full max-w-md rounded-xl border shadow-lg p-6" :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'">
      <h2 class="text-lg font-semibold mb-4" :class="isDark ? 'text-white' : 'text-slate-900'">Edit Board</h2>

      <div class="space-y-3">
        <div>
          <label class="text-sm font-medium" :class="isDark ? 'text-slate-300' : 'text-slate-700'">Name</label>
          <input v-model="localName" type="text" class="w-full mt-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500"
                 :class="isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'" />
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button class="flex-1 py-2 rounded-lg" :class="isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'" @click="$emit('close')">
          Cancel
        </button>
        <button class="flex-1 py-2 rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                @click="emitSave">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useThemeStore } from "@/shared/stores/themeStore";

const props = defineProps({ board: Object });
const emit = defineEmits(["close", "save"]);

const localName = ref(props.board?.name || "");

watch(
  () => props.board,
  (val) => {
    localName.value = val?.name || "";
  }
);

const themeStore = useThemeStore();
const { isDark } = storeToRefs(themeStore);

const emitSave = () => {
  emit("save", { id: props.board?.id, name: localName.value });
};
</script>

