import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { useTheme } from "@/hooks/useTheme";
import { useNotesStore } from "@/store/useNotesStore";
import type { Folder } from "@/types/models";

interface FolderCardProps {
  folder: Folder;
}

export function FolderCard({ folder }: FolderCardProps) {
  const theme = useTheme();
  const notesCount = useNotesStore((state) => state.notes.filter((note) => note.folderId === folder.id && !note.isDeleted).length);

  return (
    <AppCard>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: theme.radius.pill,
              backgroundColor: folder.color
            }}
          />
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
