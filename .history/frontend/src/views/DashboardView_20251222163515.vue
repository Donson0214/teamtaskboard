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
                <div class="w-full sm:w-auto rounded-xl border px-4 py-3 flex flex-col gap-2 min-w-[220px]" :class="surfaceCard">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-[11px] uppercase tracking-[0.12em]" :class="mutedText">Board overview</p>
                    <div class="relative min-w-[140px]">
                      <select
                        v-model="selectedBoardId"
                        class="w-full appearance-none rounded-lg border px-2.5 py-1 text-[11px] font-semibold pr-6"
                        :class="isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-600'"
                        aria-label="Select board"
                        :disabled="!boardOptions.length"
                      >
                        <option v-if="!boardOptions.length" disabled value="">No boards</option>
                        <option v-for="board in boardOptions" :key="board.id" :value="board.id">
                          {{ board.name }}
                        </option>
                      </select>
                      <i
                        class="fas fa-chevron-down pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px]"
                        :class="mutedText"
                      ></i>
                    </div>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <div class="min-w-0">
                      <p class="text-sm font-semibold truncate" :class="isDark ? 'text-white' : 'text-slate-900'">{{ boardSummary.name }}</p>
                      <p v-if="boardSummary.description" class="text-xs truncate" :class="mutedText">{{ boardSummary.description }}</p>
                    </div>
                    <div class="text-right text-xs" :class="mutedText">
                      <span class="font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ boardSummary.columns }}</span>
                      <span> columns</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-[11px]" :class="mutedText">
                    <span>
                      <span class="font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ boardSummary.tasks }}</span>
                      <span> tasks</span>
                    </span>
                    <span>{{ boardSummary.lastActivity }}</span>
                  </div>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div
                  v-for="stat in headlineStats"
                  :key="stat.label"
                  class="rounded-xl border p-3 sm:p-4 flex items-center justify-between"
                  :class="surfaceCard"
                >
                  <div class="min-w-0">
                    <p class="text-[11px] uppercase tracking-[0.12em]" :class="mutedText">{{ stat.label }}</p>
                    <div class="mt-2 flex items-baseline gap-2">
                      <span class="text-2xl font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ stat.value }}</span>
                      <span v-if="stat.suffix" class="text-sm" :class="mutedText">{{ stat.suffix }}</span>
                    </div>
                    <p v-if="stat.helper" class="text-[10px] mt-1 truncate" :class="mutedText">
                      {{ stat.helper }}
                    </p>
                  </div>
                  <div v-if="stat.type === 'focus'" class="relative w-12 h-12">
                    <svg viewBox="0 0 100 100" class="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        :stroke="isDark ? '#334155' : '#e2e8f0'"
                        stroke-width="4"
                        fill="none"
                      />
                      <g>
                        <line
                          v-for="tick in focusClockTicks"
                          :key="`tick-${tick}`"
                          :transform="`rotate(${tick} 50 50)`"
                          x1="50"
                          y1="6"
                          x2="50"
                          y2="12"
                          :stroke="isDark ? '#475569' : '#cbd5f5'"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                      </g>
                      <line
                        :transform="`rotate(${focusClockAngles.hour} 50 50)`"
                        x1="50"
                        y1="50"
                        x2="50"
                        y2="28"
                        :stroke="isDark ? '#e2e8f0' : '#0f172a'"
                        stroke-width="3"
                        stroke-linecap="round"
                      />
                      <line
                        :transform="`rotate(${focusClockAngles.minute} 50 50)`"
                        x1="50"
                        y1="50"
                        x2="50"
                        y2="20"
                        :stroke="isDark ? '#cbd5f5' : '#334155'"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                      <line
                        :transform="`rotate(${focusClockAngles.second} 50 50)`"
                        x1="50"
                        y1="54"
                        x2="50"
                        y2="16"
                        :stroke="isDark ? '#818cf8' : '#6366f1'"
                        stroke-width="1.5"
                        stroke-linecap="round"
                      />
                      <circle cx="50" cy="50" r="3" :fill="isDark ? '#e2e8f0' : '#0f172a'" />
                    </svg>
                  </div>
                  <span v-else class="w-10 h-10 rounded-xl grid place-items-center text-base" :class="stat.badge">
                    <i :class="stat.icon"></i>
                  </span>
                </div>
              </div>

              <div class="grid gap-4 lg:grid-cols-2 items-stretch">
                <div class="rounded-xl border p-4 flex flex-col gap-4 max-h-56 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-xs uppercase tracking-[0.12em]" :class="mutedText">Task volume</p>
                      <p class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">Tasks created</p>
                    </div>
                    <div class="flex items-center gap-2 text-[11px]">
                      <button
                        class="px-2 py-1 rounded-lg border transition"
                        :class="progressRange === 'week'
                          ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-100 border-indigo-200 text-indigo-700')
                          : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600')"
                        @click="progressRange = 'week'"
                      >Week</button>
                      <button
                        class="px-2 py-1 rounded-lg border transition"
                        :class="progressRange === 'month'
                          ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-100 border-indigo-200 text-indigo-700')
                          : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600')"
                        @click="progressRange = 'month'"
                      >Month</button>
                      <button
                        class="px-2 py-1 rounded-lg border transition"
                        :class="progressRange === 'year'
                          ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-100 border-indigo-200 text-indigo-700')
                          : (isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600')"
                        @click="progressRange = 'year'"
                      >Year</button>
                    </div>
                  </div>
                  <div class="h-24 flex gap-2">
                    <div class="relative h-full w-10 text-[10px] leading-none" :class="mutedText">
                      <span
                        v-for="(tick, index) in taskVolumeTicks"
                        :key="`volume-tick-${tick}`"
                        class="absolute left-0 -translate-y-1/2 w-full flex items-center justify-between"
                        :style="{ top: `${(taskVolumeGridLines[index] / chartHeight) * 100}%` }"
                      >
                        <span class="tabular-nums">{{ tick }}</span>
                        <span class="h-px w-2 opacity-70" :class="isDark ? 'bg-slate-600' : 'bg-slate-300'"></span>
                      </span>
                    </div>
                    <div class="flex-1">
                      <div v-if="taskVolumeHasData" class="h-full relative">
                        <svg
                          :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
                          preserveAspectRatio="none"
                          class="absolute inset-0 w-full h-full pointer-events-none"
                          aria-hidden="true"
                        >
                          <g :stroke="isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.24)'" stroke-width="0.4">
                            <line
                              v-for="(y, idx) in taskVolumeGridLines"
                              :key="`volume-grid-${idx}`"
                              x1="0"
                              :y1="y"
                              x2="100"
                              :y2="y"
                            />
                          </g>
                        </svg>
                        <div
                          class="relative h-full flex flex-col justify-end"
                          :style="{ paddingTop: `${chartPadding}px`, paddingBottom: `${chartPadding}px` }"
                        >
                          <div class="grid items-end gap-2 h-full" :class="rangeGridClass">
                            <div v-for="bar in taskVolumeBars" :key="bar.key" class="flex items-end justify-center h-full">
                              <div
                                class="rounded-none transition bg-gradient-to-t from-indigo-200 to-indigo-500"
                                :class="[barWidthClass, isDark ? 'from-slate-700 to-indigo-400' : '']"
                                :style="{ height: `${bar.pct}%` }"
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else class="h-full grid place-items-center text-xs" :class="mutedText">No tasks created in range.</div>
                    </div>
                  </div>
                  <div v-if="taskVolumeHasData" class="grid gap-2" :class="rangeGridClass">
                    <span
                      v-for="label in taskVolumeLabels"
                      :key="`task-volume-${label.key}`"
                      class="text-[10px] uppercase tracking-wide text-center h-4 whitespace-nowrap"
                      :class="[mutedText, label.show ? '' : 'opacity-0']"
                    >
                      {{ label.label }}
                    </span>
                  </div>
                  <p class="text-[11px]" :class="mutedText">{{ taskVolumeTotal }} tasks created - {{ progressRangeLabel }}</p>
                </div>

                <div class="rounded-xl border p-4 flex flex-col gap-3 max-h-56 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-xs uppercase tracking-[0.12em]" :class="mutedText">Overall progress</p>
                      <p class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">Task Flow</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-semibold" :class="isDark ? 'text-emerald-200' : 'text-emerald-700'">{{ taskProgressPercent }}%</p>
                      <p class="text-[11px]" :class="mutedText">{{ completedInRange }} completed</p>
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-3 text-[11px]" :class="mutedText">
                    <div v-for="legend in statusLegend" :key="legend.key" class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: legend.color }"></span>
                      <span>{{ legend.label }}</span>
                      <span class="text-[10px] tabular-nums" :class="isDark ? 'text-slate-300' : 'text-slate-600'">
                        {{ legend.count }}
                      </span>
                    </div>
                  </div>
                  <div class="h-24 flex gap-2">
                    <div class="relative h-full w-10 text-[10px] leading-none" :class="mutedText">
                      <span
                        v-for="(tick, index) in progressTicks"
                        :key="`progress-tick-${tick}`"
                        class="absolute left-0 -translate-y-1/2 w-full flex items-center justify-between"
                        :style="{ top: `${(progressGridLines[index] / chartHeight) * 100}%` }"
                      >
                        <span class="tabular-nums">{{ tick }}</span>
                        <span class="h-px w-2 opacity-70" :class="isDark ? 'bg-slate-600' : 'bg-slate-300'"></span>
                      </span>
                    </div>
                    <div class="flex-1">
                      <div v-if="progressHasData" class="h-full">
                        <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" preserveAspectRatio="none" class="w-full h-full">
                          <g :stroke="isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.24)'" stroke-width="0.4">
                            <line
                              v-for="(y, idx) in progressGridLines"
                              :key="`progress-grid-${idx}`"
                              x1="0"
                              :y1="y"
                              x2="100"
                              :y2="y"
                            />
                          </g>
                          <path
                            v-if="statusSeries.done.line"
                            :d="statusSeries.done.line"
                            fill="none"
                            :stroke="statusLineColors.done"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                          <path
                            v-if="statusSeries.review.line"
                            :d="statusSeries.review.line"
                            fill="none"
                            :stroke="statusLineColors.review"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                          <path
                            v-if="statusSeries.todo.line"
                            :d="statusSeries.todo.line"
                            fill="none"
                            :stroke="statusLineColors.todo"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                        </svg>
                      </div>
                      <div v-else class="h-full grid place-items-center text-xs" :class="mutedText">No status activity in range.</div>
                    </div>
                  </div>
                  <div v-if="progressHasData" class="grid gap-0" :class="rangeGridClass">
                    <span
                      v-for="label in progressLabels"
                      :key="`progress-${label.key}`"
                      class="text-[10px] uppercase tracking-wide text-center h-4 whitespace-nowrap"
                      :class="[mutedText, label.show ? '' : 'opacity-0']"
                    >
                      {{ label.label }}
                    </span>
                  </div>
                  <p class="text-[11px]" :class="mutedText">Task status totals - {{ progressRangeLabel }}</p>
                </div>
              </div>

              <div class="grid gap-4 lg:grid-cols-2">
                <div class="rounded-xl border p-4 flex flex-col gap-3 max-h-56 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-xs uppercase tracking-[0.12em]" :class="mutedText">Recent tasks</p>
                      <p class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">Latest updates</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ recentTasks.length }}</p>
                      <p class="text-[11px]" :class="mutedText">tasks</p>
                    </div>
                  </div>
                  <div v-if="recentTasks.length" class="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scroll">
                    <div
                      v-for="task in recentTasks"
                      :key="task.key"
                      class="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                      :class="isDark ? 'bg-slate-900/70 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'"
                    >
                      <div class="min-w-0">
                        <p class="text-sm font-semibold truncate">{{ task.title }}</p>
                        <p class="text-[11px] uppercase tracking-widest" :class="mutedText">{{ task.activity }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-[11px] font-semibold whitespace-nowrap" :class="isDark ? 'text-white' : 'text-slate-800'">{{ task.when }}</p>
                        <p
                          class="text-[10px] uppercase tracking-widest"
                          :class="task.isDone ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : mutedText"
                        >
                          {{ task.status }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-xs" :class="mutedText">No recent tasks yet.</div>
                  <p class="text-[11px]" :class="mutedText">Sorted by latest activity timestamp.</p>
                </div>

                <div class="rounded-xl border p-4 flex flex-col gap-4 max-h-56 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-xs uppercase tracking-[0.12em]" :class="mutedText">Focus</p>
                      <p class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">Assigned to you</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ focusShare.percent }}%</p>
                      <p class="text-[11px]" :class="mutedText">{{ focusShare.assigned }} of {{ focusShare.total }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="relative h-24 w-24">
                      <svg viewBox="0 0 36 36" class="h-full w-full -rotate-90">
                        <path
                          :class="isDark ? 'text-slate-700' : 'text-indigo-200'"
                          stroke="currentColor"
                          stroke-width="4"
                          fill="none"
                          d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                        />
                        <path
                          :class="isDark ? 'text-indigo-400' : 'text-indigo-500'"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-width="4"
                          fill="none"
                          :stroke-dasharray="`${focusShare.percent}, 100`"
                          d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                        />
                      </svg>
                      <div class="absolute inset-0 grid place-items-center text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">
                        {{ focusShare.percent }}%
                      </div>
                    </div>
                    <div class="space-y-2">
                      <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ focusShare.assigned }} tasks assigned</p>
                      <p class="text-xs" :class="mutedText">Share of total tasks currently assigned to you.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
                <div class="rounded-xl border p-4 flex flex-col gap-3 max-h-56 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-xs uppercase tracking-[0.12em]" :class="mutedText">Collaboration</p>
                      <p class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">Shared workspaces</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ collaborationCount }}</p>
                      <p class="text-[11px]" :class="mutedText">of {{ totalWorkspaces }}</p>
                    </div>
                  </div>
                  <div v-if="collaborationList.length" class="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scroll">
                    <div
                      v-for="space in collaborationList"
                      :key="space.id"
                      class="flex items-center justify-between rounded-lg border px-3 py-2"
                      :class="isDark ? 'bg-slate-900/70 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'"
                    >
                      <div class="min-w-0">
                        <p class="text-sm font-semibold truncate">{{ space.name }}</p>
                        <p class="text-[11px] uppercase tracking-widest" :class="mutedText">{{ space.role }}</p>
                      </div>
                      <div class="text-right text-xs" :class="mutedText">
                        <span class="font-semibold" :class="isDark ? 'text-white' : 'text-slate-800'">{{ space.members }}</span>
                        <span> members</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-xs" :class="mutedText">No collaboration spaces yet.</div>
                  <p class="text-[11px]" :class="mutedText">Roles reflect your access level across workspaces.</p>
                </div>

                <div class="rounded-xl border p-4 flex flex-col gap-4 max-h-56 overflow-hidden" :class="surfaceCard">
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="text-xs uppercase tracking-[0.12em]" :class="mutedText">Team activity</p>
                      <p class="text-lg font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">Activity trend</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">{{ activityTotal }}</p>
                      <p class="text-[11px]" :class="mutedText">events</p>
                    </div>
                  </div>
                  <div class="h-24 flex gap-2">
                    <div class="relative h-full w-10 text-[10px] leading-none" :class="mutedText">
                      <span
                        v-for="(tick, index) in activityTicks"
                        :key="`activity-tick-${tick}`"
                        class="absolute left-0 -translate-y-1/2 w-full flex items-center justify-between"
                        :style="{ top: `${(activityGridLines[index] / chartHeight) * 100}%` }"
                      >
                        <span class="tabular-nums">{{ tick }}</span>
                        <span class="h-px w-2 opacity-70" :class="isDark ? 'bg-slate-600' : 'bg-slate-300'"></span>
                      </span>
                    </div>
                    <div class="flex-1">
                      <div v-if="activityHasData" class="h-full">
                        <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" preserveAspectRatio="none" class="w-full h-full">
                          <defs>
                            <linearGradient id="activity-area" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" :stop-color="isDark ? 'rgba(14,165,233,0.28)' : 'rgba(56,189,248,0.16)'" />
                              <stop offset="100%" :stop-color="isDark ? 'rgba(15,23,42,0)' : 'rgba(255,255,255,0)'" />
                            </linearGradient>
                            <linearGradient id="activity-line" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" :stop-color="isDark ? '#38bdf8' : '#0ea5e9'" />
                              <stop offset="100%" :stop-color="isDark ? '#a5b4fc' : '#6366f1'" />
                            </linearGradient>
                          </defs>
                          <g :stroke="isDark ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.24)'" stroke-width="0.4">
                            <line
                              v-for="(y, idx) in activityGridLines"
                              :key="`activity-grid-${idx}`"
                              x1="0"
                              :y1="y"
                              x2="100"
                              :y2="y"
                            />
                          </g>
                          <path v-if="activitySeries.area" :d="activitySeries.area" fill="url(#activity-area)"></path>
                          <path
                            v-if="activitySeries.line"
                            :d="activitySeries.line"
                            fill="none"
                            stroke="url(#activity-line)"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></path>
                        </svg>
                      </div>
                      <div v-else class="h-full grid place-items-center text-xs" :class="mutedText">No activity yet.</div>
                    </div>
                  </div>
                  <div v-if="activityHasData" class="grid grid-cols-7 gap-0">
                    <span
                      v-for="label in activityLabels"
                      :key="`activity-${label.key}`"
                      class="text-[10px] uppercase tracking-wide text-center h-4 whitespace-nowrap"
                      :class="[mutedText, label.show ? '' : 'opacity-0']"
                    >
                      {{ label.label }}
                    </span>
                  </div>
                  <p class="text-[11px]" :class="mutedText">Last 7 days of task updates and workspace activity.</p>
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
const workspaceFilter = computed(() => {
  if (activeNav.value === "owned") return "owned";
  if (activeNav.value === "shared") return "shared";
  return activeFilter.value;
});
const notificationBellRef = ref(null);
const profileRef = ref(null);
const progressRange = ref("week");
const selectedBoardId = ref("");
const chartWidth = 100;
const chartHeight = 96;
const chartPadding = 6;

const toChartY = (value, scaleMax = 1) => {
  const max = Math.max(1, scaleMax || 1);
  const clamped = Math.min(max, Math.max(0, value || 0));
  const plotHeight = chartHeight - chartPadding * 2;
  return Number((chartPadding + ((max - clamped) / max) * plotHeight).toFixed(2));
};

const getAxisScale = (maxValue) => {
  const value = Math.max(1, maxValue || 0);
  if (value <= 5) return { max: 5, ticks: [5, 4, 3, 2, 1] };
  if (value <= 10) return { max: 10, ticks: [10, 8, 6, 4, 2] };
  if (value <= 20) return { max: 20, ticks: [20, 15, 10, 5] };
  if (value <= 50) return { max: 50, ticks: [50, 40, 30, 20, 10] };

  const step = value <= 100 ? 20 : value <= 250 ? 50 : value <= 500 ? 100 : 200;
  const max = Math.ceil(value / step) * step;
  const ticks = [max, max - step, max - step * 2, max - step * 3, max - step * 4].filter(
    (tick) => tick > 0
  );
  return { max, ticks };
};

const getMaxCount = (items = []) =>
  Math.max(1, ...items.map((item) => item?.count || 0));

const fixedAxisScale = (maxValue, fixedMax, fixedTicks) => {
  if (maxValue <= fixedMax) {
    return { max: fixedMax, ticks: fixedTicks };
  }
  return getAxisScale(maxValue);
};

const sidebarNav = [
  { id: "dashboard", icon: "fa-gauge-high", style: "fas", label: "Dashboard" },
  { id: "home", icon: "fa-house", style: "fas", label: "Home" },
  { id: "boards", icon: "fa-clipboard", style: "fas", label: "Boards" },
  { id: "tasks", icon: "fa-tasks", style: "fas", label: "Tasks" },
  { id: "owned", icon: "fa-folder-open", style: "far", label: "My spaces" },
  { id: "shared", icon: "fa-handshake", style: "far", label: "Collabs" },
];

const focusSeconds = ref(0);
let focusTimer = null;
let lastFocusTick = Date.now();
let skipFocusPersist = false;
const focusGoalHours = 8;
const focusGoalSeconds = focusGoalHours * 3600;
const focusStorageKey = "taskflow-focus-seconds";
const focusLastTickKey = "taskflow-focus-last-tick";

const readStoredNumber = (key) => {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(key);
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  } catch (err) {
    return 0;
  }
};

const clearFocusTimeStorage = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(focusStorageKey);
    localStorage.removeItem(focusLastTickKey);
  } catch (err) {
    return;
  }
};

const persistFocusTime = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(focusStorageKey, String(Math.floor(focusSeconds.value)));
    localStorage.setItem(focusLastTickKey, String(Date.now()));
  } catch (err) {
    return;
  }
};

const hydrateFocusTime = () => {
  const storedSeconds = readStoredNumber(focusStorageKey);
  const lastTick = readStoredNumber(focusLastTickKey);
  let seconds = storedSeconds;
  if (lastTick) {
    const elapsed = Math.floor((Date.now() - lastTick) / 1000);
    if (elapsed > 0) {
      seconds += elapsed;
    }
  }
  focusSeconds.value = seconds;
  lastFocusTick = Date.now();
  persistFocusTime();
};

const resetFocusTime = () => {
  skipFocusPersist = true;
  focusSeconds.value = 0;
  lastFocusTick = 0;
  if (focusTimer) {
    clearInterval(focusTimer);
    focusTimer = null;
  }
  clearFocusTimeStorage();
};

const focusTimeLabel = computed(() => {
  const totalSeconds = Math.max(0, Math.floor(focusSeconds.value));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }
  return `${paddedMinutes}:${paddedSeconds}`;
});

const focusProgress = computed(() => {
  if (!focusGoalSeconds) return 0;
  const pct = (focusSeconds.value / focusGoalSeconds) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
});

const focusClockAngles = computed(() => {
  const totalSeconds = Math.max(0, Math.floor(focusSeconds.value));
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600) % 12;
  return {
    second: seconds * 6,
    minute: minutes * 6 + seconds * 0.1,
    hour: hours * 30 + minutes * 0.5,
  };
});

const focusClockTicks = Array.from({ length: 12 }, (_, index) => index * 30);

const isDoneColumn = (title = "") =>
  /done|complete|finish|closed|resolved/i.test(title.trim().toLowerCase());

const currentWorkspaceId = computed(
  () =>
    selectedWorkspace.value?.id ||
    selectedWorkspace.value ||
    workspaces.value?.[0]?.id ||
    null
);

const getStoredBoardId = (workspaceId) => {
  if (!workspaceId || typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(`taskflow-dashboard-board:${workspaceId}`);
    return stored || null;
  } catch (err) {
    return null;
  }
};

const setStoredBoardId = (workspaceId, boardId) => {
  if (!workspaceId || !boardId || typeof window === "undefined") return;
  try {
    localStorage.setItem(`taskflow-dashboard-board:${workspaceId}`, String(boardId));
  } catch (err) {
    return;
  }
};

const boardOptions = computed(() =>
  (boardStore.boards || [])
    .map((board) => {
      const id = board?.id ?? board?._id;
      if (!id) return null;
      return {
        id: String(id),
        name: board?.name || "Untitled board",
        description: board?.description || "",
      };
    })
    .filter(Boolean)
);

const allTasks = computed(() =>
  (columns.value || []).flatMap((c) => c.tasks || [])
);

const tasksWithStatus = computed(() =>
  (columns.value || []).flatMap((col) => {
    const isDone = isDoneColumn(col.title || col.name || "");
    return (col.tasks || []).map((task) => ({
      ...task,
      isDone,
      columnTitle: col.title || col.name || "",
    }));
  })
);

const doneTasksCount = computed(() =>
  tasksWithStatus.value.filter((task) => task.isDone).length
);

const totalTasksCount = computed(() =>
  allTasks.value.length || boardStore.totalTasks || 0
);

const isTaskAssigned = (task) => {
  const assignee = task?.assignee;
  if (typeof assignee === "string") return assignee.trim().length > 0;
  if (assignee && typeof assignee === "object") {
    return Boolean(assignee.email || assignee.name || assignee.id);
  }
  return Boolean(task?.assigneeId);
};

const openTasksCount = computed(() =>
  tasksWithStatus.value.filter((task) => !isTaskAssigned(task)).length
);

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

const parseDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value?.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatShortDate = (date) =>
  date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

const formatDayLabel = (date) =>
  date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);

const buildRangeBuckets = (range) => {
  const today = startOfDay(new Date());
  const rangeEnd = addDays(today, 1);

  if (range === "week") {
    const start = addDays(rangeEnd, -7);
    return Array.from({ length: 7 }, (_, idx) => {
      const bucketStart = addDays(start, idx);
      const bucketEnd = addDays(bucketStart, 1);
      return {
        key: bucketStart.toISOString().slice(0, 10),
        label: formatDayLabel(bucketStart),
        start: bucketStart,
        end: bucketEnd,
      };
    });
  }

  if (range === "month") {
    const start = addDays(rangeEnd, -30);
    return Array.from({ length: 5 }, (_, idx) => {
      const bucketStart = addDays(start, idx * 7);
      const bucketEnd = addDays(bucketStart, 7);
      const end = bucketEnd > rangeEnd ? rangeEnd : bucketEnd;
      return {
        key: bucketStart.toISOString().slice(0, 10),
        label: formatShortDate(bucketStart),
        start: bucketStart,
        end,
      };
    });
  }

  if (range === "year") {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const start = new Date(monthStart.getFullYear(), monthStart.getMonth() - 11, 1);
    return Array.from({ length: 12 }, (_, idx) => {
      const bucketStart = new Date(start.getFullYear(), start.getMonth() + idx, 1);
      const nextMonth = new Date(bucketStart.getFullYear(), bucketStart.getMonth() + 1, 1);
      const end = nextMonth > rangeEnd ? rangeEnd : nextMonth;
      return {
        key: `${bucketStart.getFullYear()}-${String(bucketStart.getMonth() + 1).padStart(2, "0")}`,
        label: bucketStart.toLocaleDateString(undefined, { month: "short" }),
        start: bucketStart,
        end,
      };
    });
  }

  return [];
};

const bucketizeDates = (dates, buckets) => {
  const filled = buckets.map((bucket) => ({ ...bucket, count: 0 }));
  for (const date of dates) {
    for (const bucket of filled) {
      if (date >= bucket.start && date < bucket.end) {
        bucket.count += 1;
        break;
      }
    }
  }
  return filled;
};

const buildLabelSlots = (buckets = []) => {
  if (!buckets.length) return [];
  const labelEvery = buckets.length > 8 ? 2 : 1;
  return buckets.map((bucket, index) => ({
    key: bucket.key || `label-${index}`,
    label: bucket.label || "",
    show: labelEvery === 1 || index % labelEvery === 0 || index === buckets.length - 1,
  }));
};

const buildLineSeries = (items = [], scaleMax = 1) => {
  const width = chartWidth;
  if (!items.length) {
    return { line: "", area: "", points: [], max: scaleMax || 1 };
  }
  const max = Math.max(1, scaleMax || 1);
  const count = Math.max(1, items.length);
  const step = width / count;
  const points = items.map((item, index) => {
    const value = item.count || 0;
    const x = Number(((index + 0.5) * step).toFixed(2));
    const y = toChartY(value, max);
    return {
      key: item.key || item.label || `point-${index}`,
      label: item.label,
      value,
      x,
      y,
    };
  });
  const line = points.map((point, idx) => `${idx === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const baseline = toChartY(0, max);
  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;
  const area = `${line} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`;
  return { line, area, points, max };
};

const rangeGridClass = computed(() => {
  if (progressRange.value === "year") return "grid-cols-12";
  if (progressRange.value === "month") return "grid-cols-5";
  return "grid-cols-7";
});

const barWidthClass = computed(() => {
  if (progressRange.value === "year") return "w-3 sm:w-4";
  if (progressRange.value === "month") return "w-5 sm:w-6";
  return "w-6 sm:w-7";
});

const rangeBuckets = computed(() => buildRangeBuckets(progressRange.value));

const taskCreatedDates = computed(() =>
  allTasks.value
    .map((task) => parseDate(task.createdAt))
    .filter(Boolean)
    .map((date) => startOfDay(date))
);

const completionDates = computed(() =>
  tasksWithStatus.value
    .filter((task) => task.isDone)
    .map((task) => parseDate(task.completedAt) || parseDate(task.updatedAt) || parseDate(task.createdAt))
    .filter(Boolean)
    .map((date) => startOfDay(date))
);

const taskVolumeBuckets = computed(() =>
  bucketizeDates(taskCreatedDates.value, rangeBuckets.value)
);

const taskVolumeAxis = computed(() =>
  fixedAxisScale(
    getMaxCount(taskVolumeBuckets.value),
    25,
    [25, 20, 15, 10, 5]
  )
);

const taskVolumeTicks = computed(() => taskVolumeAxis.value.ticks);

const taskVolumeGridLines = computed(() =>
  taskVolumeAxis.value.ticks.map((tick) => toChartY(tick, taskVolumeAxis.value.max))
);

const taskVolumeBars = computed(() => {
  if (!taskVolumeBuckets.value.length) return [];
  const max = taskVolumeAxis.value.max || 1;
  return taskVolumeBuckets.value.map((bucket) => {
    const pct = max ? (bucket.count / max) * 100 : 0;
    return {
      ...bucket,
      pct: Number(Math.min(100, Math.max(0, pct)).toFixed(2)),
    };
  });
});

const taskVolumeHasData = computed(() =>
  (taskVolumeBuckets.value || []).some((bucket) => bucket.count > 0)
);

const taskVolumeLabels = computed(() => buildLabelSlots(taskVolumeBuckets.value));

const taskVolumeTotal = computed(() =>
  (taskVolumeBuckets.value || []).reduce((sum, bucket) => sum + bucket.count, 0)
);

const completionBuckets = computed(() =>
  bucketizeDates(completionDates.value, rangeBuckets.value)
);

const isReviewColumn = (title = "") =>
  /review|qa|verify|approval|progress|in progress|in-progress|doing|wip/i.test(
    title.trim().toLowerCase()
  );

const getStatusKey = (task) => {
  if (task?.isDone) return "done";
  if (isReviewColumn(task?.columnTitle || "")) return "review";
  return "todo";
};

const getStatusDate = (task, status) => {
  if (status === "done") {
    return parseDate(task.completedAt) || parseDate(task.updatedAt) || parseDate(task.createdAt);
  }
  if (status === "review") {
    return parseDate(task.updatedAt) || parseDate(task.createdAt);
  }
  return parseDate(task.createdAt) || parseDate(task.updatedAt);
};

const statusRangeStart = computed(
  () => rangeBuckets.value[0]?.start || startOfDay(new Date())
);
const statusRangeEnd = computed(() => {
  const buckets = rangeBuckets.value;
  if (!buckets.length) return addDays(statusRangeStart.value, 1);
  return buckets[buckets.length - 1].end || addDays(statusRangeStart.value, 1);
});

const clampStatusDate = (date) => {
  const start = statusRangeStart.value;
  const end = statusRangeEnd.value;
  if (!date) return start;
  if (date >= end) return addDays(end, -1); 
  return date;
};

const statusEntries = computed(() =>
  tasksWithStatus.value
    .map((task) => {
      const status = getStatusKey(task);
      const date = clampStatusDate(getStatusDate(task, status));
      return { status, date: startOfDay(date) };
    })
    .filter(Boolean)
);

const statusTrend = computed(() => {
  const entries = statusEntries.value;
  const buckets = rangeBuckets.value.map((bucket) => ({
    ...bucket,
    todo: 0,
    review: 0,
    done: 0,
  }));

  for (const bucket of buckets) {
    let todo = 0;
    let review = 0;
    let done = 0;
    for (const entry of entries) {
      if (entry.date < bucket.end) {
        if (entry.status === "todo") todo += 1;
        else if (entry.status === "review") review += 1;
        else if (entry.status === "done") done += 1;
      }
    }
    bucket.todo = todo;
    bucket.review = review;
    bucket.done = done;
  }

  return buckets;
});

const statusTotals = computed(() => {
  const totals = { todo: 0, review: 0, done: 0 };
  tasksWithStatus.value.forEach((task) => {
    const key = getStatusKey(task);
    totals[key] += 1;
  });
  return totals;
});

const statusMax = computed(() =>
  Math.max(
    1,
    statusTotals.value.todo,
    statusTotals.value.review,
    statusTotals.value.done,
    ...(statusTrend.value || []).map((bucket) =>
      Math.max(bucket.todo, bucket.review, bucket.done)
    )
  )
);

const progressAxis = computed(() =>
  fixedAxisScale(
    statusMax.value,
    25,
    [25, 20, 15, 10, 5]
  )
);

const progressTicks = computed(() => progressAxis.value.ticks);

const progressGridLines = computed(() =>
  progressAxis.value.ticks.map((tick) => toChartY(tick, progressAxis.value.max))
);

const statusSeries = computed(() => {
  const max = progressAxis.value.max || 1;
  return {
    todo: buildLineSeries(
      statusTrend.value.map((bucket) => ({ ...bucket, count: bucket.todo })),
      max
    ),
    review: buildLineSeries(
      statusTrend.value.map((bucket) => ({ ...bucket, count: bucket.review })),
      max
    ),
    done: buildLineSeries(
      statusTrend.value.map((bucket) => ({ ...bucket, count: bucket.done })),
      max
    ),
  };
});

const progressHasData = computed(() =>
  (statusTrend.value || []).some((bucket) => bucket.todo || bucket.review || bucket.done)
);

const progressLabels = computed(() => buildLabelSlots(statusTrend.value));

const statusLineColors = computed(() => ({
  todo: isDark.value ? "#818cf8" : "#6366f1",
  review: isDark.value ? "#fbbf24" : "#f59e0b",
  done: isDark.value ? "#34d399" : "#10b981",
}));

const statusLegend = computed(() => [
  {
    key: "todo",
    label: "To Do",
    color: statusLineColors.value.todo,
    count: statusTotals.value.todo,
  },
  {
    key: "review",
    label: "In Progress",
    color: statusLineColors.value.review,
    count: statusTotals.value.review,
  },
  {
    key: "done",
    label: "Done",
    color: statusLineColors.value.done,
    count: statusTotals.value.done,
  },
]);

const completedInRange = computed(() =>
  (completionBuckets.value || []).reduce((sum, bucket) => sum + bucket.count, 0)
);

const progressRangeLabel = computed(() => {
  if (progressRange.value === "year") return "Last 12 months";
  if (progressRange.value === "month") return "Last 30 days";
  return "Last 7 days";
});

const activityDates = computed(() => {
  const activity = Array.isArray(boardActivity.value) ? boardActivity.value : [];
  const source = activity.length ? activity : allTasks.value;
  return source
    .map((entry) => parseDate(entry.updatedAt || entry.completedAt || entry.createdAt))
    .filter(Boolean)
    .map((date) => startOfDay(date));
});

const activityBuckets = computed(() => buildRangeBuckets("week"));

const activityTrend = computed(() =>
  bucketizeDates(activityDates.value, activityBuckets.value)
);

const activityAxis = computed(() =>
  fixedAxisScale(
    getMaxCount(activityTrend.value || []),
    50,
    [50, 40, 30, 20, 10]
  )
);

const activityTicks = computed(() => activityAxis.value.ticks);

const activityGridLines = computed(() =>
  activityAxis.value.ticks.map((tick) => toChartY(tick, activityAxis.value.max))
);

const activitySeries = computed(() =>
  buildLineSeries(activityTrend.value || [], activityAxis.value.max)
);

const activityHasData = computed(() =>
  (activityTrend.value || []).some((item) => item.count > 0)
);

const activityLabels = computed(() => buildLabelSlots(activityTrend.value));

const activityTotal = computed(() =>
  (activityTrend.value || []).reduce((sum, item) => sum + item.count, 0)
);

const headlineStats = computed(() => [
  {
    label: "Focus time",
    value: focusTimeLabel.value,
    helper: `${focusProgress.value}% of ${focusGoalHours}h goal`,
    type: "focus",
  },
  {
    label: "Open tasks",
    value: openTasksCount.value,
    suffix: "open",
    helper: boardSummary.value?.name
      ? `Unassigned in ${boardSummary.value.name}`
      : "Unassigned in current board",
    icon: "fa-solid fa-layer-group",
    badge:
      "bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-400/30",
  },
  {
    label: "Shared spaces",
    value: collaborationCount.value,
    suffix: "spaces",
    icon: "fa-solid fa-handshake",
    badge:
      "bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-300/30",
  },
  {
    label: "Team members",
    value: totalMembersCount.value,
    suffix: "people",
    icon: "fa-solid fa-users",
    badge:
      "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-300/30",
  },
]);

const focusShare = computed(() => {
  const total = totalTasksCount.value;
  const assigned = focusTasksCount.value;
  const percent = total ? Math.round((assigned / total) * 100) : 0;
  return { percent, assigned, total };
});

const formatTaskDate = (date) =>
  date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const pickRecentTaskActivity = (task) => {
  const candidates = [
    { label: "Updated", date: parseDate(task.updatedAt) },
    { label: "Completed", date: parseDate(task.completedAt) },
    { label: "Created", date: parseDate(task.createdAt) },
  ].filter((item) => item.date);
  if (!candidates.length) return null;
  return candidates.reduce((latest, current) =>
    current.date > latest.date ? current : latest
  );
};

const recentTasks = computed(() =>
  tasksWithStatus.value
    .map((task, index) => {
      const activity = pickRecentTaskActivity(task);
      if (!activity) return null;
      return {
        key: task.id || task._id || `${task.title || "task"}-${activity.date.getTime()}-${index}`,
        title: task.title || "Untitled task",
        when: formatTaskDate(activity.date),
        activity: activity.label,
        timestamp: activity.date.getTime(),
        isDone: task.isDone,
        status: task.isDone ? "Done" : "Open",
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 4)
);

const currentBoard = computed(() => {
  const selectedId = selectedBoardId.value;
  return (
    boardStore.currentBoard ||
    boardStore.boards?.find(
      (board) => String(board?.id ?? board?._id ?? "") === selectedId
    ) ||
    boardStore.boards?.find(
      (board) =>
        String(board?.id ?? board?._id ?? "") ===
        String(boardStore.boardId ?? "")
    ) ||
    boardStore.boards?.[0] ||
    null
  );
});

const boardSummary = computed(() => {
  const board = currentBoard.value;
  const activityDates = [];

  const boardUpdated = parseDate(board?.updatedAt);
  if (boardUpdated) activityDates.push(boardUpdated);
  const boardCreated = parseDate(board?.createdAt);
  if (boardCreated) activityDates.push(boardCreated);

  (boardActivity.value || []).forEach((entry) => {
    const date = parseDate(entry.updatedAt || entry.completedAt || entry.createdAt);
    if (date) activityDates.push(date);
  });

  allTasks.value.forEach((task) => {
    const date = parseDate(task.updatedAt || task.completedAt || task.createdAt);
    if (date) activityDates.push(date);
  });

  let latest = null;
  activityDates.forEach((date) => {
    if (!latest || date > latest) latest = date;
  });

  return {
    name: board?.name || "No board selected",
    description: board?.description || "",
    columns: columns.value?.length || 0,
    tasks: allTasks.value.length,
    lastActivity: latest ? formatTaskDate(latest) : "No activity yet",
  };
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

const totalMembersCount = computed(() => {
  const seen = new Set();
  (workspaces.value || []).forEach((ws) => {
    (ws.members || []).forEach((member) => {
      const key =
        member?.email?.toLowerCase?.() ||
        member?.userId ||
        member?.id ||
        null;
      if (key) seen.add(key);
    });
  });
  return seen.size;
});

const collaborationWorkspaces = computed(() => {
  if (!user.value?.email) return [];
  return (workspaces.value || []).filter((ws) => getRole(ws.id) !== "owner");
});

const collaborationCount = computed(() => collaborationWorkspaces.value.length);

const collaborationList = computed(() =>
  collaborationWorkspaces.value
    .map((ws) => ({
      id: ws.id,
      name: ws.name || "Workspace",
      members: ws.members?.length || 0,
      role: getRole(ws.id) || "member",
    }))
    .sort((a, b) => b.members - a.members || a.name.localeCompare(b.name))
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

  if (workspaceFilter.value === "owned") {
    list = list.filter((w) => getRole(w.id) === "owner");
  } else if (workspaceFilter.value === "shared") {
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
  document.addEventListener("visibilitychange", handleVisibilityChange);

  hydrateFocusTime();
  focusTimer = setInterval(() => {
    const now = Date.now();
    const elapsed = Math.floor((now - lastFocusTick) / 1000);
    if (elapsed > 0) {
      focusSeconds.value += elapsed;
      lastFocusTick = now;
      if (focusSeconds.value % 5 === 0) {
        persistFocusTime();
      }
    }
  }, 1000);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (focusTimer) clearInterval(focusTimer);
  if (skipFocusPersist) {
    clearFocusTimeStorage();
    return;
  }
  persistFocusTime();
});

watch(
  () => selectedWorkspaceId.value,
  async (workspaceId) => {
    if (!workspaceId) {
      selectedBoardId.value = "";
      return;
    }

    try {
      
      await boardStore.loadBoards(workspaceId);

      
      const storedId = getStoredBoardId(workspaceId);
      const normalizedStored = storedId ? String(storedId) : "";
      const boards = boardOptions.value || [];
      const storedMatch = boards.find((board) => board.id === normalizedStored)?.id;
      const currentMatch = boardStore.boardId
        ? boards.find((board) => board.id === String(boardStore.boardId))?.id
        : "";
      const fallback = boards[0]?.id || "";
      selectedBoardId.value = storedMatch || currentMatch || fallback || "";
    } catch (err) {
      console.error("Dashboard board load error:", err);
    }
  },
  { immediate: true }
);

watch(
  () => selectedBoardId.value,
  async (boardId) => {
    const workspaceId = selectedWorkspaceId.value;
    if (!workspaceId || !boardId) return;

    const normalizedBoardId = String(boardId);
    if (
      normalizedBoardId === String(boardStore.boardId || "") &&
      boardStore.currentBoard
    ) {
      setStoredBoardId(workspaceId, normalizedBoardId);
      return;
    }

    try {
      await boardStore.loadBoard(workspaceId, normalizedBoardId);
      setStoredBoardId(workspaceId, normalizedBoardId);
    } catch (err) {
      console.error("Dashboard board load error:", err);
    }
  }
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

const handleVisibilityChange = () => {
  if (document.visibilityState === "hidden") {
    if (skipFocusPersist) return;
    persistFocusTime();
  }
};

const handleNavClick = (item) => {
  activeNav.value = item.id;
  if (item.id === "dashboard") {
    activeFilter.value = "all";
    router.push("/dashboard");
    return;
  }

  if (item.id === "home") {
    activeFilter.value = "all";
    router.push("/workspace");
    return;
  }

  if (item.id === "boards") {
    activeFilter.value = "all";
    const workspaceId = currentWorkspaceId.value;
    if (workspaceId) {
      router.push(`/workspace/${workspaceId}`);
    } else {
      router.push("/workspace");
    }
    return;
  }

  if (item.id === "tasks") {
    activeFilter.value = "all";
    const workspaceId = currentWorkspaceId.value;
    if (!workspaceId) {
      router.push("/workspace");
      return;
    }
    const boardId = boardStore.boardId || boardStore.boards?.[0]?.id;
    if (boardId) {
      router.push(`/workspace/${workspaceId}/board/${boardId}`);
    } else {
      router.push(`/workspace/${workspaceId}`);
    }
    return;
  }

  if (item.id === "owned") {
    activeFilter.value = "owned";
    router.push({ path: "/workspace", query: { filter: "owned" } });
    return;
  }

  if (item.id === "shared") {
    activeFilter.value = "shared";
    router.push({ path: "/workspace", query: { filter: "shared" } });
    return;
  }
};

const openCreateWorkspace = () => {
  showCreateWorkspace.value = true;
};

const goToWorkspace = (workspaceOrId) => {
  if (workspaceOrId?.isOptimistic) return;
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
  resetFocusTime();
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
