import { nowIso, toDateKey } from "@/lib/date";
import { createId } from "@/lib/id";
import { buildNoteContentFromEntries } from "@/services/notes/dailyEntries";
import type { Note } from "@/types/models";

export const createNoteService = (
  input: Partial<Note> & Pick<Note, "title" | "content">
): Note => {
  const timestamp = nowIso();
  const dailyEntries =
    input.dailyEntries ??
    (input.content.trim()
      ? [
          {
            id: createId("entry"),
            date: toDateKey(timestamp),
            content: input.content,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        ]
      : []);

  return {
    id: createId("note"),
    title: input.title.trim(),
    content: buildNoteContentFromEntries(dailyEntries),
    dailyEntries,
    folderId: input.folderId ?? null,
    tagIds: input.tagIds ?? [],
    isFavorite: input.isFavorite ?? false,
    isPinned: input.isPinned ?? false,
    isLocked: input.isLocked ?? false,
    lockCodeHash: input.lockCodeHash ?? null,
    isArchived: false,
    isDeleted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null
  };
};
