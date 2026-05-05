import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/ui/AppBackground";
import { useTheme } from "@/hooks/useTheme";
import { folderIconOptions, getFolderIcon } from "@/services/folders/folderIcon";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import type { Folder, FolderIconKey } from "@/types/models";

type FolderModalMode = "options" | "rename" | "icon" | "move" | "delete";

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const dayLabel = (isoDate?: string) => {
  if (!isoDate) {
    return "aujourd'hui";
  }

  const date = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diffDays <= 0) {
    return "aujourd'hui";
  }

  if (diffDays === 1) {
    return "hier";
  }

  return date.toLocaleDateString("fr-FR", { weekday: "long" });
};

function CountBadge({ count }: { count: number }) {
  const theme = useTheme();

  return (
    <View
      style={{
        minHeight: 26,
        paddingHorizontal: 10,
        borderRadius: 11,
        backgroundColor: "#F2F3F7",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Text style={[theme.typography.label, { color: "#0F1B3A", fontWeight: "800" }]}>
        {count} note{count > 1 ? "s" : ""}
      </Text>
    </View>
  );
}

function FolderTile({ folder, onOpenOptions }: { folder: Folder; onOpenOptions: (folder: Folder) => void }) {
  const theme = useTheme();
  const notesCount = useNotesStore(
    (state) => state.notes.filter((note) => note.folderId === folder.id && !note.isDeleted).length
  );
  const folderIcon = getFolderIcon(folder);

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/folders/[id]", params: { id: folder.id } })}
      style={({ pressed }) => ({
        width: "48%",
        minHeight: 158,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        padding: 16,
        opacity: pressed ? 0.9 : 1,
        shadowColor: "#0F172A",
        shadowOpacity: 0.08,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 7
      })}
    >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 15,
                backgroundColor: folderIcon.backgroundColor,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name={folderIcon.icon} size={19} color={folderIcon.color} />
            </View>

            <View style={{ alignItems: "flex-end", gap: 8, marginRight: -4, marginTop: -4 }}>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onOpenOptions(folder);
                }}
                style={{
                  width: 34,
                  height: 28,
                  borderRadius: 12,
                  backgroundColor: "#F4F5F9",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={18} color="#0F1B3A" />
              </Pressable>
              <CountBadge count={notesCount} />
            </View>
          </View>

          <Text
            numberOfLines={1}
            style={[
              theme.typography.h3,
              { color: "#0F1B3A", marginTop: 14, fontSize: 16, lineHeight: 21, fontWeight: "800" }
            ]}
          >
            {folder.name}
          </Text>
          <Text style={[theme.typography.body, { color: "#92949E", marginTop: 2 }]}>
            Modifie {dayLabel(folder.updatedAt)}
          </Text>
        </View>

        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 12,
            backgroundColor: "#EFF0F4",
            paddingHorizontal: 10,
            paddingVertical: 6
          }}
        >
          <Text style={[theme.typography.caption, { color: "#858892", fontWeight: "800" }]} numberOfLines={1}>
            {folder.name}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function PersonalFolderTile({ onOpenOptions }: { onOpenOptions: () => void }) {
  const theme = useTheme();
  const notesCount = useNotesStore(
    (state) => state.notes.filter((note) => note.folderId === null && !note.isDeleted).length
  );

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/folders/[id]", params: { id: "personal" } })}
      style={({ pressed }) => ({
        width: "48%",
        minHeight: 158,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        padding: 16,
        opacity: pressed ? 0.9 : 1,
        shadowColor: "#0F172A",
        shadowOpacity: 0.08,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 7
      })}
    >
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 15,
                backgroundColor: "#E4ECFF",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="folder-open-outline" size={19} color="#4F6EF7" />
            </View>

            <View style={{ alignItems: "flex-end", gap: 8, marginRight: -4, marginTop: -4 }}>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  onOpenOptions();
                }}
                style={{
                  width: 34,
                  height: 28,
                  borderRadius: 12,
                  backgroundColor: "#F4F5F9",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={18} color="#0F1B3A" />
              </Pressable>
              <CountBadge count={notesCount} />
            </View>
          </View>

          <Text
            style={[
              theme.typography.h3,
              { color: "#0F1B3A", marginTop: 14, fontSize: 16, lineHeight: 21, fontWeight: "800" }
            ]}
          >
            Personnel
          </Text>
          <Text style={[theme.typography.body, { color: "#92949E", marginTop: 2 }]}>{"Modifie aujourd'hui"}</Text>
        </View>

        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 12,
            backgroundColor: "#EFF0F4",
            paddingHorizontal: 10,
            paddingVertical: 6
          }}
        >
          <Text style={[theme.typography.caption, { color: "#858892", fontWeight: "800" }]}>
            {notesCount === 0 ? "Aucune note" : "Personnel"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function NewFolderTile({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: "48%",
        minHeight: 146,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "#C9D0DF",
        borderStyle: "dashed",
        backgroundColor: "#F4F6FA",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        opacity: pressed ? 0.82 : 1
      })}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 18,
          backgroundColor: "#E9ECF3",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12
        }}
      >
        <Ionicons name="add" size={24} color="#0F1B3A" />
      </View>
      <Text style={[theme.typography.label, { color: "#0F1B3A", textAlign: "center", fontWeight: "900" }]}>
        Nouveau{"\n"}dossier
      </Text>
      <Text style={[theme.typography.caption, { color: "#0F1B3A", marginTop: 3, textAlign: "center", fontSize: 11 }]}>
        Organiser mes notes
      </Text>
    </Pressable>
  );
}

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
          width: 50,
          height: 50,
          borderRadius: 17,
          backgroundColor: iconBackground,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={icon} size={21} color={iconColor} />
      </View>

      <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: "#E6E7EC", paddingBottom: 16 }}>
        <Text
          style={[
            theme.typography.h3,
            { color: danger ? "#FF3434" : "#0F1B3A", fontSize: 18, fontWeight: "900" }
          ]}
        >
          {title}
        </Text>
        <Text style={[theme.typography.body, { color: "#8D8F99", marginTop: 2 }]}>{description}</Text>
      </View>
    </Pressable>
  );
}

export default function FoldersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const folders = useFoldersStore((state) => state.folders);
  const createFolder = useFoldersStore((state) => state.createFolder);
  const updateFolder = useFoldersStore((state) => state.updateFolder);
  const deleteFolder = useFoldersStore((state) => state.deleteFolder);
  const notes = useNotesStore((state) => state.notes);
  const moveNote = useNotesStore((state) => state.moveNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderModalMode, setFolderModalMode] = useState<FolderModalMode>("options");
  const [name, setName] = useState("");
  const [selectedIconKey, setSelectedIconKey] = useState<FolderIconKey>("briefcase");
  const [renameName, setRenameName] = useState("");
  const [editIconKey, setEditIconKey] = useState<FolderIconKey>("briefcase");
  const visibleNotes = notes.filter((note) => !note.isDeleted);
  const totalFolderCount = folders.length + 1;
  const latestActivity = [...visibleNotes.map((note) => note.updatedAt), ...folders.map((folder) => folder.updatedAt)].sort().at(-1);
  const selectedFolder = folders.find((folder) => folder.id === selectedFolderId) ?? null;
  const isPersonalOptions = selectedFolderId === "personal";
  const selectedFolderNotes = isPersonalOptions
    ? visibleNotes.filter((note) => note.folderId === null)
    : selectedFolder
      ? visibleNotes.filter((note) => note.folderId === selectedFolder.id)
      : [];
  const destinationFolders = selectedFolder
    ? folders.filter((folder) => folder.id !== selectedFolder.id)
    : folders;
  const selectedFolderTitle = isPersonalOptions ? "Personnel" : selectedFolder?.name ?? "";
  const filteredFolders = useMemo(() => {
    const query = normalizeText(searchQuery.trim());

    if (!query) {
      return folders;
    }

    return folders.filter((folder) => normalizeText(folder.name).includes(query));
  }, [folders, searchQuery]);
  const showPersonalFolder = !searchQuery.trim() || normalizeText("Personnel").includes(normalizeText(searchQuery));
  const foundCount = filteredFolders.length + (showPersonalFolder ? 1 : 0);
  const floatingButtonBottom = insets.bottom + 90;

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setName("");
    setSelectedIconKey("briefcase");
  };

  const openFolderOptions = (folder: Folder) => {
    setSelectedFolderId(folder.id);
    setRenameName(folder.name);
    setEditIconKey(getFolderIcon(folder).key);
    setFolderModalMode("options");
  };

  const openPersonalOptions = () => {
    setSelectedFolderId("personal");
    setRenameName("Personnel");
    setEditIconKey("briefcase");
    setFolderModalMode("options");
  };

  const closeFolderModal = () => {
    setSelectedFolderId(null);
    setFolderModalMode("options");
    setRenameName("");
    setEditIconKey("briefcase");
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Nom requis", "Ajoute un nom de dossier.");
      return;
    }

    await createFolder({ name, iconKey: selectedIconKey });
    closeCreateModal();
  };

  const handleRenameFolder = async () => {
    if (!selectedFolder) {
      return;
    }

    const nextName = renameName.trim();

    if (!nextName) {
      Alert.alert("Nom requis", "Ajoute un nom de dossier.");
      return;
    }

    await updateFolder(selectedFolder.id, { name: nextName });
    closeFolderModal();
  };

  const handleUpdateFolderIcon = async () => {
    if (!selectedFolder) {
      return;
    }

    await updateFolder(selectedFolder.id, { iconKey: editIconKey });
    closeFolderModal();
  };

  const handleMoveFolderNotes = async (folderId: string | null) => {
    if (!selectedFolder && !isPersonalOptions) {
      return;
    }

    await Promise.all(selectedFolderNotes.map((note) => moveNote(note.id, folderId)));
    closeFolderModal();
  };

  const handleDeleteFolder = async () => {
    if (!selectedFolder) {
      return;
    }

    await Promise.all(selectedFolderNotes.map((note) => deleteNote(note.id)));
    await deleteFolder(selectedFolder.id);
    closeFolderModal();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBackground />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: theme.spacing.md,
          paddingBottom: floatingButtonBottom + 42
        }}
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, marginLeft: 4 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: "#0F1B3A", letterSpacing: 5, textTransform: "uppercase", fontWeight: "800" }
                ]}
              >
                Organisation
              </Text>
              <Text
                style={[
                  theme.typography.h1,
                  { color: "#0F1B3A", marginTop: 2, fontSize: 36, lineHeight: 40, fontWeight: "900" }
                ]}
              >
                Dossiers
              </Text>
            </View>

            <Pressable
              onPress={() => setShowCreateModal(true)}
              style={({ pressed }) => ({
                width: 52,
                height: 52,
                borderRadius: 18,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.82 : 1,
                shadowColor: "#0F172A",
                shadowOpacity: 0.08,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 8
              })}
            >
              <Ionicons name="add" size={22} color="#0F1B3A" />
            </Pressable>
          </View>

          <View
            style={{
              borderRadius: 24,
              padding: 18,
              minHeight: 150,
              overflow: "hidden",
              backgroundColor: "#0F1B3A",
              shadowColor: "#0F1B3A",
              shadowOpacity: 0.28,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 14 },
              elevation: 10
            }}
          >
            <View
              style={{
                position: "absolute",
                right: -38,
                top: -24,
                width: 190,
                height: 190,
                borderRadius: 95,
                backgroundColor: "rgba(255,255,255,0.13)"
              }}
            />
            <View
              style={{
                position: "absolute",
                right: -70,
                bottom: -72,
                width: 220,
                height: 220,
                borderRadius: 110,
                backgroundColor: "rgba(13,23,54,0.12)"
              }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 26, lineHeight: 31, fontWeight: "900" }}>
                  {totalFolderCount} dossier{totalFolderCount > 1 ? "s" : ""}
                </Text>
                <Text style={[theme.typography.body, { color: "#F1ECFF", marginTop: 8 }]}>
                  {visibleNotes.length} notes au total - Derniere modif {dayLabel(latestActivity)}
                </Text>
              </View>

              <View
                style={{
                  borderRadius: 16,
                  backgroundColor: "rgba(255,255,255,0.18)",
                  paddingHorizontal: 10,
                  paddingVertical: 7
                }}
              >
                <Text style={[theme.typography.caption, { color: "#FFFFFF", fontWeight: "900" }]}>Clean</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
              {[
                `${totalFolderCount} dossiers`,
                `${visibleNotes.length} notes`,
                "Vue 2x2"
              ].map((label) => (
                <View
                  key={label}
                  style={{
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    paddingHorizontal: 11,
                    paddingVertical: 8
                  }}
                >
                  <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={{
              minHeight: 56,
              borderRadius: 20,
              backgroundColor: "#FFFFFF",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              gap: 12,
              shadowColor: "#0F172A",
              shadowOpacity: 0.05,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 5
            }}
          >
            <Ionicons name="search-outline" size={17} color="#7B7F89" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher un dossier..."
              placeholderTextColor="#767A82"
              style={[theme.typography.body, { flex: 1, color: "#0F1B3A", paddingVertical: 8 }]}
            />
            <Pressable
              onPress={() => undefined}
              style={{
                width: 34,
                height: 34,
                borderRadius: 13,
                backgroundColor: "#F2F4F8",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="list" size={18} color="#0F1B3A" />
            </Pressable>
          </View>

          <Text style={[theme.typography.label, { color: "#8A8F9A", fontWeight: "900" }]}>
            {foundCount} dossier{foundCount > 1 ? "s" : ""} trouve{foundCount > 1 ? "s" : ""}
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 }}>
            {showPersonalFolder ? <PersonalFolderTile onOpenOptions={openPersonalOptions} /> : null}
            {filteredFolders.map((folder) => (
              <FolderTile key={folder.id} folder={folder} onOpenOptions={openFolderOptions} />
            ))}
            {!searchQuery.trim() ? <NewFolderTile onPress={() => setShowCreateModal(true)} /> : null}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showCreateModal} transparent animationType="slide" onRequestClose={closeCreateModal}>
        <Pressable
          onPress={closeCreateModal}
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

            <Text style={{ color: "#0F1B3A", fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Creer un dossier</Text>

            <View style={{ gap: 10 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: "#8D8D96", letterSpacing: 1.4, textTransform: "uppercase", fontWeight: "900" }
                ]}
              >
                Nom du dossier
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                autoFocus
                placeholder="Ex : Travail, Sport, Idees..."
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
            </View>

            <View style={{ gap: 10 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: "#8D8D96", letterSpacing: 1.4, textTransform: "uppercase", fontWeight: "900" }
                ]}
              >
                Icone
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={{ flexDirection: "row", gap: 10, paddingRight: 8 }}>
                  {folderIconOptions.map((option) => {
                    const isSelected = option.key === selectedIconKey;

                    return (
                      <Pressable
                        key={option.key}
                        onPress={() => setSelectedIconKey(option.key)}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 18,
                          backgroundColor: option.backgroundColor,
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: "#0F1B3A",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name={option.icon} size={22} color={option.color} />
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 2 }}>
              <Pressable
                onPress={closeCreateModal}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 56,
                  borderRadius: 18,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#EEF0F5",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Text style={[theme.typography.label, { color: "#0F1B3A", fontWeight: "900" }]}>Annuler</Text>
              </Pressable>

              <Pressable
                onPress={() => void handleCreate()}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 56,
                  borderRadius: 18,
                  backgroundColor: "#0F1B3A",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.86 : 1
                })}
              >
                <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Creer</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={selectedFolderId !== null} transparent animationType="slide" onRequestClose={closeFolderModal}>
        <Pressable
          onPress={closeFolderModal}
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

            {(selectedFolder || isPersonalOptions) && folderModalMode === "options" ? (
              <>
                <Text style={{ color: "#0F1B3A", fontSize: 27, lineHeight: 34, fontWeight: "900" }}>
                  Options du dossier
                </Text>

                <View style={{ gap: 16, paddingTop: 6 }}>
                  {selectedFolder ? (
                    <>
                      <OptionRow
                        title="Renommer"
                        description="Changer le nom du dossier"
                        icon="pencil"
                        iconColor="#0F1B3A"
                        iconBackground="#F0E6FF"
                        onPress={() => {
                          setRenameName(selectedFolder.name);
                          setFolderModalMode("rename");
                        }}
                      />
                      <OptionRow
                        title="Changer icone"
                        description="Modifier le style du dossier"
                        icon="color-palette"
                        iconColor="#FF6B7A"
                        iconBackground="#EAF7FF"
                        onPress={() => {
                          setEditIconKey(getFolderIcon(selectedFolder).key);
                          setFolderModalMode("icon");
                        }}
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
                  {selectedFolder ? (
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

            {selectedFolder && folderModalMode === "rename" ? (
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

            {selectedFolder && folderModalMode === "icon" ? (
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

            {(selectedFolder || isPersonalOptions) && folderModalMode === "move" ? (
              <>
                <Text style={{ color: "#0F1B3A", fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Deplacer les notes</Text>
                <Text style={[theme.typography.body, { color: "#8D8F99" }]}>
                  {selectedFolderNotes.length} note{selectedFolderNotes.length > 1 ? "s" : ""} depuis {selectedFolderTitle}
                </Text>
                <View style={{ gap: 10 }}>
                  {!isPersonalOptions ? (
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
                  {destinationFolders.map((folder) => {
                    const folderIcon = getFolderIcon(folder);

                    return (
                      <Pressable
                        key={folder.id}
                        onPress={() => void handleMoveFolderNotes(folder.id)}
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
                            backgroundColor: folderIcon.backgroundColor,
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Ionicons name={folderIcon.icon} size={17} color={folderIcon.color} />
                        </View>
                        <Text style={[theme.typography.label, { color: "#0F1B3A", fontWeight: "900" }]}>
                          {folder.name}
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

            {selectedFolder && folderModalMode === "delete" ? (
              <>
                <Text style={{ color: "#0F1B3A", fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Supprimer</Text>
                <Text style={[theme.typography.body, { color: "#8D8F99", lineHeight: 24 }]}>
                  Le dossier {selectedFolder.name} sera supprime. Ses {selectedFolderNotes.length} note
                  {selectedFolderNotes.length > 1 ? "s" : ""} partiront dans la corbeille.
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

      <Pressable
        onPress={() => setShowCreateModal(true)}
        style={({ pressed }) => ({
          position: "absolute",
          right: 24,
          bottom: floatingButtonBottom,
          width: 58,
          height: 58,
          borderRadius: 21,
          backgroundColor: "#0F1B3A",
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.9 : 1,
          shadowColor: "#0F1B3A",
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12
        })}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

