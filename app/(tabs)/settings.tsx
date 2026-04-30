import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useSettingsStore } from "@/store/useSettingsStore";

const defaultDisplayName = "BlockyNotes User";

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
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 16
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
    </Pressable>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const settings = useSettingsStore((state) => state.settings);
  const updateDisplayName = useSettingsStore((state) => state.updateDisplayName);
  const updateTheme = useSettingsStore((state) => state.updateTheme);
  const updateSortOrder = useSettingsStore((state) => state.updateSortOrder);
  const visibleDisplayName = settings.displayName === defaultDisplayName ? "" : settings.displayName;
  const [displayNameDraft, setDisplayNameDraft] = useState(visibleDisplayName);

  useEffect(() => {
    setDisplayNameDraft(settings.displayName === defaultDisplayName ? "" : settings.displayName);
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
    if (displayNameDraft !== visibleDisplayName) {
      void updateDisplayName(displayNameDraft);
    }
  };

  return (
    <ScreenContainer scrollable>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 24 }}>
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
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                {visibleDisplayName || "Ton profil"}
              </Text>
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
              placeholder="Ex: User"
              style={{
                minHeight: 48,
                borderRadius: 18,
                backgroundColor: "#FAF8F5",
                borderColor: "#ECE5DF"
              }}
            />
          </View>
        </AppCard>

        <AppCard
          style={{
            borderRadius: 28,
            paddingHorizontal: 16,
            paddingVertical: 4,
            backgroundColor: "#FFFFFF"
          }}
        >
          {[
            {
              icon: "color-palette-outline" as keyof typeof Ionicons.glyphMap,
              title: "Theme",
              subtitle: themeSubtitle,
              accentColor: "#F97316",
              onPress: () =>
                void updateTheme(
                  settings.theme === "system"
                    ? "light"
                    : settings.theme === "light"
                      ? "dark"
                      : "system"
                )
            },
            {
              icon: "cloud-outline" as keyof typeof Ionicons.glyphMap,
              title: "Sauvegarde",
              subtitle: "Activee",
              accentColor: "#0F172A"
            },
            {
              icon: "notifications-outline" as keyof typeof Ionicons.glyphMap,
              title: "Notifications",
              subtitle: "Desactivees",
              accentColor: "#F59E0B"
            },
            {
              icon: "download-outline" as keyof typeof Ionicons.glyphMap,
              title: "Exporter mes notes",
              subtitle: "PDF, texte brut",
              accentColor: "#0F172A",
              onPress: () =>
                void updateSortOrder(
                  settings.sortOrder === "updatedAt-desc"
                    ? "title-asc"
                    : settings.sortOrder === "title-asc"
                      ? "updatedAt-asc"
                      : "updatedAt-desc"
                )
            },
            {
              icon: "swap-vertical-outline" as keyof typeof Ionicons.glyphMap,
              title: "Tri actuel",
              subtitle: sortSubtitle,
              accentColor: "#2563EB"
            },
            {
              icon: "information-circle-outline" as keyof typeof Ionicons.glyphMap,
              title: "A propos de l'app",
              subtitle: "Version, support, confidentialite",
              accentColor: "#8B5CF6",
              onPress: () => router.push("../settings/about")
            }
          ].map((row, index, rows) => (
            <View key={row.title}>
              <SettingsRow
                icon={row.icon}
                title={row.title}
                subtitle={row.subtitle}
                accentColor={row.accentColor}
                onPress={row.onPress}
              />
              {index < rows.length - 1 ? (
                <View style={{ height: 1, backgroundColor: "#F1E8E2", marginLeft: 60 }} />
              ) : null}
            </View>
          ))}
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
