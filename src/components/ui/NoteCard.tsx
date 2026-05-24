import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { useTheme } from "@/hooks/useTheme";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { isNoteLocked } from "@/services/security/locks";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import type { Note } from "@/types/models";

interface NoteCardProps {
  note: Note;
  compact?: boolean;
}

export function NoteCard({ note, compact = false }: NoteCardProps) {
  const theme = useTheme();
  const folder = useFoldersStore((state) => state.folders.find((entry) => entry.id === note.folderId));
  const settings = useSettingsStore((state) => state.settings);
  const noteIcon = getNoteIcon(note);
  const locked = isNoteLocked(note, folder, settings);

  return (
    <AppCard onPress={() => router.push(`/notes/${note.id}`)}>
      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: noteIcon.backgroundColor,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={locked ? "lock-closed" : noteIcon.icon} size={15} color={locked ? "#0F1B3A" : noteIcon.color} />
          </View>
          <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
            {note.title || "Sans titre"}
          </Text>
          {locked ? <Ionicons name="shield-checkmark" size={14} color="#4F6EF7" /> : null}
          {note.isFavorite ? <Text style={[theme.typography.caption, { color: theme.colors.warning }]}>Favori</Text> : null}
        </View>
        {!compact ? (
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]} numberOfLines={3}>
            {locked ? "Contenu masque - code requis" : note.content || "Aucun contenu"}
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
