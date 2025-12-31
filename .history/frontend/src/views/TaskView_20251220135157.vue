
<template>
<div
  class="min-h-screen relative overflow-hidden"
  :class="isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'"
> 


  <ColumnModal
    :open="showCreateColumnModal"
    @submit="handleCreateColumn"
    @cancel="showCreateColumnModal = false"
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
    class="border-b sticky top-0 z-40 shadow-sm backdrop-blur-xl"
    :class="isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80'"
  >
    <div class="px-4 sm:px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="toggleSidebar"
          class="p-2.5 rounded-xl border transition"
          :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/60' : 'border-slate-200 bg-white/70 hover:border-purple-300/70'"
        >
          <i class="fas fa-bars" :class="isDark ? 'text-white' : 'text-slate-700'"></i>
        </button>

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

          <div>
            <h1 class="text-xl font-bold leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">TaskFlow</h1>
            <p class="text-xs font-medium tracking-wide" :class="isDark ? 'text-slate-400' : 'text-slate-500'">
              Team Task Management
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative hidden sm:block">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search tasks..."
              class="pl-11 pr-4 py-3 rounded-full border text-sm transition focus:ring-2 focus:ring-purple-500/70 w-72"
              :class="isDark ? 'bg-slate-900/70 border-slate-800 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'"
            />
          </div>



          <button
            @click="toggleTheme"
            class="p-2.5 rounded-xl border transition"
            :class="isDark ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/50' : 'bg-white/80 border-slate-200 hover:border-purple-300/60'"
          >
            <i class="fas" :class="isDark ? 'fa-sun text-amber-400' : 'fa-moon text-slate-600'"></i>
          </button>

          <NotificationBell />

          <button
            @click="openActivity"
            class="p-2.5 rounded-xl border transition"
            :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/50' : 'border-slate-200 bg-white/80 hover:border-purple-300/60'"
          >
            <i class="fas fa-clock text-slate-500"></i>
          </button>

          <div class="relative" ref="profileRef">
            <button
              @click="toggleProfileMenu"
              class="flex items-center gap-2 px-3 py-2 rounded-xl border transition"
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
                class="absolute right-0 mt-2 w-56 rounded-xl border py-2 shadow-lg shadow-black/10 z-50"
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

                <button @click="goProfile" class="menu-item" :class="menuItemClass">
                  <i class="fas fa-user-circle text-xs"></i> View Profile
                </button>

                <button @click="goSettings" class="menu-item" :class="menuItemClass">
                  <i class="fas fa-cog text-xs"></i> Account Settings
                </button>

                <button @click="toggleTheme" class="menu-item" :class="menuItemClass">
                  <i class="fas fa-adjust text-xs"></i> Toggle Theme
                </button>

                <button
                  @click="handleLogoutFromMenu"
                  class="menu-item text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <i class="fas fa-sign-out-alt text-xs"></i>
                  Logout
                </button>
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
                <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
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
    

    <div class="flex-1 min-w-0 flex flex-col">

      <div
        class="border-b px-4 sm:px-6 py-4"
        :class="isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200 backdrop-blur-sm'"
      >
        <div class="max-w-6xl mx-auto">
        <div class="flex flex-wrap items-center justify-between gap-3">
        
        <div class="flex flex-wrap gap-2 text-[11px] font-semibold">
          <span
            class="flex items-center gap-1 px-3 py-1 rounded-full border"
            :class="isDark ? 'border-slate-700 bg-transparent text-white' : 'border-slate-200 bg-white text-slate-600'"
          >
            <i class="fas fa-layer-group text-[11px]"></i>
            {{ columnCount }} columns
          </span>
          <span
            class="flex items-center gap-1 px-3 py-1 rounded-full border"
            :class="isDark ? 'border-slate-700 bg-transparent text-white' : 'border-slate-200 bg-white text-slate-600'"
          >
            <i class="fas fa-clipboard-check text-[11px]"></i>
            {{ totalTasks }} tasks
          </span>
          <span
            class="flex items-center gap-1 px-3 py-1 rounded-full border"
            :class="isDark ? 'border-slate-700 bg-transparent text-white' : 'border-slate-200 bg-white text-slate-600'"
          >
            <i class="fas fa-tags text-[11px]"></i>
            {{ labelCount }} labels
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-4 mt-3">
        <div class="flex flex-col min-w-[150px]">
          <span class="text-xs font-semibold uppercase" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Status</span>
          <select v-model="filterStatus" :class="filterInputClass">
            <option value="all">All columns</option>
            <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        <div class="flex flex-col min-w-[150px]">
          <span class="text-xs font-semibold uppercase" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Assignee</span>
          <select v-model="filterAssignee" :class="filterInputClass">
            <option value="all">All</option>
            <option v-for="person in assigneeOptions" :key="person" :value="person">{{ person }}</option>
          </select>
        </div>
        <div class="flex flex-col min-w-[180px]">
          <span class="text-xs font-semibold uppercase" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Priority labels</span>
          <select v-model="filterPriority" :class="filterInputClass">
            <option value="all">All</option>
            <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="flex flex-col min-w-[160px]">
          <span class="text-xs font-semibold uppercase" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Due before</span>
          <input
            v-model="filterDueDate"
            type="date"
            :class="filterInputClass"
          />
        </div>
        <button
          @click="clearFilters"
          class="px-4 py-2 mt-2 text-xs rounded-full font-semibold"
          :class="isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'"
        >
          Clear
        </button>
      </div>
      </div>
    </div>
    <main class="flex-1 overflow-x-auto p-4 sm:p-6">
        <div class="max-w-6xl mx-auto">
        <div class="flex gap-4 pb-4 text-sm overflow-x-auto no-scrollbar sm:flex-wrap">

      
        <div v-for="column in orderedColumns" :key="column.id" class="w-full max-w-xs flex flex-col gap-2 transition hover:-translate-y-1 sm:w-80">

          <div :class="columnHeaderClass" class="rounded-t-xl border border-b-0 px-4 py-3 flex items-center justify-between shadow-sm backdrop-blur-md">
            <div class="flex items-center gap-2">
              <div :style="{ background: column.color }" class="w-2 h-2 rounded-full"></div>
              <h3 class="font-semibold text-sm">{{ column.title }}</h3>
              <span :class="badgeClass" class="px-2 py-0.5 rounded text-xs font-medium">{{ column.tasks.length }}</span>
            </div>

            <button v-if="canManageColumns" @click="confirmDeleteColumn(column)" class="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
              <i class="fas fa-trash text-xs text-red-500"></i>
            </button>
          </div>

          
          <div
            :class="[columnBodyClass, dragOverColumnId === column.id ? 'drop-target' : '']"
            class="flex-1 rounded-b-xl border p-3 space-y-3 min-h-[500px] shadow-sm transition-colors"
            @dragenter.prevent="handleDragEnter(column.id)"
            @dragover.prevent="handleDragOver($event, column.id)"
            @dragleave="handleDragLeave(column.id)"
            @drop="handleDrop($event, column.id)"
          >

            
            <div
              v-for="task in filteredTasks(column.tasks, column)"
              :key="task.id"
              :draggable="role !== 'guest'"
              @dragstart="handleDragStart($event, task)"
              @dragend="handleDragEnd"
              @click="openTaskModal(task, column)"
              :class="taskCardClass"
              class="task-card p-4 rounded-xl border cursor-pointer relative overflow-visible"
            >

              <div class="flex items-start justify-between mb-3">
                <h4 class="font-medium text-sm leading-tight flex-1">{{ task.title }}</h4>

                <div v-if="canEditTasks" class="relative">
                  <button
                    @click.stop="toggleTaskMenu(task.id)"
                    class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <i class="fas fa-ellipsis-vertical text-xs"></i>
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
                    <i class="fas fa-eye mr-2 text-[11px]"></i>View task
                  </button>
                  <button
                    class="w-full text-left px-3 py-2 text-xs"
                    :class="actionMenuItemClass"
                      @click.stop="openTaskModal(task, column); closeTaskMenu()"
                    >
                      <i class="fas fa-pen mr-2 text-[11px]"></i>Edit task
                    </button>
                    <button
                      v-if="canDeleteTasks"
                      class="w-full text-left px-3 py-2 text-xs text-red-600"
                      :class="isDark ? 'hover:bg-red-900/30' : 'hover:bg-red-50'"
                      @click.stop="confirmDeleteTask(task, column); closeTaskMenu()"
                    >
                      <i class="fas fa-trash mr-2 text-[11px]"></i>Delete task
                    </button>
                  </div>
                </div>
              </div>

              <p v-if="task.description" class="text-xs mb-3 opacity-70">{{ task.description }}</p>

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
                <i class="fas fa-bolt text-[10px]"></i>
                {{ task.priority }}
              </span>
              <span v-if="task.assignee" class="inline-flex items-center gap-1 px-2 py-1 rounded-full"
                :class="isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'">
                <i class="fas fa-user text-[10px]"></i>{{ task.assignee }}
              </span>
              <span v-if="task.dueDate" class="inline-flex items-center gap-1 px-2 py-1 rounded-full"
                :class="isDark ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'">
                <i class="fas fa-calendar text-[10px]"></i>{{ task.dueDate }}
              </span>
            </div>

            <div
              class="flex items-center justify-between gap-2 text-[11px] mt-2"
              v-if="(task.comments?.length || 0) > 0 || commentPreview(task)"
            >
              <div :class="isDark ? 'text-slate-400' : 'text-slate-500'" class="flex items-center gap-1">
                <i class="fas fa-comments text-[10px]"></i>
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

            <div v-if="getRecentComments(task).length" class="mt-2 space-y-2">
              <div
                v-for="c in getRecentComments(task)"
                :key="c.id"
                class="text-[11px] rounded-lg border px-2 py-2"
                :class="isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-semibold">{{ c.author || c.user?.email || 'User' }}</span>
                  <span :class="isDark ? 'text-slate-500' : 'text-slate-500'">{{ new Date(c.createdAt).toLocaleString() }}</span>
                </div>
                <p class="whitespace-pre-wrap">{{ c.text || c.content }}</p>
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
                <i class="fas fa-comment-dots mr-1 text-[10px]"></i>
              </button>
              <button
                v-if="canEditTasks" 
                class="px-3 py-1 text-[11px] rounded-full border"
                :class="isDark ? 'border-purple-700 text-purple-100 bg-purple-900/30 hover:bg-purple-800/40' : 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100'"
                @click.stop="openTaskModal(task, column)"
              >
                <i class="fas fa-pen mr-1 text-[10px]"></i> 
              </button>
              <button
                class="px-3 py-1 text-[11px] rounded-full border"
                :class="isDark ? 'border-blue-700 text-blue-100 bg-blue-900/30 hover:bg-blue-800/40' : 'border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100'"
                @click.stop="forceViewTask(task, column)"
              >
                <i class="fas fa-eye mr-1 text-[10px]"></i>
              </button>
            </div>

            </div>

            
              <button
                v-if="canEditTasks"
                @click="openNewTaskModal(column.id)"
                class="w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-sm"
            >
              <i class="fas fa-plus"></i> Add Task
            </button>

          </div>

        </div>

        
        <button
          v-if="canManageColumns"
          @click="showCreateColumnModal = true"
          class="w-80 h-32 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm transition hover:-translate-y-1 hover:shadow-xl"
          :class="isDark ? 'bg-slate-900/60 border-slate-800 hover:border-purple-500/60' : 'bg-white/90 border-slate-200 hover:border-purple-300/70'"
        >
          <i class="fas fa-plus"></i> Add Column
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

    <BoardActivityModal
      v-if="showBoardActivity"
      :is-dark="isDark"
      @close="showBoardActivity = false"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";

import { useBoardStore } from "@/stores/boardStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { useActivityStore } from "@/stores/activityStore";

import { useNotificationStore } from "@/stores/notificationStore";

import NotificationBell from "@/components/common/NotificationBell.vue";
import AttachmentPreviewModal from "@/components/modals/AttachmentPreviewModal.vue";

import ColumnModal from "@/components/modals/ColumnModal.vue";
import LabelManagerModal from "@/components/modals/LabelManagerModal.vue";
import TaskDetailsModal from "@/components/modals/TaskDetailsModal.vue";
import TaskModal from "@/components/modals/TaskModal.vue";
import BoardActivityModal from "@/components/modals/BoardActivityModal.vue";
import { PRIORITY_OPTIONS } from "@/constants/priorities";
import { socket } from "@/socket.js";



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

const { currentBoard, columns, totalTasks, boardActivity, labels } = storeToRefs(boardStore);
const { isDark } = storeToRefs(themeStore);
const { toggleTheme } = themeStore;
const { user, userInitials } = storeToRefs(auth);

const notificationStore = useNotificationStore();

const currentUserName = () =>
  user.value?.name || user.value?.displayName || user.value?.email || "";

/* ✅ FIX: define recordActivityEntry (this was missing and caused the error) */
const recordActivityEntry = (entry = {}) => {
  activityStore.push({
    user: entry.user || currentUserName(),
    ...entry,
  });
};
/* ✅ END FIX */

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

const handleSocketTaskCreated = ({ task } = {}) => {
  if (!task) return;
};

const handleSocketTaskMoved = (payload = {}) => {
  const { task } = findTaskById(payload.taskId);
  if (payload.actorId && currentUserId.value && payload.actorId === currentUserId.value) {
    return;
  }
  const columnTitle =
    payload.toColumnTitle || getColumnTitle(payload.toColumnId);
  const actionMessage = columnTitle
    ? `Your task moved into "${columnTitle}"`
    : "Your task was moved";
  pushLocalNotification(task, actionMessage);
};

const handleSocketTaskCommented = ({ task, comment } = {}) => {
  const text = comment?.content || comment?.text || "";
  const hasMention = /@\w+/.test(text);
  recordActivityEntry({
    id: comment?.id ? `${comment.id}-comment` : undefined,
    user: comment?.author || comment?.user || "Workspace",
    action: hasMention ? "mentioned in" : "commented on",
    target: task?.title || comment?.taskTitle || "a task",
    icon: hasMention ? "fa-at" : "fa-comment-dots",
    badgeBg: hasMention
      ? "bg-gradient-to-br from-amber-500 to-rose-500"
      : "bg-gradient-to-br from-blue-500 to-cyan-500",
    statusDot: hasMention ? "bg-amber-400" : "bg-blue-400",
    createdAt: comment?.createdAt,
  });
};

const searchQuery = ref("");
const boardSearch = ref("");
const boards = ref([]);
const showTaskCreate = ref(false);
const showCreateColumnModal = ref(false);
const selectedColumnId = ref(null);
const sidebarOpen = ref(true);
const activeNav = ref("home");
const activeFilter = ref("all");

const draggedTaskId = ref(null);
const dragFromColumnId = ref(null);
const dragFromIndex = ref(null);
const dragCurrentColumnId = ref(null);
const dragOverColumnId = ref(null);
const draggedElement = ref(null);
const dragDropCommitted = ref(false);
const openTaskMenuId = ref(null);
const quickCommentTaskId = ref(null);
const quickCommentText = ref("");

const filterAssignee = ref("all");
const filterStatus = ref("all");
const filterDueDate = ref("");
const filterPriority = ref("all");

const showTaskModal = ref(false);
const selectedTask = ref(null);
const selectedTaskColumnTitle = ref("");
const taskModalMode = ref("edit");

const showLabelManager = ref(false);
const showBoardActivity = ref(false);

const previewModal = ref({ open: false, file: null });

const workspaceId = computed(() => route.params.workspaceId);
const boardId = computed(() => route.params.boardId);

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

  try {
    const loadedBoards = await workspaceStore.loadBoards(wsId);
    boards.value = Array.isArray(loadedBoards) ? loadedBoards : [];

    await boardStore.loadBoard(wsId, bId);
    await workspaceStore.loadMembers(wsId);

    activityStore.hydrate(boardActivity.value, {
      icon: "fa-clock-rotate-left",
      badgeBg: "bg-gradient-to-br from-slate-500 to-slate-700",
      statusDot: "bg-slate-400",
    });

    if (isValidId(bId)) {
      socket.emit("leaveBoard");
      socket.emit("joinBoard", bId);
    }
  } catch (err) {
    console.error("Load board data failed:", err);
  }

};



onMounted(async () => {
  try {
    await workspaceStore.loadWorkspaces();
    await loadBoardData();
  } catch (err) {
    console.error("TaskView init failed:", err);
  }
  document.addEventListener("click", handleOutsideClick);
  socket.on("task:created", handleSocketTaskCreated);
  socket.on("task:moved", handleSocketTaskMoved);
  socket.on("task:commented", handleSocketTaskCommented);
  socket.on("task:mentioned", handleSocketTaskCommented);
});

watch(
  () => route.params.boardId,
  async (newId, oldId) => {
    if (!isValidId(newId) || newId === oldId) return;
    try {
      await loadBoardData();
    } catch (err) {
      console.error("Board change load failed:", err);
    }
  }
);


onUnmounted(() => {
  if (isValidId(boardId.value)) socket.emit("leaveBoard", boardId.value);
  document.removeEventListener("click", handleOutsideClick);
  socket.off("task:created", handleSocketTaskCreated);
  socket.off("task:moved", handleSocketTaskMoved);
  socket.off("task:commented", handleSocketTaskCommented);
  socket.off("task:mentioned", handleSocketTaskCommented);
});

const role = computed(() =>
  workspaceStore.getUserRole(
    workspaceId.value,
    user.value?.email || auth.user?.user?.email
  ) || "member"
);
const canEditTasks = computed(() => role.value !== "guest");
const canDeleteTasks = computed(() => role.value === "owner");
const canManageColumns = computed(() => role.value === "owner");

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

const COLUMN_ORDER = ["To Do", "In Progress", "In Review", "Done"];
const COLUMN_COLORS = {
  "To Do": "#6366f1",
  "In Progress": "#2563eb",
  "In Review": "#a855f7",
  Done: "#22c55e",
};

const orderedColumns = computed(() => {
  const list = (columns.value || []).slice();
  const orderMap = COLUMN_ORDER.reduce((acc, name, idx) => {
    acc[name.toLowerCase()] = idx;
    return acc;
  }, {});
  list.sort((a, b) => {
    const aKey = (a.title || "").toLowerCase();
    const bKey = (b.title || "").toLowerCase();
    const aIdx = orderMap[aKey];
    const bIdx = orderMap[bKey];
    if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
    if (aIdx !== undefined) return -1;
    if (bIdx !== undefined) return 1;
    return 0;
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

const filteredTasks = (tasks = [], column) => {
  let result = tasks;

  if (filterStatus.value !== "all" && column.title !== filterStatus.value)
    return [];

  const q = searchQuery.value.toLowerCase();
  if (q) result = result.filter(t => t.title.toLowerCase().includes(q));

  if (filterAssignee.value !== "all")
    result = result.filter(t => t.assignee === filterAssignee.value);

  if (filterPriority.value !== "all")
    result = result.filter(t => (t.priority || "medium") === filterPriority.value);

  if (filterDueDate.value)
    result = result.filter(t => t.dueDate && new Date(t.dueDate) <= new Date(filterDueDate.value));

  return result;
};

const clearFilters = () => {
  filterAssignee.value = "all";
  filterStatus.value = "all";
  filterPriority.value = "all";
  filterDueDate.value = "";
  searchQuery.value = "";
};

const openActivity = async () => {
  try {
    const history = await boardStore.loadBoardActivity(workspaceId.value);
    activityStore.hydrate(history, {
      icon: "fa-clock-rotate-left",
      badgeBg: "bg-gradient-to-br from-slate-500 to-slate-700",
      statusDot: "bg-slate-400",
    });
  } catch (err) {
    console.error("Load board activity failed:", err);
  }
  showBoardActivity.value = true;
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

async function handleCreateColumn(data) {
  try {
    await boardStore.addColumn(data.title, data.color);
    showCreateColumnModal.value = false;
  } catch (err) {
    alert(err?.message || "Failed to create column");
  }
}

const confirmDeleteColumn = col => {
  if (!canManageColumns.value) return;
  boardStore.deleteColumn(col.id).catch((err) => {
    alert(err?.message || "Failed to delete column");
  });
};

const confirmDeleteTask = (task, column) => {
  if (!canDeleteTasks.value) return;
  boardStore.deleteTask(task.id, column?.id).catch((err) => {
    alert(err?.message || "Failed to delete task");
  });
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

const resetDragState = () => {
  if (draggedElement.value?.classList) {
    draggedElement.value.classList.remove("dragging");
  }
  draggedTaskId.value = null;
  dragFromColumnId.value = null;
  dragFromIndex.value = null;
  dragCurrentColumnId.value = null;
  dragOverColumnId.value = null;
  draggedElement.value = null;
  dragDropCommitted.value = false;
};

const handleDragStart = (e, task) => {
  if (!canEditTasks.value) return;
  const { column } = findTaskById(task.id);
  draggedTaskId.value = task.id;
  dragFromColumnId.value = column?.id || null;
  dragFromIndex.value = column?.tasks?.findIndex((t) => t.id === task.id) ?? null;
  dragCurrentColumnId.value = column?.id || null;
  dragOverColumnId.value = column?.id || null;
  draggedElement.value = e.target;
  dragDropCommitted.value = false;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
  }
  e.target.classList.add("dragging");
};
const handleDragEnd = () => {
  if (
    !dragDropCommitted.value &&
    dragFromColumnId.value &&
    dragCurrentColumnId.value &&
    dragCurrentColumnId.value !== dragFromColumnId.value
  ) {
    moveTaskLocally(draggedTaskId.value, dragFromColumnId.value, dragFromIndex.value);
  }
  resetDragState();
};
const moveTaskLocally = (taskId, targetColumnId, targetIndex = null) => {
  const { task, column } = findTaskById(taskId);
  if (!task || !column || column.id === targetColumnId) return false;
  const target = columns.value.find((col) => col.id === targetColumnId);
  if (!target) return false;
  const index = (column.tasks || []).findIndex((t) => t.id === taskId);
  if (index < 0) return false;
  column.tasks.splice(index, 1);
  if (!target.tasks) target.tasks = [];
  const insertAt =
    typeof targetIndex === "number" && targetIndex >= 0
      ? Math.min(targetIndex, target.tasks.length)
      : target.tasks.length;
  target.tasks.splice(insertAt, 0, task);
  task.columnId = targetColumnId;
  dragCurrentColumnId.value = targetColumnId;
  return true;
};
const getColumnTitle = (columnId) =>
  columns.value.find((col) => col.id === columnId)?.title;

const handleDragEnter = (columnId) => {
  if (!draggedTaskId.value || !canEditTasks.value) return;
  dragOverColumnId.value = columnId;
};
const handleDragLeave = (columnId) => {
  if (dragOverColumnId.value === columnId) {
    dragOverColumnId.value = null;
  }
};
const handleDragOver = (e, columnId) => {
  e.preventDefault();
  if (!draggedTaskId.value || !canEditTasks.value) return;
  handleDragEnter(columnId);
  if (dragCurrentColumnId.value !== columnId) {
    moveTaskLocally(draggedTaskId.value, columnId);
  }
};
const handleDrop = (e, columnId) => {
  e.preventDefault();
  if (!draggedTaskId.value || !canEditTasks.value) return;
  dragOverColumnId.value = null;
  dragDropCommitted.value = true;

  const { task } = findTaskById(draggedTaskId.value);
  if (dragCurrentColumnId.value !== columnId) {
    const movedLocally = moveTaskLocally(draggedTaskId.value, columnId);
    if (!movedLocally) {
      resetDragState();
      return;
    }
  }
  if (dragFromColumnId.value === columnId) {
    resetDragState();
    return;
  }
  boardStore
    .moveTask(draggedTaskId.value, columnId)
    .then(() => {
      const columnTitle = getColumnTitle(columnId);
      const actionMessage = columnTitle
        ? `Your task moved into "${columnTitle}"`
        : "Your task was moved";
      recordActivityEntry({
        id: draggedTaskId.value ? `${draggedTaskId.value}-moved-${columnId}` : undefined,
        action: "moved task",
        target: task?.title || `Task ${draggedTaskId.value}`,
        icon: "fa-arrows-alt-h",
        badgeBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
        statusDot: "bg-sky-400",
        message: actionMessage,
        notificationMessage: actionMessage,
        task,
      });
    })
    .catch(async (err) => {
      await loadBoardData();
      alert(err?.message || "Failed to move task");
    })
    .finally(() => {
      resetDragState();
    });
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
  if (hasLabel) await boardStore.removeTaskLabel(taskId, labelName);
  else await boardStore.addTaskLabel(taskId, labelName);

  syncSelectedTask(taskId);
};

const updateTask = async ({ taskId, patch }) => {
  const payload = { ...patch };

  if (Object.prototype.hasOwnProperty.call(payload, "assignee")) {
    const member = members.value.find((m) => m.email === payload.assignee);
    payload.assigneeId = member?.userId || null;
    delete payload.assignee;
  }

  await boardStore.updateTask(taskId, payload);
  syncSelectedTask(taskId);
};

const addComment = async ({ taskId, text }) => {
  if (!text?.trim()) return;
  const trimmed = text.trim();
  const comment = await boardStore.addComment(taskId, { text: trimmed });
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

const createNewLabel = (n, c) => boardStore.createLabel(n, c);
const renameLabel = (o, n) => boardStore.updateLabelName(o, n);
const changeLabelColor = (n, c) => boardStore.updateLabelColor(n, c);
const deleteLabel = n => boardStore.deleteLabel(n);

const uploadAttachment = ({ taskId, file }) => {
  if (!file) return;
  boardStore.uploadAttachment(taskId, file).then(() => syncSelectedTask(taskId));
};
const deleteAttachment = ({ taskId, attachmentId }) => {
  boardStore.deleteAttachment(taskId, attachmentId).then(() => syncSelectedTask(taskId));
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
  openTaskMenuId.value = null;
};

const handleLogout = () => {
  auth.logout();
  router.push("/login");
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
  { id: "dashboard", icon: "fa-gauge-high", style: "fas", label: "Dashboard" },
  { id: "home", icon: "fa-house", style: "fas", label: "Home" },
  { id: "owned", icon: "fa-folder-open", style: "far", label: "My spaces" },
  { id: "shared", icon: "fa-handshake", style: "far", label: "Collabs" },
];

const selectedBoardId = computed(() => route.params.boardId);

const filteredBoards = computed(() => {
  const q = boardSearch.value.trim().toLowerCase();
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
.task-card.dragging {
  opacity: 0.55;
  transform: scale(1.02);
  cursor: grabbing;
  border-style: dashed;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.18);
}
.drop-target {
  border-color: rgba(129, 140, 248, 0.65);
  background-color: rgba(129, 140, 248, 0.08);
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

</style>
