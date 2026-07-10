/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        FolderCard.tsx
 * @description Renders a folder summary card and its interaction states.
 *
 * @project     BlockyNotes
 * @module      Components / UI
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-03-13
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
import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { useTheme } from "@/hooks/useTheme";
import { getFolderIcon } from "@/services/folders/folderIcon";
import { useNotesStore } from "@/store/useNotesStore";
import type { Folder } from "@/types/models";

interface FolderCardProps {
  folder: Folder;
}

export function FolderCard({ folder }: FolderCardProps) {
  const theme = useTheme();
  const notesCount = useNotesStore((state) => state.notes.filter((note) => note.folderId === folder.id && !note.isDeleted).length);
  const folderIcon = getFolderIcon(folder);

  return (
    <AppCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 16,
              backgroundColor: folderIcon.backgroundColor,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={folderIcon.icon} size={18} color={folderIcon.color} />
          </View>
          <View>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{folder.name}</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
              {notesCount} note(s)
            </Text>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
