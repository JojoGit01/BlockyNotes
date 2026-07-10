/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        SaveStatusIndicator.tsx
 * @description Displays compact dirty, saving, and saved editor states.
 *
 * @project     BlockyNotes
 * @module      Components / UI
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-07-11
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { getAppPalette } from "@/theme/appPalette";

type SaveState = "saved" | "saving" | "dirty";

export function SaveStatusIndicator({ saveState, showSavedLabel }: { saveState: SaveState; showSavedLabel: boolean }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const icon: keyof typeof Ionicons.glyphMap =
    saveState === "saving" ? "cloud-upload-outline" : saveState === "dirty" ? "cloud-outline" : "checkmark-circle";
  const color = saveState === "saving" ? "#4F6EF7" : saveState === "dirty" ? "#D97706" : "#18A058";
  const label = saveState === "saving" ? "Sync..." : saveState === "dirty" ? "A sauvegarder" : showSavedLabel ? "Sauvegarde" : null;
  const accessibilityLabel =
    saveState === "saving" ? "Sauvegarde en cours" : saveState === "dirty" ? "Sauvegarde a venir" : "Note sauvegardee";

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite"
      style={{
        minWidth: 42,
        minHeight: 42,
        paddingHorizontal: label ? 11 : 0,
        borderRadius: 14,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6
      }}
    >
      <Ionicons name={icon} size={15} color={color} />
      {label ? (
        <Text style={[theme.typography.label, { color: palette.text, fontSize: 13 }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
