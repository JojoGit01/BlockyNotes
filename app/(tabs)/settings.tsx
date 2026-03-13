import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useSettingsStore } from "@/store/useSettingsStore";

function SettingsRow({
  icon,
  title,
  subtitle,
  accentColor,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  accentColor: string;
  onPress?: () => void;
}) {
  const theme = useTheme();

  return (
    <AppCard
      onPress={onPress}
      style={{
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF"
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            backgroundColor: "#F4F1EE",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name={icon} size={18} color={accentColor} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[theme.typography.body, { color: "#7E8696", marginTop: 2 }]}>{subtitle}</Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color="#A89D95" />
      </View>
    </AppCard>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const settings = useSettingsStore((state) => state.settings);
  const updateDisplayName = useSettingsStore((state) => state.updateDisplayName);
  const updateTheme = useSettingsStore((state) => state.updateTheme);
  const updateSortOrder = useSettingsStore((state) => state.updateSortOrder);
  const [displayNameDraft, setDisplayNameDraft] = useState(settings.displayName);

  useEffect(() => {
    setDisplayNameDraft(settings.displayName);
  }, [settings.displayName]);

  const themeSubtitle =
    settings.theme === "dark"
      ? "Dark premium"
      : settings.theme === "light"
        ? "Light premium"
        : "Systeme auto";

  const sortSubtitle =
    settings.sortOrder === "title-asc"
      ? "Tri alphabetique"
      : settings.sortOrder === "updatedAt-asc"
        ? "Plus ancien"
        : "Plus recent";

  const saveDisplayName = () => {
    if (displayNameDraft !== settings.displayName) {
      void updateDisplayName(displayNameDraft);
    }
  };

  return (
    <ScreenContainer scrollable>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 120 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                theme.typography.caption,
                { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
              ]}
            >
              Personnalisation
            </Text>
            <Text
              style={[
                theme.typography.h1,
                { color: theme.colors.text, marginTop: theme.spacing.sm, fontSize: 38, lineHeight: 44 }
              ]}
            >
              Parametres
            </Text>
          </View>

          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: "#F4F1EE",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="settings-outline" size={18} color={theme.colors.text} />
          </View>
        </View>

        <AppCard
          style={{
            borderRadius: 28,
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: "#FFFFFF"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: "#8B5CF6",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={[theme.typography.h3, { color: "#FFFFFF" }]}>B</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{settings.displayName}</Text>
              <Text style={[theme.typography.body, { color: "#7E8696", marginTop: 2 }]}>
                Ton espace de notes personnel
              </Text>
            </View>

            <Ionicons name="heart" size={14} color="#A855F7" />
          </View>

          <View style={{ marginTop: 14 }}>
            <AppInput
              label="Nom affiche"
              value={displayNameDraft}
              onChangeText={setDisplayNameDraft}
              onBlur={saveDisplayName}
              onSubmitEditing={saveDisplayName}
              placeholder="Ton nom"
              style={{
                minHeight: 48,
                borderRadius: 18,
                backgroundColor: "#FAF8F5",
                borderColor: "#ECE5DF"
              }}
            />
          </View>
        </AppCard>

        <SettingsRow
          icon="color-palette-outline"
          title="Theme"
          subtitle={themeSubtitle}
          accentColor="#F97316"
          onPress={() =>
            void updateTheme(
              settings.theme === "system"
                ? "light"
                : settings.theme === "light"
                  ? "dark"
                  : "system"
            )
          }
        />

        <SettingsRow
          icon="cloud-outline"
          title="Sauvegarde"
          subtitle="Activee"
          accentColor="#0F172A"
        />

        <SettingsRow
          icon="notifications-outline"
          title="Notifications"
          subtitle="Desactivees"
          accentColor="#F59E0B"
        />

        <SettingsRow
          icon="download-outline"
          title="Exporter mes notes"
          subtitle="PDF, texte brut"
          accentColor="#0F172A"
          onPress={() =>
            void updateSortOrder(
              settings.sortOrder === "updatedAt-desc"
                ? "title-asc"
                : settings.sortOrder === "title-asc"
                  ? "updatedAt-asc"
                  : "updatedAt-desc"
            )
          }
        />

        <SettingsRow
          icon="information-circle-outline"
          title="A propos de l'app"
          subtitle="Version, support, confidentialite"
          accentColor="#8B5CF6"
          onPress={() => router.push("../settings/about")}
        />

        <AppCard
          style={{
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: "#FBFAF8"
          }}
        >
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Tri actuel</Text>
          <Text style={[theme.typography.body, { color: "#7E8696", marginTop: 6 }]}>{sortSubtitle}</Text>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
