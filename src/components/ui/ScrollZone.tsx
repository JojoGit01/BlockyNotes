/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        ScrollZone.tsx
 * @description Provides a bounded scroll region with a branded position indicator.
 *
 * @project     BlockyNotes
 * @module      Components / UI
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-05-24
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
import { ReactNode, useMemo, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { getAppPalette } from "@/theme/appPalette";

type ScrollZoneProps = {
  children: ReactNode;
  maxHeight: number;
};

export function ScrollZone({ children, maxHeight }: ScrollZoneProps) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const canScroll = contentHeight > layoutHeight + 1;
  const thumb = useMemo(() => {
    if (!canScroll || layoutHeight <= 0 || contentHeight <= 0) {
      return { height: 0, top: 0 };
    }

    const trackHeight = Math.max(layoutHeight - 8, 0);
    const height = Math.max((layoutHeight / contentHeight) * trackHeight, 28);
    const maxTop = Math.max(trackHeight - height, 0);
    const top = Math.min((scrollY / Math.max(contentHeight - layoutHeight, 1)) * maxTop, maxTop);

    return { height, top };
  }, [canScroll, contentHeight, layoutHeight, scrollY]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollY(event.nativeEvent.contentOffset.y);
  };

  return (
    <View
      style={{
        maxHeight,
        overflow: "hidden",
        position: "relative"
      }}
    >
      <ScrollView
        nestedScrollEnabled
        onContentSizeChange={(_, height) => setContentHeight(height)}
        onLayout={(event) => setLayoutHeight(event.nativeEvent.layout.height)}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={{ maxHeight }}
        contentContainerStyle={{ paddingRight: 14 }}
      >
        {children}
      </ScrollView>

      {canScroll ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 4,
            right: 2,
            bottom: 4,
            width: 5,
            borderRadius: 999,
            backgroundColor: palette.isDark ? "rgba(255,255,255,0.12)" : "#EEF1F7"
          }}
        >
          <View
            style={{
              position: "absolute",
              top: thumb.top,
              right: 0,
              width: 5,
              height: thumb.height,
              borderRadius: 999,
              backgroundColor: theme.mode === "dark" ? "#8EA2FF" : "#4F6EF7"
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
