import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/useTheme";

interface ScreenContainerProps extends PropsWithChildren {
  scrollable?: boolean;
}

export function ScreenContainer({ children, scrollable = false }: ScreenContainerProps) {
  const theme = useTheme();
  const content = <View style={{ flex: 1, padding: theme.spacing.lg }}>{children}</View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {scrollable ? (
        <ScrollView contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
