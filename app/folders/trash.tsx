import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useNotesStore } from "@/store/useNotesStore";

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
                Systeme
              </Text>
              <Text
                style={[
                  theme.typography.h1,
                  { color: theme.colors.text, marginTop: theme.spacing.sm, fontSize: 38, lineHeight: 44 }
                ]}
              >
                Corbeille
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => void emptyTrash()}
            style={{
              minWidth: 68,
              height: 40,
              borderRadius: 16,
              backgroundColor: "#0F1B3A",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 14
            }}
          >
            <Text style={[theme.typography.label, { color: "#FFFFFF" }]}>Vider</Text>
          </Pressable>
        </View>

        <AppCard
          style={{
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: "#FBFAF8"
          }}
        >
          <Text style={[theme.typography.h3, { color: theme.colors.text, textAlign: "center" }]}>
            Les notes supprimees restent 30 jours
          </Text>
          <Text
            style={[
              theme.typography.body,
              { color: "#7E8696", marginTop: theme.spacing.md, textAlign: "center", lineHeight: 28 }
            ]}
          >
            Tu peux restaurer ou supprimer definitivement chaque note.
          </Text>
        </AppCard>

        <View style={{ gap: theme.spacing.md }}>
          {deletedNotes.length === 0 ? (
            <EmptyState
              title="Corbeille vide"
              description="Les notes supprimees apparaitront ici avant suppression definitive."
            />
          ) : (
            deletedNotes.map((note) => (
              <AppCard
                key={note.id}
                style={{
                  borderRadius: 24,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  backgroundColor: "#FFFFFF"
                }}
              >
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
                      {note.title || "Sans titre"}
                    </Text>
                    <Text style={[theme.typography.body, { color: "#B5A89C", marginLeft: 12 }]}>
                      {dayLabel(note.deletedAt ?? note.updatedAt)}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                    <Pressable
                      onPress={() => void restoreNote(note.id)}
                      style={{
                        flex: 1,
                        minHeight: 38,
                        borderRadius: 16,
                        backgroundColor: "#F4F1EE",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Text style={[theme.typography.label, { color: theme.colors.text }]}>Restaurer</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => void purgeNote(note.id)}
                      style={{
                        flex: 1,
                        minHeight: 38,
                        borderRadius: 16,
                        backgroundColor: "#0F1B3A",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Text style={[theme.typography.label, { color: "#FFFFFF" }]}>Supprimer</Text>
                    </Pressable>
                  </View>
                </View>
              </AppCard>
            ))
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
