import { router } from "expo-router";
import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { useTheme } from "@/hooks/useTheme";
import { useFoldersStore } from "@/store/useFoldersStore";
import type { Note } from "@/types/models";

interface NoteCardProps {
  note: Note;
  compact?: boolean;
}

export function NoteCard({ note, compact = false }: NoteCardProps) {
  const theme = useTheme();
  const folder = useFoldersStore((state) => state.folders.find((entry) => entry.id === note.folderId));

  return (
    <AppCard onPress={() => router.push(`/notes/${note.id}`)}>
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
            {note.title || "Sans titre"}
          </Text>
          {note.isFavorite ? <Text style={[theme.typography.caption, { color: theme.colors.warning }]}>Favori</Text> : null}
        </View>
        {!compact ? (
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]} numberOfLines={3}>
            {note.content || "Aucun contenu"}
          </Text>
        ) : null}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
            {folder?.name ?? "Sans dossier"}
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
            {new Date(note.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </AppCard>
  );
}
