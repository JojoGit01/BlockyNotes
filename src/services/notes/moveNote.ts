import { nowIso } from "@/lib/date";
import type { Note } from "@/types/models";

export const moveNoteService = (note: Note, folderId: string | null): Note => ({
  ...note,
  folderId,
  updatedAt: nowIso()
});
