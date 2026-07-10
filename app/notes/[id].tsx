/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        [id].tsx
 * @description Implements the note editor, autosave, history, search, links, and daily-entry workflows.
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
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SaveStatusIndicator } from "@/components/ui/SaveStatusIndicator";
import { addDays, fromDateKey, toDateKey } from "@/lib/date";
import {
  buildNoteContentFromEntries,
  normalizeDailyEntries,
  upsertDailyEntry
} from "@/services/notes/dailyEntries";
import { getNoteIcon, noteIconOptions } from "@/services/notes/noteIcon";
import { listNoteRevisions, queueNoteRevision } from "@/services/notes/noteHistory";
import { getNoteBacklinks, resolveNoteLinks } from "@/services/notes/noteInsights";
import { useTheme } from "@/hooks/useTheme";
import { LockCodeModal } from "@/components/security/LockCodeModal";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { hashLockCode, verifyLockCode } from "@/lib/security";
import { getAppPalette } from "@/theme/appPalette";
import type { NoteIconKey, NoteMode, NoteRevision } from "@/types/models";
import { getNoteLockHash, isNoteLocked } from "@/services/security/locks";
import { hapticImpact, hapticSelection, hapticSuccess, hapticWarning } from "@/lib/haptics";

type ViewMode = "day" | "all";
type FocusedEditorTarget = "free" | "day" | "historical";
type FocusedEditor = {
  content: string;
  dateKey: string | null;
  key: string;
  target: FocusedEditorTarget;
  title: string;
  selection?: { start: number; end: number };
};
type NoteSearchResult = FocusedEditor & { id: string; snippet: string };

const DAY_EDITOR_MIN_HEIGHT = 290;
const ALL_ENTRY_MIN_HEIGHT = 96;
const FREE_EDITOR_MIN_HEIGHT = 420;
const EDITOR_SELECTION_COLOR = "#4F6EF7";
const EDITOR_CURSOR_COLOR = "#4F6EF7";
const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const entryDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long"
});
const calendarMonthFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "long",
  year: "numeric"
});

function NoteOptionRow({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  danger,
  expanded,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  danger?: boolean;
  expanded?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
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
        <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: palette.divider, paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  theme.typography.h3,
                  { color: danger ? "#FF3434" : palette.text, fontSize: 18, lineHeight: 23, fontWeight: "900" }
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 1 }]} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
            <Ionicons name={expanded ? "chevron-up" : "chevron-forward"} size={16} color="#A4A7B0" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function EditorSectionHeader({
  accentColor,
  onExpand,
  title
}: {
  accentColor: string;
  onExpand: () => void;
  title: string;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Text
        style={[
          theme.typography.caption,
          { color: accentColor, letterSpacing: 2, textTransform: "uppercase", fontWeight: "900", flex: 1 }
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Pressable
        accessibilityLabel="Ouvrir l'editeur en plein ecran"
        accessibilityHint="Affiche un editeur dedie plus confortable pour la selection de texte"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => {
          void hapticImpact();
          onExpand();
        }}
        style={({ pressed }) => ({
          width: 34,
          height: 34,
          borderRadius: 13,
          backgroundColor: palette.surfaceMuted,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.78 : 1
        })}
      >
        <Ionicons name="expand-outline" size={16} color={palette.text} />
      </Pressable>
    </View>
  );
}

function SearchSnippet({ query, text }: { query: string; text: string }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const index = text.toLocaleLowerCase("fr-FR").indexOf(query.trim().toLocaleLowerCase("fr-FR"));

  if (index < 0 || !query.trim()) {
    return <Text style={[theme.typography.body, { color: palette.textMuted }]} numberOfLines={2}>{text}</Text>;
  }

  return (
    <Text style={[theme.typography.body, { color: palette.textMuted }]} numberOfLines={2}>
      {text.slice(0, index)}
      <Text style={{ color: "#4F6EF7", fontWeight: "900" }}>{text.slice(index, index + query.trim().length)}</Text>
      {text.slice(index + query.trim().length)}
    </Text>
  );
}

function FocusedEditorModal({
  editor,
  onChange,
  onClose
}: {
  editor: FocusedEditor;
  onChange: (content: string) => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const [content, setContent] = useState(editor.content);
  const [selection, setSelection] = useState(
    editor.selection ?? { start: editor.content.length, end: editor.content.length }
  );
  const latestContentRef = useRef(editor.content);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyGroupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyGroupOpenRef = useRef(false);
  const [past, setPast] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);

  const saveLatestContent = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    onChange(latestContentRef.current);
  };

  const handleChange = (nextContent: string) => {
    if (!historyGroupOpenRef.current) {
      setPast((current) => [...current.slice(-39), latestContentRef.current]);
      setFuture([]);
      historyGroupOpenRef.current = true;
    }

    if (historyGroupTimeoutRef.current) {
      clearTimeout(historyGroupTimeoutRef.current);
    }

    historyGroupTimeoutRef.current = setTimeout(() => {
      historyGroupOpenRef.current = false;
      historyGroupTimeoutRef.current = null;
    }, 600);

    latestContentRef.current = nextContent;
    setContent(nextContent);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      onChange(nextContent);
    }, 450);
  };

  const handleClose = () => {
    saveLatestContent();
    void hapticSuccess();
    onClose();
  };

  const resetHistoryGroup = () => {
    historyGroupOpenRef.current = false;
    if (historyGroupTimeoutRef.current) {
      clearTimeout(historyGroupTimeoutRef.current);
      historyGroupTimeoutRef.current = null;
    }
  };

  const handleUndo = () => {
    const previous = past[past.length - 1];
    if (previous === undefined) {
      return;
    }

    resetHistoryGroup();
    setPast((current) => current.slice(0, -1));
    setFuture((current) => [latestContentRef.current, ...current].slice(0, 40));
    latestContentRef.current = previous;
    setContent(previous);
    onChange(previous);
    void hapticSelection();
  };

  const handleRedo = () => {
    const next = future[0];
    if (next === undefined) {
      return;
    }

    resetHistoryGroup();
    setFuture((current) => current.slice(1));
    setPast((current) => [...current.slice(-39), latestContentRef.current]);
    latestContentRef.current = next;
    setContent(next);
    onChange(next);
    void hapticSelection();
  };

  useEffect(
    () => () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (historyGroupTimeoutRef.current) {
        clearTimeout(historyGroupTimeoutRef.current);
      }
    },
    []
  );

  return (
    <Modal visible animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.surface }}>
        <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 12, gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              accessibilityLabel="Fermer l'editeur plein ecran"
              accessibilityRole="button"
              onPress={handleClose}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: palette.surfaceMuted,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.8 : 1
              })}
            >
              <Ionicons name="contract-outline" size={18} color={palette.text} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={[theme.typography.h3, { color: palette.text, fontWeight: "900" }]} numberOfLines={1}>
                {editor.title}
              </Text>
              <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]} numberOfLines={1}>
                Edition concentree
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Annuler la derniere modification"
              accessibilityRole="button"
              disabled={past.length === 0}
              onPress={handleUndo}
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: 15,
                backgroundColor: palette.surfaceMuted,
                alignItems: "center",
                justifyContent: "center",
                opacity: past.length === 0 ? 0.4 : pressed ? 0.72 : 1
              })}
            >
              <Ionicons name="arrow-undo" size={18} color={palette.text} />
            </Pressable>
            <Pressable
              accessibilityLabel="Retablir la modification"
              accessibilityRole="button"
              disabled={future.length === 0}
              onPress={handleRedo}
              style={({ pressed }) => ({
                width: 42,
                height: 42,
                borderRadius: 15,
                backgroundColor: palette.surfaceMuted,
                alignItems: "center",
                justifyContent: "center",
                opacity: future.length === 0 ? 0.4 : pressed ? 0.72 : 1
              })}
            >
              <Ionicons name="arrow-redo" size={18} color={palette.text} />
            </Pressable>
            <Pressable
              accessibilityLabel="Terminer l'edition"
              accessibilityRole="button"
              onPress={handleClose}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: "#0F1B3A",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.84 : 1
              })}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View
            style={{
              flex: 1,
              borderRadius: 22,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: "#B8C5FF",
              paddingHorizontal: 18,
              paddingVertical: 16
            }}
          >
            <TextInput
              autoFocus
              accessibilityLabel={`Contenu de ${editor.title}`}
              value={content}
              onChangeText={handleChange}
              selection={selection}
              onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
              multiline
              scrollEnabled
              selectionColor={EDITOR_SELECTION_COLOR}
              cursorColor={EDITOR_CURSOR_COLOR}
              placeholder="Ecris quelque chose..."
              placeholderTextColor={palette.placeholder}
              textAlignVertical="top"
              textBreakStrategy="simple"
              style={[
                theme.typography.body,
                {
                  flex: 1,
                  color: palette.text,
                  fontSize: 18,
                  lineHeight: 31,
                  paddingVertical: 0
                }
              ]}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function EditNoteScreen() {
  const { id, returnFolderId } = useLocalSearchParams<{ id: string; returnFolderId?: string }>();
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const folders = useFoldersStore((state) => state.folders);
  const settings = useSettingsStore((state) => state.settings);
  const note = useNotesStore((state) => state.notes.find((entry) => entry.id === id));
  const allNotes = useNotesStore((state) => state.notes);
  const updateNote = useNotesStore((state) => state.updateNote);
  const archiveNote = useNotesStore((state) => state.archiveNote);
  const restoreNote = useNotesStore((state) => state.restoreNote);
  const moveNote = useNotesStore((state) => state.moveNote);
  const toggleFavorite = useNotesStore((state) => state.toggleFavorite);
  const togglePinned = useNotesStore((state) => state.togglePinned);
  const [title, setTitle] = useState(note?.title ?? "");
  const [dayContent, setDayContent] = useState("");
  const [freeContent, setFreeContent] = useState(note?.content ?? "");
  const [folderId, setFolderId] = useState<string | null>(note?.folderId ?? null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty">("saved");
  const [showSavedLabel, setShowSavedLabel] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [showMovePicker, setShowMovePicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [noteUnlocked, setNoteUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [noteLockModalMode, setNoteLockModalMode] = useState<"create" | "unlock-remove" | null>(null);
  const [noteLockError, setNoteLockError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [noteMode, setNoteMode] = useState<NoteMode>(note?.noteMode ?? "day");
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey());
  const [allJumpDateKey, setAllJumpDateKey] = useState(toDateKey());
  const [editorContentHeights, setEditorContentHeights] = useState<Record<string, number>>({});
  const [focusedEditor, setFocusedEditor] = useState<FocusedEditor | null>(null);
  const [historicalEditorRevisions, setHistoricalEditorRevisions] = useState<Record<string, number>>({});
  const [showNoteSearch, setShowNoteSearch] = useState(false);
  const [noteSearchQuery, setNoteSearchQuery] = useState("");
  const [showOutline, setShowOutline] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [noteRevisions, setNoteRevisions] = useState<NoteRevision[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const isFirstSync = useRef(true);
  const screenScrollRef = useRef<ScrollView | null>(null);
  const allCardYRef = useRef(0);
  const allEntryYRef = useRef<Record<string, number>>({});
  const allEntryDraftsRef = useRef<Record<string, string>>({});
  const allEntrySaveTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const allEntrySaveVersionsRef = useRef<Record<string, number>>({});
  const mainSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRevisionRef = useRef(0);
  const hasPendingSaveRef = useRef(false);
  const isLeavingRef = useRef(false);
  const latestDraftRef = useRef({
    dateKey: selectedDateKey,
    content: dayContent,
    freeContent,
    noteMode,
    title,
    folderId
  });
  const noteId = note?.id;
  const todayKey = toDateKey();
  const containingFolder = folders.find((folder) => folder.id === note?.folderId);
  const noteLockHash = note ? getNoteLockHash(note, containingFolder, settings) : null;
  const requiresNoteUnlock = Boolean(note && isNoteLocked(note, containingFolder, settings) && noteLockHash && !noteUnlocked);

  const entries = useMemo(() => (note ? normalizeDailyEntries(note) : []), [note]);
  const liveLinkContent = useMemo(() => {
    if (noteMode === "free") {
      return freeContent;
    }

    return buildNoteContentFromEntries(
      entries.map((entry) => ({
        ...entry,
        content:
          entry.date === selectedDateKey
            ? dayContent
            : allEntryDraftsRef.current[entry.date] ?? entry.content
      }))
    );
  }, [dayContent, entries, freeContent, noteMode, selectedDateKey]);
  const outgoingLinks = useMemo(
    () => resolveNoteLinks(liveLinkContent, allNotes, note?.id),
    [allNotes, liveLinkContent, note?.id]
  );
  const backlinks = useMemo(
    () => (note ? getNoteBacklinks(note, allNotes) : []),
    [allNotes, note]
  );
  const linkCandidates = useMemo(
    () => allNotes.filter((candidate) => candidate.id !== note?.id && !candidate.isDeleted && !candidate.isArchived && candidate.title.trim()).sort((a, b) => a.title.localeCompare(b.title, "fr-FR")),
    [allNotes, note?.id]
  );
  const entryDates = useMemo(() => new Set(entries.map((entry) => entry.date)), [entries]);
  const otherEntries = useMemo(
    () => [...entries].filter((entry) => entry.date !== todayKey).reverse(),
    [entries, todayKey]
  );
  const searchResults = useMemo<NoteSearchResult[]>(() => {
    const query = noteSearchQuery.trim().toLocaleLowerCase("fr-FR");

    if (!query) {
      return [];
    }

    const sources = noteMode === "free"
      ? [{ content: freeContent, dateKey: null as string | null, target: "free" as const, title: "Note libre" }]
      : entries.map((entry) => ({
          content:
            entry.date === selectedDateKey
              ? dayContent
              : allEntryDraftsRef.current[entry.date] ?? entry.content,
          dateKey: entry.date,
          target:
            entry.date === selectedDateKey || entry.date === todayKey
              ? ("day" as const)
              : ("historical" as const),
          title: entryDateFormatter.format(fromDateKey(entry.date))
        }));
    const results: NoteSearchResult[] = [];

    sources.forEach((source) => {
      const normalizedContent = source.content.toLocaleLowerCase("fr-FR");
      let start = normalizedContent.indexOf(query);
      let occurrence = 0;

      while (start >= 0 && results.length < 50) {
        const end = start + query.length;
        const snippetStart = Math.max(0, start - 34);
        const snippetEnd = Math.min(source.content.length, end + 52);
        results.push({
          ...source,
          id: `${source.dateKey ?? "free"}-${occurrence}-${start}`,
          key: `search:${source.dateKey ?? "free"}:${start}`,
          selection: { start, end },
          snippet: `${snippetStart > 0 ? "..." : ""}${source.content.slice(snippetStart, snippetEnd).replace(/\s+/g, " ")}${snippetEnd < source.content.length ? "..." : ""}`
        });
        occurrence += 1;
        start = normalizedContent.indexOf(query, end);
      }
    });

    return results;
  }, [dayContent, entries, freeContent, noteMode, noteSearchQuery, selectedDateKey, todayKey]);
  const selectedDate = useMemo(() => fromDateKey(selectedDateKey), [selectedDateKey]);
  const allJumpDate = useMemo(() => fromDateKey(allJumpDateKey), [allJumpDateKey]);
  const calendarDays = useMemo(() => {
    const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const mondayOffset = (monthStart.getDay() + 6) % 7;
    const gridStart = addDays(monthStart, -mondayOffset);

    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [calendarMonth]);
  const activeFolderLabel = folders.find((folder) => folder.id === folderId)?.name ?? "Perso";
  const selectedDateLabel =
    selectedDateKey === todayKey
      ? "Auj."
      : selectedDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const activeCalendarDateKey = viewMode === "all" ? allJumpDateKey : selectedDateKey;
  const selectedDateTitle =
    selectedDateKey === todayKey ? "Aujourd'hui" : entryDateFormatter.format(selectedDate);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const activeNoteIcon = note
    ? getNoteIcon(note)
    : noteIconOptions.find((option) => option.key === "document") ?? noteIconOptions[0];
  useEffect(() => {
    latestDraftRef.current = {
      dateKey: selectedDateKey,
      content: dayContent,
      freeContent,
      noteMode,
      title,
      folderId
    };
  }, [dayContent, folderId, freeContent, noteMode, selectedDateKey, title]);

  useEffect(() => {
    if (saveState !== "saved") {
      setShowSavedLabel(false);
      return;
    }

    setShowSavedLabel(true);
    const timeout = setTimeout(() => setShowSavedLabel(false), 1500);
    return () => clearTimeout(timeout);
  }, [saveState]);

  useEffect(() => {
    setNoteUnlocked(false);
    setUnlockError(null);
    setEditorContentHeights({});
    setFocusedEditor(null);
    setHistoricalEditorRevisions({});
    allEntryYRef.current = {};
    allEntryDraftsRef.current = {};
    allEntrySaveVersionsRef.current = {};
    hasPendingSaveRef.current = false;
    isLeavingRef.current = false;
  }, [noteId]);

  useEffect(() => {
    if (!noteId) {
      return;
    }

    const latestNote = useNotesStore.getState().notes.find((entry) => entry.id === noteId);

    if (!latestNote) {
      return;
    }

    const dailyEntries = normalizeDailyEntries(latestNote);
    const latestNoteMode = latestNote.noteMode ?? "day";

    setTitle(latestNote.title ?? "");
    setFolderId(latestNote.folderId ?? null);
    setNoteMode(latestNoteMode);
    setSelectedDateKey(todayKey);
    setAllJumpDateKey(todayKey);
    setCalendarMonth(new Date(fromDateKey(todayKey).getFullYear(), fromDateKey(todayKey).getMonth(), 1));
    setDayContent(dailyEntries.find((entry) => entry.date === todayKey)?.content ?? "");
    setFreeContent(latestNoteMode === "free" ? latestNote.content : buildNoteContentFromEntries(dailyEntries));
    setSaveState("saved");
    isFirstSync.current = true;
  }, [noteId, todayKey]);

  const persistNoteChanges = useCallback(
    async (dateKey: string, content: string, nextTitle: string, nextFolderId: string | null) => {
      if (!noteId) {
        return;
      }

      const latestNote = useNotesStore.getState().notes.find((entry) => entry.id === noteId);

      if (!latestNote) {
        return;
      }

      const dailyEntries = upsertDailyEntry(normalizeDailyEntries(latestNote), dateKey, content);
      await updateNote(noteId, {
        title: nextTitle.trim(),
        folderId: nextFolderId,
        isInbox: nextFolderId === null ? latestNote.isInbox : false,
        noteMode: "day",
        dailyEntries,
        content: buildNoteContentFromEntries(dailyEntries)
      });
    },
    [noteId, updateNote]
  );

  const persistFreeNoteChanges = useCallback(
    async (content: string, nextTitle: string, nextFolderId: string | null) => {
      if (!noteId) {
        return;
      }

      const latestNote = useNotesStore.getState().notes.find((entry) => entry.id === noteId);

      await updateNote(noteId, {
        title: nextTitle.trim(),
        folderId: nextFolderId,
        isInbox: nextFolderId === null ? latestNote?.isInbox : false,
        noteMode: "free",
        dailyEntries: [],
        content
      });
    },
    [noteId, updateNote]
  );

  const persistEntryChanges = useCallback(
    async (entryUpdates: Record<string, string>, nextTitle: string, nextFolderId: string | null) => {
      if (!noteId) {
        return;
      }

      const latestNote = useNotesStore.getState().notes.find((entry) => entry.id === noteId);

      if (!latestNote) {
        return;
      }

      let dailyEntries = normalizeDailyEntries(latestNote);

      for (const [dateKey, content] of Object.entries(entryUpdates)) {
        dailyEntries = upsertDailyEntry(dailyEntries, dateKey, content);
      }

      await updateNote(noteId, {
        title: nextTitle.trim(),
        folderId: nextFolderId,
        isInbox: nextFolderId === null ? latestNote.isInbox : false,
        noteMode: "day",
        dailyEntries,
        content: buildNoteContentFromEntries(dailyEntries)
      });
    },
    [noteId, updateNote]
  );

  const flushPendingSave = useCallback(async () => {
    if (!noteId) {
      return;
    }

    saveRevisionRef.current += 1;

    if (mainSaveTimeoutRef.current) {
      clearTimeout(mainSaveTimeoutRef.current);
      mainSaveTimeoutRef.current = null;
    }

    const latestDraft = latestDraftRef.current;
    const allEntryDrafts = allEntryDraftsRef.current;

    for (const timeout of Object.values(allEntrySaveTimeoutsRef.current)) {
      clearTimeout(timeout);
    }

    for (const dateKey of Object.keys(allEntrySaveVersionsRef.current)) {
      allEntrySaveVersionsRef.current[dateKey] += 1;
    }

    allEntrySaveTimeoutsRef.current = {};

    if (!hasPendingSaveRef.current && Object.keys(allEntryDrafts).length === 0) {
      return;
    }

    setSaveState("saving");

    if (latestDraft.noteMode === "free") {
      await persistFreeNoteChanges(latestDraft.freeContent, latestDraft.title, latestDraft.folderId);
      allEntryDraftsRef.current = {};
      hasPendingSaveRef.current = false;
      setSaveState("saved");
      return;
    }

    await persistEntryChanges(
      {
        [latestDraft.dateKey]: latestDraft.content,
        ...allEntryDrafts
      },
      latestDraft.title,
      latestDraft.folderId
    );
    allEntryDraftsRef.current = {};
    hasPendingSaveRef.current = false;
    setSaveState("saved");
  }, [noteId, persistEntryChanges, persistFreeNoteChanges]);

  const handleBack = useCallback(async () => {
    if (isLeavingRef.current) {
      return;
    }

    isLeavingRef.current = true;
    try {
      await flushPendingSave();
    } catch {
      isLeavingRef.current = false;
      setSaveState("dirty");
      Alert.alert("Sauvegarde impossible", "La note n'a pas pu etre sauvegardee. Reessaie avant de quitter.");
      return;
    }

    if (returnFolderId) {
      router.replace({ pathname: "/folders/[id]", params: { id: returnFolderId } });
      return;
    }

    router.back();
  }, [flushPendingSave, returnFolderId]);

  useEffect(() => {
    if (!noteId) {
      return;
    }

    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }

    hasPendingSaveRef.current = true;
    const revision = saveRevisionRef.current + 1;
    saveRevisionRef.current = revision;

    if (noteMode === "free") {
      setSaveState("dirty");

      const timeout = setTimeout(async () => {
        setSaveState("saving");
        try {
          await persistFreeNoteChanges(freeContent, title, folderId);
          mainSaveTimeoutRef.current = null;

          if (saveRevisionRef.current === revision) {
            hasPendingSaveRef.current = false;
            setSaveState("saved");
          }
        } catch {
          mainSaveTimeoutRef.current = null;
          if (saveRevisionRef.current === revision) {
            hasPendingSaveRef.current = true;
            setSaveState("dirty");
          }
        }
      }, 450);
      mainSaveTimeoutRef.current = timeout;

      return () => {
        clearTimeout(timeout);
        if (mainSaveTimeoutRef.current === timeout) {
          mainSaveTimeoutRef.current = null;
        }
      };
    }

    setSaveState("dirty");

    const timeout = setTimeout(async () => {
      setSaveState("saving");
      try {
        await persistNoteChanges(selectedDateKey, dayContent, title, folderId);
        mainSaveTimeoutRef.current = null;

        if (saveRevisionRef.current === revision) {
          const hasEntryDrafts = Object.keys(allEntryDraftsRef.current).length > 0;
          hasPendingSaveRef.current = hasEntryDrafts;
          setSaveState(hasEntryDrafts ? "dirty" : "saved");
        }
      } catch {
        mainSaveTimeoutRef.current = null;
        if (saveRevisionRef.current === revision) {
          hasPendingSaveRef.current = true;
          setSaveState("dirty");
        }
      }
    }, 450);
    mainSaveTimeoutRef.current = timeout;

    return () => {
      clearTimeout(timeout);
      if (mainSaveTimeoutRef.current === timeout) {
        mainSaveTimeoutRef.current = null;
      }
    };
  }, [dayContent, folderId, freeContent, noteId, noteMode, persistFreeNoteChanges, persistNoteChanges, selectedDateKey, title]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      void handleBack();
      return true;
    });

    return () => {
      subscription.remove();
      if (!isLeavingRef.current) {
        void flushPendingSave().catch(() => undefined);
      }
    };
  }, [flushPendingSave, handleBack]);

  const handleSelectDate = async (dateKey: string) => {
    if (dateKey === selectedDateKey) {
      return;
    }

    await persistNoteChanges(selectedDateKey, dayContent, title, folderId);

    const latestNote = noteId
      ? useNotesStore.getState().notes.find((entry) => entry.id === noteId)
      : note;
    const latestEntries = latestNote ? normalizeDailyEntries(latestNote) : entries;

    isFirstSync.current = true;
    setSelectedDateKey(dateKey);
    setDayContent(latestEntries.find((entry) => entry.date === dateKey)?.content ?? "");
    setSaveState("saved");
  };

  const handleOpenDateModal = () => {
    const activeDate = viewMode === "all" ? allJumpDate : selectedDate;
    setCalendarMonth(new Date(activeDate.getFullYear(), activeDate.getMonth(), 1));
    setShowDateModal(true);
  };

  const scrollToAllDate = (dateKey: string) => {
    const sectionY = allEntryYRef.current[dateKey] ?? 0;
    const targetY = Math.max(allCardYRef.current + sectionY - 12, 0);
    screenScrollRef.current?.scrollTo({ y: targetY, animated: true });
  };

  const handleSelectCalendarDate = async (date: Date) => {
    const dateKey = toDateKey(date);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));

    if (viewMode === "all") {
      setAllJumpDateKey(dateKey);
      setShowDateModal(false);
      requestAnimationFrame(() => scrollToAllDate(dateKey));
      return;
    }

    await handleSelectDate(dateKey);
  };

  if (!note) {
    return (
      <ScreenContainer>
        <EmptyState title="Note introuvable" description="Cette note n'existe plus." />
      </ScreenContainer>
    );
  }

  if (requiresNoteUnlock) {
    return (
      <ScreenContainer>
        <LockCodeModal
          visible
          title="Note verrouillee"
          description={containingFolder?.isLocked ? `Code du dossier "${containingFolder.name}".` : "Entre le code de cette note."}
          mode="unlock"
          error={unlockError}
          onCancel={handleBack}
          onSubmit={(code) => {
            if (verifyLockCode(code, noteLockHash)) {
              setUnlockError(null);
              setNoteUnlocked(true);
              return;
            }

            setUnlockError("Code incorrect.");
          }}
        />
      </ScreenContainer>
    );
  }

  const handleMoveToFolder = async (nextFolderId: string | null) => {
    setFolderId(nextFolderId);
    await moveNote(note.id, nextFolderId);
    setShowMovePicker(false);
    setShowIconPicker(false);
    setShowFolderModal(false);
    setShowActions(false);
    void hapticSuccess();
  };

  const handleSelectIcon = async (nextIconKey: NoteIconKey) => {
    await updateNote(note.id, {
      iconKey: nextIconKey === "auto" ? null : nextIconKey
    });
    setShowIconPicker(false);
    setShowIconModal(false);
  };

  const handleToggleNoteLock = async () => {
    if (note.isLocked) {
      setNoteLockError(null);
      setNoteLockModalMode("unlock-remove");
      return;
    }

    setNoteLockError(null);
    setNoteLockModalMode("create");
  };

  const handleChangeNoteMode = async (nextMode: NoteMode) => {
    if (nextMode === noteMode || !noteId) {
      setShowActions(false);
      return;
    }

    setSaveState("saving");

    if (nextMode === "free") {
      const latestNote = useNotesStore.getState().notes.find((entry) => entry.id === noteId) ?? note;
      const latestEntries = latestNote ? normalizeDailyEntries(latestNote) : entries;
      const nextContent = buildNoteContentFromEntries(
        upsertDailyEntry(latestEntries, selectedDateKey, dayContent)
      );

      await updateNote(noteId, {
        title: title.trim(),
        folderId,
        noteMode: "free",
        dailyEntries: [],
        content: nextContent
      });

      setFreeContent(nextContent);
      setNoteMode("free");
      setSaveState("saved");
      setShowActions(false);
      return;
    }

    const dailyEntries = upsertDailyEntry([], todayKey, freeContent);

    await updateNote(noteId, {
      title: title.trim(),
      folderId,
      noteMode: "day",
      dailyEntries,
      content: buildNoteContentFromEntries(dailyEntries)
    });

    isFirstSync.current = true;
    setSelectedDateKey(todayKey);
    setAllJumpDateKey(todayKey);
    setDayContent(freeContent);
    setNoteMode("day");
    setViewMode("day");
    setSaveState("saved");
    setShowActions(false);
  };

  const handleChangeMode = async (mode: ViewMode) => {
    if (noteMode === "free") {
      return;
    }

    if (mode === viewMode) {
      return;
    }

    if (mode === "all") {
      setSaveState("saving");
      await persistNoteChanges(selectedDateKey, dayContent, title, folderId);

      const latestNote = noteId
        ? useNotesStore.getState().notes.find((entry) => entry.id === noteId)
        : note;
      const latestEntries = latestNote ? normalizeDailyEntries(latestNote) : entries;

      isFirstSync.current = true;
      setSelectedDateKey(todayKey);
      setAllJumpDateKey(todayKey);
      setDayContent(latestEntries.find((entry) => entry.date === todayKey)?.content ?? "");
      setSaveState("saved");
    }

    setViewMode(mode);
  };

  const handleScreenScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextVisible = (viewMode === "all" || noteMode === "free") && event.nativeEvent.contentOffset.y > 360;
    setShowScrollTop((current) => (current === nextVisible ? current : nextVisible));
  };

  const rememberEditorContentHeight = (editorKey: string, height: number) => {
    const roundedHeight = Math.ceil(height) + 8;

    setEditorContentHeights((currentHeights) => {
      if (currentHeights[editorKey] === roundedHeight) {
        return currentHeights;
      }

      return {
        ...currentHeights,
        [editorKey]: roundedHeight
      };
    });
  };

  const getEditorHeight = (editorKey: string, minHeight: number) =>
    Math.max(editorContentHeights[editorKey] ?? minHeight, minHeight);

  const handleGlobalEntryChange = (dateKey: string, nextContent: string) => {
    allEntryDraftsRef.current = {
      ...allEntryDraftsRef.current,
      [dateKey]: nextContent
    };
    hasPendingSaveRef.current = true;
    setSaveState("dirty");

    const version = (allEntrySaveVersionsRef.current[dateKey] ?? 0) + 1;
    allEntrySaveVersionsRef.current[dateKey] = version;

    const currentTimeout = allEntrySaveTimeoutsRef.current[dateKey];

    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }

    allEntrySaveTimeoutsRef.current[dateKey] = setTimeout(async () => {
      const content = allEntryDraftsRef.current[dateKey] ?? "";
      setSaveState("saving");
      try {
        await persistEntryChanges(
          { [dateKey]: content },
          latestDraftRef.current.title,
          latestDraftRef.current.folderId
        );
      } catch {
        if (allEntrySaveVersionsRef.current[dateKey] === version) {
          hasPendingSaveRef.current = true;
          setSaveState("dirty");
        }
        return;
      }

      if (allEntrySaveVersionsRef.current[dateKey] !== version) {
        setSaveState("dirty");
        return;
      }

      const nextDrafts = { ...allEntryDraftsRef.current };
      delete nextDrafts[dateKey];
      allEntryDraftsRef.current = nextDrafts;

      const nextTimeouts = { ...allEntrySaveTimeoutsRef.current };
      delete nextTimeouts[dateKey];
      allEntrySaveTimeoutsRef.current = nextTimeouts;

      const hasDrafts = Object.keys(nextDrafts).length > 0;
      hasPendingSaveRef.current = hasDrafts || mainSaveTimeoutRef.current !== null;
      setSaveState(hasPendingSaveRef.current ? "dirty" : "saved");
    }, 450);
  };

  const handleFocusedEditorChange = (editor: FocusedEditor, nextContent: string) => {
    if (editor.target === "free") {
      latestDraftRef.current = { ...latestDraftRef.current, freeContent: nextContent };
      setFreeContent(nextContent);
      return;
    }

    if (editor.target === "day") {
      latestDraftRef.current = { ...latestDraftRef.current, content: nextContent };
      setDayContent(nextContent);
      return;
    }

    const dateKey = editor.dateKey;

    if (!dateKey) {
      return;
    }

    handleGlobalEntryChange(dateKey, nextContent);
    setHistoricalEditorRevisions((current) => ({
      ...current,
      [dateKey]: (current[dateKey] ?? 0) + 1
    }));
  };

  const handleOpenHistory = async () => {
    setShowHistory(true);
    setHistoryLoading(true);

    try {
      setNoteRevisions(await listNoteRevisions(note.id));
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRestoreRevision = async (revision: NoteRevision) => {
    await flushPendingSave();
    const currentNote = useNotesStore.getState().notes.find((entry) => entry.id === note.id) ?? note;
    await queueNoteRevision(currentNote, true);
    await updateNote(note.id, {
      title: revision.title,
      content: revision.content,
      noteMode: revision.noteMode,
      dailyEntries: revision.dailyEntries.map((entry) => ({ ...entry }))
    });

    const restoredEntries = revision.dailyEntries;
    setTitle(revision.title);
    setNoteMode(revision.noteMode);
    setFreeContent(revision.noteMode === "free" ? revision.content : buildNoteContentFromEntries(restoredEntries));
    setSelectedDateKey(todayKey);
    setAllJumpDateKey(todayKey);
    setDayContent(restoredEntries.find((entry) => entry.date === todayKey)?.content ?? "");
    setViewMode(revision.noteMode === "free" ? "all" : "day");
    setEditorContentHeights({});
    setShowHistory(false);
    setSaveState("saved");
    void hapticSuccess();
  };

  const confirmRestoreRevision = (revision: NoteRevision) => {
    void hapticWarning();
    Alert.alert(
      "Restaurer cette version ?",
      `Version du ${new Date(revision.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}. La version actuelle restera dans l'historique.`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Restaurer", onPress: () => void handleRestoreRevision(revision) }
      ]
    );
  };

  const handleSelectOutlineDate = async (dateKey: string) => {
    await handleChangeMode("all");
    setAllJumpDateKey(dateKey);
    setShowOutline(false);
    void hapticSelection();
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToAllDate(dateKey)));
  };

  const handleOpenSearchResult = (result: NoteSearchResult) => {
    setShowNoteSearch(false);
    setFocusedEditor(result);
    void hapticSelection();
  };

  const openLinkedNote = async (linkedNoteId: string) => {
    await flushPendingSave();
    void hapticSelection();
    router.push(`/notes/${linkedNoteId}`);
  };

  const insertNoteLink = (linkedTitle: string) => {
    const link = `[[${linkedTitle || "Sans titre"}]]`;

    if (noteMode === "free") {
      setFreeContent((current) => `${current}${current.trim() ? "\n" : ""}${link}`);
    } else {
      setDayContent((current) => `${current}${current.trim() ? "\n" : ""}${link}`);
    }

    setShowLinkPicker(false);
    void hapticSuccess();
  };

  const renderModeButton = (mode: ViewMode, label: string, icon: keyof typeof Ionicons.glyphMap) => {
    const isActive = viewMode === mode;

    return (
      <Pressable
        accessibilityLabel={label}
        onPress={() => void handleChangeMode(mode)}
        style={{
          width: 44,
          height: 44,
          borderRadius: 16,
          backgroundColor: isActive ? "#0F1B3A" : palette.surface,
          borderWidth: 1,
          borderColor: isActive ? "#0F1B3A" : palette.border,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={icon} size={18} color={isActive ? "#FFFFFF" : theme.colors.text} />
      </Pressable>
    );
  };

  const calendarMonthLabel = calendarMonthFormatter.format(calendarMonth);
  const formattedCalendarMonth = `${calendarMonthLabel.charAt(0).toUpperCase()}${calendarMonthLabel.slice(1)}`;

  return (
    <ScreenContainer
      automaticallyAdjustKeyboardInsets={false}
      floatingElement={
        showScrollTop ? (
          <Pressable
            accessibilityLabel="Remonter en haut"
            onPress={() => screenScrollRef.current?.scrollTo({ y: 0, animated: true })}
            style={({ pressed }) => ({
              position: "absolute",
              right: 22,
              bottom: 24,
              width: 52,
              height: 52,
              borderRadius: 18,
              backgroundColor: "#0F1B3A",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.82 : 1
            })}
          >
            <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
          </Pressable>
        ) : null
      }
      onScroll={handleScreenScroll}
      keyboardDismissMode="none"
      keyboardShouldPersistTaps="always"
      scrollEventThrottle={16}
      scrollBottomPadding={12}
      scrollRef={screenScrollRef}
      scrollable
    >
      <View style={{ gap: theme.spacing.lg, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable
            accessibilityLabel="Retour"
            accessibilityRole="button"
            onPress={() => void handleBack()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="arrow-back" size={18} color={theme.colors.text} />
          </Pressable>

          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Pressable
              accessibilityLabel={note.isPinned ? "Retirer l'epingle" : "Epingler la note"}
              accessibilityRole="button"
              onPress={() => {
                void hapticSelection();
                void togglePinned(note.id);
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: note.isPinned ? "#0F1B3A" : palette.surface,
                borderWidth: 1,
                borderColor: note.isPinned ? "#0F1B3A" : palette.border,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name={note.isPinned ? "pin" : "pin-outline"} size={18} color={note.isPinned ? "#FFFFFF" : theme.colors.text} />
            </Pressable>

            <Pressable
              accessibilityLabel={note.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              accessibilityRole="button"
              onPress={() => {
                void hapticSelection();
                void toggleFavorite(note.id);
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: palette.surface,
                borderWidth: 1,
                borderColor: palette.border,
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
              accessibilityLabel="Rechercher dans la note"
              accessibilityRole="button"
              onPress={() => {
                setShowNoteSearch(true);
                void hapticImpact();
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: palette.surface,
                borderWidth: 1,
                borderColor: palette.border,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="search-outline" size={18} color={theme.colors.text} />
            </Pressable>
            <Pressable
              accessibilityLabel="Plus d'actions"
              accessibilityRole="button"
            onPress={() => {
              setShowMovePicker(false);
              setShowIconPicker(false);
              setShowIconModal(false);
              setShowActions((current) => !current);
            }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: palette.surface,
                borderWidth: 1,
                borderColor: palette.border,
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
              { color: "#7C4DFF", letterSpacing: 4, textTransform: "uppercase" }
            ]}
          >
            Note
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            accessibilityLabel="Changer l'icone de la note"
            onPress={() => setShowIconModal(true)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: activeNoteIcon.backgroundColor,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={activeNoteIcon.icon} size={24} color={activeNoteIcon.color} />
          </Pressable>

          <TextInput
            accessibilityLabel="Titre de la note"
            value={title}
            onChangeText={setTitle}
            placeholder="Titre"
            placeholderTextColor={palette.placeholder}
            multiline
            disableFullscreenUI
            scrollEnabled={false}
            selectionColor={EDITOR_SELECTION_COLOR}
            cursorColor={EDITOR_CURSOR_COLOR}
            style={[
              theme.typography.h1,
              {
                color: theme.colors.text,
                flex: 1,
                fontSize: 30,
                lineHeight: 34,
                paddingVertical: 0
              }
            ]}
          />

          {noteMode === "day" ? (
            <View style={{ flexDirection: "row", gap: theme.spacing.sm, paddingTop: 2 }}>
              {renderModeButton("day", "Voir jour par jour", "calendar-outline")}
              {renderModeButton("all", "Voir toute la note", "reader-outline")}
            </View>
          ) : (
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 15,
                backgroundColor: palette.surface,
                borderWidth: 1,
                borderColor: palette.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="document-text-outline" size={18} color={palette.text} />
            </View>
          )}
        </View>

        {note.sourceUrl ? (
          <Pressable
            accessibilityLabel="Ouvrir le lien source"
            accessibilityRole="link"
            onPress={() => void Linking.openURL(note.sourceUrl ?? "")}
            style={({ pressed }) => ({
              minHeight: 50,
              borderRadius: 17,
              backgroundColor: palette.surfaceMuted,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              opacity: pressed ? 0.82 : 1
            })}
          >
            <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: "#D8FAF1", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="link" size={15} color="#18A058" />
            </View>
            <Text style={[theme.typography.body, { color: palette.text, flex: 1 }]} numberOfLines={1}>{note.sourceUrl}</Text>
            <Ionicons name="open-outline" size={16} color={palette.textMuted} />
          </Pressable>
        ) : null}

        {noteMode === "free" ? (
          <View style={{ gap: 18 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => setShowFolderModal(true)}
                style={({ pressed }) => ({
                  minHeight: 42,
                  maxWidth: 150,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  backgroundColor: palette.surface,
                  borderWidth: 1,
                  borderColor: palette.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="folder-outline" size={13} color={palette.text} />
                <Text style={[theme.typography.label, { color: palette.text, fontSize: 14 }]} numberOfLines={1}>
                  {activeFolderLabel}
                </Text>
              </Pressable>

              <SaveStatusIndicator saveState={saveState} showSavedLabel={showSavedLabel} />
            </View>

            <View
              style={{
                minHeight: FREE_EDITOR_MIN_HEIGHT,
                borderRadius: 28,
                backgroundColor: palette.surface,
                paddingHorizontal: 22,
                paddingTop: 22,
                paddingBottom: 20,
                borderWidth: 1,
                borderColor: palette.border,
                gap: 14
              }}
            >
              <EditorSectionHeader
                accentColor={palette.textMuted}
                title="Note libre"
                onExpand={() =>
                  setFocusedEditor({
                    content: freeContent,
                    dateKey: null,
                    key: "free",
                    target: "free",
                    title: title || "Note libre"
                  })
                }
              />
              <TextInput
                accessibilityLabel="Contenu de la note libre"
                value={freeContent}
                onChangeText={setFreeContent}
                onContentSizeChange={(event) => rememberEditorContentHeight("free", event.nativeEvent.contentSize.height)}
                placeholder="Ecris une note sans date..."
                placeholderTextColor={palette.placeholder}
                multiline
                disableFullscreenUI
                scrollEnabled={false}
                selectionColor={EDITOR_SELECTION_COLOR}
                cursorColor={EDITOR_CURSOR_COLOR}
                textAlignVertical="top"
                textBreakStrategy="simple"
                style={[
                  theme.typography.body,
                  {
                    height: getEditorHeight("free", FREE_EDITOR_MIN_HEIGHT - 98),
                    color: palette.text,
                    fontSize: 17,
                    lineHeight: 32,
                    paddingVertical: 0
                  }
                ]}
              />
            </View>
          </View>
        ) : viewMode === "day" ? (
          <View style={{ gap: 18 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                accessibilityLabel="Changer la date"
                accessibilityRole="button"
                onPress={handleOpenDateModal}
                style={({ pressed }) => ({
                  minHeight: 42,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  backgroundColor: "#0F1B3A",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="calendar" size={13} color="#FFFFFF" />
                <Text style={[theme.typography.label, { color: "#FFFFFF", fontSize: 14 }]} numberOfLines={1}>
                  {selectedDateLabel}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowFolderModal(true)}
                style={({ pressed }) => ({
                  minHeight: 42,
                  maxWidth: 120,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  backgroundColor: palette.surface,
                  borderWidth: 1,
                  borderColor: palette.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="folder-outline" size={13} color={palette.text} />
                <Text style={[theme.typography.label, { color: palette.text, fontSize: 14 }]} numberOfLines={1}>
                  {activeFolderLabel}
                </Text>
              </Pressable>

              <SaveStatusIndicator saveState={saveState} showSavedLabel={showSavedLabel} />
            </View>

            <View
              style={{
                minHeight: 360,
                borderRadius: 28,
                backgroundColor: palette.surface,
                paddingHorizontal: 22,
                paddingTop: 22,
                paddingBottom: 20,
                borderWidth: 1,
                borderColor: palette.border,
                gap: 14
              }}
            >
              <EditorSectionHeader
                accentColor="#4F6EF7"
                title={selectedDateTitle}
                onExpand={() =>
                  setFocusedEditor({
                    content: dayContent,
                    dateKey: selectedDateKey,
                    key: `day:${selectedDateKey}`,
                    target: "day",
                    title: selectedDateTitle
                  })
                }
              />
              <TextInput
                accessibilityLabel={`Contenu du ${selectedDateTitle}`}
                value={dayContent}
                onChangeText={setDayContent}
                onContentSizeChange={(event) => rememberEditorContentHeight(`day:${selectedDateKey}`, event.nativeEvent.contentSize.height)}
                placeholder={
                  selectedDateKey === todayKey
                    ? "Ecris quelque chose pour aujourd'hui..."
                    : "Ecris quelque chose pour cette date..."
                }
                placeholderTextColor={palette.placeholder}
                multiline
                disableFullscreenUI
                scrollEnabled={false}
                selectionColor={EDITOR_SELECTION_COLOR}
                cursorColor={EDITOR_CURSOR_COLOR}
                textAlignVertical="top"
                textBreakStrategy="simple"
                style={[
                  theme.typography.body,
                  {
                    height: getEditorHeight(`day:${selectedDateKey}`, DAY_EDITOR_MIN_HEIGHT),
                    color: palette.text,
                    fontSize: 17,
                    lineHeight: 32,
                    paddingVertical: 0
                  }
                ]}
              />
            </View>
          </View>
        ) : (
          <View style={{ gap: 18 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                accessibilityLabel="Ouvrir le sommaire des journees"
                accessibilityRole="button"
                onPress={() => {
                  setShowOutline(true);
                  void hapticImpact();
                }}
                style={({ pressed }) => ({
                  minHeight: 42,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  backgroundColor: "#0F1B3A",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="list" size={13} color="#FFFFFF" />
                <Text style={[theme.typography.label, { color: "#FFFFFF", fontSize: 14 }]} numberOfLines={1}>
                  Sommaire
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowFolderModal(true)}
                style={({ pressed }) => ({
                  minHeight: 42,
                  maxWidth: 120,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  backgroundColor: palette.surface,
                  borderWidth: 1,
                  borderColor: palette.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="folder-outline" size={13} color={palette.text} />
                <Text style={[theme.typography.label, { color: palette.text, fontSize: 14 }]} numberOfLines={1}>
                  {activeFolderLabel}
                </Text>
              </Pressable>

              <SaveStatusIndicator saveState={saveState} showSavedLabel={showSavedLabel} />
            </View>

            <View
              onLayout={(event) => {
                allCardYRef.current = event.nativeEvent.layout.y;
              }}
              style={{
                minHeight: otherEntries.length > 0 ? 480 : 260,
                borderRadius: 28,
                backgroundColor: palette.surface,
                paddingHorizontal: 22,
                paddingTop: 26,
                paddingBottom: 22,
                borderWidth: 1,
                borderColor: palette.border
              }}
            >
            <View
              onLayout={(event) => {
                allEntryYRef.current[todayKey] = event.nativeEvent.layout.y;
              }}
              style={{
                gap: 14,
                paddingBottom: otherEntries.length > 0 ? 28 : 0,
                borderBottomWidth: otherEntries.length > 0 ? 1 : 0,
                borderBottomColor: palette.divider
              }}
            >
              <EditorSectionHeader
                accentColor={palette.textMuted}
                title={entryDateFormatter.format(fromDateKey(todayKey))}
                onExpand={() =>
                  setFocusedEditor({
                    content: dayContent,
                    dateKey: todayKey,
                    key: `all:${todayKey}`,
                    target: "day",
                    title: entryDateFormatter.format(fromDateKey(todayKey))
                  })
                }
              />
              <TextInput
                accessibilityLabel="Contenu d'aujourd'hui"
                value={dayContent}
                onChangeText={setDayContent}
                onContentSizeChange={(event) => rememberEditorContentHeight(`all:${todayKey}`, event.nativeEvent.contentSize.height)}
                placeholder="Ecris quelque chose pour aujourd'hui..."
                placeholderTextColor={palette.placeholder}
                multiline
                disableFullscreenUI
                scrollEnabled={false}
                selectionColor={EDITOR_SELECTION_COLOR}
                cursorColor={EDITOR_CURSOR_COLOR}
                textAlignVertical="top"
                textBreakStrategy="simple"
                style={[
                  theme.typography.body,
                  {
                    height: getEditorHeight(`all:${todayKey}`, otherEntries.length > 0 ? 180 : 190),
                    color: palette.text,
                    fontSize: 17,
                    lineHeight: 30,
                    paddingVertical: 0
                  }
                ]}
              />
            </View>

            {otherEntries.map((entry, index, allEntries) => {
              const isLastEntry = index === allEntries.length - 1;

              return (
                <View
                  key={`${entry.id}:${historicalEditorRevisions[entry.date] ?? 0}`}
                  onLayout={(event) => {
                    allEntryYRef.current[entry.date] = event.nativeEvent.layout.y;
                  }}
                  style={{
                    gap: 14,
                    paddingTop: 18,
                    paddingBottom: isLastEntry ? 0 : 28,
                    borderBottomWidth: isLastEntry ? 0 : 1,
                    borderBottomColor: palette.divider
                  }}
                >
                  <EditorSectionHeader
                    accentColor={palette.textMuted}
                    title={entryDateFormatter.format(fromDateKey(entry.date))}
                    onExpand={() =>
                      setFocusedEditor({
                        content: allEntryDraftsRef.current[entry.date] ?? entry.content,
                        dateKey: entry.date,
                        key: `historical:${entry.date}`,
                        target: "historical",
                        title: entryDateFormatter.format(fromDateKey(entry.date))
                      })
                    }
                  />
                  <TextInput
                    accessibilityLabel={`Contenu du ${entryDateFormatter.format(fromDateKey(entry.date))}`}
                    defaultValue={allEntryDraftsRef.current[entry.date] ?? entry.content}
                    onChangeText={(nextContent) => handleGlobalEntryChange(entry.date, nextContent)}
                    onContentSizeChange={(event) => rememberEditorContentHeight(`all:${entry.date}`, event.nativeEvent.contentSize.height)}
                    placeholder="Ecris quelque chose pour cette date..."
                    placeholderTextColor={palette.placeholder}
                    multiline
                    disableFullscreenUI
                    scrollEnabled={false}
                    selectionColor={EDITOR_SELECTION_COLOR}
                    cursorColor={EDITOR_CURSOR_COLOR}
                    textAlignVertical="top"
                    textBreakStrategy="simple"
                    style={[
                      theme.typography.body,
                      {
                        height: getEditorHeight(`all:${entry.date}`, ALL_ENTRY_MIN_HEIGHT),
                        color: palette.text,
                        fontSize: 17,
                        lineHeight: 30,
                        paddingVertical: 0
                      }
                    ]}
                  />
                </View>
              );
            })}
            </View>
          </View>
        )}

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 11, backgroundColor: "#EFE6FF", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="git-network-outline" size={14} color="#7C4DFF" />
              </View>
              <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Notes liees</Text>
            </View>
            <Pressable accessibilityLabel="Ajouter un lien vers une note" onPress={() => setShowLinkPicker(true)} hitSlop={8}>
              <Ionicons name="add-circle" size={24} color="#4F6EF7" />
            </Pressable>
          </View>

          {outgoingLinks.length > 0 || backlinks.length > 0 ? (
            <View style={{ borderRadius: 20, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 14 }}>
              {outgoingLinks.map((link, index) => (
                <Pressable
                  key={`out-${link.title}`}
                  accessibilityLabel={link.note ? `Ouvrir ${link.note.title}` : `Lien introuvable ${link.title}`}
                  disabled={!link.note}
                  onPress={() => link.note && void openLinkedNote(link.note.id)}
                  style={({ pressed }) => ({ minHeight: 54, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: index < outgoingLinks.length - 1 || backlinks.length > 0 ? 1 : 0, borderBottomColor: palette.divider, opacity: pressed ? 0.8 : link.note ? 1 : 0.55 })}
                >
                  <Ionicons name={link.note ? "arrow-forward-circle-outline" : "alert-circle-outline"} size={19} color={link.note ? "#4F6EF7" : palette.textMuted} />
                  <Text style={[theme.typography.label, { color: palette.text, flex: 1 }]} numberOfLines={1}>{link.note?.title || link.title}</Text>
                  <Text style={[theme.typography.caption, { color: palette.textMuted }]}>{link.note ? "Lien" : "Introuvable"}</Text>
                </Pressable>
              ))}
              {backlinks.map((backlink, index) => (
                <Pressable
                  key={`back-${backlink.id}`}
                  accessibilityLabel={`Ouvrir la note qui cite ${backlink.title}`}
                  onPress={() => void openLinkedNote(backlink.id)}
                  style={({ pressed }) => ({ minHeight: 54, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: index < backlinks.length - 1 ? 1 : 0, borderBottomColor: palette.divider, opacity: pressed ? 0.8 : 1 })}
                >
                  <Ionicons name="return-down-back-outline" size={19} color="#18A058" />
                  <Text style={[theme.typography.label, { color: palette.text, flex: 1 }]} numberOfLines={1}>{backlink.title || "Sans titre"}</Text>
                  <Text style={[theme.typography.caption, { color: palette.textMuted }]}>Mentionne ici</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Pressable
              accessibilityLabel="Lier cette note a une autre"
              onPress={() => setShowLinkPicker(true)}
              style={({ pressed }) => ({ minHeight: 52, borderRadius: 18, backgroundColor: palette.surfaceMuted, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, opacity: pressed ? 0.82 : 1 })}
            >
              <Ionicons name="link-outline" size={18} color="#7C4DFF" />
              <Text style={[theme.typography.body, { color: palette.text, flex: 1 }]}>Relier cette note a une autre</Text>
              <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <Modal visible={showLinkPicker} transparent animationType="slide" onRequestClose={() => setShowLinkPicker(false)}>
        <Pressable onPress={() => setShowLinkPicker(false)} style={{ flex: 1, backgroundColor: "rgba(15, 27, 58, 0.22)", justifyContent: "flex-end" }}>
          <Pressable
            accessibilityViewIsModal
            onPress={() => undefined}
            style={{ maxHeight: "82%", backgroundColor: palette.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 28, gap: 16 }}
          >
            <View style={{ alignSelf: "center", width: 48, height: 5, borderRadius: 4, backgroundColor: palette.divider }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 46, height: 46, borderRadius: 17, backgroundColor: "#EFE6FF", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="link" size={20} color="#7C4DFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontSize: 25, lineHeight: 31, fontWeight: "900" }}>Lier une note</Text>
                <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]}>Ajoute un lien navigable dans le texte.</Text>
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator indicatorStyle={palette.isDark ? "white" : "black"} keyboardShouldPersistTaps="handled">
              <View style={{ gap: 8, paddingBottom: 4 }}>
                {linkCandidates.map((candidate) => (
                  <Pressable
                    key={candidate.id}
                    accessibilityLabel={`Lier la note ${candidate.title || "Sans titre"}`}
                    onPress={() => insertNoteLink(candidate.title)}
                    style={({ pressed }) => ({ minHeight: 58, borderRadius: 18, backgroundColor: palette.surfaceMuted, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed ? 0.8 : 1 })}
                  >
                    <View style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: getNoteIcon(candidate).backgroundColor, alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name={getNoteIcon(candidate).icon} size={16} color={getNoteIcon(candidate).color} />
                    </View>
                    <Text style={[theme.typography.label, { color: palette.text, flex: 1, fontWeight: "900" }]} numberOfLines={1}>{candidate.title || "Sans titre"}</Text>
                    <Ionicons name="add-circle-outline" size={19} color="#4F6EF7" />
                  </Pressable>
                ))}
                {linkCandidates.length === 0 ? <EmptyState title="Aucune autre note" description="Cree une seconde note pour pouvoir les relier." icon="link-outline" /> : null}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showNoteSearch} transparent animationType="slide" onRequestClose={() => setShowNoteSearch(false)}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowNoteSearch(false)}
          style={{ flex: 1, backgroundColor: "rgba(15, 27, 58, 0.22)", justifyContent: "flex-end" }}
        >
          <Pressable
            accessibilityViewIsModal
            onPress={() => undefined}
            style={{
              maxHeight: "84%",
              backgroundColor: palette.surface,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingHorizontal: 22,
              paddingTop: 12,
              paddingBottom: 28,
              gap: 16
            }}
          >
            <View style={{ alignSelf: "center", width: 48, height: 5, borderRadius: 4, backgroundColor: palette.divider }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 46, height: 46, borderRadius: 17, backgroundColor: "#E4ECFF", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="search" size={20} color="#4F6EF7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontSize: 25, lineHeight: 31, fontWeight: "900" }}>Rechercher</Text>
                <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]}>Dans toute cette note</Text>
              </View>
            </View>
            <View style={{ minHeight: 54, borderRadius: 18, backgroundColor: palette.surfaceMuted, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="search-outline" size={17} color={palette.textMuted} />
              <TextInput
                autoFocus
                accessibilityLabel="Mot a rechercher dans la note"
                value={noteSearchQuery}
                onChangeText={setNoteSearchQuery}
                placeholder="Rechercher un mot..."
                placeholderTextColor={palette.placeholder}
                returnKeyType="search"
                selectionColor={EDITOR_SELECTION_COLOR}
                cursorColor={EDITOR_CURSOR_COLOR}
                style={[theme.typography.body, { flex: 1, color: palette.text, paddingVertical: 8 }]}
              />
              {noteSearchQuery ? (
                <Pressable accessibilityLabel="Effacer la recherche" accessibilityRole="button" onPress={() => setNoteSearchQuery("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={21} color={palette.textMuted} />
                </Pressable>
              ) : null}
            </View>
            <Text style={[theme.typography.caption, { color: palette.textMuted, fontWeight: "900" }]}>
              {noteSearchQuery.trim() ? `${searchResults.length} resultat${searchResults.length > 1 ? "s" : ""}` : "Saisis un mot pour commencer"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={{ gap: 10, paddingBottom: 4 }}>
                {searchResults.map((result) => (
                  <Pressable
                    key={result.id}
                    accessibilityLabel={`Ouvrir le resultat dans ${result.title}`}
                    accessibilityRole="button"
                    onPress={() => handleOpenSearchResult(result)}
                    style={({ pressed }) => ({
                      minHeight: 72,
                      borderRadius: 18,
                      backgroundColor: palette.surfaceMuted,
                      paddingHorizontal: 14,
                      paddingVertical: 11,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      opacity: pressed ? 0.8 : 1
                    })}
                  >
                    <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: "#E4ECFF", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name={result.target === "free" ? "document-text" : "calendar"} size={16} color="#4F6EF7" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900", marginBottom: 2 }]} numberOfLines={1}>{result.title}</Text>
                      <SearchSnippet query={noteSearchQuery} text={result.snippet} />
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
                  </Pressable>
                ))}
                {noteSearchQuery.trim() && searchResults.length === 0 ? (
                  <View style={{ minHeight: 110, alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Ionicons name="search-outline" size={22} color={palette.textMuted} />
                    <Text style={[theme.typography.body, { color: palette.textMuted }]}>Aucun resultat dans cette note</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showOutline} transparent animationType="slide" onRequestClose={() => setShowOutline(false)}>
        <Pressable onPress={() => setShowOutline(false)} style={{ flex: 1, backgroundColor: "rgba(15, 27, 58, 0.22)", justifyContent: "flex-end" }}>
          <Pressable accessibilityViewIsModal onPress={() => undefined} style={{ maxHeight: "78%", backgroundColor: palette.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 28, gap: 16 }}>
            <View style={{ alignSelf: "center", width: 48, height: 5, borderRadius: 4, backgroundColor: palette.divider }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 46, height: 46, borderRadius: 17, backgroundColor: "#D8FAF1", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="list" size={20} color="#18A058" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontSize: 25, lineHeight: 31, fontWeight: "900" }}>Sommaire</Text>
                <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]}>{entries.length} journee{entries.length > 1 ? "s" : ""}</Text>
              </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 9, paddingBottom: 4 }}>
                {[...entries].reverse().map((entry) => {
                  const currentContent = entry.date === todayKey ? dayContent : allEntryDraftsRef.current[entry.date] ?? entry.content;
                  const preview = currentContent.trim().replace(/\s+/g, " ") || "Journee vide";

                  return (
                    <Pressable
                      key={entry.id}
                      accessibilityLabel={`Aller au ${entryDateFormatter.format(fromDateKey(entry.date))}`}
                      accessibilityRole="button"
                      onPress={() => void handleSelectOutlineDate(entry.date)}
                      style={({ pressed }) => ({ minHeight: 66, borderRadius: 18, backgroundColor: entry.date === allJumpDateKey ? "#E4ECFF" : palette.surfaceMuted, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed ? 0.8 : 1 })}
                    >
                      <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: palette.surface, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="calendar-outline" size={16} color={entry.date === allJumpDateKey ? "#4F6EF7" : palette.textMuted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]} numberOfLines={1}>{entryDateFormatter.format(fromDateKey(entry.date))}</Text>
                        <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 2 }]} numberOfLines={1}>{preview}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showHistory} transparent animationType="slide" onRequestClose={() => setShowHistory(false)}>
        <Pressable onPress={() => setShowHistory(false)} style={{ flex: 1, backgroundColor: "rgba(15, 27, 58, 0.22)", justifyContent: "flex-end" }}>
          <Pressable accessibilityViewIsModal onPress={() => undefined} style={{ maxHeight: "80%", backgroundColor: palette.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 28, gap: 16 }}>
            <View style={{ alignSelf: "center", width: 48, height: 5, borderRadius: 4, backgroundColor: palette.divider }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 46, height: 46, borderRadius: 17, backgroundColor: "#F0E6FF", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="time" size={20} color="#7C4DFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: palette.text, fontSize: 25, lineHeight: 31, fontWeight: "900" }}>Historique</Text>
                <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]}>Versions locales recentes</Text>
              </View>
            </View>
            {historyLoading ? (
              <View style={{ minHeight: 140, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color="#7C4DFF" /></View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ gap: 9, paddingBottom: 4 }}>
                  {noteRevisions.map((revision) => (
                    <Pressable
                      key={revision.id}
                      accessibilityLabel={`Restaurer la version du ${new Date(revision.createdAt).toLocaleString("fr-FR")}`}
                      accessibilityRole="button"
                      onPress={() => confirmRestoreRevision(revision)}
                      style={({ pressed }) => ({ minHeight: 72, borderRadius: 18, backgroundColor: palette.surfaceMuted, paddingHorizontal: 14, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed ? 0.8 : 1 })}
                    >
                      <View style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: palette.surface, alignItems: "center", justifyContent: "center" }}><Ionicons name="refresh" size={16} color="#7C4DFF" /></View>
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>{new Date(revision.createdAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</Text>
                        <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 2 }]} numberOfLines={1}>{revision.content.trim().replace(/\s+/g, " ") || revision.title || "Version vide"}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={palette.textMuted} />
                    </Pressable>
                  ))}
                  {noteRevisions.length === 0 ? (
                    <View style={{ minHeight: 130, alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <Ionicons name="time-outline" size={24} color={palette.textMuted} />
                      <Text style={[theme.typography.body, { color: palette.textMuted, textAlign: "center" }]}>Une version apparaitra apres tes prochaines modifications.</Text>
                    </View>
                  ) : null}
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {focusedEditor ? (
        <FocusedEditorModal
          key={focusedEditor.key}
          editor={focusedEditor}
          onChange={(nextContent) => handleFocusedEditorChange(focusedEditor, nextContent)}
          onClose={() => setFocusedEditor(null)}
        />
      ) : null}

      <Modal visible={showDateModal} transparent animationType="slide" onRequestClose={() => setShowDateModal(false)}>
        <Pressable
          onPress={() => setShowDateModal(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 27, 58, 0.18)",
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
              paddingBottom: 28,
              gap: 20
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

            <Text style={{ color: palette.text, fontSize: 27, lineHeight: 34, fontWeight: "900" }}>
              Changer la date
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Pressable
                accessibilityLabel="Mois precedent"
                onPress={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                  )
                }
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: palette.surface,
                  borderWidth: 1,
                  borderColor: palette.border,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="chevron-back" size={17} color={palette.text} />
              </Pressable>

              <Text style={[theme.typography.h3, { color: palette.text, fontWeight: "900" }]}>
                {formattedCalendarMonth}
              </Text>

              <Pressable
                accessibilityLabel="Mois suivant"
                onPress={() =>
                  setCalendarMonth(
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                  )
                }
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: palette.surface,
                  borderWidth: 1,
                  borderColor: palette.border,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="chevron-forward" size={17} color={palette.text} />
              </Pressable>
            </View>

            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: "row" }}>
                {dayLabels.map((label) => (
                  <Text
                    key={label}
                    style={[
                      theme.typography.caption,
                      {
                        width: `${100 / 7}%`,
                        textAlign: "center",
                        color: palette.textMuted,
                        fontWeight: "900"
                      }
                    ]}
                  >
                    {label}
                  </Text>
                ))}
              </View>

              <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 6 }}>
                {calendarDays.map((date) => {
                  const dateKey = toDateKey(date);
                  const isSelected = dateKey === activeCalendarDateKey;
                  const isOutside = date.getMonth() !== calendarMonth.getMonth();
                  const isToday = dateKey === todayKey;
                  const hasEntry = entryDates.has(dateKey);

                  return (
                    <Pressable
                      key={dateKey}
                      onPress={() => void handleSelectCalendarDate(date)}
                      style={({ pressed }) => ({
                        width: `${100 / 7}%`,
                        height: 42,
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.75 : 1
                      })}
                    >
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 15,
                          backgroundColor: isSelected ? "#0F1B3A" : isToday ? palette.surfaceMuted : "transparent",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Text
                          style={[
                            theme.typography.label,
                            {
                              color: isSelected ? "#FFFFFF" : isOutside ? palette.textMuted : palette.text,
                              fontWeight: isSelected || isToday ? "900" : "700"
                            }
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                        {hasEntry && !isSelected ? (
                          <View
                            style={{
                              position: "absolute",
                              bottom: 5,
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: "#7C4DFF"
                            }}
                          />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => void handleSelectCalendarDate(fromDateKey(todayKey))}
                style={{
                  flex: 1,
                  minHeight: 54,
                  borderRadius: 18,
                  backgroundColor: palette.surface,
                  borderWidth: 1,
                  borderColor: palette.border,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={[theme.typography.label, { color: palette.text, fontSize: 15 }]}>
                  {"Aujourd'hui"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowDateModal(false)}
                style={{
                  flex: 1,
                  minHeight: 54,
                  borderRadius: 18,
                  backgroundColor: "#0F1B3A",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={[theme.typography.label, { color: "#FFFFFF", fontSize: 15 }]}>Valider</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showFolderModal} transparent animationType="slide" onRequestClose={() => setShowFolderModal(false)}>
        <Pressable
          onPress={() => setShowFolderModal(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 27, 58, 0.18)",
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
              paddingBottom: 28,
              maxHeight: "78%"
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

            <Text style={{ color: palette.text, fontSize: 27, lineHeight: 34, fontWeight: "900", marginBottom: 18 }}>
              Changer de dossier
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={{ gap: 10 }}>
                <Pressable
                  onPress={() => void handleMoveToFolder(null)}
                  style={({ pressed }) => ({
                    minHeight: 58,
                    borderRadius: 19,
                    paddingHorizontal: 16,
                    backgroundColor: folderId === null ? "#0F1B3A" : palette.surfaceMuted,
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
                      backgroundColor: folderId === null ? "rgba(255,255,255,0.14)" : palette.surface,
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="folder-open-outline" size={16} color={folderId === null ? "#FFFFFF" : palette.text} />
                  </View>
                  <Text style={[theme.typography.label, { color: folderId === null ? "#FFFFFF" : palette.text }]}>
                    Perso
                  </Text>
                </Pressable>

                {folders.map((folder) => {
                  const isActive = folderId === folder.id;

                  return (
                    <Pressable
                      key={folder.id}
                      onPress={() => void handleMoveToFolder(folder.id)}
                      style={({ pressed }) => ({
                        minHeight: 58,
                        borderRadius: 19,
                        paddingHorizontal: 16,
                        backgroundColor: isActive ? "#0F1B3A" : palette.surfaceMuted,
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
                          backgroundColor: isActive ? "rgba(255,255,255,0.14)" : palette.surface,
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name="folder-outline" size={16} color={isActive ? "#FFFFFF" : palette.text} />
                      </View>
                      <Text style={[theme.typography.label, { color: isActive ? "#FFFFFF" : palette.text }]}>
                        {folder.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showActions} transparent animationType="slide" onRequestClose={() => setShowActions(false)}>
        <Pressable
          onPress={() => {
            setShowActions(false);
            setShowMovePicker(false);
            setShowIconPicker(false);
            setShowIconModal(false);
          }}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 27, 58, 0.18)",
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
              paddingBottom: 26,
              maxHeight: "86%"
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
              <Text style={{ color: palette.text, fontSize: 27, lineHeight: 34, fontWeight: "900", marginBottom: 24 }}>
                Options de note
              </Text>

              <View style={{ gap: 14 }}>
                <NoteOptionRow
                  icon={note.isFavorite ? "star" : "star-outline"}
                  iconColor="#7C4DFF"
                  iconBackground="#F0E6FF"
                  title={note.isFavorite ? "Retirer favori" : "Favori"}
                  subtitle="Retrouver cette note plus vite"
                  onPress={() => {
                    void hapticSelection();
                    void toggleFavorite(note.id);
                    setShowActions(false);
                  }}
                />

                <NoteOptionRow
                  icon={note.isPinned ? "pin" : "pin-outline"}
                  iconColor="#4F6EF7"
                  iconBackground="#EAF0FF"
                  title={note.isPinned ? "Retirer l'epingle" : "Epingler"}
                  subtitle="Garder en haut de l'accueil"
                  onPress={() => {
                    void hapticSelection();
                    void togglePinned(note.id);
                    setShowActions(false);
                  }}
                />

                <NoteOptionRow
                  icon="notifications"
                  iconColor="#F59E0B"
                  iconBackground="#FFF1DC"
                  title="Ajouter un rappel"
                  subtitle="Recevoir une notification"
                  onPress={() => Alert.alert("Rappel", "Les rappels arrivent bientot.")}
                />

                <NoteOptionRow
                  icon="time-outline"
                  iconColor="#7C4DFF"
                  iconBackground="#F0E6FF"
                  title="Historique"
                  subtitle="Restaurer une version recente"
                  onPress={() => {
                    setShowActions(false);
                    void hapticImpact();
                    void handleOpenHistory();
                  }}
                />

                <NoteOptionRow
                  icon={noteMode === "free" ? "today-outline" : "document-text-outline"}
                  iconColor={noteMode === "free" ? "#F59E0B" : "#18A058"}
                  iconBackground={noteMode === "free" ? "#FFF1DC" : "#D8FAF1"}
                  title={noteMode === "free" ? "Passer en journal" : "Passer en note libre"}
                  subtitle={noteMode === "free" ? "Rattacher la note a une date" : "Retirer la logique de date"}
                  onPress={() => void handleChangeNoteMode(noteMode === "free" ? "day" : "free")}
                />

                <NoteOptionRow
                  icon={note.isArchived ? "archive" : "archive-outline"}
                  iconColor="#0F766E"
                  iconBackground="#D8FAF1"
                  title={note.isArchived ? "Restaurer" : "Archiver"}
                  subtitle="Masquer sans supprimer"
                  onPress={() => {
                    void (note.isArchived ? restoreNote(note.id) : archiveNote(note.id));
                    setShowActions(false);
                  }}
                />

                <NoteOptionRow
                  icon={note.isLocked ? "lock-open-outline" : "lock-closed-outline"}
                  iconColor="#F97316"
                  iconBackground="#FFF1DC"
                  title={note.isLocked ? "Retirer le verrou" : "Securiser la note"}
                  subtitle={containingFolder?.isLocked ? "Le dossier protege deja cette note" : "Demander un code a l'ouverture"}
                  onPress={() => void handleToggleNoteLock()}
                />

                <NoteOptionRow
                  icon="hand-left-outline"
                  iconColor={palette.navy}
                  iconBackground="#E9ECF3"
                  title="Changer l'icone"
                  subtitle="Modifier le style de la note"
                  expanded={showIconPicker}
                  onPress={() => {
                    setShowMovePicker(false);
                    setShowIconPicker((current) => !current);
                  }}
                />

                {showIconPicker ? (
                  <View style={{ gap: theme.spacing.sm, paddingLeft: 64, paddingBottom: 4 }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
                      {noteIconOptions.map((option) => {
                        const activeIconKey = note.iconKey ?? "auto";
                        const isActive = activeIconKey === option.key;

                        return (
                          <Pressable
                            key={option.key}
                            accessibilityLabel={`Icone ${option.label}`}
                            onPress={() => void handleSelectIcon(option.key)}
                            style={{
                              width: 58,
                              minHeight: 58,
                              borderRadius: 18,
                              backgroundColor: isActive ? "#0F1B3A" : palette.chip,
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Ionicons name={option.icon} size={18} color={isActive ? "#FFFFFF" : option.color} />
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                <NoteOptionRow
                  icon="folder-open-outline"
                  iconColor="#4F6EF7"
                  iconBackground="#E4ECFF"
                  title="Mettre dans un dossier"
                  subtitle={folders.find((folder) => folder.id === folderId)?.name ?? "Sans dossier"}
                  expanded={showMovePicker}
                  onPress={() => {
                    setShowIconPicker(false);
                    setShowMovePicker((current) => !current);
                  }}
                />

                {showMovePicker ? (
                  <View style={{ gap: theme.spacing.sm, paddingLeft: 64, paddingBottom: 4 }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
                      <Pressable
                        onPress={() => void handleMoveToFolder(null)}
                        style={{
                          paddingHorizontal: 14,
                          minHeight: 38,
                          borderRadius: 15,
                          backgroundColor: folderId === null ? "#0F1B3A" : palette.chip,
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
                            minHeight: 38,
                            borderRadius: 15,
                            backgroundColor: folderId === folder.id ? "#0F1B3A" : palette.chip,
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

                <NoteOptionRow
                  icon="trash-outline"
                  iconColor="#FF4E91"
                  iconBackground="#FFF0F7"
                  title="Supprimer"
                  subtitle="Envoyer dans la corbeille"
                  danger
                  onPress={() => {
                    setShowActions(false);
                    router.push({
                      pathname: "/notes/delete/[id]",
                      params: { id: note.id }
                    });
                  }}
                />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
              backgroundColor: palette.surface,
              borderRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 20,
              gap: theme.spacing.md,
              borderWidth: 1,
              borderColor: palette.border
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: palette.textMuted, letterSpacing: 2, textTransform: "uppercase" }
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
                  backgroundColor: palette.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="close" size={18} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
              {noteIconOptions.map((option) => {
                const activeIconKey = note.iconKey ?? "auto";
                const isActive = activeIconKey === option.key;

                return (
                  <Pressable
                    key={option.key}
                    accessibilityLabel={`Icone ${option.label}`}
                    onPress={() => void handleSelectIcon(option.key)}
                    style={{
                      width: 72,
                      minHeight: 72,
                      borderRadius: 18,
                      backgroundColor: isActive ? "#0F1B3A" : palette.chip,
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

      <LockCodeModal
        visible={noteLockModalMode !== null}
        title={noteLockModalMode === "unlock-remove" ? "Confirmer le code" : "Securiser la note"}
        description={noteLockModalMode === "unlock-remove" ? "Entre le code actuel pour retirer le verrou." : "Cree un code pour ouvrir cette note."}
        mode={noteLockModalMode === "unlock-remove" ? "unlock" : "create"}
        confirmLabel={noteLockModalMode === "unlock-remove" ? "Retirer" : "Securiser"}
        error={noteLockError}
        onCancel={() => {
          setNoteLockModalMode(null);
          setNoteLockError(null);
        }}
        onSubmit={(code) => {
          if (noteLockModalMode === "unlock-remove") {
            if (!verifyLockCode(code, note.lockCodeHash ?? settings.lockCodeHash)) {
              setNoteLockError("Code incorrect.");
              return;
            }

            void updateNote(note.id, { isLocked: false, lockCodeHash: null });
            setNoteLockModalMode(null);
            setNoteLockError(null);
            setShowActions(false);
            return;
          }

          void updateNote(note.id, { isLocked: true, lockCodeHash: hashLockCode(code) });
          setNoteLockModalMode(null);
          setNoteLockError(null);
          setShowActions(false);
        }}
      />
    </ScreenContainer>
  );
}
