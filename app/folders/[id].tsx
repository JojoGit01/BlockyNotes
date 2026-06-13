import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/ui/AppBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { LockCodeModal } from "@/components/security/LockCodeModal";
import { ScrollZone } from "@/components/ui/ScrollZone";
import { useTheme } from "@/hooks/useTheme";
import { hashLockCode, verifyLockCode } from "@/lib/security";
import { folderIconOptions, getFolderIcon } from "@/services/folders/folderIcon";
import { getFolderLockHash, isFolderLocked, isNoteLocked } from "@/services/security/locks";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getAppPalette } from "@/theme/appPalette";
import type { FolderIconKey, Note } from "@/types/models";

type FolderModalMode = "options" | "rename" | "icon" | "move" | "archive" | "delete";
type QuickNoteModalMode = "actions" | "move";
type BulkActionMode = "move" | "archive" | "delete" | null;
type FolderContentItem =
  | { type: "favoritesHeader" }
  | { type: "favoriteNote"; note: Note }
  | { type: "favoritesToggle" }
  | { type: "notesHeader" }
  | { type: "regularNote"; note: Note }
  | { type: "emptyFolder" }
  | { type: "allFavoritesInfo" };

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

      <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: palette.divider, paddingBottom: 16 }}>
        <Text
          style={[
            theme.typography.h3,
            { color: danger ? "#FF3434" : palette.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }
          ]}
        >
          {title}
        </Text>
        <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 2 }]}>{description}</Text>
      </View>
    </Pressable>
  );
}

function FolderStatCard({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <View
      style={{
        flex: 1,
        minHeight: 78,
        borderRadius: 20,
        backgroundColor: palette.surface,
        padding: 12,
        justifyContent: "space-between",
        shadowColor: palette.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 13,
          backgroundColor: iconBackground,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <View>
        <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1, fontSize: 11 }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function FolderFavoriteNoteRow({
  note,
  onOpen,
  onQuickOpen,
  onToggleSelection,
  selected,
  selectionMode
}: {
  note: Note;
  onOpen: () => void;
  onQuickOpen: () => void;
  onToggleSelection: () => void;
  selected: boolean;
  selectionMode: boolean;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const noteIcon = getNoteIcon(note);

  return (
    <Pressable
      onLongPress={() => (selectionMode ? onToggleSelection() : onQuickOpen())}
      onPress={() => (selectionMode ? onToggleSelection() : onOpen())}
      style={({ pressed }) => ({
        minHeight: 60,
        borderRadius: 20,
        backgroundColor: selected ? "#E4ECFF" : palette.surface,
        borderWidth: selected ? 1 : 0,
        borderColor: "#4F6EF7",
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        opacity: pressed ? 0.88 : 1,
        shadowColor: palette.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 15,
          backgroundColor: noteIcon.backgroundColor,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={noteIcon.icon} size={17} color={noteIcon.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]} numberOfLines={1}>
          {note.title || "Sans titre"}
        </Text>
        <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]} numberOfLines={1}>
          {noteDateLabel(note.updatedAt)}
        </Text>
      </View>
      {selectionMode ? (
        <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={21} color={selected ? "#4F6EF7" : "#A4A7B0"} />
      ) : (
        <Ionicons name="star" size={16} color="#F59E0B" />
      )}
    </Pressable>
  );
}

function FolderRegularNoteRow({
  locked,
  meta,
  note,
  onOpen,
  onQuickOpen,
  onToggleSelection,
  selected,
  selectionMode
}: {
  locked: boolean;
  meta: string;
  note: Note;
  onOpen: () => void;
  onQuickOpen: () => void;
  onToggleSelection: () => void;
  selected: boolean;
  selectionMode: boolean;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const noteIcon = getNoteIcon(note);

  return (
    <Pressable
      onLongPress={() => (selectionMode ? onToggleSelection() : onQuickOpen())}
      onPress={() => (selectionMode ? onToggleSelection() : onOpen())}
      style={({ pressed }) => ({
        minHeight: 72,
        borderRadius: 21,
        backgroundColor: selected ? "#E4ECFF" : palette.surface,
        borderWidth: selected ? 1 : 0,
        borderColor: "#4F6EF7",
        paddingHorizontal: 14,
        paddingVertical: 11,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: pressed ? 0.88 : 1,
        shadowColor: palette.shadow,
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
        <Ionicons name={locked ? "lock-closed" : noteIcon.icon} size={21} color={locked ? "#0F1B3A" : noteIcon.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[theme.typography.h3, { color: palette.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }]}
          numberOfLines={1}
        >
          {note.title || "Sans titre"}
        </Text>
        <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      {locked ? (
        <View
          style={{
            borderRadius: 12,
            backgroundColor: "#E4ECFF",
            paddingHorizontal: 8,
            paddingVertical: 5,
            flexDirection: "row",
            alignItems: "center",
            gap: 4
          }}
        >
          <Ionicons name="shield-checkmark" size={12} color="#4F6EF7" />
          <Text style={[theme.typography.caption, { color: "#4F6EF7", fontWeight: "900", fontSize: 10 }]}>Secure</Text>
        </View>
      ) : null}
      {selectionMode ? (
        <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={22} color={selected ? "#4F6EF7" : "#A4A7B0"} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color="#A4A7B0" />
      )}
    </Pressable>
  );
}

export default function FolderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const insets = useSafeAreaInsets();
  const floatingButtonBottom = insets.bottom + 90;
  const settings = useSettingsStore((state) => state.settings);
  const isPersonalFolder = id === "personal";
  const folder = useFoldersStore((state) => state.folders.find((entry) => entry.id === id));
  const folders = useFoldersStore((state) => state.folders);
  const updateFolder = useFoldersStore((state) => state.updateFolder);
  const deleteFolder = useFoldersStore((state) => state.deleteFolder);
  const moveNote = useNotesStore((state) => state.moveNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const archiveNote = useNotesStore((state) => state.archiveNote);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const togglePinned = useNotesStore((state) => state.togglePinned);
  const allNotes = useNotesStore((state) => state.notes);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [folderUnlocked, setFolderUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [folderLockModalMode, setFolderLockModalMode] = useState<"create" | "unlock-remove" | null>(null);
  const [folderLockError, setFolderLockError] = useState<string | null>(null);
  const [folderModalMode, setFolderModalMode] = useState<FolderModalMode>("options");
  const [renameName, setRenameName] = useState(folder?.name ?? "");
  const [editIconKey, setEditIconKey] = useState<FolderIconKey>("briefcase");
  const [selectedMoveNoteIds, setSelectedMoveNoteIds] = useState<string[]>([]);
  const [quickNote, setQuickNote] = useState<Note | null>(null);
  const [quickNoteMode, setQuickNoteMode] = useState<QuickNoteModalMode>("actions");
  const [showAllFavorites, setShowAllFavorites] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBulkNoteIds, setSelectedBulkNoteIds] = useState<string[]>([]);
  const [bulkActionMode, setBulkActionMode] = useState<BulkActionMode>(null);
  const notes = useMemo(
    () =>
      [...allNotes]
        .filter((note) => (isPersonalFolder ? note.folderId === null : note.folderId === id) && !note.isDeleted && !note.isArchived)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [allNotes, id, isPersonalFolder]
  );
  const favoriteNotes = useMemo(() => notes.filter((note) => note.isFavorite), [notes]);
  const regularNotes = useMemo(() => notes.filter((note) => !note.isFavorite), [notes]);
  const visibleFavoriteNotes = useMemo(
    () => (showAllFavorites ? favoriteNotes : favoriteNotes.slice(0, 3)),
    [favoriteNotes, showAllFavorites]
  );
  const folderContentItems = useMemo<FolderContentItem[]>(() => {
    const items: FolderContentItem[] = [];

    if (favoriteNotes.length > 0) {
      items.push({ type: "favoritesHeader" });
      visibleFavoriteNotes.forEach((note) => items.push({ type: "favoriteNote", note }));

      if (favoriteNotes.length > 3) {
        items.push({ type: "favoritesToggle" });
      }
    }

    if (notes.length === 0) {
      items.push({ type: "emptyFolder" });
      return items;
    }

    items.push({ type: "notesHeader" });

    if (regularNotes.length > 0) {
      regularNotes.forEach((note) => items.push({ type: "regularNote", note }));
      return items;
    }

    if (favoriteNotes.length > 0) {
      items.push({ type: "allFavoritesInfo" });
    }

    return items;
  }, [favoriteNotes, notes.length, regularNotes, visibleFavoriteNotes]);
  const pinnedNotesCount = notes.filter((note) => note.isPinned).length;
  const selectedBulkNotes = notes.filter((note) => selectedBulkNoteIds.includes(note.id));
  const title = isPersonalFolder ? "Personnel" : folder?.name ?? "";
  const heroFolderIcon = isPersonalFolder ? null : folder ? getFolderIcon(folder) : null;
  const folderLockHash = getFolderLockHash(folder, settings);
  const requiresFolderUnlock = Boolean(!isPersonalFolder && folder && isFolderLocked(folder, settings) && folderLockHash && !folderUnlocked);
  const destinationFolders = folders.filter((entry) => entry.id !== folder?.id);
  const quickMoveDestinations = [
    { id: null as string | null, name: "Personnel", icon: "folder-open-outline" as keyof typeof Ionicons.glyphMap, color: "#4F6EF7", background: "#E4ECFF" },
    ...folders.map((entry) => {
      const entryIcon = getFolderIcon(entry);

      return {
        id: entry.id,
        name: entry.name,
        icon: entryIcon.icon,
        color: entryIcon.color,
        background: entryIcon.backgroundColor
      };
    })
  ].filter((destination) => destination.id !== quickNote?.folderId);
  const bulkMoveDestinations = [
    { id: null as string | null, name: "Personnel", icon: "folder-open-outline" as keyof typeof Ionicons.glyphMap, color: "#4F6EF7", background: "#E4ECFF" },
    ...folders.map((entry) => {
      const entryIcon = getFolderIcon(entry);

      return {
        id: entry.id,
        name: entry.name,
        icon: entryIcon.icon,
        color: entryIcon.color,
        background: entryIcon.backgroundColor
      };
    })
  ].filter((destination) => (isPersonalFolder ? destination.id !== null : destination.id !== id));

  const goBackToFolders = () => {
    router.replace("/folders");
  };

  useEffect(() => {
    setFolderUnlocked(false);
    setUnlockError(null);
  }, [id]);

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

  if (requiresFolderUnlock) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <AppBackground />
        <LockCodeModal
          visible
          title="Dossier verrouille"
          description={`Entre le code du dossier "${folder?.name ?? "Dossier"}".`}
          mode="unlock"
          error={unlockError}
          onCancel={goBackToFolders}
          onSubmit={(code) => {
            if (verifyLockCode(code, folderLockHash)) {
              setUnlockError(null);
              setFolderUnlocked(true);
              return;
            }

            setUnlockError("Code incorrect.");
          }}
        />
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
    setSelectedMoveNoteIds([]);
  };

  const openQuickNoteMenu = (note: Note) => {
    setQuickNote(note);
    setQuickNoteMode("actions");
  };

  const closeQuickNoteMenu = () => {
    setQuickNote(null);
    setQuickNoteMode("actions");
  };

  const closeSelectionMode = () => {
    setSelectionMode(false);
    setSelectedBulkNoteIds([]);
    setBulkActionMode(null);
  };

  const openSelectionMode = (noteId?: string) => {
    closeQuickNoteMenu();
    setSelectionMode(true);
    setSelectedBulkNoteIds(noteId ? [noteId] : []);
  };

  const toggleBulkNote = (noteId: string) => {
    setSelectedBulkNoteIds((current) =>
      current.includes(noteId) ? current.filter((entry) => entry !== noteId) : [...current, noteId]
    );
  };

  const toggleAllBulkNotes = () => {
    setSelectedBulkNoteIds((current) => (current.length === notes.length ? [] : notes.map((note) => note.id)));
  };

  const openBulkSelectionFromOptions = () => {
    closeOptions();
    openSelectionMode();
  };

  const goToNewNote = () => {
    router.push({
      pathname: "/notes/new",
      params: {
        folderId: isPersonalFolder ? "personal" : id,
        returnFolderId: isPersonalFolder ? "personal" : id
      }
    });
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

  const handleToggleFolderLock = async () => {
    if (!folder) {
      return;
    }

    if (folder.isLocked) {
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

  const openMoveAllMode = () => {
    setSelectedMoveNoteIds(notes.map((note) => note.id));
    setFolderModalMode("move");
  };

  const toggleMoveNote = (noteId: string) => {
    setSelectedMoveNoteIds((current) =>
      current.includes(noteId) ? current.filter((entry) => entry !== noteId) : [...current, noteId]
    );
  };

  const toggleAllMoveNotes = () => {
    setSelectedMoveNoteIds((current) => (current.length === notes.length ? [] : notes.map((note) => note.id)));
  };

  const handleMoveFolderNotes = async (folderId: string | null) => {
    if (selectedMoveNoteIds.length === 0) {
      Alert.alert("Selection requise", "Choisis au moins une note a deplacer.");
      return;
    }

    await Promise.all(selectedMoveNoteIds.map((noteId) => moveNote(noteId, folderId)));
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

  const handleArchiveFolderNotes = async () => {
    await Promise.all(notes.map((note) => archiveNote(note.id)));
    closeOptions();
  };

  const runQuickAction = async (action: "favorite" | "pin" | "archive" | "delete") => {
    if (!quickNote) {
      return;
    }

    if (action === "favorite") {
      await toggleFavorite(quickNote.id);
    }

    if (action === "pin") {
      await togglePinned(quickNote.id);
    }

    if (action === "archive") {
      await archiveNote(quickNote.id);
    }

    if (action === "delete") {
      await deleteNote(quickNote.id);
    }

    closeQuickNoteMenu();
  };

  const runQuickMove = async (folderId: string | null) => {
    if (!quickNote) {
      return;
    }

    await moveNote(quickNote.id, folderId);
    closeQuickNoteMenu();
  };

  const handleBulkMove = async (folderId: string | null) => {
    if (selectedBulkNoteIds.length === 0) {
      return;
    }

    await Promise.all(selectedBulkNoteIds.map((noteId) => moveNote(noteId, folderId)));
    closeSelectionMode();
  };

  const handleBulkArchive = async () => {
    if (selectedBulkNoteIds.length === 0) {
      return;
    }

    await Promise.all(selectedBulkNoteIds.map((noteId) => archiveNote(noteId)));
    closeSelectionMode();
  };

  const handleBulkDelete = async () => {
    if (selectedBulkNoteIds.length === 0) {
      return;
    }

    await Promise.all(selectedBulkNoteIds.map((noteId) => deleteNote(noteId)));
    closeSelectionMode();
  };

  const quickNoteActions = quickNote
    ? [
        {
          label: quickNote.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris",
          icon: "star" as keyof typeof Ionicons.glyphMap,
          color: "#F59E0B",
          background: "#FFF1DC",
          onPress: () => void runQuickAction("favorite")
        },
        {
          label: quickNote.isPinned ? "Retirer l'epingle" : "Epingler",
          icon: "sparkles" as keyof typeof Ionicons.glyphMap,
          color: "#7C4DFF",
          background: "#F0E6FF",
          onPress: () => void runQuickAction("pin")
        },
        {
          label: "Deplacer",
          icon: "arrow-redo" as keyof typeof Ionicons.glyphMap,
          color: "#4F6EF7",
          background: "#E4ECFF",
          onPress: () => setQuickNoteMode("move")
        },
        {
          label: "Selectionner",
          icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
          color: "#18A058",
          background: "#D8FAF1",
          onPress: () => openSelectionMode(quickNote.id)
        },
        {
          label: "Archiver",
          icon: "archive" as keyof typeof Ionicons.glyphMap,
          color: "#0F1B3A",
          background: "#E9ECF3",
          onPress: () => void runQuickAction("archive")
        },
        {
          label: "Mettre a la corbeille",
          icon: "trash-outline" as keyof typeof Ionicons.glyphMap,
          color: "#FF3434",
          background: "#FFE6E6",
          onPress: () => void runQuickAction("delete")
        }
      ]
    : [];

  const openNoteFromFolder = (note: Note) => {
    router.push({
      pathname: "/notes/[id]",
      params: {
        id: note.id,
        returnFolderId: isPersonalFolder ? "personal" : id
      }
    });
  };

  const renderFolderContentItem = ({ item }: { item: FolderContentItem }) => {
    if (item.type === "favoritesHeader") {
      return (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 2 }}>
          <Text style={{ color: palette.text, fontSize: 19, lineHeight: 24, fontWeight: "900" }}>Favoris du dossier</Text>
          {selectionMode ? (
            <Pressable onPress={toggleAllBulkNotes} hitSlop={10}>
              <Text style={[theme.typography.caption, { color: "#4F6EF7", fontWeight: "900" }]}>
                {selectedBulkNoteIds.length === notes.length ? "Tout retirer" : "Tout choisir"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      );
    }

    if (item.type === "favoriteNote") {
      const selected = selectedBulkNoteIds.includes(item.note.id);

      return (
        <FolderFavoriteNoteRow
          note={item.note}
          onOpen={() => openNoteFromFolder(item.note)}
          onQuickOpen={() => openQuickNoteMenu(item.note)}
          onToggleSelection={() => toggleBulkNote(item.note.id)}
          selected={selected}
          selectionMode={selectionMode}
        />
      );
    }

    if (item.type === "favoritesToggle") {
      return (
        <Pressable
          onPress={() => setShowAllFavorites((current) => !current)}
          style={({ pressed }) => ({
            minHeight: 44,
            borderRadius: 16,
            backgroundColor: palette.surfaceMuted,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.82 : 1
          })}
        >
          <Text style={[theme.typography.label, { color: "#4F6EF7", fontWeight: "900" }]}>
            {showAllFavorites ? "Reduire les favoris" : `Voir les ${favoriteNotes.length} favoris`}
          </Text>
        </Pressable>
      );
    }

    if (item.type === "notesHeader") {
      return (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: favoriteNotes.length > 0 ? 6 : 0 }}>
          <Text style={{ color: palette.text, fontSize: 21, lineHeight: 26, fontWeight: "900" }}>Notes du dossier</Text>
          {selectionMode ? (
            <Pressable onPress={toggleAllBulkNotes} hitSlop={10}>
              <Text style={[theme.typography.caption, { color: "#4F6EF7", fontWeight: "900" }]}>
                {selectedBulkNoteIds.length === notes.length ? "Tout retirer" : "Tout choisir"}
              </Text>
            </Pressable>
          ) : null}
        </View>
      );
    }

    if (item.type === "regularNote") {
      const count = noteElementCount(item.note);
      const locked = isNoteLocked(item.note, folder, settings);
      const noteMeta = locked ? "Contenu masque - code requis" : `${count} element${count > 1 ? "s" : ""} - ${noteDateLabel(item.note.updatedAt)}`;
      const selected = selectedBulkNoteIds.includes(item.note.id);

      return (
        <FolderRegularNoteRow
          locked={locked}
          meta={noteMeta}
          note={item.note}
          onOpen={() => openNoteFromFolder(item.note)}
          onQuickOpen={() => openQuickNoteMenu(item.note)}
          onToggleSelection={() => toggleBulkNote(item.note.id)}
          selected={selected}
          selectionMode={selectionMode}
        />
      );
    }

    if (item.type === "emptyFolder") {
      return (
        <EmptyState
          title="Aucune note ici"
          description="Ajoute une note dans ce dossier pour commencer a l'organiser."
          icon="create-outline"
          iconBackgroundColor={palette.surfaceMuted}
          iconColor="#FF6B7A"
          actionLabel="Creer une note"
          onActionPress={goToNewNote}
        />
      );
    }

    return (
      <View
        style={{
          minHeight: 128,
          borderRadius: 22,
          backgroundColor: palette.surface,
          padding: 18,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          shadowColor: palette.shadow,
          shadowOpacity: 0.05,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 17,
            backgroundColor: "#FFF1DC",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name="star" size={22} color="#F59E0B" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.text, fontSize: 18, lineHeight: 23, fontWeight: "900" }}>
            Toutes les notes sont en favoris
          </Text>
          <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 4, lineHeight: 22 }]}>
            Elles restent accessibles dans la section favoris juste au-dessus.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBackground />
      <FlatList
        data={folderContentItems}
        keyExtractor={(item, index) => (item.type === "favoriteNote" || item.type === "regularNote" ? `${item.type}-${item.note.id}` : `${item.type}-${index}`)}
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: floatingButtonBottom + 82
        }}
        initialNumToRender={10}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 18, marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Pressable
                onPress={goBackToFolders}
                style={({ pressed }) => ({
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  backgroundColor: palette.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1,
                  shadowColor: palette.shadow,
                  shadowOpacity: 0.05,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 5
                })}
              >
                <Ionicons name="arrow-back" size={20} color={palette.text} />
              </Pressable>

              <Pressable
                onPress={openOptions}
                style={({ pressed }) => ({
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  backgroundColor: palette.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1,
                  shadowColor: palette.shadow,
                  shadowOpacity: 0.05,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 5
                })}
              >
                <Ionicons name="ellipsis-horizontal" size={21} color={palette.text} />
              </Pressable>
            </View>

            <View
              style={{
                minHeight: 104,
                borderRadius: 24,
                backgroundColor: "#0F1B3A",
                overflow: "hidden",
                padding: 18,
                justifyContent: "center",
                shadowColor: "#0F1B3A",
                shadowOpacity: 0.2,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 8
              }}
            >
              <View
                style={{
                  position: "absolute",
                  right: -44,
                  top: -54,
                  width: 168,
                  height: 168,
                  borderRadius: 84,
                  backgroundColor: "rgba(255,255,255,0.12)"
                }}
              />
              <View
                style={{
                  position: "absolute",
                  right: 20,
                  bottom: -92,
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  backgroundColor: "rgba(124,77,255,0.28)"
                }}
              />

              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 19,
                    backgroundColor: heroFolderIcon?.backgroundColor ?? "rgba(255,255,255,0.16)",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Ionicons
                    name={isPersonalFolder ? "folder-open-outline" : heroFolderIcon?.icon ?? "folder-open-outline"}
                    size={25}
                    color={heroFolderIcon?.color ?? "#FFFFFF"}
                  />
                </View>
                <Text style={{ flex: 1, color: "#FFFFFF", fontSize: 28, lineHeight: 34, fontWeight: "900" }} numberOfLines={1}>
                  {title}
                </Text>
                {folder?.isLocked ? (
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 13,
                      backgroundColor: "rgba(255,255,255,0.16)",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="lock-closed" size={15} color="#FFFFFF" />
                  </View>
                ) : null}
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <FolderStatCard
                icon="document-text"
                iconColor="#4F6EF7"
                iconBackground="#E4ECFF"
                title={`${notes.length} note${notes.length > 1 ? "s" : ""}`}
                subtitle="Actives"
              />
              <FolderStatCard
                icon="star"
                iconColor="#F59E0B"
                iconBackground="#FFF1DC"
                title={`${favoriteNotes.length} favori${favoriteNotes.length > 1 ? "s" : ""}`}
                subtitle="Dans ce dossier"
              />
              <FolderStatCard
                icon="sparkles"
                iconColor="#7C4DFF"
                iconBackground="#F0E6FF"
                title={`${pinnedNotesCount} epinglee${pinnedNotesCount > 1 ? "s" : ""}`}
                subtitle="Prioritaires"
              />
            </View>
          </View>
        }
        maxToRenderPerBatch={10}
        removeClippedSubviews
        renderItem={renderFolderContentItem}
        windowSize={7}
      />

      {selectionMode ? (
        <View
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: insets.bottom + 82,
            minHeight: 74,
            borderRadius: 24,
            backgroundColor: palette.surface,
            padding: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            shadowColor: palette.shadow,
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 14 },
            elevation: 14
          }}
        >
          <Pressable
            onPress={closeSelectionMode}
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 15,
              backgroundColor: palette.surfaceMuted,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.82 : 1
            })}
          >
            <Ionicons name="close" size={20} color={palette.text} />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>
              {selectedBulkNoteIds.length} selectionnee{selectedBulkNoteIds.length > 1 ? "s" : ""}
            </Text>
            <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]}>Actions en lot</Text>
          </View>

          {[
            { mode: "move" as const, icon: "arrow-redo" as keyof typeof Ionicons.glyphMap, color: "#4F6EF7", background: "#E4ECFF" },
            { mode: "archive" as const, icon: "archive" as keyof typeof Ionicons.glyphMap, color: "#0F1B3A", background: "#E9ECF3" },
            { mode: "delete" as const, icon: "trash-outline" as keyof typeof Ionicons.glyphMap, color: "#FF3434", background: "#FFE6E6" }
          ].map((action) => (
            <Pressable
              key={action.mode}
              disabled={selectedBulkNoteIds.length === 0}
              onPress={() => setBulkActionMode(action.mode)}
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: 15,
                backgroundColor: selectedBulkNoteIds.length === 0 ? palette.surfaceMuted : action.background,
                alignItems: "center",
                justifyContent: "center",
                opacity: selectedBulkNoteIds.length === 0 ? 0.45 : pressed ? 0.78 : 1
              })}
            >
              <Ionicons name={action.icon} size={18} color={selectedBulkNoteIds.length === 0 ? palette.textMuted : action.color} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Pressable
          onPress={goToNewNote}
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
            shadowOpacity: 0.26,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 12
          })}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Pressable>
      )}

      <Modal visible={bulkActionMode !== null} transparent animationType="slide" onRequestClose={() => setBulkActionMode(null)}>
        <Pressable
          onPress={() => setBulkActionMode(null)}
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
            <SheetHandle />

            {bulkActionMode === "move" ? (
              <>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Deplacer les notes</Text>
                  <Text style={[theme.typography.body, { color: palette.textMuted }]}>
                    {selectedBulkNoteIds.length} note{selectedBulkNoteIds.length > 1 ? "s" : ""} selectionnee{selectedBulkNoteIds.length > 1 ? "s" : ""}
                  </Text>
                </View>
                <ScrollZone maxHeight={300}>
                  <View style={{ gap: 10 }}>
                    {bulkMoveDestinations.map((destination) => (
                      <Pressable
                        key={destination.id ?? "personal"}
                        onPress={() => void handleBulkMove(destination.id)}
                        style={({ pressed }) => ({
                          minHeight: 58,
                          borderRadius: 19,
                          paddingHorizontal: 16,
                          backgroundColor: palette.surfaceMuted,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          opacity: pressed ? 0.78 : 1
                        })}
                      >
                        <View
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 13,
                            backgroundColor: destination.background,
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Ionicons name={destination.icon} size={16} color={destination.color} />
                        </View>
                        <Text style={[theme.typography.label, { color: palette.text, flex: 1, fontWeight: "900" }]}>
                          {destination.name}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color="#A4A7B0" />
                      </Pressable>
                    ))}
                  </View>
                </ScrollZone>
              </>
            ) : null}

            {bulkActionMode === "archive" || bulkActionMode === "delete" ? (
              <>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>
                    {bulkActionMode === "archive" ? "Archiver les notes" : "Mettre a la corbeille"}
                  </Text>
                  <Text style={[theme.typography.body, { color: palette.textMuted, lineHeight: 24 }]}>
                    {selectedBulkNotes.length} note{selectedBulkNotes.length > 1 ? "s" : ""} seront{" "}
                    {bulkActionMode === "archive" ? "rangees hors de la liste principale." : "envoyees dans la corbeille."}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Pressable
                    onPress={() => setBulkActionMode(null)}
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
                    onPress={() => void (bulkActionMode === "archive" ? handleBulkArchive() : handleBulkDelete())}
                    style={({ pressed }) => ({
                      flex: 1,
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: bulkActionMode === "archive" ? "#0F1B3A" : "#FF3434",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pressed ? 0.84 : 1
                    })}
                  >
                    <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>
                      {bulkActionMode === "archive" ? "Archiver" : "Confirmer"}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={quickNote !== null} transparent animationType="slide" onRequestClose={closeQuickNoteMenu}>
        <Pressable
          onPress={closeQuickNoteMenu}
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
            <SheetHandle />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 19,
                    backgroundColor: quickNote ? getNoteIcon(quickNote).backgroundColor : palette.surfaceMuted,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {quickNote ? <Ionicons name={getNoteIcon(quickNote).icon} size={24} color={getNoteIcon(quickNote).color} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: palette.text, fontSize: 27, lineHeight: 34, fontWeight: "900" }} numberOfLines={1}>
                    {quickNoteMode === "move" ? "Deplacer la note" : "Options rapides"}
                  </Text>
                  <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 2 }]} numberOfLines={1}>
                    {quickNote?.title || "Sans titre"}
                  </Text>
                </View>
              </View>

              {quickNoteMode === "actions" && quickNote ? (
                <View style={{ gap: 14 }}>
                  {quickNoteActions.map((action) => {
                    const isDanger = action.color === "#FF3434";

                    return (
                      <Pressable
                        key={action.label}
                        onPress={action.onPress}
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
                            backgroundColor: action.background,
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Ionicons name={action.icon} size={21} color={action.color} />
                        </View>
                        <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: palette.divider, paddingBottom: 14 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  theme.typography.h3,
                                  { color: isDanger ? "#FF3434" : palette.text, fontSize: 18, lineHeight: 23, fontWeight: "900" }
                                ]}
                                numberOfLines={1}
                              >
                                {action.label}
                              </Text>
                              <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 1 }]} numberOfLines={1}>
                                {action.label === "Deplacer"
                                  ? "Mettre dans un autre dossier"
                                  : action.label === "Selectionner"
                                    ? "Choisir plusieurs notes"
                                  : action.label.includes("favoris")
                                    ? "Retrouver cette note plus vite"
                                    : action.label.includes("epingle") || action.label === "Epingler"
                                      ? "Garder en haut de l'accueil"
                                      : action.label.includes("corbeille")
                                        ? "Envoyer dans la corbeille"
                                        : "Masquer sans supprimer"}
                              </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#A4A7B0" />
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {quickNoteMode === "move" ? (
                <View style={{ gap: 10 }}>
                  <ScrollZone maxHeight={320}>
                    <View style={{ gap: 10 }}>
                      {quickMoveDestinations.map((destination) => (
                        <Pressable
                          key={destination.id ?? "personal"}
                          onPress={() => void runQuickMove(destination.id)}
                          style={({ pressed }) => ({
                            minHeight: 58,
                            borderRadius: 19,
                            paddingHorizontal: 16,
                            backgroundColor: palette.surfaceMuted,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            opacity: pressed ? 0.78 : 1
                          })}
                        >
                          <View
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 13,
                              backgroundColor: destination.background,
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Ionicons name={destination.icon} size={16} color={destination.color} />
                          </View>
                          <Text style={[theme.typography.label, { color: palette.text, flex: 1, fontWeight: "900" }]}>
                            {destination.name}
                          </Text>
                          <Ionicons name="chevron-forward" size={16} color="#A4A7B0" />
                        </Pressable>
                      ))}
                    </View>
                  </ScrollZone>
                  <Pressable
                    onPress={() => setQuickNoteMode("actions")}
                    style={({ pressed }) => ({
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: "#0F1B3A",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: pressed ? 0.82 : 1,
                      marginTop: 6
                    })}
                  >
                    <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Retour</Text>
                  </Pressable>
                </View>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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

            {folderModalMode === "options" ? (
              <>
                <Text style={{ color: palette.text, fontSize: 27, lineHeight: 34, fontWeight: "900" }}>
                  Options du dossier
                </Text>
                <View style={{ gap: 16, paddingTop: 6 }}>
                  {!isPersonalFolder && folder ? (
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
                      <OptionRow
                        title={folder.isLocked ? "Retirer le verrou" : "Securiser"}
                        description={folder.isLocked ? "Retirer le code du dossier" : "Demander un code pour ce dossier"}
                        icon={folder.isLocked ? "lock-open-outline" : "lock-closed-outline"}
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
                    title="Selectionner les notes"
                    description="Actions rapides sur plusieurs notes"
                    icon="checkmark-circle"
                    iconColor="#18A058"
                    iconBackground="#D8FAF1"
                    onPress={openBulkSelectionFromOptions}
                  />
                  <OptionRow
                    title="Tout deplacer"
                    description="Transferer toutes les notes actives"
                    icon="file-tray-full"
                    iconColor="#4F6EF7"
                    iconBackground="#E4ECFF"
                    onPress={openMoveAllMode}
                  />
                  <OptionRow
                    title="Tout archiver"
                    description="Ranger toutes les notes du dossier"
                    icon="archive"
                    iconColor="#0F1B3A"
                    iconBackground="#E9ECF3"
                    onPress={() => setFolderModalMode("archive")}
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

            {folderModalMode === "icon" && folder ? (
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

            {folderModalMode === "move" ? (
              <>
                <View style={{ gap: 4 }}>
                  <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Transferer les notes</Text>
                  <Text style={[theme.typography.body, { color: palette.textMuted }]}>
                    {selectedMoveNoteIds.length} sur {notes.length} selectionnee{selectedMoveNoteIds.length > 1 ? "s" : ""} depuis {title}
                  </Text>
                </View>

                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={[theme.typography.caption, { color: palette.textMuted, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.2 }]}>
                      Notes a transferer
                    </Text>
                    {notes.length > 0 ? (
                      <Pressable
                        onPress={toggleAllMoveNotes}
                        hitSlop={10}
                      >
                        <Text style={[theme.typography.caption, { color: "#4F6EF7", fontWeight: "900" }]}>
                          {selectedMoveNoteIds.length === notes.length ? "Tout retirer" : "Tout choisir"}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <ScrollZone maxHeight={184}>
                    <View style={{ gap: 8 }}>
                      {notes.length === 0 ? (
                        <Text style={[theme.typography.body, { color: palette.textMuted }]}>Aucune note dans ce dossier.</Text>
                      ) : null}
                      {notes.map((note) => {
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
                            <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900", flex: 1 }]} numberOfLines={1}>
                              {note.title || "Sans titre"}
                            </Text>
                            <Ionicons name={selected ? "checkmark-circle" : "ellipse-outline"} size={20} color={selected ? "#4F6EF7" : palette.textMuted} />
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollZone>
                </View>

                <View style={{ gap: 10 }}>
                  <Text style={[theme.typography.caption, { color: palette.textMuted, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1.2 }]}>
                    Destination
                  </Text>
                  <ScrollZone maxHeight={184}>
                    <View style={{ gap: 10 }}>
                      {!isPersonalFolder ? (
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
                      {destinationFolders.map((entry) => {
                        const entryIcon = getFolderIcon(entry);

                        return (
                          <Pressable
                            key={entry.id}
                            onPress={() => void handleMoveFolderNotes(entry.id)}
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
                                backgroundColor: entryIcon.backgroundColor,
                                alignItems: "center",
                                justifyContent: "center"
                              }}
                            >
                              <Ionicons name={entryIcon.icon} size={17} color={entryIcon.color} />
                            </View>
                            <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>
                              {entry.name}
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
            {folderModalMode === "archive" ? (
              <>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Tout archiver</Text>
                <Text style={[theme.typography.body, { color: palette.textMuted, lineHeight: 24 }]}>
                  Les {notes.length} note{notes.length > 1 ? "s" : ""} active{notes.length > 1 ? "s" : ""} de {title} seront sorties de la liste principale.
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
                    <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Retour</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleArchiveFolderNotes()}
                    style={{
                      flex: 1,
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: "#0F1B3A",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>Archiver</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
            {folderModalMode === "delete" && folder ? (
              <>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Supprimer</Text>
                <Text style={[theme.typography.body, { color: palette.textMuted, lineHeight: 24 }]}>
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
      {folder ? (
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
              if (!verifyLockCode(code, folder.lockCodeHash ?? settings.lockCodeHash)) {
                setFolderLockError("Code incorrect.");
                return;
              }

              void updateFolder(folder.id, { isLocked: false, lockCodeHash: null });
              setFolderLockModalMode(null);
              setFolderLockError(null);
              closeOptions();
              return;
            }

            void updateFolder(folder.id, { isLocked: true, lockCodeHash: hashLockCode(code) });
            setFolderLockModalMode(null);
            setFolderLockError(null);
            closeOptions();
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}
