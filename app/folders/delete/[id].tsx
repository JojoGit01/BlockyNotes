import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";

export default function DeleteFolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const folder = useFoldersStore((state) => state.folders.find((entry) => entry.id === id));
  const allNotes = useNotesStore((state) => state.notes);
  const notesInFolder = useMemo(
    () => allNotes.filter((note) => note.folderId === id && !note.isDeleted),
    [allNotes, id]
  );
  const deleteFolder = useFoldersStore((state) => state.deleteFolder);
  const deleteNote = useNotesStore((state) => state.deleteNote);

  if (!folder) {
    return (
      <ScreenContainer>
        <EmptyState title="Dossier introuvable" description="Ce dossier n'existe plus." />
      </ScreenContainer>
    );
  }

  const handleConfirm = async () => {
    await Promise.all(notesInFolder.map((note) => deleteNote(note.id)));
    await deleteFolder(folder.id);
    router.replace("/folders");
  };

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
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </Pressable>

          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Supprimer le dossier</Text>
        </View>

        <AppCard
          style={{
            borderRadius: 28,
            paddingHorizontal: 22,
            paddingVertical: 24,
            backgroundColor: "#FBFAF8"
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: "#F8DDD3",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="folder-open-outline" size={22} color="#8E4B38" />
            </View>
          </View>

          <Text style={[theme.typography.h2, { color: theme.colors.text, textAlign: "center", marginTop: 18 }]}>
            Supprimer &quot;{folder.name}&quot; ?
          </Text>
          <Text
            style={[
              theme.typography.body,
              { color: "#6C7385", textAlign: "center", marginTop: theme.spacing.md, lineHeight: 30 }
            ]}
          >
            Le dossier sera supprime. Les {notesInFolder.length} note(s) associee(s) seront envoyees dans la corbeille.
          </Text>

          <View style={{ flexDirection: "row", gap: theme.spacing.sm, marginTop: 22 }}>
            <Pressable
              onPress={() => router.back()}
              style={{
                flex: 1,
                minHeight: 42,
                borderRadius: 18,
                backgroundColor: "#F1EEEB",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={[theme.typography.label, { color: theme.colors.text }]}>Annuler</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleConfirm()}
              style={{
                flex: 1,
                minHeight: 42,
                borderRadius: 18,
                backgroundColor: "#0F1B3A",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={[theme.typography.label, { color: "#FFFFFF" }]}>Confirmer</Text>
            </Pressable>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
