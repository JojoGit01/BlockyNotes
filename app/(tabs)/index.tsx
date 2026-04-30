import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { CollectionNoteCard } from "@/components/ui/CollectionNoteCard";
import { useTheme } from "@/hooks/useTheme";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const notes = useNotesStore((state) => state.notes);
  const folders = useFoldersStore((state) => state.folders);
  const displayName = useSettingsStore((state) => state.settings.displayName);
  const visibleDisplayName = displayName === "BlockyNotes User" ? "" : displayName.trim();
  const activeNotes = notes.filter((note) => !note.isDeleted && !note.isArchived);
  const pinnedNotes = activeNotes
    .filter((note) => note.isPinned)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);
  const favoriteNotes = notes.filter((note) => !note.isDeleted && !note.isArchived && note.isFavorite);
  const archivedCount = notes.filter((note) => note.isArchived && !note.isDeleted).length;
  const recentNotes = [...notes]
    .filter((note) => !note.isDeleted)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);
  const floatingButtonBottom = insets.bottom + 90;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: floatingButtonBottom + 110 }}>
        <View style={{ gap: theme.spacing.lg }}>
        <View style={{ paddingTop: theme.spacing.sm }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: theme.spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
                ]}
              >
                Bonjour
              </Text>
              {visibleDisplayName ? (
                <Text
                  style={[
                    theme.typography.h1,
                    { color: theme.colors.text, marginTop: theme.spacing.xs, fontSize: 34, lineHeight: 38 }
                  ]}
                >
                  {visibleDisplayName}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={() => router.push("/settings")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 18,
                backgroundColor: "#F4F1EE",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="person-circle-outline" size={23} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>

        <AppCard
          style={{
            backgroundColor: "#111C34",
            borderColor: "#1B2743",
            borderRadius: 24,
            paddingHorizontal: 16,
            paddingVertical: 14
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
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
                <Text style={[theme.typography.h3, { color: "#FFFFFF", marginTop: 1 }]}>BlockyNotes</Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: "#2A354D",
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 14
              }}
            >
              <Text style={[theme.typography.caption, { color: "#FFFFFF" }]}>Aujourd&apos;hui</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <Text style={[theme.typography.h1, { color: "#FFFFFF", fontSize: 30, lineHeight: 32 }]}>
              {activeNotes.length}
            </Text>
            <Text style={[theme.typography.body, { color: "#D5DEF0", paddingBottom: 4 }]}>notes actives</Text>
          </View>
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

        {pinnedNotes.length > 0 ? (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Epingles</Text>
              <Ionicons name="pin" size={16} color="#B5A89C" />
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              {pinnedNotes.map((note) => (
                <CollectionNoteCard key={note.id} note={note} />
              ))}
            </View>
          </>
        ) : null}

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Recemment modifiees</Text>
          <Text onPress={() => router.push("/notes")} style={[theme.typography.body, { color: "#AA9F97" }]}>
            Voir tout
          </Text>
        </View>

        {recentNotes.length > 0 ? (
          <View style={{ gap: theme.spacing.sm }}>
            {recentNotes.map((note) => {
              const noteIcon = getNoteIcon(note);

              return (
                <AppCard
                  key={note.id}
                  style={{
                    borderRadius: 20,
                    backgroundColor: "#FFFFFF",
                    paddingVertical: 14,
                    paddingHorizontal: 14
                  }}
                  onPress={() => router.push(`/notes/${note.id}`)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: noteIcon.backgroundColor,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Ionicons name={noteIcon.icon} size={15} color={noteIcon.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[theme.typography.h3, { color: theme.colors.text }]} numberOfLines={1}>
                        {note.title || "Sans titre"}
                      </Text>
                      <Text style={[theme.typography.body, { color: "#6F7684", marginTop: 2 }]} numberOfLines={1}>
                        {note.content || "Creer une app de notes personnelle, rapide et agreable."}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#B5A89C" />
                  </View>
                </AppCard>
              );
            })}
          </View>
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
          width: 58,
          height: 58,
          borderRadius: 22,
          backgroundColor: "#0F1B3A",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#0F172A",
          shadowOpacity: 0.16,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8
        }}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}
