<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div
      class="rounded-xl border w-full max-w-2xl max-h-[80vh] flex flex-col"
      :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'"
    >
     
      <div
        class="px-6 py-4 flex items-center justify-between border-b"
        :class="isDark ? 'border-slate-800' : 'border-slate-200'"
      >
        <h2 :class="titleClass" class="font-semibold text-lg">
          Board Activity
        </h2>

        <button
          @click="close"
          class="p-2 rounded-lg"
          :class="isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'"
        >
          <AppIcon icon="fa-times" :class="iconClass" />
        </button>
      </div>

      
      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-3 text-sm">
       
        <p
          v-if="!activity.length"
          :class="mutedClass"
          class="italic"
        >
          No activity yet.
        </p>

        
        <div
          v-for="entry in activity"
          :key="entry.id"
          class="rounded-lg border px-3 py-2"
          :class="itemClass"
        >
          <div class="flex items-center justify-between mb-1">
            <span :class="textClass">
              {{ entry.message || entry.type }}
            </span>

            <span
              class="text-[11px]"
              :class="mutedClass"
            >
              {{ formatDateTime(entry.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  open: Boolean,
  activity: Array,
  isDark: Boolean,
});

const emit = defineEmits(["close"]);

const close = () => emit("close");


const titleClass = computed(() =>
  props.isDark ? "text-white" : "text-slate-900"
);

const textClass = computed(() =>
  props.isDark ? "text-slate-200" : "text-slate-800"
);

const mutedClass = computed(() =>
  props.isDark ? "text-slate-500" : "text-slate-500"
);

const iconClass = computed(() =>
  props.isDark ? "text-slate-300" : "text-slate-600"
);

const itemClass = computed(() =>
  props.isDark
    ? "bg-slate-900 border-slate-800"
    : "bg-slate-50 border-slate-200"
);


const formatDateTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
};
</script>
