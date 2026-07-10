/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        CollectionNoteCard.tsx
 * @description Renders a compact note item for archive and trash collections.
 *
 * @project     BlockyNotes
 * @module      Components / UI
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-04-30
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { useTheme } from "@/hooks/useTheme";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { isNoteLocked } from "@/services/security/locks";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getAppPalette } from "@/theme/appPalette";
import type { Note } from "@/types/models";

interface CollectionNoteAction {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
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
  const settings = useSettingsStore((state) => state.settings);
  const noteIcon = getNoteIcon(note);
  const locked = isNoteLocked(note, folder, settings);
  const stackActions = actions.some((action) => action.label.length > 18);

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
            <Ionicons name={locked ? "lock-closed" : noteIcon.icon} size={17} color={locked ? "#0F1B3A" : noteIcon.color} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
                {note.title || "Sans titre"}
              </Text>
              {note.isPinned ? <Ionicons name="pin" size={14} color={palette.text} /> : null}
              {note.isFavorite ? <Ionicons name="star" size={14} color="#D97706" /> : null}
              {locked ? <Ionicons name="shield-checkmark" size={14} color="#4F6EF7" /> : null}
            </View>
            <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 4 }]} numberOfLines={1}>
              {locked ? "Contenu masque - code requis" : meta ?? folder?.name ?? "Personnel"}
            </Text>
          </View>

          {!disabledOpen ? <Ionicons name="chevron-forward" size={16} color={palette.textMuted} /> : null}
        </View>

        <Text style={[theme.typography.body, { color: palette.textMuted, lineHeight: 24 }]} numberOfLines={2}>
          {locked ? "Cette note est securisee. Deverrouille-la pour afficher son contenu." : note.content || "Aucun contenu pour le moment."}
        </Text>

        {actions.length > 0 ? (
          <View style={{ flexDirection: stackActions ? "column" : "row", gap: theme.spacing.sm }}>
            {actions.map((action) => {
              const isPrimary = action.variant === "primary";
              const isDanger = action.variant === "danger";
              const backgroundColor = isPrimary ? "#0F1B3A" : isDanger ? "#FFE6E6" : palette.chip;
              const textColor = isPrimary ? "#FFFFFF" : isDanger ? "#FF3434" : theme.colors.text;

              return (
                <Pressable
                  key={action.label}
                  onPress={() => void action.onPress()}
                  style={{
                    flex: stackActions ? undefined : 1,
                    minHeight: 38,
                    borderRadius: 16,
                    backgroundColor,
                    flexDirection: "row",
                    gap: 6,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {action.icon ? <Ionicons name={action.icon} size={14} color={textColor} /> : null}
                  <Text
                    style={[
                      theme.typography.label,
                      { color: textColor }
                    ]}
                    numberOfLines={1}
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
