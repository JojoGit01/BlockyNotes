/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        useSettingsStore.ts
 * @description Manages persisted preferences and application security settings.
 *
 * @project     BlockyNotes
 * @module      State Management
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
import { create } from "zustand";

import { updateThemeService } from "@/services/settings/updateTheme";
import { settingsRepository } from "@/storage/repositories";
import type { AppSettings } from "@/types/models";
import type { SettingsState } from "@/types/store";

const defaultSettings: AppSettings = {
  displayName: "BlockyNotes User",
  theme: "system",
  sortOrder: "updatedAt-desc",
  showArchivedOnDashboard: true,
  appLockEnabled: false,
  lockAllNotes: false,
  lockAllFolders: false,
  appLockTimeoutMs: 60000,
  lockCodeHash: null
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  hydrated: false,
  loadSettings: async () => {
    const settings = await settingsRepository.read(defaultSettings);
    set({ settings: { ...defaultSettings, ...settings }, hydrated: true });
  },
  updateDisplayName: async (displayName) => {
    const settings = { ...get().settings, displayName: displayName.trim() || defaultSettings.displayName };
    set({ settings });
    await settingsRepository.write(settings);
  },
  updateTheme: async (theme) => {
    const settings = updateThemeService(get().settings, theme);
    await settingsRepository.write(settings);
    set({ settings });
  },
  updateSortOrder: async (sortOrder) => {
    const settings = { ...get().settings, sortOrder };
    await settingsRepository.write(settings);
    set({ settings });
  },
  updateSecurity: async (updates) => {
    const settings = { ...get().settings, ...updates };
    await settingsRepository.write(settings);
    set({ settings });
  }
}));
