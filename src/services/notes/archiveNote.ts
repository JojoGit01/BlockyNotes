/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        archiveNote.ts
 * @description Applies the archive transition to a note.
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

export const archiveNoteService = (note: Note): Note => ({
  ...note,
  isArchived: true,
  updatedAt: nowIso()
});
