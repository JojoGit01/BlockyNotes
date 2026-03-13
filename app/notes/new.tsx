import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";

export default function NewNoteScreen() {
  const theme = useTheme();
  const folders = useFoldersStore((state) => state.folders);
  const createNote = useNotesStore((state) => state.createNote);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [folderId, setFolderId] = useState<string | null>(folders[0]?.id ?? null);

  const activeFolderLabel = useMemo(() => {
    if (folderId === null) {
      return "Personnel";
    }

    return folders.find((folder) => folder.id === folderId)?.name ?? "Personnel";
  }, [folderId, folders]);

  const handleSubmit = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert("Note vide", "Ajoute au moins un titre ou un contenu.");
      return;
    }

    const note = await createNote({
      title,
      content,
      folderId
    });

    router.replace(`/notes/${note.id}`);
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
              backgroundColor: "#F4F1EE",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </Pressable>

          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Nouvelle note</Text>

          <Pressable
            onPress={() => void handleSubmit()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: "#0F1B3A",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="checkmark" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <AppCard
          style={{
            borderRadius: 30,
            paddingHorizontal: 18,
            paddingVertical: 18,
            backgroundColor: "#FBFAF8"
          }}
        >
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titre de la note..."
            placeholderTextColor="#B8B0A8"
            multiline
            style={[
              theme.typography.h1,
              {
                fontSize: 28,
                lineHeight: 34,
                color: theme.colors.text,
                backgroundColor: "#F3F0EC",
                borderRadius: 20,
                paddingHorizontal: 18,
                paddingVertical: 16
              }
            ]}
          />

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <Pressable
              onPress={() => setFolderId(null)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                backgroundColor: folderId === null ? "#0F1B3A" : "#F1EFEC"
              }}
            >
              <Text style={[theme.typography.caption, { color: folderId === null ? "#FFFFFF" : "#8C8178", fontWeight: "600" }]}>
                Personnel
              </Text>
            </Pressable>

            {folders.slice(0, 2).map((folder) => (
              <Pressable
                key={folder.id}
                onPress={() => setFolderId(folder.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 16,
                  backgroundColor: folderId === folder.id ? "#0F1B3A" : "#F1EFEC"
                }}
              >
                <Text
                  style={[
                    theme.typography.caption,
                    { color: folderId === folder.id ? "#FFFFFF" : "#8C8178", fontWeight: "600" }
                  ]}
                >
                  {folder.name}
                </Text>
              </Pressable>
            ))}

            <Pressable
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                backgroundColor: "#F1EFEC"
              }}
            >
              <Text style={[theme.typography.caption, { color: "#8C8178", fontWeight: "600" }]}>
                Ajouter un tag
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              marginTop: 18,
              borderRadius: 24,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "#DDD5CE",
              minHeight: 260,
              paddingHorizontal: 18,
              paddingVertical: 18
            }}
          >
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Ecris ici tes idees, rappels, listes ou pensees importantes..."
              placeholderTextColor="#B8B0A8"
              multiline
              textAlignVertical="top"
              style={[
                theme.typography.body,
                {
                  minHeight: 220,
                  color: "#203047",
                  lineHeight: 34,
                  paddingVertical: 0
                }
              ]}
            />
          </View>

          <Text style={[theme.typography.caption, { color: "#B8AA9A", marginTop: theme.spacing.md }]}>
            Dossier actif: {activeFolderLabel}
          </Text>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
