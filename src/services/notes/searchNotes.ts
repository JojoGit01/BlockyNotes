/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        searchNotes.ts
 * @description Filters notes against normalized titles, content, and source links.
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
import type { Note } from "@/types/models";

export const searchNotesService = (notes: Note[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return notes;
  }

  return notes.filter((note) => {
    const haystack = `${note.title} ${note.content} ${note.sourceUrl ?? ""}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
};
