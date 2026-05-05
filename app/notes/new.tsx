import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { addDays, fromDateKey, toDateKey } from "@/lib/date";
import { useTheme } from "@/hooks/useTheme";
import { buildNoteContentFromEntries, upsertDailyEntry } from "@/services/notes/dailyEntries";
import { getNoteIcon, noteIconOptions } from "@/services/notes/noteIcon";
import { noteTemplates } from "@/services/notes/noteTemplates";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import type { Note, NoteDailyEntry, NoteIconKey } from "@/types/models";

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

export default function NewNoteScreen() {
  const { folderId: folderIdParam } = useLocalSearchParams<{ folderId?: string }>();
  const theme = useTheme();
  const folders = useFoldersStore((state) => state.folders);
  const createNote = useNotesStore((state) => state.createNote);
  const deleteNote = useNotesStore((state) => state.deleteNote);
  const updateNote = useNotesStore((state) => state.updateNote);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [iconKey, setIconKey] = useState<NoteIconKey>("auto");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [entries, setEntries] = useState<NoteDailyEntry[]>([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("blank");
  const [showActions, setShowActions] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty">("saving");
  const [selectedDateKey, setSelectedDateKey] = useState(toDateKey());
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const didCreateNote = useRef(false);
  const latestEntriesRef = useRef<NoteDailyEntry[]>([]);
  const todayKey = toDateKey();
  const [folderId, setFolderId] = useState<string | null>(
    folderIdParam && folderIdParam !== "personal" ? folderIdParam : null
  );

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
  const entryDates = useMemo(() => new Set(entries.map((entry) => entry.date)), [entries]);
  const otherEntries = useMemo(
    () => [...entries].filter((entry) => entry.date !== todayKey).reverse(),
    [entries, todayKey]
  );
  const selectedDate = useMemo(() => fromDateKey(selectedDateKey), [selectedDateKey]);
  const selectedDateLabel =
    selectedDateKey === todayKey
      ? "Auj."
      : selectedDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  const selectedDateTitle =
    selectedDateKey === todayKey ? "Aujourd'hui" : entryDateFormatter.format(selectedDate);
  const calendarDays = useMemo(() => {
    const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const mondayOffset = (monthStart.getDay() + 6) % 7;
    const gridStart = addDays(monthStart, -mondayOffset);

    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }, [calendarMonth]);

  const activeFolderLabel = useMemo(() => {
    if (folderId === null) {
      return "Perso";
    }

    return folders.find((folder) => folder.id === folderId)?.name ?? "Perso";
  }, [folderId, folders]);

  useEffect(() => {
    if (didCreateNote.current) {
      return;
    }

    didCreateNote.current = true;

    void createNote({
      title: "",
      content: "",
      iconKey: null,
      folderId
    }).then((note) => {
      setNoteId(note.id);
      setSaveState("saved");
    });
  }, [createNote, folderId]);

  useEffect(() => {
    if (!noteId) {
      return;
    }

    setSaveState("dirty");

    const timeout = setTimeout(async () => {
      setSaveState("saving");
      const dailyEntries = upsertDailyEntry(latestEntriesRef.current, selectedDateKey, content);
      latestEntriesRef.current = dailyEntries;
      setEntries(dailyEntries);

      await updateNote(noteId, {
        title: title.trim(),
        content: buildNoteContentFromEntries(dailyEntries),
        dailyEntries,
        iconKey: iconKey === "auto" ? null : iconKey,
        isFavorite,
        isPinned,
        folderId
      });

      setSaveState("saved");
    }, 350);

    return () => clearTimeout(timeout);
  }, [content, folderId, iconKey, isFavorite, isPinned, noteId, selectedDateKey, title, updateNote]);

  const persistDraftDate = useCallback(
    async (dateKey: string, text: string) => {
      if (!noteId) {
        return;
      }

      setSaveState("saving");
      const dailyEntries = upsertDailyEntry(latestEntriesRef.current, dateKey, text);
      latestEntriesRef.current = dailyEntries;
      setEntries(dailyEntries);

      await updateNote(noteId, {
        title: title.trim(),
        content: buildNoteContentFromEntries(dailyEntries),
        dailyEntries,
        iconKey: iconKey === "auto" ? null : iconKey,
        isFavorite,
        isPinned,
        folderId
      });

      setSaveState("saved");
    },
    [folderId, iconKey, isFavorite, isPinned, noteId, title, updateNote]
  );

  const handleSelectDate = async (dateKey: string) => {
    if (dateKey === selectedDateKey) {
      return;
    }

    await persistDraftDate(selectedDateKey, content);
    const nextContent = latestEntriesRef.current.find((entry) => entry.date === dateKey)?.content ?? "";

    setSelectedDateKey(dateKey);
    setContent(nextContent);
    setSaveState("saved");
  };

  const handleOpenDateModal = () => {
    const activeDate = fromDateKey(selectedDateKey);
    setCalendarMonth(new Date(activeDate.getFullYear(), activeDate.getMonth(), 1));
    setShowDateModal(true);
  };

  const handleSelectCalendarDate = async (date: Date) => {
    const dateKey = toDateKey(date);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    await handleSelectDate(dateKey);
  };

  const handleChangeMode = async (mode: ViewMode) => {
    if (mode === viewMode) {
      return;
    }

    await persistDraftDate(selectedDateKey, content);
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

  const applyTemplate = (templateKey: string) => {
    const template = noteTemplates.find((entry) => entry.key === templateKey);

    if (!template) {
      return;
    }

    setSelectedTemplateKey(template.key);
    setTitle(template.title);
    setIconKey(template.iconKey);
    setContent(template.content);
    latestEntriesRef.current = upsertDailyEntry(latestEntriesRef.current, selectedDateKey, template.content);
    setEntries(latestEntriesRef.current);
    setShowTemplateModal(false);
    setShowActions(false);
  };

  const handleDeleteDraft = async () => {
    if (noteId) {
      await deleteNote(noteId);
    }

    setShowActions(false);
    router.back();
  };

  const calendarMonthLabel = calendarMonthFormatter.format(calendarMonth);
  const formattedCalendarMonth = `${calendarMonthLabel.charAt(0).toUpperCase()}${calendarMonthLabel.slice(1)}`;

  return (
    <ScreenContainer scrollable scrollBottomPadding={12}>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 12 }}>
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
              accessibilityLabel={isPinned ? "Retirer l'epingle" : "Epingler la note"}
              onPress={() => setIsPinned((current) => !current)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                backgroundColor: isPinned ? "#0F1B3A" : "#FFFFFF",
                borderWidth: 1,
                borderColor: isPinned ? "#0F1B3A" : "#ECE6E0",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name={isPinned ? "pin" : "pin-outline"} size={18} color={isPinned ? "#FFFFFF" : theme.colors.text} />
            </Pressable>

            <Pressable
              accessibilityLabel={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              onPress={() => setIsFavorite((current) => !current)}
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
              <Ionicons name={isFavorite ? "star" : "star-outline"} size={18} color={isFavorite ? "#E11D48" : theme.colors.text} />
            </Pressable>

            <Pressable
              accessibilityLabel="Options"
              onPress={() => setShowActions(true)}
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

        <View>
          <Text style={[theme.typography.caption, { color: "#7C4DFF", letterSpacing: 4, textTransform: "uppercase" }]}>
            Note
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => setShowIconModal(true)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: activeIcon.backgroundColor,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={activeIcon.icon} size={24} color={activeIcon.color} />
          </Pressable>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Nouvelle note"
            placeholderTextColor="#B8B0A8"
            multiline
            scrollEnabled={false}
            style={[
              theme.typography.h1,
              {
                flex: 1,
                fontSize: 30,
                lineHeight: 34,
                color: theme.colors.text,
                paddingVertical: 0
              }
            ]}
          />

          <View style={{ flexDirection: "row", gap: theme.spacing.sm, paddingTop: 2 }}>
            {renderModeButton("day", "Voir jour par jour", "calendar-outline")}
            {renderModeButton("all", "Voir toute la note", "reader-outline")}
          </View>
        </View>

        <Pressable
          onPress={() => setShowTemplateModal(true)}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            minHeight: 42,
            paddingHorizontal: 14,
            borderRadius: 14,
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#F0ECE7",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            opacity: pressed ? 0.82 : 1
          })}
        >
          <Ionicons name="albums-outline" size={14} color="#0F1B3A" />
          <Text style={[theme.typography.label, { color: "#0F1B3A", fontSize: 14 }]} numberOfLines={1}>
            Template
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable
            onPress={handleOpenDateModal}
            style={{
              minHeight: 42,
              paddingHorizontal: 14,
              borderRadius: 14,
              backgroundColor: "#0F1B3A",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6
            }}
          >
            <Ionicons name="calendar" size={13} color="#FFFFFF" />
            <Text style={[theme.typography.label, { color: "#FFFFFF", fontSize: 14 }]}>{selectedDateLabel}</Text>
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

        {viewMode === "day" ? (
          <View
            style={{
              minHeight: 420,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 22,
              paddingTop: 28,
              paddingBottom: 20,
              borderWidth: 1,
              borderColor: "#F2EFEA"
            }}
          >
            <Text
              style={[
                theme.typography.caption,
                { color: "#7C4DFF", letterSpacing: 4, textTransform: "uppercase", fontWeight: "900", marginBottom: 20 }
              ]}
            >
              {selectedDateTitle}
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
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
                  minHeight: 330,
                  color: "#203047",
                  fontSize: 17,
                  lineHeight: 32,
                  paddingVertical: 0
                }
              ]}
            />
          </View>
        ) : (
          <View
            style={{
              minHeight: otherEntries.length > 0 ? 420 : 260,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              paddingHorizontal: 22,
              paddingTop: 28,
              paddingBottom: 20,
              borderWidth: 1,
              borderColor: "#F2EFEA"
            }}
          >
            <View
              style={{
                gap: 14,
                paddingBottom: otherEntries.length > 0 ? 26 : 0,
                borderBottomWidth: otherEntries.length > 0 ? 1 : 0,
                borderBottomColor: "#E8E3DF"
              }}
            >
              <Text
                style={[
                  theme.typography.caption,
                  { color: "#A69F98", letterSpacing: 2, textTransform: "uppercase", fontWeight: "900" }
                ]}
              >
                {entryDateFormatter.format(fromDateKey(todayKey))}
              </Text>
              <TextInput
                value={selectedDateKey === todayKey ? content : latestEntriesRef.current.find((entry) => entry.date === todayKey)?.content ?? ""}
                onChangeText={(nextContent) => {
                  setSelectedDateKey(todayKey);
                  setContent(nextContent);
                }}
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
                    lineHeight: 32,
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
                  style={{
                    gap: 14,
                    paddingTop: 18,
                    paddingBottom: isLastEntry ? 0 : 26,
                    borderBottomWidth: isLastEntry ? 0 : 1,
                    borderBottomColor: "#E8E3DF"
                  }}
                >
                  <Text
                    style={[
                      theme.typography.caption,
                      { color: "#A69F98", letterSpacing: 2, textTransform: "uppercase", fontWeight: "900" }
                    ]}
                  >
                    {entryDateFormatter.format(fromDateKey(entry.date))}
                  </Text>
                  <Text style={[theme.typography.body, { color: "#203047", fontSize: 17, lineHeight: 30 }]}>
                    {entry.content.trim()}
                  </Text>
                </View>
              );
            })}
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
                onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
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
                onPress={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
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
                  const isSelected = dateKey === selectedDateKey;
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

      <Modal visible={showActions} transparent animationType="slide" onRequestClose={() => setShowActions(false)}>
        <Pressable
          onPress={() => setShowActions(false)}
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
              paddingBottom: 28
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

            <Text style={{ color: "#0F1B3A", fontSize: 27, lineHeight: 34, fontWeight: "900", marginBottom: 22 }}>
              Options de note
            </Text>

            <View style={{ gap: 14 }}>
              <Pressable
                onPress={() => {
                  setShowActions(false);
                  setShowTemplateModal(true);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 17,
                      backgroundColor: "#EAF0FF",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="albums-outline" size={21} color="#0F1B3A" />
                  </View>
                  <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: "#E6E7EC", paddingBottom: 14 }}>
                    <Text style={[theme.typography.h3, { color: "#0F1B3A", fontSize: 18, lineHeight: 23, fontWeight: "900" }]}>
                      Templates
                    </Text>
                    <Text style={[theme.typography.body, { color: "#8D8F99", marginTop: 1 }]} numberOfLines={1}>
                      Commencer avec une structure
                    </Text>
                  </View>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowActions(false);
                  setShowIconModal(true);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 17,
                      backgroundColor: "#E9ECF3",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="hand-left-outline" size={21} color="#0F1B3A" />
                  </View>
                  <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: "#E6E7EC", paddingBottom: 14 }}>
                    <Text style={[theme.typography.h3, { color: "#0F1B3A", fontSize: 18, lineHeight: 23, fontWeight: "900" }]}>
                      {"Changer l'icone"}
                    </Text>
                    <Text style={[theme.typography.body, { color: "#8D8F99", marginTop: 1 }]} numberOfLines={1}>
                      Modifier le style de la note
                    </Text>
                  </View>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setShowActions(false);
                  setShowFolderModal(true);
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 17,
                      backgroundColor: "#E4ECFF",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="folder-open-outline" size={21} color="#4F6EF7" />
                  </View>
                  <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: "#E6E7EC", paddingBottom: 14 }}>
                    <Text style={[theme.typography.h3, { color: "#0F1B3A", fontSize: 18, lineHeight: 23, fontWeight: "900" }]}>
                      Mettre dans un dossier
                    </Text>
                    <Text style={[theme.typography.body, { color: "#8D8F99", marginTop: 1 }]} numberOfLines={1}>
                      {activeFolderLabel}
                    </Text>
                  </View>
                </View>
              </Pressable>

              <Pressable onPress={() => void handleDeleteDraft()} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 17,
                      backgroundColor: "#FFF0F7",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="trash-outline" size={21} color="#FF4E91" />
                  </View>
                  <View style={{ flex: 1, paddingBottom: 14 }}>
                    <Text style={[theme.typography.h3, { color: "#FF3434", fontSize: 18, lineHeight: 23, fontWeight: "900" }]}>
                      Supprimer
                    </Text>
                    <Text style={[theme.typography.body, { color: "#8D8F99", marginTop: 1 }]} numberOfLines={1}>
                      Envoyer dans la corbeille
                    </Text>
                  </View>
                </View>
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
                  onPress={() => {
                    setFolderId(null);
                    setShowFolderModal(false);
                  }}
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
                      onPress={() => {
                        setFolderId(folder.id);
                        setShowFolderModal(false);
                      }}
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

      <Modal visible={showTemplateModal} transparent animationType="slide" onRequestClose={() => setShowTemplateModal(false)}>
        <Pressable
          onPress={() => setShowTemplateModal(false)}
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
              Templates
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={{ gap: 10 }}>
                {noteTemplates.map((template) => {
                  const isActive = selectedTemplateKey === template.key;
                  const templateIcon =
                    template.iconKey === "auto"
                      ? "document-text-outline"
                      : noteIconOptions.find((option) => option.key === template.iconKey)?.icon ?? "document-text-outline";

                  return (
                    <Pressable
                      key={template.key}
                      onPress={() => applyTemplate(template.key)}
                      style={({ pressed }) => ({
                        minHeight: 62,
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
                          width: 38,
                          height: 38,
                          borderRadius: 14,
                          backgroundColor: isActive ? "rgba(255,255,255,0.14)" : "#FFFFFF",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name={templateIcon} size={17} color={isActive ? "#FFFFFF" : "#0F1B3A"} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.typography.label, { color: isActive ? "#FFFFFF" : "#0F1B3A" }]}>
                          {template.label}
                        </Text>
                        <Text
                          style={[theme.typography.caption, { color: isActive ? "rgba(255,255,255,0.74)" : "#8D8F99", marginTop: 2 }]}
                          numberOfLines={1}
                        >
                          {template.title || "Note vide"}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
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
