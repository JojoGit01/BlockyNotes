import { useSegments } from "expo-router";
import { PropsWithChildren, ReactNode, Ref } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, ScrollViewProps, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/ui/AppBackground";
import { useTheme } from "@/hooks/useTheme";

interface ScreenContainerProps extends PropsWithChildren {
  floatingElement?: ReactNode;
  onScroll?: ScrollViewProps["onScroll"];
  keyboardDismissMode?: ScrollViewProps["keyboardDismissMode"];
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
  scrollEventThrottle?: number;
  scrollRef?: Ref<ScrollView>;
  scrollable?: boolean;
  scrollBottomPadding?: number;
}

export function ScreenContainer({
  children,
  floatingElement,
  keyboardDismissMode,
  keyboardShouldPersistTaps,
  onScroll,
  scrollable = false,
  scrollBottomPadding,
  scrollEventThrottle,
  scrollRef
}: ScreenContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const isInsideTabs = segments[0] === "(tabs)";
  const bottomSafeSpace = Math.max(insets.bottom, Platform.OS === "android" ? 28 : 12);
  const tabBarSafeSpace = isInsideTabs ? 116 : 0;
  const content = (
    <View
      style={{
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.lg + bottomSafeSpace + (scrollable ? 0 : tabBarSafeSpace)
      }}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        style={{ flex: 1 }}
      >
        {scrollable ? (
          <ScrollView
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: scrollBottomPadding ?? theme.spacing.xxl + bottomSafeSpace + tabBarSafeSpace
            }}
            keyboardDismissMode={keyboardDismissMode ?? (Platform.OS === "ios" ? "interactive" : "on-drag")}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps ?? "handled"}
            onScroll={onScroll}
            ref={scrollRef}
            scrollEventThrottle={scrollEventThrottle}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
      {floatingElement}
    </SafeAreaView>
  );
}
