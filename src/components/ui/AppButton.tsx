/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        AppButton.tsx
 * @description Provides the design-system button component and interaction states.
 *
 * @project     BlockyNotes
 * @module      Components / UI
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-03-13
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
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
