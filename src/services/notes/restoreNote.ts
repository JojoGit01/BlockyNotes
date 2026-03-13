import { nowIso } from "@/lib/date";
import type { Note } from "@/types/models";

export const restoreNoteService = (note: Note): Note => ({
  ...note,
  isDeleted: false,
  isArchived: false,
  deletedAt: null,
  updatedAt: nowIso()
});
