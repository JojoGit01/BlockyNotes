import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { useTheme } from "@/hooks/useTheme";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { useFoldersStore } from "@/store/useFoldersStore";
import { getAppPalette } from "@/theme/appPalette";
import type { Note } from "@/types/models";

interface CollectionNoteAction {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: "primary" | "secondary" | "danger";
}

interface CollectionNoteCardProps {
  note: Note;
  meta?: string;
  actions?: CollectionNoteAction[];
  disabledOpen?: boolean;
}

export function CollectionNoteCard({ note, meta, actions = [], disabledOpen = false }: CollectionNoteCardProps) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const folder = useFoldersStore((state) => state.folders.find((entry) => entry.id === note.folderId));
  const noteIcon = getNoteIcon(note);

  return (
    <AppCard
      onPress={disabledOpen ? undefined : () => router.push(`/notes/${note.id}`)}
      style={{
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: palette.surface,
        borderColor: palette.border
      }}
    >
      <View style={{ gap: theme.spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 16,
              backgroundColor: noteIcon.backgroundColor,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={noteIcon.icon} size={17} color={noteIcon.color} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
                {note.title || "Sans titre"}
              </Text>
              {note.isPinned ? <Ionicons name="pin" size={14} color={palette.text} /> : null}
              {note.isFavorite ? <Ionicons name="star" size={14} color="#D97706" /> : null}
            </View>
            <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 4 }]} numberOfLines={1}>
              {meta ?? folder?.name ?? "Personnel"}
            </Text>
          </View>

          {!disabledOpen ? <Ionicons name="chevron-forward" size={16} color={palette.textMuted} /> : null}
        </View>

        <Text style={[theme.typography.body, { color: palette.textMuted, lineHeight: 24 }]} numberOfLines={2}>
          {note.content || "Aucun contenu pour le moment."}
        </Text>

        {actions.length > 0 ? (
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            {actions.map((action) => {
              const isPrimary = action.variant === "primary";
              const isDanger = action.variant === "danger";

              return (
                <Pressable
                  key={action.label}
                  onPress={() => void action.onPress()}
                  style={{
                    flex: 1,
                    minHeight: 38,
                    borderRadius: 16,
                    backgroundColor: isPrimary || isDanger ? "#0F1B3A" : palette.chip,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text
                    style={[
                      theme.typography.label,
                      { color: isPrimary || isDanger ? "#FFFFFF" : theme.colors.text }
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}
