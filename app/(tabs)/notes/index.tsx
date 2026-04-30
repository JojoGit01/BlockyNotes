import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { sortNotes } from "@/lib/sort";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { searchNotesService } from "@/services/notes/searchNotes";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUIStore } from "@/store/useUIStore";
import type { Note, SortOrder } from "@/types/models";

const dayLabel = (isoDate: string) => {
  const noteDate = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diffDays <= 0) {
    return "Aujourd'hui";
  }

  if (diffDays === 1) {
    return "Hier";
  }

  return noteDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

function NotesListItem({ note }: { note: Note }) {
  const theme = useTheme();
  const folder = useFoldersStore((state) => state.folders.find((entry) => entry.id === note.folderId));
  const noteIcon = getNoteIcon(note);

  return (
    <AppCard
      onPress={() => router.push(`/notes/${note.id}`)}
      style={{
        borderRadius: 24,
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF"
      }}
    >
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.md }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 16,
              backgroundColor: noteIcon.backgroundColor,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={noteIcon.icon} size={16} color={noteIcon.color} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
                {note.title || "Sans titre"}
              </Text>
              {note.isPinned ? <Ionicons name="pin" size={14} color="#0F1B3A" /> : null}
              <Text style={[theme.typography.body, { color: "#B5A89C", marginLeft: 12 }]}>
                {dayLabel(note.updatedAt)}
              </Text>
            </View>

            <Text style={[theme.typography.body, { color: "#8E8178", marginTop: 6 }]} numberOfLines={1}>
              {folder?.name ?? "Personnel"}
            </Text>
          </View>
        </View>

        <Text style={[theme.typography.body, { color: "#596579" }]} numberOfLines={2}>
          {note.content || "Appuie pour ouvrir directement l'editeur."}
        </Text>
      </View>
    </AppCard>
  );
}

export default function NotesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const folders = useFoldersStore((state) => state.folders);
  const notes = useNotesStore((state) => state.notes);
  const sortOrder = useSettingsStore((state) => state.settings.sortOrder);
  const updateSortOrder = useSettingsStore((state) => state.updateSortOrder);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const selectedFolderId = useUIStore((state) => state.selectedFolderId);
  const showDeleted = useUIStore((state) => state.showDeleted);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const setSelectedFolder = useUIStore((state) => state.setSelectedFolder);
  const toggleShowDeleted = useUIStore((state) => state.toggleShowDeleted);
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilter, setQuickFilter] = useState<"all" | "recent" | "deleted">("all");
  const filteredNotes = useMemo(() => {
    const visibleNotes = notes.filter((note) => {
      if (showDeleted) {
        return note.isDeleted;
      }

      if (note.isDeleted) {
        return false;
      }

      if (selectedFolderId && note.folderId !== selectedFolderId) {
        return false;
      }

      return true;
    });

    return sortNotes(searchNotesService(visibleNotes, searchQuery), sortOrder).sort((a, b) => {
      if (a.isPinned === b.isPinned) {
        return 0;
      }

      return a.isPinned ? -1 : 1;
    });
  }, [notes, searchQuery, selectedFolderId, showDeleted, sortOrder]);
  const hasActiveSearch = searchQuery.trim().length > 0 || selectedFolderId !== null || showDeleted;
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedFolder(null);
    setQuickFilter("all");
    if (showDeleted) {
      toggleShowDeleted();
    }
  };

  const closeDeletedIfNeeded = () => {
    if (showDeleted) {
      toggleShowDeleted();
    }
  };

  const selectSortOrder = async (nextSortOrder: SortOrder) => {
    await updateSortOrder(nextSortOrder);
    setShowFilters(false);
  };

  const chips = [
    {
      key: "all",
      label: "Toutes",
      active: quickFilter === "all" && selectedFolderId === null && !showDeleted,
      onPress: () => {
        setQuickFilter("all");
        setSelectedFolder(null);
        closeDeletedIfNeeded();
      }
    },
    {
      key: "recent",
      label: "Recentes",
      active: quickFilter === "recent" && selectedFolderId === null && !showDeleted,
      onPress: () => {
        setQuickFilter("recent");
        setSelectedFolder(null);
        closeDeletedIfNeeded();
        void updateSortOrder("updatedAt-desc");
      }
    },
    {
      key: "deleted",
      label: "Corbeille",
      active: showDeleted,
      onPress: () => {
        setQuickFilter("deleted");
        toggleShowDeleted();
      }
    }
  ];
  const floatingButtonBottom = insets.bottom + 90;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: floatingButtonBottom + 110 }}>
        <View style={{ gap: theme.spacing.lg }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.caption, { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }]}>
              {hasActiveSearch && filteredNotes.length === 0 ? "Recherche" : "Bibliotheque"}
            </Text>
            <Text
              style={[
                theme.typography.h1,
                { color: theme.colors.text, marginTop: theme.spacing.sm, fontSize: 38, lineHeight: 46 }
              ]}
            >
              {hasActiveSearch && filteredNotes.length === 0 ? "Aucun resultat" : "Toutes les notes"}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <AppCard
              style={{
                width: 44,
                height: 44,
                padding: 0,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F4F4F4",
                borderColor: "#F1E8E2"
              }}
            >
              <Ionicons
                name={hasActiveSearch && filteredNotes.length === 0 ? "search-outline" : "grid-outline"}
                size={17}
                color={theme.colors.text}
              />
            </AppCard>
            <AppCard
              onPress={() => router.push("/notes/favorites")}
              style={{
                width: 44,
                height: 44,
                padding: 0,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#0F1B3A",
                borderWidth: 0
              }}
            >
              <Ionicons name="star" size={16} color="#FFFFFF" />
            </AppCard>
          </View>
        </View>

        <AppInput
          placeholder="Rechercher parmi toutes tes notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{
            borderRadius: 22,
            minHeight: 54,
            paddingHorizontal: 18,
            backgroundColor: "#FAF8F5",
            borderColor: "#EFE6DF"
          }}
        />

        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              {chips.map((chip) => (
                <Pressable
                  key={chip.key}
                  onPress={chip.onPress}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 16,
                    backgroundColor: chip.active ? "#0F1B3A" : "#F3F1EF"
                  }}
                >
                  <Text
                    style={[
                      theme.typography.caption,
                      { color: chip.active ? "#FFFFFF" : "#8C8178", fontWeight: "600" }
                    ]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Pressable
            accessibilityLabel="Filtrer les notes"
            onPress={() => setShowFilters(true)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 16,
              backgroundColor: selectedFolderId ? "#0F1B3A" : "#F3F1EF",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="filter-outline" size={18} color={selectedFolderId ? "#FFFFFF" : "#85796F"} />
          </Pressable>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          {filteredNotes.length === 0 ? (
            hasActiveSearch ? (
              <AppCard
                style={{
                  borderRadius: 28,
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                  backgroundColor: "#FBFAF8"
                }}
              >
                <Text style={[theme.typography.h3, { color: theme.colors.text, textAlign: "center" }]}>
                  Aucune note trouvee
                </Text>
                <Text
                  style={[
                    theme.typography.body,
                    { color: "#7E8696", marginTop: theme.spacing.md, textAlign: "center", lineHeight: 28 }
                  ]}
                >
                  Essaie un autre mot-cle, un autre dossier ou enleve certains filtres.
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "center", gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
                  <Pressable
                    onPress={() => router.push("/notes/new")}
                    style={{
                      paddingHorizontal: 18,
                      minHeight: 40,
                      borderRadius: 18,
                      backgroundColor: "#0F1B3A",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: "#FFFFFF" }]}>Creer une note</Text>
                  </Pressable>
                  <Pressable
                    onPress={resetFilters}
                    style={{
                      paddingHorizontal: 18,
                      minHeight: 40,
                      borderRadius: 18,
                      backgroundColor: "#F3F0EC",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: theme.colors.text }]}>Reinitialiser</Text>
                  </Pressable>
                </View>
              </AppCard>
            ) : (
              <EmptyState title="Aucune note" description="Essaie un autre filtre ou cree une nouvelle note." />
            )
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
              backgroundColor: "#FFFFFF",
              borderRadius: 28,
              paddingHorizontal: 20,
              paddingVertical: 20,
              gap: theme.spacing.lg,
              borderWidth: 1,
              borderColor: "#F1E8E2"
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={[theme.typography.caption, { color: "#B8AA9A", letterSpacing: 2, textTransform: "uppercase" }]}>
                Filtres
              </Text>
              <Pressable
                onPress={() => setShowFilters(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 14,
                  backgroundColor: "#F7F4F1",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="close" size={18} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <Text style={[theme.typography.label, { color: theme.colors.text }]}>Dossier</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
                <Pressable
                  onPress={() => {
                    setQuickFilter("all");
                    setSelectedFolder(null);
                    closeDeletedIfNeeded();
                    setShowFilters(false);
                  }}
                  style={{
                    paddingHorizontal: 14,
                    minHeight: 40,
                    borderRadius: 16,
                    backgroundColor: selectedFolderId === null ? "#0F1B3A" : "#F3F0EC",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text style={[theme.typography.label, { color: selectedFolderId === null ? "#FFFFFF" : theme.colors.text }]}>
                    Tous
                  </Text>
                </Pressable>

                {folders.map((folder) => (
                  <Pressable
                    key={folder.id}
                    onPress={() => {
                      setQuickFilter("all");
                      setSelectedFolder(folder.id);
                      closeDeletedIfNeeded();
                      setShowFilters(false);
                    }}
                    style={{
                      paddingHorizontal: 14,
                      minHeight: 40,
                      borderRadius: 16,
                      backgroundColor: selectedFolderId === folder.id ? "#0F1B3A" : "#F3F0EC",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: selectedFolderId === folder.id ? "#FFFFFF" : theme.colors.text }]}>
                      {folder.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <Text style={[theme.typography.label, { color: theme.colors.text }]}>Tri</Text>
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
                      backgroundColor: isActive ? "#0F1B3A" : "#F3F0EC",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexDirection: "row",
                      paddingHorizontal: 14
                    }}
                  >
                    <Text style={[theme.typography.label, { color: isActive ? "#FFFFFF" : theme.colors.text }]}>
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
