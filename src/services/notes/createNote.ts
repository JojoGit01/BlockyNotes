import { nowIso } from "@/lib/date";
import { createId } from "@/lib/id";
import type { Note } from "@/types/models";

export const createNoteService = (
  input: Partial<Note> & Pick<Note, "title" | "content">
): Note => {
  const timestamp = nowIso();

  return {
    id: createId("note"),
    title: input.title.trim(),
    content: input.content,
    folderId: input.folderId ?? null,
    tagIds: input.tagIds ?? [],
    isFavorite: input.isFavorite ?? false,
    isArchived: false,
    isDeleted: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null
  };
};
