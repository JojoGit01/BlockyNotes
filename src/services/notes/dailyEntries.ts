import { nowIso, toDateKey } from "@/lib/date";
import { createId } from "@/lib/id";
import type { Note, NoteDailyEntry } from "@/types/models";

export const sortDailyEntries = (entries: NoteDailyEntry[]) =>
  [...entries].sort((first, second) => first.date.localeCompare(second.date));

export const buildNoteContentFromEntries = (entries: NoteDailyEntry[]) =>
  sortDailyEntries(entries)
    .map((entry) => entry.content.trim())
    .filter(Boolean)
    .join("\n\n");

export const normalizeDailyEntries = (note: Note) => {
  if (note.noteMode === "free") {
    return note.dailyEntries ?? [];
  }

  const entries = note.dailyEntries ?? [];

  if (entries.length > 0) {
    return sortDailyEntries(entries).filter((entry) => entry.content.trim().length > 0);
  }

  if (!note.content.trim()) {
    return [];
  }

  const timestamp = note.createdAt || nowIso();

  return [
    {
      id: createId("entry"),
      date: toDateKey(timestamp),
      content: note.content,
      createdAt: timestamp,
      updatedAt: note.updatedAt || timestamp
    }
  ];
};

export const normalizeNoteDailyEntries = (note: Note): Note => {
  if (note.noteMode === "free") {
    return {
      ...note,
      dailyEntries: note.dailyEntries ?? []
    };
  }

  const dailyEntries = normalizeDailyEntries(note);

  return {
    ...note,
    noteMode: note.noteMode ?? "day",
    dailyEntries,
    content: buildNoteContentFromEntries(dailyEntries)
  };
};

export const upsertDailyEntry = (
  entries: NoteDailyEntry[],
  date: string,
  content: string
) => {
  const trimmedContent = content.trim();
  const existingEntry = entries.find((entry) => entry.date === date);

  if (!trimmedContent) {
    return sortDailyEntries(entries.filter((entry) => entry.date !== date));
  }

  const timestamp = nowIso();

  if (!existingEntry) {
    return sortDailyEntries([
      ...entries,
      {
        id: createId("entry"),
        date,
        content,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]);
  }

  return sortDailyEntries(
    entries.map((entry) =>
      entry.date === date
        ? {
            ...entry,
            content,
            updatedAt: timestamp
          }
        : entry
    )
  );
};
