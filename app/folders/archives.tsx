import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { CollectionNoteCard } from "@/components/ui/CollectionNoteCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useNotesStore } from "@/store/useNotesStore";

const monthLabel = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("fr-FR", { month: "short" });

export default function FolderArchivesScreen() {
  const theme = useTheme();
  const notes = useNotesStore((state) => state.notes);
  const archivedNotes = useMemo(
    () =>
      [...notes]
        .filter((note) => note.isArchived && !note.isDeleted)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [notes]
  );
  const restoreNote = useNotesStore((state) => state.restoreNote);

  return (
    <ScreenContainer scrollable>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 120 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.md, flex: 1 }}>
            <Pressable
              onPress={() => router.push("/folders")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: "#F4F1EE",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
                ]}
              >
                Stockage
              </Text>
              <Text
                style={[
                  theme.typography.h1,
                  { color: theme.colors.text, marginTop: theme.spacing.sm, fontSize: 38, lineHeight: 44 }
                ]}
              >
                Archives
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/folders")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: "#F4F1EE",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="archive-outline" size={18} color={theme.colors.text} />
          </Pressable>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          {archivedNotes.length === 0 ? (
            <EmptyState
              title="Aucune archive"
              description="Archive une note depuis l'editeur pour la retrouver ici."
            />
          ) : (
            archivedNotes.map((note) => (
              <CollectionNoteCard
                key={note.id}
                note={note}
                meta={`Archivee en ${monthLabel(note.updatedAt)}`}
                actions={[{ label: "Restaurer", onPress: () => restoreNote(note.id), variant: "secondary" }]}
              />
            ))
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
