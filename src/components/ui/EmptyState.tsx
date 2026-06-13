import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { getAppPalette } from "@/theme/appPalette";

interface EmptyStateProps {
  actionLabel?: string;
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconBackgroundColor?: string;
  iconColor?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  actionLabel,
  description,
  icon = "document-text-outline",
  iconBackgroundColor,
  iconColor,
  onActionPress,
  title
}: EmptyStateProps) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const showAction = actionLabel && onActionPress;

  return (
    <View
      style={{
        borderRadius: 24,
        padding: theme.spacing.xl,
        alignItems: "center",
        gap: theme.spacing.sm,
        backgroundColor: palette.surface,
        borderWidth: 1,
        borderColor: palette.border,
        shadowColor: palette.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 18,
          backgroundColor: iconBackgroundColor ?? palette.surfaceMuted,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={icon} size={23} color={iconColor ?? palette.text} />
      </View>
      <Text style={[theme.typography.h3, { color: palette.text, textAlign: "center" }]}>{title}</Text>
      <Text style={[theme.typography.body, { color: theme.colors.textMuted, textAlign: "center" }]}>
        {description}
      </Text>
      {showAction ? (
        <Pressable
          onPress={onActionPress}
          style={({ pressed }) => ({
            minHeight: 42,
            borderRadius: 16,
            backgroundColor: "#0F1B3A",
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 4,
            opacity: pressed ? 0.86 : 1
          })}
        >
          <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
