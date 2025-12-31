<template>
  <div class="workspace-view min-h-screen relative overflow-hidden" :class="isDark ? 'bg-slate-950' : 'bg-slate-50'">
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
      <div class="px-6 py-6 flex items-center justify-between">
        
        <div class="flex items-center gap-4">
          <button
            @click="toggleSidebar"
            class="p-2.5 rounded-xl border transition"
            :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/60' : 'border-slate-200 bg-white/70'"
          >
            <i class="fas fa-bars" :class="isDark ? 'text-white' : 'text-slate-700'"></i>
          </button>

          <div class="flex items-center gap-3">
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
          <!-- SEARCH -->
          <div class="relative hidden sm:block">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search workspaces..."
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
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition"
              :class="isDark ? 'border-slate-800 bg-slate-900/80 hover:border-purple-500/50' : 'border-slate-200 bg-white/80 hover:border-purple-300/60'"
            >
              <!-- Avatar -->
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
      <!-- SIDEBAR -->
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
                  :class="selectedWorkspace?.id === workspace.id
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

      
      <main class="flex-1 p-6">
        <div class="max-w-9xl mx-auto space-y-8">
          <section class="grid grid-cols-1 xl:grid-cols-[3fr_1.15fr] gap-8 items-start">
            <div class="space-y-6">
              <div class="flex items-center justify-between flex-wrap gap-3">
                <div>
                <p class="text-xs font-semibold uppercase tracking-wide" :class="isDark ? 'text-slate-500' : 'text-slate-500'">Spaces</p>
                  <h2 class="text-2xl font-bold" :class="isDark ? 'text-white' : 'text-slate-900'">
                    {{ pageTitle }}
                  </h2>
                  <p class="text-sm" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                    {{ pageSubtitle }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    class="px-4 py-2 rounded-xl border text-sm font-semibold transition"
                    :class="isDark ? 'border-slate-800 text-white hover:border-purple-500/60' : 'border-slate-200 text-slate-800 hover:border-slate-300'"
                    @click="openCreateWorkspace"
                  >
                    <i class="fas fa-plus text-xs mr-2"></i> New
                  </button>
                 
                </div>
              </div>

              <div class="rounded-2xl border" :class="isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'">
                <div class="flex items-center justify-between gap-3 p-4">
                  <div class="flex items-center gap-2">
                    <i :class="[primarySectionIcon, 'text-slate-500']"></i>
                    <span class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ primarySectionLabel }}</span>
                  </div>
                  
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 pt-0">
                  <template v-if="workspacesToShow.length">
                    <div
                      v-for="workspace in workspacesToShow"
                      :key="workspace.id"
                      class="rounded-xl border overflow-hidden transition hover:-translate-y-1 hover:shadow-md cursor-pointer relative"
                      :class="isDark ? 'bg-slate-900/70 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'"
                      @click="goToWorkspace(workspace)"
                    >
                      <div class="relative h-44">
                        <div class="absolute inset-0" :style="workspaceCover(workspace)"></div>
                        <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50"></div>
                        <span
                          class="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold capitalize backdrop-blur-sm border"
                          :class="workspaceStatus(workspace).chip"
                        >
                          {{ workspaceStatus(workspace).label }}
                        </span>
                        <button
                          class="absolute top-3 right-3 text-sm p-1 transition"
                          :class="isDark
                            ? 'text-slate-200 hover:text-amber-300'
                            : 'text-slate-500 hover:text-amber-500'"
                          @click.stop="openWorkspaceMenu(workspace)"
                          aria-label="Workspace actions"
                        >
                          <i class="fas fa-ellipsis-vertical"></i>
                        </button>
                      </div>

                      <div class="p-4 space-y-3">
                        <div class="flex items-start justify-between gap-3">
                          <div class="space-y-1">
                            <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ workspace.name }}</p>
                            <p class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ workspace.description || 'Team workspace' }}</p>
                          </div>
                          <span class="text-sm font-semibold" :class="isDark ? 'text-slate-200' : 'text-slate-700'">
                            {{ getWorkspaceProgress(workspace) }}%
                          </span>
                        </div>
                        <div class="space-y-1">
                          <div class="text-xs font-semibold uppercase tracking-wide" :class="isDark ? 'text-slate-400' : 'text-slate-600'">Progress</div>
                          <div class="h-1.5 rounded-full overflow-hidden" :class="isDark ? 'bg-slate-800' : 'bg-slate-200/70'">
                            <div class="h-full rounded-full" :style="progressBar(workspace)"></div>
                          </div>
                        </div>
                        <div class="flex items-center justify-between text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                          <div class="flex -space-x-2">
                            <span
                              v-for="(member, idx) in memberInitials(workspace)"
                              :key="idx"
                              class="w-8 h-8 rounded-full border overflow-hidden bg-white text-slate-800 dark:bg-slate-800 dark:text-white border-white dark:border-slate-700 grid place-items-center text-[12px] font-semibold shadow"
                            >
                              <img v-if="member.photo" :src="member.photo" alt="member avatar" class="w-full h-full object-cover" />
                              <span v-else>{{ member.initials }}</span>
                            </span>
                          </div>
                          <div class="flex items-center gap-2">
                            <i class="far fa-calendar text-[11px]"></i>
                            <span>{{ formatDate(workspace.updatedAt || workspace.createdAt) }}</span>
                          </div>
                        </div>
                      </div>

                      <transition name="fade-scale">
                        <div
                          v-if="workspaceMenuOpen === workspace.id"
                          class="absolute right-4 top-12 w-48 rounded-xl border shadow-md shadow-black/10 z-50 p-1 origin-top-right transform transition duration-150 backdrop-blur-md"
                          :class="isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'"
                          ref="workspaceMenuRef"
                        >
                          <button class="menu-item" :class="menuItemClass" @click.stop="goToWorkspace(workspace)">
                            <i class="fas fa-eye text-xs"></i> View Boards
                          </button>
                          <button
                            v-if="getRole(workspace.id) === 'owner'"
                            class="menu-item"
                            :class="menuItemClass"
                            @click.stop="openEditWorkspace(workspace)"
                          >
                            <i class="fas fa-edit text-xs"></i> Edit Workspace
                          </button>
                          <button
                            v-if="getRole(workspace.id) === 'owner'"
                            class="menu-item"
                            :class="menuItemClass"
                            @click.stop="openInviteModal(workspace)"
                          >
                            <i class="fas fa-user-plus text-xs"></i> Invite Members
                          </button>
                          <button
                            v-if="getRole(workspace.id) !== 'guest'"
                            class="menu-item"
                            :class="menuItemClass"
                            @click.stop="openMemberManager(workspace)"
                          >
                            <i class="fas fa-users text-xs"></i> Manage Members
                          </button>
                          <button
                            v-if="canLeaveWorkspace(workspace)"
                            class="menu-item text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            @click.stop="promptLeaveWorkspace(workspace)"
                          >
                            <i class="fas fa-sign-out-alt text-xs"></i> Leave 
                          </button>
                          <button
                            v-if="getRole(workspace.id) === 'owner'"
                            class="menu-item text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            @click.stop="confirmDeleteWorkspace(workspace)"
                          >
                            <i class="fas fa-trash text-xs"></i> Delete Workspace
                          </button>
                        </div>
                      </transition>
                    </div>
                  </template>
                  <div
                    v-else
                    class="col-span-full rounded-xl border-2 border-dashed p-6 text-center"
                    :class="isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'"
                  >
                    {{ primaryEmptyMessage }}
                  </div>
                </div>
              </div>

              <div v-if="showCollaborationSection" class="space-y-3">
                <div class="flex items-center gap-2">
                  <i class="far fa-handshake text-slate-500"></i>
                  <h3 class="text-sm font-semibold uppercase tracking-[0.08em]" :class="isDark ? 'text-slate-300' : 'text-slate-700'">Collaborations</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <template v-if="sharedWorkspaces.length">
                    <div
                      v-for="workspace in sharedWorkspaces"
                      :key="workspace.id"
                      class="rounded-xl border overflow-hidden transition hover:-translate-y-1 hover:shadow-md cursor-pointer relative"
                      :class="isDark ? 'bg-slate-900/70 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'"
                      @click="goToWorkspace(workspace)"
                    >
                      <div class="relative h-44">
                        <div class="absolute inset-0" :style="workspaceCover(workspace)"></div>
                        <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50"></div>
                        <span
                          class="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold capitalize backdrop-blur-sm border"
                          :class="workspaceStatus(workspace).chip"
                        >
                          {{ workspaceStatus(workspace).label }}
                        </span>
                        <button
                          class="absolute top-3 right-3 text-sm p-1 transition"
                          :class="isDark
                            ? 'text-slate-200 hover:text-amber-300'
                            : 'text-slate-500 hover:text-amber-500'"
                          @click.stop="openWorkspaceMenu(workspace)"
                          aria-label="Workspace actions"
                        >
                          <i class="fas fa-ellipsis-vertical"></i>
                        </button>
                      </div>

                      <div class="p-4 space-y-3">
                        <div class="flex items-start justify-between gap-3">
                          <div class="space-y-1">
                            <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ workspace.name }}</p>
                            <p class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ workspace.description || 'Collaborate with your team.' }}</p>
                          </div>
                          <span class="text-sm font-semibold" :class="isDark ? 'text-slate-200' : 'text-slate-700'">
                            {{ getWorkspaceProgress(workspace) }}%
                          </span>
                        </div>
                        <div class="space-y-1">
                          <div class="text-xs font-semibold uppercase tracking-wide" :class="isDark ? 'text-slate-400' : 'text-slate-600'">Progress</div>
                          <div class="h-1.5 rounded-full overflow-hidden" :class="isDark ? 'bg-slate-800' : 'bg-slate-200/70'">
                            <div class="h-full rounded-full" :style="progressBar(workspace)"></div>
                          </div>
                        </div>
                        <div class="flex items-center justify-between text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                          <div class="flex -space-x-2">
                            <span
                              v-for="(member, idx) in memberInitials(workspace)"
                              :key="idx"
                              class="w-8 h-8 rounded-full border bg-white text-slate-800 dark:bg-slate-800 dark:text-white border-white dark:border-slate-700 grid place-items-center text-[12px] font-semibold shadow"
                            >
                              <img v-if="member.photo" :src="member.photo" alt="member avatar" class="w-full h-full object-cover" />
                              <span v-else>{{ member.initials }}</span>
                            </span>
                            <span
                              v-if="workspace.members?.length > 2"
                              class="w-8 h-8 rounded-full border bg-purple-600 text-white border-purple-500 grid place-items-center text-[12px] font-semibold shadow"
                            >
                              +{{ workspace.members.length - 2 }}
                            </span>
                          </div>
                          <div class="flex items-center gap-2">
                            <i class="far fa-calendar text-[11px]"></i>
                            <span>{{ formatDate(workspace.updatedAt || workspace.createdAt) }}</span>
                          </div>
                        </div>
                      </div>

                      <transition name="fade-scale">
                        <div
                          v-if="workspaceMenuOpen === workspace.id"
                          class="absolute right-4 top-12 w-48 rounded-xl border shadow-md shadow-black/10 z-50 p-1 origin-top-right transform transition duration-150 backdrop-blur-md"
                          :class="isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'"
                          ref="workspaceMenuRef"
                        >
                          <button class="menu-item" :class="menuItemClass" @click.stop="goToWorkspace(workspace)">
                            <i class="fas fa-eye text-xs"></i> View Workspace
                          </button>
                          <button
                            v-if="getRole(workspace.id) === 'owner'"
                            class="menu-item"
                            :class="menuItemClass"
                            @click.stop="openEditWorkspace(workspace)"
                          >
                            <i class="fas fa-edit text-xs"></i> Edit Workspace
                          </button>
                          <button
                            v-if="getRole(workspace.id) === 'owner'"
                            class="menu-item"
                            :class="menuItemClass"
                            @click.stop="openInviteModal(workspace)"
                          >
                            <i class="fas fa-user-plus text-xs"></i> Invite Members
                          </button>
                          <button
                            v-if="getRole(workspace.id) !== 'guest'"
                            class="menu-item"
                            :class="menuItemClass"
                            @click.stop="openMemberManager(workspace)"
                          >
                            <i class="fas fa-users text-xs"></i> Manage Members
                          </button>
                          <button
                            v-if="canLeaveWorkspace(workspace)"
                            class="menu-item text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            @click.stop="promptLeaveWorkspace(workspace)"
                          >
                            <i class="fas fa-sign-out-alt text-xs"></i> Leave   
                          </button>
                          <button
                            v-if="getRole(workspace.id) === 'owner'"
                            class="menu-item text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            @click.stop="confirmDeleteWorkspace(workspace)"
                          >
                            <i class="fas fa-trash text-xs"></i> Delete Workspace
                          </button>
                        </div>
                      </transition>
                    </div>
                  </template>
                  <div
                    v-else
                    class="rounded-xl border-2 border-dashed p-6 text-center"
                    :class="isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'"
                  >
                    No collaborations yet.
                  </div>
                </div>
              </div>
            </div>

            <aside class="space-y-4">
              <div class="rounded-2xl border p-4" :class="isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'">
                <div class="flex items-center gap-2 mb-3">
                  <i class="far fa-chart-bar text-slate-500"></i>
                  <h4 class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">Overview</h4>
                </div>
                <div class="space-y-3">
                  <div
                    v-for="stat in heroStats"
                    :key="stat.label"
                    class="flex items-center justify-between"
                  >
                    <div class="flex items-center gap-3">
                      <span class="w-9 h-9 rounded-xl grid place-items-center text-base text-white" :class="stat.iconBg">
                        <i :class="['fas', stat.icon]"></i>
                      </span>
                      <span class="text-sm" :class="isDark ? 'text-slate-200' : 'text-slate-800'">{{ stat.label }}</span>
                    </div>
                    <span class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ stat.value }}</span>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border p-4 space-y-3 max-h-[320px] overflow-y-auto custom-scroll"
                :class="isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'">
                <div class="flex items-center gap-2">
                  <i class="far fa-clock text-slate-500"></i>
                  <h4 class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">Activity</h4>
                </div>
                <div
                  v-if="!liveActivity.length"
                  class="text-sm px-3 py-2 rounded-xl"
                  :class="isDark ? 'text-slate-400 bg-slate-800/60' : 'text-slate-600 bg-slate-50'"
                >
                  No activity yet.
                </div>
                <template v-else>
                  <div
                    v-for="event in liveActivity"
                    :key="event.id"
                    class="flex items-start gap-3 p-2 rounded-xl transition"
                    :class="isDark ? 'hover:bg-slate-800/80' : 'hover:bg-slate-50'"
                  >
                    <div class="w-8 h-8 rounded-full grid place-items-center text-xs font-semibold text-white" :class="event.badgeBg">
                      <i :class="['fas', event.icon]"></i>
                    </div>
                    <div class="flex-1">
                      <p class="text-sm" :class="isDark ? 'text-white' : 'text-slate-800'">
                        <strong>{{ event.user }}</strong> {{ event.action }}
                        <span v-if="event.target" class="text-purple-600 dark:text-purple-300 font-semibold"> {{ event.target }}</span>
                      </p>
                      <div class="text-[12px] flex items-center gap-2" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                        <span class="flex items-center gap-1"><i class="fas fa-clock text-[10px]"></i> {{ event.when }}</span>
                        <span class="w-1.5 h-1.5 rounded-full" :class="event.statusDot"></span>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </aside>
          </section>

        </div>
      </main>
    </div>

    
    <CreateWorkspaceModal v-if="showCreateWorkspace" @close="showCreateWorkspace = false" />

   
    <EditWorkspaceModal
      v-if="editWorkspaceOpen && workspaceBeingEdited"
      :workspace="workspaceBeingEdited"
      @close="closeEditWorkspace"
      @save="handleSaveWorkspace"
    />

    
    <InviteMembersModal
      v-if="inviteModalOpen"
      :workspace-id="selectedWorkspaceForInvite"
      @close="closeInviteModal"
    />

    
    <MemberManagementModal
      v-if="manageMembersOpen"
      :workspace-id="selectedWorkspaceForManage"
      @close="closeManageMembers"
    />

    <transition name="fade-scale">
      <div
        v-if="workspaceToDelete"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="cancelDeleteWorkspace"
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
              <h3 class="text-lg font-semibold">Delete workspace</h3>
              <p class="text-sm" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                This will remove {{ workspaceToDelete.name }} and all boards inside it.
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              @click="cancelDeleteWorkspace"
              class="px-4 py-2 rounded-lg font-medium"
              :class="isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            >
              Cancel
            </button>
            <button
              @click="handleDeleteWorkspace"
              class="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade-scale">
      <div
        v-if="leaveModalOpen"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeLeaveModal"
      >
        <div
          class="w-full max-w-sm rounded-2xl border shadow-xl p-6 space-y-4"
          :class="isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'"
        >
          <div class="space-y-2">
            <p class="text-lg font-semibold">Leave workspace</p>
            <p class="text-sm" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              You will lose access to the boards for
              <strong>{{ leaveWorkspaceTarget?.name }}</strong>.
            </p>
          </div>

          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-2 rounded-xl font-semibold border transition"
              :class="isDark
                ? 'border-slate-700 text-white hover:border-slate-500'
                : 'border-slate-200 text-slate-700 hover:border-slate-400'"
              @click="closeLeaveModal"
            >
              Cancel
            </button>
            <button
              class="flex-1 px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 transition"
              @click="confirmLeaveWorkspace"
            >
              Leave workspace
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";

import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useThemeStore } from "@/stores/themeStore";
import { useActivityStore } from "@/stores/activityStore";
import { useNotificationStore } from "@/stores/notificationStore";

import NotificationBell from "@/components/common/NotificationBell.vue";
import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceModal.vue";
import EditWorkspaceModal from "@/components/modals/EditWorkspaceModal.vue";
import InviteMembersModal from "@/components/modals/InviteMembersModal.vue";
import MemberManagementModal from "@/components/modals/MemberManagementModal.vue";
import { ensureSocket, socket } from "@/socket.js";

const router = useRouter();
const route = useRoute();


const auth = useAuthStore();
const workspaceStore = useWorkspaceStore();
const themeStore = useThemeStore();
const activityStore = useActivityStore();
const notificationStore = useNotificationStore();

const { user, userInitials } = storeToRefs(auth);
const { workspaces, selectedWorkspace } = storeToRefs(workspaceStore);
const { isDark } = storeToRefs(themeStore);
const { events: activityEvents } = storeToRefs(activityStore);
const toggleTheme = themeStore.toggleTheme;


const sidebarOpen = ref(true);
const searchQuery = ref("");
const debouncedSearchQuery = ref("");
const showCreateWorkspace = ref(false);
const profileMenuOpen = ref(false);
const workspaceMenuOpen = ref(null);
const workspaceToDelete = shallowRef(null);
const activeNav = ref("home");
const activeFilter = ref("all");
const workspaceFilter = computed(() => {
  if (activeNav.value === "owned") return "owned";
  if (activeNav.value === "shared") return "shared";
  return activeFilter.value;
});
const notificationBellRef = ref(null);
const leaveModalOpen = ref(false);
const leaveWorkspaceTarget = shallowRef(null);

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
    debouncedSearchQuery.value = value;
  }, 150);
});


const inviteModalOpen = ref(false);
const manageMembersOpen = ref(false);
const selectedWorkspaceForInvite = ref(null);
const selectedWorkspaceForManage = ref(null);


const editWorkspaceOpen = ref(false);
const workspaceBeingEdited = shallowRef(null);


const userDisplayName = computed(
  () => user.value?.name || user.value?.displayName || user.value?.email || "User"
);
const userFirstName = computed(() => {
  const displayName = userDisplayName.value;
  const first = displayName.split(" ")[0] || displayName;
  return first;
});
const userEmail = computed(() => user.value?.email || "");
const userPhotoURL = computed(() => user.value?.photoURL || user.value?.imageUrl || null);


const profileRef = ref(null);
const workspaceMenuRef = ref(null);

const userEmailLower = computed(() => userEmail.value?.toLowerCase() || "");

const membershipByWorkspaceId = computed(() => {
  const roleById = new Map();
  const isMemberById = new Map();
  const email = userEmailLower.value;
  const list = workspaces.value || [];

  for (const workspace of list) {
    let role = "member";
    let isMember = false;
    if (email && Array.isArray(workspace.members)) {
      const member = workspace.members.find(
        (m) => m.email?.toLowerCase?.() === email
      );
      if (member) {
        isMember = true;
        role = (member.role || "member").toLowerCase();
      }
    }
    roleById.set(workspace.id, role);
    isMemberById.set(workspace.id, isMember);
  }

  return { roleById, isMemberById };
});

const getRole = (workspaceId) => {
  return membershipByWorkspaceId.value.roleById.get(workspaceId) || "member";
};


const menuItemClass = computed(() =>
  isDark.value
    ? "text-slate-200 hover:bg-slate-800"
    : "text-slate-700 hover:bg-slate-100"
);

let isActive = true;

onMounted(() => {
  const init = async () => {
    await workspaceStore.loadWorkspaces();
    if (!user.value) {
      await auth.initFromStorage?.();
    }
    if (!isActive) return;

    document.addEventListener("click", handleOutsideClick);
    await ensureSocket();
    if (!isActive) return;

    if (selectedWorkspace.value?.id && socket.connected) {
      socket.emit("joinWorkspace", selectedWorkspace.value.id);
    }

    socket.on("task:created", handleTaskCreated);
    socket.on("task:moved", handleTaskMoved);
    socket.on("task:commented", handleTaskCommented);
    socket.on("task:mentioned", handleTaskCommented);
  };

  init();
});

onBeforeUnmount(() => {
  isActive = false;
  document.removeEventListener("click", handleOutsideClick);
  socket.off("task:created", handleTaskCreated);
  socket.off("task:moved", handleTaskMoved);
  socket.off("task:commented", handleTaskCommented);
  socket.off("task:mentioned", handleTaskCommented);
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = null;
  }
});


const workspaceBuckets = computed(() => {
  const list = workspaces.value || [];
  const filter = workspaceFilter.value;
  const query = debouncedSearchQuery.value.toLowerCase();
  const { roleById, isMemberById } = membershipByWorkspaceId.value;

  const filtered = [];
  const owned = [];
  const shared = [];
  let totalMembersCount = 0;

  for (const workspace of list) {
    const role = roleById.get(workspace.id) || "member";

    if (filter === "owned" && role !== "owner") continue;
    if (filter === "shared" && role === "owner") continue;

    if (query) {
      const name = workspace.name || "";
      if (!name.toLowerCase().includes(query)) continue;
    }

    filtered.push(workspace);

    if (role === "owner") {
      owned.push(workspace);
    } else if (isMemberById.get(workspace.id)) {
      shared.push(workspace);
    }

    const memberCount = (workspace.members || []).filter(
      (member) => (member.role || "member").toLowerCase() !== "owner"
    ).length;
    totalMembersCount += memberCount;
  }

  return { filtered, owned, shared, totalMembersCount };
});

const filteredWorkspaces = computed(() => workspaceBuckets.value.filtered);
const ownedWorkspaces = computed(() => workspaceBuckets.value.owned);
const sharedWorkspaces = computed(() => workspaceBuckets.value.shared);
const isOwnedView = computed(() => workspaceFilter.value === "owned");
const isSharedView = computed(() => workspaceFilter.value === "shared");
const workspacesToShow = computed(() =>
  isSharedView.value ? sharedWorkspaces.value : ownedWorkspaces.value
);
const primarySectionLabel = computed(() => (isSharedView.value ? "Collaborations" : "Workspaces"));
const primarySectionIcon = computed(() => (isSharedView.value ? "far fa-handshake" : "far fa-folder-open"));
const primaryEmptyMessage = computed(() =>
  isSharedView.value ? "No collaborations yet." : "No workspaces yet."
);
const showCollaborationSection = computed(() => !(isOwnedView.value || isSharedView.value));
const pageTitle = computed(() =>
  isSharedView.value ? `${userFirstName.value}'s collaborations` : `${userFirstName.value}'s workspaces`
);
const pageSubtitle = computed(() =>
  isSharedView.value ? "Browse and open shared spaces." : `Browse and open ${userFirstName.value}'s spaces.`
);

const canLeaveWorkspace = (workspace) => {
  const role = getRole(workspace.id);
  return role !== "owner";
};

const ownedWorkspacesCount = computed(() => ownedWorkspaces.value.length);
const sharedWorkspacesCount = computed(() => sharedWorkspaces.value.length);

const totalMembers = computed(() => workspaceBuckets.value.totalMembersCount);

const workspaceId = computed(() => selectedWorkspace.value?.id);

const joinWorkspaceRoom = async (workspaceId) => {
  if (!workspaceId) return;
  await ensureSocket();
  if (socket.connected) {
    socket.emit("joinWorkspace", workspaceId);
  }
};

const heroStats = computed(() => [
  {
    label: "Workspaces",
    value: filteredWorkspaces.value.length,
    icon: "fa-folder",
    iconBg: "bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-400/40",
    delta: "+12%",
    deltaClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200",
    progress: "82%",
    bar: "bg-gradient-to-r from-purple-500 to-indigo-500",
  },
  {
    label: "Owned",
    value: ownedWorkspacesCount.value,
    icon: "fa-crown",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-300/40",
    delta: "+8%",
    deltaClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100",
    progress: "64%",
    bar: "bg-gradient-to-r from-amber-400 to-orange-500",
  },
  {
    label: "Shared",
    value: sharedWorkspacesCount.value,
    icon: "fa-users",
    iconBg: "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-lg shadow-emerald-300/40",
    delta: "+24%",
    deltaClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100",
    progress: "58%",
    bar: "bg-gradient-to-r from-emerald-400 to-green-500",
  },
  {
    label: "Members",
    value: totalMembers.value,
    icon: "fa-user-friends",
    iconBg: "bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-300/40",
    delta: "+2",
    deltaClass: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-100",
    progress: "72%",
    bar: "bg-gradient-to-r from-sky-400 to-blue-500",
  },
]);

const quickActions = [
  {
    title: "New Workspace",
    sub: "Spin up a fresh space",
    icon: "fa-plus",
    bg: "bg-gradient-to-br from-purple-500 to-indigo-500",
    onClick: () => openCreateWorkspace(),
  },
  {
    title: "Invite Team",
    sub: "Send quick invites",
    icon: "fa-user-plus",
    bg: "bg-gradient-to-br from-emerald-400 to-green-500",
    onClick: () => openInviteForSelectedWorkspace(),
  },
  {
    title: "Toggle Theme",
    sub: "Light / Dark",
    icon: "fa-adjust",
    bg: "bg-gradient-to-br from-amber-400 to-orange-500",
    onClick: () => toggleTheme(),
  },
];

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

const currentUserName = () =>
  user.value?.name || user.value?.displayName || user.value?.email || "User";

const selectDefaultWorkspaceForAction = () => {
  return (
    selectedWorkspace.value ||
    ownedWorkspaces.value[0] ||
    filteredWorkspaces.value[0] ||
    null
  );
};

const getDefaultWorkspaceId = () => {
  const target = selectDefaultWorkspaceForAction();
  return typeof target === "string" ? target : target?.id;
};

const openInviteForSelectedWorkspace = () => {
  const target = selectDefaultWorkspaceForAction();
  if (!target) {
    alert("You need at least one workspace to invite members.");
    return;
  }

  const role = getRole(target.id);
  if (role === "guest") {
    alert("Guests cannot invite members.");
    return;
  }

  selectedWorkspaceForInvite.value = target.id;
  inviteModalOpen.value = true;
};

const recordActivityEntry = (entry) => {
  activityStore.push({
    id: entry.id,
    user: entry.user || currentUserName(),
    action: entry.action,
    target: entry.target,
    icon: entry.icon,
    badgeBg: entry.badgeBg,
    statusDot: entry.statusDot,
    createdAt: entry.createdAt || new Date().toISOString(),
    message: entry.message,
  });
};

const palette = [
  "linear-gradient(135deg, #8b5cf6 0%, #2563eb 100%)",
  "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
  "linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%)",
  "linear-gradient(135deg, #14b8a6 0%, #6366f1 100%)",
  "linear-gradient(135deg, #f43f5e 0%, #f97316 100%)",
];

// Stock cover photos (Unsplash). Add/remove URLs as desired.
const workspacePhotos = Array.from({ length: 50 }, (_, idx) =>
  `https://picsum.photos/seed/workspace-${idx + 1}/1200/800`
);

const hashString = (value = "") =>
  [...value].reduce((hash, ch) => ((hash * 31 + ch.charCodeAt(0)) | 0), 0);

const workspaceCoverImage = (workspace) => {
  if (!workspace) return null;
  const seed = workspace.id || workspace.name || "workspace";
  const index = Math.abs(hashString(seed)) % workspacePhotos.length;
  return workspacePhotos[index];
};

const workspaceCover = (workspace) => {
  const idx = workspace.name?.length ? workspace.name.length % palette.length : 0;
  const photo = workspaceCoverImage(workspace);
  return {
    backgroundImage: photo ? `url("${photo}")` : palette[idx],
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: palette[idx],
  };
};

const statusByRole = {
  owner: {
    label: "Owner",
    chip: "bg-white/80 text-blue-700 border border-blue-100 dark:bg-slate-900/70 dark:text-blue-200",
  },
  guest: {
    label: "guest",
    chip: "bg-white/80 text-slate-700 border border-slate-200 dark:bg-slate-900/70 dark:text-slate-200",
  },
  member: {
    label: "Member",
    chip: "bg-white/80 text-amber-700 border border-amber-100 dark:bg-slate-900/70 dark:text-amber-200",
  },
};

const workspaceStatus = (workspace) => {
  const role = getRole(workspace.id);
  return statusByRole[role] || statusByRole.member;
};

const getWorkspaceProgress = (workspace) => {
  const boards = workspace.boards?.length || 1;
  const members = workspace.members?.length || 1;
  return Math.min(95, Math.max(15, boards * 10 + members * 5));
};

const progressGradientByRole = {
  owner: "linear-gradient(90deg, #7c3aed, #6366f1)",
  guest: "linear-gradient(90deg, #64748b, #cbd5e1)",
  member: "linear-gradient(90deg, #f59e0b, #ef4444)",
};

const progressBar = (workspace) => {
  const role = getRole(workspace.id);
  return {
    width: `${getWorkspaceProgress(workspace)}%`,
    background: progressGradientByRole[role] || progressGradientByRole.member,
  };
};

const memberInitials = (workspace) => {
  const members = workspace.members || [];
  return members.slice(0, 2).map((m) => {
    const name = m.name || m.email || "User";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return {
      initials,
      photo: m.imageUrl || m.photoURL || m.avatar || null,
    };
  });
};

const formatDate = (date) => {
  if (!date) return "Recently updated";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Recently updated";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const handleTaskCreated = ({ task } = {}) => {
  if (!task) return;
  recordActivityEntry({
    id: task.id ? `${task.id}-created` : undefined,
    user: task.assignee?.name || "Workspace",
    action: "created task",
    target: task.title,
    icon: "fa-plus",
    badgeBg: "bg-gradient-to-br from-purple-500 to-indigo-500",
    statusDot: "bg-purple-400",
    createdAt: task.createdAt,
  });
};

const handleTaskMoved = (payload = {}) => {
  const columnTitle = payload?.toColumnTitle;
  const actionMessage = columnTitle
    ? `Your task moved into "${columnTitle}"`
    : "A task was moved";
  recordActivityEntry({
    id: payload.taskId ? `${payload.taskId}-moved-${payload.toColumnId || "socket"}` : undefined,
    user: payload.user || "Workspace",
    action: "moved task",
    target:
      payload.taskTitle || payload.task?.title || (payload.taskId ? `Task ${payload.taskId}` : "a task"),
    icon: "fa-arrows-alt-h",
    badgeBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    statusDot: "bg-sky-400",
    message: actionMessage,
    notificationMessage: actionMessage,
    task: payload.task,
  });
};

const handleTaskCommented = ({ task, comment } = {}) => {
  const text = comment?.content || comment?.text || "";
  const hasMention = /@\w+/.test(text);
  recordActivityEntry({
    id: comment?.id ? `${comment.id}-comment` : undefined,
    user: comment?.author || comment?.user || "Workspace",
    action: hasMention ? "mentioned someone in" : "commented on",
    target: task?.title || "a task",
    icon: hasMention ? "fa-at" : "fa-comment-dots",
    badgeBg: hasMention
      ? "bg-gradient-to-br from-amber-500 to-rose-500"
      : "bg-gradient-to-br from-blue-500 to-cyan-500",
    statusDot: hasMention ? "bg-amber-400" : "bg-blue-400",
    createdAt: comment?.createdAt,
  });
};


const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const toggleProfileMenu = () => {
  profileMenuOpen.value = !profileMenuOpen.value;
};

const handleNavClick = async (item) => {
  activeNav.value = item.id;
  if (item.id === "dashboard") {
    router.push("/dashboard");
    return;
  }
  if (item.id === "boards") {
    const targetId = getDefaultWorkspaceId();
    if (targetId) {
      workspaceStore.setCurrentWorkspace(targetId);
      router.push(`/workspace/${targetId}`);
    } else {
      router.push("/workspace");
    }
    return;
  }
  if (item.id === "tasks") {
    const targetId = getDefaultWorkspaceId();
    if (!targetId) {
      router.push("/workspace");
      return;
    }
    workspaceStore.setCurrentWorkspace(targetId);
    const boardKey = String(targetId);
    const hasBoardCache = Object.prototype.hasOwnProperty.call(
      workspaceStore.boardsByWorkspace,
      boardKey
    );
    let list = workspaceStore.getBoards(targetId);
    if (!hasBoardCache) {
      try {
        await workspaceStore.loadBoards(targetId);
        list = workspaceStore.getBoards(targetId);
      } catch {
        list = [];
      }
    }
    const boardId = list?.[0]?.id;
    if (boardId) {
      router.push(`/workspace/${targetId}/board/${boardId}`);
    } else {
      router.push(`/workspace/${targetId}`);
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


const handleOutsideClick = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) {
    profileMenuOpen.value = false;
  }
  const menuEls = Array.isArray(workspaceMenuRef.value)
    ? workspaceMenuRef.value
    : workspaceMenuRef.value
      ? [workspaceMenuRef.value]
      : [];
  const clickedInsideMenu = menuEls.some((el) => el?.contains(e.target));
  if (menuEls.length && !clickedInsideMenu) workspaceMenuOpen.value = null;
};

const openCreateWorkspace = () => {
  showCreateWorkspace.value = true;
};

const goToWorkspace = (workspaceOrId) => {
  if (workspaceOrId?.isOptimistic) return;
  const workspaceId =
    typeof workspaceOrId === "string" ? workspaceOrId : workspaceOrId?.id;
  if (!workspaceId) return;

  workspaceStore.setCurrentWorkspace(workspaceId);
  joinWorkspaceRoom(workspaceId);

  // ✅ FIXED
  router.push(`/workspace/${workspaceId}`);
};


const confirmDeleteWorkspace = (workspace) => {
  if (workspace?.isOptimistic) return;
  workspaceMenuOpen.value = null;
  workspaceToDelete.value = workspace;
};

const cancelDeleteWorkspace = () => {
  workspaceToDelete.value = null;
};

const handleDeleteWorkspace = async () => {
  if (!workspaceToDelete.value) return;
  try {
    const ok = await workspaceStore.deleteWorkspace(workspaceToDelete.value.id);
    if (!ok) {
      alert("Failed to delete workspace");
    }
  } finally {
    workspaceToDelete.value = null;
  }
};

const promptLeaveWorkspace = (workspace) => {
  if (workspace?.isOptimistic) return;
  leaveWorkspaceTarget.value = workspace;
  leaveModalOpen.value = true;
};

const confirmLeaveWorkspace = async () => {
  if (!leaveWorkspaceTarget.value || !userEmail.value) return;
  try {
    const ok = await workspaceStore.leaveWorkspace(leaveWorkspaceTarget.value.id);
    if (!ok) {
      alert("Failed to leave workspace");
      return;
    }
  } finally {
    leaveModalOpen.value = false;
    leaveWorkspaceTarget.value = null;
  }
};

const closeLeaveModal = () => {
  leaveModalOpen.value = false;
  leaveWorkspaceTarget.value = null;
};

const openWorkspaceMenu = (workspace) => {
  if (workspace?.isOptimistic) return;
  const id = typeof workspace === "object" ? workspace?.id : workspace;
  if (!id) return;
  workspaceMenuOpen.value = workspaceMenuOpen.value === id ? null : id;
};

watch(
  () => selectedWorkspace.value?.id,
  (id) => {
    if (id) joinWorkspaceRoom(id);
  }
);

// Sync active filter/nav from route query so /workspace?filter=owned works
const syncFilterFromRoute = () => {
  const f = (route.query.filter || "").toString().toLowerCase();
  if (f === "owned") {
    activeFilter.value = "owned";
    activeNav.value = "owned";
  } else if (f === "shared") {
    activeFilter.value = "shared";
    activeNav.value = "shared";
  } else {
    activeFilter.value = "all";
    activeNav.value = "home";
  }
};

onMounted(syncFilterFromRoute);
watch(
  () => route.query.filter,
  () => syncFilterFromRoute()
);


const handleLogout = () => {
  auth.logout();
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


const openEditWorkspace = (workspace) => {
  if (workspace?.isOptimistic) return;
  workspaceMenuOpen.value = null;
  workspaceBeingEdited.value = { ...workspace };
  editWorkspaceOpen.value = true;
};

const closeEditWorkspace = () => {
  editWorkspaceOpen.value = false;
  workspaceBeingEdited.value = null;
};

const handleSaveWorkspace = async ({ id, name }) => {
  if (id && name) {
    const updated = await workspaceStore.renameWorkspace(id, name);
    if (!updated) {
      alert("Failed to update workspace");
      return;
    }
  }
  closeEditWorkspace();
};


const openInviteModal = (workspace) => {
  if (workspace?.isOptimistic) return;
  const role = getRole(workspace.id);
  if (role === "guest") return;
  workspaceMenuOpen.value = null;
  selectedWorkspaceForInvite.value = workspace.id;
  inviteModalOpen.value = true;
};

const closeInviteModal = () => {
  inviteModalOpen.value = false;
  selectedWorkspaceForInvite.value = null;
};


const openMemberManager = async (workspace) => {
  if (workspace?.isOptimistic) return;
  if (getRole(workspace.id) === "guest") return;
  workspaceMenuOpen.value = null;
  selectedWorkspaceForManage.value = workspace.id;
  await workspaceStore.loadMembers(workspace.id);
  if (!isActive) return;
  manageMembersOpen.value = true;
};

const closeManageMembers = () => {
  manageMembersOpen.value = false;
  selectedWorkspaceForManage.value = null;
};
</script>

<style scoped>
.menu-item {
  @apply w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition;
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

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.6));
  border-radius: 9999px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
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

.floating-shape {
  position: absolute;
  width: 140px;
  height: 140px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  transform: rotate(8deg);
  animation: float 18s ease-in-out infinite;
  pointer-events: none;
}
.shape-1 {
  top: 10%;
  left: 8%;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(59, 130, 246, 0.04));
}
.shape-2 {
  bottom: 12%;
  right: 12%;
  animation-delay: 4s;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(99, 102, 241, 0.05));
}
.shape-3 {
  top: 40%;
  right: 20%;
  width: 110px;
  height: 110px;
  animation-delay: 8s;
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.07), rgba(14, 165, 233, 0.04));
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(6deg);
  }
  50% {
    transform: translateY(-10px) rotate(10deg);
  }
}

.workspace-view i,
.workspace-view svg {
  transition: color 0.2s ease, fill 0.2s ease, stroke 0.2s ease;
}

.workspace-view button:hover i,
.workspace-view button:focus-visible i,
.workspace-view button:hover svg,
.workspace-view button:focus-visible svg,
.workspace-view i:hover,
.workspace-view svg:hover {
  color: #fcd34d;
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
