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
          <div class="relative hidden sm:block">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search dashboard..."
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

      <main class="flex-1 p-4 sm:p-6 overflow-auto min-h-0">
        <div class="max-w-7xl mx-auto h-full flex flex-col gap-6">
          <section class="rounded-2xl border" :class="heroSurface">
            <div class="p-6 sm:p-7 space-y-6">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="space-y-1">
                  <p class="text-xs font-semibold uppercase tracking-[0.12em]" :class="mutedText">Task dashboard</p>
                  <h2 class="text-3xl font-bold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ userFirstName }}'s pulse</h2>
                  <p class="text-sm" :class="mutedText">A quick snapshot of your team momentum.</p>
                </div>
                
              </div>

              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div
                  v-for="stat in headlineStats"
                  :key="stat.label"
                  class="rounded-xl border p-3 sm:p-4 flex items-center justify-between"
                  :class="surfaceCard"
                >
                  <div>
                    <p class="text-xs uppercase tracking-[0.12em]" :class="mutedText">{{ stat.label }}</p>
                    <div class="mt-1.5 flex items-baseline gap-2">
                      <span class="text-3xl font-bold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ stat.value }}</span>
                      <span v-if="stat.suffix" class="text-sm" :class="mutedText">{{ stat.suffix }}</span>
                    </div>
                  </div>
                  <span class="w-10 h-10 rounded-xl grid place-items-center text-base" :class="stat.badge">
                    <i :class="stat.icon"></i>
                  </span>
                </div>
              </div>

              <div class="grid gap-4 lg:grid-cols-2 items-stretch">
                <div class="rounded-xl border p-3 sm:p-3 flex flex-col gap-3 max-h-48 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">Tasks Progress</p>
                    <div class="flex items-center gap-2 text-xs">
                      <button
                        class="px-2 py-1 rounded-lg border text-[11px] transition"
                        :class="progressRange === 'week'
                          ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-100 border-indigo-200 text-indigo-700')
                          : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600')"
                        @click="progressRange = 'week'"
                      >Week</button>
                      <button
                        class="px-2 py-1 rounded-lg border text-[11px] transition"
                        :class="progressRange === 'month'
                          ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-100 border-indigo-200 text-indigo-700')
                          : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600')"
                        @click="progressRange = 'month'"
                      >Month</button>
                    </div>
                  </div>
                  <div v-if="progressBars.length" class="grid" :class="progressRange === 'week' ? 'grid-cols-7' : 'grid-cols-4'">
                    <div v-for="bar in progressBars" :key="bar.key || bar.label" class="flex flex-col items-center gap-1">
                      <div
                        class="w-8 rounded-full transition bg-gradient-to-t from-indigo-200 to-indigo-500"
                        :class="isDark ? 'from-slate-700 to-indigo-400' : ''"
                        :style="{ height: `${bar.pct}%` }"
                      ></div>
                      <span class="text-[11px] uppercase truncate" :class="mutedText">{{ bar.label }}</span>
                    </div>
                  </div>
                  <div v-else class="text-xs" :class="mutedText">No tasks yet.</div>
                </div>

                <div class="rounded-xl border p-3 sm:p-3 space-y-2 max-h-48 overflow-y-auto" :class="surfaceCard">
                  <div
                    v-for="item in timeSummary"
                    :key="item.label"
                    class="flex items-center justify-between"
                  >
                    <div>
                      <p class="text-xs uppercase tracking-[0.12em]" :class="mutedText">{{ item.label }}</p>
                      <p class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
                        {{ item.value }}
                      </p>
                    </div>
                    <span class="rounded-full px-3 py-1 text-xs font-semibold border" :class="pillClass(item.tone)">{{ item.pill }}</span>
                  </div>
                </div>
              </div>

              <div class="grid gap-4 lg:grid-cols-3">
                <div class="rounded-xl border p-3 sm:p-3 flex items-center gap-3 max-h-44 overflow-hidden" :class="surfaceCard">
                  <div class="relative h-20 w-20">
                    <svg viewBox="0 0 36 36" class="h-full w-full -rotate-90">
                      <path
                        class="text-indigo-200"
                        stroke="currentColor"
                        stroke-width="4"
                        fill="none"
                        d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                      />
                      <path
                        class="text-indigo-500"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-width="4"
                        fill="none"
                        :stroke-dasharray="`${interest.value}, 100`"
                        d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                      />
                    </svg>
                    <div class="absolute inset-0 grid place-items-center text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">
                      {{ interest.label }}
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">Your Interest</p>
                    <p class="text-xs" :class="mutedText">Focus time</p>
                  </div>
                </div>

                <div class="rounded-xl border p-3 sm:p-3 max-h-48 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-center justify-between mb-3">
                    <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">Productivity</p>
                    <p class="text-xs" :class="mutedText">{{ productivity.total }}</p>
                  </div>
                  <div class="space-y-3">
                    <div v-for="day in productivity.days" :key="day.label" class="space-y-1">
                      <div class="flex items-center justify-between text-xs" :class="mutedText">
                        <span class="capitalize">{{ day.label }}</span>
                        <span class="font-semibold" :class="isDark ? 'text-white' : 'text-slate-700'">{{ day.value }}h</span>
                      </div>
                      <div class="h-2.5 w-full rounded-full overflow-hidden" :class="isDark ? 'bg-slate-800' : 'bg-slate-100'">
                        <div class="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500" :style="{ width: `${day.value * 15}%` }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="rounded-xl border p-3 sm:p-3 space-y-2 max-h-48 overflow-hidden" :class="surfaceCard">
                  
                  <div class="flex items-center gap-2 text-xs">
                    <template v-for="(d, idx) in week" :key="d.label">
                      <button
                        class="flex-1 rounded-lg px-2.5 py-1.5 transition text-left"
                        :class="idx === 1
                          ? 'bg-indigo-600 text-white shadow'
                          : isDark
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                      >
                        <div class="text-[11px] uppercase">{{ d.day }}</div>
                        <div class="text-sm font-semibold">{{ d.date }}</div>
                      </button>
                    </template>
                  </div>
                  <div class="space-y-3 text-sm">
                    <div
                      v-for="item in thisWeekTasks"
                      :key="item.title + item.when"
                      class="rounded-xl border p-3 shadow-sm"
                      :class="isDark ? 'bg-slate-900/70 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'"
                    >
                      <p class="font-semibold">{{ item.title }}</p>
                      <p class="text-xs" :class="mutedText">{{ item.when }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div class="rounded-xl border p-3 sm:p-3 space-y-2 max-h-56 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs uppercase tracking-[0.12em]" :class="mutedText">Workspaces</p>
                      <p class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ totalWorkspaces }}</p>
                    </div>
                    <span class="text-sm font-semibold" :class="isDark ? 'text-indigo-200' : 'text-indigo-700'">{{ workspacePercent }}%</span>
                  </div>
                  <div class="h-2.5 rounded-full overflow-hidden" :class="isDark ? 'bg-slate-800' : 'bg-slate-200'">
                    <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" :style="{ width: `${workspacePercent}%` }"></div>
                  </div>
                  <p class="text-xs" :class="mutedText">Progress to {{ workspaceGoal }} spaces</p>
                </div>

                <div class="rounded-xl border p-3 sm:p-3 space-y-2 max-h-56 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-xs uppercase tracking-[0.12em]" :class="mutedText">Members</p>
                      <p class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ totalMembersCount }}</p>
                    </div>
                    <span class="text-sm font-semibold" :class="isDark ? 'text-emerald-200' : 'text-emerald-700'">{{ memberPercent }}%</span>
                  </div>
                  <div class="h-2.5 rounded-full overflow-hidden" :class="isDark ? 'bg-slate-800' : 'bg-slate-200'">
                    <div class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" :style="{ width: `${memberPercent}%` }"></div>
                  </div>
                  <p class="text-xs" :class="mutedText">Progress to {{ memberGoal }} members</p>
                </div>

                <div class="rounded-xl border p-3 sm:p-3 space-y-2 max-h-56 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">Team footprint</p>
                    <span class="text-xs px-2 py-1 rounded-full" :class="isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'">Members & spaces</span>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-xs" :class="mutedText">
                      <span>Workspace capacity</span>
                      <span class="font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">{{ workspacePercent }}%</span>
                    </div>
                    <div class="h-2 rounded-full overflow-hidden" :class="isDark ? 'bg-slate-800' : 'bg-slate-200'">
                      <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" :style="{ width: `${workspacePercent}%` }"></div>
                    </div>
                    <div class="flex items-center justify-between text-xs" :class="mutedText">
                      <span>Member load</span>
                      <span class="font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">{{ memberPercent }}%</span>
                    </div>
                    <div class="h-2 rounded-full overflow-hidden" :class="isDark ? 'bg-slate-800' : 'bg-slate-200'">
                      <div class="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" :style="{ width: `${memberPercent}%` }"></div>
                    </div>
                  </div>
                </div>

                <div class="rounded-xl border p-3 sm:p-3 space-y-2 max-h-56 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">Activity</p>
                    <span class="inline-flex items-center gap-2 text-xs" :class="mutedText">
                      <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                      Live
                    </span>
                  </div>
                  <div v-if="activityFeed.length" class="space-y-2 max-h-40 overflow-y-auto pr-1">
                    <div
                      v-for="item in activityFeed.slice(0,8)"
                      :key="item.title + item.date"
                      class="rounded-lg border p-2 text-sm"
                      :class="isDark ? 'bg-slate-900/70 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'"
                    >
                      <div class="flex items-center justify-between gap-2">
                        <span class="truncate font-semibold">{{ item.title }}</span>
                        <span class="text-[11px]" :class="mutedText">{{ item.date }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-xs" :class="mutedText">No activity yet.</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>

    <CreateWorkspaceModal v-if="showCreateWorkspace" @close="showCreateWorkspace = false" />
  </div>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import { useAuthStore } from "@/stores/authStore";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useThemeStore } from "@/stores/themeStore";
import { useBoardStore } from "@/stores/boardStore";

import NotificationBell from "@/components/common/NotificationBell.vue";
import CreateWorkspaceModal from "@/components/modals/CreateWorkspaceModal.vue";

const router = useRouter();

const auth = useAuthStore();
const workspaceStore = useWorkspaceStore();
const themeStore = useThemeStore();
const boardStore = useBoardStore();

const { user, userInitials } = storeToRefs(auth);
const { workspaces, selectedWorkspace } = storeToRefs(workspaceStore);
const { isDark } = storeToRefs(themeStore);
const { columns, boardActivity } = storeToRefs(boardStore);
const toggleTheme = themeStore.toggleTheme;

const sidebarOpen = ref(true);
const searchQuery = ref("");
const showCreateWorkspace = ref(false);
const profileMenuOpen = ref(false);
const activeNav = ref("dashboard");
const activeFilter = ref("all");
const notificationBellRef = ref(null);
const profileRef = ref(null);
const progressRange = ref("week");

const sidebarNav = [
  { id: "dashboard", icon: "fa-gauge-high", style: "fas", label: "Dashboard" },
  { id: "home", icon: "fa-house", style: "fas", label: "Home" },
  { id: "owned", icon: "fa-folder-open", style: "far", label: "My spaces" },
  { id: "shared", icon: "fa-handshake", style: "far", label: "Collabs" },
];

const sessionSeconds = ref(0);
let sessionTimer = null;

const isDoneColumn = (title = "") =>
  /done|complete|finish|closed|resolved/i.test(title.trim().toLowerCase());

const currentWorkspaceId = computed(
  () =>
    selectedWorkspace.value?.id ||
    selectedWorkspace.value ||
    workspaces.value?.[0]?.id ||
    null
);

const allTasks = computed(() =>
  (columns.value || []).flatMap((c) => c.tasks || [])
);

const doneTasksCount = computed(() =>
  (columns.value || []).reduce((sum, col) => {
    if (isDoneColumn(col.title || col.name || "")) {
      return sum + (col.tasks?.length || 0);
    }
    return sum;
  }, 0)
);

const totalTasksCount = computed(() => boardStore.totalTasks || 0);

const focusTasksCount = computed(() => {
  const email = user.value?.email?.toLowerCase?.();
  if (!email) return 0;
  return allTasks.value.filter((t) => (t.assignee || "").toLowerCase() === email)
    .length;
});

const taskProgressPercent = computed(() =>
  totalTasksCount.value
    ? Math.round((doneTasksCount.value / totalTasksCount.value) * 100)
    : 0
);

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

const progressBars = computed(() => {
  const tasks = allTasks.value || [];
  const now = new Date();

  
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startOfWeek = (d) => {
    const date = startOfDay(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
    return startOfDay(new Date(date.setDate(diff)));
  };

  if (progressRange.value === "month") {
    
    const buckets = Array.from({ length: 4 }, (_, i) => {
      const end = startOfWeek(new Date(now));
      end.setDate(end.getDate() - i * 7);
      const start = startOfWeek(new Date(end));
      start.setDate(start.getDate() - 7);
      return { label: `W${4 - i}`, start, end, count: 0 };
    });

    for (const t of tasks) {
      const created = t.createdAt ? new Date(t.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) continue;
      for (const bucket of buckets) {
        if (created > bucket.start && created <= bucket.end) {
          bucket.count += 1;
          break;
        }
      }
    }

    const max = Math.max(1, ...buckets.map((b) => b.count));
    return buckets.reverse().map((b) => ({
      key: b.label,
      label: b.label,
      pct: Math.max(10, Math.round((b.count / max) * 100)),
      count: b.count,
    }));
  }

  
  const start = new Date(now);
  start.setDate(now.getDate() - 6);

  const counts = Array.from({ length: 7 }, (_, idx) => {
    const day = new Date(start);
    day.setDate(start.getDate() + idx);
    const label = day.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
    const key = day.toISOString().slice(0, 10);

    const count = tasks.filter((t) => {
      const created = t.createdAt ? new Date(t.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) return false;
      return created.toDateString() === day.toDateString();
    }).length;

    return { label, key, count };
  });

  const max = Math.max(1, ...counts.map((c) => c.count));
  return counts.map((c) => ({
    key: c.key,
    label: c.label,
    pct: Math.max(10, Math.round((c.count / max) * 100)),
    count: c.count,
  }));
});

const productivity = computed(() => ({
  total: `${doneTasksCount.value} done`,
  days: (progressBars.value || []).map((b) => ({
    label: (b.label || "").toLowerCase(),
    value: b.count || 0,
  })),
}));

const hoursSpentDisplay = computed(() => (sessionSeconds.value / 3600).toFixed(1));

const headlineStats = computed(() => [
  {
    label: "Hours spent",
    value: hoursSpentDisplay.value,
    suffix: "h",
    icon: "fa-solid fa-clock",
    badge:
      "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-400/30",
  },
  {
    label: "Tasks",
    value: totalTasksCount.value,
    suffix: "open",
    icon: "fa-solid fa-layer-group",
    badge:
      "bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-400/30",
  },
  {
    label: "Progress",
    value: taskProgressPercent.value,
    suffix: "%",
    icon: "fa-solid fa-star",
    badge:
      "bg-gradient-to-br from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-300/30",
  },
  {
    label: "Workspaces",
    value: totalWorkspaces.value,
    suffix: "spaces",
    icon: "fa-solid fa-briefcase",
    badge:
      "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md shadow-purple-300/30",
  },
  {
    label: "Members",
    value: totalMembersCount.value,
    suffix: "people",
    icon: "fa-solid fa-users",
    badge:
      "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-300/30",
  },
]);

const timeSummary = computed(() => [
  {
    label: "Time on app",
    value: `${hoursSpentDisplay.value}h`,
    pill: "live",
    tone: "indigo",
  },
  {
    label: "Tasks created",
    value: allTasks.value.length,
    pill: `${totalTasksCount.value || 0} total`,
    tone: "sky",
  },
  { label: "Done", value: doneTasksCount.value, pill: `${taskProgressPercent.value}%`, tone: "emerald" },
  { label: "Workspaces", value: totalWorkspaces.value, pill: `${workspacePercent.value}%`, tone: "indigo" },
  { label: "Members", value: totalMembersCount.value, pill: `${memberPercent.value}%`, tone: "emerald" },
]);

const interest = computed(() => {
  const percent = totalTasksCount.value
    ? Math.round((focusTasksCount.value / totalTasksCount.value) * 100)
    : 0;
  return {
    value: percent,
    label: `${focusTasksCount.value} tasks`,
  };
});

const week = computed(() => {
  const today = new Date();
  return Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + idx);
    return {
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      date: d.getDate(),
    };
  });
});

const thisWeekTasks = computed(() => {
  const today = new Date();
  const inSevenDays = new Date();
  inSevenDays.setDate(today.getDate() + 7);

  const upcoming = allTasks.value
    .filter((t) => t.dueDate)
    .map((t) => ({ ...t, dueDateObj: new Date(t.dueDate) }))
    .filter(
      (t) =>
        !Number.isNaN(t.dueDateObj.getTime()) &&
        t.dueDateObj >= today &&
        t.dueDateObj <= inSevenDays
    )
    .sort((a, b) => a.dueDateObj - b.dueDateObj)
    .slice(0, 3);

  const fallback = allTasks.value
    .map((t) => ({ ...t, created: t.createdAt ? new Date(t.createdAt) : new Date() }))
    .sort((a, b) => b.created - a.created)
    .slice(0, 3);

  const list = upcoming.length ? upcoming : fallback;

  return list.map((task) => ({
    title: task.title || "Task",
    when: task.dueDate
      ? new Date(task.dueDate).toLocaleString(undefined, { month: "short", day: "numeric" })
      : formatRelativeTime(task.createdAt),
  }));
});

const activityFeed = computed(() => {
  const hidden = new Set([
    "MOVE_TASK",
    "COMMENT_CREATE",
    "CREATE_TASK",
    "UPDATE_TASK",
    "DELETE_TASK",
    "ASSIGN_TASK",
    "UNASSIGN_TASK",
  ]);

  const list = Array.isArray(boardActivity.value) ? boardActivity.value : [];

  return list
    .filter((entry) => {
      if (!entry) return false;

      
      if (entry.action && hidden.has(entry.action)) return false;

      
      if (typeof entry.message === "string" && /^[A-Z_]+$/.test(entry.message)) return false;

      
      return Boolean(entry.message && entry.message.trim());
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6)
    .map((entry) => {
      const createdAt = entry.createdAt || Date.now();
      const freshnessMinutes = Math.max(
        1,
        Math.floor((Date.now() - new Date(createdAt)) / 60000)
      );
      const freshness = Math.max(12, 100 - Math.min(90, freshnessMinutes));

      return {
        title: entry.message || "Activity",
        date: formatRelativeTime(createdAt),
        progress: `${freshness}%`,
      };
    });
});


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

const selectedWorkspaceId = computed(() => selectedWorkspace.value?.id || selectedWorkspace.value || null);

const mutedText = computed(() => (isDark.value ? "text-slate-400" : "text-slate-500"));

const surfaceCard = computed(() =>
  isDark.value
    ? "bg-slate-900/70 border-slate-800 text-white shadow-lg shadow-black/20"
    : "bg-white border-slate-200 text-slate-900 shadow-sm"
);

const heroSurface = computed(() =>
  isDark.value
    ? "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 shadow-2xl shadow-purple-500/20"
    : "bg-gradient-to-br from-white via-indigo-50 to-purple-50 border-slate-200 shadow-lg shadow-purple-200/40"
);

const menuItemClass = computed(() =>
  isDark.value ? "text-slate-200 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
);

const getRole = (workspaceId) => workspaceStore.getUserRole(workspaceId, user.value?.email);

const totalWorkspaces = computed(() => workspaces.value?.length || 0);

const totalMembersCount = computed(() =>
  (workspaces.value || []).reduce((sum, ws) => sum + (ws.members?.length || 0), 0)
);

const workspaceGoal = 10;
const memberGoal = 25;

const workspacePercent = computed(() =>
  Math.min(100, Math.round((totalWorkspaces.value / workspaceGoal) * 100))
);

const memberPercent = computed(() =>
  Math.min(100, Math.round((totalMembersCount.value / memberGoal) * 100))
);

const topSpacesByMembers = computed(() => {
  const list = (workspaces.value || [])
    .map((w) => ({
      name: w.name || "Workspace",
      members: w.members?.length || 0,
    }))
    .sort((a, b) => b.members - a.members)
    .slice(0, 4);

  const max = list[0]?.members || 1;
  return list.map((item) => ({
    ...item,
    percent: Math.round((item.members / max) * 100),
  }));
});

const filteredWorkspaces = computed(() => {
  let list = workspaces.value || [];

  if (activeFilter.value === "owned") {
    list = list.filter((w) => getRole(w.id) === "owner");
  } else if (activeFilter.value === "shared") {
    list = list.filter((w) => getRole(w.id) !== "owner");
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((w) => w.name?.toLowerCase().includes(q));
  }

  return list;
});

onMounted(() => {
  workspaceStore.loadWorkspaces();
  if (!user.value) auth.initFromStorage?.();
  document.addEventListener("click", handleOutsideClick);

  sessionTimer = setInterval(() => {
    sessionSeconds.value += 1;
  }, 1000);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
  if (sessionTimer) clearInterval(sessionTimer);
});

watch(
  () => selectedWorkspaceId.value,
  async (workspaceId) => {
    if (!workspaceId) return;

    try {
      
      await boardStore.loadBoards(workspaceId);

      
      const firstBoard = boardStore.boards?.[0];
      if (firstBoard?.id) {
        await boardStore.loadBoard(workspaceId, firstBoard.id);
      }
    } catch (err) {
      console.error("Dashboard board load error:", err);
    }
  },
  { immediate: true }
);


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

const handleNavClick = (item) => {
  activeNav.value = item.id;
  if (item.id === "dashboard") {
    router.push("/dashboard");
    return;
  }

  if (item.id === "home") {
    router.push("/workspace");
    return;
  }

  if (item.id === "owned") {
    router.push({ path: "/workspace", query: { filter: "owned" } });
    return;
  }

  if (item.id === "shared") {
    router.push({ path: "/workspace", query: { filter: "shared" } });
    return;
  }
};

const openCreateWorkspace = () => {
  showCreateWorkspace.value = true;
};

const goToWorkspace = (workspaceOrId) => {
  const workspaceId = typeof workspaceOrId === "string" ? workspaceOrId : workspaceOrId?.id;
  if (!workspaceId) return;

  workspaceStore.setCurrentWorkspace(workspaceId);
  router.push(`/workspace/${workspaceId}`);
};

const goWorkspace = () => {
  if (selectedWorkspaceId.value) {
    router.push(`/workspace/${selectedWorkspaceId.value}`);
  } else {
    router.push("/workspace");
  }
};

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

const pillClass = (tone = "sky") => {
  if (tone === "emerald") {
    return isDark.value
      ? "bg-emerald-900/50 text-emerald-200 border-emerald-800"
      : "bg-emerald-100 text-emerald-700 border-transparent";
  }
  if (tone === "indigo") {
    return isDark.value
      ? "bg-indigo-900/40 text-indigo-200 border-indigo-700"
      : "bg-indigo-100 text-indigo-700 border-transparent";
  }
  if (tone === "sky") {
    return isDark.value
      ? "bg-sky-900/40 text-sky-200 border-sky-700"
      : "bg-sky-100 text-sky-700 border-transparent";
  }
  return isDark.value
    ? "bg-slate-800 text-slate-200 border-slate-700"
    : "bg-slate-100 text-slate-700 border-transparent";
};
</script>



<style scoped>
.menu-item {
  width: 100%;
  text-align: left;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
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
