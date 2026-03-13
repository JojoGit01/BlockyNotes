import { nowIso } from "@/lib/date";
import type { Note } from "@/types/models";

export const deleteNoteService = (note: Note): Note => {
  const timestamp = nowIso();

  return {
    ...note,
    isDeleted: true,
    deletedAt: timestamp,
    updatedAt: timestamp
  };
};
