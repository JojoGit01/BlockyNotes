import { create } from "zustand";

import { sortNotes } from "@/lib/sort";
import { archiveNoteService } from "@/services/notes/archiveNote";
import { createNoteService } from "@/services/notes/createNote";
import { normalizeNoteDailyEntries } from "@/services/notes/dailyEntries";
import { deleteNoteService } from "@/services/notes/deleteNote";
import { moveNoteService } from "@/services/notes/moveNote";
import { restoreNoteService } from "@/services/notes/restoreNote";
import { searchNotesService } from "@/services/notes/searchNotes";
import { updateNoteService } from "@/services/notes/updateNote";
import { notesRepository, tagsRepository } from "@/storage/repositories";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUIStore } from "@/store/useUIStore";
import type { NotesState } from "@/types/store";

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  tags: [],
  hydrated: false,
  loadNotes: async () => {
    const [storedNotes, tags] = await Promise.all([notesRepository.read(), tagsRepository.read()]);
    const notes = storedNotes.map(normalizeNoteDailyEntries);
    const migrated = storedNotes.some(
      (note, index) => note.dailyEntries === undefined || note.content !== notes[index]?.content
    );

    if (migrated) {
      await notesRepository.write(notes);
    }

    set({ notes, tags, hydrated: true });
  },
  createNote: async (input) => {
    const note = createNoteService(input);
    const notes = [note, ...get().notes];
    await notesRepository.write(notes);
    set({ notes });
    return note;
  },
  updateNote: async (noteId, updates) => {
    const notes = get().notes.map((note) =>
      note.id === noteId ? updateNoteService(note, updates) : note
    );
    await notesRepository.write(notes);
    set({ notes });
  },
  deleteNote: async (noteId) => {
    const notes = get().notes.map((note) =>
      note.id === noteId ? deleteNoteService(note) : note
    );
    await notesRepository.write(notes);
    set({ notes });
  },
  purgeNote: async (noteId) => {
    const notes = get().notes.filter((note) => note.id !== noteId);
    await notesRepository.write(notes);
    set({ notes });
  },
  emptyTrash: async () => {
    const notes = get().notes.filter((note) => !note.isDeleted);
    await notesRepository.write(notes);
    set({ notes });
  },
  restoreNote: async (noteId) => {
    const notes = get().notes.map((note) =>
      note.id === noteId ? restoreNoteService(note) : note
    );
    await notesRepository.write(notes);
    set({ notes });
  },
  archiveNote: async (noteId) => {
    const notes = get().notes.map((note) =>
      note.id === noteId ? archiveNoteService(note) : note
    );
    await notesRepository.write(notes);
    set({ notes });
  },
  moveNote: async (noteId, folderId) => {
    const notes = get().notes.map((note) =>
      note.id === noteId ? moveNoteService(note, folderId) : note
    );
    await notesRepository.write(notes);
    set({ notes });
  },
  toggleFavorite: async (noteId) => {
    const notes = get().notes.map((note) =>
      note.id === noteId ? updateNoteService(note, { isFavorite: !note.isFavorite }) : note
    );
    await notesRepository.write(notes);
    set({ notes });
  },
  togglePinned: async (noteId) => {
    const notes = get().notes.map((note) =>
      note.id === noteId ? updateNoteService(note, { isPinned: !note.isPinned }) : note
    );
    await notesRepository.write(notes);
    set({ notes });
  },
  searchNotes: (query) => searchNotesService(get().notes, query),
  getFilteredNotes: () => {
    const { searchQuery, selectedFolderId, showArchived, showDeleted } = useUIStore.getState();
    const sortOrder = useSettingsStore.getState().settings.sortOrder;

    const visibleNotes = get().notes.filter((note) => {
      if (showDeleted) {
        return note.isDeleted;
      }

      if (note.isDeleted) {
        return false;
      }

      if (!showArchived && note.isArchived) {
        return false;
      }

      if (selectedFolderId && note.folderId !== selectedFolderId) {
        return false;
      }

      return true;
    });

    return sortNotes(searchNotesService(visibleNotes, searchQuery), sortOrder);
  }
}));
