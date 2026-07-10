/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        useTheme.ts
 * @description Resolves the active design theme from application settings.
 *
 * @project     BlockyNotes
 * @module      Core / Hooks
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
import { useColorScheme } from "react-native";

import { useSettingsStore } from "@/store/useSettingsStore";
import { getAppTheme } from "@/theme";

export const useTheme = () => {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((state) => state.settings.theme);

  return getAppTheme(themeMode, systemScheme);
};
