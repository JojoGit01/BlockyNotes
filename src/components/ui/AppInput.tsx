/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        AppInput.tsx
 * @description Provides the design-system text input component.
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
import { Text, TextInput, TextInputProps, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";

interface AppInputProps extends TextInputProps {
  label?: string;
}

export function AppInput({ label, style, ...props }: AppInputProps) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {label ? <Text style={[theme.typography.label, { color: theme.colors.text }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          theme.typography.body,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
            color: theme.colors.text
          },
          style
        ]}
        {...props}
      />
    </View>
  );
}
