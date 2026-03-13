import { nowIso } from "@/lib/date";
import type { Note } from "@/types/models";

export const updateNoteService = (note: Note, updates: Partial<Note>): Note => ({
  ...note,
  ...updates,
  updatedAt: nowIso()
});
