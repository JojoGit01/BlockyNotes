import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useFoldersStore } from "@/store/useFoldersStore";
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

  return noteDate.toLocaleDateString("fr-FR", { weekday: "short" });
};

export default function FolderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isPersonalFolder = id === "personal";
  const folder = useFoldersStore((state) => state.folders.find((entry) => entry.id === id));
  const updateFolder = useFoldersStore((state) => state.updateFolder);
  const allNotes = useNotesStore((state) => state.notes);
  const [isEditingName, setIsEditingName] = useState(false);
  const [folderName, setFolderName] = useState(folder?.name ?? "");
  const notes = useMemo(
    () =>
      [...allNotes]
        .filter((note) => (isPersonalFolder ? note.folderId === null : note.folderId === id) && !note.isDeleted)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [allNotes, id, isPersonalFolder]
  );

  useEffect(() => {
    setFolderName(folder?.name ?? "");
  }, [folder]);

  if (!folder && !isPersonalFolder) {
    return (
      <ScreenContainer>
        <EmptyState title="Dossier introuvable" description="Ce dossier n'existe plus." />
      </ScreenContainer>
    );
  }

  const handleSaveFolderName = async () => {
    const nextName = folderName.trim();

    if (!folder || !nextName || nextName === folder.name) {
      if (!folder) {
        setIsEditingName(false);
        return;
      }

      setFolderName(folder.name);
      setIsEditingName(false);
      return;
    }

    await updateFolder(folder.id, { name: nextName });
    setIsEditingName(false);
  };

  return (
    <ScreenContainer scrollable>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 120 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#ECE6E0",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
          </Pressable>

          {!isPersonalFolder && folder ? (
            <Pressable
              onPress={() => router.push({ pathname: "/folders/delete/[id]", params: { id: folder.id } })}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#ECE6E0",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.text} />
            </Pressable>
          ) : null}
        </View>

        <AppCard
          style={{
            borderRadius: 28,
            paddingHorizontal: 20,
            paddingVertical: 20,
            backgroundColor: "#F7F4FB"
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: "#8B5CF6",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name={isPersonalFolder ? "person-outline" : "file-tray-outline"} size={18} color="#FFFFFF" />
            </View>

            {!isPersonalFolder ? (
              <Pressable
                onPress={() => {
                  if (isEditingName) {
                    void handleSaveFolderName();
                    return;
                  }

                  setIsEditingName(true);
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  backgroundColor: "#FFFFFF",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons
                  name={isEditingName ? "checkmark" : "create-outline"}
                  size={18}
                  color={theme.colors.text}
                />
              </Pressable>
            ) : null}
          </View>

          <Text
            style={[
              theme.typography.caption,
              { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase", marginTop: 16 }
            ]}
          >
            Dossier
          </Text>
          {isEditingName && folder ? (
            <TextInput
              value={folderName}
              onChangeText={setFolderName}
              onBlur={() => void handleSaveFolderName()}
              autoFocus
              placeholder="Nom du dossier"
              placeholderTextColor="#B8AA9A"
              style={[
                theme.typography.h1,
                {
                  color: theme.colors.text,
                  marginTop: 8,
                  fontSize: 24,
                  lineHeight: 30,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 10
                }
              ]}
            />
          ) : !isPersonalFolder && folder ? (
            <Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: 8, fontSize: 24, lineHeight: 30 }]}>
              {folder.name}
            </Text>
          ) : isPersonalFolder ? (
            <Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: 8, fontSize: 24, lineHeight: 30 }]}>
              Personnel
            </Text>
          ) : null}
          <Text style={[theme.typography.body, { color: "#6C7385", marginTop: 14 }]}>
            {isPersonalFolder
              ? `${notes.length} note${notes.length > 1 ? "s" : ""} sans dossier`
              : `${notes.length} note${notes.length > 1 ? "s" : ""} rangee${notes.length > 1 ? "s" : ""} dans ce dossier`}
          </Text>
        </AppCard>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Notes du dossier</Text>
          <Text style={[theme.typography.body, { color: "#B5A89C" }]}>Trier</Text>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          {notes.length === 0 ? (
            <EmptyState title="Aucune note" description="Ajoute ou deplace une note dans ce dossier." />
          ) : (
            notes.map((note) => (
              <AppCard
                key={note.id}
                onPress={() => router.push(`/notes/${note.id}`)}
                style={{
                  borderRadius: 24,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  backgroundColor: "#FFFFFF"
                }}
              >
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]} numberOfLines={1}>
                      {note.title || "Sans titre"}
                    </Text>
                    <Text style={[theme.typography.body, { color: "#B5A89C", marginLeft: 12 }]}>
                      {dayLabel(note.updatedAt)}
                    </Text>
                  </View>
                  <Text style={[theme.typography.body, { color: "#596579" }]} numberOfLines={2}>
                    {note.content || "Ouvre la note pour la modifier."}
                  </Text>
                </View>
              </AppCard>
            ))
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
