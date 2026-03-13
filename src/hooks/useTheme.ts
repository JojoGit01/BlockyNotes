import { useColorScheme } from "react-native";

import { useSettingsStore } from "@/store/useSettingsStore";
import { getAppTheme } from "@/theme";

export const useTheme = () => {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((state) => state.settings.theme);

  return getAppTheme(themeMode, systemScheme);
};
