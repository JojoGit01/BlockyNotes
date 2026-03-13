import type { AppSettings } from "@/types/models";

export const updateThemeService = (
  settings: AppSettings,
  theme: AppSettings["theme"]
): AppSettings => ({
  ...settings,
  theme
});
