import { PropsWithChildren } from "react";
import { Pressable, ViewStyle } from "react-native";

import { useTheme } from "@/hooks/useTheme";

interface AppCardProps extends PropsWithChildren {
  style?: ViewStyle;
  onPress?: () => void;
}

export function AppCard({ children, style, onPress }: AppCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.lg,
        opacity: pressed ? 0.9 : 1,
        ...style
      })}
    >
      {children}
    </Pressable>
  );
}
