<template>
  <div class="min-h-screen w-full bg-[#070812] text-white overflow-x-hidden selection:bg-violet-500/30">
    <!-- Background glow + subtle vignette -->
    <div class="pointer-events-none fixed inset-0">
      <div class="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(168,85,247,0.18),transparent_55%),radial-gradient(900px_circle_at_85%_35%,rgba(99,102,241,0.16),transparent_58%),radial-gradient(800px_circle_at_40%_85%,rgba(236,72,153,0.10),transparent_60%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_40%,rgba(0,0,0,0.0),rgba(0,0,0,0.55))]"></div>
      <div class="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:70px_70px]"></div>
    </div>

    <!-- Top Nav -->
    <header class="relative z-20">
      <div class="mx-auto max-w-7xl px-6 pt-7">
        <div class="rounded-[26px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_1 6px_60px_rgba(0,0,0,0.45)]">
          <div class="flex items-center justify-between px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/70 to-indigo-500/70 shadow-[0_10px_30px_rgba(124,58,237,0.25)]">
                <span class="text-sm font-extrabold tracking-tight">TTB</span>
              </div>
              <div class="leading-tight">
                <div class="text-sm font-semibold text-white/90">TeamTaskBoard</div>
                <div class="text-xs text-white/55">Manage tasks. Ship faster.</div>
              </div>
            </div>

            <nav class="hidden md:flex items-center gap-8 text-sm text-white/70">
              <a href="#about" class="hover:text-white transition">About</a>
              <a href="#pricing" class="hover:text-white transition">Pricing</a>
              <a href="#reviews" class="hover:text-white transition">Reviews</a>
              <a href="#contact" class="hover:text-white transition">Contact</a>
            </nav>

            <div class="flex items-center gap-3">
              <button
                type="button"
                class="hidden sm:inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 hover:bg-white/[0.06] transition"
                @click="goAuth('login')"
              >
                Sign in
              </button>
              <button
                type="button"
                class="inline-flex rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2 text-sm font-semibold shadow-[0_18px_50px_rgba(99,102,241,0.28)] hover:brightness-110 transition"
                @click="goAuth('register')"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- HERO -->
    <section class="relative z-10">
      <div class="mx-auto max-w-7xl px-6 pt-14 pb-20">
        <div class="relative rounded-[34px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_90px_rgba(0,0,0,0.55)] overflow-hidden">
          <!-- floating shapes -->
          <div class="pointer-events-none absolute -left-10 top-28 h-44 w-16 rounded-full bg-gradient-to-b from-indigo-500/50 to-violet-500/10 blur-[0px] opacity-80 animate-float-slow"></div>
          <div class="pointer-events-none absolute right-16 top-24 h-10 w-10 rounded-xl bg-violet-500/35 rotate-12 shadow-[0_18px_50px_rgba(168,85,247,0.12)] animate-float"></div>
          <div class="pointer-events-none absolute right-10 bottom-20 h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500/60 to-violet-500/20 shadow-[0_20px_60px_rgba(99,102,241,0.18)] animate-float-slow"></div>
          <div class="pointer-events-none absolute left-10 bottom-16 h-10 w-10 rounded-xl bg-rose-500/35 -rotate-12 shadow-[0_18px_50px_rgba(244,63,94,0.12)] animate-float"></div>

          <div class="px-7 sm:px-12 pt-14 pb-10">
            <div class="mx-auto max-w-3xl text-center">
              <h1 class="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight">
                <span class="relative inline-block">
                  <span class="text-white">Plan</span>
                  <span class="absolute left-0 -bottom-1 h-2 w-full bg-gradient-to-r from-rose-500 to-violet-500 rounded-full opacity-80"></span>
                </span>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">. Collaborate.</span>
                <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Ship work</span>
                <span class="text-white/90"> without the chaos.</span>
              </h1>

              <p class="mt-6 text-sm sm:text-base text-white/70 leading-relaxed">
                TeamTaskBoard keeps your team on one visual board with real-time updates, clear priorities,
                and effortless handoffs from idea to done.
              </p>

              <!-- Email CTA like the reference -->
              <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <div class="w-full sm:w-[420px] rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 flex items-center gap-3">
                  <i class="fas fa-envelope text-white/40 text-sm"></i>
                  <input
                    class="w-full bg-transparent outline-none text-sm placeholder:text-white/35"
                    placeholder="Email address"
                    v-model="email"
                    @keydown.enter.prevent="goAuth('register')"
                  />
                </div>
                <button
                  type="button"
                  class="w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-7 py-3 text-sm font-semibold shadow-[0_18px_50px_rgba(99,102,241,0.28)] hover:brightness-110 transition"
                  @click="goAuth('register')"
                >
                  Get started
                </button>
              </div>
            </div>

            <!-- “Locked” dashboard preview (non-interactive) -->
            <div class="mt-14 relative">
              <div class="absolute inset-0 blur-3xl bg-violet-500/20 rounded-full"></div>

              <!-- Click-catcher: anywhere redirects to login/register -->
              <button
                type="button"
                class="absolute inset-0 z-10 rounded-2xl"
                @click="goAuth('login')"
                aria-label="Preview locked - login required"
              ></button>

              <div class="relative rounded-2xl border border-white/10 bg-[#0C0D16]/60 shadow-[0_40px_120px_rgba(0,0,0,0.55)] overflow-hidden">
                <!-- top fake browser bar -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.03]">
                  <div class="flex items-center gap-2">
                    <span class="h-2.5 w-2.5 rounded-full bg-rose-500/70"></span>
                    <span class="h-2.5 w-2.5 rounded-full bg-amber-400/70"></span>
                    <span class="h-2.5 w-2.5 rounded-full bg-emerald-400/70"></span>
                  </div>
                  <div class="text-xs text-white/40">teamtaskboard.app — preview</div>
                  <div class="text-xs text-white/40 flex items-center gap-2">
                    <i class="fas fa-lock"></i>
                    <span>Locked</span>
                  </div>
                </div>

                <!-- Fake dashboard content -->
                <div class="p-4 sm:p-6">
                  <div class="grid grid-cols-12 gap-4">
                    <!-- left sidebar -->
                    <div class="col-span-12 sm:col-span-3 lg:col-span-2">
                      <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
                        <div class="h-9 rounded-lg bg-white/[0.04] border border-white/10"></div>
                        <div class="h-9 rounded-lg bg-white/[0.02] border border-white/10"></div>
                        <div class="h-9 rounded-lg bg-white/[0.02] border border-white/10"></div>
                        <div class="h-9 rounded-lg bg-white/[0.02] border border-white/10"></div>
                      </div>
                    </div>

                    <!-- main panel -->
                    <div class="col-span-12 sm:col-span-9 lg:col-span-10">
                      <div class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <div class="flex items-center justify-between gap-3">
                          <div class="text-sm font-semibold text-white/85">Overview</div>
                          <div class="h-9 w-56 rounded-lg border border-white/10 bg-white/[0.02]"></div>
                        </div>

                        <div class="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div class="rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/25 to-transparent p-4">
                            <div class="text-xs text-white/55">New tasks</div>
                            <div class="mt-2 text-2xl font-extrabold">230</div>
                            <div class="mt-3 flex -space-x-2">
                              <span class="h-7 w-7 rounded-full bg-white/20 border border-white/10"></span>
                              <span class="h-7 w-7 rounded-full bg-white/20 border border-white/10"></span>
                              <span class="h-7 w-7 rounded-full bg-white/20 border border-white/10"></span>
                            </div>
                          </div>

                          <div class="rounded-xl border border-white/10 bg-gradient-to-br from-rose-500/25 to-transparent p-4">
                            <div class="text-xs text-white/55">Team activity</div>
                            <div class="mt-2 text-2xl font-extrabold">4.5</div>
                            <div class="mt-3 h-10 rounded-lg bg-white/[0.04] border border-white/10"></div>
                          </div>

                          <div class="rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-transparent p-4">
                            <div class="text-xs text-white/55">Progress</div>
                            <div class="mt-2 text-2xl font-extrabold">329</div>
                            <div class="mt-3 h-10 rounded-lg bg-white/[0.04] border border-white/10"></div>
                          </div>
                        </div>

                        <div class="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div class="lg:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                            <div class="text-xs text-white/55 mb-3">Board preview</div>
                            <div class="grid grid-cols-4 gap-3">
                              <div class="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                                <div class="h-3 w-16 bg-white/10 rounded"></div>
                                <div class="mt-2 space-y-2">
                                  <div class="h-10 rounded bg-white/[0.04] border border-white/10"></div>
                                  <div class="h-10 rounded bg-white/[0.04] border border-white/10"></div>
                                </div>
                              </div>
                              <div class="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                                <div class="h-3 w-16 bg-white/10 rounded"></div>
                                <div class="mt-2 space-y-2">
                                  <div class="h-10 rounded bg-white/[0.04] border border-white/10"></div>
                                  <div class="h-10 rounded bg-white/[0.04] border border-white/10"></div>
                                </div>
                              </div>
                              <div class="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                                <div class="h-3 w-16 bg-white/10 rounded"></div>
                                <div class="mt-2 space-y-2">
                                  <div class="h-10 rounded bg-white/[0.04] border border-white/10"></div>
                                  <div class="h-10 rounded bg-white/[0.04] border border-white/10"></div>
                                </div>
                              </div>
                              <div class="rounded-lg border border-white/10 bg-white/[0.03] p-2">
                                <div class="h-3 w-16 bg-white/10 rounded"></div>
                                <div class="mt-2 space-y-2">
                                  <div class="h-10 rounded bg-white/[0.04] border border-white/10"></div>
                                  <div class="h-10 rounded bg-white/[0.04] border border-white/10"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                            <div class="text-xs text-white/55 mb-3">Today</div>
                            <div class="space-y-2">
                              <div class="h-10 rounded-lg bg-white/[0.04] border border-white/10"></div>
                              <div class="h-10 rounded-lg bg-white/[0.04] border border-white/10"></div>
                              <div class="h-10 rounded-lg bg-white/[0.04] border border-white/10"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- lock overlay message -->
                      <div class="absolute inset-x-0 bottom-6 flex justify-center z-20 pointer-events-none">
                        <div class="rounded-full border border-white/10 bg-black/40 backdrop-blur px-4 py-2 text-xs text-white/75">
                          <i class="fas fa-lock mr-2 text-violet-300"></i>
                          Preview is locked — sign in to use the app
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 text-center text-xs text-white/45">
                (This is a visual preview. Clicking anywhere will take you to login.)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ABOUT / FEATURES (scroll animated) -->
    <section id="about" class="relative z-10">
      <div class="mx-auto max-w-7xl px-6 py-24">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="reveal">
            <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/70">
              <span class="h-2 w-2 rounded-full bg-violet-400"></span>
              Built for collaboration
            </div>
            <h2 class="mt-5 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Your team’s work — visible, organized, and effortless.
            </h2>
            <p class="mt-5 text-white/70 leading-relaxed">
              Assign tasks, discuss changes, and move cards across stages.
              Everything stays in one place so your team always knows what’s next.
            </p>

            <div class="mt-8 grid sm:grid-cols-2 gap-4">
              <FeatureCard icon="fa-columns" title="Kanban boards" text="Track work through stages with drag & drop." />
              <FeatureCard icon="fa-bolt" title="Fast workflows" text="Less clutter. More momentum. Clear ownership." />
              <FeatureCard icon="fa-users" title="Team-ready" text="Mentions, updates, and collaboration built in." />
              <FeatureCard icon="fa-shield" title="Access control" text="Previews are locked until login." />
            </div>
          </div>

          <!-- Illustration section (SVG, no external assets) -->
          <div class="reveal relative">
            <div class="absolute -inset-8 rounded-[32px] bg-gradient-to-br from-violet-500/15 to-indigo-500/5 blur-2xl"></div>
            <div class="relative rounded-[28px] border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-xl overflow-hidden">
              <div class="text-sm font-semibold text-white/85 mb-4">Collaboration preview</div>
              <CollabIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- VIDEO SECTION (scroll animated) -->
    <section class="relative z-10">
      <div class="mx-auto max-w-7xl px-6 pb-24">
        <div class="reveal rounded-[30px] border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div class="p-7 sm:p-10">
            <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <h3 class="text-2xl sm:text-3xl font-extrabold">Watch how teams use TeamTaskBoard</h3>
                <p class="mt-2 text-white/55">
                  Short demo video — the app remains locked until sign in.
                </p>
              </div>
              <div class="flex gap-3">
                <button
                  class="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-white/80 hover:bg-white/[0.06] transition"
                  @click="go('/login')"
                >
                  Sign in
                </button>
                <button
                  class="rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2 text-sm font-semibold hover:brightness-110 transition"
                  @click="go('/register')"
                >
                  Get started
                </button>
              </div>
            </div>

            <div class="mt-8 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
              <!-- video -->
              <video
                class="w-full h-[240px] sm:h-[420px] object-cover"
                autoplay
                muted
                loop
                playsinline
                preload="metadata"
              >
                <source
                  src="https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4"
                  type="video/mp4"
                />
              </video>

              <!-- soft overlay -->
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>

              <!-- lock hint -->
              <div class="pointer-events-none absolute left-5 bottom-5 rounded-full border border-white/10 bg-black/40 backdrop-blur px-4 py-2 text-xs text-white/80">
                <i class="fas fa-lock mr-2 text-violet-300"></i>
                Demo only — sign in to interact
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- REVIEWS -->
    <section id="reviews" class="relative z-10">
      <div class="mx-auto max-w-7xl px-6 py-24">
        <div class="text-center reveal">
          <h2 class="text-3xl sm:text-4xl font-extrabold">Reviews teams actually agree on</h2>
          <p class="mt-4 text-white/55 max-w-2xl mx-auto">
            Clean workflow. Fast updates. Clear ownership. Fewer “what’s the status?” meetings.
          </p>
        </div>

        <div class="mt-12 grid md:grid-cols-3 gap-6">
          <TestimonialCard
            name="Ava • Product"
            quote="We replaced three tools with one board. Everyone knows what’s next."
          />
          <TestimonialCard
            name="Noah • Engineering"
            quote="The workflow is simple, fast, and doesn’t fight you. It just works."
          />
          <TestimonialCard
            name="Mia • Operations"
            quote="Tasks, owners, and deadlines are obvious now. The team ships faster."
          />
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section id="pricing" class="relative z-10">
      <div class="mx-auto max-w-7xl px-6 pb-28">
        <div class="text-center reveal">
          <h2 class="text-3xl sm:text-4xl font-extrabold">Pricing</h2>
          <p class="mt-4 text-white/55 max-w-2xl mx-auto">
            Start free. Upgrade when your team grows.
          </p>
        </div>

        <div class="mt-12 grid lg:grid-cols-3 gap-6">
          <PricingCard
            plan="Free"
            price="$0"
            tag="Great for trying it"
            :features="['1 workspace', 'Basic boards', 'Limited activity', 'Community support']"
            button="Get started"
            @action="go('/register')"
          />
          <PricingCard
            plan="Pro"
            price="$12"
            tag="Most popular"
            highlight
            :features="['Unlimited boards', 'Team comments', 'File attachments', 'Priority labels', 'Advanced filters']"
            button="Start Pro"
            @action="go('/register')"
          />
          <PricingCard
            plan="Team"
            price="$29"
            tag="For scaling teams"
            :features="['Multiple workspaces', 'Roles & permissions', 'Audit/activity logs', 'Priority support']"
            button="Contact sales"
            @action="scrollTo('#contact')"
          />
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="relative z-10">
      <div class="mx-auto max-w-7xl px-6 pb-24">
        <div class="reveal rounded-[32px] border border-white/10 bg-gradient-to-r from-violet-500/15 to-indigo-500/10 backdrop-blur-xl shadow-[0_24px_120px_rgba(0,0,0,0.6)] overflow-hidden">
          <div class="px-8 sm:px-12 py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h3 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Start organizing your team today.
              </h3>
              <p class="mt-3 text-white/70 max-w-xl">
                The preview is locked — create an account to unlock your boards, tasks, and team workflow.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                class="w-full sm:w-auto rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-7 py-3 text-sm font-semibold hover:brightness-110 transition"
                @click="go('/register')"
              >
                Get started free
              </button>
              <button
                class="w-full sm:w-auto rounded-full border border-white/10 bg-white/[0.03] px-7 py-3 text-sm text-white/80 hover:bg-white/[0.06] transition"
                @click="go('/login')"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT -->
    <section id="contact" class="relative z-10">
      <div class="mx-auto max-w-7xl px-6 pb-24">
        <div class="grid lg:grid-cols-2 gap-10 items-start">
          <div class="reveal">
            <h2 class="text-3xl sm:text-4xl font-extrabold">Contact</h2>
            <p class="mt-4 text-white/55">
              Want a custom plan, onboarding, or questions? Send a message — we’ll reply fast.
            </p>

            <div class="mt-7 space-y-3 text-white/65 text-sm">
              <div class="flex items-center gap-3">
                <span class="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.03] grid place-items-center">
                  <i class="fas fa-envelope text-white/70"></i>
                </span>
                <span>support@teamtaskboard.app</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.03] grid place-items-center">
                  <i class="fas fa-location-dot text-white/70"></i>
                </span>
                <span>Remote-friendly</span>
              </div>
            </div>
          </div>

          <div class="reveal rounded-[26px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8">
            <div class="text-sm font-semibold text-white/85">Send a message</div>
            <div class="mt-5 space-y-4">
              <input
                class="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-violet-400/40"
                placeholder="Your name"
              />
              <input
                class="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-violet-400/40"
                placeholder="Email"
              />
              <textarea
                class="w-full min-h-[120px] rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-violet-400/40"
                placeholder="Message"
              ></textarea>
              <button
                class="w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-3 text-sm font-semibold hover:brightness-110 transition"
                @click="go('/register')"
              >
                Send (requires account)
              </button>
              <div class="text-xs text-white/45">
                This form is for design only — submit requires an account.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="relative z-10 border-t border-white/10">
      <div class="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between text-sm text-white/55">
        <div class="flex items-center gap-3">
          <div class="grid h-9 w-9 place-items-center rounded-2xl bg-white/[0.04] border border-white/10">
            <span class="text-xs font-extrabold">TTB</span>
          </div>
          <div class="leading-tight">
            <div class="font-semibold text-white/75">TeamTaskBoard</div>
            <div class="text-xs text-white/45">© {{ new Date().getFullYear() }} All rights reserved</div>
          </div>
        </div>

        <div class="flex flex-wrap gap-5">
          <a href="#about" class="hover:text-white transition">About</a>
          <a href="#pricing" class="hover:text-white transition">Pricing</a>
          <a href="#reviews" class="hover:text-white transition">Reviews</a>
          <a href="#contact" class="hover:text-white transition">Contact</a>
          <button class="hover:text-white transition" @click="go('/login')">Login</button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const router = useRouter();

function goAuth(tab = "login") {
  try {
    router.push({ path: "/auth", query: { tab } });
  } catch (_) {
    window.location.href = `/auth?tab=${encodeURIComponent(tab)}`;
  }
}

function scrollTo(hash) {
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Scroll reveal animations (no libraries)
 * Adds .is-visible when element enters viewport.
 */
let observer;

onMounted(() => {
  const els = document.querySelectorAll(".reveal");
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          observer.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => observer.observe(el));
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});

/** Small local components in the same file (still one SFC) */
const FeatureCard = {
  props: { icon: String, title: String, text: String },
  template: `
    <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur hover:bg-white/[0.05] transition">
      <div class="flex items-start gap-3">
        <div class="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] grid place-items-center text-white/75">
          <i class="fas" :class="icon"></i>
        </div>
        <div>
          <div class="text-sm font-semibold text-white/85">{{ title }}</div>
          <div class="mt-1 text-sm text-white/55 leading-relaxed">{{ text }}</div>
        </div>
      </div>
    </div>
  `,
};

const TestimonialCard = {
  props: { name: String, quote: String },
  template: `
    <div class="reveal rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
      <div class="text-white/80 text-sm leading-relaxed">“{{ quote }}”</div>
      <div class="mt-4 text-xs text-white/55">{{ name }}</div>
    </div>
  `,
};

const PricingCard = {
  emits: ["action"],
  props: { plan: String, price: String, tag: String, features: Array, button: String, highlight: Boolean },
  template: `
    <div
      class="reveal rounded-3xl border p-7 backdrop-blur-xl"
      :class="highlight
        ? 'border-violet-400/30 bg-gradient-to-b from-violet-500/15 to-white/[0.03] shadow-[0_22px_80px_rgba(168,85,247,0.18)]'
        : 'border-white/10 bg-white/[0.03]'"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-sm font-semibold text-white/90">{{ plan }}</div>
          <div class="mt-1 text-xs text-white/50">{{ tag }}</div>
        </div>
        <div v-if="highlight" class="text-xs rounded-full border border-violet-400/25 bg-violet-500/15 px-3 py-1 text-violet-200">
          Popular
        </div>
      </div>

      <div class="mt-6 flex items-end gap-2">
        <div class="text-4xl font-extrabold tracking-tight">{{ price }}</div>
        <div class="text-sm text-white/55 mb-1">/ mo</div>
      </div>

      <ul class="mt-6 space-y-3 text-sm text-white/65">
        <li v-for="(f, i) in features" :key="i" class="flex items-start gap-2">
          <i class="fas fa-check text-violet-300 mt-1"></i>
          <span>{{ f }}</span>
        </li>
      </ul>

      <button
        type="button"
        class="mt-7 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition"
        :class="highlight
          ? 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:brightness-110'
          : 'border border-white/10 bg-white/[0.03] text-white/85 hover:bg-white/[0.06]'"
        @click="$emit('action')"
      >
        {{ button }}
      </button>
    </div>
  `,
};

const CollabIllustration = {
  template: `
    <svg viewBox="0 0 980 520" class="w-full h-auto">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="rgba(167,139,250,0.35)" />
          <stop offset="1" stop-color="rgba(99,102,241,0.12)" />
        </linearGradient>
      </defs>

      <!-- soft background -->
      <rect x="0" y="0" width="980" height="520" rx="26" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.10)" />
      <circle cx="160" cy="120" r="90" fill="rgba(255,255,255,0.03)" />
      <circle cx="820" cy="130" r="70" fill="rgba(255,255,255,0.03)" />
      <circle cx="700" cy="420" r="90" fill="rgba(255,255,255,0.03)" />

      <!-- windows -->
      <g>
        <rect x="70" y="90" width="360" height="190" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" />
        <circle cx="102" cy="120" r="6" fill="rgba(244,63,94,0.55)" />
        <circle cx="126" cy="120" r="6" fill="rgba(251,191,36,0.55)" />
        <circle cx="150" cy="120" r="6" fill="rgba(34,197,94,0.55)" />

        <rect x="520" y="70" width="360" height="190" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" />
        <circle cx="552" cy="100" r="6" fill="rgba(244,63,94,0.55)" />
        <circle cx="576" cy="100" r="6" fill="rgba(251,191,36,0.55)" />
        <circle cx="600" cy="100" r="6" fill="rgba(34,197,94,0.55)" />

        <rect x="110" y="305" width="360" height="190" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" />
        <circle cx="142" cy="335" r="6" fill="rgba(244,63,94,0.55)" />
        <circle cx="166" cy="335" r="6" fill="rgba(251,191,36,0.55)" />
        <circle cx="190" cy="335" r="6" fill="rgba(34,197,94,0.55)" />

        <rect x="560" y="300" width="360" height="190" rx="18" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" />
        <circle cx="592" cy="330" r="6" fill="rgba(244,63,94,0.55)" />
        <circle cx="616" cy="330" r="6" fill="rgba(251,191,36,0.55)" />
        <circle cx="640" cy="330" r="6" fill="rgba(34,197,94,0.55)" />
      </g>

      <!-- characters (simple, modern) -->
      <g>
        <!-- left top -->
        <circle cx="170" cy="180" r="34" fill="url(#g1)" />
        <rect x="136" y="218" width="92" height="46" rx="18" fill="rgba(167,139,250,0.22)" />
        <rect x="250" y="170" width="130" height="16" rx="8" fill="rgba(255,255,255,0.10)" />
        <rect x="250" y="198" width="160" height="16" rx="8" fill="rgba(255,255,255,0.08)" />
      </g>

      <g>
        <!-- top right -->
        <circle cx="680" cy="150" r="34" fill="rgba(99,102,241,0.28)" />
        <rect x="646" y="188" width="92" height="46" rx="18" fill="rgba(99,102,241,0.18)" />
        <rect x="760" y="140" width="90" height="16" rx="8" fill="rgba(255,255,255,0.10)" />
        <rect x="760" y="168" width="120" height="16" rx="8" fill="rgba(255,255,255,0.08)" />
      </g>

      <g>
        <!-- bottom left -->
        <circle cx="220" cy="400" r="34" fill="rgba(236,72,153,0.22)" />
        <rect x="186" y="438" width="92" height="46" rx="18" fill="rgba(236,72,153,0.14)" />
        <rect x="320" y="370" width="120" height="16" rx="8" fill="rgba(255,255,255,0.10)" />
        <rect x="320" y="398" width="160" height="16" rx="8" fill="rgba(255,255,255,0.08)" />
      </g>

      <g>
        <!-- bottom right -->
        <circle cx="720" cy="390" r="34" fill="rgba(34,197,94,0.18)" />
        <rect x="686" y="428" width="92" height="46" rx="18" fill="rgba(34,197,94,0.12)" />
        <rect x="820" y="360" width="120" height="16" rx="8" fill="rgba(255,255,255,0.10)" />
        <rect x="820" y="388" width="140" height="16" rx="8" fill="rgba(255,255,255,0.08)" />
      </g>

      <!-- chat bubbles -->
      <g opacity="0.9">
        <rect x="420" y="250" width="70" height="44" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.10)" />
        <circle cx="445" cy="272" r="4" fill="rgba(255,255,255,0.35)" />
        <circle cx="463" cy="272" r="4" fill="rgba(255,255,255,0.35)" />
        <circle cx="481" cy="272" r="4" fill="rgba(255,255,255,0.35)" />
      </g>

      <!-- pie indicator -->
      <g>
        <circle cx="500" cy="412" r="34" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.10)" />
        <path d="M500 412 L500 378 A34 34 0 0 1 530 430 Z" fill="rgba(167,139,250,0.35)" />
        <path d="M500 412 L530 430 A34 34 0 0 1 468 438 Z" fill="rgba(34,197,94,0.25)" />
      </g>
    </svg>
  `,
};
</script>

<style scoped>
/* Scroll reveal animation */
.reveal {
  opacity: 0;
  transform: translateY(18px) scale(0.985);
  transition: opacity 700ms ease, transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform, opacity;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Floating shapes */
@keyframes floaty {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-10px) translateX(6px); }
}
@keyframes floatySlow {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-16px) translateX(-8px); }
}
.animate-float { animation: floaty 6s ease-in-out infinite; }
.animate-float-slow { animation: floatySlow 8.5s ease-in-out infinite; }
</style>
