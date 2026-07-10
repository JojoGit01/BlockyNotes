/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        AppCard.tsx
 * @description Provides the reusable design-system surface card.
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
