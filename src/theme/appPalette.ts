import type { getAppTheme } from "@/theme";

type AppTheme = ReturnType<typeof getAppTheme>;

export const getAppPalette = (theme: AppTheme) => {
  const isDark = theme.mode === "dark";

  return {
    isDark,
    navy: "#0F1B3A",
    text: isDark ? "#FFFFFF" : "#0F1B3A",
    textStrong: isDark ? "#FFFFFF" : "#071736",
    textMuted: isDark ? "#B8C4DC" : "#8D8F99",
    surface: isDark ? "#17264A" : "#FFFFFF",
    surfaceStrong: isDark ? "#1B2C55" : "#FFFFFF",
    surfaceMuted: isDark ? "#21325C" : "#F2F4F8",
    subtle: isDark ? "#263764" : "#F4F5F9",
    chip: isDark ? "#263764" : "#F3F0EC",
    border: isDark ? "#30426F" : "#F0ECE7",
    divider: isDark ? "#30426F" : "#E8E9EE",
    shadow: isDark ? "#050A16" : "#0F172A",
    placeholder: isDark ? "#9EABC4" : "#767A82",
    inverseText: "#FFFFFF",
    primary: "#0F1B3A"
  };
};
