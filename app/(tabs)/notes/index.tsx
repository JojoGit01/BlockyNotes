import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { sortNotes } from "@/lib/sort";
import { searchNotesService } from "@/services/notes/searchNotes";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUIStore } from "@/store/useUIStore";
import type { Note } from "@/types/models";

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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
            {note.title || "Sans titre"}
          </Text>
          <Text style={[theme.typography.body, { color: "#B5A89C", marginLeft: 12 }]}>
            {dayLabel(note.updatedAt)}
          </Text>
        </View>

        <Text style={[theme.typography.body, { color: "#8E8178" }]} numberOfLines={1}>
          {folder?.name ?? "Personnel"}
        </Text>

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
  const searchQuery = useUIStore((state) => state.searchQuery);
  const selectedFolderId = useUIStore((state) => state.selectedFolderId);
  const showDeleted = useUIStore((state) => state.showDeleted);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const setSelectedFolder = useUIStore((state) => state.setSelectedFolder);
  const toggleShowDeleted = useUIStore((state) => state.toggleShowDeleted);
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

    return sortNotes(searchNotesService(visibleNotes, searchQuery), sortOrder);
  }, [notes, searchQuery, selectedFolderId, showDeleted, sortOrder]);
  const hasActiveSearch = searchQuery.trim().length > 0 || selectedFolderId !== null || showDeleted;
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedFolder(null);
    if (showDeleted) {
      toggleShowDeleted();
    }
  };

  const chips = [
    { key: "all", label: "Toutes", active: selectedFolderId === null && !showDeleted, onPress: () => setSelectedFolder(null) },
    { key: "recent", label: "Recentes", active: false, onPress: () => setSelectedFolder(null) },
    ...folders.slice(0, 3).map((folder) => ({
      key: folder.id,
      label: folder.name,
      active: selectedFolderId === folder.id,
      onPress: () => setSelectedFolder(folder.id)
    })),
    {
      key: "deleted",
      label: "Corbeille",
      active: showDeleted,
      onPress: toggleShowDeleted
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

        <AppCard
          style={{
            borderRadius: 22,
            paddingVertical: 16,
            paddingHorizontal: 16
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
              <Ionicons name="filter-outline" size={18} color="#85796F" />
              <Text style={[theme.typography.body, { color: "#5A6475" }]}>Trier par date</Text>
            </View>
            <Text style={[theme.typography.body, { color: "#85796F" }]}>Plus recentes</Text>
          </View>
        </AppCard>

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
