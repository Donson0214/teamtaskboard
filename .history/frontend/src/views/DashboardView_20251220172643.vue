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
            <main class="flex-1 p-4 sm:p-6 min-h-0 overflow-hidden">
        <div class="max-w-7xl mx-auto h-full min-h-0 antialiased">
          <div class="h-full rounded-2xl border" :class="canvasSurface">
            <div class="grid h-full grid-rows-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.85fr)]">
              <div
                class="grid grid-cols-1 md:grid-cols-[1.6fr,1fr] min-h-0 divide-y md:divide-y-0 md:divide-x"
                :class="divideClass"
              >
                <section class="p-4 sm:p-5 min-h-0 flex flex-col">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <p class="text-[11px] uppercase tracking-widest font-semibold" :class="mutedText">
                        Momentum timeline
                      </p>
                      <div class="flex flex-wrap items-center gap-3">
                        <h2 class="text-xl font-semibold leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">
                          Momentum
                        </h2>
                        <span
                          class="px-2 py-1 rounded-full border text-[11px] uppercase tracking-widest font-semibold"
                          :class="dividerClass"
                        >
                          {{ momentumMeta.trend }}
                        </span>
                      </div>
                      <p class="text-xs" :class="mutedText">{{ momentumMeta.status }}</p>
                    </div>
                    <div class="flex items-center gap-1 rounded-full border px-1 py-1" :class="dividerClass">
                      <button
                        class="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest transition"
                        :class="progressRange === 'week'
                          ? (isDark ? 'bg-indigo-500/30 text-indigo-100' : 'bg-indigo-100 text-indigo-700')
                          : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')"
                        @click="progressRange = 'week'"
                      >
                        Week
                      </button>
                      <button
                        class="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest transition"
                        :class="progressRange === 'month'
                          ? (isDark ? 'bg-indigo-500/30 text-indigo-100' : 'bg-indigo-100 text-indigo-700')
                          : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')"
                        @click="progressRange = 'month'"
                      >
                        Month
                      </button>
                      <button
                        class="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest transition"
                        :class="progressRange === 'year'
                          ? (isDark ? 'bg-indigo-500/30 text-indigo-100' : 'bg-indigo-100 text-indigo-700')
                          : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')"
                        @click="progressRange = 'year'"
                      >
                        Year
                      </button>
                    </div>
                  </div>
                  <div class="mt-3 flex-1 min-h-0">
                    <div v-if="momentumHasData" class="relative h-full">
                      <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="w-full h-full pointer-events-none">
                        <defs>
                          <linearGradient id="summary-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" :stop-color="isDark ? 'rgba(99,102,241,0.38)' : 'rgba(99,102,241,0.24)'" />
                            <stop offset="100%" :stop-color="isDark ? 'rgba(15,23,42,0)' : 'rgba(255,255,255,0)'" />
                          </linearGradient>
                          <linearGradient id="summary-area-soft" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" :stop-color="isDark ? 'rgba(14,165,233,0.2)' : 'rgba(56,189,248,0.14)'" />
                            <stop offset="100%" :stop-color="isDark ? 'rgba(15,23,42,0)' : 'rgba(255,255,255,0)'" />
                          </linearGradient>
                          <linearGradient id="summary-line" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" :stop-color="isDark ? '#a5b4fc' : '#6366f1'" />
                            <stop offset="100%" :stop-color="isDark ? '#38bdf8' : '#0ea5e9'" />
                          </linearGradient>
                        </defs>
                        <path v-if="momentumOverlaySeries.area" :d="momentumOverlaySeries.area" fill="url(#summary-area-soft)"></path>
                        <path v-if="momentumSeries.area" :d="momentumSeries.area" fill="url(#summary-area)"></path>
                        <path
                          v-if="momentumSeries.line"
                          :d="momentumSeries.line"
                          fill="none"
                          stroke="url(#summary-line)"
                          stroke-width="2.1"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                      </svg>
                      <div class="absolute inset-0 grid" :style="timelineGridStyle">
                        <div v-for="item in momentumSeries.items" :key="item.key || item.label" class="group relative">
                          <div
                            class="absolute left-1/2 top-3 -translate-x-1/2 rounded-md border px-2 py-1 text-[11px] opacity-0 transition group-hover:opacity-100"
                            :class="isDark ? 'bg-slate-900/90 text-white border-slate-700' : 'bg-white/90 text-slate-800 border-slate-200'"
                          >
                            <span class="text-sm font-semibold">{{ item.count }}</span>
                            <span class="ml-1 uppercase tracking-widest" :class="mutedText">{{ item.label }}</span>
                          </div>
                          <span
                            class="absolute bottom-6 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full opacity-0 transition group-hover:opacity-100"
                            :class="isDark ? 'bg-indigo-300' : 'bg-indigo-600'"
                          ></span>
                        </div>
                      </div>
                      <div class="absolute bottom-0 left-0 right-0 flex items-center justify-between text-[11px] uppercase tracking-widest" :class="mutedText">
                        <span v-for="item in momentumSeries.items" :key="item.key || item.label">
                          {{ item.label }}
                        </span>
                      </div>
                    </div>
                    <div v-else class="h-full grid place-items-center text-xs" :class="mutedText">No recent activity yet.</div>
                  </div>
                </section>

                <section class="p-4 sm:p-5 min-h-0 flex flex-col">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <p class="text-[11px] uppercase tracking-widest font-semibold" :class="mutedText">
                        Status breakdown
                      </p>
                      <h3 class="text-lg font-semibold leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">Stages</h3>
                    </div>
                    <span class="text-[11px] uppercase tracking-widest font-semibold" :class="mutedText">
                      {{ statusMeta }}
                    </span>
                  </div>
                  <div class="mt-3 flex-1 min-h-0">
                    <div v-if="statusRings.length" class="grid grid-cols-[1fr,1fr] items-center gap-4 h-full">
                      <div class="flex items-center justify-center">
                        <div class="relative">
                          <svg viewBox="0 0 42 42" class="h-28 w-28">
                            <circle
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke-width="6"
                              :class="isDark ? 'stroke-slate-800' : 'stroke-slate-200'"
                            ></circle>
                            <circle
                              v-for="segment in statusRings"
                              :key="segment.label"
                              cx="21"
                              cy="21"
                              r="15.915"
                              fill="transparent"
                              stroke-width="6"
                              stroke-linecap="round"
                              :stroke-dasharray="segment.dasharray"
                              :stroke-dashoffset="segment.offset"
                              class="stroke-current"
                              :class="segment.toneClass"
                            ></circle>
                          </svg>
                          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <p class="text-lg font-semibold leading-none" :class="isDark ? 'text-white' : 'text-slate-900'">
                              {{ statusHighlight.percent }}%
                            </p>
                            <p class="text-[11px] uppercase tracking-widest" :class="mutedText">
                              {{ statusHighlight.label }}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <div v-for="segment in statusSegments.slice(0, 4)" :key="segment.label" class="flex items-center justify-between gap-2">
                          <div class="flex items-center gap-2 min-w-0">
                            <span class="h-2.5 w-2.5 rounded-full bg-current" :class="segment.toneClass"></span>
                            <span class="truncate text-xs font-medium" :class="isDark ? 'text-slate-100' : 'text-slate-800'">
                              {{ segment.label }}
                            </span>
                          </div>
                          <span class="text-[11px] font-semibold" :class="mutedText">{{ segment.percentLabel }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-else class="h-full grid place-items-center text-xs" :class="mutedText">No status data yet.</div>
                  </div>
                </section>
              </div>

              <div
                class="grid grid-cols-1 md:grid-cols-[1.2fr,1fr] min-h-0 border-t divide-y md:divide-y-0 md:divide-x"
                :class="[dividerClass, divideClass]"
              >
                <section class="p-4 sm:p-5 min-h-0 flex flex-col">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <p class="text-[11px] uppercase tracking-widest font-semibold" :class="mutedText">
                        Activity feed
                      </p>
                      <h3 class="text-lg font-semibold leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">Recent activity</h3>
                    </div>
                    <span class="text-[11px] uppercase tracking-widest font-semibold" :class="mutedText">
                      {{ activityFeed.length ? `${activityFeed.length} updates` : 'Quiet' }}
                    </span>
                  </div>
                  <div class="mt-3 flex-1 min-h-0">
                    <div v-if="activityFeed.length" class="space-y-2">
                      <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,0.4fr)] text-[11px] uppercase tracking-widest" :class="mutedText">
                        <span>Event</span>
                        <span class="text-right">When</span>
                      </div>
                      <div class="divide-y" :class="divideClass">
                        <div
                          v-for="item in activityFeed.slice(0, 4)"
                          :key="item.id"
                          class="grid grid-cols-[minmax(0,1fr)_minmax(0,0.4fr)] items-center gap-3 py-2"
                        >
                          <div class="min-w-0 flex items-center gap-2">
                            <span class="h-2 w-2 rounded-full" :class="item.toneClass"></span>
                            <div class="min-w-0">
                              <p class="text-sm font-medium truncate" :class="isDark ? 'text-slate-100' : 'text-slate-900'">
                                {{ item.title }}
                              </p>
                              <p class="text-[11px] uppercase tracking-widest" :class="mutedText">{{ item.type }}</p>
                            </div>
                          </div>
                          <div class="text-xs text-right" :class="mutedText">{{ item.date }}</div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="h-full grid place-items-center text-xs" :class="mutedText">No activity yet.</div>
                  </div>
                </section>

                <section class="p-4 sm:p-5 min-h-0 flex flex-col">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <p class="text-[11px] uppercase tracking-widest font-semibold" :class="mutedText">
                        Column flow
                      </p>
                      <h3 class="text-lg font-semibold leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">Bottlenecks</h3>
                    </div>
                    <span class="text-[11px] uppercase tracking-widest font-semibold" :class="mutedText">
                      {{ flowInsight }}
                    </span>
                  </div>
                  <div class="mt-3 flex-1 min-h-0">
                    <div v-if="flowHasData" class="h-32 sm:h-36 flex items-end gap-2">
                      <div v-for="col in flowColumns" :key="col.key" class="flex-1 flex flex-col items-center gap-2 min-w-[24px]">
                        <div class="w-full h-full flex items-end">
                          <div
                            class="w-full rounded-md transition-all duration-300 opacity-90 hover:opacity-100"
                            :class="col.isPeak
                              ? 'bg-gradient-to-t from-amber-400/80 to-rose-400/80'
                              : 'bg-gradient-to-t from-indigo-400/70 to-sky-400/70'"
                            :style="{ height: `${col.height}%` }"
                            :title="`${col.label}: ${col.count}`"
                          ></div>
                        </div>
                        <span class="text-[11px] uppercase tracking-widest truncate" :class="mutedText">{{ col.label }}</span>
                      </div>
                    </div>
                    <div v-else class="h-full grid place-items-center text-xs" :class="mutedText">No tasks yet.</div>
                  </div>
                </section>
              </div>

              <div
                class="grid grid-cols-1 md:grid-cols-[1.1fr,1fr] min-h-0 border-t divide-y md:divide-y-0 md:divide-x"
                :class="[dividerClass, divideClass]"
              >
                <section class="p-4 sm:p-5 min-h-0 flex flex-col">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <p class="text-[11px] uppercase tracking-widest font-semibold" :class="mutedText">
                        Quick ratios
                      </p>
                      <h3 class="text-lg font-semibold leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">Ratios</h3>
                    </div>
                  </div>
                  <div class="mt-3 grid grid-cols-2 gap-4">
                    <div v-for="ring in metricRings" :key="ring.id" class="flex items-center gap-3">
                      <div class="relative h-12 w-12 shrink-0">
                        <svg viewBox="0 0 36 36" class="h-full w-full -rotate-90">
                          <path
                            class="text-slate-200 dark:text-slate-800"
                            stroke="currentColor"
                            stroke-width="3"
                            fill="none"
                            d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                          />
                          <path
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            fill="none"
                            :stroke-dasharray="ring.dasharray"
                            stroke-dashoffset="25"
                            class="stroke-current"
                            :class="ring.toneClass"
                            d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                          />
                        </svg>
                        <div class="absolute inset-0 grid place-items-center text-sm font-semibold leading-none" :class="isDark ? 'text-white' : 'text-slate-900'">
                          {{ ring.value }}%
                        </div>
                      </div>
                      <div class="space-y-1">
                        <p class="text-[11px] uppercase tracking-widest font-medium" :class="mutedText">{{ ring.label }}</p>
                        <p class="text-xs font-semibold" :class="isDark ? 'text-slate-100' : 'text-slate-900'">{{ ring.detail }}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section class="p-4 sm:p-5 min-h-0 flex flex-col">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-1">
                      <p class="text-[11px] uppercase tracking-widest font-semibold" :class="mutedText">
                        Trend indicator
                      </p>
                      <h3 class="text-lg font-semibold leading-tight" :class="isDark ? 'text-white' : 'text-slate-900'">Direction</h3>
                    </div>
                    <span class="text-[11px] uppercase tracking-widest font-semibold" :class="trendMeta.toneClass">
                      {{ trendMeta.label }}
                    </span>
                  </div>
                  <div class="mt-3 flex-1 min-h-0">
                    <div v-if="trendHasData" class="relative h-full">
                      <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="w-full h-full">
                        <defs>
                          <linearGradient id="trend-line" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" :stop-color="isDark ? '#38bdf8' : '#0ea5e9'" />
                            <stop offset="100%" :stop-color="isDark ? '#a5b4fc' : '#6366f1'" />
                          </linearGradient>
                        </defs>
                        <path
                          v-if="trendSeries.line"
                          :d="trendSeries.line"
                          fill="none"
                          stroke="url(#trend-line)"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                        <circle
                          v-if="trendEndPoint"
                          :cx="trendEndPoint.x"
                          :cy="trendEndPoint.y"
                          r="2"
                          :class="isDark ? 'fill-indigo-200' : 'fill-indigo-600'"
                        ></circle>
                      </svg>
                    </div>
                    <div v-else class="h-full grid place-items-center text-xs" :class="mutedText">No trend yet.</div>
                  </div>
                </section>
              </div>
            </div>
          </div>
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

const formatActivityMeta = (message = "", fallbackType = "") => {
  const raw = String(message || "").trim();
  const normalized = raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const title = normalized
    ? normalized.replace(/\b\w/g, (char) => char.toUpperCase())
    : "Activity";

  const key = raw.toLowerCase();
  let type = fallbackType || "Update";
  let toneClass = "bg-slate-400";

  if (key.includes("create") || key.includes("add") || key.includes("new")) {
    type = "Created";
    toneClass = "bg-emerald-400";
  } else if (key.includes("move")) {
    type = "Moved";
    toneClass = "bg-indigo-400";
  } else if (key.includes("comment")) {
    type = "Comment";
    toneClass = "bg-amber-400";
  } else if (key.includes("delete") || key.includes("remove")) {
    type = "Removed";
    toneClass = "bg-rose-400";
  } else if (key.includes("assign")) {
    type = "Assigned";
    toneClass = "bg-violet-400";
  } else if (key.includes("update") || key.includes("edit") || key.includes("change")) {
    type = "Updated";
    toneClass = "bg-sky-400";
  }

  return { title, type, toneClass };
};

const buildSeries = (items = []) => {
  const width = 100;
  const height = 40;
  if (!items.length) {
    return { items: [], points: [], line: "", area: "", width, height };
  }
  const max = Math.max(1, ...items.map((item) => item.count || 0));
  const step = items.length > 1 ? width / (items.length - 1) : width;
  const points = items.map((item, index) => {
    const value = item.count || 0;
    const x = Number((index * step).toFixed(2));
    const y = Number((height - (value / max) * height).toFixed(2));
    return {
      key: item.key || item.label || `point-${index}`,
      label: item.label,
      value,
      x,
      y,
    };
  });
  const line = points.map((point, idx) => `${idx === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  return { items, points, line, area, width, height, max };
};

const progressBars = computed(() => {
  const tasks = allTasks.value || [];
  const activityItems = Array.isArray(boardActivity.value) ? boardActivity.value : [];
  const useAudit = activityItems.length > 0;
  const now = new Date();

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const toDate = (raw) => {
    if (!raw) return null;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  };

  const activityDates = (useAudit ? activityItems : tasks)
    .map((entry) => {
      const rawDate = useAudit ? entry?.createdAt : entry?.updatedAt || entry?.createdAt;
      return toDate(rawDate);
    })
    .filter(Boolean);

  if (progressRange.value === "year") {
    const months = Array.from({ length: 12 }, (_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + idx, 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth() + 1}`,
        label: date.toLocaleDateString(undefined, { month: "short" }).slice(0, 3),
        month: date.getMonth(),
        year: date.getFullYear(),
        count: 0,
      };
    });

    for (const date of activityDates) {
      for (const bucket of months) {
        if (date.getFullYear() === bucket.year && date.getMonth() === bucket.month) {
          bucket.count += 1;
          break;
        }
      }
    }

    const max = Math.max(1, ...months.map((b) => b.count));
    return months.map((b) => ({
      key: b.key,
      label: b.label,
      pct: Math.max(8, Math.round((b.count / max) * 100)),
      count: b.count,
    }));
  }

  if (progressRange.value === "month") {
    const end = startOfDay(new Date(now));
    end.setDate(end.getDate() + 1);
    const buckets = Array.from({ length: 4 }, (_, idx) => {
      const start = new Date(end);
      start.setDate(end.getDate() - (4 - idx) * 7);
      const bucketEnd = new Date(start);
      bucketEnd.setDate(start.getDate() + 7);
      return { label: `W${idx + 1}`, start, end: bucketEnd, count: 0 };
    });

    for (const date of activityDates) {
      for (const bucket of buckets) {
        if (date >= bucket.start && date < bucket.end) {
          bucket.count += 1;
          break;
        }
      }
    }

    const max = Math.max(1, ...buckets.map((b) => b.count));
    return buckets.map((b) => ({
      key: b.label,
      label: b.label,
      pct: Math.max(8, Math.round((b.count / max) * 100)),
      count: b.count,
    }));
  }

  const start = startOfDay(new Date(now));
  start.setDate(start.getDate() - 6);

  const counts = Array.from({ length: 7 }, (_, idx) => {
    const day = new Date(start);
    day.setDate(start.getDate() + idx);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const label = day.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
    const key = day.toISOString().slice(0, 10);

    const count = activityDates.filter((date) => date >= day && date < next).length;

    return { label, key, count };
  });

  const max = Math.max(1, ...counts.map((c) => c.count));
  return counts.map((c) => ({
    key: c.key,
    label: c.label,
    pct: Math.max(8, Math.round((c.count / max) * 100)),
    count: c.count,
  }));
});

const progressRangeLabel = computed(() => {
  if (progressRange.value === "year") return "Last 12 months";
  if (progressRange.value === "month") return "Last 4 weeks";
  return "Last 7 days";
});

const momentumSeries = computed(() => buildSeries(progressBars.value || []));

const momentumOverlaySeries = computed(() => {
  const base = progressBars.value || [];
  const items = base.map((item, index, arr) => {
    const prev = arr[index - 1]?.count ?? item.count ?? 0;
    const next = arr[index + 1]?.count ?? item.count ?? 0;
    const blended = Math.round((prev + item.count * 2 + next) / 4);
    return { ...item, count: blended };
  });
  return buildSeries(items);
});

const timelineGridStyle = computed(() => {
  const count = Math.max(1, momentumSeries.value.items.length || 0);
  return {
    gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
  };
});

const momentumHasData = computed(() =>
  (progressBars.value || []).some((item) => item.count > 0)
);

const momentumMeta = computed(() => {
  const items = progressBars.value || [];
  const emptyState = {
    trend: "Quiet",
    status: "Paused",
    highlights: [
      { label: "Peak window", text: "Awaiting activity", tone: "sky" },
      { label: "Cadence", text: "No signal yet", tone: "sky" },
      { label: "Momentum", text: "Add a task to begin", tone: "sky" },
    ],
    focus: "Start a new task to spark momentum.",
  };

  if (!items.length) {
    return emptyState;
  }

  const counts = items.map((item) => item.count || 0);
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (!total) {
    return emptyState;
  }

  const first = counts[0];
  const last = counts[counts.length - 1];
  const diff = last - first;

  let trend = "Steady";
  let status = "Stable";
  if (diff > 1) {
    trend = "Rising";
    status = "Accelerating";
  } else if (diff < -1) {
    trend = "Softening";
    status = "Cooling";
  }

  const peak = items.reduce((best, item) => (item.count > best.count ? item : best), items[0]);
  const avg = counts.reduce((sum, c) => sum + c, 0) / counts.length;
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length;
  const volatility = avg ? Math.sqrt(variance) / avg : 0;

  let cadence = "Consistent";
  if (volatility > 0.7) {
    cadence = "Spiky";
  } else if (volatility > 0.35) {
    cadence = "Mixed";
  }

  const cadenceTone = cadence === "Consistent" ? "emerald" : cadence === "Mixed" ? "amber" : "amber";
  const trendTone = trend === "Rising" ? "emerald" : trend === "Softening" ? "amber" : "sky";
  const trendText =
    trend === "Rising"
      ? "Momentum is rising"
      : trend === "Softening"
        ? "Momentum is easing"
        : "Momentum is steady";
  const cadenceText =
    cadence === "Consistent"
      ? "Cadence feels consistent"
      : cadence === "Mixed"
        ? "Cadence is uneven"
        : "Cadence is spiky";
  const peakText = peak?.label ? `Peak on ${peak.label}` : "Peak window detected";
  const focus =
    trend === "Rising"
      ? "Protect focus blocks to sustain pace."
      : trend === "Softening"
        ? "Reignite a focus window to lift pace."
        : "Keep the rhythm with small wins.";

  return {
    trend,
    status,
    highlights: [
      { label: "Peak window", text: peakText, tone: "indigo" },
      { label: "Cadence", text: cadenceText, tone: cadenceTone },
      { label: "Momentum", text: trendText, tone: trendTone },
    ],
    focus,
  };
});


const flowColumns = computed(() => {
  const list = (columns.value || []).map((col, index) => ({
    key: col.id || col.title || col.name || `col-${index}`,
    label: col.title || col.name || "Column",
    count: col.tasks?.length || 0,
  }));

  const max = Math.max(1, ...list.map((col) => col.count));
  return list.map((col) => ({
    ...col,
    height: Math.max(12, Math.round((col.count / max) * 100)),
    isPeak: col.count === max && col.count > 0,
  }));
});

const flowHasData = computed(() =>
  flowColumns.value.some((col) => col.count > 0)
);

const flowInsight = computed(() => {
  const list = flowColumns.value;
  if (!list.length) return "Awaiting columns";
  const total = list.reduce((sum, col) => sum + col.count, 0);
  if (!total) return "No tasks yet";
  const peak = list.reduce((best, item) => (item.count > best.count ? item : best), list[0]);
  const share = total ? peak.count / total : 0;
  if (share > 0.55) return `Bottleneck forming in ${peak.label}`;
  if (share > 0.4) return `Watch ${peak.label}`;
  return "Flow looks balanced";
});

let isActive = true;

const statusSegments = computed(() => {
  const list = flowColumns.value.map((col) => ({
    label: col.label,
    count: col.count,
  }));
  const total = list.reduce((sum, col) => sum + col.count, 0);
  if (!list.length || !total) return [];
  const palette = [
    "text-indigo-500 dark:text-indigo-400",
    "text-sky-500 dark:text-sky-400",
    "text-emerald-500 dark:text-emerald-400",
    "text-amber-500 dark:text-amber-400",
    "text-rose-500 dark:text-rose-400",
    "text-violet-500 dark:text-violet-400",
    "text-slate-500 dark:text-slate-400",
  ];
  let accumulated = 0;
  return list.map((col, index) => {
    const raw = total ? (col.count / total) * 100 : 0;
    let percent = Number(raw.toFixed(1));
    if (index === list.length - 1) {
      percent = Math.max(0, 100 - accumulated);
    } else {
      percent = Math.max(0, Math.min(percent, 100 - accumulated));
    }
    accumulated += percent;
    return {
      label: col.label,
      percent,
      percentLabel: `${Math.round(percent)}%`,
      toneClass: palette[index % palette.length],
    };
  });
});

const statusRings = computed(() => {
  const segments = statusSegments.value || [];
  let cumulative = 0;
  return segments.map((segment) => {
    const ring = {
      ...segment,
      dasharray: `${segment.percent} ${100 - segment.percent}`,
      offset: 25 - cumulative,
    };
    cumulative += segment.percent;
    return ring;
  });
});

const statusMeta = computed(() => {
  const segments = statusSegments.value || [];
  if (!segments.length) return "No status data yet";
  const max = Math.max(...segments.map((segment) => segment.percent));
  if (max > 55) return "Skewed toward one stage";
  if (max > 40) return "Weighted mix";
  return "Evenly spread";
});

const statusHighlight = computed(() => {
  const segments = statusSegments.value || [];
  if (!segments.length) {
    return { label: "No data", percent: 0 };
  }
  const top = segments.reduce((best, segment) =>
    segment.percent > best.percent ? segment : best
  , segments[0]);
  return {
    label: top.label,
    percent: Math.round(top.percent),
  };
});

const focusSeries = computed(() => {
  const tasks = allTasks.value || [];
  const email = user.value?.email?.toLowerCase?.();
  const focusTasks = email
    ? tasks.filter((t) => (t.assignee || "").toLowerCase() === email)
    : [];
  const now = new Date();

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startOfWeek = (d) => {
    const date = startOfDay(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return startOfDay(new Date(date.setDate(diff)));
  };

  if (progressRange.value === "year") {
    const months = Array.from({ length: 12 }, (_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + idx, 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth() + 1}`,
        label: date.toLocaleDateString(undefined, { month: "short" }).slice(0, 3),
        month: date.getMonth(),
        year: date.getFullYear(),
        count: 0,
      };
    });

    for (const t of focusTasks) {
      const created = t.createdAt ? new Date(t.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) continue;
      for (const bucket of months) {
        if (created.getFullYear() === bucket.year && created.getMonth() === bucket.month) {
          bucket.count += 1;
          break;
        }
      }
    }

    const results = months.map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      count: bucket.count,
    }));

    return buildSeries(results);
  }

  if (progressRange.value === "month") {
    const buckets = Array.from({ length: 4 }, (_, i) => {
      const end = startOfWeek(new Date(now));
      end.setDate(end.getDate() - i * 7);
      const start = startOfWeek(new Date(end));
      start.setDate(start.getDate() - 7);
      return { label: `W${4 - i}`, start, end, count: 0 };
    });

    for (const t of focusTasks) {
      const created = t.createdAt ? new Date(t.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) continue;
      for (const bucket of buckets) {
        if (created > bucket.start && created <= bucket.end) {
          bucket.count += 1;
          break;
        }
      }
    }

    const results = buckets.reverse().map((bucket) => ({
      key: bucket.label,
      label: bucket.label,
      count: bucket.count,
    }));

    return buildSeries(results);
  }

  const start = new Date(now);
  start.setDate(now.getDate() - 6);

  const counts = Array.from({ length: 7 }, (_, idx) => {
    const day = new Date(start);
    day.setDate(start.getDate() + idx);
    const label = day.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
    const key = day.toISOString().slice(0, 10);

    const count = focusTasks.filter((t) => {
      const created = t.createdAt ? new Date(t.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) return false;
      return created.toDateString() === day.toDateString();
    }).length;

    return { label, key, count };
  });

  return buildSeries(counts);
});

const focusHasData = computed(() =>
  (focusSeries.value.items || []).some((item) => item.count > 0)
);
const focusMeta = computed(() => {
  const total = totalTasksCount.value || 0;
  if (!total) {
    return { label: "No focus data yet", tone: "slate" };
  }
  const share = focusTasksCount.value / total;
  if (share > 0.6) {
    return { label: "High alignment", tone: "emerald" };
  }
  if (share > 0.35) {
    return { label: "Balanced alignment", tone: "amber" };
  }
  if (share > 0) {
    return { label: "Low alignment", tone: "rose" };
  }
  return { label: "No focus tasks yet", tone: "slate" };
});

const metricRings = computed(() => {
  const total = totalTasksCount.value || 0;
  const focusShare = total ? Math.round((focusTasksCount.value / total) * 100) : 0;
  const rings = [
    {
      id: "completion",
      label: "Completion",
      value: taskProgressPercent.value,
      detail: "Done",
      toneClass: "text-indigo-500 dark:text-indigo-400",
    },
    {
      id: "focus",
      label: "Focus",
      value: focusShare,
      detail: "Assigned",
      toneClass: "text-emerald-500 dark:text-emerald-400",
    },
    {
      id: "workspaces",
      label: "Workspaces",
      value: workspacePercent.value,
      detail: "Capacity",
      toneClass: "text-sky-500 dark:text-sky-400",
    },
    {
      id: "members",
      label: "Members",
      value: memberPercent.value,
      detail: "Coverage",
      toneClass: "text-amber-500 dark:text-amber-400",
    },
  ];

  return rings.map((ring) => {
    const value = Math.max(0, Math.min(100, Number(ring.value) || 0));
    return {
      ...ring,
      value,
      dasharray: `${value} 100`,
    };
  });
});

const trendSeries = computed(() => {
  const items = progressBars.value || [];
  let total = 0;
  const cumulative = items.map((item) => {
    total += item.count || 0;
    return { ...item, count: total };
  });
  return buildSeries(cumulative);
});

const trendHasData = computed(() =>
  (trendSeries.value.items || []).some((item) => item.count > 0)
);

const trendMeta = computed(() => {
  const items = progressBars.value || [];
  const total = items.reduce((sum, item) => sum + (item.count || 0), 0);
  if (!total) {
    return { label: "No data", toneClass: "text-slate-500 dark:text-slate-400" };
  }
  const first = items[0]?.count || 0;
  const last = items[items.length - 1]?.count || 0;
  const diff = last - first;
  if (diff > 0) {
    return { label: `Up ${diff}`, toneClass: "text-emerald-500 dark:text-emerald-400" };
  }
  if (diff < 0) {
    return { label: `Down ${Math.abs(diff)}`, toneClass: "text-rose-500 dark:text-rose-400" };
  }
  return { label: "Flat", toneClass: "text-slate-500 dark:text-slate-400" };
});

const trendEndPoint = computed(() => {
  const points = trendSeries.value.points || [];
  return points.length ? points[points.length - 1] : null;
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
  const list = Array.isArray(boardActivity.value) ? boardActivity.value : [];
  const fallback = allTasks.value || [];
  const source = list.length
    ? list.map((entry) => ({
        id: entry.id || entry._id || entry.message,
        message: entry.message || entry.action || entry.details || "Activity",
        createdAt: entry.createdAt,
      }))
    : fallback.map((task) => ({
        id: task.id || task._id || task.title,
        message: task.title || "Task created",
        createdAt: task.updatedAt || task.createdAt,
        fallbackType: "Created",
      }));

  return source
    .filter((entry) => entry && entry.message && String(entry.message).trim())
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6)
    .map((entry) => {
      const meta = formatActivityMeta(entry.message, entry.fallbackType);
      return {
        id: entry.id || meta.title,
        title: meta.title,
        type: meta.type,
        toneClass: meta.toneClass,
        date: formatRelativeTime(entry.createdAt),
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

const canvasSurface = computed(() =>
  isDark.value
    ? "bg-slate-950/60 border-slate-800/80"
    : "bg-white/70 border-slate-200"
);

const dividerClass = computed(() =>
  isDark.value ? "border-slate-800/70" : "border-slate-200/70"
);

const divideClass = computed(() =>
  isDark.value ? "divide-slate-800/70" : "divide-slate-200/70"
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

const teamInsights = computed(() => {
  const progress = taskProgressPercent.value || 0;
  let health = {
    id: "health",
    label: "Team health",
    signal: "OK",
    state: "Strong",
    value: "Momentum strong",
    detail: "Delivery cadence looks steady.",
    tone: "emerald",
  };

  if (progress < 40) {
    health = {
      id: "health",
      label: "Team health",
      signal: "RISK",
      state: "At risk",
      value: "Momentum needs lift",
      detail: "Completion pace is falling behind.",
      tone: "rose",
    };
  } else if (progress < 70) {
    health = {
      id: "health",
      label: "Team health",
      signal: "WARN",
      state: "Building",
      value: "Momentum building",
      detail: "Cadence is stabilizing.",
      tone: "amber",
    };
  }

  const members = totalMembersCount.value || 0;
  const total = totalTasksCount.value || 0;
  const perMember = members ? total / members : total;
  let load = {
    id: "load",
    label: "Load level",
    signal: "OK",
    state: "Balanced",
    value: "Workload feels balanced",
    detail: "Capacity looks healthy.",
    tone: "emerald",
  };

  if (!members) {
    load = {
      id: "load",
      label: "Load level",
      signal: "WARN",
      state: "Forming",
      value: "Roster forming",
      detail: "Add teammates to unlock workload signals.",
      tone: "amber",
    };
  } else if (perMember > 8) {
    load = {
      id: "load",
      label: "Load level",
      signal: "RISK",
      state: "Heavy",
      value: "Workload is heavy",
      detail: "Consider rebalancing assignments.",
      tone: "rose",
    };
  } else if (perMember > 4) {
    load = {
      id: "load",
      label: "Load level",
      signal: "WARN",
      state: "Busy",
      value: "Workload trending busy",
      detail: "Keep an eye on focus windows.",
      tone: "amber",
    };
  }

  const flowList = flowColumns.value || [];
  const flowTotal = flowList.reduce((sum, col) => sum + col.count, 0);
  let bottleneck = {
    id: "bottleneck",
    label: "Bottleneck risk",
    signal: "OK",
    state: "Low",
    value: "Flow is balanced",
    detail: "Work is evenly distributed.",
    tone: "emerald",
  };

  if (!flowList.length || !flowTotal) {
    bottleneck = {
      id: "bottleneck",
      label: "Bottleneck risk",
      signal: "WARN",
      state: "Quiet",
      value: "Flow is quiet",
      detail: "Create tasks to surface pressure points.",
      tone: "amber",
    };
  } else {
    const peak = flowList.reduce((best, item) => (item.count > best.count ? item : best), flowList[0]);
    const share = flowTotal ? peak.count / flowTotal : 0;
    if (share > 0.55) {
      bottleneck = {
        id: "bottleneck",
        label: "Bottleneck risk",
        signal: "RISK",
        state: "High",
        value: "Bottleneck risk high",
        detail: `Pressure building in ${peak.label}.`,
        tone: "rose",
      };
    } else if (share > 0.4) {
      bottleneck = {
        id: "bottleneck",
        label: "Bottleneck risk",
        signal: "WARN",
        state: "Watch",
        value: "Bottleneck risk rising",
        detail: `Keep an eye on ${peak.label}.`,
        tone: "amber",
      };
    }
  }

  return [health, load, bottleneck];
});
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
  isActive = false;
  document.removeEventListener("click", handleOutsideClick);
  if (sessionTimer) clearInterval(sessionTimer);
});

watch(
  () => selectedWorkspaceId.value,
  async (workspaceId) => {
    if (!workspaceId) return;

    try {
      await boardStore.loadBoards(workspaceId);
      if (!isActive) return;

      const firstBoard = boardStore.boards?.[0];
      if (firstBoard?.id) {
        await boardStore.loadBoard(workspaceId, firstBoard.id);
      }
    } catch (err) {
      console.warn("Dashboard board load error:", err?.message || err);
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


