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

export default function FolderTrashScreen() {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const insets = useSafeAreaInsets();
  const notes = useNotesStore((state) => state.notes);
  const deletedNotes = useMemo(
    () =>
      [...notes]
        .filter((note) => note.isDeleted)
        .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? "")),
    [notes]
  );
  const restoreNote = useNotesStore((state) => state.restoreNote);
  const purgeNote = useNotesStore((state) => state.purgeNote);
  const emptyTrash = useNotesStore((state) => state.emptyTrash);
  const [confirmAction, setConfirmAction] = useState<{ type: "purge"; noteId: string; title: string } | { type: "empty" } | null>(null);
  const confirmTitle = confirmAction?.type === "empty" ? "Vider la corbeille" : "Supprimer definitivement";
  const confirmDescription =
    confirmAction?.type === "empty"
      ? `Supprimer definitivement ${deletedNotes.length} note${deletedNotes.length > 1 ? "s" : ""}.`
      : `La note "${confirmAction?.title ?? "Sans titre"}" sera supprimee pour toujours.`;
  const runConfirmAction = async () => {
    if (confirmAction?.type === "empty") {
      await emptyTrash();
    }

    if (confirmAction?.type === "purge") {
      await purgeNote(confirmAction.noteId);
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
                    backgroundColor: "#FFE6E6",
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Ionicons name="trash-outline" size={13} color="#FF3434" />
                  <Text style={[theme.typography.caption, { color: "#FF3434", fontWeight: "900" }]}>Corbeille</Text>
                </View>
              </View>
              <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 4 }]} numberOfLines={1}>
                Notes supprimees avant suppression definitive.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              if (deletedNotes.length > 0) {
                setConfirmAction({ type: "empty" });
              }
            }}
            style={{
              minWidth: 68,
              height: 40,
              borderRadius: 16,
              backgroundColor: deletedNotes.length > 0 ? "#FFE6E6" : palette.surfaceMuted,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 14,
              flexDirection: "row",
              gap: 7
            }}
          >
            <Ionicons name="trash" size={14} color={deletedNotes.length > 0 ? "#FF3434" : palette.textMuted} />
            <Text style={[theme.typography.label, { color: deletedNotes.length > 0 ? "#FF3434" : palette.textMuted }]}>Vider</Text>
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
              backgroundColor: "#FFE6E6",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3434" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.h3, { color: palette.text, fontWeight: "900" }]}>
              {deletedNotes.length} note{deletedNotes.length > 1 ? "s" : ""} dans la corbeille
            </Text>
            <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 2 }]}>
              Restaure une note ou supprime-la definitivement.
            </Text>
          </View>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          {deletedNotes.length === 0 ? (
            <EmptyState
              title="Corbeille vide"
              description="Les notes supprimees apparaitront ici avant suppression definitive."
            />
          ) : (
            deletedNotes.map((note) => (
              <CollectionNoteCard
                key={note.id}
                note={note}
                meta={`Supprimee ${dayLabel(note.deletedAt ?? note.updatedAt)}`}
                disabledOpen
                actions={[
                  { label: "Restaurer", icon: "refresh", onPress: () => restoreNote(note.id), variant: "secondary" },
                  {
                    label: "Supprimer definitivement",
                    icon: "trash",
                    onPress: () => setConfirmAction({ type: "purge", noteId: note.id, title: note.title || "Sans titre" }),
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
                  backgroundColor: "#FFE6E6",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="trash" size={23} color="#FF3434" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>{confirmTitle}</Text>
                <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 2 }]}>{confirmDescription}</Text>
              </View>
            </View>
            <View style={{ gap: 10 }}>
              <Pressable
                onPress={() => void runConfirmAction()}
                style={({ pressed }) => ({
                  minHeight: 54,
                  borderRadius: 18,
                  backgroundColor: "#FFE6E6",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="trash" size={18} color="#FF3434" />
                <Text style={[theme.typography.label, { color: "#FF3434", fontWeight: "900" }]}>Supprimer definitivement</Text>
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
