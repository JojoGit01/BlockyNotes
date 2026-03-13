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
