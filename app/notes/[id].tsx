import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  GestureResponderEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { addDays, fromDateKey, toDateKey } from "@/lib/date";
import {
  buildNoteContentFromEntries,
  normalizeDailyEntries,
  upsertDailyEntry
} from "@/services/notes/dailyEntries";
import { getNoteIcon, noteIconOptions } from "@/services/notes/noteIcon";
import { useTheme } from "@/hooks/useTheme";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import type { NoteIconKey } from "@/types/models";

type ViewMode = "day" | "all";

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

const compactDisplayContent = (content: string) => content.replace(/\n{3,}/g, "\n\n").trim();

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
        <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: "#E6E7EC", paddingBottom: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  theme.typography.h3,
                  { color: danger ? "#FF3434" : "#0F1B3A", fontSize: 18, lineHeight: 23, fontWeight: "900" }
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text style={[theme.typography.body, { color: "#8D8F99", marginTop: 1 }]} numberOfLines={1}>
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
  const togglePinned = useNotesStore((state) => state.togglePinned);
  const [title, setTitle] = useState(note?.title ?? "");
  const [dayContent, setDayContent] = useState("");
  const [folderId, setFolderId] = useState<string | null>(note?.folderId ?? null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty">("saved");
  const [showActions, setShowActions] = useState(false);
  const [showMovePicker, setShowMovePicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey());
  const [allJumpDateKey, setAllJumpDateKey] = useState(toDateKey());
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const isFirstSync = useRef(true);
  const screenScrollRef = useRef<ScrollView | null>(null);
  const swipeStartX = useRef<number | null>(null);
  const allCardYRef = useRef(0);
  const allEntryYRef = useRef<Record<string, number>>({});
  const latestDraftRef = useRef({
    dateKey: selectedDateKey,
    content: dayContent,
    title,
    folderId
  });
  const noteId = note?.id;
  const todayKey = toDateKey();

  const entries = useMemo(() => (note ? normalizeDailyEntries(note) : []), [note]);
  const entryDates = useMemo(() => new Set(entries.map((entry) => entry.date)), [entries]);
  const otherEntries = useMemo(
    () => [...entries].filter((entry) => entry.date !== todayKey).reverse(),
    [entries, todayKey]
  );
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
  const allDateLabel =
    allJumpDateKey === todayKey
      ? "Auj."
      : allJumpDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const activeCalendarDateKey = viewMode === "all" ? allJumpDateKey : selectedDateKey;
  const selectedDateTitle =
    selectedDateKey === todayKey ? "Aujourd'hui" : entryDateFormatter.format(selectedDate);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const activeNoteIcon = note
    ? getNoteIcon(note)
    : noteIconOptions.find((option) => option.key === "document") ?? noteIconOptions[0];
  const saveStatus = useMemo(() => {
    if (saveState === "saving") {
      return {
        icon: "cloud-upload-outline" as keyof typeof Ionicons.glyphMap,
        color: "#2563EB",
        backgroundColor: "#DBEAFE",
        label: "Sauvegarde en cours"
      };
    }

    if (saveState === "dirty") {
      return {
        icon: "cloud-outline" as keyof typeof Ionicons.glyphMap,
        color: "#D97706",
        backgroundColor: "#FEF3C7",
        label: "Sauvegarde a venir"
      };
    }

    return {
      icon: "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap,
      color: "#059669",
      backgroundColor: "#D1FAE5",
      label: "Sauvegarde"
    };
  }, [saveState]);

  useEffect(() => {
    latestDraftRef.current = {
      dateKey: selectedDateKey,
      content: dayContent,
      title,
      folderId
    };
  }, [dayContent, folderId, selectedDateKey, title]);

  useEffect(() => {
    if (!noteId) {
      return;
    }

    const latestNote = useNotesStore.getState().notes.find((entry) => entry.id === noteId);

    if (!latestNote) {
      return;
    }

    const dailyEntries = normalizeDailyEntries(latestNote);

    setTitle(latestNote.title ?? "");
    setFolderId(latestNote.folderId ?? null);
    setSelectedDateKey(todayKey);
    setAllJumpDateKey(todayKey);
    setCalendarMonth(new Date(fromDateKey(todayKey).getFullYear(), fromDateKey(todayKey).getMonth(), 1));
    setDayContent(dailyEntries.find((entry) => entry.date === todayKey)?.content ?? "");
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

    const latestDraft = latestDraftRef.current;
    setSaveState("saving");
    await persistNoteChanges(
      latestDraft.dateKey,
      latestDraft.content,
      latestDraft.title,
      latestDraft.folderId
    );
    setSaveState("saved");
  }, [noteId, persistNoteChanges]);

  useEffect(() => {
    if (!noteId) {
      return;
    }

    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }

    setSaveState("dirty");

    const timeout = setTimeout(async () => {
      setSaveState("saving");
      await persistNoteChanges(selectedDateKey, dayContent, title, folderId);
      setSaveState("saved");
    }, 450);

    return () => clearTimeout(timeout);
  }, [dayContent, folderId, noteId, persistNoteChanges, selectedDateKey, title]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      void flushPendingSave().then(() => router.back());
      return true;
    });

    return () => {
      subscription.remove();
      void flushPendingSave();
    };
  }, [flushPendingSave]);

  const handleSwipeStart = (event: GestureResponderEvent) => {
    swipeStartX.current = event.nativeEvent.pageX;
  };

  const handleSwipeEnd = (event: GestureResponderEvent) => {
    if (swipeStartX.current === null) {
      return;
    }

    const distance = event.nativeEvent.pageX - swipeStartX.current;
    swipeStartX.current = null;

    if (Math.abs(distance) < 56) {
      return;
    }

    const nextDate = addDays(selectedDate, distance > 0 ? -7 : 7);
    void handleSelectDate(toDateKey(nextDate));
  };

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

  const handleMoveToFolder = async (nextFolderId: string | null) => {
    setFolderId(nextFolderId);
    await moveNote(note.id, nextFolderId);
    setShowMovePicker(false);
    setShowIconPicker(false);
    setShowFolderModal(false);
    setShowActions(false);
  };

  const handleSelectIcon = async (nextIconKey: NoteIconKey) => {
    await updateNote(note.id, {
      iconKey: nextIconKey === "auto" ? null : nextIconKey
    });
    setShowIconPicker(false);
    setShowIconModal(false);
  };

  const handleBack = async () => {
    await flushPendingSave();
    router.back();
  };

  const handleChangeMode = async (mode: ViewMode) => {
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
    const nextVisible = viewMode === "all" && event.nativeEvent.contentOffset.y > 360;
    setShowScrollTop((current) => (current === nextVisible ? current : nextVisible));
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
          backgroundColor: isActive ? "#0F1B3A" : "#FFFFFF",
          borderWidth: 1,
          borderColor: isActive ? "#0F1B3A" : "#ECE6E0",
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
      scrollEventThrottle={16}
      scrollBottomPadding={12}
      scrollRef={screenScrollRef}
      scrollable
    >
      <View style={{ gap: theme.spacing.lg, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable
            onPress={() => void handleBack()}
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
              accessibilityLabel={note.isPinned ? "Retirer l'epingle" : "Epingler la note"}
              onPress={() => void togglePinned(note.id)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: note.isPinned ? "#0F1B3A" : "#FFFFFF",
                borderWidth: 1,
                borderColor: note.isPinned ? "#0F1B3A" : "#ECE6E0",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name={note.isPinned ? "pin" : "pin-outline"} size={18} color={note.isPinned ? "#FFFFFF" : theme.colors.text} />
            </Pressable>

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
              setShowIconPicker(false);
              setShowIconModal(false);
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
            value={title}
            onChangeText={setTitle}
            placeholder="Titre"
            placeholderTextColor="#B8AA9A"
            multiline
            scrollEnabled={false}
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

          <View style={{ flexDirection: "row", gap: theme.spacing.sm, paddingTop: 2 }}>
            {renderModeButton("day", "Voir jour par jour", "calendar-outline")}
            {renderModeButton("all", "Voir toute la note", "reader-outline")}
          </View>
        </View>

        {viewMode === "day" ? (
          <View style={{ gap: 18 }} onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
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
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#F0ECE7",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="folder-outline" size={13} color="#0F1B3A" />
                <Text style={[theme.typography.label, { color: "#0F1B3A", fontSize: 14 }]} numberOfLines={1}>
                  {activeFolderLabel}
                </Text>
              </Pressable>

              <View
                accessibilityLabel={saveStatus.label}
                style={{
                  minHeight: 42,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#F0ECE7",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                <Ionicons name="cloud" size={14} color="#0F1B3A" />
                <Text style={[theme.typography.label, { color: "#0F1B3A", fontSize: 14 }]} numberOfLines={1}>
                  {saveState === "saving" ? "Sync..." : "Autosave"}
                </Text>
              </View>
            </View>

            <View
              style={{
                minHeight: 360,
                borderRadius: 28,
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 22,
                paddingTop: 22,
                paddingBottom: 20,
                borderWidth: 1,
                borderColor: "#F2EFEA"
              }}
            >
              <Text
                style={[
                  theme.typography.caption,
                  { color: "#7C4DFF", letterSpacing: 4, textTransform: "uppercase", marginBottom: 14 }
                ]}
              >
                {selectedDateTitle}
              </Text>
              <TextInput
                value={dayContent}
                onChangeText={setDayContent}
                placeholder={
                  selectedDateKey === todayKey
                    ? "Ecris quelque chose pour aujourd'hui..."
                    : "Ecris quelque chose pour cette date..."
                }
                placeholderTextColor="#B8B0A8"
                multiline
                scrollEnabled={false}
                textAlignVertical="top"
                style={[
                  theme.typography.body,
                  {
                    minHeight: 290,
                    color: "#203047",
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
                  {allDateLabel}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowFolderModal(true)}
                style={({ pressed }) => ({
                  minHeight: 42,
                  maxWidth: 120,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#F0ECE7",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="folder-outline" size={13} color="#0F1B3A" />
                <Text style={[theme.typography.label, { color: "#0F1B3A", fontSize: 14 }]} numberOfLines={1}>
                  {activeFolderLabel}
                </Text>
              </Pressable>

              <View
                accessibilityLabel={saveStatus.label}
                style={{
                  minHeight: 42,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#F0ECE7",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6
                }}
              >
                <Ionicons name="cloud" size={14} color="#0F1B3A" />
                <Text style={[theme.typography.label, { color: "#0F1B3A", fontSize: 14 }]} numberOfLines={1}>
                  {saveState === "saving" ? "Sync..." : "Autosave"}
                </Text>
              </View>
            </View>

            <View
              onLayout={(event) => {
                allCardYRef.current = event.nativeEvent.layout.y;
              }}
              style={{
                minHeight: otherEntries.length > 0 ? 480 : 260,
                borderRadius: 28,
                backgroundColor: "#FFFFFF",
                paddingHorizontal: 22,
                paddingTop: 26,
                paddingBottom: 22,
                borderWidth: 1,
                borderColor: "#F2EFEA"
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
                borderBottomColor: "#E8E3DF"
              }}
            >
              <Text
                style={[
                  theme.typography.caption,
                  {
                    color: "#A69F98",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    fontWeight: "900"
                  }
                ]}
              >
                {entryDateFormatter.format(fromDateKey(todayKey))}
              </Text>
              <TextInput
                value={dayContent}
                onChangeText={setDayContent}
                placeholder="Ecris quelque chose pour aujourd'hui..."
                placeholderTextColor="#B8B0A8"
                multiline
                scrollEnabled={false}
                textAlignVertical="top"
                style={[
                  theme.typography.body,
                  {
                    minHeight: otherEntries.length > 0 ? 180 : 190,
                    color: "#203047",
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
                  key={entry.id}
                  onLayout={(event) => {
                    allEntryYRef.current[entry.date] = event.nativeEvent.layout.y;
                  }}
                  style={{
                    gap: 14,
                    paddingTop: 18,
                    paddingBottom: isLastEntry ? 0 : 28,
                    borderBottomWidth: isLastEntry ? 0 : 1,
                    borderBottomColor: "#E8E3DF"
                  }}
                >
                  <Text
                    style={[
                      theme.typography.caption,
                      {
                        color: "#A69F98",
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        fontWeight: "900"
                      }
                    ]}
                  >
                    {entryDateFormatter.format(fromDateKey(entry.date))}
                  </Text>
                  <Text
                    style={[
                      theme.typography.body,
                      {
                        color: "#203047",
                        fontSize: 17,
                        lineHeight: 30
                      }
                    ]}
                  >
                    {compactDisplayContent(entry.content)}
                  </Text>
                </View>
              );
            })}
            </View>
          </View>
        )}
      </View>

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
              backgroundColor: "#FFFFFF",
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
                backgroundColor: "#C9CBD5"
              }}
            />

            <Text style={{ color: "#0F1B3A", fontSize: 27, lineHeight: 34, fontWeight: "900" }}>
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
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#F0ECE7",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="chevron-back" size={17} color="#0F1B3A" />
              </Pressable>

              <Text style={[theme.typography.h3, { color: "#0F1B3A", fontWeight: "900" }]}>
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
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#F0ECE7",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="chevron-forward" size={17} color="#0F1B3A" />
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
                        color: "#8D8F99",
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
                          backgroundColor: isSelected ? "#0F1B3A" : isToday ? "#F2F4FA" : "transparent",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Text
                          style={[
                            theme.typography.label,
                            {
                              color: isSelected ? "#FFFFFF" : isOutside ? "#C6C8D0" : "#0F1B3A",
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
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#F0ECE7",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={[theme.typography.label, { color: "#0F1B3A", fontSize: 15 }]}>
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
              backgroundColor: "#FFFFFF",
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
                backgroundColor: "#C9CBD5",
                marginBottom: 20
              }}
            />

            <Text style={{ color: "#0F1B3A", fontSize: 27, lineHeight: 34, fontWeight: "900", marginBottom: 18 }}>
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
                    backgroundColor: folderId === null ? "#0F1B3A" : "#F7F5F2",
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
                      backgroundColor: folderId === null ? "rgba(255,255,255,0.14)" : "#FFFFFF",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="folder-open-outline" size={16} color={folderId === null ? "#FFFFFF" : "#0F1B3A"} />
                  </View>
                  <Text style={[theme.typography.label, { color: folderId === null ? "#FFFFFF" : "#0F1B3A" }]}>
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
                        backgroundColor: isActive ? "#0F1B3A" : "#F7F5F2",
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
                          backgroundColor: isActive ? "rgba(255,255,255,0.14)" : "#FFFFFF",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name="folder-outline" size={16} color={isActive ? "#FFFFFF" : "#0F1B3A"} />
                      </View>
                      <Text style={[theme.typography.label, { color: isActive ? "#FFFFFF" : "#0F1B3A" }]}>
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
              backgroundColor: "#FFFFFF",
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
                backgroundColor: "#C9CBD5",
                marginBottom: 20
              }}
            />

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={{ color: "#0F1B3A", fontSize: 27, lineHeight: 34, fontWeight: "900", marginBottom: 24 }}>
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
                  icon="hand-left-outline"
                  iconColor="#0F1B3A"
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
                              backgroundColor: isActive ? "#0F1B3A" : "#F3F0EC",
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
                            minHeight: 38,
                            borderRadius: 15,
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
