<template>
  <transition name="fade-scale">
    <div
      v-if="open && task"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] px-4"
    >
      <div
        class="w-full max-w-3xl xl:max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl relative border overflow-hidden"
        :class="containerClass"
      >
        <div
          class="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r"
          :class="accentBar"
        ></div>

        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-slate-400 hover:text-red-400 transition"
        >
          <i class="fas fa-times text-lg"></i>
        </button>

        <div class="max-h-[70vh] overflow-y-auto p-6 md:p-8 space-y-6">
          
          <div
            class="flex items-start justify-between gap-4 pb-4 border-b"
            :class="dividerClass"
          >
            <div class="space-y-1">
              <p class="text-xs uppercase tracking-wide" :class="mutedText">
                {{ columnTitle || "Task" }}
              </p>
              <input
                v-model="localTitle"
                :disabled="readonly"
                @blur="saveField('title')"
                class="w-full text-xl font-semibold bg-transparent border-b pb-1"
                :class="[inputBorder, focusAccent, readonly ? 'opacity-70 cursor-not-allowed' : '']"
                placeholder="Task title"
              />
            </div>

            <div class="flex flex-col gap-2 items-end">
              <span
                class="px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm"
                :class="badgeClass"
              >
                {{ roleLabel }}
              </span>
              <span
                class="px-3 py-1.5 rounded-full text-[11px] font-semibold border shadow-sm inline-flex items-center gap-2"
                :class="viewModeBadge"
              >
                <i :class="readonly ? 'fas fa-lock' : 'fas fa-pen'"></i>
                {{ readonly ? "View only" : "Editing enabled" }}
              </span>
              <button
                v-if="!readonly"
                class="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-60"
                :disabled="!canUpdateTask"
                @click="handleUpdateTask"
              >
                <i class="fas fa-save text-[11px] mr-1"></i> Update task
              </button>
            </div>
          </div>

          <div class="space-y-5">
          
            <div :class="sectionCard" class="p-4 md:p-5">
              <div class="flex items-center justify-between mb-3">
                <label class="text-sm font-semibold" :class="mutedText">Description</label>
                <span class="text-[11px]" :class="mutedText">Autosaves on blur</span>
              </div>
              <textarea
                v-model="localDescription"
                :disabled="readonly"
                rows="4"
                class="w-full px-3 py-2 rounded-lg border resize-none min-h-[140px] leading-relaxed"
                :class="[inputClass, readonly ? 'opacity-70 cursor-not-allowed' : '']"
                placeholder="Describe the task..."
                @blur="saveField('description')"
              ></textarea>
            </div>

            
            <div :class="sectionCard" class="p-4 md:p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-semibold" :class="mutedText">Task details</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <label class="text-sm font-semibold" :class="mutedText">Priority</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="option in priorityOptions"
                      :key="option.value"
                      type="button"
                      :disabled="readonly"
                      class="px-3 py-1.5 rounded-full text-xs font-semibold border transition flex items-center gap-2 shadow-sm"
                      :class="[inputBorder, readonly ? 'opacity-60 cursor-not-allowed' : '']"
                      :style="
                        localPriority === option.value
                          ? { backgroundColor: option.color, color: '#fff', borderColor: option.color }
                          : { color: props.isDark ? '#e2e8f0' : '#334155', borderColor: option.color }
                      "
                      @click="setPriority(option.value)"
                    >
                      <span class="inline-block w-2 h-2 rounded-full" :style="{ backgroundColor: option.color }"></span>
                      {{ option.label }}
                    </button>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-semibold" :class="mutedText">Due Date</label>
                  <input
                    type="date"
                    v-model="localDueDate"
                    :disabled="readonly"
                    class="w-full px-3 py-2 rounded-lg border"
                    :class="[inputClass, readonly ? 'opacity-70 cursor-not-allowed' : '']"
                    @change="saveField('dueDate')"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-semibold" :class="mutedText">Assignee</label>
                  <select
                    v-model="localAssignee"
                    :disabled="readonly"
                    class="w-full px-3 py-2 rounded-lg border"
                    :class="[inputClass, readonly ? 'opacity-70 cursor-not-allowed' : '']"
                    @change="saveField('assignee')"
                  >
                    <option value="">Unassigned</option>
                    <option
                      v-for="m in memberOptions"
                      :key="m.email"
                      :value="m.email"
                    >
                      {{ m.name || m.email }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            
            <div :class="sectionCard" class="p-4 md:p-5">
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-semibold" :class="mutedText">Attachments</label>
                <label
                  v-if="!readonly"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                  :class="uploadClass"
                >
                  <input type="file" class="hidden" multiple @change="onFileChange" />
                  Upload
                </label>
              </div>

              <p
                v-if="!task.attachments?.length"
                class="text-sm italic"
                :class="mutedText"
              >
                No attachments yet.
              </p>

              <div class="space-y-2">
                <div
                  v-for="file in task.attachments || []"
                  :key="file.id || file.url"
                  class="flex items-center justify-between rounded-lg border px-3 py-2"
                  :class="rowClass"
                >
                  <div>
                    <p class="text-sm font-semibold">{{ file.name }}</p>
                    <p class="text-xs" :class="mutedText">{{ file.type || file.fileType || "file" }}</p>
                  </div>

                  <div class="flex gap-2 text-xs">
                    <button
                      class="underline"
                      @click="preview(file)"
                    >
                      Preview
                    </button>
                    <button
                      class="underline"
                      :class="readonly ? 'cursor-not-allowed opacity-60' : 'text-red-500'"
                      :disabled="readonly"
                      @click="deleteAttachment(file.id)"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            
            <div :class="sectionCard" class="p-4 md:p-5 space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-semibold" :class="mutedText">Comments</label>
              </div>

              <div class="flex items-center flex-wrap gap-2" v-if="mentionOptions.length && !readonly">
                <span class="text-xs font-semibold" :class="mutedText">Mention:</span>
                <button
                  v-for="m in mentionOptions"
                  :key="m.value"
                  type="button"
                  class="px-2 py-1 rounded-full text-xs border shadow-sm"
                  :class="props.isDark ? 'border-slate-600 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'"
                  @click="appendMention(m.value)"
                >
                  @{{ m.label }}
                </button>
              </div>

              <div class="space-y-2">
                <div
                  v-for="c in task.comments || []"
                  :key="c.id"
                  class="rounded-lg border px-3 py-3"
                  :class="rowClass"
                >
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="flex items-center gap-2">
                      <span
                        class="w-8 h-8 rounded-full bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center"
                      >
                        {{ (c.author || c.user?.email || 'U')[0]?.toUpperCase() }}
                      </span>
                      <div>
                        <p class="text-sm font-semibold leading-tight">
                          {{ c.author || c.user?.email || "User" }}
                        </p>
                        <p class="text-[11px]" :class="mutedText">
                          {{ formatDate(c.createdAt) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ c.text || c.content }}</p>
                </div>
                <p v-if="!task.comments?.length" class="text-sm italic" :class="mutedText">
                  No comments yet.
                </p>
              </div>

              <div v-if="!readonly" class="space-y-2 border-t pt-3" :class="dividerClass">
                <textarea
                  v-model="newComment"
                  rows="3"
                  class="w-full px-3 py-2 rounded-lg border text-sm"
                  :class="inputClass"
                  placeholder="Write a comment..."
                ></textarea>
                <div class="flex justify-end">
                  <button
                    class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
                    :disabled="!newComment.trim()"
                    @click="submitComment"
                  >
                    Comment
                  </button>
                </div>
              </div>
              <p v-else class="text-xs italic" :class="mutedText">
                Comments are disabled in view-only mode.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { PRIORITY_OPTIONS, findPriorityOption } from "@/constants/priorities";

const props = defineProps({
  open: Boolean,
  task: Object,
  columnTitle: String,
  labels: { type: Array, default: () => [] },
  role: { type: String, default: "member" },
  viewOnly: { type: Boolean, default: false },
  isDark: Boolean,
  members: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "close",
  "toggle-label",
  "add-comment",
  "upload-attachment",
  "delete-attachment",
  "update-task",
  "preview",
]);

const readonly = computed(() => props.viewOnly || props.role === "guest");
const containerClass = computed(() =>
  props.isDark
    ? "bg-slate-900 text-white border-slate-800"
    : "bg-white text-slate-900 border-slate-200"
);
const accentBar = computed(() =>
  props.isDark
    ? "from-indigo-500/60 via-sky-500/50 to-purple-500/50"
    : "from-indigo-500 via-sky-400 to-purple-500"
);
const focusAccent = computed(() =>
  props.isDark
    ? "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
    : "focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
);
const inputClass = computed(() =>
  `${props.isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"} ${focusAccent.value} disabled:opacity-70 disabled:cursor-not-allowed`
);
const inputBorder = computed(() =>
  props.isDark ? "border-slate-700 hover:border-indigo-400 transition-colors" : "border-slate-300 hover:border-indigo-400 transition-colors"
);
const mutedText = computed(() =>
  props.isDark ? "text-slate-400" : "text-slate-500"
);
const badgeClass = computed(() =>
  props.isDark
    ? "bg-slate-800 border-slate-700 text-slate-200"
    : "bg-slate-100 border-slate-300 text-slate-700"
);
const rowClass = computed(() =>
  props.isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
);
const uploadClass = computed(() =>
  props.isDark
    ? "bg-slate-800 border border-slate-700 hover:border-indigo-400"
    : "bg-slate-100 border border-slate-300 hover:border-indigo-500"
);
const sectionCard = computed(() =>
  props.isDark
    ? "bg-slate-900/70 border border-slate-800 rounded-xl shadow-lg shadow-black/20"
    : "bg-white/90 border border-slate-200 rounded-xl shadow-sm"
);
const dividerClass = computed(() =>
  props.isDark ? "border-slate-800/70" : "border-slate-200"
);
const viewModeBadge = computed(() =>
  readonly.value
    ? props.isDark
      ? "bg-slate-800 text-slate-200 border border-slate-700"
      : "bg-blue-50 text-blue-700 border border-blue-100"
    : props.isDark
      ? "bg-emerald-900/40 text-emerald-200 border border-emerald-800/70"
      : "bg-emerald-50 text-emerald-700 border border-emerald-100"
);
const priorityOptions = PRIORITY_OPTIONS;

const localTitle = ref("");
const localDescription = ref("");
const localPriority = ref(findPriorityOption().value);
const localDueDate = ref("");
const localAssignee = ref("");
const newComment = ref("");

const memberOptions = computed(() =>
  (props.members || []).map((m) => ({
    email: m.email,
    name: m.name,
  }))
);

const mentionOptions = computed(() => {
  const seen = new Set();
  return (props.members || [])
    .filter((m) => m.email)
    .map((m) => ({
      value: m.email,
      label: m.name || m.email,
    }))
    .filter((opt) => {
      if (seen.has(opt.value)) return false;
      seen.add(opt.value);
      return true;
    });
});

const roleLabel = computed(() => (props.role || "member").toUpperCase());

watch(
  () => props.task,
  (task) => {
    if (!task) return;
    localTitle.value = task.title || "";
    localDescription.value = task.description || "";
    localPriority.value = findPriorityOption(task.priority).value;
    localDueDate.value = task.dueDate || "";
    localAssignee.value = task.assignee || "";
    newComment.value = "";
  },
  { immediate: true }
);

const setPriority = (value) => {
  if (readonly.value) return;
  localPriority.value = value;
  saveField("priority");
};

const saveField = (field) => {
  if (readonly.value || !props.task) return;

  const patch = {};
  if (field === "title") patch.title = localTitle.value.trim();
  if (field === "description") patch.description = localDescription.value.trim();
  if (field === "priority") patch.priority = findPriorityOption(localPriority.value).value;
  if (field === "dueDate") patch.dueDate = localDueDate.value || null;
  if (field === "assignee") patch.assignee = localAssignee.value;

  emit("update-task", { taskId: props.task.id, patch });
};

const toggleLabel = (name) => {
  if (readonly.value || !props.task) return;
  emit("toggle-label", { taskId: props.task.id, labelName: name });
};

const onFileChange = (e) => {
  if (readonly.value || !props.task) return;
  const files = Array.from(e.target.files || []);
  files.forEach((file) =>
    emit("upload-attachment", { taskId: props.task.id, file })
  );
  e.target.value = "";
};

const deleteAttachment = (attachmentId) => {
  if (readonly.value || !props.task) return;
  emit("delete-attachment", { taskId: props.task.id, attachmentId });
};

const preview = (file) => emit("preview", file);

const submitComment = () => {
  if (readonly.value || !props.task) return;
  if (!newComment.value.trim()) return;
  emit("add-comment", { taskId: props.task.id, text: newComment.value.trim() });
  newComment.value = "";
};

const appendMention = (handle) => {
  const token = `@${handle} `;
  if (newComment.value.includes(token)) return;
  newComment.value = `${newComment.value}${newComment.value.endsWith(" ") || !newComment.value ? "" : " "}${token}`;
};

const labelStyle = (label) => {
  const active = props.task?.labels?.includes(label.name);
  return {
    backgroundColor: active ? label.color : "transparent",
    borderColor: label.color,
    color: active ? "white" : props.isDark ? "#e2e8f0" : "#475569",
    opacity: active ? 1 : 0.7,
  };
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
};

const patchPayload = computed(() => {
  if (!props.task) return {};
  const patch = {};
  const originalTitle = props.task.title || "";
  const trimmedTitle = localTitle.value.trim();
  if (trimmedTitle !== originalTitle) patch.title = trimmedTitle;

  const originalDescription = props.task.description || "";
  const trimmedDescription = localDescription.value.trim();
  if (trimmedDescription !== originalDescription) patch.description = trimmedDescription;

  const originalPriority = props.task.priority || "medium";
  const nextPriority = findPriorityOption(localPriority.value).value;
  if (nextPriority !== originalPriority) patch.priority = nextPriority;

  const originalDueDate = props.task.dueDate || "";
  const formattedDueDate = localDueDate.value || "";
  if (formattedDueDate !== originalDueDate) patch.dueDate = formattedDueDate || null;

  const originalAssignee = props.task.assignee || "";
  const nextAssignee = localAssignee.value || "";
  if (nextAssignee !== originalAssignee) patch.assignee = nextAssignee || null;

  return patch;
});

const canUpdateTask = computed(() => Object.keys(patchPayload.value).length > 0);

const handleUpdateTask = () => {
  if (readonly.value || !props.task) return;
  const patch = patchPayload.value;
  if (!Object.keys(patch).length) return;
  emit("update-task", { taskId: props.task.id, patch });
};
</script>

<style>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s ease;
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(.95);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(.95);
}
</style>
