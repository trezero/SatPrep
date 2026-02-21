export const Colors = {
  primary: "#6C5CE7",
  primaryLight: "#A29BFE",
  primaryDark: "#4834D4",
  secondary: "#00CEC9",
  secondaryLight: "#55EFC4",
  accent: "#FD79A8",
  accentLight: "#FAB1D0",
  warning: "#FDCB6E",
  warningDark: "#F39C12",
  success: "#00B894",
  error: "#FF6B6B",
  errorLight: "#FF8787",

  // Neutrals
  background: "#F8F9FE",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F0FA",
  text: "#2D3436",
  textSecondary: "#636E72",
  textLight: "#B2BEC3",
  border: "#E8E8F0",
  borderLight: "#F0F0FA",

  // Level colors
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  diamond: "#B9F2FF",

  // Category colors
  math: "#6C5CE7",
  reading: "#00CEC9",
  writing: "#FD79A8",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  hero: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export function getLevelColor(level: number): string {
  if (level >= 20) return Colors.diamond;
  if (level >= 15) return Colors.gold;
  if (level >= 10) return Colors.silver;
  if (level >= 5) return Colors.bronze;
  return Colors.primary;
}

export function getLevelTitle(level: number): string {
  if (level >= 25) return "SAT Legend";
  if (level >= 20) return "SAT Master";
  if (level >= 15) return "SAT Expert";
  if (level >= 10) return "SAT Scholar";
  if (level >= 7) return "Dedicated Learner";
  if (level >= 5) return "Rising Star";
  if (level >= 3) return "Getting Started";
  return "Newcomer";
}
