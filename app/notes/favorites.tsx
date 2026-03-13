import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";

function FavoriteNoteCard({ noteId }: { noteId: string }) {
  const theme = useTheme();
  const note = useNotesStore((state) => state.notes.find((entry) => entry.id === noteId));
  const folder = useFoldersStore((state) =>
    state.folders.find((entry) => entry.id === note?.folderId)
  );

  if (!note) {
    return null;
  }

  return (
    <AppCard
      onPress={() => router.push(`/notes/${note.id}`)}
      style={{
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 18,
        backgroundColor: "#FFFFFF"
      }}
    >
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
            {note.title || "Sans titre"}
          </Text>
          <Ionicons name="star" size={16} color="#0F1B3A" />
        </View>

        <Text style={[theme.typography.body, { color: "#596579" }]} numberOfLines={2}>
          {note.content || "Garde sous la main les idees que tu consultes le plus."}
        </Text>

        <Text style={[theme.typography.caption, { color: "#B5A89C" }]}>
          {folder?.name ?? "Personnel"}
        </Text>
      </View>
    </AppCard>
  );
}

export default function FavoritesScreen() {
  const theme = useTheme();
  const notes = useNotesStore((state) => state.notes);
  const favoriteIds = useMemo(
    () =>
      [...notes]
        .filter((note) => note.isFavorite && !note.isDeleted)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map((note) => note.id),
    [notes]
  );

  return (
    <ScreenContainer scrollable>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                theme.typography.caption,
                { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
              ]}
            >
              Collection
            </Text>
            <Text
              style={[
                theme.typography.h1,
                { color: theme.colors.text, marginTop: theme.spacing.sm, fontSize: 34, lineHeight: 40 }
              ]}
            >
              Favoris
            </Text>
          </View>

          <AppCard
            style={{
              width: 44,
              height: 44,
              padding: 0,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F6F4F2",
              borderColor: "#F1E8E2"
            }}
          >
            <Ionicons name="star" size={16} color="#0F1B3A" />
          </AppCard>
        </View>

        <AppCard
          style={{
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: "#F8F5FB"
          }}
        >
          <Text
            style={[
              theme.typography.caption,
              { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
            ]}
          >
            Acces rapide
          </Text>
          <Text
            style={[
              theme.typography.h1,
              { color: theme.colors.text, marginTop: theme.spacing.md, fontSize: 24, lineHeight: 30 }
            ]}
          >
            Tes notes importantes
          </Text>
          <Text
            style={[
              theme.typography.body,
              { color: "#6C7385", marginTop: theme.spacing.md, lineHeight: 30 }
            ]}
          >
            Garde sous la main les idees que tu consultes le plus.
          </Text>
        </AppCard>

        <View style={{ gap: theme.spacing.md }}>
          {favoriteIds.length === 0 ? (
            <EmptyState
              title="Aucun favori"
              description="Ajoute une note en favori depuis l'editeur pour la retrouver ici."
            />
          ) : (
            favoriteIds.map((noteId) => <FavoriteNoteCard key={noteId} noteId={noteId} />)
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
