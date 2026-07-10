/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        index.tsx
 * @description Renders the folder library with search, filters, statistics, and quick actions.
 *
 * @project     BlockyNotes
 * @module      Application / Folders
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
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/ui/AppBackground";
import { LockCodeModal } from "@/components/security/LockCodeModal";
import { AppHeaderLogo } from "@/components/ui/AppHeaderLogo";
import { ScrollZone } from "@/components/ui/ScrollZone";
import { useTheme } from "@/hooks/useTheme";
import { hashLockCode, verifyLockCode } from "@/lib/security";
import { folderIconOptions, getFolderIcon } from "@/services/folders/folderIcon";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { isFolderLocked } from "@/services/security/locks";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getAppPalette } from "@/theme/appPalette";
import { hapticImpact } from "@/lib/haptics";
import type { Folder, FolderIconKey } from "@/types/models";

type FolderModalMode = "options" | "rename" | "icon" | "move" | "archive" | "delete";
type FolderGridItem = { type: "personal" } | { type: "folder"; folder: Folder } | { type: "new" };

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
  const palette = getAppPalette(theme);

  return (
    <View
      style={{
        minHeight: 26,
        paddingHorizontal: 10,
        borderRadius: 11,
        backgroundColor: palette.surfaceMuted,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Text style={[theme.typography.label, { color: palette.text, fontWeight: "800" }]}>
        {count} note{count > 1 ? "s" : ""}
      </Text>
    </View>
  );
}

function FolderTile({
  folder,
  notesCount,
  onOpenOptions
}: {
  folder: Folder;
  notesCount: number;
  onOpenOptions: (folder: Folder) => void;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const settings = useSettingsStore((state) => state.settings);
  const folderIcon = getFolderIcon(folder);
  const locked = isFolderLocked(folder, settings);

  return (
    <Pressable
      onLongPress={() => {
        void hapticImpact();
        onOpenOptions(folder);
      }}
      onPress={() => router.push({ pathname: "/folders/[id]", params: { id: folder.id } })}
      style={({ pressed }) => ({
        width: "48%",
        minHeight: 158,
        borderRadius: 22,
        backgroundColor: palette.surface,
        padding: 16,
        opacity: pressed ? 0.9 : 1,
        shadowColor: palette.shadow,
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
              <Ionicons name={locked ? "lock-closed" : folderIcon.icon} size={19} color={locked ? "#0F1B3A" : folderIcon.color} />
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
                  backgroundColor: palette.subtle,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={18} color={palette.text} />
              </Pressable>
              <CountBadge count={notesCount} />
            </View>
          </View>

          <Text
            numberOfLines={1}
            style={[
              theme.typography.h3,
              { color: palette.text, marginTop: 14, fontSize: 16, lineHeight: 21, fontWeight: "800" }
            ]}
          >
            {folder.name}
          </Text>
          <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 2 }]}>
            Modifie {dayLabel(folder.updatedAt)}
          </Text>
        </View>

        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 12,
            backgroundColor: palette.surfaceMuted,
            paddingHorizontal: 10,
            paddingVertical: 6
          }}
        >
          <Text style={[theme.typography.caption, { color: palette.textMuted, fontWeight: "800" }]} numberOfLines={1}>
            {locked ? "Securise" : notesCount === 0 ? "Vide" : "Actif"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function PersonalFolderTile({ notesCount, onOpenOptions }: { notesCount: number; onOpenOptions: () => void }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <Pressable
      onLongPress={() => {
        void hapticImpact();
        onOpenOptions();
      }}
      onPress={() => router.push({ pathname: "/folders/[id]", params: { id: "personal" } })}
      style={({ pressed }) => ({
        width: "48%",
        minHeight: 158,
        borderRadius: 22,
        backgroundColor: palette.surface,
        padding: 16,
        opacity: pressed ? 0.9 : 1,
        shadowColor: palette.shadow,
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
                  backgroundColor: palette.subtle,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={18} color={palette.text} />
              </Pressable>
              <CountBadge count={notesCount} />
            </View>
          </View>

          <Text
            style={[
              theme.typography.h3,
              { color: palette.text, marginTop: 14, fontSize: 16, lineHeight: 21, fontWeight: "800" }
            ]}
          >
            Personnel
          </Text>
          <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 2 }]}>{"Modifie aujourd'hui"}</Text>
        </View>

        <View
          style={{
            alignSelf: "flex-start",
            borderRadius: 12,
            backgroundColor: palette.surfaceMuted,
            paddingHorizontal: 10,
            paddingVertical: 6
          }}
        >
          <Text style={[theme.typography.caption, { color: palette.textMuted, fontWeight: "800" }]}>
            {notesCount === 0 ? "Aucune note" : "Actif"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function NewFolderTile({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: "48%",
        minHeight: 146,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: palette.border,
        borderStyle: "dashed",
        backgroundColor: palette.surfaceMuted,
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
          backgroundColor: palette.subtle,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12
        }}
      >
        <Ionicons name="add" size={24} color={palette.text} />
      </View>
      <Text style={[theme.typography.label, { color: palette.text, textAlign: "center", fontWeight: "900" }]}>
        Nouveau{"\n"}dossier
      </Text>
      <Text style={[theme.typography.caption, { color: palette.text, marginTop: 3, textAlign: "center", fontSize: 11 }]}>
        Organiser mes notes
      </Text>
    </Pressable>
  );
}

function SheetHandle() {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <View
      style={{
        alignSelf: "center",
        width: 48,
        height: 5,
        borderRadius: 4,
        backgroundColor: palette.isDark ? "rgba(255,255,255,0.26)" : "#C9CBD5",
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
  const palette = getAppPalette(theme);

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

      <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: palette.divider, paddingBottom: 16 }}>
        <Text
          style={[
            theme.typography.h3,
            { color: danger ? "#FF3434" : palette.text, fontSize: 18, fontWeight: "900" }
          ]}
        >
          {title}
        </Text>
        <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 2 }]}>{description}</Text>
      </View>
    </Pressable>
  );
}

export default function FoldersScreen() {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const insets = useSafeAreaInsets();
  const folders = useFoldersStore((state) => state.folders);
  const createFolder = useFoldersStore((state) => state.createFolder);
  const updateFolder = useFoldersStore((state) => state.updateFolder);
  const deleteFolder = useFoldersStore((state) => state.deleteFolder);
  const notes = useNotesStore((state) => state.notes);
  const moveNote = useNotesStore((state) => state.moveNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const archiveNote = useNotesStore((state) => state.archiveNote);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderModalMode, setFolderModalMode] = useState<FolderModalMode>("options");
  const [name, setName] = useState("");
  const [selectedIconKey, setSelectedIconKey] = useState<FolderIconKey>("briefcase");
  const [renameName, setRenameName] = useState("");
  const [editIconKey, setEditIconKey] = useState<FolderIconKey>("briefcase");
  const [selectedMoveNoteIds, setSelectedMoveNoteIds] = useState<string[]>([]);
  const [folderLockModalMode, setFolderLockModalMode] = useState<"create" | "unlock-remove" | null>(null);
  const [folderLockError, setFolderLockError] = useState<string | null>(null);
  const visibleNotes = useMemo(() => notes.filter((note) => !note.isDeleted), [notes]);
  const folderNoteCounts = useMemo(() => {
    const counts = new Map<string | null, number>();

    visibleNotes.forEach((note) => {
      const key = note.folderId ?? null;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return counts;
  }, [visibleNotes]);
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
  const folderGridItems = useMemo<FolderGridItem[]>(() => {
    const items: FolderGridItem[] = [
      ...(showPersonalFolder ? [{ type: "personal" as const }] : []),
      ...filteredFolders.map((folder) => ({ type: "folder" as const, folder }))
    ];

    if (!searchQuery.trim()) {
      items.push({ type: "new" });
    }

    return items;
  }, [filteredFolders, searchQuery, showPersonalFolder]);
  const floatingButtonBottom = insets.bottom + 90;
  const heroPreviewFolders = folders.slice(0, 3);

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
    setSelectedMoveNoteIds([]);
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

  const handleToggleFolderLock = async () => {
    if (!selectedFolder) {
      return;
    }

    if (selectedFolder.isLocked) {
      setFolderLockError(null);
      setFolderLockModalMode("unlock-remove");
      return;
    }

    setFolderLockError(null);
    setFolderLockModalMode("create");
  };

  const openMoveMode = () => {
    setSelectedMoveNoteIds([]);
    setFolderModalMode("move");
  };

  const toggleMoveNote = (noteId: string) => {
    setSelectedMoveNoteIds((current) =>
      current.includes(noteId) ? current.filter((entry) => entry !== noteId) : [...current, noteId]
    );
  };

  const toggleAllMoveNotes = () => {
    setSelectedMoveNoteIds((current) =>
      current.length === selectedFolderNotes.length ? [] : selectedFolderNotes.map((note) => note.id)
    );
  };

  const handleMoveFolderNotes = async (folderId: string | null) => {
    if (!selectedFolder && !isPersonalOptions) {
      return;
    }

    if (selectedMoveNoteIds.length === 0) {
      Alert.alert("Selection requise", "Choisis au moins une note a deplacer.");
      return;
    }

    await Promise.all(selectedMoveNoteIds.map((noteId) => moveNote(noteId, folderId)));
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

  const handleArchiveFolderNotes = async () => {
    const activeNotes = selectedFolderNotes.filter((note) => !note.isArchived);

    await Promise.all(activeNotes.map((note) => archiveNote(note.id)));
    closeFolderModal();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBackground />
      <FlatList
        data={folderGridItems}
        keyExtractor={(item) => (item.type === "folder" ? item.folder.id : item.type)}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: theme.spacing.md,
          paddingBottom: floatingButtonBottom + 42
        }}
        initialNumToRender={8}
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        keyboardShouldPersistTaps="handled"
        maxToRenderPerBatch={8}
        removeClippedSubviews={Platform.OS !== "web"}
        scrollEventThrottle={16}
        windowSize={7}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, marginLeft: 4 }}>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: palette.text, letterSpacing: 5, textTransform: "uppercase", fontWeight: "800" }
                  ]}
                >
                  Organisation
                </Text>
                <Text
                  style={[
                    theme.typography.h1,
                    { color: palette.text, marginTop: 2, fontSize: 36, lineHeight: 40, fontWeight: "900" }
                  ]}
                >
                  Dossiers
                </Text>
              </View>

              <AppHeaderLogo />
            </View>

            <View
              style={{
                borderRadius: 24,
                padding: 18,
                minHeight: 132,
                overflow: "hidden",
                backgroundColor: "#0F1B3A",
                shadowColor: "#0F1B3A",
                shadowOpacity: 0.22,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 8
              }}
            >
              <View
                style={{
                  position: "absolute",
                  right: -46,
                  top: -58,
                  width: 176,
                  height: 176,
                  borderRadius: 88,
                  backgroundColor: "rgba(255,255,255,0.12)"
                }}
              />
              <View
                style={{
                  position: "absolute",
                  right: 24,
                  bottom: -86,
                  width: 156,
                  height: 156,
                  borderRadius: 78,
                  backgroundColor: "rgba(124,77,255,0.24)"
                }}
              />

              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.16)",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Ionicons name="folder-open-outline" size={27} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#FFFFFF", fontSize: 26, lineHeight: 31, fontWeight: "900" }}>Espaces de notes</Text>
                  <Text style={[theme.typography.body, { color: "#F1ECFF", marginTop: 6 }]} numberOfLines={1}>
                    Projets, perso, clients et idees rangees au meme endroit.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 18 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {[
                    { id: "personal", name: "Personnel", icon: "folder-open-outline" as keyof typeof Ionicons.glyphMap, color: "#4F6EF7", background: "#E4ECFF" },
                    ...heroPreviewFolders.map((folder) => {
                      const folderIcon = getFolderIcon(folder);

                      return {
                        id: folder.id,
                        name: folder.name,
                        icon: folderIcon.icon,
                        color: folderIcon.color,
                        background: folderIcon.backgroundColor
                      };
                    })
                  ].slice(0, 4).map((entry, index) => (
                    <View
                      key={entry.id}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 13,
                        backgroundColor: entry.background,
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: index === 0 ? 0 : -8,
                        borderWidth: 2,
                        borderColor: "#0F1B3A"
                      }}
                    >
                      <Ionicons name={entry.icon} size={15} color={entry.color} />
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={() => setShowCreateModal(true)}
                  style={({ pressed }) => ({
                    minHeight: 38,
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.16)",
                    paddingHorizontal: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 7,
                    opacity: pressed ? 0.82 : 1
                  })}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Nouveau</Text>
                </Pressable>
              </View>
            </View>

            <View
              style={{
                minHeight: 56,
                borderRadius: 20,
                backgroundColor: palette.surface,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                gap: 12,
                shadowColor: palette.shadow,
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
                placeholderTextColor={palette.placeholder}
                style={[theme.typography.body, { flex: 1, color: palette.text, paddingVertical: 8 }]}
              />
              <Pressable
                onPress={() => setShowSearchModal(true)}
                style={({ pressed }) => ({
                  width: 34,
                  height: 34,
                  borderRadius: 13,
                  backgroundColor: palette.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="list" size={18} color={palette.text} />
              </Pressable>
            </View>

            <Text style={[theme.typography.label, { color: palette.textMuted, fontWeight: "900" }]}>
              {foundCount} dossier{foundCount > 1 ? "s" : ""} trouve{foundCount > 1 ? "s" : ""}
            </Text>
          </View>
        }
        ListEmptyComponent={
          searchQuery.trim() ? (
            <View
              style={{
                minHeight: 118,
                borderRadius: 22,
                backgroundColor: palette.surface,
                alignItems: "center",
                justifyContent: "center",
                padding: 18,
                shadowColor: palette.shadow,
                shadowOpacity: 0.05,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 5
              }}
            >
              <Ionicons name="search-outline" size={22} color={palette.textMuted} />
              <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900", marginTop: 8 }]}>Aucun dossier trouve</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          if (item.type === "personal") {
            return <PersonalFolderTile notesCount={folderNoteCounts.get(null) ?? 0} onOpenOptions={openPersonalOptions} />;
          }

          if (item.type === "new") {
            return <NewFolderTile onPress={() => setShowCreateModal(true)} />;
          }

          return <FolderTile folder={item.folder} notesCount={folderNoteCounts.get(item.folder.id) ?? 0} onOpenOptions={openFolderOptions} />;
        }}
      />

      <Modal visible={showSearchModal} transparent animationType="slide" onRequestClose={() => setShowSearchModal(false)}>
        <Pressable
          onPress={() => setShowSearchModal(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 27, 58, 0.22)",
            justifyContent: "flex-end"
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: palette.surface,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingHorizontal: 24,
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
                backgroundColor: palette.isDark ? "rgba(255,255,255,0.26)" : "#C9CBD5",
                marginBottom: 2
              }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Filtres</Text>
                <Text style={[theme.typography.body, { color: palette.textMuted }]}>Vue et organisation des dossiers.</Text>
              </View>
            </View>

            <View style={{ gap: 10 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: palette.textMuted, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: "900" }
                ]}
              >
                Vue
              </Text>
              <View
                style={{
                  minHeight: 54,
                  borderRadius: 18,
                  backgroundColor: "#E4ECFF",
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
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Ionicons name="grid-outline" size={17} color="#4F6EF7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Vue 2x2</Text>
                  <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]}>
                    {foundCount} dossier{foundCount > 1 ? "s" : ""} trouve{foundCount > 1 ? "s" : ""}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#4F6EF7" />
              </View>
            </View>

            <Pressable
              onPress={() => setShowSearchModal(false)}
              style={({ pressed }) => ({
                minHeight: 54,
                borderRadius: 18,
                backgroundColor: "#0F1B3A",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.86 : 1
              })}
            >
              <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Appliquer</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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
              backgroundColor: palette.surface,
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
                backgroundColor: palette.isDark ? "rgba(255,255,255,0.26)" : "#C9CBD5",
                marginBottom: 4
              }}
            />

            <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Creer un dossier</Text>

            <View style={{ gap: 10 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: palette.textMuted, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: "900" }
                ]}
              >
                Nom du dossier
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                autoFocus
                placeholder="Ex : Travail, Sport, Idees..."
                placeholderTextColor={palette.placeholder}
                style={[
                  theme.typography.label,
                  {
                    minHeight: 56,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: palette.border,
                    paddingHorizontal: 16,
                    color: palette.text,
                    fontWeight: "800"
                  }
                ]}
              />
            </View>

            <View style={{ gap: 10 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: palette.textMuted, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: "900" }
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
                          borderColor: palette.text,
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
                  backgroundColor: palette.surfaceMuted,
                  borderWidth: 1,
                  borderColor: palette.border,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Annuler</Text>
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
              backgroundColor: palette.surface,
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
                <Text style={{ color: palette.text, fontSize: 27, lineHeight: 34, fontWeight: "900" }}>
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
                      <OptionRow
                        title={selectedFolder.isLocked ? "Retirer le verrou" : "Securiser"}
                        description={selectedFolder.isLocked ? "Retirer le code du dossier" : "Demander un code pour ce dossier"}
                        icon={selectedFolder.isLocked ? "lock-open-outline" : "lock-closed-outline"}
                        iconColor="#F97316"
                        iconBackground="#FFF1DC"
                        onPress={() => void handleToggleFolderLock()}
                      />
                    </>
                  ) : null}
                  <OptionRow
                    title="Deplacer les notes"
                    description="Choisir les notes a transferer"
                    icon="arrow-redo"
                    iconColor="#F97316"
                    iconBackground="#FFF1DC"
                    onPress={openMoveMode}
                  />
                  <OptionRow
                    title="Tout archiver"
                    description="Ranger les notes actives du dossier"
                    icon="archive"
                    iconColor="#0F1B3A"
                    iconBackground="#E9ECF3"
                    onPress={() => setFolderModalMode("archive")}
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
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Renommer</Text>
                <TextInput
                  value={renameName}
                  onChangeText={setRenameName}
                  autoFocus
                  placeholder="Nom du dossier"
                  placeholderTextColor={palette.placeholder}
                  style={[
                    theme.typography.label,
                    {
                      minHeight: 56,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: palette.border,
                      paddingHorizontal: 16,
                      color: palette.text,
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
                      backgroundColor: palette.surfaceMuted,
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Retour</Text>
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
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Changer icone</Text>
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
                          borderColor: palette.text,
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
                      backgroundColor: palette.surfaceMuted,
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Retour</Text>
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
                <View style={{ gap: 4 }}>
                  <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Transferer les notes</Text>
                  <Text style={[theme.typography.body, { color: palette.textMuted }]}>
                    {selectedMoveNoteIds.length} sur {selectedFolderNotes.length} selectionnee
                    {selectedMoveNoteIds.length > 1 ? "s" : ""} depuis {selectedFolderTitle}
                  </Text>
                </View>

                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text
                      style={[
                        theme.typography.caption,
                        { color: palette.textMuted, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.2 }
                      ]}
                    >
                      Notes a transferer
                    </Text>
                    {selectedFolderNotes.length > 0 ? (
                      <Pressable
                        onPress={toggleAllMoveNotes}
                        hitSlop={10}
                      >
                        <Text style={[theme.typography.caption, { color: "#4F6EF7", fontWeight: "900" }]}>
                          {selectedMoveNoteIds.length === selectedFolderNotes.length ? "Tout retirer" : "Tout choisir"}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <ScrollZone maxHeight={184}>
                    <View style={{ gap: 8 }}>
                      {selectedFolderNotes.length === 0 ? (
                        <Text style={[theme.typography.body, { color: palette.textMuted }]}>Aucune note dans ce dossier.</Text>
                      ) : null}
                      {selectedFolderNotes.map((note) => {
                        const selected = selectedMoveNoteIds.includes(note.id);
                        const noteIcon = getNoteIcon(note);

                        return (
                          <Pressable
                            key={note.id}
                            onPress={() => toggleMoveNote(note.id)}
                            style={({ pressed }) => ({
                              minHeight: 54,
                              borderRadius: 18,
                              backgroundColor: selected ? "#E4ECFF" : palette.surfaceMuted,
                              borderWidth: selected ? 1 : 0,
                              borderColor: "#4F6EF7",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 12,
                              paddingHorizontal: 12,
                              opacity: pressed ? 0.82 : 1
                            })}
                          >
                            <View
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 13,
                                backgroundColor: noteIcon.backgroundColor,
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <Ionicons name={noteIcon.icon} size={16} color={noteIcon.color} />
                            </View>
                            <Text
                              style={[theme.typography.label, { color: palette.text, fontWeight: "900", flex: 1 }]}
                              numberOfLines={1}
                            >
                              {note.title || "Sans titre"}
                            </Text>
                            <Ionicons
                              name={selected ? "checkmark-circle" : "ellipse-outline"}
                              size={20}
                              color={selected ? "#4F6EF7" : palette.textMuted}
                            />
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollZone>
                </View>

                <View style={{ gap: 10 }}>
                  <Text
                    style={[
                      theme.typography.caption,
                      { color: palette.textMuted, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.2 }
                    ]}
                  >
                    Destination
                  </Text>
                  <ScrollZone maxHeight={184}>
                    <View style={{ gap: 10 }}>
                      {!isPersonalOptions ? (
                        <Pressable
                          onPress={() => void handleMoveFolderNotes(null)}
                          style={{
                            minHeight: 52,
                            borderRadius: 18,
                            backgroundColor: palette.surfaceMuted,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            paddingHorizontal: 14
                          }}
                        >
                          <Ionicons name="folder-open-outline" size={20} color="#4F6EF7" />
                          <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Personnel</Text>
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
                              backgroundColor: palette.surfaceMuted,
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
                            <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>
                              {folder.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollZone>
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

            {(selectedFolder || isPersonalOptions) && folderModalMode === "archive" ? (
              <>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Tout archiver</Text>
                <Text style={[theme.typography.body, { color: palette.textMuted, lineHeight: 24 }]}>
                  Les notes actives de {selectedFolderTitle} seront rangees hors de la liste principale.
                </Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => setFolderModalMode("options")}
                    style={({ pressed }) => ({
                      flex: 1,
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: palette.surfaceMuted,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pressed ? 0.82 : 1
                    })}
                  >
                    <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Retour</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleArchiveFolderNotes()}
                    style={({ pressed }) => ({
                      flex: 1,
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: "#0F1B3A",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pressed ? 0.84 : 1
                    })}
                  >
                    <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Archiver</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {selectedFolder && folderModalMode === "delete" ? (
              <>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Supprimer</Text>
                <Text style={[theme.typography.body, { color: palette.textMuted, lineHeight: 24 }]}>
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
                      backgroundColor: palette.surfaceMuted,
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Annuler</Text>
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
      {selectedFolder ? (
        <LockCodeModal
          visible={folderLockModalMode !== null}
          title={folderLockModalMode === "unlock-remove" ? "Confirmer le code" : "Securiser le dossier"}
          description={
            folderLockModalMode === "unlock-remove"
              ? "Entre le code actuel pour retirer le verrou."
              : "Cree un code pour ce dossier. Ses notes utiliseront le meme code."
          }
          mode={folderLockModalMode === "unlock-remove" ? "unlock" : "create"}
          confirmLabel={folderLockModalMode === "unlock-remove" ? "Retirer" : "Securiser"}
          error={folderLockError}
          onCancel={() => {
            setFolderLockModalMode(null);
            setFolderLockError(null);
          }}
          onSubmit={(code) => {
            if (folderLockModalMode === "unlock-remove") {
              if (!verifyLockCode(code, selectedFolder.lockCodeHash ?? useSettingsStore.getState().settings.lockCodeHash)) {
                setFolderLockError("Code incorrect.");
                return;
              }

              void updateFolder(selectedFolder.id, { isLocked: false, lockCodeHash: null });
              setFolderLockModalMode(null);
              setFolderLockError(null);
              closeFolderModal();
              return;
            }

            void updateFolder(selectedFolder.id, { isLocked: true, lockCodeHash: hashLockCode(code) });
            setFolderLockModalMode(null);
            setFolderLockError(null);
            closeFolderModal();
          }}
        />
      ) : null}

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

