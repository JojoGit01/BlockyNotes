/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        updateTheme.ts
 * @description Applies a theme preference to application settings.
 *
 * @project     BlockyNotes
 * @module      Services / Settings
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
import type { AppSettings } from "@/types/models";

export const updateThemeService = (
  settings: AppSettings,
  theme: AppSettings["theme"]
): AppSettings => ({
  ...settings,
  theme
});
