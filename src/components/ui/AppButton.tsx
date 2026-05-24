import { Pressable, Text, ViewStyle } from "react-native";

import { useTheme } from "@/hooks/useTheme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface AppButtonProps {
  title: string;
  onPress?: () => void | Promise<void>;
  variant?: Variant;
  style?: ViewStyle;
  disabled?: boolean;
}

export function AppButton({
  title,
  onPress,
  variant = "primary",
  style,
  disabled = false
}: AppButtonProps) {
  const theme = useTheme();

  const backgroundColor = {
    primary: theme.colors.primary,
    secondary: theme.colors.surfaceMuted,
    ghost: "transparent",
    danger: theme.colors.danger
  }[variant];

  const textColor =
    variant === "secondary" || variant === "ghost" ? theme.colors.text : "#FFFFFF";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor,
        borderWidth: variant === "ghost" ? 1 : 0,
        borderColor: theme.colors.border,
        opacity: pressed || disabled ? 0.8 : 1,
        alignItems: "center",
        ...style
      })}
    >
      <Text style={[theme.typography.label, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}
