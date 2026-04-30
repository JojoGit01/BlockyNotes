import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  GestureResponderEvent,
  Modal,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { addDays, fromDateKey, getWeekDays, toDateKey } from "@/lib/date";
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

const compactDisplayContent = (content: string) => content.replace(/\n{3,}/g, "\n\n").trim();

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
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey());
  const isFirstSync = useRef(true);
  const swipeStartX = useRef<number | null>(null);
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
  const weekDays = useMemo(() => getWeekDays(selectedDateKey), [selectedDateKey]);
  const selectedDate = useMemo(() => fromDateKey(selectedDateKey), [selectedDateKey]);
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
    setDayContent(dailyEntries.find((entry) => entry.date === todayKey)?.content ?? "");
    setSaveState("saved");
    isFirstSync.current = true;
  }, [noteId]);

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
      setDayContent(latestEntries.find((entry) => entry.date === todayKey)?.content ?? "");
      setSaveState("saved");
    }

    setViewMode(mode);
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

  return (
    <ScreenContainer scrollable>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 96 }}>
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
              { color: "#B8AA9A", letterSpacing: 3, textTransform: "uppercase" }
            ]}
          >
            Note
          </Text>
          <View
            accessibilityLabel={saveStatus.label}
            style={{
              width: 30,
              height: 30,
              borderRadius: 12,
              backgroundColor: saveStatus.backgroundColor,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={saveStatus.icon} size={16} color={saveStatus.color} />
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: theme.spacing.md }}>
          <Pressable
            accessibilityLabel="Changer l'icone de la note"
            onPress={() => setShowIconModal(true)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 16,
              backgroundColor: activeNoteIcon.backgroundColor,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={activeNoteIcon.icon} size={20} color={activeNoteIcon.color} />
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
                fontSize: 28,
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
          <View style={{ gap: theme.spacing.md }}>
            <View
              onTouchStart={handleSwipeStart}
              onTouchEnd={handleSwipeEnd}
              style={{
                gap: theme.spacing.md
              }}
            >
              <View style={{ flexDirection: "row", gap: 6 }}>
                  {weekDays.map((day, index) => {
                    const dateKey = toDateKey(day);
                    const isSelected = dateKey === selectedDateKey;
                    const hasEntry = entryDates.has(dateKey);
                    const isToday = dateKey === todayKey;

                    return (
                      <Pressable
                        key={dateKey}
                        onPress={() => void handleSelectDate(dateKey)}
                        style={{
                          flex: 1,
                          minHeight: 62,
                          borderRadius: 18,
                          backgroundColor: isSelected ? "#0F1B3A" : isToday ? "#F7F4F1" : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 3,
                          borderWidth: isSelected || isToday ? 0 : 1,
                          borderColor: "#F1E8E2"
                        }}
                      >
                        <Text
                          style={[
                            theme.typography.caption,
                            { color: isSelected ? "#FFFFFF" : "#A39486", fontSize: 10 }
                          ]}
                        >
                          {dayLabels[index]}
                        </Text>
                        <Text
                          style={[
                            theme.typography.label,
                            { color: isSelected ? "#FFFFFF" : theme.colors.text }
                          ]}
                        >
                          {day.getDate()}
                        </Text>
                        <View
                          style={{
                            width: hasEntry ? 12 : 4,
                            height: 4,
                            borderRadius: 3,
                            backgroundColor: hasEntry ? (isSelected ? "#FFFFFF" : "#10B981") : "rgba(15,27,58,0.08)"
                          }}
                        />
                      </Pressable>
                    );
                  })}
              </View>
            </View>

            <View
              style={{
                paddingTop: theme.spacing.xs
              }}
            >
              <Text style={[theme.typography.caption, { color: "#B8AA9A", marginBottom: theme.spacing.sm }]}>
                {entryDateFormatter.format(selectedDate)}
              </Text>
              <TextInput
                value={dayContent}
                onChangeText={setDayContent}
                placeholder="Ecris ce que tu veux garder pour ce jour..."
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
        ) : (
          <View style={{ gap: theme.spacing.md }}>
            <View style={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.lg, borderBottomWidth: otherEntries.length > 0 ? 1 : 0, borderBottomColor: "#F1E8E2" }}>
              <Text style={[theme.typography.caption, { color: "#B8AA9A", textTransform: "uppercase" }]}>
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
                    minHeight: dayContent.trim() ? 90 : 140,
                    color: "#203047",
                    lineHeight: 30,
                    paddingVertical: 0
                  }
                ]}
              />
            </View>

            {otherEntries.length === 0 ? (
              <View style={{ paddingTop: theme.spacing.xs }}>
                <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
                  Les prochains jours apparaitront ici a la suite.
                </Text>
              </View>
            ) : (
              <View
                style={{
                  gap: theme.spacing.lg
                }}
              >
                {otherEntries.map((entry, index, allEntries) => {
                  const isLastEntry = index === allEntries.length - 1;

                  return (
                    <View
                      key={entry.id}
                      style={{
                        gap: theme.spacing.sm,
                        paddingBottom: isLastEntry ? 0 : theme.spacing.lg,
                        borderBottomWidth: isLastEntry ? 0 : 1,
                        borderBottomColor: "#F1E8E2"
                      }}
                    >
                      <Text style={[theme.typography.caption, { color: "#B8AA9A", textTransform: "uppercase" }]}>
                        {entryDateFormatter.format(fromDateKey(entry.date))}
                      </Text>
                      <Text style={[theme.typography.body, { color: "#203047", lineHeight: 22 }]}>
                        {compactDisplayContent(entry.content)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </View>

      <Modal visible={showActions} transparent animationType="fade" onRequestClose={() => setShowActions(false)}>
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
                  setShowIconPicker(false);
                  setShowIconModal(false);
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
                  void togglePinned(note.id);
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
                      name={note.isPinned ? "pin" : "pin-outline"}
                      size={16}
                      color={theme.colors.text}
                    />
                  </View>
                  <Text style={[theme.typography.label, { color: theme.colors.text }]}>
                    {note.isPinned ? "Retirer l'epingle" : "Epingler la note"}
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
                onPress={() => {
                  setShowMovePicker(false);
                  setShowIconPicker((current) => !current);
                }}
                style={{
                  minHeight: 52,
                  borderRadius: 18,
                  backgroundColor: showIconPicker ? "#EEE8FF" : "#F7F4F1",
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
                    <Ionicons name="hand-left-outline" size={16} color={theme.colors.text} />
                  </View>
                  <Text style={[theme.typography.label, { color: theme.colors.text }]}>
                    Changer l'icone
                  </Text>
                </View>
                <Ionicons name={showIconPicker ? "chevron-up" : "chevron-forward"} size={16} color="#A39486" />
              </Pressable>

              {showIconPicker ? (
                <View style={{ gap: theme.spacing.sm, paddingTop: theme.spacing.xs }}>
                  <Text
                    style={[
                      theme.typography.caption,
                      { color: "#B8AA9A", textTransform: "uppercase", letterSpacing: 2 }
                    ]}
                  >
                    Icone
                  </Text>
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
                            minHeight: 68,
                            borderRadius: 18,
                            backgroundColor: isActive ? "#0F1B3A" : "#F3F0EC",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6
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
                </View>
              ) : null}

              <Pressable
                onPress={() => {
                  setShowIconPicker(false);
                  setShowMovePicker((current) => !current);
                }}
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
                <View style={{ gap: theme.spacing.sm, paddingTop: theme.spacing.xs }}>
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
