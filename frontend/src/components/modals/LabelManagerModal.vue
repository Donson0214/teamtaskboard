<template>
  <div
    v-if="open"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="close"
  >
    <div
      :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'"
      class="rounded-xl border w-full max-w-md max-h-[80vh] flex flex-col"
    >
     
      <header
        class="px-6 py-4 flex items-center justify-between border-b"
        :class="isDark ? 'border-slate-800' : 'border-slate-200'"
      >
        <h2 :class="titleClass" class="font-semibold text-lg">Board Labels</h2>

        <button
          @click="close"
          class="p-2 rounded-lg"
          :class="isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'"
        >
          <i class="fas fa-times" :class="iconClass"></i>
        </button>
      </header>

     
      <main class="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm">

       
        <section class="space-y-3">
          <p :class="mutedClass" class="text-xs uppercase tracking-wide">
            Existing labels
          </p>

          <p
            v-if="labels.length === 0"
            class="italic text-xs"
            :class="mutedClass"
          >
            No labels yet. Create one below.
          </p>

          <div
            v-for="label in labels"
            :key="label.name"
            class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border"
            :class="cardClass"
          >
            <!-- Left: Color + Editable Name -->
            <div class="flex items-center gap-2 flex-1">
              <span
                class="w-6 h-6 rounded-full border"
                :style="{ backgroundColor: label.color, borderColor: label.color }"
              ></span>

              <input
                v-model="editNames[label.name]"
                @blur="rename(label.name)"
                class="bg-transparent border-none text-sm focus:outline-none w-full"
                :class="textClass"
              />
            </div>

            
            <div class="flex items-center gap-2">
              <!-- Color options -->
              <button
                v-for="color in presetColors"
                :key="color"
                class="w-4 h-4 rounded-full border"
                :style="{ backgroundColor: color, borderColor: color }"
                @click="changeColor(label.name, color)"
              ></button>

              
              <button
                @click="remove(label.name)"
                class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <i class="fas fa-trash text-xs text-red-500"></i>
              </button>
            </div>
          </div>
        </section>

        
        <section class="border-t pt-3" :class="borderClass">
          <p :class="mutedClass" class="text-xs uppercase tracking-wide mb-2">
            Create new label
          </p>

          <div class="space-y-2">
            <input
              v-model="newName"
              type="text"
              placeholder="Label name"
              class="w-full px-3 py-2 rounded-lg border text-sm"
              :class="inputClass"
            />

            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span :class="mutedClass" class="text-xs">Color:</span>

                
                <button
                  v-for="color in presetColors"
                  :key="color"
                  class="w-5 h-5 rounded-full border"
                  :style="{
                    backgroundColor: color,
                    borderColor: color,
                    boxShadow: newColor === color ? '0 0 0 2px rgba(129, 140, 248, 0.8)' : 'none'
                  }"
                  @click="newColor = color"
                ></button>
              </div>

              <button
                @click="create"
                :disabled="!newName.trim()"
                class="px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-600 to-blue-600 text-white disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  open: Boolean,
  labels: Array,
  isDark: Boolean,
});

const emit = defineEmits([
  "close",
  "create",
  "rename",
  "change-color",
  "delete",
]);


const newName = ref("");
const newColor = ref("#ef4444");


const editNames = ref({});


const presetColors = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#64748b", // gray
];


watch(
  () => props.labels,
  () => {
    const map = {};
    props.labels.forEach((l) => (map[l.name] = l.name));
    editNames.value = map;
  },
  { immediate: true }
);



const close = () => emit("close");

const create = () => {
  emit("create", newName.value.trim(), newColor.value);
  newName.value = "";
  newColor.value = presetColors[0];
};

const rename = (oldName) => {
  const newLabel = editNames.value[oldName]?.trim();
  if (!newLabel || newLabel === oldName) return;
  emit("rename", oldName, newLabel);
};

const changeColor = (name, color) => {
  emit("change-color", name, color);
};

const remove = (name) => {
  if (!confirm(`Delete label "${name}"?`)) return;
  emit("delete", name);
};

// STYLE COMPUTED -------------------------------------------

const titleClass = computed(() =>
  props.isDark ? "text-white" : "text-slate-900"
);

const textClass = computed(() =>
  props.isDark ? "text-slate-200" : "text-slate-800"
);

const mutedClass = computed(() =>
  props.isDark ? "text-slate-400" : "text-slate-600"
);

const iconClass = computed(() =>
  props.isDark ? "text-slate-300" : "text-slate-600"
);

const inputClass = computed(() =>
  props.isDark
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-slate-300 text-slate-900"
);

const cardClass = computed(() =>
  props.isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-slate-50"
);

const borderClass = computed(() =>
  props.isDark ? "border-slate-800" : "border-slate-200"
);
</script>
