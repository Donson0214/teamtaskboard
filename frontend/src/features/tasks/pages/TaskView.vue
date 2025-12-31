
<template>
<div
  class="min-h-screen relative overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
  :class="isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'"
> 


  <ColumnModal
    v-if="showColumnModal"
    :open="showColumnModal"
    :mode="columnModalMode"
    :initial-title="editingColumn?.title"
    :initial-color="editingColumn?.color"
    @submit="handleColumnSubmit"
    @cancel="closeColumnModal"
  />

  
  <TaskModal
    v-if="showTaskCreate"
    :open="showTaskCreate"
    :labels="labels"
    :members="members"
    @cancel="showTaskCreate = false"
    @submit="createNewTask"
  />


  <header
    class="border-b sticky top-0 z-50 shadow-sm backdrop-blur-xl"
    :class="[
      isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80',
      sidebarOpen ? 'sm:ml-[280px]' : 'sm:ml-20'
    ]"
  >
    <div class="px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div class="w-full">
        <div class="flex items-end gap-2">
          <div class="flex-1 min-w-0 flex items-end gap-2 overflow-x-auto no-scrollbar flex-nowrap">
            <div class="flex flex-col min-w-[120px]">
              <span class="text-xs font-semibold uppercase whitespace-nowrap" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Status</span>
              <select v-model="filterStatus" :class="filterInputClass">
                <option value="all">All columns</option>
                <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
              </select>
            </div>
            <div class="flex flex-col min-w-[120px]">
              <span class="text-xs font-semibold uppercase whitespace-nowrap" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Assignee</span>
              <select v-model="filterAssignee" :class="filterInputClass">
                <option value="all">All</option>
                <option v-for="person in assigneeOptions" :key="person" :value="person">{{ person }}</option>
              </select>
            </div>
            <div class="flex flex-col min-w-[130px]">
              <span class="text-xs font-semibold uppercase whitespace-nowrap" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Priority labels</span>
              <select v-model="filterPriority" :class="filterInputClass">
                <option value="all">All</option>
                <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            <div class="flex flex-col min-w-[130px]">
              <span class="text-xs font-semibold uppercase whitespace-nowrap" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Labels</span>
              <select v-model="filterLabel" :class="filterInputClass">
                <option value="all">All</option>
                <option v-for="label in labelOptions" :key="label" :value="label">{{ label }}</option>
              </select>
            </div>
            <div class="flex flex-col min-w-[130px]">
              <span class="text-xs font-semibold uppercase whitespace-nowrap" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Due before</span>
              <input
                v-model="filterDueDate"
                type="date"
                :class="filterInputClass"
              />
            </div>
            <button
              @click="clearFilters"
              class="px-4 py-2 text-xs rounded-full font-semibold"
              :class="isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
            >
              Clear
            </button>
            
          </div>

          <div class="ml-auto flex items-center gap-2 shrink-0 self-end">
            <div class="relative hidden sm:block shrink-0">
              <AppIcon icon="fa-search" class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search tasks..."
                class="pl-11 pr-4 py-3 rounded-full border shadow-inner w-56 xl:w-64 transition focus:ring-2 focus:ring-purple-500/70"
                :class="isDark ? 'bg-slate-900/70 border-slate-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'"
              />
            </div>
            <button
              @click="toggleTheme"
              class="p-3 min-h-[44px] min-w-[44px] rounded-xl border transition"
              :class="isDark ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50' : 'bg-white/80 border-slate-200 hover:border-purple-300/60'"
            >
            <AppIcon :icon="isDark ? 'fa-sun' : 'fa-moon'" :class="isDark ? 'text-amber-400 text-lg' : 'text-slate-600 text-lg'" />
            </button>

            <NotificationBell />

            <div class="relative" ref="activityRef">
              <button
                @click.stop="openActivity"
                class="p-3 min-h-[44px] min-w-[44px] rounded-xl border transition"
                :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/50' : 'border-slate-200 bg-white/80 hover:border-purple-300/60'"
              >
              <AppIcon icon="fa-clock" class="text-slate-500 text-lg" />
              </button>

              <transition name="fade-scale">
                <div
                  v-if="activityOpen"
                  class="absolute right-0 mt-3 w-[min(20rem,calc(100vw-2rem))] rounded-xl border shadow-xl p-3 z-50"
                  :class="isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'"
                  @click.stop
                >
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <p class="text-sm font-semibold">Activity</p>
                      <p class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                        Recent updates
                      </p>
                    </div>
                  </div>

                  <div
                    v-if="!liveActivity.length"
                    class="text-xs px-3 py-2 rounded-lg"
                    :class="isDark ? 'text-slate-400 bg-slate-800/60' : 'text-slate-600 bg-slate-50'"
                  >
                    No activity yet.
                  </div>

                  <div v-else class="space-y-2 max-h-80 overflow-y-auto custom-scroll">
                    <div
                      v-for="event in liveActivity"
                      :key="event.id"
                      class="flex items-start gap-3 p-2 rounded-xl transition"
                      :class="isDark ? 'hover:bg-slate-800/80' : 'hover:bg-slate-50'"
                    >
                      <div class="w-8 h-8 rounded-full grid place-items-center text-xs font-semibold text-white" :class="event.badgeBg">
                        <AppIcon :icon="event.icon" />
                      </div>
                      <div class="flex-1">
                        <p class="text-sm" :class="isDark ? 'text-white' : 'text-slate-800'">
                          <strong>{{ event.user }}</strong> {{ event.action }}
                          <span v-if="event.target" class="text-purple-600 dark:text-purple-300 font-semibold"> {{ event.target }}</span>
                        </p>
                        <div class="text-[12px] flex items-center gap-2" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                          <span class="flex items-center gap-1"><AppIcon icon="fa-clock" class="text-[10px]" /> {{ event.when }}</span>
                          <span class="w-1.5 h-1.5 rounded-full" :class="event.statusDot"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <div class="relative" ref="profileRef">
              <button
                @click="toggleProfileMenu"
                class="flex items-center gap-2 px-2.5 py-1.5 min-h-[44px] rounded-xl border transition"
                :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/50' : 'border-slate-200 bg-white/80 hover:border-purple-300/60'"
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
              <div class="hidden xl:flex flex-col leading-tight text-left">
                <span class="text-xs font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
                  {{ userDisplayName }}
                </span>
                <span
                  v-if="userEmail"
                  class="text-[11px] hidden 2xl:block"
                  :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                >
                  {{ userEmail }}
                  </span>
                </div>
                <AppIcon
                  icon="fa-chevron-down"
                  class="text-[10px]"
                  :class="isDark ? 'text-slate-400' : 'text-slate-500'"
                />
              </button>

              <transition name="fade-scale">
                <div
                  v-if="profileMenuOpen"
                  class="absolute right-0 mt-2 w-[min(16rem,calc(100vw-2rem))] rounded-xl border py-2 shadow-lg shadow-black/10 z-50"
                  :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'"
                >
                  <div class="px-4 pb-2 border-b" :class="isDark ? 'border-slate-800' : 'border-slate-200'">
                    <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
                      {{ userDisplayName }}
                    </p>
                    <p class="text-xs truncate" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                      {{ userEmail }}
                    </p>
                  </div>

                  <button @click="toggleTheme" class="menu-item" :class="menuItemClass">
                    <AppIcon icon="fa-adjust" class="text-base" /> Toggle Theme
                  </button>

                  <button
                    @click="handleLogoutFromMenu"
                    class="menu-item text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                  <AppIcon icon="fa-sign-out-alt" class="text-base" />
                  Logout
                </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div
    class="flex min-h-0"
    :class="sidebarOpen ? 'sm:ml-[280px]' : 'sm:ml-20'"
  >

    <transition name="slide">
        <aside
          class="border-r h-full min-h-0 p-4 transition-all duration-200 overflow-y-auto fixed inset-y-0 left-0 z-40"
          :class="[
            isDark ? 'bg-slate-950/90 border-slate-800/80' : 'bg-white border-slate-200',
            sidebarOpen ? 'w-[260px] sm:w-[280px]' : 'w-20'
          ]"
        >
          <div class="flex flex-col h-full gap-5">
            <div class="flex items-center gap-3" :class="sidebarOpen ? 'justify-between' : 'justify-center'">
              <button
                type="button"
                class="flex items-center gap-3 text-left"
                :class="sidebarOpen ? 'flex-1' : 'justify-center'"
                @click="!sidebarOpen && toggleSidebar()"
                :aria-label="sidebarOpen ? 'Workspace branding' : 'Expand sidebar'"
              >
                <div class="logo-flat">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="w-7 h-7"
                    :class="isDark ? 'text-white' : 'text-slate-900'"
                  >
                    <path d="M12 2 3 7l9 5 9-5-9-5Z" />
                    <path d="M3 7v10l9 5 9-5V7" />
                    <path d="M12 12v10" />
                  </svg>
                </div>
                <div v-if="sidebarOpen">
                  <h1 class="text-base font-semibold leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
                    TaskFlow
                  </h1>
                  
                </div>
              </button>
              <button
                v-if="sidebarOpen"
                @click="toggleSidebar"
                class="p-3 min-h-[44px] min-w-[44px] rounded-xl transition"
                :class="isDark ? 'bg-slate-900/80 hover:bg-slate-800/80' : 'bg-white/80 hover:bg-slate-100/80'"
                aria-label="Collapse sidebar"
              >
                <AppIcon icon="fa-chevron-right" :class="isDark ? 'text-white' : 'text-slate-700'" />
              </button>
            </div>
            <nav class="space-y-1">
              <button
                v-for="item in sidebarNav"
                :key="item.id"
                @click="handleNavClick(item)"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition border"
                :title="sidebarOpen ? '' : item.label"
                :class="[
                  activeNav === item.id
                    ? (isDark ? 'border-slate-700 bg-slate-800/80 text-white' : 'border-slate-200 bg-slate-100 text-slate-900')
                    : (isDark ? 'border-transparent text-slate-300 hover:bg-slate-900/60' : 'border-transparent text-slate-700 hover:bg-slate-50'),
                  sidebarOpen ? 'justify-start' : 'justify-center px-2 gap-0'
                ]"
              >
                <AppIcon :icon="item.icon" class="text-2xl" />
                <span v-if="sidebarOpen">{{ item.label }}</span>
              </button>
            </nav>

            <div v-if="sidebarOpen" class="flex-1 border-t pt-4" :class="isDark ? 'border-slate-800' : 'border-slate-200'">
              <div class="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] mb-3" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                <span>Boards</span>
                <span
                  v-if="filteredBoards.length"
                  class="px-2 py-1 rounded-full text-[11px] font-semibold"
                  :class="isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'"
                >
                  {{ filteredBoards.length }}
                </span>
              </div>

              <div class="relative mb-3">
                <AppIcon icon="fa-search" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="boardSearch"
                  type="text"
                  placeholder="Search boards..."
                  class="w-full pl-9 pr-3 py-2 rounded-lg border text-sm"
                  :class="isDark ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'"
                />
              </div>

              <div class="space-y-2 max-h-[420px] overflow-y-auto custom-scroll pr-1">
                <button
                  v-for="board in filteredBoards"
                  :key="board.id"
                  @click="goToBoard(board)"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold border transition"
                  :title="board.name"
                  :class="selectedBoardId === board.id
                    ? (isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-indigo-100 bg-indigo-50 text-indigo-700')
                    : (isDark ? 'border-slate-800 text-slate-200 hover:bg-slate-900/60' : 'border-slate-200 text-slate-800 hover:bg-slate-100')"
                >
                  <span class="w-8 h-8 rounded-md grid place-items-center text-xs font-bold" :class="isDark ? 'bg-amber-200/20 text-amber-200' : 'bg-amber-100 text-amber-700'">
                    {{ board.name?.slice(0, 1)?.toUpperCase() || 'B' }}
                  </span>
                  <span class="truncate">{{ board.name }}</span>
                </button>

                <div v-if="!filteredBoards.length" class="text-[11px] text-slate-500 px-2">
                  No boards
                </div>
              </div>
            </div>
            <div v-else class="flex-1 border-t pt-4" :class="isDark ? 'border-slate-800' : 'border-slate-200'">
              <div class="flex flex-col items-center gap-2">
                <div class="text-[10px] font-semibold uppercase tracking-[0.2em]" :class="isDark ? 'text-slate-500' : 'text-slate-400'">
                  Boards
                </div>
                <div class="flex flex-col items-center gap-2 max-h-[260px] overflow-y-auto custom-scroll w-full">
                  <button
                    v-for="board in filteredBoards"
                    :key="board.id"
                    @click="goToBoard(board)"
                    class="w-full flex items-center justify-center"
                    :title="board.name"
                  >
                    <span
                      class="w-10 h-10 rounded-xl grid place-items-center text-xs font-bold border"
                      :class="String(selectedBoardId) === String(board.id)
                        ? (isDark ? 'bg-slate-800 text-white border-slate-700' : 'bg-indigo-50 text-indigo-700 border-indigo-100')
                        : (isDark ? 'bg-slate-900/80 text-slate-200 border-slate-800' : 'bg-white text-slate-800 border-slate-200')"
                    >
                      {{ getInitial(board.name, "B") }}
                    </span>
                  </button>
                  <div v-if="!filteredBoards.length" class="text-[10px] text-slate-500 px-2">
                    No boards
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex gap-2 border-t pt-4"
              :class="[
                isDark ? 'border-slate-800' : 'border-slate-200',
                sidebarOpen ? 'flex-row items-center justify-between' : 'flex-col items-stretch'
              ]"
            >
              <button
                @click="toggleTheme"
                class="px-3 py-2 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2"
                :class="[
                  isDark ? 'border-slate-800 text-slate-200 hover:border-slate-600' : 'border-slate-200 text-slate-700 hover:border-slate-300',
                  sidebarOpen ? 'flex-1' : 'w-full px-0 py-2.5'
                ]"
                title="Toggle theme"
              >
                <AppIcon icon="fa-moon" class="text-base" />
                <span v-if="sidebarOpen">Theme</span>
              </button>
              <button
                @click="handleLogout"
                class="px-3 py-2 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2"
                :class="[
                  isDark ? 'border-slate-800 text-red-300 hover:border-red-500/60' : 'border-slate-200 text-red-500 hover:border-red-300/60',
                  sidebarOpen ? 'flex-1' : 'w-full px-0 py-2.5'
                ]"
                title="Logout"
              >
                <AppIcon icon="fa-sign-out-alt" class="text-base" />
                <span v-if="sidebarOpen">Logout</span>
              </button>
            </div>
        </div>
      </aside>
    </transition>
    

    <div class="flex-1 min-w-0 flex flex-col">

    <main class="flex-1 overflow-x-auto p-4 sm:p-6 relative">
      <div
        v-if="isLoading"
        class="absolute right-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm"
        :class="isDark ? 'bg-slate-900/80 border-slate-700 text-slate-200' : 'bg-white/90 border-slate-200 text-slate-700'"
      >
        <LoadingSpinner class="h-3.5 w-3.5" />
        Loading...
      </div>
        <div class="w-full">
        <div class="flex gap-4 pb-4 text-sm overflow-x-auto no-scrollbar sm:flex-wrap">

      
        <div v-for="column in orderedColumns" :key="column.id" class="w-full max-w-xs flex flex-col gap-2 transition hover:-translate-y-1 sm:w-80">

          <div :class="columnHeaderClass" class="rounded-t-xl border border-b-0 px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between shadow-sm backdrop-blur-md">
            <div class="flex items-center gap-2">
              <div :style="{ background: column.color }" class="w-2 h-2 rounded-full"></div>
              <h3 class="font-semibold text-sm">{{ column.title }}</h3>
              <span :class="badgeClass" class="px-2 py-0.5 rounded text-xs font-medium">{{ column.tasks.length }}</span>
            </div>

            <div v-if="canManageColumns" class="flex items-center gap-1">
              <button
                @click="moveColumn(column, -1)"
                class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                :disabled="isFirstColumn(column)"
                title="Move left"
              >
                <AppIcon icon="fa-chevron-left" :class="isDark ? 'text-xs text-slate-100' : 'text-xs text-black'" />
              </button>
              <button
                @click="moveColumn(column, 1)"
                class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                :disabled="isLastColumn(column)"
                title="Move right"
              >
                <AppIcon icon="fa-chevron-right" :class="isDark ? 'text-xs text-slate-100' : 'text-xs text-black'" />
              </button>
              <button
                @click="openEditColumnModal(column)"
                class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Edit column"
              >
                <AppIcon icon="fa-pen" class="text-xs" />
              </button>
              <button
                @click="confirmDeleteColumn(column)"
                class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete column"
              >
                <AppIcon icon="fa-trash" class="text-xs text-red-500" />
              </button>
            </div>
          </div>

          
          <div
            :class="columnBodyClass"
            class="flex-1 rounded-b-xl border p-3 min-h-[360px] sm:min-h-[500px] shadow-sm transition-colors"
          >
            <draggable
              :list="isFiltering ? (filteredTasksByColumnId[column.id] || []) : (column.tasks || [])"
              item-key="id"
              :group="{ name: 'tasks' }"
              :disabled="!canEditTasks || isFiltering"
              :sort="false"
              ghost-class="task-ghost"
              chosen-class="task-chosen"
              drag-class="task-drag"
              class="space-y-3"
              @change="handleTaskDragChange(column, $event)"
            >
              <template #item="{ element: task }">
                <div
                  @click="openTaskModal(task, column)"
                  :class="taskCardClass"
                  class="task-card p-3 sm:p-4 rounded-xl border cursor-pointer relative overflow-visible"
                >
                  <div class="flex items-start justify-between mb-3 gap-2">
                    <h4 class="font-medium text-sm leading-tight flex-1 min-w-0 break-words task-title-clamp">
                      {{ task.title }}
                    </h4>

                    <div v-if="canEditTasks" class="relative">
                      <button
                        @click.stop="toggleTaskMenu(task.id)"
                        class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <AppIcon icon="fa-ellipsis-vertical" class="text-xs" />
                      </button>
                      <div
                        v-if="openTaskMenuId === task.id"
                        class="absolute right-0 mt-1 w-32 rounded-lg border shadow-lg z-10"
                        :class="isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'"
                      >
                        <button
                          class="w-full text-left px-3 py-2 text-xs"
                          :class="actionMenuItemClass"
                          @click.stop="forceViewTask(task, column)"
                        >
                          <AppIcon icon="fa-eye" class="mr-2 text-[11px]" />View task
                        </button>
                        <button
                          class="w-full text-left px-3 py-2 text-xs"
                          :class="actionMenuItemClass"
                          @click.stop="openTaskModal(task, column); closeTaskMenu()"
                        >
                          <AppIcon icon="fa-pen" class="mr-2 text-[11px]" />Edit task
                        </button>
                        <button
                          v-if="canDeleteTasks"
                          class="w-full text-left px-3 py-2 text-xs text-red-600"
                          :class="isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'"
                          @click.stop="confirmDeleteTask(task, column); closeTaskMenu()"
                        >
                          <AppIcon icon="fa-trash" class="mr-2 text-[11px]" />Delete task
                        </button>
                      </div>
                    </div>
                  </div>

                  <p v-if="task.description" class="text-xs mb-3 opacity-70 break-words task-desc-clamp">
                    {{ task.description }}
                  </p>

                  <div v-if="task.labels?.length" class="flex flex-wrap gap-1 mb-2">
                    <span
                      v-for="label in task.labels"
                      :key="label"
                      class="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      :style="{ backgroundColor: getLabelColor(label), color: 'white' }"
                      :title="`Label: ${label} - Color: ${getLabelColor(label)}`"
                    >
                      {{ label }}
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-[11px] gap-2 flex-wrap">
                    <span :class="priorityClass(task.priority)" class="inline-flex items-center gap-1">
                      <AppIcon icon="fa-bolt" class="text-[10px]" />
                      {{ task.priority }}
                    </span>
                    <span v-if="task.assignee" class="inline-flex items-center gap-1 px-2 py-1 rounded-full"
                      :class="isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'">
                      <AppIcon icon="fa-user" class="text-[10px]" />{{ task.assignee }}
                    </span>
                    <span v-if="task.dueDate" class="inline-flex items-center gap-1 px-2 py-1 rounded-full"
                      :class="isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'">
                      <AppIcon icon="fa-calendar" class="text-[10px]" />{{ task.dueDate }}
                    </span>
                  </div>

                  <div
                    class="flex items-center justify-between gap-2 text-[11px] mt-2"
                    v-if="(task.comments?.length || 0) > 0 || commentPreview(task)"
                  >
                    <div :class="isDark ? 'text-slate-400' : 'text-slate-500'" class="flex items-center gap-1">
                      <AppIcon icon="fa-comments" class="text-[10px]" />
                      <span>{{ task.comments?.length || 0 }}</span>
                    </div>
                    <p
                      v-if="commentPreview(task)"
                      class="flex-1 text-right overflow-hidden text-ellipsis whitespace-nowrap"
                      :class="isDark ? 'text-slate-200' : 'text-slate-700'"
                      style="max-width: 180px"
                    >
                      {{ commentPreview(task) }}
                    </p>
                  </div>

                  <div v-if="getRecentComments(task, 1).length" class="mt-2 space-y-2">
                    <div
                      v-for="c in getRecentComments(task, 1)"
                      :key="c.id"
                      class="text-[11px] rounded-lg border px-2 py-2 overflow-hidden"
                      :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'"
                    >
                      <div class="flex items-center justify-between gap-2 mb-1">
                        <span class="font-semibold truncate min-w-0 flex-1">
                          {{ c.author || c.user?.email || 'User' }}
                        </span>
                        <span class="text-[10px] shrink-0" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
                          {{ new Date(c.createdAt).toLocaleString() }}
                        </span>
                      </div>
                      <p class="comment-clamp break-words">{{ c.text || c.content }}</p>
                    </div>
                  </div>

                  <div
                    v-if="quickCommentTaskId === task.id"
                    class="mt-3 p-3 rounded-lg border"
                    :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'"
                    @click.stop
                  >
                    <div class="flex items-center flex-wrap gap-2 mb-2" v-if="mentionOptions.length && role !== 'guest'">
                      <span class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Mention:</span>
                      <button
                        v-for="m in mentionOptions"
                        :key="m.value"
                        type="button"
                        class="px-2 py-1 rounded-full text-[11px] border"
                        :class="isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'"
                        @click="appendMentionToken(m.value)"
                      >
                        @{{ m.label }}
                      </button>
                    </div>

                    <textarea
                      v-model="quickCommentText"
                      rows="3"
                      class="w-full px-3 py-2 rounded-lg border text-xs"
                      :class="isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'"
                      placeholder="Add a quick comment..."
                      @click.stop
                    ></textarea>
                    <div class="flex justify-end mt-2 gap-2">
                      <button
                        class="px-3 py-1 text-[11px] rounded-lg"
                        :class="isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'"
                        @click.stop="toggleQuickComment(null)"
                      >
                        Cancel
                      </button>
                      <button
                        class="px-3 py-1 text-[11px] rounded-lg text-white"
                        :class="isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'"
                        :disabled="!quickCommentText.trim()"
                        @click.stop="submitQuickComment(task.id)"
                      >
                        Comment
                      </button>
                    </div>
                  </div>

                  <div class="mt-2 flex gap-2" v-else>
                    <button
                      v-if="canEditTasks"
                      class="px-3 py-1 text-[11px] rounded-full border"
                      :class="isDark ? 'border-slate-700 text-slate-200 hover:border-indigo-400 hover:text-indigo-100 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'"
                      @click.stop="toggleQuickComment(task.id)"
                    >
                      <AppIcon icon="fa-comment-dots" class="mr-1 text-[10px]" />
                    </button>
                    <button
                      v-if="canEditTasks"
                      class="px-3 py-1 text-[11px] rounded-full border"
                      :class="isDark ? 'border-purple-700 text-purple-100 bg-purple-900/30 hover:bg-purple-800/40' : 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100'"
                      @click.stop="openTaskModal(task, column)"
                    >
                      <AppIcon icon="fa-pen" class="mr-1 text-[10px]" />
                    </button>
                  </div>
                </div>
              </template>
            </draggable>

            
            <button
              v-if="canEditTasks"
              @click="openNewTaskModal(column.id)"
              class="w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm mt-3"
            >
              <AppIcon icon="fa-plus" /> Add Task
            </button>

          </div>

        </div>

        
        <button
          v-if="canManageColumns"
          @click="openCreateColumnModal"
          class="w-full max-w-xs sm:w-80 h-32 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm transition hover:-translate-y-1 hover:shadow-xl"
          :class="isDark ? 'bg-slate-900/60 border-slate-800 hover:border-purple-500/60' : 'bg-white/90 border-slate-200 hover:border-purple-300/70'"
        >
          <AppIcon icon="fa-plus" /> Add Column
        </button>

      </div>
      </div>
    </main>

  </div>
</div>

  
  <TaskDetailsModal
      v-if="showTaskModal"
      :key="selectedTask?.id || 'task-details'"
      :open="showTaskModal"
      :task="selectedTask"
      :column-title="selectedTaskColumnTitle"
      :labels="labels"
      :members="members"
      :role="role"
      :view-only="taskModalMode === 'view'"
      :is-dark="isDark"
      @close="closeTaskModal"
      @toggle-label="toggleTaskLabel"
      @update-task="updateTask"
      @add-comment="addComment"
      @upload-attachment="uploadAttachment"
      @delete-attachment="deleteAttachment"
      @preview="openPreviewModal"
    />

    <LabelManagerModal
      v-if="showLabelManager"
      :labels="labels"
      :is-dark="isDark"
      @close="showLabelManager = false"
      @create="createNewLabel"
      @rename="renameLabel"
      @change-color="changeLabelColor"
      @delete="deleteLabel"
    />



    <AttachmentPreviewModal
      v-if="previewModal.open"
      :file="previewModal.file"
      :is-dark="isDark"
      @close="closePreviewModal"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, defineAsyncComponent } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";

import { useBoardStore } from "@/features/boards/stores/boardStore";
import { useWorkspaceStore } from "@/features/workspaces/stores/workspaceStore";
import { useThemeStore } from "@/shared/stores/themeStore";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useActivityStore } from "@/features/tasks/stores/activityStore";

import { useNotificationStore } from "@/shared/stores/notificationStore";
import { useSidebarState } from "@/shared/composables/useSidebarState";

import NotificationBell from "@/shared/components/common/NotificationBell.vue";
import LoadingSpinner from "@/shared/components/common/LoadingSpinner.vue";

const AttachmentPreviewModal = defineAsyncComponent(() =>
  import("@/features/tasks/modals/AttachmentPreviewModal.vue")
);
const ColumnModal = defineAsyncComponent(() =>
  import("@/features/tasks/modals/ColumnModal.vue")
);
const LabelManagerModal = defineAsyncComponent(() =>
  import("@/features/tasks/modals/LabelManagerModal.vue")
);
const TaskDetailsModal = defineAsyncComponent(() =>
  import("@/features/tasks/modals/TaskDetailsModal.vue")
);
const TaskModal = defineAsyncComponent(() =>
  import("@/features/tasks/modals/TaskModal.vue")
);
import { PRIORITY_OPTIONS } from "@/shared/constants/priorities";
import { ensureSocket, socket } from "@/shared/config/socket.js";
import draggable from "vuedraggable";



const router = useRouter();
const route = useRoute();

const goBack = () => {
  if (workspaceId.value) {
    router.push({
      name: "BoardView",
      params: {
        workspaceId: workspaceId.value,
      },
    });
  } else {
    router.push("/workspace");
  }
};


const boardStore = useBoardStore();
const workspaceStore = useWorkspaceStore();
const themeStore = useThemeStore();
const auth = useAuthStore();
const activityStore = useActivityStore();

const { columns, totalTasks, boardActivity, labels } = storeToRefs(boardStore);
const { events: activityEvents } = storeToRefs(activityStore);
const { isDark } = storeToRefs(themeStore);
const { toggleTheme } = themeStore;
const { user, userInitials } = storeToRefs(auth);

const notificationStore = useNotificationStore();

const currentUserName = () =>
  user.value?.name || user.value?.displayName || user.value?.email || "";

const formatRelativeTime = (iso) => {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return "just now";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const liveActivity = computed(() =>
  (activityEvents.value || []).map((entry) => ({
    ...entry,
    when: formatRelativeTime(entry.createdAt),
  }))
);

let isActive = true;
let joinedBoardId = null;

/* ? FIX: define recordActivityEntry (this was missing and caused the error) */
const recordActivityEntry = (entry = {}) => {
  activityStore.push({
    user: entry.user || currentUserName(),
    ...entry,
  });
};
/* ? END FIX */

const pushLocalNotification = (task, message) => {
  if (!message) return;
  const payload = {
    id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    task: task
      ? {
          id: task.id,
          title: task.title,
          boardId: boardStore.boardId,
          workspaceId: workspaceId.value,
        }
      : undefined,
    persisted: false,
  };
  notificationStore.items = [payload, ...notificationStore.items].slice(0, 50);
};

const findTaskById = (taskId) => {
  for (const col of columns.value || []) {
    const task = (col.tasks || []).find((t) => t.id === taskId);
    if (task) return { task, column: col };
  }
  return { task: null, column: null };
};

const normalizeSocketAttachment = (attachment) => ({
  ...attachment,
  url: attachment?.fileUrl || attachment?.url,
  name: attachment?.fileName || attachment?.name,
  type: attachment?.fileType || attachment?.type || "",
});

const normalizeSocketComment = (comment) => ({
  id: comment?.id,
  text: comment?.content || comment?.text || "",
  author:
    comment?.user?.email || comment?.user?.name || comment?.author || "User",
  createdAt: comment?.createdAt,
  user: comment?.user,
  taskId: comment?.taskId,
});

const normalizeSocketTask = (raw) => {
  if (!raw) return null;
  const labelDetails = (raw.labels || []).map((label) => ({
    id: label.id,
    name: label.name || label,
    color: label.color || "#6366f1",
  }));
  const priority = raw.priority ? String(raw.priority).toLowerCase() : "medium";
  let dueDate = "";
  if (raw.dueDate) {
    const parsed = new Date(raw.dueDate);
    if (!Number.isNaN(parsed.getTime())) {
      dueDate = parsed.toISOString().slice(0, 10);
    }
  }

  return {
    ...raw,
    labels: labelDetails.map((label) => label.name),
    labelDetails,
    assigneeId: raw.assigneeId || raw.assignee?.id || null,
    assignee: raw.assignee?.email || raw.assignee?.name || null,
    priority,
    dueDate,
    comments: (raw.comments || []).map(normalizeSocketComment),
    attachments: (raw.attachments || []).map(normalizeSocketAttachment),
  };
};

const upsertTaskFromSocket = (rawTask) => {
  const task = normalizeSocketTask(rawTask);
  if (!task) return null;

  const { task: existing, column } = findTaskById(task.id);
  const targetColumnId = task.columnId;
  const targetColumn = columns.value.find((c) => c.id === targetColumnId);

  if (existing && column) {
    if (targetColumnId && column.id !== targetColumnId && targetColumn) {
      column.tasks = (column.tasks || []).filter((t) => t.id !== task.id);
      targetColumn.tasks = [
        ...(targetColumn.tasks || []),
        { ...existing, ...task },
      ];
    } else {
      column.tasks = (column.tasks || []).map((t) =>
        t.id === task.id ? { ...t, ...task } : t
      );
    }
  } else if (targetColumn) {
    const exists = (targetColumn.tasks || []).some((t) => t.id === task.id);
    if (!exists) {
      targetColumn.tasks = [...(targetColumn.tasks || []), task];
    }
  }

  return task;
};

const handleSocketTaskCreated = ({ task, actorId } = {}) => {
  if (!task) return;
  if (actorId && currentUserId.value && actorId === currentUserId.value) return;
  upsertTaskFromSocket(task);
};

const handleSocketTaskUpdated = ({ task, actorId } = {}) => {
  if (!task) return;
  if (actorId && currentUserId.value && actorId === currentUserId.value) return;
  const updated = upsertTaskFromSocket(task);
  if (updated?.id) syncSelectedTask(updated.id);
};

const handleSocketTaskDeleted = ({ taskId, columnId, actorId } = {}) => {
  if (!taskId) return;
  if (actorId && currentUserId.value && actorId === currentUserId.value) return;
  const targetColumn = columnId
    ? columns.value.find((c) => c.id === columnId)
    : findTaskById(taskId).column;
  if (!targetColumn) return;
  targetColumn.tasks = (targetColumn.tasks || []).filter((t) => t.id !== taskId);
  if (selectedTask.value?.id === taskId) {
    showTaskModal.value = false;
    selectedTask.value = null;
  }
};

const handleSocketTaskMoved = (payload = {}) => {
  if (payload.actorId && currentUserId.value && payload.actorId === currentUserId.value) {
    return;
  }
  const targetColumnId = payload.toColumn || payload.toColumnId;
  if (payload.taskId && targetColumnId) {
    const moved = moveTaskInColumns(payload.taskId, targetColumnId);
    if (!moved) {
      loadBoardData();
    }
    if (selectedTask.value?.id === payload.taskId) {
      selectedTaskColumnTitle.value =
        getColumnTitle(targetColumnId) || selectedTaskColumnTitle.value;
    }
  }
  const { task } = findTaskById(payload.taskId);
  const columnTitle =
    payload.toColumnTitle || getColumnTitle(payload.toColumnId || payload.toColumn);
  const actionMessage = columnTitle
    ? `Your task moved into "${columnTitle}"`
    : "Your task was moved";
  pushLocalNotification(task, actionMessage);
};

const handleSocketTaskCommented = ({ task, comment, actorId } = {}) => {
  if (actorId && currentUserId.value && actorId === currentUserId.value) return;
  const normalized = normalizeSocketComment(comment || {});
  const taskId = normalized.taskId || task?.id;
  if (taskId) {
    const { task: targetTask } = findTaskById(taskId);
    if (targetTask) {
      const exists = (targetTask.comments || []).some((c) => c.id === normalized.id);
      if (!exists) {
        targetTask.comments = [...(targetTask.comments || []), normalized];
      }
      if (selectedTask.value?.id === taskId) syncSelectedTask(taskId);
    }
  }
  const text = normalized.text || "";
  const hasMention = /@\w+/.test(text);
  recordActivityEntry({
    id: normalized?.id ? `${normalized.id}-comment` : undefined,
    user: normalized?.author || "Workspace",
    action: hasMention ? "mentioned in" : "commented on",
    target: task?.title || comment?.taskTitle || "a task",
    icon: hasMention ? "fa-at" : "fa-comment-dots",
    badgeBg: hasMention
      ? "bg-gradient-to-br from-amber-500 to-rose-500"
      : "bg-gradient-to-br from-blue-500 to-cyan-500",
    statusDot: hasMention ? "bg-amber-400" : "bg-blue-400",
    createdAt: normalized?.createdAt,
  });
};

const handleSocketColumnCreated = ({ column, actorId } = {}) => {
  if (!column) return;
  if (actorId && currentUserId.value && actorId === currentUserId.value) return;
  if (String(column.boardId) !== String(boardId.value)) return;
  const exists = columns.value.some((c) => c.id === column.id);
  if (!exists) {
    columns.value.push({
      ...column,
      color: column.color || "#6366f1",
      tasks: [],
    });
  }
};

const handleSocketColumnUpdated = ({ column } = {}) => {
  if (!column || String(column.boardId) !== String(boardId.value)) return;
  const idx = columns.value.findIndex((c) => c.id === column.id);
  if (idx === -1) return;
  columns.value.splice(idx, 1, {
    ...columns.value[idx],
    ...column,
    color: column.color || columns.value[idx]?.color || "#6366f1",
  });
};

const handleSocketColumnDeleted = ({ columnId, boardId: payloadBoardId, actorId } = {}) => {
  if (!columnId) return;
  if (payloadBoardId && String(payloadBoardId) !== String(boardId.value)) return;
  if (actorId && currentUserId.value && actorId === currentUserId.value) return;
  columns.value = columns.value.filter((c) => c.id !== columnId);
};

const handleSocketColumnsReordered = ({ columns: updates, boardId: payloadBoardId } = {}) => {
  if (!Array.isArray(updates)) return;
  if (payloadBoardId && String(payloadBoardId) !== String(boardId.value)) return;
  const orderMap = new Map(updates.map((entry) => [entry.id, entry.order]));
  columns.value = columns.value
    .map((col) => ({
      ...col,
      order: orderMap.has(col.id) ? orderMap.get(col.id) : col.order,
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};

const searchQuery = ref("");
const debouncedSearchQuery = ref("");
const boardSearch = ref("");
const debouncedBoardSearch = ref("");
const showTaskCreate = ref(false);
const showColumnModal = ref(false);
const columnModalMode = ref("create");
const editingColumn = ref(null);
const selectedColumnId = ref(null);
const { sidebarOpen } = useSidebarState();
const activeNav = ref("tasks");
const activeFilter = ref("all");

let taskSearchTimer = null;
let boardSearchTimer = null;
watch(searchQuery, (value) => {
  if (taskSearchTimer) clearTimeout(taskSearchTimer);
  taskSearchTimer = setTimeout(() => {
    debouncedSearchQuery.value = value ?? "";
  }, 150);
});
watch(boardSearch, (value) => {
  if (boardSearchTimer) clearTimeout(boardSearchTimer);
  boardSearchTimer = setTimeout(() => {
    debouncedBoardSearch.value = value ?? "";
  }, 150);
});

const openTaskMenuId = ref(null);
const quickCommentTaskId = ref(null);
const quickCommentText = ref("");

const filterAssignee = ref("all");
const filterStatus = ref("all");
const filterDueDate = ref("");
const filterPriority = ref("all");
const filterLabel = ref("all");

const showTaskModal = ref(false);
const selectedTask = ref(null);
const selectedTaskColumnTitle = ref("");
const taskModalMode = ref("edit");

const showLabelManager = ref(false);
const activityOpen = ref(false);
const activityRef = ref(null);

const previewModal = ref({ open: false, file: null });

const loadingCount = ref(0);
const isLoading = computed(() => loadingCount.value > 0);
const withLoading = async (task) => {
  loadingCount.value += 1;
  try {
    return await task();
  } finally {
    loadingCount.value = Math.max(0, loadingCount.value - 1);
  }
};

const workspaceId = computed(() => route.params.workspaceId);
const boardId = computed(() => route.params.boardId);
const boards = computed(() =>
  workspaceStore.getBoards(workspaceId.value) || []
);

const isValidId = (val) => {
  const str = String(val ?? "").trim();
  return Boolean(str) && str !== "undefined" && str !== "null";
};

const members = computed(() => workspaceStore.getMembers(workspaceId.value));
const currentUserId = computed(() => {
  const email = user.value?.email;
  if (!email || !workspaceId.value) return null;
  const member = members.value?.find((m) => m.email === email);
  return member?.userId || member?.id || null;
});

const loadBoardData = async () => {
  const wsId = workspaceId.value;
  const bId = boardId.value;
  if (!isValidId(wsId) || !isValidId(bId)) return;

  return withLoading(async () => {
    try {
      const boardKey = String(wsId);
      const hasBoardCache = Object.prototype.hasOwnProperty.call(
        workspaceStore.boardsByWorkspace,
        boardKey
      );
      const cachedBoards = hasBoardCache
        ? workspaceStore.boardsByWorkspace[boardKey]
        : null;
      const hasCurrentBoard =
        hasBoardCache &&
        Array.isArray(cachedBoards) &&
        cachedBoards.some((board) => String(board?.id) === String(bId));
      const loaders = [
        boardStore.loadBoard(wsId, bId),
        workspaceStore.loadMembers(wsId),
      ];
      if (!hasBoardCache || !hasCurrentBoard) {
        loaders.push(workspaceStore.loadBoards(wsId));
      }

      await Promise.all(loaders);
      if (!isActive) return;

      activityStore.hydrate(boardActivity.value, {
        icon: "fa-clock-rotate-left",
        badgeBg: "bg-gradient-to-br from-slate-500 to-slate-700",
        statusDot: "bg-slate-400",
      });

      await ensureSocket();
      if (socket.connected) {
        if (joinedBoardId && joinedBoardId !== bId) {
          socket.emit("leaveBoard", joinedBoardId);
        }
        if (isValidId(bId)) {
          socket.emit("joinBoard", bId);
          joinedBoardId = bId;
        } else {
          joinedBoardId = null;
        }
      }
    } catch (err) {
      console.warn("Load board data failed:", err?.message || err);
    }
  });
};



onMounted(async () => {
  try {
    await withLoading(() => workspaceStore.loadWorkspaces());
    await loadBoardData();
  } catch (err) {
    console.warn("TaskView init failed:", err?.message || err);
  }
  if (!isActive) return;
  document.addEventListener("click", handleOutsideClick);
  await ensureSocket();
  if (!isActive) return;
  socket.on("task:created", handleSocketTaskCreated);
  socket.on("task:updated", handleSocketTaskUpdated);
  socket.on("task:moved", handleSocketTaskMoved);
  socket.on("task:deleted", handleSocketTaskDeleted);
  socket.on("task:commented", handleSocketTaskCommented);
  socket.on("task:mentioned", handleSocketTaskCommented);
  socket.on("column:created", handleSocketColumnCreated);
  socket.on("column:updated", handleSocketColumnUpdated);
  socket.on("column:deleted", handleSocketColumnDeleted);
  socket.on("columns:reordered", handleSocketColumnsReordered);
});

watch(
  () => route.params.boardId,
  async (newId, oldId) => {
    if (!isValidId(newId) || newId === oldId) return;
    try {
      await loadBoardData();
    } catch (err) {
      console.warn("Board change load failed:", err?.message || err);
    }
  }
);


onUnmounted(() => {
  isActive = false;
  if (joinedBoardId) {
    socket.emit("leaveBoard", joinedBoardId);
    joinedBoardId = null;
  }
  document.removeEventListener("click", handleOutsideClick);
  socket.off("task:created", handleSocketTaskCreated);
  socket.off("task:updated", handleSocketTaskUpdated);
  socket.off("task:moved", handleSocketTaskMoved);
  socket.off("task:deleted", handleSocketTaskDeleted);
  socket.off("task:commented", handleSocketTaskCommented);
  socket.off("task:mentioned", handleSocketTaskCommented);
  socket.off("column:created", handleSocketColumnCreated);
  socket.off("column:updated", handleSocketColumnUpdated);
  socket.off("column:deleted", handleSocketColumnDeleted);
  socket.off("columns:reordered", handleSocketColumnsReordered);
  if (taskSearchTimer) {
    clearTimeout(taskSearchTimer);
    taskSearchTimer = null;
  }
  if (boardSearchTimer) {
    clearTimeout(boardSearchTimer);
    boardSearchTimer = null;
  }
});

const role = computed(() =>
  workspaceStore.getUserRole(
    workspaceId.value,
    user.value?.email || auth.user?.user?.email
  ) || "member"
);
const canEditTasks = computed(() => role.value !== "guest");
const canDeleteTasks = computed(() => role.value === "owner");
const canManageColumns = computed(() => role.value !== "guest");

const assigneeOptions = computed(() => {
  const set = new Set();
  columns.value.forEach(c => c.tasks.forEach(t => t.assignee && set.add(t.assignee)));
  return [...set];
});

const labelOptions = computed(() => labels.value.map(l => l.name));
const statusOptions = computed(() => columns.value.map(c => c.title));
const columnCount = computed(() => columns.value?.length || 0);
const labelCount = computed(() => labels.value?.length || 0);
const priorityOptions = PRIORITY_OPTIONS;

const orderedColumns = computed(() => {
  const list = (columns.value || []).slice();
  list.sort((a, b) => {
    const aOrder = a.order ?? Number.POSITIVE_INFINITY;
    const bOrder = b.order ?? Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.title || "").localeCompare(b.title || "");
  });
  return list;
});



const mentionOptions = computed(() => {
  const seen = new Set();
  return (members.value || [])
    .filter((m) => m.email)
    .map((m) => ({ value: m.email, label: m.name || m.email }))
    .filter((opt) => {
      if (seen.has(opt.value)) return false;
      seen.add(opt.value);
      return true;
    });
});

const labelColorMap = computed(() => {
  const map = {};
  labels.value.forEach(l => map[l.name] = l.color);
  return map;
});

const getLabelColor = name => labelColorMap.value[name] || "#6b7280";

const taskFilter = computed(() => ({
  query: debouncedSearchQuery.value.toLowerCase(),
  status: filterStatus.value,
  assignee: filterAssignee.value,
  priority: filterPriority.value,
  label: filterLabel.value,
  dueDate: filterDueDate.value || "",
}));

const isFiltering = computed(
  () =>
    Boolean(debouncedSearchQuery.value) ||
    filterStatus.value !== "all" ||
    filterAssignee.value !== "all" ||
    filterPriority.value !== "all" ||
    filterLabel.value !== "all" ||
    Boolean(filterDueDate.value)
);

const filteredTasksByColumnId = computed(() => {
  const result = Object.create(null);
  const { query, status, assignee, priority, label, dueDate } = taskFilter.value;

  (columns.value || []).forEach((column) => {
    if (status !== "all" && column.title !== status) {
      result[column.id] = [];
      return;
    }

    const tasks = column.tasks || [];
    if (!tasks.length) {
      result[column.id] = [];
      return;
    }

    if (!query && assignee === "all" && priority === "all" && label === "all" && !dueDate) {
      result[column.id] = tasks;
      return;
    }

    const filtered = [];
    for (const task of tasks) {
      if (query) {
        const title = task.title || "";
        if (!title.toLowerCase().includes(query)) continue;
      }
      if (assignee !== "all" && task.assignee !== assignee) continue;
      if (priority !== "all" && (task.priority || "medium") !== priority) continue;
      if (label !== "all" && !(task.labels || []).includes(label)) continue;
      if (dueDate) {
        if (!task.dueDate || task.dueDate > dueDate) continue;
      }
      filtered.push(task);
    }
    result[column.id] = filtered;
  });

  return result;
});

const clearFilters = () => {
  filterAssignee.value = "all";
  filterStatus.value = "all";
  filterPriority.value = "all";
  filterLabel.value = "all";
  filterDueDate.value = "";
  searchQuery.value = "";
  debouncedSearchQuery.value = "";
};

const openActivity = async () => {
  activityOpen.value = !activityOpen.value;
  if (!activityOpen.value) return;
  try {
    const history = await boardStore.loadBoardActivity(workspaceId.value);
    activityStore.hydrate(history, {
      icon: "fa-clock-rotate-left",
      badgeBg: "bg-gradient-to-br from-slate-500 to-slate-700",
      statusDot: "bg-slate-400",
    });
  } catch (err) {
    console.warn("Load board activity failed:", err?.message || err);
  }
};

/* NEW TASK */
const openNewTaskModal = (colId) => {
  if (!canEditTasks.value) return;
  selectedColumnId.value = colId;
  showTaskCreate.value = true;
};

async function createNewTask(data) {
  const assigneeMember = members.value.find((m) => m.email === data.assignee);
  try {
    const task = await boardStore.addTask(selectedColumnId.value, {
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate,
      assigneeId: assigneeMember?.userId || null,
      labels: data.labels || [],
      comment: data.comment,
      attachments: data.attachments || [],
    });
    if (!task) {
      alert("Failed to create task");
      return;
    }
    recordActivityEntry({
      id: task?.id ? `${task.id}-created` : undefined,
      action: "created task",
      target: task?.title,
      icon: "fa-plus",
      badgeBg: "bg-gradient-to-br from-purple-500 to-indigo-500",
      statusDot: "bg-purple-400",
    });
    showTaskCreate.value = false;
    selectedColumnId.value = null;
  } catch (err) {
    alert(err.message || "Failed to create task");
  }
}

const openCreateColumnModal = () => {
  if (!canManageColumns.value) return;
  columnModalMode.value = "create";
  editingColumn.value = null;
  showColumnModal.value = true;
};

const openEditColumnModal = (column) => {
  if (!canManageColumns.value || !column) return;
  columnModalMode.value = "edit";
  editingColumn.value = { ...column };
  showColumnModal.value = true;
};

const closeColumnModal = () => {
  showColumnModal.value = false;
  editingColumn.value = null;
  columnModalMode.value = "create";
};

const handleColumnSubmit = async (data) => {
  try {
    if (columnModalMode.value === "edit" && editingColumn.value?.id) {
      const updated = await boardStore.updateColumn(editingColumn.value.id, {
        title: data.title,
        color: data.color,
      });
      if (!updated) {
        alert("Failed to update column");
        return;
      }
    } else {
      const created = await boardStore.addColumn(data.title, data.color);
      if (!created) {
        alert("Failed to create column");
        return;
      }
    }
    closeColumnModal();
  } catch (err) {
    alert(err?.message || "Failed to save column");
  }
};

const columnIndexOf = (column) =>
  orderedColumns.value.findIndex((c) => c.id === column?.id);
const isFirstColumn = (column) => columnIndexOf(column) <= 0;
const isLastColumn = (column) =>
  columnIndexOf(column) === orderedColumns.value.length - 1;

const moveColumn = async (column, direction) => {
  if (!canManageColumns.value || !column) return;
  const currentIndex = columnIndexOf(column);
  const targetIndex = currentIndex + direction;
  if (currentIndex === -1 || targetIndex < 0 || targetIndex >= orderedColumns.value.length) {
    return;
  }
  const ok = await boardStore.reorderColumn(column.id, targetIndex);
  if (!ok) {
    alert("Failed to reorder column");
  }
};

const confirmDeleteColumn = async (col) => {
  if (!canManageColumns.value) return;
  const ok = await boardStore.deleteColumn(col.id);
  if (!ok) {
    alert("Failed to delete column");
  }
};

const confirmDeleteTask = async (task, column) => {
  if (!canDeleteTasks.value) return;
  const ok = await boardStore.deleteTask(task.id, column?.id);
  if (!ok) {
    alert("Failed to delete task");
  }
  if (selectedTask.value?.id === task.id) showTaskModal.value = false;
};

const toggleTaskMenu = (taskId) => {
  openTaskMenuId.value = openTaskMenuId.value === taskId ? null : taskId;
};
const closeTaskMenu = () => {
  openTaskMenuId.value = null;
};

const toggleQuickComment = (taskId) => {
  if (!canEditTasks.value) return;
  quickCommentTaskId.value = quickCommentTaskId.value === taskId ? null : taskId;
  quickCommentText.value = "";
};

const appendMentionToken = (handle) => {
  const token = `@${handle} `;
  if (quickCommentText.value.includes(token)) return;
  quickCommentText.value =
    `${quickCommentText.value}${quickCommentText.value.endsWith(" ") || !quickCommentText.value ? "" : " "}${token}`;
};

const submitQuickComment = async (taskId) => {
  if (!canEditTasks.value) return;
  const text = quickCommentText.value.trim();
  if (!text) return;
  try {
    const comment = await boardStore.addComment(taskId, { text });
    if (!comment) {
      alert("Failed to add comment");
      return;
    }
    const { task } = findTaskById(taskId);
    const hasMention = /@\w+/.test(text);
    recordActivityEntry({
      id: comment?.id ? `${comment.id}-comment` : undefined,
      action: hasMention ? "mentioned in" : "commented on",
      target: task?.title || "a task",
      icon: hasMention ? "fa-at" : "fa-comment-dots",
      badgeBg: hasMention
        ? "bg-gradient-to-br from-amber-500 to-rose-500"
        : "bg-gradient-to-br from-blue-500 to-cyan-500",
      statusDot: hasMention ? "bg-amber-400" : "bg-blue-400",
      createdAt: comment?.createdAt,
    });
    quickCommentText.value = "";
    quickCommentTaskId.value = null;
    syncSelectedTask(taskId);
  } catch (err) {
    alert(err?.message || "Failed to add comment");
  }
};

const forceViewTask = (task, column) => {
  if (!task) return;
  syncSelectedTask(task.id);
  selectedTaskColumnTitle.value = column.title;
  taskModalMode.value = "view";
  showTaskModal.value = true;
  closeTaskMenu();
};

const moveTaskInColumns = (taskId, targetColumnId) => {
  const { task, column } = findTaskById(taskId);
  if (!task || !column || column.id === targetColumnId) return false;
  const target = columns.value.find((col) => col.id === targetColumnId);
  if (!target) return false;
  column.tasks = (column.tasks || []).filter((t) => t.id !== taskId);
  target.tasks = [...(target.tasks || []), { ...task, columnId: targetColumnId }];
  return true;
};

const getColumnTitle = (columnId) =>
  columns.value.find((col) => col.id === columnId)?.title;

const handleTaskDragChange = async (column, event) => {
  if (!canEditTasks.value || !event?.added) return;
  const task = event.added.element;
  if (!task || task.columnId === column?.id) return;

  const previousColumnId = task.columnId;
  task.columnId = column.id;

  try {
    const ok = await boardStore.moveTask(task.id, column.id);
    if (!ok) {
      await loadBoardData();
      alert("Failed to move task");
      return;
    }
    const columnTitle = getColumnTitle(column.id);
    const actionMessage = columnTitle
      ? `Your task moved into "${columnTitle}"`
      : "Your task was moved";
    recordActivityEntry({
      id: task.id ? `${task.id}-moved-${column.id}` : undefined,
      action: "moved task",
      target: task?.title || `Task ${task.id}`,
      icon: "fa-arrows-alt-h",
      badgeBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
      statusDot: "bg-sky-400",
      message: actionMessage,
      notificationMessage: actionMessage,
      task,
    });
    if (previousColumnId !== column.id) {
      selectedTaskColumnTitle.value = getColumnTitle(column.id) || selectedTaskColumnTitle.value;
    }
  } catch (err) {
    await loadBoardData();
    alert(err?.message || "Failed to move task");
  }
};

const openTaskModal = (task, col) => {
  if (!task) return;
  syncSelectedTask(task.id);
  selectedTaskColumnTitle.value = col.title;
  taskModalMode.value = canEditTasks.value ? "edit" : "view";
  showTaskModal.value = true;
};
const closeTaskModal = () => {
  showTaskModal.value = false;
  selectedTask.value = null;
  selectedTaskColumnTitle.value = "";
  taskModalMode.value = "edit";
};

const syncSelectedTask = (taskId) => {
  const col = columns.value.find((c) => c.tasks.some((t) => t.id === taskId));
  if (!col) return;
  selectedTask.value = col.tasks.find((t) => t.id === taskId) || selectedTask.value;
  selectedTaskColumnTitle.value = col.title;
  openTaskMenuId.value = null;
};

const toggleTaskLabel = async ({ taskId, labelName }) => {
  const column = columns.value.find((c) => c.tasks.some((t) => t.id === taskId));
  const task = column?.tasks.find((t) => t.id === taskId);
  if (!task) return;

  const hasLabel = task.labels?.includes(labelName);
  const updated = hasLabel
    ? await boardStore.removeTaskLabel(taskId, labelName)
    : await boardStore.addTaskLabel(taskId, labelName);
  if (!updated) {
    alert("Failed to update label");
    return;
  }

  syncSelectedTask(taskId);
};

const updateTask = async ({ taskId, patch }) => {
  const payload = { ...patch };

  if (Object.prototype.hasOwnProperty.call(payload, "assignee")) {
    const member = members.value.find((m) => m.email === payload.assignee);
    payload.assigneeId = member?.userId || null;
    delete payload.assignee;
  }

  const updated = await boardStore.updateTask(taskId, payload);
  if (!updated) {
    alert("Failed to update task");
    return;
  }
  syncSelectedTask(taskId);
};

const addComment = async ({ taskId, text }) => {
  if (!text?.trim()) return;
  const trimmed = text.trim();
  const comment = await boardStore.addComment(taskId, { text: trimmed });
  if (!comment) {
    alert("Failed to add comment");
    return;
  }
  const { task } = findTaskById(taskId);
  const hasMention = /@\w+/.test(trimmed);
  recordActivityEntry({
    id: comment?.id ? `${comment.id}-comment` : undefined,
    action: hasMention ? "mentioned in" : "commented on",
    target: task?.title || "a task",
    icon: hasMention ? "fa-at" : "fa-comment-dots",
    badgeBg: hasMention
      ? "bg-gradient-to-br from-amber-500 to-rose-500"
      : "bg-gradient-to-br from-blue-500 to-cyan-500",
    statusDot: hasMention ? "bg-amber-400" : "bg-blue-400",
    createdAt: comment?.createdAt,
  });
  syncSelectedTask(taskId);
};

const createNewLabel = async (n, c) => {
  const created = await boardStore.createLabel(n, c);
  if (!created) {
    alert("Failed to create label");
  }
};
const renameLabel = async (o, n) => {
  const updated = await boardStore.updateLabelName(o, n);
  if (!updated) {
    alert("Failed to rename label");
  }
};
const changeLabelColor = async (n, c) => {
  const updated = await boardStore.updateLabelColor(n, c);
  if (!updated) {
    alert("Failed to update label color");
  }
};
const deleteLabel = async (n) => {
  const ok = await boardStore.deleteLabel(n);
  if (!ok) {
    alert("Failed to delete label");
  }
};

const uploadAttachment = async ({ taskId, file }) => {
  if (!file) return;
  const attachment = await boardStore.uploadAttachment(taskId, file);
  if (!attachment) {
    alert("Failed to upload attachment");
    return;
  }
  syncSelectedTask(taskId);
};
const deleteAttachment = async ({ taskId, attachmentId }) => {
  const ok = await boardStore.deleteAttachment(taskId, attachmentId);
  if (!ok) {
    alert("Failed to delete attachment");
    return;
  }
  syncSelectedTask(taskId);
};

const openPreviewModal = file => {
  previewModal.value = { open: true, file };
};
const closePreviewModal = () => {
  previewModal.value.open = false;
  previewModal.value.file = null;
};

const profileMenuOpen = ref(false);
const profileRef = ref(null);

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value;
};

const handleOutsideClick = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    profileMenuOpen.value = false;
  }
  if (activityRef.value && !activityRef.value.contains(e.target)) {
    activityOpen.value = false;
  }
  openTaskMenuId.value = null;
};

const handleLogout = () => {
  auth.logout();
  router.push("/");
};

const handleLogoutFromMenu = () => {
  profileMenuOpen.value = false;
  handleLogout();
};

const userDisplayName = computed(
  () => user.value?.name || user.value?.displayName || user.value?.email || "User"
);

const userEmail = computed(() => user.value?.email || "");
const userPhotoURL = computed(() => user.value?.photoURL || user.value?.imageUrl || null);
const sidebarNav = [
  { id: "dashboard", icon: "fa-chart-bar", style: "fas", label: "Dashboard" },
  { id: "home", icon: "fa-house", style: "fas", label: "Home" },
  { id: "boards", icon: "fa-columns", style: "fas", label: "Boards" },
  { id: "tasks", icon: "fa-tasks", style: "fas", label: "Tasks" },
  { id: "owned", icon: "fa-folder-open", style: "far", label: "My spaces" },
  { id: "shared", icon: "fa-project-diagram", style: "far", label: "Collabs" },
];

const selectedBoardId = computed(() => route.params.boardId);

const filteredBoards = computed(() => {
  const q = debouncedBoardSearch.value.toLowerCase();
  const list = boards.value || [];
  if (!q) return list;

  return list.filter((board) => {
    const nameMatch = board.name?.toLowerCase().includes(q);
    const descMatch = board.description?.toLowerCase().includes(q);
    return nameMatch || descMatch;
  });
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const handleNavClick = (item) => {
  activeNav.value = item.id;
  if (item.id === "dashboard") {
    router.push("/dashboard");
    return;
  }
  if (item.id === "boards") {
    const wsId = workspaceId.value;
    if (wsId) {
      router.push(`/workspace/${wsId}`);
    } else {
      router.push("/workspace");
    }
    return;
  }
  if (item.id === "tasks") {
    const wsId = workspaceId.value;
    const bId = boardId.value;
    if (wsId && bId) {
      router.push(`/workspace/${wsId}/board/${bId}`);
    } else if (wsId) {
      router.push(`/workspace/${wsId}`);
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

const goToBoard = async (board) => {
  if (!board?.id || board.id === selectedBoardId.value) return;
  await router.push(`/workspace/${workspaceId.value}/board/${board.id}`);
};
const getInitial = (label, fallback = "") => {
  const value = String(label || "").trim();
  if (!value) return fallback || "?";
  return value[0].toUpperCase();
};

/* STYLE CLASSES */
const menuItemClass = computed(() =>
  isDark.value
    ? "text-slate-200 hover:bg-slate-800"
    : "text-slate-700 hover:bg-slate-100"
);
const actionMenuItemClass = computed(() =>
  isDark.value
    ? "hover:bg-slate-800 text-slate-200"
    : "hover:bg-indigo-50 text-slate-800"
);

const filterInputClass = computed(() => {
  const base = [
    "mt-1 px-3 py-1 rounded-full border text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-0",
  ];
  const theme =
    isDark.value
      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:ring-purple-500/60 focus:border-purple-500"
      : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500/40 focus:border-indigo-400";

  return [...base, theme].join(" ");
});

const columnHeaderClass = computed(() =>
  isDark.value ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
);

const columnBodyClass = computed(() =>
  isDark.value ? "bg-slate-900/50 border-slate-800" : "bg-slate-100/50 border-slate-200"
);

const taskCardClass = computed(() =>
  isDark.value
    ? "bg-slate-900/80 border-slate-800 hover:border-purple-500/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
    : "bg-white/90 border-slate-200 hover:border-purple-300/70 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
);

const badgeClass = computed(() =>
  isDark.value
    ? "bg-slate-800 text-slate-400"
    : "bg-slate-100 text-slate-600"
);

const priorityClass = p => {
  if (p === "urgent")
    return isDark.value ? "bg-red-500/20 text-red-400 px-2 py-1 rounded"
                        : "bg-red-50 text-red-700 px-2 py-1 rounded";
  if (p === "high")
    return isDark.value ? "bg-orange-500/20 text-orange-400 px-2 py-1 rounded"
                        : "bg-orange-50 text-orange-700 px-2 py-1 rounded";
  return isDark.value ? "bg-blue-500/20 text-blue-400 px-2 py-1 rounded"
                      : "bg-blue-50 text-blue-700 px-2 py-1 rounded";
};

const commentPreview = (task) => {
  const list = task?.comments;
  if (!list || !list.length) return "";
  const last = list[list.length - 1];
  const text = (last.text || last.content || "").trim();
  if (!text) return "";
  return text.length > 80 ? `${text.slice(0, 77)}...` : text;
};

const getRecentComments = (task, limit = 2) => {
  const list = task?.comments;
  if (!list || !list.length) return [];
  return list.slice(-limit);
};
</script>

<style scoped>
.menu-item {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.15s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.task-ghost {
  opacity: 0.45;
}
.task-chosen {
  cursor: grabbing;
}
.task-drag {
  transform: scale(1.02);
  border-style: dashed;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.18);
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

@keyframes badgePulse {
  0%,
  100% {
    transform: translateY(0);
    box-shadow: 0 10px 24px rgba(99, 102, 241, 0.35);
  }
  50% {
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(99, 102, 241, 0.45);
  }
}

.logo-flat {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;  
  background: transparent;
}

.task-title-clamp,
.task-desc-clamp,
.comment-clamp {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-title-clamp {
  -webkit-line-clamp: 2;
}

.task-desc-clamp {
  -webkit-line-clamp: 2;
}

.comment-clamp {
  -webkit-line-clamp: 3;
}

i,
svg {
  transition: color 0.2s ease;
}

button:hover i,
button:hover svg,
a:hover i,
a:hover svg,
i:hover,
svg:hover {
  color: #ffc400;
}

</style>

