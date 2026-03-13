import { ColorSchemeName } from "react-native";

import { darkColors, lightColors } from "@/theme/colors";
import { radius, spacing, typography } from "@/theme/tokens";
import type { ThemeMode } from "@/types/models";

export const getAppTheme = (themeMode: ThemeMode, systemScheme: ColorSchemeName) => {
  const resolvedMode = themeMode === "system" ? (systemScheme === "dark" ? "dark" : "light") : themeMode;
  const colors = resolvedMode === "dark" ? darkColors : lightColors;

  return {
    mode: resolvedMode,
    colors,
    spacing,
    radius,
    typography,
    statusBarStyle: resolvedMode === "dark" ? "light" : "dark"
  } as const;
};
