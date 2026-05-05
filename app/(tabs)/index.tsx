import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/ui/AppBackground";
import { useTheme } from "@/hooks/useTheme";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUIStore } from "@/store/useUIStore";
import type { Note } from "@/types/models";

const navy = "#0F1B3A";

const noteDateLabel = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

const noteElementCount = (note: Note) => {
  const count = note.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;

  return Math.max(count, note.title.trim() ? 1 : 0);
};

function StatItem({
  icon,
  color,
  background,
  label,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  label: string;
  value: number;
}) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 13,
          backgroundColor: background,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[theme.typography.caption, { color: "#8D8F99", marginTop: 5, fontWeight: "800", fontSize: 11 }]}>{label}</Text>
      <Text style={{ color: navy, fontSize: 18, lineHeight: 22, fontWeight: "900", marginTop: 1 }}>{value}</Text>
    </View>
  );
}

function HomeNoteRow({ note }: { note: Note }) {
  const theme = useTheme();
  const noteIcon = getNoteIcon(note);
  const elementCount = noteElementCount(note);
  const meta =
    elementCount > 1
      ? `${elementCount} elements - ${noteDateLabel(note.updatedAt)}`
      : `${noteDateLabel(note.updatedAt)} - Mode jour par jour`;

  return (
    <Pressable
      onPress={() => router.push(`/notes/${note.id}`)}
      style={({ pressed }) => ({
        minHeight: 68,
        borderRadius: 20,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: pressed ? 0.88 : 1,
        shadowColor: "#0F172A",
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 16,
          backgroundColor: noteIcon.backgroundColor,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={noteIcon.icon} size={19} color={noteIcon.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[theme.typography.h3, { color: navy, fontSize: 16, lineHeight: 21, fontWeight: "900" }]} numberOfLines={1}>
          {note.title || "Sans titre"}
        </Text>
        <Text style={[theme.typography.caption, { color: "#8D8F99", marginTop: 1 }]} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#A4A7B0" />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const notes = useNotesStore((state) => state.notes);
  const folders = useFoldersStore((state) => state.folders);
  const displayName = useSettingsStore((state) => state.settings.displayName);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const visibleDisplayName = displayName === "BlockyNotes User" ? "Jo" : displayName.trim();
  const activeNotes = notes.filter((note) => !note.isDeleted && !note.isArchived);
  const pinnedNotes = activeNotes
    .filter((note) => note.isPinned)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 2);
  const favoriteNotesCount = activeNotes.filter((note) => note.isFavorite).length;
  const datedNotesCount = activeNotes.filter((note) => note.dailyEntries && note.dailyEntries.length > 0).length;
  const recentNotes = [...activeNotes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
  const floatingButtonBottom = insets.bottom + 90;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBackground />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: floatingButtonBottom + 34 }}>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <View style={{ flex: 1, marginLeft: 4 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: navy, letterSpacing: 5, textTransform: "uppercase", fontWeight: "900" }
                ]}
              >
                Bonjour
              </Text>
              <Text style={{ color: navy, marginTop: 2, fontSize: 36, lineHeight: 40, fontWeight: "900" }}>
                {visibleDisplayName || "Jo"}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/settings")}
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
            <Ionicons name="radio-button-on" size={20} color={navy} />
            </Pressable>
          </View>

          <View
            style={{
              minHeight: 116,
              borderRadius: 24,
              backgroundColor: navy,
              overflow: "hidden",
              padding: 18,
              justifyContent: "space-between",
              shadowColor: navy,
              shadowOpacity: 0.16,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 12 },
              elevation: 8
            }}
          >
            <View
              style={{
                position: "absolute",
                right: -48,
                top: 8,
                width: 210,
                height: 210,
                borderRadius: 105,
                backgroundColor: "rgba(255,255,255,0.08)"
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 18,
                  backgroundColor: "#8B4DFF",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="sparkles" size={26} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 22, lineHeight: 27, fontWeight: "900" }}>BlockyNotes</Text>
                <Text style={[theme.typography.caption, { color: "#FFFFFF", marginTop: 3 }]} numberOfLines={2}>
                  Notes, journal & dossiers.
                </Text>
              </View>
              <View
                style={{
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  paddingHorizontal: 10,
                  paddingVertical: 7
                }}
              >
                <Text style={[theme.typography.caption, { color: "#FFFFFF", fontWeight: "900" }]}>Premium</Text>
              </View>
            </View>
          </View>

          <View
            style={{
              minHeight: 84,
              borderRadius: 22,
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 10,
              paddingVertical: 10,
              flexDirection: "row",
              shadowColor: "#0F172A",
              shadowOpacity: 0.06,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 5
            }}
          >
            <StatItem icon="document-text" color="#6F4DFF" background="#EFE5FF" label="Notes" value={activeNotes.length} />
            <View style={{ width: 1, backgroundColor: "#E8E9EE", marginVertical: 10 }} />
            <StatItem icon="star" color="#F97316" background="#FFF1DC" label="Favoris" value={favoriteNotesCount} />
            <View style={{ width: 1, backgroundColor: "#E8E9EE", marginVertical: 10 }} />
            <StatItem icon="folder" color="#0F766E" background="#D8FAF1" label="Dossiers" value={folders.length + 1} />
            <View style={{ width: 1, backgroundColor: "#E8E9EE", marginVertical: 10 }} />
            <StatItem icon="time" color="#4F6EF7" background="#E4ECFF" label="Datees" value={datedNotesCount} />
          </View>

          <View
            style={{
              minHeight: 54,
              borderRadius: 20,
              backgroundColor: "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              gap: 12,
              shadowColor: "#0F172A",
              shadowOpacity: 0.05,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 5
            }}
          >
            <Ionicons name="search-outline" size={17} color="#7B7F89" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Recherche globale..."
              placeholderTextColor="#767A82"
              style={[theme.typography.body, { flex: 1, color: navy, paddingVertical: 8 }]}
            />
            <Pressable
              onPress={() => router.push("/notes")}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 13,
                backgroundColor: "#F2F4F8",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.82 : 1
              })}
            >
              <Ionicons name="list" size={18} color={navy} />
            </Pressable>
          </View>

          {pinnedNotes.length > 0 ? (
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: navy, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>Epinglees</Text>
                <Pressable onPress={() => router.push("/notes")}>
                  <Text style={[theme.typography.label, { color: navy, fontWeight: "900" }]}>Voir tout</Text>
                </Pressable>
              </View>
              {pinnedNotes.map((note) => (
                <HomeNoteRow key={note.id} note={note} />
              ))}
            </View>
          ) : null}

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: navy, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>Recemment modifiees</Text>
              <Pressable onPress={() => router.push("/notes")}>
                <Text style={[theme.typography.label, { color: navy, fontWeight: "900" }]}>Voir tout</Text>
              </Pressable>
            </View>
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => <HomeNoteRow key={note.id} note={note} />)
            ) : (
              <View
                style={{
                  borderRadius: 20,
                  backgroundColor: "#FFFFFF",
                  padding: 14,
                  shadowColor: "#0F172A",
                  shadowOpacity: 0.05,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 10 },
                  elevation: 5
                }}
              >
                <Text style={[theme.typography.body, { color: "#8D8F99" }]}>Aucune note recente pour le moment.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push("/notes/new")}
        style={({ pressed }) => ({
          position: "absolute",
          right: 24,
          bottom: floatingButtonBottom,
          width: 58,
          height: 58,
          borderRadius: 21,
          backgroundColor: navy,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.9 : 1,
          shadowColor: navy,
          shadowOpacity: 0.26,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12
        })}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}
