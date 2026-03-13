import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";

function AboutRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();

  return (
    <AppCard
      style={{
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF"
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[theme.typography.body, { color: "#8D857E" }]}>{value}</Text>
      </View>
    </AppCard>
  );
}

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer scrollable>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 120 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.lg }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: "#F4F1EE",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
          </Pressable>

          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>A propos</Text>
        </View>

        <AppCard
          style={{
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: "#F7F4FB"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: "#A855F7",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </View>

            <View>
              <Text
                style={[
                  theme.typography.caption,
                  { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
                ]}
              >
                App perso
              </Text>
              <Text style={[theme.typography.h3, { color: theme.colors.text, marginTop: 2 }]}>BlockyNotes</Text>
            </View>
          </View>

          <Text
            style={[
              theme.typography.h1,
              { color: theme.colors.text, marginTop: 18, fontSize: 24, lineHeight: 30 }
            ]}
          >
            BlockyNotes
          </Text>
          <Text
            style={[
              theme.typography.body,
              { color: "#6C7385", marginTop: theme.spacing.md, lineHeight: 30 }
            ]}
          >
            Une app personnelle pour ecrire, trier et retrouver tes idees rapidement.
          </Text>
        </AppCard>

        <View style={{ gap: theme.spacing.md }}>
          <AboutRow label="Version" value="1.0.0 concept" />
          <AboutRow label="Sauvegarde" value="Locale + cloud" />
          <AboutRow label="Confidentialite" value="Notes privees" />
          <AboutRow label="Support" value="contact@blockynotes.app" />
        </View>
      </View>
    </ScreenContainer>
  );
}
