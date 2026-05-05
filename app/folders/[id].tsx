import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/ui/AppBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { folderIconOptions, getFolderIcon } from "@/services/folders/folderIcon";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import type { FolderIconKey, Note } from "@/types/models";

type FolderModalMode = "options" | "rename" | "icon" | "move" | "delete";

const dayLabel = (isoDate?: string) => {
  if (!isoDate) {
    return "aujourd'hui";
  }

  const noteDate = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(noteDate.getFullYear(), noteDate.getMonth(), noteDate.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diffDays <= 0) {
    return "aujourd'hui";
  }

  if (diffDays === 1) {
    return "hier";
  }

  return noteDate.toLocaleDateString("fr-FR", { weekday: "long" });
};

const noteDateLabel = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

const noteElementCount = (note: Note) => {
  const count = note.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;

  return Math.max(count, note.title.trim() ? 1 : 0);
};

function SheetHandle() {
  return (
    <View
      style={{
        alignSelf: "center",
        width: 48,
        height: 5,
        borderRadius: 4,
        backgroundColor: "#C9CBD5",
        marginBottom: 4
      }}
    />
  );
}

function OptionRow({
  title,
  description,
  icon,
  iconColor,
  iconBackground,
  danger,
  onPress
}: {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.78 : 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 14
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 15,
          backgroundColor: iconBackground,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: "#E6E7EC", paddingBottom: 16 }}>
        <Text
          style={[
            theme.typography.h3,
            { color: danger ? "#FF3434" : "#0F1B3A", fontSize: 16, lineHeight: 21, fontWeight: "900" }
          ]}
        >
          {title}
        </Text>
        <Text style={[theme.typography.body, { color: "#8D8F99", marginTop: 2 }]}>{description}</Text>
      </View>
    </Pressable>
  );
}

export default function FolderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isPersonalFolder = id === "personal";
  const folder = useFoldersStore((state) => state.folders.find((entry) => entry.id === id));
  const folders = useFoldersStore((state) => state.folders);
  const updateFolder = useFoldersStore((state) => state.updateFolder);
  const deleteFolder = useFoldersStore((state) => state.deleteFolder);
  const moveNote = useNotesStore((state) => state.moveNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const allNotes = useNotesStore((state) => state.notes);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState<FolderModalMode>("options");
  const [renameName, setRenameName] = useState(folder?.name ?? "");
  const [editIconKey, setEditIconKey] = useState<FolderIconKey>("briefcase");
  const notes = useMemo(
    () =>
      [...allNotes]
        .filter((note) => (isPersonalFolder ? note.folderId === null : note.folderId === id) && !note.isDeleted)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [allNotes, id, isPersonalFolder]
  );
  const folderIcon = isPersonalFolder ? null : getFolderIcon(folder);
  const title = isPersonalFolder ? "Personnel" : folder?.name ?? "";
  const latestActivity = [folder?.updatedAt, ...notes.map((note) => note.updatedAt)].filter(Boolean).sort().at(-1);
  const destinationFolders = folders.filter((entry) => entry.id !== folder?.id);

  if (!folder && !isPersonalFolder) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppBackground />
        <View style={{ flex: 1, padding: 18 }}>
          <EmptyState title="Dossier introuvable" description="Ce dossier n'existe plus." />
        </View>
      </SafeAreaView>
    );
  }

  const openOptions = () => {
    if (folder) {
      setRenameName(folder.name);
      setEditIconKey(getFolderIcon(folder).key);
    }

    setFolderModalMode("options");
    setShowOptionsModal(true);
  };

  const closeOptions = () => {
    setShowOptionsModal(false);
    setFolderModalMode("options");
  };

  const goToNewNote = () => {
    router.push({ pathname: "/notes/new", params: { folderId: isPersonalFolder ? "personal" : id } });
  };

  const handleRenameFolder = async () => {
    if (!folder) {
      return;
    }

    const nextName = renameName.trim();

    if (!nextName) {
      Alert.alert("Nom requis", "Ajoute un nom de dossier.");
      return;
    }

    await updateFolder(folder.id, { name: nextName });
    closeOptions();
  };

  const handleUpdateFolderIcon = async () => {
    if (!folder) {
      return;
    }

    await updateFolder(folder.id, { iconKey: editIconKey });
    closeOptions();
  };

  const handleMoveFolderNotes = async (folderId: string | null) => {
    await Promise.all(notes.map((note) => moveNote(note.id, folderId)));
    closeOptions();
  };

  const handleDeleteFolder = async () => {
    if (!folder) {
      return;
    }

    await Promise.all(notes.map((note) => deleteNote(note.id)));
    await deleteFolder(folder.id);
    closeOptions();
    router.replace("/folders");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBackground />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: insets.bottom + 130
        }}
      >
        <View style={{ gap: 18 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => ({
                width: 52,
                height: 52,
                borderRadius: 18,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.82 : 1,
                shadowColor: "#0F172A",
                shadowOpacity: 0.05,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 5
              })}
            >
              <Ionicons name="arrow-back" size={20} color="#0F1B3A" />
            </Pressable>

            <Pressable
              onPress={openOptions}
              style={({ pressed }) => ({
                width: 52,
                height: 52,
                borderRadius: 18,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.82 : 1,
                shadowColor: "#0F172A",
                shadowOpacity: 0.05,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 5
              })}
            >
              <Ionicons name="ellipsis-horizontal" size={21} color="#0F1B3A" />
            </Pressable>
          </View>

          <View
            style={{
              minHeight: 182,
              borderRadius: 26,
              backgroundColor: "#0F1B3A",
              overflow: "hidden",
              paddingHorizontal: 18,
              paddingVertical: 18,
              justifyContent: "space-between",
              shadowColor: "#0F172A",
              shadowOpacity: 0.12,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 12 },
              elevation: 8
            }}
          >
            <View
              style={{
                position: "absolute",
                right: -44,
                top: -28,
                width: 190,
                height: 190,
                borderRadius: 95,
                backgroundColor: "rgba(124, 63, 242, 0.88)"
              }}
            />

            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 19,
                backgroundColor: "rgba(255,255,255,0.14)",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons
                name={isPersonalFolder ? "folder-open-outline" : folderIcon?.icon ?? "folder-open-outline"}
                size={24}
                color={isPersonalFolder ? "#FFFFFF" : folderIcon?.color ?? "#FFFFFF"}
              />
            </View>

            <View>
              <Text style={{ color: "#FFFFFF", fontSize: 28, lineHeight: 34, fontWeight: "900" }} numberOfLines={1}>
                {title}
              </Text>
              <Text style={[theme.typography.body, { color: "#FFFFFF", marginTop: 3 }]}>
                {notes.length} note{notes.length > 1 ? "s" : ""} dans ce dossier - Modifie {dayLabel(latestActivity)}
              </Text>
              <View
                style={{
                  alignSelf: "flex-start",
                  marginTop: 14,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  paddingHorizontal: 10,
                  paddingVertical: 7
                }}
              >
                <Text style={[theme.typography.caption, { color: "#FFFFFF", fontWeight: "900" }]}>
                  {notes.length === 0 ? "Aucune note" : title}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
            <Text style={{ color: "#0F1B3A", fontSize: 21, lineHeight: 26, fontWeight: "900" }}>Notes du dossier</Text>
            <Pressable onPress={goToNewNote} hitSlop={10}>
              <Text style={[theme.typography.label, { color: "#0F1B3A", fontWeight: "900" }]}>+ Note</Text>
            </Pressable>
          </View>

          {notes.length === 0 ? (
            <View
              style={{
                minHeight: 240,
                borderRadius: 24,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                padding: 26,
                shadowColor: "#0F172A",
                shadowOpacity: 0.06,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 12 },
                elevation: 6
              }}
            >
              <View
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 21,
                  backgroundColor: "#E9ECF3",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 18
                }}
              >
                <Ionicons name="create-outline" size={32} color="#FF6B7A" />
              </View>
              <Text style={{ color: "#0F1B3A", fontSize: 21, lineHeight: 26, fontWeight: "900", textAlign: "center" }}>
                Aucune note ici
              </Text>
              <Text style={[theme.typography.body, { color: "#8D8F99", textAlign: "center", marginTop: 10, lineHeight: 24 }]}>
                {"Ajoute une note dans ce dossier pour commencer a l'organiser."}
              </Text>
              <Pressable
                onPress={goToNewNote}
                style={({ pressed }) => ({
                  minHeight: 50,
                  borderRadius: 17,
                  backgroundColor: "#0F1B3A",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 18,
                  marginTop: 20,
                  opacity: pressed ? 0.86 : 1
                })}
              >
                <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Creer une note</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {notes.map((note) => {
                const noteIcon = getNoteIcon(note);
                const count = noteElementCount(note);

                return (
                  <Pressable
                    key={note.id}
                    onPress={() => router.push(`/notes/${note.id}`)}
                    style={({ pressed }) => ({
                      minHeight: 72,
                      borderRadius: 21,
                      backgroundColor: "#FFFFFF",
                      paddingHorizontal: 14,
                      paddingVertical: 11,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      opacity: pressed ? 0.88 : 1,
                      shadowColor: "#0F172A",
                      shadowOpacity: 0.06,
                      shadowRadius: 18,
                      shadowOffset: { width: 0, height: 10 },
                      elevation: 5
                    })}
                  >
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 17,
                        backgroundColor: noteIcon.backgroundColor,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                        <Ionicons name={noteIcon.icon} size={21} color={noteIcon.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[theme.typography.h3, { color: "#0F1B3A", fontSize: 16, lineHeight: 21, fontWeight: "900" }]}
                        numberOfLines={1}
                      >
                        {note.title || "Sans titre"}
                      </Text>
                      <Text style={[theme.typography.caption, { color: "#8D8F99", marginTop: 1 }]} numberOfLines={1}>
                        {count} element{count > 1 ? "s" : ""} - {noteDateLabel(note.updatedAt)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#A4A7B0" />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showOptionsModal} transparent animationType="slide" onRequestClose={closeOptions}>
        <Pressable
          onPress={closeOptions}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 27, 58, 0.22)",
            justifyContent: "flex-end"
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingHorizontal: 26,
              paddingTop: 12,
              paddingBottom: insets.bottom + 26,
              gap: 18
            }}
          >
            <SheetHandle />

            {folderModalMode === "options" ? (
              <>
                <Text style={{ color: "#0F1B3A", fontSize: 27, lineHeight: 34, fontWeight: "900" }}>
                  Options du dossier
                </Text>
                <View style={{ gap: 16, paddingTop: 6 }}>
                  {!isPersonalFolder ? (
                    <>
                      <OptionRow
                        title="Renommer"
                        description="Changer le nom du dossier"
                        icon="pencil"
                        iconColor="#0F1B3A"
                        iconBackground="#F0E6FF"
                        onPress={() => setFolderModalMode("rename")}
                      />
                      <OptionRow
                        title="Changer icone"
                        description="Modifier le style du dossier"
                        icon="color-palette"
                        iconColor="#FF6B7A"
                        iconBackground="#EAF7FF"
                        onPress={() => setFolderModalMode("icon")}
                      />
                    </>
                  ) : null}
                  <OptionRow
                    title="Deplacer les notes"
                    description="Envoyer vers un autre dossier"
                    icon="arrow-redo"
                    iconColor="#F97316"
                    iconBackground="#FFF1DC"
                    onPress={() => setFolderModalMode("move")}
                  />
                  {!isPersonalFolder ? (
                    <OptionRow
                      title="Supprimer"
                      description="Supprimer ce dossier"
                      icon="trash-outline"
                      iconColor="#FF4E91"
                      iconBackground="#FFF0F7"
                      danger
                      onPress={() => setFolderModalMode("delete")}
                    />
                  ) : null}
                </View>
              </>
            ) : null}

            {folderModalMode === "rename" && folder ? (
              <>
                <Text style={{ color: "#0F1B3A", fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Renommer</Text>
                <TextInput
                  value={renameName}
                  onChangeText={setRenameName}
                  autoFocus
                  placeholder="Nom du dossier"
                  placeholderTextColor="#777982"
                  style={[
                    theme.typography.label,
                    {
                      minHeight: 56,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: "#E6E7EC",
                      paddingHorizontal: 16,
                      color: "#0F1B3A",
                      fontWeight: "800"
                    }
                  ]}
                />
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => setFolderModalMode("options")}
                    style={{
                      flex: 1,
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: "#F4F5F9",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: "#0F1B3A", fontWeight: "900" }]}>Retour</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleRenameFolder()}
                    style={{
                      flex: 1,
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: "#0F1B3A",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Enregistrer</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {folderModalMode === "icon" && folder ? (
              <>
                <Text style={{ color: "#0F1B3A", fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Changer icone</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {folderIconOptions.map((option) => {
                    const isSelected = option.key === editIconKey;

                    return (
                      <Pressable
                        key={option.key}
                        onPress={() => setEditIconKey(option.key)}
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 18,
                          backgroundColor: option.backgroundColor,
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: "#0F1B3A",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name={option.icon} size={23} color={option.color} />
                      </Pressable>
                    );
                  })}
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => setFolderModalMode("options")}
                    style={{
                      flex: 1,
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: "#F4F5F9",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: "#0F1B3A", fontWeight: "900" }]}>Retour</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleUpdateFolderIcon()}
                    style={{
                      flex: 1,
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: "#0F1B3A",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Appliquer</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {folderModalMode === "move" ? (
              <>
                <Text style={{ color: "#0F1B3A", fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Deplacer les notes</Text>
                <Text style={[theme.typography.body, { color: "#8D8F99" }]}>
                  {notes.length} note{notes.length > 1 ? "s" : ""} depuis {title}
                </Text>
                <View style={{ gap: 10 }}>
                  {!isPersonalFolder ? (
                    <Pressable
                      onPress={() => void handleMoveFolderNotes(null)}
                      style={{
                        minHeight: 52,
                        borderRadius: 18,
                        backgroundColor: "#F4F5F9",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        paddingHorizontal: 14
                      }}
                    >
                      <Ionicons name="folder-open-outline" size={20} color="#4F6EF7" />
                      <Text style={[theme.typography.label, { color: "#0F1B3A", fontWeight: "900" }]}>Personnel</Text>
                    </Pressable>
                  ) : null}
                  {destinationFolders.map((entry) => {
                    const entryIcon = getFolderIcon(entry);

                    return (
                      <Pressable
                        key={entry.id}
                        onPress={() => void handleMoveFolderNotes(entry.id)}
                        style={{
                          minHeight: 52,
                          borderRadius: 18,
                          backgroundColor: "#F4F5F9",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          paddingHorizontal: 14
                        }}
                      >
                        <View
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 13,
                            backgroundColor: entryIcon.backgroundColor,
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Ionicons name={entryIcon.icon} size={17} color={entryIcon.color} />
                        </View>
                        <Text style={[theme.typography.label, { color: "#0F1B3A", fontWeight: "900" }]}>
                          {entry.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Pressable
                  onPress={() => setFolderModalMode("options")}
                  style={{
                    minHeight: 54,
                    borderRadius: 18,
                    backgroundColor: "#0F1B3A",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Retour</Text>
                </Pressable>
              </>
            ) : null}

            {folderModalMode === "delete" && folder ? (
              <>
                <Text style={{ color: "#0F1B3A", fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Supprimer</Text>
                <Text style={[theme.typography.body, { color: "#8D8F99", lineHeight: 24 }]}>
                  Le dossier {folder.name} sera supprime. Ses {notes.length} note{notes.length > 1 ? "s" : ""} partiront
                  dans la corbeille.
                </Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => setFolderModalMode("options")}
                    style={{
                      flex: 1,
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: "#F4F5F9",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: "#0F1B3A", fontWeight: "900" }]}>Annuler</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleDeleteFolder()}
                    style={{
                      flex: 1,
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: "#FF3434",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Supprimer</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
