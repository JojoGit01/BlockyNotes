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
          backgroundColor: isDark ? "transparent" : "#F7F6F3",
          opacity: isDark ? 0 : 0.58
        }}
      />

      {!isDark ? (
        <>
          <SoftHalo color="#EEE6FF" right={-520} top={-250} size={940} opacity={0.16} />
          <SoftHalo color="#F1EAFF" right={-430} top={-140} size={760} opacity={0.14} />
          <SoftHalo color="#F6F1FF" right={-335} top={-22} size={560} opacity={0.12} />
          <SoftHalo color="#F9F6FF" right={-245} top={90} size={380} opacity={0.1} />

          <SoftHalo color="#DDF7FF" left={-560} bottom={-260} size={980} opacity={0.18} />
          <SoftHalo color="#E8FAFF" left={-465} bottom={-120} size={780} opacity={0.16} />
          <SoftHalo color="#F1FCFF" left={-355} bottom={30} size={560} opacity={0.14} />
          <SoftHalo color="#F8FEFF" left={-245} bottom={172} size={360} opacity={0.12} />

          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backgroundColor: "#FFFFFF",
              opacity: 0.12
            }}
          />
        </>
      ) : null}
    </View>
  );
}
