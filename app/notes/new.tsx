import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { getNoteIcon, noteIconOptions } from "@/services/notes/noteIcon";
import { noteTemplates } from "@/services/notes/noteTemplates";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import type { Note, NoteIconKey } from "@/types/models";

export default function NewNoteScreen() {
  const theme = useTheme();
  const folders = useFoldersStore((state) => state.folders);
  const createNote = useNotesStore((state) => state.createNote);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [iconKey, setIconKey] = useState<NoteIconKey>("auto");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("blank");
  const [showIconModal, setShowIconModal] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(folders[0]?.id ?? null);

  const previewNote = useMemo(
    () =>
      ({
        title,
        content,
        iconKey: iconKey === "auto" ? null : iconKey
      }) as Note,
    [content, iconKey, title]
  );
  const activeIcon = getNoteIcon(previewNote);

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
      iconKey: iconKey === "auto" ? null : iconKey,
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

          <Text style={[theme.typography.caption, { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }]}>
            Nouvelle note
          </Text>

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

        <View style={{ gap: theme.spacing.sm }}>
          <Text style={[theme.typography.caption, { color: "#B8AA9A", textTransform: "uppercase", letterSpacing: 2 }]}>
            Template
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
            {noteTemplates.map((template) => {
              const isActive = selectedTemplateKey === template.key;

              return (
                <Pressable
                  key={template.key}
                  onPress={() => {
                    setSelectedTemplateKey(template.key);
                    setTitle(template.title);
                    setContent(template.content);
                    setIconKey(template.iconKey);
                  }}
                  style={{
                    width: "30.8%",
                    minHeight: 64,
                    borderRadius: 18,
                    backgroundColor: isActive ? "#0F1B3A" : "#F7F4F1",
                    borderWidth: 1,
                    borderColor: isActive ? "#0F1B3A" : "#EFE6DF",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6
                  }}
                >
                  <Ionicons
                    name={template.iconKey === "auto" ? "document-text-outline" : noteIconOptions.find((option) => option.key === template.iconKey)?.icon ?? "document-text-outline"}
                    size={16}
                    color={isActive ? "#FFFFFF" : "#8C8178"}
                  />
                  <Text
                    style={[
                      theme.typography.caption,
                      { color: isActive ? "#FFFFFF" : "#8C8178", fontWeight: "600" }
                    ]}
                    numberOfLines={1}
                  >
                    {template.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.md }}>
          <Pressable
            onPress={() => setShowIconModal(true)}
            style={{
              width: 46,
              height: 46,
              borderRadius: 18,
              backgroundColor: activeIcon.backgroundColor,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={activeIcon.icon} size={21} color={activeIcon.color} />
          </Pressable>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Titre de la note..."
            placeholderTextColor="#B8B0A8"
            multiline
            scrollEnabled={false}
            style={[
              theme.typography.h1,
              {
                flex: 1,
                fontSize: 34,
                lineHeight: 40,
                color: theme.colors.text,
                paddingVertical: 0
              }
            ]}
          />
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Text style={[theme.typography.caption, { color: "#B8AA9A", textTransform: "uppercase", letterSpacing: 2 }]}>
            Dossier
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
            <Pressable
              onPress={() => setFolderId(null)}
              style={{
                paddingHorizontal: 14,
                minHeight: 38,
                borderRadius: 16,
                backgroundColor: folderId === null ? "#0F1B3A" : "#F1EFEC",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={[theme.typography.caption, { color: folderId === null ? "#FFFFFF" : "#8C8178", fontWeight: "600" }]}>
                Personnel
              </Text>
            </Pressable>

            {folders.map((folder) => (
              <Pressable
                key={folder.id}
                onPress={() => setFolderId(folder.id)}
                style={{
                  paddingHorizontal: 14,
                  minHeight: 38,
                  borderRadius: 16,
                  backgroundColor: folderId === folder.id ? "#0F1B3A" : "#F1EFEC",
                  alignItems: "center",
                  justifyContent: "center"
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
          </View>
        </View>

        <View style={{ paddingTop: theme.spacing.xs }}>
          <Text style={[theme.typography.caption, { color: "#B8AA9A", marginBottom: theme.spacing.sm }]}>
            {activeFolderLabel}
          </Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Ecris ici tes idees, rappels, listes ou pensees importantes..."
            placeholderTextColor="#B8B0A8"
            multiline
            scrollEnabled={false}
            textAlignVertical="top"
            style={[
              theme.typography.body,
              {
                minHeight: 360,
                color: "#203047",
                lineHeight: 32,
                paddingVertical: 0
              }
            ]}
          />
        </View>
      </View>

      <Modal visible={showIconModal} transparent animationType="fade" onRequestClose={() => setShowIconModal(false)}>
        <Pressable
          onPress={() => setShowIconModal(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 27, 58, 0.18)",
            justifyContent: "center",
            paddingHorizontal: 20
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 20,
              gap: theme.spacing.md,
              borderWidth: 1,
              borderColor: "#F1E8E2"
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: "#B8AA9A", letterSpacing: 2, textTransform: "uppercase" }
                ]}
              >
                Icone de la note
              </Text>
              <Pressable
                onPress={() => setShowIconModal(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 14,
                  backgroundColor: "#F7F4F1",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="close" size={18} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
              {noteIconOptions.map((option) => {
                const isActive = iconKey === option.key;

                return (
                  <Pressable
                    key={option.key}
                    onPress={() => {
                      setIconKey(option.key);
                      setShowIconModal(false);
                    }}
                    style={{
                      width: 72,
                      minHeight: 72,
                      borderRadius: 18,
                      backgroundColor: isActive ? "#0F1B3A" : "#F3F0EC",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7
                    }}
                  >
                    <View
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 14,
                        backgroundColor: isActive ? "rgba(255,255,255,0.14)" : option.backgroundColor,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Ionicons name={option.icon} size={15} color={isActive ? "#FFFFFF" : option.color} />
                    </View>
                    <Text
                      style={[
                        theme.typography.caption,
                        { color: isActive ? "#FFFFFF" : theme.colors.text, fontSize: 11 }
                      ]}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
