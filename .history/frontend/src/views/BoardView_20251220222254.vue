<!-- src/views/BoardView.vue -->
<template>
  <div class="min-h-screen relative overflow-hidden" :class="isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'">
    <div class="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <div
        class="absolute inset-0"
        :class="isDark ? 'bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'"
      ></div>
      <div
        class="absolute -left-24 -top-24 w-96 h-96 rounded-full blur-3xl opacity-60"
        :class="isDark ? 'bg-purple-900/25' : 'bg-purple-300/40'"
      ></div>
      <div
        class="absolute -right-24 top-6 w-80 h-80 rounded-full blur-3xl opacity-50"
        :class="isDark ? 'bg-blue-900/25' : 'bg-blue-200/60'"
      ></div>
      <div
        class="absolute -bottom-32 left-10 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-40"
        :class="isDark ? 'bg-indigo-900/20' : 'bg-indigo-200/50'"
      ></div>
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>    
      <div class="floating-shape shape-3"></div>
    </div>

    <header
      class="border-b sticky top-0 z-50 shadow-sm backdrop-blur-xl"
      :class="isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80'"
    >
      <div class="px-4 sm:px-6 py-6 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="toggleSidebar"
            class="p-2.5 rounded-xl border transition"
            :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/60' : 'border-slate-200 bg-white/70 hover:border-purple-300/70'"
          >
            <i class="fas fa-bars" :class="isDark ? 'text-white' : 'text-slate-700'"></i>
          </button>

          <div class="flex items-center gap-3">
            <div class="logo-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-7 h-7" :class="isDark ? 'text-white' : 'text-slate-800'">
                <path d="M12 2 3 7l9 5 9-5-9-5Z" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M3 7v10l9 5 9-5V7" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M12 12v10" stroke-width="1.5" stroke-linejoin="round" />
                <path d="m3 7 9 5 9-5" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
                TaskFlow
              </h1>
              <p class="text-xs font-medium tracking-wide" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                Team Task Management
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative hidden sm:block">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search boards..."
              class="pl-11 pr-4 py-3 rounded-full border shadow-inner w-72 transition focus:ring-2 focus:ring-purple-500/70"
              :class="isDark ? 'bg-slate-900/70 border-slate-800 text-white placeholder:text-slate-500' : 'bg-white/80 border-slate-200 text-slate-900 placeholder:text-slate-400'"
            />
          </div>

          <button
            @click="toggleTheme"
            class="p-2.5 rounded-xl border transition"
            :class="isDark ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50' : 'bg-white/80 border-slate-200 hover:border-purple-300/60'"
          >
            <i class="fas" :class="isDark ? 'fa-sun text-amber-400' : 'fa-moon text-slate-600'"></i>
          </button>

          <NotificationBell ref="notificationBellRef" />

          <div class="relative" ref="profileRef">
            <button
              @click="toggleProfileMenu"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition shadow-sm"
              :class="[
                isDark
                  ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/50'
                  : 'border-slate-200 bg-white hover:border-purple-200',
                profileMenuOpen ? (isDark ? 'ring-2 ring-purple-500/30' : 'ring-2 ring-indigo-100') : ''
              ]"
            >
              <div v-if="userPhotoURL" class="w-9 h-9 rounded-full overflow-hidden border border-slate-300">
                <img :src="userPhotoURL" class="w-full h-full object-cover" />
              </div>
              <div
                v-else
                class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm shadow-purple-400/40"
              >
                {{ userInitials }}
              </div>

              <div class="hidden sm:flex flex-col leading-tight text-left">
                <span class="text-xs font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
                  {{ userDisplayName }}
                </span>
                <span
                  v-if="userEmail"
                  class="text-[11px]"
                  :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                >
                  {{ userEmail }}
                </span>
              </div>

              <i
                class="fas fa-chevron-down text-[10px]"
                :class="isDark ? 'text-slate-400' : 'text-slate-500'"
              ></i>
            </button>

            <transition name="fade-scale">
              <div
                v-if="profileMenuOpen"
                class="absolute right-0 mt-2 w-64 rounded-2xl border py-3 shadow-xl z-50"
                :class="isDark ? 'bg-slate-900 border-slate-800 shadow-black/30' : 'bg-white border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.18)]'"
              >
                <div class="px-4 pb-3 border-b flex items-center gap-3" :class="isDark ? 'border-slate-800' : 'border-slate-200'">
                  <div
                    v-if="userPhotoURL"
                    class="w-10 h-10 rounded-full overflow-hidden border"
                    :class="isDark ? 'border-slate-700' : 'border-slate-200'"
                  >
                    <img :src="userPhotoURL" class="w-full h-full object-cover" />
                  </div>
                  <div
                    v-else
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold grid place-items-center"
                  >
                    {{ userInitials }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-900'">
                      {{ userDisplayName }}
                    </p>
                    <p class="text-xs truncate" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                      {{ userEmail }}
                    </p>
                  </div>
                </div>

                <div class="flex flex-col py-1">
                  <button @click="goProfile" class="menu-item flex items-center gap-2 px-4 py-2.5 text-sm font-medium" :class="menuItemClass">
                    <i class="fas fa-user-circle text-slate-500"></i> View Profile
                  </button>

                  <button @click="goSettings" class="menu-item flex items-center gap-2 px-4 py-2.5 text-sm font-medium" :class="menuItemClass">
                    <i class="fas fa-cog text-slate-500"></i> Account Settings
                  </button>

                  <button @click="toggleTheme" class="menu-item flex items-center gap-2 px-4 py-2.5 text-sm font-medium" :class="menuItemClass">
                    <i class="fas fa-adjust text-slate-500"></i> Toggle Theme
                  </button>

                  <button
                    @click="handleLogoutFromMenu"
                    class="menu-item flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <i class="fas fa-sign-out-alt text-red-500"></i>
                    Logout
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>
    <div class="flex min-h-0">
      <transition name="slide">
        <aside
          v-show="sidebarOpen"
          class="w-[280px] border-r h-full min-h-0 p-4 transition overflow-y-auto"
          :class="isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-white border-slate-200'"
        >
          <div class="flex flex-col h-full gap-5">
            <nav class="space-y-1">
              <button
                v-for="item in sidebarNav"
                :key="item.id"
                @click="handleNavClick(item)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition border"
                :class="activeNav === item.id
                  ? (isDark ? 'border-slate-700 bg-slate-800/80 text-white' : 'border-slate-200 bg-slate-100 text-slate-900')
                  : (isDark ? 'border-transparent text-slate-300 hover:bg-slate-900/60' : 'border-transparent text-slate-700 hover:bg-slate-50')"
              >
                <i :class="[(item.style || 'far'), item.icon, 'text-base']"></i>
                <span>{{ item.label }}</span>
              </button>
            </nav>

            <div class="flex-1 border-t pt-4" :class="isDark ? 'border-slate-800' : 'border-slate-200'">
              <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] mb-3" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                <span>Workspaces</span>
                <span
                  v-if="filteredWorkspaces.length"
                  class="px-2 py-1 rounded-full text-[11px] font-semibold"
                  :class="isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'"
                >
                  {{ filteredWorkspaces.length }}
                </span>
              </div>

              <div class="space-y-2 max-h-72 overflow-y-auto custom-scroll pr-1">
                

                <button
                  v-for="workspace in filteredWorkspaces"
                  :key="workspace.id"
                  @click="goToWorkspace(workspace)"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold border transition"
                  :title="workspace.name"
                  :class="selectedWorkspaceId === workspace.id
                    ? (isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-indigo-100 bg-indigo-50 text-indigo-700')
                    : (isDark ? 'border-slate-800 text-slate-200 hover:bg-slate-900/60' : 'border-slate-200 text-slate-800 hover:bg-slate-100')"
                >
                  <span class="w-8 h-8 rounded-md grid place-items-center text-xs font-bold" :class="isDark ? 'bg-amber-200/20 text-amber-200' : 'bg-amber-100 text-amber-700'">
                    {{ workspace.name?.slice(0, 1)?.toUpperCase() || 'W' }}
                  </span>
                  <span class="truncate">{{ workspace.name }}</span>
                </button>

                <div v-if="!filteredWorkspaces.length" class="text-[11px] text-slate-500 px-2">
                  No spaces
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2 border-t pt-4" :class="isDark ? 'border-slate-800' : 'border-slate-200'">
              <button
                @click="toggleTheme"
                class="flex-1 px-3 py-2 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2"
                :class="isDark ? 'border-slate-800 text-slate-200 hover:border-slate-600' : 'border-slate-200 text-slate-700 hover:border-slate-300'"
                title="Toggle theme"
              >
                <i class="far fa-moon text-sm"></i>
                Theme
              </button>
              <button
                @click="handleLogout"
                class="flex-1 px-3 py-2 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2"
                :class="isDark ? 'border-slate-800 text-red-300 hover:border-red-500/60' : 'border-slate-200 text-red-500 hover:border-red-300/60'"
                title="Logout"
              >
                <i class="fas fa-sign-out-alt text-sm"></i>
                Logout
              </button>
            </div>
          </div>
        </aside>
      </transition>

      <!-- MAIN -->
      <main class="p-6 flex-1 min-w-0">
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
                    <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-500'"></span>
                  </div>
                </div>

                <div
                  class="min-w-[150px] px-4 py-3 rounded-xl border shadow-sm"
                  :class="isDark ? 'bg-slate-900/70 border-slate-800 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-800'"
                >
                  <p class="text-xs uppercase tracking-wide" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Members</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xl font-bold">{{ currentWorkspace?.members?.length || 0 }}</span>
                    <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-500'"></span>
                  </div>
                </div>

                <div
                  class="min-w-[150px] px-4 py-3 rounded-xl border shadow-sm"
                  :class="isDark ? 'bg-slate-900/70 border-slate-800 text-slate-100' : 'bg-white/80 border-slate-200 text-slate-800'"
                >
                  <p class="text-xs uppercase tracking-wide" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Role</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xl font-bold capitalize">{{ userRole || 'guest' }}</span>
                    <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-500'"></span>
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
              v-for="board in filteredBoards"
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
    </div>

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
import { ref, shallowRef, onMounted, computed, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";

import NotificationBell from "@/components/common/NotificationBell.vue";
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
const { workspaces } = storeToRefs(workspaceStore);
const toggleTheme = themeStore.toggleTheme;

/* PARAM */
const workspaceId = ref(route.params.workspaceId);

/* STATE */
const showCreateBoard = ref(false);
const showEditWorkspace = ref(false);
const showInvite = ref(false);
const showManage = ref(false);
const showEditBoard = ref(false);
const boardBeingEdited = shallowRef(null);
const boardToDelete = shallowRef(null);
const openBoardDropdown = ref(null);
const sidebarOpen = ref(true);
const searchQuery = ref("");
const debouncedSearchQuery = ref("");
const profileMenuOpen = ref(false);
const profileRef = ref(null);
const notificationBellRef = ref(null);
const activeNav = ref("boards");
const activeFilter = ref("all");
const workspaceFilter = computed(() => {
  if (activeNav.value === "owned") return "owned";
  if (activeNav.value === "shared") return "shared";
  return activeFilter.value;
});

/* COMPUTED */
const currentWorkspace = computed(() =>
  workspaceStore.getWorkspaceById(workspaceId.value)
);

const boards = computed(() =>
  workspaceStore.getBoards(workspaceId.value) || []
);

const userDisplayName = computed(
  () => user.value?.name || user.value?.displayName || user.value?.email || "User"
);
const userEmail = computed(() => user.value?.email || "");
const userEmailLower = computed(() => userEmail.value?.toLowerCase() || "");
const userPhotoURL = computed(() => user.value?.photoURL || user.value?.imageUrl || null);
const userInitials = computed(() => {
  const name = userDisplayName.value || "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

const membershipByWorkspaceId = computed(() => {
  const roleById = new Map();
  const email = userEmailLower.value;
  const list = workspaces.value || [];

  for (const workspace of list) {
    let role = "member";
    if (email && Array.isArray(workspace.members)) {
      const member = workspace.members.find(
        (m) => m.email?.toLowerCase?.() === email
      );
      if (member) {
        role = (member.role || "member").toLowerCase();
      }
    }
    roleById.set(workspace.id, role);
  }

  return roleById;
});

const userRole = computed(
  () => membershipByWorkspaceId.value.get(workspaceId.value) || "member"
);

const isOwner = computed(() => userRole.value === "owner");
const isGuest = computed(() => userRole.value === "guest");

const boardCount = computed(() => boards.value.length);

const menuItemClass = computed(() =>
  isDark.value ? "text-slate-200 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
);

const sidebarNav = [
  { id: "dashboard", icon: "fa-gauge-high", style: "fas", label: "Dashboard" },
  { id: "home", icon: "fa-house", style: "fas", label: "Home" },
  { id: "boards", icon: "fa-clipboard", style: "fas", label: "Boards" },
  { id: "tasks", icon: "fa-tasks", style: "fas", label: "Tasks" },
  { id: "owned", icon: "fa-folder-open", style: "far", label: "My spaces" },
  { id: "shared", icon: "fa-handshake", style: "far", label: "Collabs" },
];

let searchDebounceTimer = null;
watch(searchQuery, (value) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    debouncedSearchQuery.value = value.trim();
  }, 150);
});

const filteredWorkspaces = computed(() => {
  const list = workspaces.value || [];
  const roleById = membershipByWorkspaceId.value;
  if (workspaceFilter.value === "owned") {
    return list.filter((w) => roleById.get(w.id) === "owner");
  }
  if (workspaceFilter.value === "shared") {
    return list.filter((w) => roleById.get(w.id) !== "owner");
  }
  return list;
});

const filteredBoards = computed(() => {
  const q = debouncedSearchQuery.value.toLowerCase();
  if (!q) return boards.value;

  return boards.value.filter((board) => {
    const nameMatch = board.name?.toLowerCase().includes(q);
    const descMatch = board.description?.toLowerCase().includes(q);
    return nameMatch || descMatch;
  });
});

const selectedWorkspaceId = computed(() => currentWorkspace.value?.id || workspaceId.value);

let isActive = true;

/* LOAD DATA */
const loadWorkspaceData = async (id) => {
  if (!id) return;
  workspaceStore.setCurrentWorkspace(id);
  await Promise.all([
    workspaceStore.loadMembers(id),
    workspaceStore.loadBoards(id),
  ]);
};

onMounted(async () => {
  await workspaceStore.loadWorkspaces();
  await loadWorkspaceData(workspaceId.value);

  document.addEventListener("click", handleOutsideClick);
});

watch(
  () => route.params.workspaceId,
  async (newId) => {
    if (!newId || newId === workspaceId.value) return;
    workspaceId.value = newId;
    await loadWorkspaceData(newId);
  }
);

/* BOARD ACTIONS */
const toggleBoardMenu = (id) => {
  openBoardDropdown.value = openBoardDropdown.value === id ? null : id;
};

const goToBoard = (boardId) => {
  openBoardDropdown.value = null;
  router.push(`/workspace/${workspaceId.value}/board/${boardId}`);
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

  const ok = await workspaceStore.deleteBoard(
    workspaceId.value,
    boardToDelete.value.id
  );
  if (!ok) {
    alert("Failed to delete board");
    boardToDelete.value = null;
    return;
  }
  boardToDelete.value = null;
};

const closeEditBoard = () => {
  showEditBoard.value = false;
  boardBeingEdited.value = null;
};

const saveBoard = async ({ id, name }) => {
  if (!id || !name) return;

  const updated = await workspaceStore.updateBoard(workspaceId.value, id, { name });
  if (!updated) {
    alert("Failed to update board");
    return;
  }
  closeEditBoard();
};

/* WORKSPACE ACTIONS */
const openInviteMembers = () => {
  if (isGuest.value) return;
  showInvite.value = true;
};

const openManageMembers = async () => {
  if (isGuest.value) return;
  await workspaceStore.loadMembers(workspaceId.value);
  if (!isActive) return;
  showManage.value = true;
};

const goToWorkspace = async (workspace) => {
  if (workspace?.isOptimistic) return;
  if (!workspace?.id || workspace.id === workspaceId.value) return;
  await router.push(`/workspace/${workspace.id}`);
};

/* CREATE BOARD CALLBACK */
const handleBoardCreated = async (board) => {
  if (!board) {
    alert("Failed to create board");
    return;
  }
  showCreateBoard.value = false;
};

/* UI HANDLERS (header/sidebar) */
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value;
};

const handleOutsideClick = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    profileMenuOpen.value = false;
  }
};

onBeforeUnmount(() => {
  isActive = false;
  document.removeEventListener("click", handleOutsideClick);
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = null;
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

const handleLogoutFromMenu = () => {
  profileMenuOpen.value = false;
  handleLogout();
};

const goProfile = () => {
  profileMenuOpen.value = false;
  router.push("/profile");
};

const goSettings = () => {
  profileMenuOpen.value = false;
  router.push("/settings");
};

const handleNavClick = (item) => {
  activeNav.value = item.id;
  if (item.id === "dashboard") {
    activeFilter.value = "all";
    router.push("/dashboard");
    return;
  }
  if (item.id === "boards") {
    activeFilter.value = "all";
    if (workspaceId.value) {
      router.push(`/workspace/${workspaceId.value}`);
    } else {
      router.push("/workspace");
    }
    return;
  }
  if (item.id === "tasks") {
    activeFilter.value = "all";
    const boardId = boards.value?.[0]?.id;
    if (workspaceId.value && boardId) {
      router.push(`/workspace/${workspaceId.value}/board/${boardId}`);
    } else if (workspaceId.value) {
      router.push(`/workspace/${workspaceId.value}`);
    } else {
      router.push("/workspace");
    }
    return;
  }
  if (item.id === "owned") {
    activeFilter.value = "owned";
    router.push({ path: "/workspace", query: { filter: "owned" } });
  } else if (item.id === "shared") {
    activeFilter.value = "shared";
    router.push({ path: "/workspace", query: { filter: "shared" } });
  } else {
    activeFilter.value = "all";
    router.push("/workspace");
  }
};
</script>
