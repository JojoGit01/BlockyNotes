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
 * @description Renders the notes library with Inbox, timelines, filters, search, and bulk actions.
 *
 * @project     BlockyNotes
 * @module      Application / Notes
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
import { Modal, Pressable, ScrollView, SectionList, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/ui/AppBackground";
import { AppHeaderLogo } from "@/components/ui/AppHeaderLogo";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScrollZone } from "@/components/ui/ScrollZone";
import { useTheme } from "@/hooks/useTheme";
import { sortNotes } from "@/lib/sort";
import { getFolderIcon } from "@/services/folders/folderIcon";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { extractHashtags, matchesSmartCollection, type SmartCollectionKey } from "@/services/notes/noteInsights";
import { searchNotesService } from "@/services/notes/searchNotes";
import { isNoteLocked } from "@/services/security/locks";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUIStore } from "@/store/useUIStore";
import { getAppPalette } from "@/theme/appPalette";
import { hapticImpact, hapticSelection, hapticSuccess } from "@/lib/haptics";
import type { Note, SortOrder } from "@/types/models";

type NotesTab = "all" | "inbox" | "favorites" | "archived" | "deleted";
type NotesTimeline = "day" | "week" | "month";
type NoteListAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: "secondary" | "danger";
  onPress: () => void;
};
type NoteActionModalState =
  | { type: "restore-archive"; noteId: string; title: string }
  | { type: "trash-archive"; noteId: string; title: string }
  | { type: "restore-trash"; noteId: string; title: string }
  | { type: "purge-trash"; noteId: string; title: string }
  | null;
type QuickNoteModalMode = "actions" | "move";
type NotesGroup = { key: string; label: string; data: Note[]; sortTime: number };

const navy = "#0F1B3A";

const getStartOfDay = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getStartOfWeek = (date: Date) => {
  const startOfDay = getStartOfDay(date);
  const mondayBasedDay = (startOfDay.getDay() + 6) % 7;
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - mondayBasedDay);
  return startOfWeek;
};

const capitalizeDateLabel = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);

const getTimelineGroupLabel = (isoDate: string, timeline: NotesTimeline) => {
  const noteDate = new Date(isoDate);
  const today = getStartOfDay(new Date());

  if (timeline === "day") {
    const dayStart = getStartOfDay(noteDate);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (dayStart.getTime() === today.getTime()) {
      return "Aujourd'hui";
    }

    if (dayStart.getTime() === yesterday.getTime()) {
      return "Hier";
    }

    return capitalizeDateLabel(
      noteDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long"
      })
    );
  }

  if (timeline === "week") {
    const weekStart = getStartOfWeek(noteDate);
    const currentWeekStart = getStartOfWeek(today);

    if (weekStart.getTime() === currentWeekStart.getTime()) {
      return "Cette semaine";
    }

    return `Semaine du ${weekStart.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long"
    })}`;
  }

  return capitalizeDateLabel(
    noteDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric"
    })
  );
};

const getTimelineGroupKey = (isoDate: string, timeline: NotesTimeline) => {
  const noteDate = new Date(isoDate);

  if (timeline === "day") {
    return getStartOfDay(noteDate).toISOString();
  }

  if (timeline === "week") {
    return getStartOfWeek(noteDate).toISOString();
  }

  return `${noteDate.getFullYear()}-${String(noteDate.getMonth() + 1).padStart(2, "0")}`;
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

function NoteChip({ label, icon }: { label: string; icon?: keyof typeof Ionicons.glyphMap }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const secure = label === "Securisee";
  const mode = label === "Libre" || label === "Journal";

  return (
    <View
      style={{
        borderRadius: 10,
        backgroundColor: secure ? "#E4ECFF" : palette.surfaceMuted,
        paddingHorizontal: mode ? 6 : 7,
        paddingVertical: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 4
      }}
    >
      {icon ? <Ionicons name={icon} size={mode ? 12 : 10} color={secure ? "#4F6EF7" : palette.textMuted} /> : null}
      {mode ? null : (
        <Text
          style={[
            theme.typography.caption,
            { color: secure ? "#4F6EF7" : palette.textMuted, fontWeight: "900", fontSize: 10 }
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

function NotesListItem({
  actions = [],
  folderName,
  locked,
  note,
  onLongPress
}: {
  actions?: NoteListAction[];
  folderName: string | null;
  locked: boolean;
  note: Note;
  onLongPress?: () => void;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const noteIcon = getNoteIcon(note);
  const elementCount = noteElementCount(note);
  const contentPreview = note.content.trim().split(/\r?\n/).find(Boolean);
  const noteMode = note.noteMode ?? "day";
  const hashtags = extractHashtags(`${note.title}\n${note.content}`);
  const subtitle = locked
    ? "Contenu masque - code requis"
    : noteMode === "free" && contentPreview
      ? contentPreview
    : elementCount > 1
      ? `${elementCount} elements - ${noteDateLabel(note.updatedAt)}`
      : contentPreview
        ? contentPreview
        : noteDateLabel(note.updatedAt);
  const chips = [
    noteMode === "free" ? "Libre" : "Journal",
    note.isInbox ? "Inbox" : null,
    folderName,
    locked ? "Securisee" : null,
    note.isFavorite ? "Favori" : null,
    note.isPinned ? "Epinglee" : null,
    note.isArchived ? "Archivee" : null,
    note.isDeleted ? "Corbeille" : null,
    hashtags[0] ? `#${hashtags[0]}` : null
  ].filter(Boolean) as string[];

  return (
    <View
      style={{
        minHeight: 88,
        borderRadius: 22,
        backgroundColor: palette.surface,
        paddingHorizontal: 14,
        paddingVertical: 12,
        shadowColor: palette.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5
      }}
    >
      <Pressable
        onLongPress={onLongPress}
        onPress={() => router.push(`/notes/${note.id}`)}
        style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: noteIcon.backgroundColor,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={locked ? "lock-closed" : noteIcon.icon} size={20} color={locked ? "#0F1B3A" : noteIcon.color} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.h3, { color: palette.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }]} numberOfLines={1}>
              {note.title || "Sans titre"}
            </Text>
            <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]} numberOfLines={1}>
              {subtitle}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
              {chips.length > 0 ? (
                chips.slice(0, 3).map((chip) => (
                  <NoteChip
                    key={chip}
                    label={chip}
                    icon={
                      chip === "Favori"
                        ? "star"
                        : chip === "Inbox"
                          ? "mail-unread"
                        : chip === "Epinglee"
                          ? "sparkles"
                          : chip === "Libre"
                            ? "document-text"
                            : chip === "Journal"
                              ? "today"
                              : chip === "Securisee"
                            ? "lock-closed"
                            : chip === "Archivee"
                              ? "archive"
                              : chip === "Corbeille"
                                ? "trash"
                                : undefined
                    }
                  />
                ))
              ) : (
                <NoteChip label="Note" />
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
        </View>
      </Pressable>

      {actions.length > 0 ? (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          {actions.map((action) => {
            const isDanger = action.variant === "danger";

            return (
              <Pressable
                key={action.label}
                onPress={action.onPress}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 40,
                  borderRadius: 15,
                  backgroundColor: isDanger ? "#FFE6E6" : palette.surfaceMuted,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name={action.icon} size={15} color={isDanger ? "#FF3434" : palette.text} />
                <Text style={[theme.typography.label, { color: isDanger ? "#FF3434" : palette.text, fontWeight: "900" }]} numberOfLines={1}>
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

export default function NotesScreen() {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const insets = useSafeAreaInsets();
  const folders = useFoldersStore((state) => state.folders);
  const notes = useNotesStore((state) => state.notes);
  const settings = useSettingsStore((state) => state.settings);
  const sortOrder = settings.sortOrder;
  const updateSortOrder = useSettingsStore((state) => state.updateSortOrder);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const selectedFolderId = useUIStore((state) => state.selectedFolderId);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const setSelectedFolder = useUIStore((state) => state.setSelectedFolder);
  const restoreNote = useNotesStore((state) => state.restoreNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const purgeNote = useNotesStore((state) => state.purgeNote);
  const moveNote = useNotesStore((state) => state.moveNote);
  const archiveNote = useNotesStore((state) => state.archiveNote);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const togglePinned = useNotesStore((state) => state.togglePinned);
  const emptyTrash = useNotesStore((state) => state.emptyTrash);
  const [showFilters, setShowFilters] = useState(false);
  const [showEmptyTrashModal, setShowEmptyTrashModal] = useState(false);
  const [showArchiveBulkModal, setShowArchiveBulkModal] = useState(false);
  const [noteActionModal, setNoteActionModal] = useState<NoteActionModalState>(null);
  const [quickNote, setQuickNote] = useState<Note | null>(null);
  const [quickNoteMode, setQuickNoteMode] = useState<QuickNoteModalMode>("actions");
  const [activeTab, setActiveTab] = useState<NotesTab>("all");
  const [activeTimeline, setActiveTimeline] = useState<NotesTimeline>("day");
  const [activeSmartCollection, setActiveSmartCollection] = useState<SmartCollectionKey>("none");
  const foldersById = useMemo(() => new Map(folders.map((folder) => [folder.id, folder])), [folders]);
  const filteredNotes = useMemo(() => {
    const visibleNotes = notes.filter((note) => {
      const matchesCollection =
        activeSmartCollection === "locked"
          ? isNoteLocked(note, note.folderId ? foldersById.get(note.folderId) : undefined, settings)
          : matchesSmartCollection(note, activeSmartCollection);

      if (selectedFolderId && note.folderId !== selectedFolderId) {
        return false;
      }

      if (activeTab === "all") {
        return !note.isArchived && !note.isDeleted && matchesCollection;
      }

      if (activeTab === "inbox") {
        return Boolean(note.isInbox && !note.isArchived && !note.isDeleted && matchesCollection);
      }

      if (activeTab === "favorites" && !note.isFavorite) {
        return false;
      }

      if (activeTab === "favorites") {
        return !note.isArchived && !note.isDeleted && matchesCollection;
      }

      if (activeTab === "archived") {
        return note.isArchived && !note.isDeleted;
      }

      if (activeTab === "deleted") {
        return note.isDeleted;
      }

      return true;
    });

    return sortNotes(searchNotesService(visibleNotes, searchQuery), sortOrder).sort((a, b) => {
      if (a.isPinned === b.isPinned) {
        return 0;
      }

      return a.isPinned ? -1 : 1;
    });
  }, [activeSmartCollection, activeTab, foldersById, notes, searchQuery, selectedFolderId, settings, sortOrder]);
  const groupedNotes = useMemo(() => {
    const groupsByKey = new Map<string, NotesGroup>();

    filteredNotes.forEach((note) => {
      const key = getTimelineGroupKey(note.updatedAt, activeTimeline);
      const existingGroup = groupsByKey.get(key);

      if (existingGroup) {
        existingGroup.data.push(note);
        return;
      }

      groupsByKey.set(key, {
        key,
        label: getTimelineGroupLabel(note.updatedAt, activeTimeline),
        data: [note],
        sortTime: new Date(key).getTime()
      });
    });

    return [...groupsByKey.values()].sort((a, b) =>
      sortOrder === "updatedAt-asc" ? a.sortTime - b.sortTime : b.sortTime - a.sortTime
    );
  }, [activeTimeline, filteredNotes, sortOrder]);
  const floatingButtonBottom = insets.bottom + 90;
  const archivedNotes = useMemo(() => notes.filter((note) => note.isArchived && !note.isDeleted), [notes]);
  const archivedNotesCount = archivedNotes.length;
  const deletedNotesCount = notes.filter((note) => note.isDeleted).length;

  const selectSortOrder = async (nextSortOrder: SortOrder) => {
    await updateSortOrder(nextSortOrder);
    setShowFilters(false);
  };

  const openQuickNoteMenu = (note: Note) => {
    void hapticImpact();
    setQuickNote(note);
    setQuickNoteMode("actions");
  };

  const closeQuickNoteMenu = () => {
    setQuickNote(null);
    setQuickNoteMode("actions");
  };

  const quickMoveDestinations = [
    { id: null as string | null, name: "Personnel", icon: "folder-open-outline" as keyof typeof Ionicons.glyphMap, color: "#4F6EF7", background: "#E4ECFF" },
    ...folders.map((folder) => {
      const folderIcon = getFolderIcon(folder);

      return {
        id: folder.id,
        name: folder.name,
        icon: folderIcon.icon,
        color: folderIcon.color,
        background: folderIcon.backgroundColor
      };
    })
  ].filter(
    (destination) =>
      destination.id !== quickNote?.folderId || Boolean(quickNote?.isInbox && destination.id === null)
  );

  const runQuickAction = async (action: "favorite" | "pin" | "archive" | "delete") => {
    if (!quickNote) {
      return;
    }

    if (action === "favorite") {
      void hapticSelection();
      await toggleFavorite(quickNote.id);
    }

    if (action === "pin") {
      void hapticSelection();
      await togglePinned(quickNote.id);
    }

    if (action === "archive") {
      await archiveNote(quickNote.id);
    }

    if (action === "delete") {
      await deleteNote(quickNote.id);
    }

    closeQuickNoteMenu();
    void hapticSuccess();
  };

  const runQuickMove = async (folderId: string | null) => {
    if (!quickNote) {
      return;
    }

    await moveNote(quickNote.id, folderId);
    closeQuickNoteMenu();
    void hapticSuccess();
  };

  const tabs: { key: NotesTab; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; background: string }[] = [
    { key: "all", label: "Toutes", icon: "albums-outline", color: "#4F6EF7", background: "#E4ECFF" },
    { key: "inbox", label: "Inbox", icon: "mail-unread-outline", color: "#0F766E", background: "#D8FAF1" },
    { key: "favorites", label: "Favoris", icon: "star", color: "#F59E0B", background: "#FFF1DC" },
    { key: "archived", label: "Archives", icon: "archive", color: "#0F1B3A", background: "#E9ECF3" },
    { key: "deleted", label: "Corbeille", icon: "trash-outline", color: "#FF3434", background: "#FFE6E6" }
  ];
  const activeTabMeta = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const activeTabDescription =
    activeTab === "inbox"
      ? "Tes captures rapides, pretes a etre classees."
      : activeTab === "favorites"
      ? "Tes notes favorites, separees des archives."
      : activeTab === "archived"
        ? "Notes rangees hors de la liste principale."
        : activeTab === "deleted"
          ? "Notes supprimees avant suppression definitive."
          : "Toutes tes notes actives, hors archives et corbeille.";
  const noteActionMeta = noteActionModal
    ? {
        title:
          noteActionModal.type === "restore-archive" || noteActionModal.type === "restore-trash"
            ? "Restaurer la note"
            : noteActionModal.type === "trash-archive"
              ? "Envoyer a la corbeille"
              : "Supprimer definitivement",
        description:
          noteActionModal.type === "restore-archive" || noteActionModal.type === "restore-trash"
            ? `La note "${noteActionModal.title}" retournera dans tes notes actives.`
            : noteActionModal.type === "trash-archive"
              ? `La note "${noteActionModal.title}" ira dans la corbeille.`
              : `La note "${noteActionModal.title}" sera supprimee pour toujours.`,
        icon:
          noteActionModal.type === "restore-archive" || noteActionModal.type === "restore-trash"
            ? ("refresh" as keyof typeof Ionicons.glyphMap)
            : ("trash" as keyof typeof Ionicons.glyphMap),
        color:
          noteActionModal.type === "restore-archive" || noteActionModal.type === "restore-trash"
            ? "#18A058"
            : "#FF3434",
        background:
          noteActionModal.type === "restore-archive" || noteActionModal.type === "restore-trash"
            ? "#D8FAF1"
            : "#FFE6E6",
        confirmLabel:
          noteActionModal.type === "restore-archive" || noteActionModal.type === "restore-trash"
            ? "Restaurer"
            : noteActionModal.type === "trash-archive"
              ? "Envoyer a la corbeille"
              : "Supprimer definitivement"
      }
    : null;
  const runNoteAction = async () => {
    if (!noteActionModal) {
      return;
    }

    if (noteActionModal.type === "restore-archive" || noteActionModal.type === "restore-trash") {
      await restoreNote(noteActionModal.noteId);
    }

    if (noteActionModal.type === "trash-archive") {
      await deleteNote(noteActionModal.noteId);
    }

    if (noteActionModal.type === "purge-trash") {
      await purgeNote(noteActionModal.noteId);
    }

    setNoteActionModal(null);
  };
  const getNoteListActions = (note: Note): NoteListAction[] => {
    if (activeTab === "archived") {
      return [
        {
          label: "Desarchiver",
          icon: "refresh",
          onPress: () => setNoteActionModal({ type: "restore-archive", noteId: note.id, title: note.title || "Sans titre" })
        },
        {
          label: "Corbeille",
          icon: "trash-outline",
          variant: "danger",
          onPress: () => setNoteActionModal({ type: "trash-archive", noteId: note.id, title: note.title || "Sans titre" })
        }
      ];
    }

    if (activeTab === "deleted") {
      return [
        {
          label: "Restaurer",
          icon: "refresh",
          onPress: () => setNoteActionModal({ type: "restore-trash", noteId: note.id, title: note.title || "Sans titre" })
        },
        {
          label: "Supprimer",
          icon: "trash",
          variant: "danger",
          onPress: () => setNoteActionModal({ type: "purge-trash", noteId: note.id, title: note.title || "Sans titre" })
        }
      ];
    }

    return [];
  };
  const openQuickConfirm = (nextAction: NonNullable<NoteActionModalState>) => {
    setNoteActionModal(nextAction);
    closeQuickNoteMenu();
  };
  const quickNoteActions = quickNote
    ? activeTab === "archived"
      ? [
          {
            label: "Desarchiver",
            icon: "refresh" as keyof typeof Ionicons.glyphMap,
            color: "#18A058",
            background: "#D8FAF1",
            onPress: () => openQuickConfirm({ type: "restore-archive", noteId: quickNote.id, title: quickNote.title || "Sans titre" })
          },
          {
            label: "Corbeille",
            icon: "trash-outline" as keyof typeof Ionicons.glyphMap,
            color: "#FF3434",
            background: "#FFE6E6",
            onPress: () => openQuickConfirm({ type: "trash-archive", noteId: quickNote.id, title: quickNote.title || "Sans titre" })
          }
        ]
      : activeTab === "deleted"
        ? [
            {
              label: "Restaurer",
              icon: "refresh" as keyof typeof Ionicons.glyphMap,
              color: "#18A058",
              background: "#D8FAF1",
              onPress: () => openQuickConfirm({ type: "restore-trash", noteId: quickNote.id, title: quickNote.title || "Sans titre" })
            },
            {
              label: "Supprimer definitivement",
              icon: "trash" as keyof typeof Ionicons.glyphMap,
              color: "#FF3434",
              background: "#FFE6E6",
              onPress: () => openQuickConfirm({ type: "purge-trash", noteId: quickNote.id, title: quickNote.title || "Sans titre" })
            }
          ]
        : [
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
              label: "Archiver",
              icon: "archive" as keyof typeof Ionicons.glyphMap,
              color: navy,
              background: "#E9ECF3",
              onPress: () => void runQuickAction("archive")
            },
            {
              label: "Corbeille",
              icon: "trash-outline" as keyof typeof Ionicons.glyphMap,
              color: "#FF3434",
              background: "#FFE6E6",
              onPress: () => void runQuickAction("delete")
            }
          ]
    : [];
  const timelineModes: {
    key: NotesTimeline;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    background: string;
  }[] = [
    { key: "day", label: "Jour", icon: "today-outline", color: "#4F6EF7", background: "#E4ECFF" },
    { key: "week", label: "Semaine", icon: "calendar-outline", color: "#18A058", background: "#D8FAF1" },
    { key: "month", label: "Mois", icon: "calendar-number-outline", color: "#8B5CF6", background: "#EFE6FF" }
  ];
  const sortOptions: {
    label: string;
    value: SortOrder;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    background: string;
  }[] = [
    { label: "Plus recentes", value: "updatedAt-desc", icon: "arrow-down", color: "#4F6EF7", background: "#E4ECFF" },
    { label: "Plus anciennes", value: "updatedAt-asc", icon: "arrow-up", color: "#18A058", background: "#D8FAF1" },
    { label: "Titre A-Z", value: "title-asc", icon: "text", color: "#F97316", background: "#FFF1DC" }
  ];
  const smartCollections: {
    key: SmartCollectionKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    background: string;
  }[] = [
    { key: "none", label: "Aucune", icon: "apps-outline", color: "#4F6EF7", background: "#E4ECFF" },
    { key: "week", label: "Cette semaine", icon: "calendar-outline", color: "#18A058", background: "#D8FAF1" },
    { key: "unfiled", label: "Sans dossier", icon: "folder-open-outline", color: "#F97316", background: "#FFF1DC" },
    { key: "locked", label: "Securisees", icon: "lock-closed-outline", color: "#4F6EF7", background: "#E4ECFF" },
    { key: "stale", label: "A reprendre", icon: "time-outline", color: "#7C4DFF", background: "#EFE6FF" },
    { key: "linked", label: "Liees", icon: "link-outline", color: "#0F766E", background: "#D8FAF1" },
    { key: "tagged", label: "Avec tags", icon: "pricetag-outline", color: "#E11D48", background: "#FFF0F7" }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBackground />
      <SectionList
        sections={groupedNotes}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        stickySectionHeadersEnabled={false}
        windowSize={11}
        contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: floatingButtonBottom + 82 }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: groupedNotes.length > 0 ? 10 : 0 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, marginLeft: 4 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: palette.text, letterSpacing: 5, textTransform: "uppercase", fontWeight: "900" }
                ]}
              >
                Bibliotheque
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 2, flexWrap: "wrap" }}>
                <Text style={{ color: palette.text, fontSize: 36, lineHeight: 40, fontWeight: "900" }}>
                  Notes
                </Text>
                <View
                  style={{
                    borderRadius: 14,
                    backgroundColor: activeTabMeta.background,
                    paddingHorizontal: 10,
                    paddingVertical: 7,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <Ionicons name={activeTabMeta.icon} size={13} color={activeTabMeta.color} />
                  <Text style={[theme.typography.caption, { color: activeTabMeta.color, fontWeight: "900" }]}>
                    {activeTabMeta.label}
                  </Text>
                </View>
              </View>
              <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 4 }]} numberOfLines={1}>
                {activeTabDescription}
              </Text>
            </View>

            <AppHeaderLogo />
          </View>

          <View
            style={{
              minHeight: 54,
              borderRadius: 18,
              backgroundColor: palette.surfaceMuted,
              padding: 5,
              flexDirection: "row",
              gap: 5
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <Pressable
                  key={tab.key}
                  accessibilityLabel={tab.label}
                  onPress={() => {
                    setActiveTab(tab.key);
                    if (tab.key === "inbox") {
                      setSelectedFolder(null);
                    }
                  }}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderRadius: 15,
                    backgroundColor: isActive ? tab.background : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.84 : 1
                  })}
                >
                  <Ionicons name={tab.icon} size={21} color={isActive ? tab.color : palette.textMuted} />
                </Pressable>
              );
            })}
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
              placeholder="Rechercher dans vos notes..."
              placeholderTextColor={palette.placeholder}
              style={[theme.typography.body, { flex: 1, color: palette.text, paddingVertical: 8 }]}
            />
            {searchQuery.trim() ? (
              <Pressable
                accessibilityLabel="Effacer la recherche"
                onPress={() => setSearchQuery("")}
                hitSlop={8}
                style={{ width: 30, height: 30, borderRadius: 12, backgroundColor: "#FFE6E6", alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name="close" size={16} color="#FF3434" />
              </Pressable>
            ) : null}
            <Pressable
              accessibilityLabel="Ouvrir les filtres"
              onPress={() => setShowFilters(true)}
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
              <Ionicons name="filter-outline" size={18} color={palette.text} />
            </Pressable>
          </View>

          <Text style={[theme.typography.label, { color: palette.textMuted, fontWeight: "900" }]}>
            {filteredNotes.length} note{filteredNotes.length > 1 ? "s" : ""} trouvee{filteredNotes.length > 1 ? "s" : ""}
          </Text>

          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Aucune note"
            description={
              activeTab === "inbox"
                ? "Utilise la capture rapide ou partage un texte vers BlockyNotes."
                : activeTab === "favorites"
                ? "Ajoute des favoris pour les retrouver ici."
                : activeTab === "archived"
                  ? "Archive une note depuis l'editeur pour la retrouver ici."
                  : activeTab === "deleted"
                    ? "Les notes supprimees apparaitront ici avant suppression definitive."
                    : "Cree une note pour commencer."
            }
          />
        }
        renderSectionHeader={({ section }) => {
          const activeTimelineMode = timelineModes.find((mode) => mode.key === activeTimeline) ?? timelineModes[0];

          return (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4, marginTop: 2, marginBottom: 9 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 11,
                  backgroundColor: activeTimelineMode.background,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name={activeTimelineMode.icon} size={14} color={activeTimelineMode.color} />
              </View>
              <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900", flex: 1 }]}>
                {section.label}
              </Text>
              <Text style={[theme.typography.caption, { color: palette.textMuted, fontWeight: "900" }]}>
                {section.data.length}
              </Text>
            </View>
          );
        }}
        renderItem={({ item }) => {
          const folder = item.folderId ? foldersById.get(item.folderId) : undefined;

          return (
            <View style={{ marginBottom: 10 }}>
              <NotesListItem
                actions={getNoteListActions(item)}
                folderName={folder?.name ?? (item.folderId === null ? "Personnel" : null)}
                locked={isNoteLocked(item, folder, settings)}
                note={item}
                onLongPress={() => openQuickNoteMenu(item)}
              />
            </View>
          );
        }}
      />

      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <Pressable
          onPress={() => setShowFilters(false)}
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
              paddingBottom: 0,
              maxHeight: "94%"
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
            <ScrollView
              showsVerticalScrollIndicator
              indicatorStyle={palette.isDark ? "white" : "black"}
              contentContainerStyle={{ gap: theme.spacing.lg, paddingBottom: insets.bottom + 26 }}
              keyboardShouldPersistTaps="handled"
            >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 17,
                    backgroundColor: "#E4ECFF",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Ionicons name="options" size={21} color="#4F6EF7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Filtres</Text>
                  <Text style={[theme.typography.body, { color: palette.textMuted }]}>Vue, dossier et tri des notes.</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Pressable
                  onPress={() => {
                    setSelectedFolder(null);
                    setActiveTimeline("day");
                    setActiveSmartCollection("none");
                  }}
                  hitSlop={8}
                  style={{
                    height: 36,
                    borderRadius: 14,
                    paddingHorizontal: 11,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: palette.surfaceMuted
                  }}
                >
                  <Ionicons name="refresh" size={14} color="#4F6EF7" />
                  <Text style={[theme.typography.caption, { color: "#4F6EF7", fontWeight: "900" }]}>Reset</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowFilters(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 14,
                    backgroundColor: palette.subtle,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Ionicons name="close" size={18} color={palette.text} />
                </Pressable>
              </View>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 26, height: 26, borderRadius: 10, backgroundColor: "#EFE6FF", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="sparkles" size={14} color="#7C4DFF" />
                </View>
                <Text style={[theme.typography.caption, { color: palette.textMuted, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: "900" }]}>Collections intelligentes</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 9, paddingRight: 8 }}>
                {smartCollections.map((collection) => {
                  const isActive = activeSmartCollection === collection.key;

                  return (
                    <Pressable
                      key={collection.key}
                      accessibilityLabel={`Collection ${collection.label}`}
                      onPress={() => setActiveSmartCollection(collection.key)}
                      style={({ pressed }) => ({
                        minHeight: 48,
                        borderRadius: 18,
                        backgroundColor: isActive ? navy : palette.surfaceMuted,
                        paddingHorizontal: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        opacity: pressed ? 0.84 : 1
                      })}
                    >
                      <View style={{ width: 30, height: 30, borderRadius: 12, backgroundColor: isActive ? "rgba(255,255,255,0.14)" : collection.background, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name={collection.icon} size={14} color={isActive ? "#FFFFFF" : collection.color} />
                      </View>
                      <Text style={[theme.typography.label, { color: isActive ? "#FFFFFF" : palette.text, fontWeight: "900" }]}>{collection.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 10,
                    backgroundColor: "#E4ECFF",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Ionicons name="calendar-outline" size={14} color="#4F6EF7" />
                </View>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: palette.textMuted, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: "900" }
                  ]}
                >
                  Vue
                </Text>
              </View>
              <View
                style={{
                  minHeight: 48,
                  borderRadius: 18,
                  backgroundColor: palette.surfaceMuted,
                  padding: 5,
                  flexDirection: "row",
                  gap: 5
                }}
              >
                {timelineModes.map((mode) => {
                  const isActive = activeTimeline === mode.key;

                  return (
                    <Pressable
                      key={mode.key}
                      onPress={() => setActiveTimeline(mode.key)}
                      style={({ pressed }) => ({
                        flex: 1,
                        minHeight: 38,
                        borderRadius: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        backgroundColor: isActive ? navy : "transparent",
                        opacity: pressed ? 0.84 : 1
                      })}
                    >
                      <View
                        style={{
                          width: 25,
                          height: 25,
                          borderRadius: 10,
                          backgroundColor: isActive ? "rgba(255,255,255,0.14)" : mode.background,
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name={mode.icon} size={13} color={isActive ? "#FFFFFF" : mode.color} />
                      </View>
                      <Text
                        style={[
                          theme.typography.label,
                          {
                            color: isActive ? "#FFFFFF" : palette.text,
                            fontWeight: "900"
                          }
                        ]}
                        numberOfLines={1}
                      >
                        {mode.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 10,
                    backgroundColor: "#D8FAF1",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Ionicons name="folder-open" size={14} color="#18A058" />
                </View>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: palette.textMuted, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: "900" }
                  ]}
                >
                  Dossier
                </Text>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                <Pressable
                  onPress={() => {
                    setSelectedFolder(null);
                  }}
                  style={{
                    minHeight: 48,
                    borderRadius: 18,
                    backgroundColor: selectedFolderId === null ? navy : palette.surfaceMuted,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 9,
                    paddingHorizontal: 12,
                    borderWidth: selectedFolderId === null ? 1 : 0,
                    borderColor: "rgba(255,255,255,0.16)"
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 12,
                      backgroundColor: selectedFolderId === null ? "rgba(255,255,255,0.14)" : "#E4ECFF",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="albums-outline" size={15} color={selectedFolderId === null ? "#FFFFFF" : "#4F6EF7"} />
                  </View>
                  <Text style={[theme.typography.label, { color: selectedFolderId === null ? "#FFFFFF" : palette.text, fontWeight: "900" }]}>
                    Tous
                  </Text>
                  {selectedFolderId === null ? <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" /> : null}
                </Pressable>

                {folders.map((folder) => {
                  const folderIcon = getFolderIcon(folder);
                  const isActive = selectedFolderId === folder.id;

                  return (
                    <Pressable
                      key={folder.id}
                      onPress={() => {
                        setSelectedFolder(folder.id);
                      }}
                      style={{
                        minHeight: 48,
                        borderRadius: 18,
                        backgroundColor: isActive ? navy : palette.surfaceMuted,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 9,
                        paddingHorizontal: 12,
                        borderWidth: isActive ? 1 : 0,
                        borderColor: isActive ? "rgba(255,255,255,0.16)" : folderIcon.color
                      }}
                    >
                      <View
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 12,
                          backgroundColor: isActive ? "rgba(255,255,255,0.14)" : folderIcon.backgroundColor,
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name={folderIcon.icon} size={15} color={isActive ? "#FFFFFF" : folderIcon.color} />
                      </View>
                      <Text style={[theme.typography.label, { color: isActive ? "#FFFFFF" : palette.text, fontWeight: "900" }]}>
                        {folder.name}
                      </Text>
                      {isActive ? <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 10,
                    backgroundColor: "#FFF1DC",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Ionicons name="swap-vertical" size={14} color="#F97316" />
                </View>
                <Text
                  style={[
                    theme.typography.caption,
                    { color: palette.textMuted, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: "900" }
                  ]}
                >
                  Tri
                </Text>
              </View>
              {sortOptions.map((option) => {
                const isActive = sortOrder === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => void selectSortOrder(option.value)}
                    style={{
                      minHeight: 54,
                      borderRadius: 18,
                      backgroundColor: isActive ? navy : palette.surfaceMuted,
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexDirection: "row",
                      paddingHorizontal: 12,
                      borderWidth: isActive ? 1 : 0,
                      borderColor: isActive ? "rgba(255,255,255,0.16)" : option.color
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                      <View
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 13,
                          backgroundColor: isActive ? "rgba(255,255,255,0.14)" : option.background,
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name={option.icon} size={16} color={isActive ? "#FFFFFF" : option.color} />
                      </View>
                      <Text style={[theme.typography.label, { color: isActive ? "#FFFFFF" : palette.text, fontWeight: "900" }]}>
                        {option.label}
                      </Text>
                    </View>
                    {isActive ? <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" /> : null}
                  </Pressable>
                );
              })}
            </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={noteActionModal !== null} transparent animationType="slide" onRequestClose={() => setNoteActionModal(null)}>
        <Pressable
          onPress={() => setNoteActionModal(null)}
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
              maxHeight: "86%"
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 48,
                height: 5,
                borderRadius: 4,
                backgroundColor: palette.isDark ? "rgba(255,255,255,0.26)" : "#C9CBD5"
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 18,
                  backgroundColor: noteActionMeta?.background ?? palette.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name={noteActionMeta?.icon ?? "alert-circle-outline"} size={23} color={noteActionMeta?.color ?? palette.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>{noteActionMeta?.title}</Text>
                <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 2 }]}>{noteActionMeta?.description}</Text>
              </View>
            </View>
            <View style={{ gap: 10 }}>
              <Pressable
                onPress={() => void runNoteAction()}
                style={({ pressed }) => ({
                  minHeight: 54,
                  borderRadius: 18,
                  backgroundColor: noteActionMeta?.background ?? palette.surfaceMuted,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name={noteActionMeta?.icon ?? "checkmark"} size={18} color={noteActionMeta?.color ?? palette.text} />
                <Text style={[theme.typography.label, { color: noteActionMeta?.color ?? palette.text, fontWeight: "900" }]}>
                  {noteActionMeta?.confirmLabel}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setNoteActionModal(null)}
                style={({ pressed }) => ({
                  minHeight: 52,
                  borderRadius: 18,
                  backgroundColor: palette.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Annuler</Text>
              </Pressable>
            </View>
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
            <View
              style={{
                alignSelf: "center",
                width: 48,
                height: 5,
                borderRadius: 4,
                backgroundColor: palette.isDark ? "rgba(255,255,255,0.26)" : "#C9CBD5",
                marginBottom: 20
              }}
            />
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
                                  : action.label.includes("favori") || action.label.includes("Favoris")
                                    ? "Retrouver cette note plus vite"
                                    : action.label.includes("epingle") || action.label === "Epingler"
                                      ? "Garder en haut de l'accueil"
                                      : action.label.includes("Corbeille")
                                        ? "Envoyer dans la corbeille"
                                        : action.label.includes("Supprimer")
                                          ? "Action definitive"
                                          : action.label.includes("Desarchiver") || action.label.includes("Restaurer")
                                            ? "Retourner dans tes notes actives"
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
                      backgroundColor: navy,
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

      <Modal visible={showEmptyTrashModal} transparent animationType="slide" onRequestClose={() => setShowEmptyTrashModal(false)}>
        <Pressable
          onPress={() => setShowEmptyTrashModal(false)}
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
                backgroundColor: palette.isDark ? "rgba(255,255,255,0.26)" : "#C9CBD5"
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 18,
                  backgroundColor: "#FFE6E6",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="trash" size={23} color="#FF3434" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Vider la corbeille</Text>
                <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 2 }]}>
                  Supprimer definitivement {deletedNotesCount} note{deletedNotesCount > 1 ? "s" : ""}.
                </Text>
              </View>
            </View>
            <View style={{ gap: 10 }}>
              <Pressable
                onPress={async () => {
                  await emptyTrash();
                  setShowEmptyTrashModal(false);
                }}
                style={({ pressed }) => ({
                  minHeight: 54,
                  borderRadius: 18,
                  backgroundColor: "#FFE6E6",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="trash" size={18} color="#FF3434" />
                <Text style={[theme.typography.label, { color: "#FF3434", fontWeight: "900" }]}>Supprimer definitivement</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowEmptyTrashModal(false)}
                style={({ pressed }) => ({
                  minHeight: 52,
                  borderRadius: 18,
                  backgroundColor: palette.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Annuler</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showArchiveBulkModal} transparent animationType="slide" onRequestClose={() => setShowArchiveBulkModal(false)}>
        <Pressable
          onPress={() => setShowArchiveBulkModal(false)}
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
                backgroundColor: palette.isDark ? "rgba(255,255,255,0.26)" : "#C9CBD5"
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 18,
                  backgroundColor: "#E9ECF3",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="archive" size={23} color="#0F1B3A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontSize: 26, lineHeight: 32, fontWeight: "900" }}>Actions archives</Text>
                <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 2 }]}>
                  Gerer {archivedNotesCount} note{archivedNotesCount > 1 ? "s" : ""} archivee{archivedNotesCount > 1 ? "s" : ""}.
                </Text>
              </View>
            </View>
            <View style={{ gap: 10 }}>
              <Pressable
                onPress={async () => {
                  await Promise.all(archivedNotes.map((note) => restoreNote(note.id)));
                  setShowArchiveBulkModal(false);
                }}
                style={({ pressed }) => ({
                  minHeight: 54,
                  borderRadius: 18,
                  backgroundColor: "#D8FAF1",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="refresh" size={18} color="#18A058" />
                <Text style={[theme.typography.label, { color: "#18A058", fontWeight: "900" }]}>Tout desarchiver</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  await Promise.all(archivedNotes.map((note) => deleteNote(note.id)));
                  setShowArchiveBulkModal(false);
                }}
                style={({ pressed }) => ({
                  minHeight: 54,
                  borderRadius: 18,
                  backgroundColor: "#FFE6E6",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3434" />
                <Text style={[theme.typography.label, { color: "#FF3434", fontWeight: "900" }]}>Tout mettre a la corbeille</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowArchiveBulkModal(false)}
                style={({ pressed }) => ({
                  minHeight: 52,
                  borderRadius: 18,
                  backgroundColor: palette.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Annuler</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {activeTab === "deleted" ? (
        <Pressable
          onPress={() => {
            if (deletedNotesCount > 0) {
              setShowEmptyTrashModal(true);
            }
          }}
          style={({ pressed }) => ({
            position: "absolute",
            right: 24,
            bottom: floatingButtonBottom,
            width: 58,
            height: 58,
            borderRadius: 21,
            backgroundColor: deletedNotesCount > 0 ? "#FFE6E6" : palette.surfaceMuted,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.9 : 1,
            shadowColor: "#FF3434",
            shadowOpacity: deletedNotesCount > 0 ? 0.18 : 0,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: deletedNotesCount > 0 ? 12 : 0
          })}
        >
          <Ionicons name="trash" size={25} color={deletedNotesCount > 0 ? "#FF3434" : palette.textMuted} />
        </Pressable>
      ) : activeTab === "archived" ? (
        <Pressable
          onPress={() => {
            if (archivedNotesCount > 0) {
              setShowArchiveBulkModal(true);
            }
          }}
          style={({ pressed }) => ({
            position: "absolute",
            right: 24,
            bottom: floatingButtonBottom,
            width: 58,
            height: 58,
            borderRadius: 21,
            backgroundColor: archivedNotesCount > 0 ? "#E9ECF3" : palette.surfaceMuted,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.9 : 1,
            shadowColor: navy,
            shadowOpacity: archivedNotesCount > 0 ? 0.16 : 0,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: archivedNotesCount > 0 ? 12 : 0
          })}
        >
          <Ionicons name="archive" size={25} color={archivedNotesCount > 0 ? navy : palette.textMuted} />
        </Pressable>
      ) : (
        <Pressable
          accessibilityLabel={activeTab === "inbox" ? "Capture rapide" : "Creer une note"}
          onPress={() => router.push(activeTab === "inbox" ? "/notes/capture" : "/notes/new")}
          style={({ pressed }) => ({
            position: "absolute",
            right: 24,
            bottom: floatingButtonBottom,
            width: 58,
            height: 58,
            borderRadius: 21,
            backgroundColor: navy,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.9 : 1,
            shadowColor: navy,
            shadowOpacity: 0.26,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 12
          })}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}
