import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const folders = useFoldersStore((state) => state.folders);
  const note = useNotesStore((state) => state.notes.find((entry) => entry.id === id));
  const updateNote = useNotesStore((state) => state.updateNote);
  const archiveNote = useNotesStore((state) => state.archiveNote);
  const restoreNote = useNotesStore((state) => state.restoreNote);
  const moveNote = useNotesStore((state) => state.moveNote);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [folderId, setFolderId] = useState<string | null>(note?.folderId ?? null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty">("saved");
  const [showActions, setShowActions] = useState(false);
  const [showMovePicker, setShowMovePicker] = useState(false);
  const isFirstSync = useRef(true);

  useEffect(() => {
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setFolderId(note?.folderId ?? null);
    setSaveState("saved");
    isFirstSync.current = true;
  }, [note]);

  useEffect(() => {
    if (!note) {
      return;
    }

    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }

    setSaveState("dirty");

    const timeout = setTimeout(async () => {
      setSaveState("saving");
      await updateNote(note.id, {
        title: title.trim(),
        content,
        folderId
      });
      setSaveState("saved");
    }, 450);

    return () => clearTimeout(timeout);
  }, [content, folderId, note, title, updateNote]);

  const statusLabel = useMemo(() => {
    if (saveState === "saving") {
      return "Sauvegarde...";
    }

    if (saveState === "dirty") {
      return "Modifications locales";
    }

    return "Enregistre a l'instant";
  }, [saveState]);

  if (!note) {
    return (
      <ScreenContainer>
        <EmptyState title="Note introuvable" description="Cette note n'existe plus." />
      </ScreenContainer>
    );
  }

  const handleMoveToFolder = async (nextFolderId: string | null) => {
    setFolderId(nextFolderId);
    await moveNote(note.id, nextFolderId);
    setShowMovePicker(false);
    setShowActions(false);
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

          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Pressable
              onPress={() => void toggleFavorite(note.id)}
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
              <Ionicons
                name={note.isFavorite ? "star" : "star-outline"}
                size={18}
                color={note.isFavorite ? "#E11D48" : theme.colors.text}
              />
            </Pressable>
            <Pressable
              onPress={() => {
                setShowMovePicker(false);
                setShowActions((current) => !current);
              }}
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
              <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text
            style={[
              theme.typography.caption,
              { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
            ]}
          >
            Note
          </Text>
          <Text style={[theme.typography.caption, { color: "#10B981" }]}>{statusLabel}</Text>
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Titre"
          placeholderTextColor="#B8AA9A"
          multiline
          style={[
            theme.typography.h1,
            {
              color: theme.colors.text,
              fontSize: 34,
              lineHeight: 40,
              paddingVertical: 0
            }
          ]}
        />

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Commence a ecrire..."
          placeholderTextColor="#B8AA9A"
          multiline
          textAlignVertical="top"
          style={[
            theme.typography.body,
            {
              color: "#203047",
              minHeight: 360,
              lineHeight: 32,
              paddingVertical: 0
            }
          ]}
        />

      </View>
      <Modal visible={showActions} transparent animationType="fade" onRequestClose={() => setShowActions(false)}>
        <Pressable
          onPress={() => {
            setShowActions(false);
            setShowMovePicker(false);
          }}
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
                Actions
              </Text>
              <Pressable
                onPress={() => {
                  setShowActions(false);
                  setShowMovePicker(false);
                }}
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

            <View style={{ gap: theme.spacing.sm }}>
              <Pressable
                onPress={() => {
                  void toggleFavorite(note.id);
                  setShowActions(false);
                }}
                style={{
                  minHeight: 52,
                  borderRadius: 18,
                  backgroundColor: "#F7F4F1",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  paddingHorizontal: 16
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 12,
                      backgroundColor: "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons
                      name={note.isFavorite ? "star" : "star-outline"}
                      size={16}
                      color={note.isFavorite ? "#E11D48" : theme.colors.text}
                    />
                  </View>
                  <Text style={[theme.typography.label, { color: theme.colors.text }]}>
                    {note.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#A39486" />
              </Pressable>

              <Pressable
                onPress={() => {
                  void (note.isArchived ? restoreNote(note.id) : archiveNote(note.id));
                  setShowActions(false);
                }}
                style={{
                  minHeight: 52,
                  borderRadius: 18,
                  backgroundColor: "#F7F4F1",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  paddingHorizontal: 16
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 12,
                      backgroundColor: "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons
                      name={note.isArchived ? "archive" : "archive-outline"}
                      size={16}
                      color={theme.colors.text}
                    />
                  </View>
                  <Text style={[theme.typography.label, { color: theme.colors.text }]}>
                    {note.isArchived ? "Restaurer la note" : "Archiver la note"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#A39486" />
              </Pressable>

              <Pressable
                onPress={() => setShowMovePicker((current) => !current)}
                style={{
                  minHeight: 52,
                  borderRadius: 18,
                  backgroundColor: showMovePicker ? "#EEE8FF" : "#F7F4F1",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  paddingHorizontal: 16
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 12,
                      backgroundColor: "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="folder-open-outline" size={16} color={theme.colors.text} />
                  </View>
                  <Text style={[theme.typography.label, { color: theme.colors.text }]}>
                    Mettre dans un dossier
                  </Text>
                </View>
                <Ionicons name={showMovePicker ? "chevron-up" : "chevron-forward"} size={16} color="#A39486" />
              </Pressable>

              {showMovePicker ? (
                <View
                  style={{
                    gap: theme.spacing.sm,
                    paddingTop: theme.spacing.xs
                  }}
                >
                  <Text
                    style={[
                      theme.typography.caption,
                      { color: "#B8AA9A", textTransform: "uppercase", letterSpacing: 2 }
                    ]}
                  >
                    Dossiers
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
                    <Pressable
                      onPress={() => void handleMoveToFolder(null)}
                      style={{
                        paddingHorizontal: 14,
                        minHeight: 40,
                        borderRadius: 16,
                        backgroundColor: folderId === null ? "#0F1B3A" : "#F3F0EC",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Text style={[theme.typography.label, { color: folderId === null ? "#FFFFFF" : theme.colors.text }]}>
                        Sans dossier
                      </Text>
                    </Pressable>

                    {folders.map((folder) => (
                      <Pressable
                        key={folder.id}
                        onPress={() => void handleMoveToFolder(folder.id)}
                        style={{
                          paddingHorizontal: 14,
                          minHeight: 40,
                          borderRadius: 16,
                          backgroundColor: folderId === folder.id ? "#0F1B3A" : "#F3F0EC",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Text
                          style={[
                            theme.typography.label,
                            { color: folderId === folder.id ? "#FFFFFF" : theme.colors.text }
                          ]}
                        >
                          {folder.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Pressable
                onPress={() => {
                  setShowActions(false);
                  router.push({
                    pathname: "/notes/delete/[id]",
                    params: { id: note.id }
                  });
                }}
                style={{
                  minHeight: 52,
                  borderRadius: 18,
                  backgroundColor: "#0F1B3A",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  paddingHorizontal: 16
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 12,
                      backgroundColor: "rgba(255,255,255,0.12)",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                  </View>
                  <Text style={[theme.typography.label, { color: "#FFFFFF" }]}>Supprimer</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
