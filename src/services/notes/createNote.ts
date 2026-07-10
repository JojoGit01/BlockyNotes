/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        createNote.ts
 * @description Creates normalized free-form or daily note entities.
 *
 * @project     BlockyNotes
 * @module      Services / Notes
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-03-13
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
import { nowIso, toDateKey } from "@/lib/date";
import { createId } from "@/lib/id";
import { buildNoteContentFromEntries } from "@/services/notes/dailyEntries";
import type { Note } from "@/types/models";

export const createNoteService = (
  input: Partial<Note> & Pick<Note, "title" | "content">
): Note => {
  const timestamp = nowIso();
  const noteMode = input.noteMode ?? "day";
  const dailyEntries =
    noteMode === "free"
      ? []
      : input.dailyEntries ??
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
    content: noteMode === "free" ? input.content : buildNoteContentFromEntries(dailyEntries),
    noteMode,
    dailyEntries,
    folderId: input.folderId ?? null,
    tagIds: input.tagIds ?? [],
    isInbox: input.isInbox ?? false,
    sourceUrl: input.sourceUrl?.trim() || null,
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
