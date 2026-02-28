// const tintColorLight = '#0D9488'; // teal-600
// const tintColorDark  = '#14B8A6'; // teal-400
const tintColorLight = "#2DAEBF"; // icon blue-teal
const tintColorDark = "#3EC6D8"; // lighter for dark mode

export default {
  light: {
    text: "#111827", // gray-900
    background: "#F9FAFB", // gray-50
    tint: tintColorLight,
    tabIconDefault: "#6B7280", // gray-500
    tabIconSelected: tintColorLight,
    success: "#10B981", // emerald-500
    danger: "#EF4444",
    warning: "#F59E0B",
    muted: "#6B7280", // gray-500
    card: "#FFFFFF",
    border: "#F3F4F6", // gray-100
    chrome: "#FFFFFF",
    chromeText: "#111827",
  },
  dark: {
    text: "#F1F5F9", // slate-100
    background: "#0F172A", // slate-900
    tint: tintColorDark,
    tabIconDefault: "#94A3B8", // slate-400
    tabIconSelected: tintColorDark,
    success: "#10B981",
    danger: "#F87171",
    warning: "#FBBF24",
    muted: "#94A3B8", // slate-400
    card: "#1E293B", // slate-800
    border: "#334155", // slate-700
    chrome: "#0F172A",
    chromeText: "#F1F5F9",
  },
};
