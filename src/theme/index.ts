/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        index.ts
 * @description Exports the public design-system theme contract.
 *
 * @project     BlockyNotes
 * @module      Design System
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-03-13
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
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
