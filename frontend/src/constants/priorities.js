export const PRIORITY_OPTIONS = [
  { label: "Urgent", value: "urgent", color: "#ef4444" },
  { label: "High", value: "high", color: "#f97316" },
  { label: "Medium", value: "medium", color: "#3b82f6" },
  { label: "Low", value: "low", color: "#6366f1" },
];

export const findPriorityOption = (value = "") =>
  PRIORITY_OPTIONS.find((opt) => opt.value === (value || "").toLowerCase()) ||
  PRIORITY_OPTIONS[2];
