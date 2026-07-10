/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        useUIStore.ts
 * @description Manages transient search, filtering, and selection interface state.
 *
 * @project     BlockyNotes
 * @module      State Management
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
import { create } from "zustand";

import type { UIState } from "@/types/store";

export const useUIStore = create<UIState>((set) => ({
  searchQuery: "",
  selectedFolderId: null,
  showArchived: false,
  showDeleted: false,
  selectedNoteIds: [],
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedFolder: (folderId) => set({ selectedFolderId: folderId }),
  toggleShowArchived: () => set((state) => ({ showArchived: !state.showArchived })),
  toggleShowDeleted: () => set((state) => ({ showDeleted: !state.showDeleted })),
  toggleNoteSelection: (noteId) =>
    set((state) => ({
      selectedNoteIds: state.selectedNoteIds.includes(noteId)
        ? state.selectedNoteIds.filter((id) => id !== noteId)
        : [...state.selectedNoteIds, noteId]
    })),
  clearSelection: () => set({ selectedNoteIds: [] })
}));
