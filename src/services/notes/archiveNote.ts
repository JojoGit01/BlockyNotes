import { nowIso } from "@/lib/date";
import type { Note } from "@/types/models";

export const archiveNoteService = (note: Note): Note => ({
  ...note,
  isArchived: true,
  updatedAt: nowIso()
});
