<template>
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div
      :class="isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'"
      class="rounded-xl shadow-xl w-[90%] max-w-3xl p-4 relative"
    >
      
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-xl hover:opacity-70"
      >
        x
      </button>

      <h2 class="text-lg font-semibold mb-4">Attachment Preview</h2>

      
      <img
        v-if="isImage"
        :src="file.url"
        class="max-h-[70vh] mx-auto rounded-lg shadow"
      />

     
      <iframe
        v-else-if="isPDF"
        :src="file.url"
        class="w-full h-[70vh] rounded-lg border"
      ></iframe>

      
      <div v-else class="text-center py-10">
        <p class="mb-3 opacity-80">Preview not available for this file type.</p>
        <a
          :href="file.url"
          download
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Download File
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  file: { type: Object, required: true },
  isDark: Boolean,
});
const emit = defineEmits(["close"]);

const isImage = computed(() => props.file?.type?.startsWith("image/"));

const isPDF = computed(() => props.file?.type === "application/pdf");
</script>
