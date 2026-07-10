/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        sort.ts
 * @description Provides deterministic note sorting strategies.
 *
 * @project     BlockyNotes
 * @module      Core / Utilities
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
import type { Note, SortOrder } from "@/types/models";

export const sortNotes = (notes: Note[], sortOrder: SortOrder) => {
  const sorted = [...notes];

  sorted.sort((a, b) => {
    if (sortOrder === "updatedAt-desc") {
      return b.updatedAt.localeCompare(a.updatedAt);
    }

    if (sortOrder === "updatedAt-asc") {
      return a.updatedAt.localeCompare(b.updatedAt);
    }

    return a.title.localeCompare(b.title);
  });

  return sorted;
};
