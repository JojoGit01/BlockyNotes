/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        deleteNote.ts
 * @description Applies the soft-delete transition to a note.
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
