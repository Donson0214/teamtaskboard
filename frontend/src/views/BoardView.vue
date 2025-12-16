<!-- src/views/BoardView.vue -->
<template>
  <div class="min-h-screen relative overflow-hidden" :class="isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'">
    <div class="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <div
        class="absolute inset-0"
        :class="isDark ? 'bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'"
      ></div>
      <div
        class="absolute -left-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-50"
        :class="isDark ? 'bg-purple-900/25' : 'bg-purple-200/60'"
      ></div>
      <div
        class="absolute -right-16 top-10 w-72 h-72 rounded-full blur-3xl opacity-50"
        :class="isDark ? 'bg-blue-900/25' : 'bg-blue-200/60'"
      ></div>
    </div>

    <!-- HEADER -->
    <header
      class="border-b sticky top-0 z-40 backdrop-blur-xl"
      :class="isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80'"
    >
      <div class="px-6 py-4 flex items-center justify-between gap-4">
        <!-- Left -->
        <div class="flex items-center gap-4">
          <button
            @click="router.push('/workspace')"
            class="p-2.5 rounded-xl border transition"
            :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/60' : 'border-slate-200 bg-white/80 hover:border-purple-300/70'"
          >
            <i class="fas fa-arrow-left" :class="isDark ? 'text-white' : 'text-slate-700'"></i>
          </button>

          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/30 ring-1 ring-white/30 dark:ring-0"
            >
              {{ (currentWorkspace?.name || 'W')[0] }}
            </div>
            <div>
              <h1 class="text-xl font-bold leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ currentWorkspace?.name || "Workspace" }}
              </h1>
              <div class="flex items-center gap-3 text-sm">
                <span :class="isDark ? 'text-slate-300' : 'text-slate-600'">
                  {{ currentWorkspace?.members?.length || 0 }} members
                </span>
                <span
                  class="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
                  :class="isDark ? 'bg-purple-900/40 text-purple-100 border border-purple-800/60' : 'bg-purple-50 text-purple-700 border border-purple-200'"
                >
                  {{ userRole || 'guest' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-2 flex-wrap justify-end">
          <button
            v-if="!isGuest"
            @click="openInviteMembers"
            class="px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-semibold transition"
            :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/50' : 'border-slate-200 bg-white/80 hover:border-purple-300/60'"
          >
            <i class="fas fa-user-plus text-purple-500"></i>
            Invite
          </button>
          <button
            v-if="!isGuest"
            @click="openManageMembers"
            class="px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-semibold transition"
            :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/50' : 'border-slate-200 bg-white/80 hover:border-purple-300/60'"
          >
            <i class="fas fa-users-cog text-purple-500"></i>
            Manage
          </button>
      
          <button
            v-if="!isGuest"
            @click="showCreateBoard = true"
            class="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md shadow-purple-500/30 flex items-center gap-2"
          >
            <i class="fas fa-plus"></i>
            New Board
          </button>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="p-6">
      <div class="max-w-6xl mx-auto space-y-6">
        <!-- HERO / SUMMARY -->
        <div
          class="relative overflow-hidden rounded-2xl border shadow-sm p-6 md:p-7"
          :class="isDark ? 'bg-slate-900/70 border-slate-800/80' : 'bg-white/90 border-slate-200/80 backdrop-blur-sm'"
        >
          <div
            class="absolute inset-0 opacity-70 pointer-events-none"
            :class="isDark ? 'bg-gradient-to-r from-purple-900/10 via-transparent to-blue-900/10' : 'bg-gradient-to-r from-purple-50 via-white to-blue-50'"
          ></div>
          <div class="relative flex flex-wrap items-start md:items-center justify-between gap-4">
            <div class="space-y-2">
              <div
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                :class="isDark ? 'bg-purple-900/30 text-purple-100 border border-purple-800/60' : 'bg-purple-50 text-purple-700 border border-purple-100'"
              >
                <span class="h-2 w-2 rounded-full bg-purple-500"></span>
                Boards
              </div>
              <h2 class="text-2xl font-bold" :class="isDark ? 'text-white' : 'text-slate-900'">Workspace Boards</h2>
              <p class="text-sm" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                Quick view of your boards, members, and permissions.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <div
                class="min-w-[150px] px-4 py-3 rounded-xl border shadow-sm"
                :class="isDark ? 'bg-slate-900/70 border-slate-800 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-800'"
              >
                <p class="text-xs uppercase tracking-wide" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Boards</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xl font-bold">{{ boardCount }}</span>
                  <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-500'">live</span>
                </div>
              </div>

              <div
                class="min-w-[150px] px-4 py-3 rounded-xl border shadow-sm"
                :class="isDark ? 'bg-slate-900/70 border-slate-800 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-800'"
              >
                <p class="text-xs uppercase tracking-wide" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Members</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xl font-bold">{{ currentWorkspace?.members?.length || 0 }}</span>
                  <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-500'">collabs</span>
                </div>
              </div>

              <div
                class="min-w-[150px] px-4 py-3 rounded-xl border shadow-sm"
                :class="isDark ? 'bg-slate-900/70 border-slate-800 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-800'"
              >
                <p class="text-xs uppercase tracking-wide" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Role</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-xl font-bold capitalize">{{ userRole || 'guest' }}</span>
                  <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-500'">access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">Boards</h3>
          <p class="text-sm" :class="isDark ? 'text-slate-400' : 'text-slate-600'">Organize your tasks with boards.</p>
        </div>

        <!-- BOARD GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Board Card -->
          <div
            v-for="board in boards"
            :key="board.id"
            @click="goToBoard(board.id)"
            class="relative cursor-pointer p-5 rounded-2xl border transition group shadow-lg shadow-black/5 overflow-visible hover:-translate-y-1 hover:shadow-xl"
            :class="isDark ? 'bg-slate-900/70 border-slate-800 hover:border-purple-500/60' : 'bg-white/90 border-slate-200 hover:border-purple-300/70'"
          >
            <div
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none"
            ></div>

            <!-- Board Dropdown Button -->
            <button
              v-if="!isGuest"
              @click.stop="toggleBoardMenu(board.id)"
              class="absolute top-3 right-3 p-2 rounded-lg border transition z-10"
              :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/50' : 'border-slate-200 bg-white/80 hover:border-purple-300/60'"
            >
              <i class="fas fa-ellipsis-h text-sm" :class="isDark ? 'text-slate-300' : 'text-slate-600'"></i>
            </button>

            <!-- DROPDOWN MENU -->
            <div
              v-if="openBoardDropdown === board.id"
              class="absolute right-3 top-12 w-48 rounded-xl border shadow-md shadow-black/10 z-50 p-1 origin-top-right transform transition duration-150 backdrop-blur-md"
              :class="isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'"
            >
              <ul class="py-2 text-sm">
                <li
                  @click.stop="goToBoard(board.id)"
                  class="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <i class="fas fa-eye text-xs"></i>
                  View Board
                </li>

                <li
                  v-if="!isGuest"
                  @click.stop="openEditBoard(board)"
                  class="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <i class="fas fa-edit text-xs"></i>
                  Edit Board
                </li>

                <li
                  v-if="isOwner"
                  @click.stop="openDeleteBoard(board)"
                  class="px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                >
                  <i class="fas fa-trash text-xs text-red-500"></i>
                  <span class="text-red-500">Delete Board</span>
                </li>
              </ul>
            </div>

            <div class="relative flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-md shadow-purple-500/30"
                :style="{ background: board.color }"
              >
                <i :class="board.icon"></i>
              </div>
              <div>
                <h3 class="font-semibold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">
                  {{ board.name }}
                </h3>
                <div class="flex items-center gap-2 text-sm" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                  <i class="fas fa-list-check text-xs"></i>
                  <span>{{ board.tasksCount || 0 }} tasks</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Create Board Card -->
          <button
            v-if="!isGuest"
            @click="showCreateBoard = true"
            class="relative p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[180px] transition hover:-translate-y-1 hover:shadow-xl"
            :class="isDark ? 'bg-slate-900/70 border-slate-800 hover:border-purple-500/60' : 'bg-white/90 border-slate-200 hover:border-purple-300/70'"
          >
            <div
              class="absolute inset-0 pointer-events-none opacity-60"
              :class="isDark ? 'bg-gradient-to-br from-slate-900 via-purple-900/10 to-blue-900/10' : 'bg-gradient-to-br from-white via-purple-50 to-blue-50'"
            ></div>
            <div class="relative flex flex-col items-center gap-2">
              <div
                class="w-12 h-12 rounded-full border flex items-center justify-center text-2xl font-semibold"
                :class="isDark ? 'border-purple-500/60 text-purple-200 bg-purple-950/40' : 'border-purple-300 text-purple-600 bg-purple-50'"
              >
                <i class="fas fa-plus"></i>
              </div>
              <span class="font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">Create Board</span>
              <p class="text-sm text-center max-w-[240px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                Spin up a new board for this workspace.
              </p>
            </div>
          </button>
        </div>
      </div>
    </main>

    <!-- MODALS -->
    <CreateBoardModal
      v-if="showCreateBoard"
      :workspaceId="workspaceId"
      @close="showCreateBoard = false"
      @created="handleBoardCreated"
    />

    <EditWorkspaceModal
      v-if="showEditWorkspace"
      :workspace="currentWorkspace"
      @close="showEditWorkspace = false"
    />

    <InviteMembersModal
      v-if="showInvite"
      :workspace-id="workspaceId"
      @close="showInvite = false"
    />

    <ManageMembersModal
      v-if="showManage"
      :workspace-id="workspaceId"
      @close="showManage = false"
    />

    <EditBoardModal
      v-if="showEditBoard && boardBeingEdited"
      :board="boardBeingEdited"
      @close="closeEditBoard"
      @save="saveBoard"
    />

    <transition name="fade-scale">
      <div
        v-if="boardToDelete"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="cancelDeleteBoard"
      >
        <div
          class="w-full max-w-md rounded-xl border shadow-xl p-6 space-y-4"
          :class="isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold">Delete board</h3>
              <p class="text-sm" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                This will permanently remove the board and everything inside it.
              </p>
            </div>
          </div>

          <div
            class="text-xs rounded-lg border px-3 py-2"
            :class="isDark ? 'border-red-800 bg-red-900/30 text-red-100' : 'border-red-200 bg-red-50 text-red-700'"
          >
            "{{ boardToDelete.name }}" and its columns, tasks, files, and comments will be deleted.
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="cancelDeleteBoard"
              class="px-4 py-2 rounded-lg font-medium"
              :class="isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            >
              Cancel
            </button>
            <button
              @click="confirmDeleteBoard"
              class="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>


<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";

import CreateBoardModal from "@/components/modals/CreateBoardModal.vue";
import EditWorkspaceModal from "@/components/modals/EditWorkspaceModal.vue";
import InviteMembersModal from "@/components/modals/InviteMembersModal.vue";
import ManageMembersModal from "@/components/modals/ManageMembersModal.vue";
import EditBoardModal from "@/components/modals/EditBoardModal.vue";

const router = useRouter();
const route = useRoute();

/* STORES */
const workspaceStore = useWorkspaceStore();
const themeStore = useThemeStore();
const authStore = useAuthStore();

const { isDark } = storeToRefs(themeStore);
const { user } = storeToRefs(authStore);

/* PARAM */
const workspaceId = route.params.workspaceId;

/* STATE */
const boards = ref([]);
const showCreateBoard = ref(false);
const showEditWorkspace = ref(false);
const showInvite = ref(false);
const showManage = ref(false);
const showEditBoard = ref(false);
const boardBeingEdited = ref(null);
const boardToDelete = ref(null);
const openBoardDropdown = ref(null);

/* COMPUTED */
const currentWorkspace = computed(() =>
  workspaceStore.getWorkspaceById(workspaceId)
);

const userRole = computed(() =>
  workspaceStore.getUserRole(workspaceId, user.value?.email)
);

const isOwner = computed(() => userRole.value === "owner");
const isGuest = computed(() => userRole.value === "guest");

const boardCount = computed(() => boards.value.length);

/* LOAD DATA */
onMounted(async () => {
  await workspaceStore.loadWorkspaces();
  await workspaceStore.loadMembers(workspaceId);
  workspaceStore.setCurrentWorkspace(workspaceId);

  boards.value = await workspaceStore.loadBoards(workspaceId);
});

/* BOARD ACTIONS */
const toggleBoardMenu = (id) => {
  openBoardDropdown.value = openBoardDropdown.value === id ? null : id;
};

const goToBoard = (boardId) => {
  openBoardDropdown.value = null;
  router.push(`/workspace/${workspaceId}/board/${boardId}`);
};

const openEditBoard = (board) => {
  if (isGuest.value) return;
  openBoardDropdown.value = null;
  boardBeingEdited.value = { ...board };
  showEditBoard.value = true;
};

const openDeleteBoard = (board) => {
  openBoardDropdown.value = null;
  boardToDelete.value = board;
};

const cancelDeleteBoard = () => {
  boardToDelete.value = null;
};

const confirmDeleteBoard = async () => {
  if (!boardToDelete.value) return;

  await workspaceStore.deleteBoard(workspaceId, boardToDelete.value.id);
  boards.value = await workspaceStore.loadBoards(workspaceId);
  boardToDelete.value = null;
};

const closeEditBoard = () => {
  showEditBoard.value = false;
  boardBeingEdited.value = null;
};

const saveBoard = async ({ id, name }) => {
  if (!id || !name) return;

  await workspaceStore.updateBoard(workspaceId, id, { name });
  boards.value = await workspaceStore.loadBoards(workspaceId);
  closeEditBoard();
};

/* WORKSPACE ACTIONS */
const openInviteMembers = () => {
  if (isGuest.value) return;
  showInvite.value = true;
};

const openManageMembers = async () => {
  if (isGuest.value) return;
  await workspaceStore.loadMembers(workspaceId);
  showManage.value = true;
};

/* CREATE BOARD CALLBACK */
const handleBoardCreated = async () => {
  boards.value = await workspaceStore.loadBoards(workspaceId);
  showCreateBoard.value = false;
};
</script>
