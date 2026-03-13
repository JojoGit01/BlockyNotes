import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
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

        <AppCard
          style={{
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: "#FBFAF8"
          }}
        >
          <Text style={[theme.typography.h3, { color: theme.colors.text, textAlign: "center" }]}>
            Les notes archivees restent accessibles
          </Text>
          <Text
            style={[
              theme.typography.body,
              { color: "#7E8696", marginTop: theme.spacing.md, textAlign: "center", lineHeight: 28 }
            ]}
          >
            Range ce que tu veux conserver sans encombrer tes notes actives.
          </Text>
        </AppCard>

        <View style={{ gap: theme.spacing.md }}>
          {archivedNotes.length === 0 ? (
            <EmptyState
              title="Aucune archive"
              description="Archive une note depuis l'editeur pour la retrouver ici."
            />
          ) : (
            archivedNotes.map((note) => (
              <AppCard
                key={note.id}
                style={{
                  borderRadius: 24,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  backgroundColor: "#FFFFFF"
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.h3, { color: theme.colors.text }]} numberOfLines={1}>
                      {note.title || "Sans titre"}
                    </Text>
                    <Text style={[theme.typography.body, { color: "#B5A89C", marginTop: 6 }]}>
                      Archivee en {monthLabel(note.updatedAt)}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => void restoreNote(note.id)}
                    style={{
                      paddingHorizontal: 16,
                      minHeight: 34,
                      borderRadius: 16,
                      backgroundColor: "#F4F1EE",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: theme.colors.text }]}>Restaurer</Text>
                  </Pressable>
                </View>
              </AppCard>
            ))
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
