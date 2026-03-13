import { Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.xl,
        alignItems: "center",
        gap: theme.spacing.xs
      }}
    >
      <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[theme.typography.body, { color: theme.colors.textMuted, textAlign: "center" }]}>
        {description}
      </Text>
    </View>
  );
}
