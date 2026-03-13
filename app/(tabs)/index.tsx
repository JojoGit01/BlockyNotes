import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { useTheme } from "@/hooks/useTheme";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const notes = useNotesStore((state) => state.notes);
  const folders = useFoldersStore((state) => state.folders);
  const displayName = useSettingsStore((state) => state.settings.displayName);
  const activeNotes = notes.filter((note) => !note.isDeleted && !note.isArchived);
  const favoriteNotes = notes.filter((note) => !note.isDeleted && !note.isArchived && note.isFavorite);
  const archivedCount = notes.filter((note) => note.isArchived && !note.isDeleted).length;
  const recentNotes = [...notes]
    .filter((note) => !note.isDeleted)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 2);
  const highlightNote = recentNotes[0];
  const floatingButtonBottom = insets.bottom + 90;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: floatingButtonBottom + 110 }}>
        <View style={{ gap: theme.spacing.lg }}>
        <View style={{ paddingTop: theme.spacing.sm }}>
          <View>
            <Text
              style={[
                theme.typography.caption,
                { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
              ]}
            >
              Bonjour
            </Text>
            <Text
              style={[
                theme.typography.h1,
                { color: theme.colors.text, marginTop: theme.spacing.xs, fontSize: 34, lineHeight: 38 }
              ]}
            >
              {displayName}
            </Text>
          </View>
        </View>

        <AppCard
          style={{
            backgroundColor: "#111C34",
            borderColor: "#1B2743",
            borderRadius: 28,
            paddingHorizontal: 18,
            paddingVertical: 16
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: "#A855F7",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: "#8CA0C3", letterSpacing: 3, textTransform: "uppercase" }
                  ]}
                >
                  App perso
                </Text>
                <Text style={[theme.typography.h3, { color: "#FFFFFF", marginTop: 2 }]}>BlockyNotes</Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: "#2A354D",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 14
              }}
            >
              <Text style={[theme.typography.caption, { color: "#FFFFFF" }]}>Aujourd&apos;hui</Text>
            </View>
          </View>

          <Text style={[theme.typography.h1, { color: "#FFFFFF", marginTop: 18, fontSize: 28, lineHeight: 32 }]}>
            {activeNotes.length} notes actives
          </Text>
          <Text
            style={[
              theme.typography.body,
              { color: "#D5DEF0", marginTop: 10, lineHeight: 26 }
            ]}
          >
            Continue la ou tu t&apos;es arrete avec un espace simple et range.
          </Text>
        </AppCard>

        <AppCard style={{ borderRadius: 22, paddingVertical: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {[
              { label: "Notes", value: activeNotes.length },
              { label: "Favoris", value: favoriteNotes.length },
              { label: "Dossiers", value: folders.length },
              { label: "Archives", value: archivedCount }
            ].map((item) => (
              <View key={item.label} style={{ flex: 1, alignItems: "center", gap: 6 }}>
                <Text style={[theme.typography.caption, { color: "#AA9F97" }]}>{item.label}</Text>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </AppCard>

        <AppInput
          placeholder="Rechercher une note, un dossier, un tag..."
          style={{
            borderRadius: 22,
            minHeight: 56,
            paddingHorizontal: 18,
            backgroundColor: "#F9F7F4",
            borderColor: "#ECE5DF"
          }}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Recemment modifiees</Text>
          <Text onPress={() => router.push("/notes")} style={[theme.typography.body, { color: "#AA9F97" }]}>
            Voir tout
          </Text>
        </View>

        {highlightNote ? (
          <AppCard
            style={{
              borderRadius: 24,
              backgroundColor: "#FFFFFF",
              paddingVertical: 16,
              paddingHorizontal: 16
            }}
            onPress={() => router.push(`/notes/${highlightNote.id}`)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#EFE8F7"
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]} numberOfLines={1}>
                  {highlightNote.title || "Sans titre"}
                </Text>
                <Text style={[theme.typography.body, { color: "#6F7684", marginTop: 4 }]} numberOfLines={2}>
                  {highlightNote.content || "Creer une app de notes personnelle, rapide et agreable."}
                </Text>
              </View>
            </View>
          </AppCard>
        ) : (
          <AppCard style={{ borderRadius: 24 }}>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
              Aucune note recente pour le moment.
            </Text>
          </AppCard>
        )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push("/notes/new")}
        style={{
          position: "absolute",
          right: 18,
          bottom: floatingButtonBottom,
          width: 68,
          height: 68,
          borderRadius: 24,
          backgroundColor: "#7C5CFA",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#7C5CFA",
          shadowOpacity: 0.25,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10
        }}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}
