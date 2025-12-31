<template>
  <div
    class="landing min-h-screen w-full overflow-x-hidden relative pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    :data-theme="theme"
    :class="theme === 'dark' ? 'theme-dark' : 'theme-light'"
  >
    <div class="ambient" aria-hidden="true">
      <span class="orb orb-1"></span>
      <span class="orb orb-2"></span>
      <span class="orb orb-3"></span>
      <span class="grid-lines"></span>
    </div>

    <!-- HEADER -->
    <header class="relative z-20">
      <div class="mx-auto max-w-7xl px-4 pt-7 sm:px-6">
        <div class="rounded-[26px] border border-[var(--border)] bg-[var(--glass)] backdrop-blur-xl shadow-[0_16px_80px_rgba(0,0,0,0.35)]">
          <div class="flex items-center justify-between px-4 py-4 sm:px-6">
            <div class="flex items-center gap-3">
              <div
                class="logo-badge grid h-10 w-10 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--glass)] shadow-[0_8px_22px_rgba(15,23,42,0.14)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="logo-spin w-6 h-6 text-[var(--text-strong)]"
                  aria-hidden="true"
                >
                  <path d="M12 2 3 7l9 5 9-5-9-5Z" />
                  <path d="M3 7v10l9 5 9-5V7" />
                  <path d="M12 12v10" />
                </svg>
              </div>
              <div class="leading-tight">
                <div class="text-sm font-semibold text-[var(--text-strong)]">Task Flow</div>
                <div class="text-xs text-[var(--text-muted)]">Manage tasks. Ship faster.</div>
              </div>
            </div>

            <nav class="hidden md:flex items-center gap-8 text-sm text-[var(--text-muted)]">
              <a href="#about" class="hover:text-[var(--text-strong)] transition">About</a>
              <a href="#pricing" class="hover:text-[var(--text-strong)] transition">Pricing</a>
              <a href="#reviews" class="hover:text-[var(--text-strong)] transition">Reviews</a>
              <a href="#contact" class="hover:text-[var(--text-strong)] transition">Contact</a>
            </nav>

            <div class="flex items-center gap-3">
              <!-- THEME TOGGLE -->
              <button
                type="button"
                class="btn-chip group"
                @click="toggleTheme"
                :aria-label="theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
                title="Toggle theme"
              >
                <span class="relative grid place-items-center">
                  <AppIcon
                    v-if="theme === 'dark'"
                    icon="fa-sun"
                    class="text-[12px] transition-transform duration-300 group-hover:rotate-12"
                  />
                  <AppIcon
                    v-else
                    icon="fa-moon"
                    class="text-[12px] transition-transform duration-300 group-hover:-rotate-12"
                  />
                </span>
              </button>

              <button type="button" class="btn-secondary hidden sm:inline-flex" @click="goAuth('login')">
                Sign in
              </button>
              <button type="button" class="btn-primary" @click="goAuth('register')">
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- HERO -->
    <section class="relative z-10">
      <div class="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6">
        <div class="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div class="stagger">
            <div class="eyebrow">Modern planning studio</div>
            <h1 class="hero-title">
              Plan the week in minutes.
              <br />
              Ship the day with calm clarity.
            </h1>
            <p class="hero-subtitle">
              Task Flow keeps planning, conversations, and delivery in one board.
              Set priorities, see progress, and hand off cleanly across teams.
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" class="btn-primary" @click="goAuth('register')">Start free</button>
              <button type="button" class="btn-secondary" @click="scrollTo('#about')">View templates</button>
              <button type="button" class="btn-ghost" @click="goAuth('login')">Book a demo</button>
            </div>

            <div class="mt-10 grid sm:grid-cols-3 gap-4">
              <div v-for="stat in heroStats" :key="stat.label" class="stat-card">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>

            <div class="mt-8 flex flex-wrap gap-2">
              <span v-for="chip in heroChips" :key="chip" class="chip">{{ chip }}</span>
            </div>
          </div>

          <div class="hero-media">
            <div class="media-shell">
              <button
                type="button"
                class="absolute inset-0 z-10"
                @click="goAuth('login')"
                aria-label="Preview locked - login required"
              ></button>
              <img
                :src="previewImage"
                alt="Task Flow board preview"
                class="block w-full h-auto"
                loading="lazy"
              />
              <div class="media-tag">
                <AppIcon icon="fa-lock" class="text-[var(--accent)]" />
                Live board preview
              </div>
              <div class="media-badge">Preview locked - sign in to use the app</div>
            </div>

            <div class="mt-6 grid sm:grid-cols-2 gap-4">
              <div v-for="card in heroSideCards" :key="card.label" class="media-card">
                <img :src="card.src" :alt="card.alt" class="h-40 w-full object-cover" loading="lazy" />
                <div class="media-caption">{{ card.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-14 trust-row">
          <div class="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Teams that run on Task Flow
          </div>
          <div class="trust-logos">
            <span v-for="name in trustNames" :key="name">{{ name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about" class="relative z-10">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div class="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-center">
          <div class="reveal relative">
            <div class="photo-grid">
              <div
                v-for="(item, index) in aboutImages"
                :key="item.label"
                class="photo-card"
                :class="index === 0 ? 'photo-card--tall' : ''"
              >
                <img :src="item.src" :alt="item.alt" class="h-full w-full object-cover" loading="lazy" />
                <div class="photo-caption">{{ item.label }}</div>
              </div>
            </div>
            <div class="stat-float">
              <div class="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Weekly rhythm</div>
              <div class="mt-2 text-3xl font-semibold text-[var(--text-strong)]">12 hrs</div>
              <div class="text-xs text-[var(--text-muted)]">Saved per team</div>
            </div>
          </div>

          <div class="reveal">
            <div class="eyebrow">Workspaces, not chaos</div>
            <h2 class="section-title">Your team's work stays visible, organized, and calm.</h2>
            <p class="section-body">
              Create workspaces for product, client, or ops. Assign owners, connect files,
              and keep status visible across every stage.
            </p>

            <div class="mt-8 grid sm:grid-cols-2 gap-4">
              <FeatureCard icon="fa-columns" title="Kanban boards" text="Move tasks in seconds with clean handoffs." />
              <FeatureCard icon="fa-bolt" title="Fast workflows" text="Less clutter. Clear priorities. Better focus." />
              <FeatureCard icon="fa-users" title="Team-ready" text="Mentions, updates, and shared context." />
              <FeatureCard icon="fa-shield" title="Access control" text="Role-based permissions from day one." />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- GALLERY -->
    <section class="relative z-10">
      <div class="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 reveal">
          <div>
            <div class="eyebrow">Visual workflow</div>
            <h2 class="section-title">A calm surface for busy teams.</h2>
            <p class="section-body">
              From product planning to client delivery, keep every lane visible.
            </p>
          </div>
          <button class="btn-secondary" @click="go('/register')">Browse templates</button>
        </div>

        <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div v-for="card in galleryImages" :key="card.title" class="gallery-card">
            <img :src="card.src" :alt="card.alt" class="h-52 w-full object-cover" loading="lazy" />
            <div class="gallery-caption">
              <div class="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">{{ card.tag }}</div>
              <div class="mt-2 text-sm font-semibold text-[var(--text-strong)]">{{ card.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- VIDEO DEMO -->
    <section class="relative z-10">
      <div class="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div class="reveal rounded-[32px] border border-[var(--border)] bg-[var(--card)] backdrop-blur-xl overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
          <div class="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-center p-7 sm:p-10">
            <div>
              <div class="eyebrow">Product tour</div>
              <h3 class="section-title">Inside the board</h3>
              <p class="section-body">
                A short walkthrough of how teams plan, assign, and ship. The preview remains locked until sign in.
              </p>
              <ul class="mt-6 space-y-3 text-sm text-[var(--text-muted)]">
                <li class="flex items-start gap-2">
                  <AppIcon icon="fa-check" class="text-[var(--accent)] mt-0.5" />
                  Drag tasks across stages with clear ownership
                </li>
                <li class="flex items-start gap-2">
                  <AppIcon icon="fa-check" class="text-[var(--accent)] mt-0.5" />
                  Keep standups tight with real-time status updates
                </li>
                <li class="flex items-start gap-2">
                  <AppIcon icon="fa-check" class="text-[var(--accent)] mt-0.5" />
                  Highlight blockers before they slow the team
                </li>
              </ul>
              <div class="mt-6 flex flex-wrap gap-3">
                <button class="btn-secondary" @click="go('/login')">Sign in</button>
                <button class="btn-primary" @click="go('/register')">Get started</button>
              </div>
            </div>

            <div class="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-black/40 group">
              <video
                ref="demoVideo"
                class="w-full h-[240px] sm:h-[420px] object-cover"
                autoplay
                muted
                loop
                playsinline
                preload="metadata"
              >
                <source :src="demoVideoSrc" type="video/mp4" />
              </video>

              <div class="pointer-events-none absolute inset-0 bg-black/35"></div>

              <div class="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
                <div class="h-16 w-16 rounded-full border border-white/20 bg-black/50 backdrop-blur grid place-items-center animate-soft-pop">
                  <AppIcon icon="fa-play" class="text-white ml-1" />
                </div>
              </div>

              <div class="pointer-events-none absolute left-5 bottom-5 rounded-full border border-white/10 bg-black/40 backdrop-blur px-4 py-2 text-xs text-white/85">
                <AppIcon icon="fa-lock" class="mr-2 text-[var(--accent)]" />
                Demo only - sign in to interact
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- REVIEWS -->
    <section id="reviews" class="relative z-10">
      <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div class="text-center reveal">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-[var(--text-strong)]">Reviews teams actually agree on</h2>
          <p class="mt-4 text-[var(--text-muted)] max-w-2xl mx-auto">
            Clean workflow. Fast updates. Clear ownership. Fewer "what is the status?" meetings.
          </p>
        </div>

        <div class="mt-12 grid md:grid-cols-3 gap-6">
          <TestimonialCard name="Ava - Product" quote="We replaced three tools with one board. Everyone knows what is next." />
          <TestimonialCard name="Noah - Engineering" quote="The workflow is simple, fast, and does not fight you. It just works." />
          <TestimonialCard name="Mia - Operations" quote="Tasks, owners, and deadlines are obvious now. The team ships faster." />
        </div>
      </div>
    </section>

    <!-- PRICING -->
    <section id="pricing" class="relative z-10">
      <div class="mx-auto max-w-7xl px-4 pb-28 sm:px-6">
        <div class="text-center reveal">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-[var(--text-strong)]">Pricing</h2>
          <p class="mt-4 text-[var(--text-muted)] max-w-2xl mx-auto">
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
      <div class="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div class="reveal rounded-[32px] border border-[var(--border)] bg-[var(--card)] backdrop-blur-xl shadow-[0_24px_120px_rgba(0,0,0,0.35)] overflow-hidden">
          <div class="px-8 sm:px-12 py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h3 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-strong)]">
                Start organizing your team today.
              </h3>
              <p class="mt-3 text-[var(--text-muted)] max-w-xl">
                The preview is locked - create an account to unlock your boards, tasks, and team workflow.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button class="btn-primary w-full sm:w-auto" @click="go('/register')">Get started free</button>
              <button class="btn-secondary w-full sm:w-auto" @click="go('/login')">Sign in</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT -->
    <section id="contact" class="relative z-10">
      <div class="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div class="grid lg:grid-cols-2 gap-10 items-start">
          <div class="reveal">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-[var(--text-strong)]">Contact</h2>
            <p class="mt-4 text-[var(--text-muted)]">
              Want a custom plan, onboarding, or questions? Send a message - we will reply fast.
            </p>

            <div class="mt-7 space-y-3 text-[var(--text-muted)] text-sm">
              <div class="flex items-center gap-3">
                <span class="h-9 w-9 rounded-xl border border-[var(--border)] bg-[var(--glass)] grid place-items-center">
                  <AppIcon icon="fa-envelope" class="text-[var(--text-strong)]/70" />
                </span>
                <span>support@taskflow.app</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="h-9 w-9 rounded-xl border border-[var(--border)] bg-[var(--glass)] grid place-items-center">
                  <AppIcon icon="fa-location-dot" class="text-[var(--text-strong)]/70" />
                </span>
                <span>Remote-friendly</span>
              </div>
            </div>
          </div>

          <div class="reveal rounded-[26px] border border-[var(--border)] bg-[var(--card)] backdrop-blur-xl p-6 sm:p-8">
            <div class="text-sm font-semibold text-[var(--text-strong)]/85">Send a message</div>
            <div class="mt-5 space-y-4">
              <input
                class="w-full rounded-xl border border-[var(--border)] bg-[var(--glass)] px-4 py-3 text-sm outline-none placeholder:text-[var(--text-muted)]/60 text-[var(--text-strong)] focus:border-[var(--accent)]"
                placeholder="Your name"
              />
              <input
                class="w-full rounded-xl border border-[var(--border)] bg-[var(--glass)] px-4 py-3 text-sm outline-none placeholder:text-[var(--text-muted)]/60 text-[var(--text-strong)] focus:border-[var(--accent)]"
                placeholder="Email"
              />
              <textarea
                class="w-full min-h-[120px] rounded-xl border border-[var(--border)] bg-[var(--glass)] px-4 py-3 text-sm outline-none placeholder:text-[var(--text-muted)]/60 text-[var(--text-strong)] focus:border-[var(--accent)]"
                placeholder="Message"
              ></textarea>

              <button class="btn-primary w-full rounded-xl" @click="go('/register')">
                Send (requires account)
              </button>

              <div class="text-xs text-[var(--text-muted)]">
                This form is for design only - submit requires an account.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="relative z-10 border-t border-[var(--border)]">
      <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between text-sm text-[var(--text-muted)]">
        <div class="flex items-center gap-3">
          <div class="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--glass)] border border-[var(--border)]">
            <span class="text-xs font-extrabold text-[var(--text-strong)]">TF</span>
          </div>
          <div class="leading-tight">
            <div class="font-semibold text-[var(--text-strong)]/80">Task Flow</div>
            <div class="text-xs text-[var(--text-muted)]">Copyright {{ new Date().getFullYear() }} All rights reserved</div>
          </div>
        </div>

        <div class="flex flex-wrap gap-5">
          <a href="#about" class="hover:text-[var(--text-strong)] transition">About</a>
          <a href="#pricing" class="hover:text-[var(--text-strong)] transition">Pricing</a>
          <a href="#reviews" class="hover:text-[var(--text-strong)] transition">Reviews</a>
          <a href="#contact" class="hover:text-[var(--text-strong)] transition">Contact</a>
          <button class="hover:text-[var(--text-strong)] transition" @click="go('/login')">Login</button>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, h, defineComponent, resolveComponent } from "vue";
import { useRouter } from "vue-router";
import previewImage from "@/assets/img/db.jpg";
import heroImage from "@/assets/img/b1.png";
import demoVideoSrc from "@/assets/video/bgv.mp4";

const router = useRouter();
const heroStats = [
  { value: "48%", label: "Faster handoffs" },
  { value: "3x", label: "Clearer ownership" },
  { value: "95%", label: "Weekly visibility" },
];
const heroChips = ["No credit card", "4 minute setup", "Live in your browser"];
const heroSideCards = [
  { src: heroImage, alt: "Task Flow sprint overview", label: "Sprint health" },
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    alt: "Team collaborating at a table",
    label: "Team sync",
  },
];
const trustNames = ["Northwind", "Harbor", "Mosaic", "Canyon", "Studio 54", "Brightlane"];
const aboutImages = [
  {
    src: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80",
    alt: "Design team planning session",
    label: "Planning room",
  },
  { src: previewImage, alt: "Task board preview", label: "Board view" },
  {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    alt: "Focused work on a laptop",
    label: "Focus time",
  },
];
const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    alt: "Team workshop session",
    tag: "Product",
    title: "Roadmap studio",
  },
  {
    src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    alt: "Notes and planning desk",
    tag: "Operations",
    title: "Service desk",
  },
  {
    src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
    alt: "Creative workspace",
    tag: "Creative",
    title: "Content pipeline",
  },
  {
    src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
    alt: "Team presentation",
    tag: "Delivery",
    title: "Client launch",
  },
];

/* -----------------------------
   THEME (dark / light)
--------------------------------*/
const theme = ref("dark"); // 'dark' | 'light'
const THEME_KEY = "ttb_theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(next) {
  theme.value = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch (_) {}
}

function toggleTheme() {
  applyTheme(theme.value === "dark" ? "light" : "dark");
}

/* -----------------------------
   ROUTING HELPERS
--------------------------------*/
function go(path) {
  try {
    router.push(path);
  } catch (_) {
    window.location.href = path;
  }
}

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

/* -----------------------------
   REVEAL ON SCROLL
--------------------------------*/
let observer;

/* -----------------------------
   VIDEO (pause offscreen)
--------------------------------*/
const demoVideo = ref(null);
let videoIO;

onMounted(() => {
  // Initialize theme (persisted > system)
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") applyTheme(saved);
    else applyTheme(getSystemTheme());
  } catch (_) {
    applyTheme(getSystemTheme());
  }

  // Reveal observer
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

  // Pause demo video offscreen
  if (demoVideo.value) {
    videoIO = new IntersectionObserver(([entry]) => {
      const v = demoVideo.value;
      if (!v) return;
      if (entry.isIntersecting) {
        // attempt play (may be blocked in some browsers if policy changes)
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    }, { threshold: 0.2 });
    videoIO.observe(demoVideo.value);
  }
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
  if (videoIO) videoIO.disconnect();
});

/** Small local components (same SFC) */
const FeatureCard = defineComponent({
  name: "FeatureCard",
  props: { icon: String, title: String, text: String },
  setup(props) {
    const Icon = resolveComponent("AppIcon");
    return () =>
      h(
        "div",
        {
          class:
            "group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 backdrop-blur hover:bg-[var(--card-hover)] transition",
        },
        [
          h("div", { class: "flex items-start gap-3" }, [
            h(
              "div",
              {
                class:
                  "h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--glass)] grid place-items-center text-[var(--text-strong)]/75 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105",
              },
              [h(Icon, { icon: props.icon || "", class: "text-base" })]
            ),
            h("div", [
              h("div", { class: "text-sm font-semibold text-[var(--text-strong)]/85" }, props.title),
              h("div", { class: "mt-1 text-sm text-[var(--text-muted)] leading-relaxed" }, props.text),
            ]),
          ]),
        ]
      );
  },
});

const TestimonialCard = defineComponent({
  name: "TestimonialCard",
  props: { name: String, quote: String },
  setup(props) {
    return () =>
      h(
        "div",
        {
          class:
            "reveal rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 backdrop-blur hover:bg-[var(--card-hover)] transition",
        },
        [
          h(
            "div",
            { class: "text-[var(--text-strong)]/80 text-sm leading-relaxed" },
            `"${props.quote || ""}"`
          ),
          h("div", { class: "mt-4 text-xs text-[var(--text-muted)]" }, props.name),
        ]
      );
  },
});

const PricingCard = defineComponent({
  name: "PricingCard",
  emits: ["action"],
  props: { plan: String, price: String, tag: String, features: Array, button: String, highlight: Boolean },
  setup(props, { emit }) {
    const Icon = resolveComponent("AppIcon");
    return () => {
      const containerClass = props.highlight
        ? "border-[var(--accent)] bg-[var(--card)] ring-1 ring-[var(--accent)] shadow-[0_18px_60px_rgba(15,23,42,0.18)]"
        : "border-[var(--border)] bg-[var(--card)]";
      const buttonClass = props.highlight
        ? "bg-[var(--accent)] text-white hover:opacity-90"
        : "border border-[var(--border)] bg-[var(--glass)] text-[var(--text-strong)]/85 hover:bg-[var(--card-hover)]";

      return h(
        "div",
        {
          class: 'reveal rounded-3xl border p-7 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 ' + containerClass,
        },
        [
          h("div", { class: "flex items-start justify-between gap-3" }, [
            h("div", [
              h("div", { class: "text-sm font-semibold text-[var(--text-strong)]/90" }, props.plan),
              h("div", { class: "mt-1 text-xs text-[var(--text-muted)]" }, props.tag),
            ]),
            props.highlight
              ? h(
                  "div",
                  {
                    class:
                      "text-xs rounded-full border border-[var(--accent)] bg-[var(--card-hover)] px-3 py-1 text-[var(--accent)]",
                  },
                  "Popular"
                )
              : null,
          ]),
          h("div", { class: "mt-6 flex items-end gap-2" }, [
            h("div", { class: "text-4xl font-extrabold tracking-tight text-[var(--text-strong)]" }, props.price),
            h("div", { class: "text-sm text-[var(--text-muted)] mb-1" }, "/ mo"),
          ]),
          h(
            "ul",
            { class: "mt-6 space-y-3 text-sm text-[var(--text-muted)]" },
            (props.features || []).map((f, i) =>
              h("li", { class: "flex items-start gap-2", key: i }, [
                h(Icon, { icon: "fa-check", class: "text-[var(--accent)] mt-1" }),
                h("span", f),
              ])
            )
          ),
          h(
            "button",
            {
              type: "button",
              class: 'mt-7 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition btn-press ' + buttonClass,
              onClick: () => emit("action"),
            },
            props.button
          ),
        ]
      );
    };
  },
});

watch(theme, (t) => {
  // optional: could hook analytics, etc.
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Sora:wght@400;500;600;700&display=swap');

/* -----------------------------
   THEME TOKENS (CSS variables)
--------------------------------*/
.theme-dark {
  --bg: #0f1412;
  --text-strong: rgba(248, 250, 252, 0.96);
  --text-muted: rgba(148, 163, 184, 0.82);
  --border: rgba(148, 163, 184, 0.2);
  --glass: rgba(15, 23, 42, 0.6);
  --card: rgba(17, 24, 39, 0.75);
  --card-hover: rgba(30, 41, 59, 0.85);
  --panel: rgba(2, 6, 23, 0.55);
  --accent: #2dd4bf;
  --accent-strong: #14b8a6;
  --accent-soft: rgba(45, 212, 191, 0.18);
  background: var(--bg);
  color: var(--text-strong);
}

.theme-light {
  --bg: #f4f1eb;
  --text-strong: rgba(17, 24, 39, 0.95);
  --text-muted: rgba(71, 85, 105, 0.82);
  --border: rgba(15, 23, 42, 0.12);
  --glass: rgba(255, 255, 255, 0.78);
  --card: rgba(255, 255, 255, 0.95);
  --card-hover: rgba(255, 255, 255, 1);
  --panel: rgba(255, 255, 255, 0.95);
  --accent: #0f766e;
  --accent-strong: #0f5f56;
  --accent-soft: rgba(15, 118, 110, 0.12);
  background: var(--bg);
  color: var(--text-strong);
}

.landing {
  font-family: "Sora", sans-serif;
  background: var(--bg);
  color: var(--text-strong);
}

.landing h1,
.landing h2,
.landing h3,
.landing .font-display {
  font-family: "Fraunces", serif;
  letter-spacing: -0.02em;
}

.ambient {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(70px);
  opacity: 0.55;
}

.orb-1 {
  width: 320px;
  height: 320px;
  top: -80px;
  left: -30px;
  background: rgba(45, 212, 191, 0.3);
}

.orb-2 {
  width: 420px;
  height: 420px;
  bottom: -140px;
  right: -80px;
  background: rgba(244, 114, 182, 0.18);
}

.orb-3 {
  width: 260px;
  height: 260px;
  top: 140px;
  right: 10%;
  background: rgba(14, 165, 233, 0.2);
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 140px 140px;
  opacity: 0.35;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.7rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.eyebrow::before {
  content: "";
  width: 28px;
  height: 2px;
  background: var(--accent);
  border-radius: 9999px;
}

.hero-title {
  font-size: clamp(2.6rem, 4.6vw, 4.6rem);
  font-weight: 700;
  line-height: 1.05;
  color: var(--text-strong);
}

.hero-subtitle {
  margin-top: 1.5rem;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-muted);
}

.section-title {
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 700;
  color: var(--text-strong);
}

.section-body {
  margin-top: 1rem;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-muted);
}

.stat-card {
  border: 1px solid var(--border);
  background: var(--card);
  border-radius: 20px;
  padding: 1rem 1.1rem;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-strong);
}

.stat-label {
  margin-top: 0.35rem;
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.chip {
  border: 1px solid var(--border);
  background: var(--glass);
  border-radius: 9999px;
  padding: 0.35rem 0.9rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.trust-row {
  margin-top: 3.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.trust-logos {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--text-muted);
}

.media-shell {
  position: relative;
  border-radius: 28px;
  border: 1px solid var(--border);
  background: var(--panel);
  overflow: hidden;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.2);
}

.media-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.35);
  padding: 0.35rem 0.8rem;
  font-size: 0.7rem;
  color: #fff;
  pointer-events: none;
}

.media-badge {
  position: absolute;
  inset-x: 16px;
  bottom: 16px;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.35);
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  color: #fff;
  text-align: center;
  pointer-events: none;
}

.media-card {
  border-radius: 22px;
  border: 1px solid var(--border);
  background: var(--card);
  overflow: hidden;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
}

.media-caption {
  padding: 0.75rem 0.9rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-strong);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.photo-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--card);
  min-height: 200px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}

.photo-card--tall {
  grid-row: span 2;
  min-height: 320px;
}

.photo-caption {
  position: absolute;
  left: 14px;
  bottom: 12px;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: rgba(0, 0, 0, 0.35);
  font-size: 0.7rem;
  color: #fff;
}

.stat-float {
  position: absolute;
  right: -10px;
  bottom: -18px;
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--card);
  padding: 1rem 1.2rem;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
}

.gallery-card {
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--card);
  overflow: hidden;
  transition: transform 200ms ease, box-shadow 200ms ease;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.1);
}

.gallery-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.16);
}

.gallery-caption {
  padding: 1rem 1.1rem 1.2rem;
}

@media (max-width: 640px) {
  .photo-grid {
    grid-template-columns: 1fr;
  }

  .photo-card--tall {
    grid-row: auto;
    min-height: 240px;
  }

  .stat-float {
    position: static;
    margin-top: 1rem;
  }

  .trust-logos {
    letter-spacing: 0.16em;
  }
}

/* -----------------------------
   REVEAL ANIMATION
--------------------------------*/
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

/* -----------------------------
   HERO STAGGER
--------------------------------*/
.stagger > * {
  opacity: 0;
  transform: translateY(18px);
  animation: staggerIn 0.85s ease forwards;
}
.stagger > *:nth-child(1) { animation-delay: 0.05s; }
.stagger > *:nth-child(2) { animation-delay: 0.14s; }
.stagger > *:nth-child(3) { animation-delay: 0.24s; }
.stagger > *:nth-child(4) { animation-delay: 0.34s; }

@keyframes staggerIn {
  to { opacity: 1; transform: translateY(0); }
}

/* -----------------------------
   BUTTONS + MICRO INTERACTION
--------------------------------*/
.btn-primary {
  border-radius: 9999px;
  padding: 0.75rem 1.75rem;
  font-size: 0.875rem;
  min-height: 44px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
  transition: transform 120ms ease, filter 180ms ease, box-shadow 180ms ease;
}
.btn-primary:hover {
  filter: brightness(0.96);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.24);
}
.btn-primary:active {
  transform: scale(0.97);
}

.btn-secondary {
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: var(--glass);
  padding: 0.5rem 1.2rem;
  font-size: 0.875rem;
  min-height: 44px;
  color: var(--text-strong);
  transition: transform 120ms ease, background 180ms ease, color 180ms ease;
}
.btn-secondary:hover {
  background: var(--card-hover);
}
.btn-secondary:active { transform: scale(0.98); }

.btn-ghost {
  border-radius: 9999px;
  border: 1px dashed var(--border);
  background: transparent;
  padding: 0.5rem 1.2rem;
  font-size: 0.875rem;
  min-height: 44px;
  color: var(--text-muted);
  transition: transform 120ms ease, background 180ms ease, color 180ms ease;
}
.btn-ghost:hover {
  background: var(--card-hover);
  color: var(--text-strong);
}
.btn-ghost:active { transform: scale(0.98); }

.btn-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  width: 44px;
  border-radius: 9999px;
  border: 1px solid var(--border);
  background: var(--glass);
  color: var(--text-strong);
  transition: transform 120ms ease, background 180ms ease;
}
.btn-chip:hover { background: var(--card-hover); }
.btn-chip:active { transform: scale(0.97); }

.btn-press:active {
  transform: scale(0.98);
}

/* -----------------------------
   LOGO SPIN
--------------------------------*/
.logo-spin {
  animation: logoSpin 6s linear infinite;
  transform-origin: 50% 50%;
  will-change: transform;
}
@keyframes logoSpin {
  to { transform: rotate(360deg); }
}

/* -----------------------------
   PLAY ICON POP
--------------------------------*/
@keyframes softPop {
  0% { transform: scale(0.92); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-soft-pop { animation: softPop 260ms ease both; }

/* -----------------------------
   REDUCED MOTION
--------------------------------*/
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
</style>

