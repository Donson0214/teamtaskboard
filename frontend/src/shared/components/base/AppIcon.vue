<template>
  <component :is="iconComponent" :class="iconClass" v-bind="passthroughAttrs" aria-hidden="true" />
</template>

<script setup>
import { computed, useAttrs } from "vue";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
  ArrowUpTrayIcon,
  ArrowsRightLeftIcon,
  AtSymbolIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  BellIcon,
  BoltIcon,
  BugAntIcon,
  CalendarIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  FolderIcon,
  FolderOpenIcon,
  HomeIcon,
  ListBulletIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MoonIcon,
  PaintBrushIcon,
  PaperClipIcon,
  PencilSquareIcon,
  PlayIcon,
  PlusIcon,
  RectangleGroupIcon,
  RocketLaunchIcon,
  ShareIcon,
  ShieldCheckIcon,
  SignalIcon,
  StarIcon,
  SunIcon,
  TableCellsIcon,
  TagIcon,
  TrashIcon,
  UserGroupIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  icon: { type: String, default: "" },
  name: { type: String, default: "" },
});

const attrs = useAttrs();

const normalizeToken = (value) => {
  if (!value) return "";
  const parts = String(value).trim().split(/\s+/);
  const faToken = parts.find(
    (part) =>
      part.startsWith("fa-") &&
      part !== "fa-solid" &&
      part !== "fa-regular" &&
      part !== "fa-brands"
  );
  return (faToken || parts[0] || "").toLowerCase();
};

const iconKey = computed(() => normalizeToken(props.name || props.icon));

const ICON_MAP = new Map([
  ["fa-bars", Bars3Icon],
  ["fa-search", MagnifyingGlassIcon],
  ["fa-sun", SunIcon],
  ["fa-moon", MoonIcon],
  ["fa-clock", ClockIcon],
  ["fa-chevron-down", ChevronDownIcon],
  ["fa-chevron-left", ChevronLeftIcon],
  ["fa-chevron-right", ChevronRightIcon],
  ["fa-adjust", AdjustmentsHorizontalIcon],
  ["fa-sign-out-alt", ArrowRightOnRectangleIcon],
  ["fa-table", TableCellsIcon],
  ["fa-user-plus", UserPlusIcon],
  ["fa-users", UsersIcon],
  ["fa-user-friends", UserGroupIcon],
  ["fa-user", UserIcon],
  ["fa-user-shield", ShieldCheckIcon],
  ["fa-layer-group", RectangleGroupIcon],
  ["fa-columns", RectangleGroupIcon],
  ["fa-clipboard", ClipboardDocumentListIcon],
  ["fa-clipboard-check", ClipboardDocumentCheckIcon],
  ["fa-folder-open", FolderOpenIcon],
  ["fa-folder", FolderIcon],
  ["fa-handshake", UserGroupIcon],
  ["fa-gauge-high", ChartBarSquareIcon],
  ["fa-house", HomeIcon],
  ["fa-tasks", ListBulletIcon],
  ["fa-comment-dots", ChatBubbleLeftRightIcon],
  ["fa-comments", ChatBubbleLeftRightIcon],
  ["fa-ellipsis-vertical", EllipsisVerticalIcon],
  ["fa-ellipsis-h", EllipsisHorizontalIcon],
  ["fa-eye", EyeIcon],
  ["fa-pen", PencilSquareIcon],
  ["fa-edit", PencilSquareIcon],
  ["fa-trash", TrashIcon],
  ["fa-bolt", BoltIcon],
  ["fa-calendar", CalendarIcon],
  ["fa-calendar-alt", CalendarIcon],
  ["fa-tags", TagIcon],
  ["fa-at", AtSymbolIcon],
  ["fa-clock-rotate-left", ArrowPathIcon],
  ["fa-arrows-alt-h", ArrowsRightLeftIcon],
  ["fa-arrows-left-right", ArrowsRightLeftIcon],
  ["fa-exclamation-triangle", ExclamationTriangleIcon],
  ["fa-play", PlayIcon],
  ["fa-envelope", EnvelopeIcon],
  ["fa-location-dot", MapPinIcon],
  ["fa-lock", LockClosedIcon],
  ["fa-circle-exclamation", ExclamationCircleIcon],
  ["fa-circle-check", CheckCircleIcon],
  ["fa-eye-slash", EyeSlashIcon],
  ["fa-check", CheckIcon],
  ["fa-save", ArrowDownTrayIcon],
  ["fa-heading", DocumentTextIcon],
  ["fa-align-left", Bars3BottomLeftIcon],
  ["fa-signal", SignalIcon],
  ["fa-paperclip", PaperClipIcon],
  ["fa-upload", ArrowUpTrayIcon],
  ["fa-plus", PlusIcon],
  ["fa-list-check", ClipboardDocumentCheckIcon],
  ["fa-shield", ShieldCheckIcon],
  ["fa-crown", StarIcon],
  ["fa-chart-bar", ChartBarIcon],
  ["fa-bell", BellIcon],
  ["fa-bug", BugAntIcon],
  ["fa-rocket", RocketLaunchIcon],
  ["fa-palette", PaintBrushIcon],
  ["fa-cog", Cog6ToothIcon],
  ["fa-project-diagram", ShareIcon],
  ["fa-spinner", ArrowPathIcon],
  ["fa-times", XMarkIcon],
]);

const iconComponent = computed(
  () => ICON_MAP.get(iconKey.value) || QuestionMarkCircleIcon
);

const iconClass = computed(() => {
  const extra = attrs.class;
  return ["inline-block w-[0.9em] h-[0.9em] shrink-0 align-text-bottom", extra];
});

const passthroughAttrs = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});
</script>
