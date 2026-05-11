import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/ui/AppBackground";
import { AppHeaderLogo } from "@/components/ui/AppHeaderLogo";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { sortNotes } from "@/lib/sort";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { searchNotesService } from "@/services/notes/searchNotes";
import { isNoteLocked } from "@/services/security/locks";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUIStore } from "@/store/useUIStore";
import { getAppPalette } from "@/theme/appPalette";
import type { Note, SortOrder } from "@/types/models";

type NotesTab = "all" | "favorites" | "dated";

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

function NoteChip({ label, icon }: { label: string; icon?: keyof typeof Ionicons.glyphMap }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <View
      style={{
        borderRadius: 10,
        backgroundColor: palette.surfaceMuted,
        paddingHorizontal: 7,
        paddingVertical: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 4
      }}
    >
      {icon ? <Ionicons name={icon} size={10} color={palette.textMuted} /> : null}
      <Text style={[theme.typography.caption, { color: palette.textMuted, fontWeight: "900", fontSize: 10 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function NotesListItem({ note }: { note: Note }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const folder = useFoldersStore((state) => state.folders.find((entry) => entry.id === note.folderId));
  const settings = useSettingsStore((state) => state.settings);
  const noteIcon = getNoteIcon(note);
  const locked = isNoteLocked(note, folder, settings);
  const elementCount = noteElementCount(note);
  const contentPreview = note.content.trim().split(/\r?\n/).find(Boolean);
  const subtitle = locked
    ? "Note verrouillee"
    : elementCount > 1
      ? `${elementCount} elements - ${noteDateLabel(note.updatedAt)}`
      : contentPreview
        ? contentPreview
        : noteDateLabel(note.updatedAt);
  const chips = [
    folder?.name ?? (note.folderId === null ? "Personnel" : null),
    locked ? "Verrouillee" : null,
    note.isFavorite ? "Favori" : null,
    note.isPinned ? "Epinglee" : null
  ].filter(Boolean) as string[];

  return (
    <Pressable
      onPress={() => router.push(`/notes/${note.id}`)}
      style={({ pressed }) => ({
        minHeight: 88,
        borderRadius: 22,
        backgroundColor: palette.surface,
        paddingHorizontal: 14,
        paddingVertical: 12,
        opacity: pressed ? 0.88 : 1,
        shadowColor: palette.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            backgroundColor: noteIcon.backgroundColor,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name={locked ? "lock-closed" : noteIcon.icon} size={20} color={locked ? "#0F1B3A" : noteIcon.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.h3, { color: palette.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }]} numberOfLines={1}>
            {note.title || "Sans titre"}
          </Text>
          <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]} numberOfLines={1}>
            {subtitle}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
            {chips.length > 0 ? (
              chips.slice(0, 3).map((chip) => (
                <NoteChip
                  key={chip}
                  label={chip}
                  icon={chip === "Favori" ? "star" : chip === "Epinglee" ? "sparkles" : chip === "Verrouillee" ? "lock-closed" : undefined}
                />
              ))
            ) : (
              <NoteChip label="Note" />
            )}
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
      </View>
    </Pressable>
  );
}

export default function NotesScreen() {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const insets = useSafeAreaInsets();
  const folders = useFoldersStore((state) => state.folders);
  const notes = useNotesStore((state) => state.notes);
  const sortOrder = useSettingsStore((state) => state.settings.sortOrder);
  const updateSortOrder = useSettingsStore((state) => state.updateSortOrder);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const selectedFolderId = useUIStore((state) => state.selectedFolderId);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const setSelectedFolder = useUIStore((state) => state.setSelectedFolder);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<NotesTab>("all");
  const filteredNotes = useMemo(() => {
    const visibleNotes = notes.filter((note) => {
      if (note.isDeleted) {
        return false;
      }

      if (selectedFolderId && note.folderId !== selectedFolderId) {
        return false;
      }

      if (activeTab === "favorites" && !note.isFavorite) {
        return false;
      }

      if (activeTab === "dated" && (!note.dailyEntries || note.dailyEntries.length === 0)) {
        return false;
      }

      return true;
    });

    return sortNotes(searchNotesService(visibleNotes, searchQuery), activeTab === "dated" ? "updatedAt-desc" : sortOrder).sort((a, b) => {
      if (a.isPinned === b.isPinned) {
        return 0;
      }

      return a.isPinned ? -1 : 1;
    });
  }, [activeTab, notes, searchQuery, selectedFolderId, sortOrder]);
  const floatingButtonBottom = insets.bottom + 90;

  const selectSortOrder = async (nextSortOrder: SortOrder) => {
    await updateSortOrder(nextSortOrder);
    setShowFilters(false);
  };

  const tabs: { key: NotesTab; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "favorites", label: "Favoris" },
    { key: "dated", label: "Datees" }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBackground />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: floatingButtonBottom + 82 }}>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, marginLeft: 4 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: palette.text, letterSpacing: 5, textTransform: "uppercase", fontWeight: "900" }
                ]}
              >
                Bibliotheque
              </Text>
              <Text style={{ color: palette.text, marginTop: 2, fontSize: 36, lineHeight: 40, fontWeight: "900" }}>
                Notes
              </Text>
            </View>

            <AppHeaderLogo />
          </View>

          <View
            style={{
              minHeight: 46,
              borderRadius: 18,
              backgroundColor: palette.surfaceMuted,
              padding: 4,
              flexDirection: "row"
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: 15,
                    backgroundColor: isActive ? navy : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.84 : 1
                  })}
                >
                  <Text
                    style={[
                      theme.typography.label,
                      { color: isActive ? "#FFFFFF" : palette.textMuted, fontWeight: "900" }
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            style={{
              minHeight: 56,
              borderRadius: 20,
              backgroundColor: palette.surface,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              gap: 12,
              shadowColor: palette.shadow,
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
              placeholder="Rechercher dans vos notes..."
              placeholderTextColor={palette.placeholder}
              style={[theme.typography.body, { flex: 1, color: palette.text, paddingVertical: 8 }]}
            />
            <Pressable
              onPress={() => setShowFilters(true)}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 13,
                backgroundColor: palette.surfaceMuted,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.82 : 1
              })}
            >
              <Ionicons name="filter-outline" size={18} color={palette.text} />
            </Pressable>
          </View>

          <Text style={[theme.typography.label, { color: palette.textMuted, fontWeight: "900" }]}>
            {filteredNotes.length} note{filteredNotes.length > 1 ? "s" : ""} trouvee{filteredNotes.length > 1 ? "s" : ""}
          </Text>

          <View style={{ gap: 10 }}>
            {filteredNotes.length === 0 ? (
              <EmptyState
                title="Aucune note"
                description={
                  activeTab === "favorites"
                    ? "Ajoute des favoris pour les retrouver ici."
                    : activeTab === "dated"
                      ? "Aucune note datee pour le moment."
                      : "Cree une note pour commencer."
                }
              />
            ) : (
              filteredNotes.map((note) => <NotesListItem key={note.id} note={note} />)
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showFilters} transparent animationType="fade" onRequestClose={() => setShowFilters(false)}>
        <Pressable
          onPress={() => setShowFilters(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 27, 58, 0.18)",
            justifyContent: "flex-end",
            paddingHorizontal: 18,
            paddingBottom: insets.bottom + 24
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: palette.surface,
              borderRadius: 28,
              paddingHorizontal: 20,
              paddingVertical: 20,
              gap: theme.spacing.lg
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[theme.typography.caption, { color: palette.text, letterSpacing: 2, textTransform: "uppercase", fontWeight: "900" }]}>
                Filtres
              </Text>
              <Pressable
                onPress={() => setShowFilters(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 14,
                  backgroundColor: palette.subtle,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="close" size={18} color={palette.text} />
              </Pressable>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <Text style={[theme.typography.label, { color: palette.text }]}>Dossier</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
                <Pressable
                  onPress={() => {
                    setSelectedFolder(null);
                    setShowFilters(false);
                  }}
                  style={{
                    paddingHorizontal: 14,
                    minHeight: 40,
                    borderRadius: 16,
                    backgroundColor: selectedFolderId === null ? navy : palette.chip,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text style={[theme.typography.label, { color: selectedFolderId === null ? "#FFFFFF" : palette.text }]}>
                    Tous
                  </Text>
                </Pressable>

                {folders.map((folder) => (
                  <Pressable
                    key={folder.id}
                    onPress={() => {
                      setSelectedFolder(folder.id);
                      setShowFilters(false);
                    }}
                    style={{
                      paddingHorizontal: 14,
                      minHeight: 40,
                      borderRadius: 16,
                      backgroundColor: selectedFolderId === folder.id ? navy : palette.chip,
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: selectedFolderId === folder.id ? "#FFFFFF" : palette.text }]}>
                      {folder.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <Text style={[theme.typography.label, { color: palette.text }]}>Tri</Text>
              {[
                { label: "Plus recentes", value: "updatedAt-desc" },
                { label: "Plus anciennes", value: "updatedAt-asc" },
                { label: "Titre A-Z", value: "title-asc" }
              ].map((option) => {
                const isActive = sortOrder === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => void selectSortOrder(option.value as SortOrder)}
                    style={{
                      minHeight: 46,
                      borderRadius: 16,
                      backgroundColor: isActive ? navy : palette.chip,
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexDirection: "row",
                      paddingHorizontal: 14
                    }}
                  >
                    <Text style={[theme.typography.label, { color: isActive ? "#FFFFFF" : palette.text }]}>
                      {option.label}
                    </Text>
                    {isActive ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
