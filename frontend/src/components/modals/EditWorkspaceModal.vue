<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-xl w-full max-w-md p-6">

      <h2 class="text-lg font-semibold mb-4 dark:text-white">Edit Workspace</h2>

      <label class="text-sm dark:text-slate-300">Name</label>
      <input v-model="name"
             class="w-full mt-1 px-3 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white"/>

      <div class="flex gap-3 mt-6">
        <button class="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                @click="$emit('close')">Cancel</button>

        <button class="flex-1 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700"
                @click="save">Save</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({ workspace: Object });
const emit = defineEmits(["close", "save"]);

const name = ref(props.workspace?.name || "");

watch(
  () => props.workspace,
  (val) => {
    if (val) name.value = val.name || "";
  }
);

const save = () => {
  emit("save", { id: props.workspace?.id, name: name.value });
  emit("close");
};
</script>
