<template>
  <transition name="fade-scale">
    <div v-if="open" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] px-4">
      <div
        class="w-full max-w-4xl rounded-2xl shadow-2xl border p-6 relative"
        :class="isDark ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'"
      >
        <button
          @click="$emit('cancel')"
          class="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition"
        >
          <i class="fas fa-times text-lg"></i>
        </button>

        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white"
               :class="isDark ? 'bg-indigo-600' : 'bg-indigo-500'">
            <i class="fas" :class="isEdit ? 'fa-pen' : 'fa-plus'"></i>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
              {{ isEdit ? 'Update Task' : 'New Task' }}
            </p>
            <h2 class="text-xl font-bold">{{ isEdit ? 'Edit Task' : 'Create Task' }}</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left column -->
          <div class="space-y-5">
            <div>
              <label class="text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-heading text-xs"></i>
                Title
              </label>
              <input
                v-model="title"
                type="text"
                placeholder="Task title..."
                class="w-full mt-1 px-3 py-2 rounded-lg border"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'"
              />
            </div>

            <div>
              <label class="text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-align-left text-xs"></i>
                Description
              </label>
              <textarea
                v-model="description"
                :maxlength="DESCRIPTION_LIMIT"
                @input="description = description.slice(0, DESCRIPTION_LIMIT)"
                rows="4"
                placeholder="Describe the task..."
                class="w-full mt-1 px-3 py-2 rounded-lg border resize-none"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'"
              ></textarea>
              <p class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                {{ description.length }}/{{ DESCRIPTION_LIMIT }} characters
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-comment-dots text-xs"></i>
                Task Comment (optional)
              </label>
              <textarea
                v-model="comment"
                :maxlength="COMMENT_LIMIT"
                @input="comment = comment.slice(0, COMMENT_LIMIT)"
                rows="3"
                placeholder="Add a kickoff comment or mention a teammate..."
                class="w-full mt-1 px-3 py-2 rounded-lg border resize-none"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'"
              ></textarea>
              <p class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                {{ comment.length }}/{{ COMMENT_LIMIT }} characters
              </p>
            </div>
          </div>

          
          <div class="space-y-5">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold flex items-center gap-2">
                  <i class="fas fa-signal text-xs"></i>
                  Label
                </label>
                <div class="flex flex-wrap gap-2 mt-2">
                  <button
                    v-for="option in priorityOptions"
                    :key="option.value"
                    type="button"
                    class="px-3 py-1.5 rounded-full text-xs font-semibold border transition flex items-center gap-2 shadow-sm"
                    :class="isDark ? 'border-slate-700' : 'border-slate-300'"
                    :style="
                      priority === option.value
                        ? { backgroundColor: option.color, color: '#fff', borderColor: option.color }
                        : {
                            color: isDark ? '#e2e8f0' : '#334155',
                            borderColor: option.color,
                            backgroundColor: isDark ? '#0f172a' : '#fff'
                          }
                    "
                    @click="priority = option.value"
                  >
                    <span class="inline-block w-2 h-2 rounded-full" :style="{ backgroundColor: option.color }"></span>
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="text-sm font-semibold flex items-center gap-2">
                  <i class="fas fa-calendar-alt text-xs text-red-400"></i>
                  Due Date <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  v-model="dueDate"
                  class="w-full mt-1 px-3 py-2 rounded-lg border"
                  :class="isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'"
                />
              </div>
            </div>

            <div>
              <label class="text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-user text-xs"></i>
                Assign To
              </label>
              <select
                v-model="assignee"
                class="w-full mt-1 px-3 py-2 rounded-lg border"
                :class="isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300'"
              >
                <option value="">Unassigned</option>
                <option v-for="m in members" :key="m.email" :value="m.email">
                  {{ m.name || m.email }}
                </option>
              </select>
            </div>

            <div>
              <label class="text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-paperclip text-xs"></i>
                Attachments
              </label>
              <div class="mt-2">
                <label
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer text-sm font-medium"
                  :class="isDark ? 'bg-slate-800 border border-slate-700 hover:border-indigo-400' : 'bg-white border border-slate-300 hover:border-indigo-500 shadow-sm'"
                >
                  <i class="fas fa-upload"></i>
                  <span>Choose files</span>
                  <input type="file" multiple class="hidden" @change="onFileUpload" />
                </label>
                <p class="text-[11px] mt-1" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                  Images or documents. Files upload on create.
                </p>
              </div>

              <div class="flex flex-wrap gap-3 mt-3">
                <div
                  v-for="f in filePreviews"
                  :key="f.url"
                  class="w-20 h-20 rounded-md overflow-hidden border relative"
                  :class="isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'"
                >
                  <img v-if="f.type.includes('image')" :src="f.url" class="w-full h-full object-cover" />
                  <div v-else class="flex items-center justify-center h-full text-xs p-1 text-center">
                    {{ f.name }}
                  </div>
                  <button
                    @click="removeAttachment(f)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
                  >
                    x
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-if="error" class="text-red-500 text-sm mt-4">{{ error }}</p>

        <div class="flex justify-end gap-2 mt-6">
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
            {{ isEdit ? 'Save Changes' : 'Create Task' }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { PRIORITY_OPTIONS, findPriorityOption } from "@/constants/priorities";
import { useThemeStore } from "@/stores/themeStore";

const DESCRIPTION_LIMIT = 100;
const COMMENT_LIMIT = 100;

const theme = useThemeStore();
const isDark = computed(() => theme.isDark);
const priorityOptions = PRIORITY_OPTIONS;

const props = defineProps({
  open: Boolean,
  task: Object,
  labels: Array,
  members: Array,
});

const emit = defineEmits(["submit", "cancel"]);

const title = ref("");
const description = ref("");
const priority = ref(findPriorityOption().value);
const dueDate = ref("");
const assignee = ref("");
const selectedLabels = ref([]);
const comment = ref("");
const isEdit = computed(() => !!props.task);
const error = ref("");

const filePreviews = ref([]);
const attachments = ref([]);

watch(
  () => props.open,
  (val) => {
    if (!val) return;
    if (props.task) {
      title.value = props.task.title;
      description.value = props.task.description || "";
      priority.value = findPriorityOption(props.task.priority).value;
      dueDate.value = props.task.dueDate || "";
      assignee.value = props.task.assignee || "";
      selectedLabels.value = props.task.labels || [];
      comment.value = "";
    } else {
      title.value = "";
      description.value = "";
      priority.value = findPriorityOption().value;
      dueDate.value = "";
      assignee.value = "";
      selectedLabels.value = [];
      comment.value = "";
    }
    filePreviews.value = [];
    attachments.value = [];
    error.value = "";
  }
);

function toggleLabel(label) {
  if (selectedLabels.value.includes(label)) {
    selectedLabels.value = selectedLabels.value.filter((l) => l !== label);
  } else {
    selectedLabels.value.push(label);
  }
}

function onFileUpload(e) {
  const files = Array.from(e.target.files || []);
  attachments.value = files;
  filePreviews.value = files.map((f) => ({
    url: URL.createObjectURL(f),
    name: f.name,
    type: f.type,
  }));
}

function removeAttachment(file) {
  filePreviews.value = filePreviews.value.filter((f) => f.url !== file.url);
  attachments.value = attachments.value.filter((f) => f.name !== file.name);
}

function submit() {
  if (!title.value.trim()) {
    error.value = "Title is required.";
    return;
  }
  if (!dueDate.value) {
    error.value = "Due date is required.";
    return;
  }
  if (description.value.length > DESCRIPTION_LIMIT) {
    error.value = `Description is limited to ${DESCRIPTION_LIMIT} characters.`;
    return;
  }
  if (comment.value.length > COMMENT_LIMIT) {
    error.value = `Comment is limited to ${COMMENT_LIMIT} characters.`;
    return;
  }

  emit("submit", {
    title: title.value.trim(),
    description: description.value.trim(),
    priority: findPriorityOption(priority.value).value,
    dueDate: dueDate.value || null,
    assignee: assignee.value || "",
    labels: [...selectedLabels.value],
    comment: comment.value.trim(),
    attachments: attachments.value,
  });

  emit("cancel");
}
</script>

<style>
.fade-scale-enter-active,
.fade-scale-leave-active { transition: all 0.25s ease; }
.fade-scale-enter-from { opacity: 0; transform: scale(.9); }
.fade-scale-leave-to { opacity: 0; transform: scale(.9); }
</style>
