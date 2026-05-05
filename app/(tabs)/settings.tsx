import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const defaultDisplayName = "BlockyNotes User";
const navy = "#0F1B3A";

function SectionPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 12,
        backgroundColor: "#E9ECF3",
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: "row",
        alignItems: "center",
        gap: 6
      }}
    >
      <Ionicons name={icon} size={12} color={navy} />
      <Text
        style={[
          theme.typography.caption,
          { color: navy, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: "900", fontSize: 11 }
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function StatCard({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        minHeight: 88,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        padding: 13,
        justifyContent: "space-between",
        shadowColor: "#0F172A",
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 14,
          backgroundColor: iconBackground,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View>
        <Text style={[theme.typography.label, { color: "#071736", fontWeight: "900" }]}>{title}</Text>
        <Text style={[theme.typography.caption, { color: "#8D8F99", marginTop: 1, fontSize: 11 }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

function SettingsRow({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  onPress,
  trailing
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 15,
            backgroundColor: iconBackground,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.h3, { color: "#071736", fontSize: 16, lineHeight: 21, fontWeight: "900" }]}>{title}</Text>
          <Text style={[theme.typography.caption, { color: "#8D8F99", marginTop: 1, fontSize: 12 }]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {trailing ?? <Ionicons name="chevron-forward" size={18} color="#A4A7B0" />}
      </View>
    </Pressable>
  );
}

function SettingsSection({ children, label, icon }: { children: React.ReactNode; label: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View
      style={{
        borderRadius: 24,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#0F172A",
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5
      }}
    >
      <SectionPill icon={icon} label={label} />
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const settings = useSettingsStore((state) => state.settings);
  const updateDisplayName = useSettingsStore((state) => state.updateDisplayName);
  const updateTheme = useSettingsStore((state) => state.updateTheme);
  const notes = useNotesStore((state) => state.notes);
  const activeNotesCount = notes.filter((note) => !note.isDeleted && !note.isArchived).length;
  const visibleDisplayName = settings.displayName === defaultDisplayName ? "Jo" : settings.displayName;
  const [displayNameDraft, setDisplayNameDraft] = useState(visibleDisplayName);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    setDisplayNameDraft(settings.displayName === defaultDisplayName ? "Jo" : settings.displayName);
  }, [settings.displayName]);

  const themeSubtitle =
    settings.theme === "dark" ? "Dark premium" : settings.theme === "light" ? "Light premium" : "Systeme auto";

  const saveDisplayName = () => {
    if (displayNameDraft !== visibleDisplayName) {
      void updateDisplayName(displayNameDraft);
    }
  };

  const cycleTheme = () => {
    void updateTheme(settings.theme === "system" ? "light" : settings.theme === "light" ? "dark" : "system");
  };

  return (
    <ScreenContainer scrollable scrollBottomPadding={96}>
      <View style={{ gap: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, marginLeft: 4 }}>
            <Text
              style={[
                theme.typography.caption,
                { color: navy, letterSpacing: 5, textTransform: "uppercase", fontWeight: "900" }
              ]}
            >
              Personnalisation
            </Text>
              <Text style={{ color: "#071736", marginTop: 2, fontSize: 36, lineHeight: 40, fontWeight: "900" }}>
              Reglages
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("../settings/about")}
            style={({ pressed }) => ({
              width: 52,
              height: 52,
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.82 : 1,
              shadowColor: "#0F172A",
              shadowOpacity: 0.08,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 8
            })}
          >
            <Ionicons name="settings-outline" size={20} color="#071736" />
          </Pressable>
        </View>

        <View
          style={{
            borderRadius: 24,
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            shadowColor: "#0F172A",
            shadowOpacity: 0.06,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 5
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 19,
              backgroundColor: navy,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: navy,
              shadowOpacity: 0.25,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 7
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 26, lineHeight: 31, fontWeight: "900" }}>
              {visibleDisplayName.trim().charAt(0).toUpperCase() || "J"}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <TextInput
              value={displayNameDraft}
              onChangeText={setDisplayNameDraft}
              onBlur={saveDisplayName}
              onSubmitEditing={saveDisplayName}
              placeholder="Ton nom"
              placeholderTextColor="#8D8F99"
              style={{ color: "#071736", fontSize: 22, lineHeight: 27, fontWeight: "900", padding: 0 }}
            />
            <Text style={[theme.typography.caption, { color: "#8D8F99", marginTop: 1 }]}>Ton espace de notes personnel</Text>
          </View>

          <View
            style={{
              borderRadius: 14,
              backgroundColor: "#E9ECF3",
              paddingHorizontal: 11,
              paddingVertical: 8
            }}
          >
            <Text style={[theme.typography.caption, { color: navy, fontWeight: "900" }]}>Premium</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatCard
            icon="create"
            iconColor="#FF6B7A"
            iconBackground="#E9ECF3"
            title={`${activeNotesCount} note${activeNotesCount > 1 ? "s" : ""}`}
            subtitle="Actives aujourd'hui"
          />
          <StatCard
            icon="cloud-done"
            iconColor={navy}
            iconBackground="#EAF0FF"
            title="Synchro OK"
            subtitle="Sauvegarde a l'instant"
          />
        </View>

        <SettingsSection icon="list" label="Preferences">
          <SettingsRow
            icon="color-palette"
            iconColor="#FF6B7A"
            iconBackground="#E9ECF3"
            title="Theme"
            subtitle={themeSubtitle}
            onPress={cycleTheme}
          />
          <View style={{ height: 1, backgroundColor: "#E8E9EE", marginLeft: 54 }} />
          <SettingsRow
            icon="cloud"
            iconColor="#4F6EF7"
            iconBackground="#E4ECFF"
            title="Sauvegarde"
            subtitle={backupEnabled ? "Activee automatiquement" : "Desactivee"}
            trailing={
              <Switch
                value={backupEnabled}
                onValueChange={setBackupEnabled}
                trackColor={{ false: "#D7D8E0", true: navy }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View style={{ height: 1, backgroundColor: "#E8E9EE", marginLeft: 54 }} />
          <SettingsRow
            icon="notifications"
            iconColor="#F59E0B"
            iconBackground="#FFF1DC"
            title="Notifications"
            subtitle="Rappels sur les notes"
            trailing={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D7D8E0", true: navy }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </SettingsSection>

        <SettingsSection icon="sparkles" label="Notes">
          <SettingsRow
            icon="download"
            iconColor="#4F6EF7"
            iconBackground="#D8FAF1"
            title="Exporter mes notes"
            subtitle="PDF, Markdown, texte brut"
            onPress={() => undefined}
          />
          <View style={{ height: 1, backgroundColor: "#E8E9EE", marginLeft: 54 }} />
          <SettingsRow
            icon="lock-closed"
            iconColor="#F97316"
            iconBackground="#FFEAF7"
            title="Verrouillage"
            subtitle="Code ou empreinte pour ouvrir..."
            onPress={() => undefined}
          />
          <View style={{ height: 1, backgroundColor: "#E8E9EE", marginLeft: 54 }} />
          <SettingsRow
            icon="archive"
            iconColor={navy}
            iconBackground="#E9ECF3"
            title="Archives"
            subtitle="Notes archivees"
            onPress={() => router.push("/(tabs)/folders/archives")}
          />
          <View style={{ height: 1, backgroundColor: "#E8E9EE", marginLeft: 54 }} />
          <SettingsRow
            icon="trash-outline"
            iconColor="#FF3434"
            iconBackground="#FFF1DC"
            title="Corbeille"
            subtitle="Notes supprimees recemment"
            onPress={() => router.push("/(tabs)/folders/trash")}
          />
        </SettingsSection>
      </View>
    </ScreenContainer>
  );
}

