import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { CollectionNoteCard } from "@/components/ui/CollectionNoteCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useNotesStore } from "@/store/useNotesStore";
import { getAppPalette } from "@/theme/appPalette";

export default function FavoritesScreen() {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const notes = useNotesStore((state) => state.notes);
  const favoriteNotes = useMemo(
    () =>
      [...notes]
        .filter((note) => note.isFavorite && !note.isDeleted)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [notes]
  );

  return (
    <ScreenContainer scrollable>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.md, flex: 1 }}>
            <Pressable
              onPress={() => router.back()}
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
                Collection
              </Text>
              <Text
                style={[
                  theme.typography.h1,
                  { color: palette.text, marginTop: theme.spacing.sm, fontSize: 34, lineHeight: 40 }
                ]}
              >
                Favoris
              </Text>
            </View>
          </View>

          <View
            style={{
              minWidth: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: palette.surface,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 12
            }}
          >
            <Text style={[theme.typography.label, { color: palette.text }]}>
              {favoriteNotes.length}
            </Text>
          </View>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          {favoriteNotes.length === 0 ? (
            <EmptyState
              title="Aucun favori"
              description="Ajoute une note en favori depuis l'editeur pour la retrouver ici."
            />
          ) : (
            favoriteNotes.map((note) => (
              <CollectionNoteCard
                key={note.id}
                note={note}
                meta="Favori"
              />
            ))
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
