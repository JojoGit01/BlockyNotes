import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import type { Folder } from "@/types/models";

function FolderListItem({ folder }: { folder: Folder }) {
  const theme = useTheme();
  const notesCount = useNotesStore(
    (state) => state.notes.filter((note) => note.folderId === folder.id && !note.isDeleted).length
  );

  return (
    <AppCard
      onPress={() => router.push({ pathname: "/folders/[id]", params: { id: folder.id } })}
      style={{
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF"
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: `${folder.color}22`,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name="file-tray-outline" size={18} color={folder.color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{folder.name}</Text>
          <Text style={[theme.typography.body, { color: "#8E8178", marginTop: 2 }]}>
            {notesCount} note{notesCount > 1 ? "s" : ""}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color="#B8AA9A" />
      </View>
    </AppCard>
  );
}

export default function FoldersScreen() {
  const theme = useTheme();
  const folders = useFoldersStore((state) => state.folders);
  const createFolder = useFoldersStore((state) => state.createFolder);
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Nom requis", "Ajoute un nom de dossier.");
      return;
    }

    await createFolder({ name });
    setName("");
  };

  return (
    <ScreenContainer scrollable>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 120 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                theme.typography.caption,
                { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
              ]}
            >
              Organisation
            </Text>
            <Text
              style={[
                theme.typography.h1,
                { color: theme.colors.text, marginTop: theme.spacing.sm, fontSize: 38, lineHeight: 44 }
              ]}
            >
              Dossiers
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Pressable
              onPress={() => router.push("/folders/trash")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: "#F4F1EE",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/folders/archives")}
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
        </View>

        <AppCard
          style={{
            borderRadius: 28,
            paddingHorizontal: 18,
            paddingVertical: 18,
            backgroundColor: "#FBFAF8"
          }}
        >
          <Text
            style={[
              theme.typography.caption,
              { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
            ]}
          >
            Creer un dossier
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nom du dossier..."
            placeholderTextColor="#B8B0A8"
            style={[
              theme.typography.body,
              {
                marginTop: theme.spacing.md,
                backgroundColor: "#F3F0EC",
                borderRadius: 18,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: theme.colors.text
              }
            ]}
          />

          <View style={{ flexDirection: "row", gap: theme.spacing.md, marginTop: theme.spacing.md }}>
            <Pressable
              onPress={() => void handleCreate()}
              style={{
                flex: 1,
                backgroundColor: "#0F1B3A",
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                minHeight: 48
              }}
            >
              <Text style={[theme.typography.label, { color: "#FFFFFF" }]}>Creer</Text>
            </Pressable>

            <Pressable
              onPress={() => setName("")}
              style={{
                paddingHorizontal: 18,
                minHeight: 48,
                borderRadius: 18,
                backgroundColor: "#F3F0EC",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={[theme.typography.label, { color: theme.colors.text }]}>Annuler</Text>
            </Pressable>
          </View>
        </AppCard>

        <View style={{ gap: theme.spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Mes dossiers</Text>
            <Text style={[theme.typography.body, { color: "#B8AA9A" }]}>Gerer</Text>
          </View>

          {folders.length === 0 ? (
            <EmptyState title="Aucun dossier" description="Cree un dossier pour organiser tes notes." />
          ) : (
            folders.map((folder) => <FolderListItem key={folder.id} folder={folder} />)
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
