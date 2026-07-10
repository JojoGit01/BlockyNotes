/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        AppBackground.tsx
 * @description Renders the shared application background treatment.
 *
 * @project     BlockyNotes
 * @module      Components / UI
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-05-05
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
import { DimensionValue, StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";

function SoftHalo({
  color,
  left,
  right,
  top,
  bottom,
  size,
  opacity
}: {
  color: string;
  left?: DimensionValue;
  right?: DimensionValue;
  top?: DimensionValue;
  bottom?: DimensionValue;
  size: number;
  opacity: number;
}) {
  return (
    <View
      style={{
        position: "absolute",
        left,
        right,
        top,
        bottom,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity
      }}
    />
  );
}

export function AppBackground() {
  const theme = useTheme();
  const isDark = theme.mode === "dark";

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFillObject,
        { backgroundColor: isDark ? theme.colors.background : "#FBFAF8" }
      ]}
    >
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "38%",
          bottom: 0,
          backgroundColor: isDark ? "#101C3B" : "#F7F6F3",
          opacity: 0.58
        }}
      />

      <SoftHalo
        color={isDark ? "#162247" : "#EEE6FF"}
        right={-520}
        top={-250}
        size={940}
        opacity={isDark ? 0.08 : 0.16}
      />
      <SoftHalo
        color={isDark ? "#17244A" : "#F1EAFF"}
        right={-430}
        top={-140}
        size={760}
        opacity={isDark ? 0.065 : 0.14}
      />
      <SoftHalo
        color={isDark ? "#18264D" : "#F6F1FF"}
        right={-335}
        top={-22}
        size={560}
        opacity={isDark ? 0.05 : 0.12}
      />
      <SoftHalo
        color={isDark ? "#192850" : "#F9F6FF"}
        right={-245}
        top={90}
        size={380}
        opacity={isDark ? 0.035 : 0.1}
      />

      <SoftHalo
        color={isDark ? "#102547" : "#DDF7FF"}
        left={-560}
        bottom={-260}
        size={980}
        opacity={isDark ? 0.085 : 0.18}
      />
      <SoftHalo
        color={isDark ? "#10284B" : "#E8FAFF"}
        left={-465}
        bottom={-120}
        size={780}
        opacity={isDark ? 0.07 : 0.16}
      />
      <SoftHalo
        color={isDark ? "#112B4F" : "#F1FCFF"}
        left={-355}
        bottom={30}
        size={560}
        opacity={isDark ? 0.052 : 0.14}
      />
      <SoftHalo
        color={isDark ? "#122E52" : "#F8FEFF"}
        left={-245}
        bottom={172}
        size={360}
        opacity={isDark ? 0.036 : 0.12}
      />

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          backgroundColor: isDark ? "#0F1B3A" : "#FFFFFF",
          opacity: 0.12
        }}
      />
    </View>
  );
}
