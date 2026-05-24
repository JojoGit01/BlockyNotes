import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CollectionNoteCard } from "@/components/ui/CollectionNoteCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useNotesStore } from "@/store/useNotesStore";
import { getAppPalette } from "@/theme/appPalette";

const monthLabel = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("fr-FR", { month: "short" });

export default function FolderArchivesScreen() {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const insets = useSafeAreaInsets();
  const notes = useNotesStore((state) => state.notes);
  const archivedNotes = useMemo(
    () =>
      [...notes]
        .filter((note) => note.isArchived && !note.isDeleted)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [notes]
  );
  const restoreNote = useNotesStore((state) => state.restoreNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const [confirmAction, setConfirmAction] = useState<{ type: "restore" | "trash"; noteId: string; title: string } | null>(null);
  const confirmIsTrash = confirmAction?.type === "trash";
  const runConfirmAction = async () => {
    if (confirmAction?.type === "restore") {
      await restoreNote(confirmAction.noteId);
    }

    if (confirmAction?.type === "trash") {
      await deleteNote(confirmAction.noteId);
    }

    setConfirmAction(null);
  };

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
                backgroundColor: palette.surface,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="arrow-back" size={18} color={palette.text} />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: palette.textMuted, letterSpacing: 3, textTransform: "uppercase" }
                ]}
              >
                Bibliotheque
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: theme.spacing.sm, flexWrap: "wrap" }}>
                <Text style={[theme.typography.h1, { color: palette.text, fontSize: 38, lineHeight: 44 }]}>
                  Notes
                </Text>
                <View
                  style={{
                    borderRadius: 14,
                    backgroundColor: "#E9ECF3",
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Ionicons name="archive" size={13} color="#0F1B3A" />
                  <Text style={[theme.typography.caption, { color: "#0F1B3A", fontWeight: "900" }]}>Archives</Text>
                </View>
              </View>
              <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 4 }]} numberOfLines={1}>
                Notes rangees hors de la liste principale.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/folders")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: palette.surface,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="archive-outline" size={18} color={palette.text} />
          </Pressable>
        </View>

        <View
          style={{
            borderRadius: 22,
            backgroundColor: palette.surface,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderWidth: 1,
            borderColor: palette.border
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: "#E9ECF3",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="archive-outline" size={20} color="#0F1B3A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.h3, { color: palette.text, fontWeight: "900" }]}>
              {archivedNotes.length} note{archivedNotes.length > 1 ? "s" : ""} archivee{archivedNotes.length > 1 ? "s" : ""}
            </Text>
            <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 2 }]}>
              Les archives sont separees des notes actives.
            </Text>
          </View>
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
                actions={[
                  {
                    label: "Restaurer",
                    icon: "refresh",
                    onPress: () => setConfirmAction({ type: "restore", noteId: note.id, title: note.title || "Sans titre" }),
                    variant: "secondary"
                  },
                  {
                    label: "Corbeille",
                    icon: "trash-outline",
                    onPress: () => setConfirmAction({ type: "trash", noteId: note.id, title: note.title || "Sans titre" }),
                    variant: "danger"
                  }
                ]}
              />
            ))
          )}
        </View>
      </View>
      <Modal visible={confirmAction !== null} transparent animationType="slide" onRequestClose={() => setConfirmAction(null)}>
        <Pressable
          onPress={() => setConfirmAction(null)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 27, 58, 0.22)",
            justifyContent: "flex-end"
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: palette.surface,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: insets.bottom + 26,
              gap: 18
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 48,
                height: 5,
                borderRadius: 4,
                backgroundColor: palette.isDark ? "rgba(255,255,255,0.26)" : "#C9CBD5"
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 18,
                  backgroundColor: confirmIsTrash ? "#FFE6E6" : "#D8FAF1",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name={confirmIsTrash ? "trash-outline" : "refresh"} size={23} color={confirmIsTrash ? "#FF3434" : "#18A058"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>
                  {confirmIsTrash ? "Envoyer a la corbeille" : "Restaurer la note"}
                </Text>
                <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 2 }]}>
                  {confirmIsTrash
                    ? `La note "${confirmAction?.title ?? "Sans titre"}" ira dans la corbeille.`
                    : `La note "${confirmAction?.title ?? "Sans titre"}" retournera dans tes notes actives.`}
                </Text>
              </View>
            </View>
            <View style={{ gap: 10 }}>
              <Pressable
                onPress={() => void runConfirmAction()}
                style={({ pressed }) => ({
                  minHeight: 54,
                  borderRadius: 18,
                  backgroundColor: confirmIsTrash ? "#FFE6E6" : "#D8FAF1",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name={confirmIsTrash ? "trash-outline" : "refresh"} size={18} color={confirmIsTrash ? "#FF3434" : "#18A058"} />
                <Text style={[theme.typography.label, { color: confirmIsTrash ? "#FF3434" : "#18A058", fontWeight: "900" }]}>
                  {confirmIsTrash ? "Envoyer a la corbeille" : "Restaurer"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setConfirmAction(null)}
                style={({ pressed }) => ({
                  minHeight: 52,
                  borderRadius: 18,
                  backgroundColor: palette.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Annuler</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
