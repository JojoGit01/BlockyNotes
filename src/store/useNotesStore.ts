/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        useNotesStore.ts
 * @description Manages note state, atomic persistence, revisions, and note actions.
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

import { sortNotes } from "@/lib/sort";
import { archiveNoteService } from "@/services/notes/archiveNote";
import { createNoteService } from "@/services/notes/createNote";
import { normalizeNoteDailyEntries } from "@/services/notes/dailyEntries";
import { deleteNoteRevisions, queueNoteRevision } from "@/services/notes/noteHistory";
import { deleteNoteService } from "@/services/notes/deleteNote";
import { moveNoteService } from "@/services/notes/moveNote";
import { restoreNoteService } from "@/services/notes/restoreNote";
import { searchNotesService } from "@/services/notes/searchNotes";
import { updateNoteService } from "@/services/notes/updateNote";
import { notesRepository, tagsRepository } from "@/storage/repositories";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUIStore } from "@/store/useUIStore";
import type { NotesState } from "@/types/store";

let notesWriteQueue: Promise<void> = Promise.resolve();

const queueNotesWrite = (notes: NotesState["notes"]) => {
  const write = notesWriteQueue.then(() => notesRepository.write(notes));

  // Keep the queue usable after a storage failure while still rejecting this action.
  notesWriteQueue = write.catch(() => undefined);
  return write;
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  tags: [],
  hydrated: false,
  loadNotes: async () => {
    const [storedNotes, tags] = await Promise.all([notesRepository.read(), tagsRepository.read()]);
    const notes = storedNotes.map(normalizeNoteDailyEntries);
    const migrated = storedNotes.some(
      (note) =>
        note.dailyEntries === undefined ||
        note.noteMode === undefined ||
        (note.noteMode !== "free" && (note.dailyEntries?.length ?? 0) > 0 && note.content.length > 0)
    );

    if (migrated) {
      await notesRepository.write(notes);
    }

    set({ notes, tags, hydrated: true });
  },
  createNote: async (input) => {
    const note = createNoteService(input);
    let nextNotes: NotesState["notes"] = [];

    set((state) => {
      nextNotes = [note, ...state.notes];
      return { notes: nextNotes };
    });
    await queueNotesWrite(nextNotes);
    return note;
  },
  updateNote: async (noteId, updates) => {
    let nextNotes: NotesState["notes"] = [];
    let previousNote: NotesState["notes"][number] | undefined;

    set((state) => {
      nextNotes = state.notes.map((note) => {
        if (note.id !== noteId) {
          return note;
        }

        previousNote = note;
        return updateNoteService(note, updates);
      });
      return { notes: nextNotes };
    });
    const tracksContent =
      updates.title !== undefined ||
      updates.content !== undefined ||
      updates.dailyEntries !== undefined ||
      updates.noteMode !== undefined;

    await Promise.all([
      queueNotesWrite(nextNotes),
      previousNote && tracksContent ? queueNoteRevision(previousNote) : Promise.resolve()
    ]);
  },
  deleteNote: async (noteId) => {
    let nextNotes: NotesState["notes"] = [];

    set((state) => {
      nextNotes = state.notes.map((note) =>
        note.id === noteId ? deleteNoteService(note) : note
      );
      return { notes: nextNotes };
    });
    await queueNotesWrite(nextNotes);
  },
  purgeNote: async (noteId) => {
    let nextNotes: NotesState["notes"] = [];

    set((state) => {
      nextNotes = state.notes.filter((note) => note.id !== noteId);
      return { notes: nextNotes };
    });
    await Promise.all([queueNotesWrite(nextNotes), deleteNoteRevisions(noteId)]);
  },
  emptyTrash: async () => {
    let nextNotes: NotesState["notes"] = [];
    let deletedNoteIds: string[] = [];

    set((state) => {
      deletedNoteIds = state.notes.filter((note) => note.isDeleted).map((note) => note.id);
      nextNotes = state.notes.filter((note) => !note.isDeleted);
      return { notes: nextNotes };
    });
    await Promise.all([
      queueNotesWrite(nextNotes),
      ...deletedNoteIds.map((noteId) => deleteNoteRevisions(noteId))
    ]);
  },
  restoreNote: async (noteId) => {
    let nextNotes: NotesState["notes"] = [];

    set((state) => {
      nextNotes = state.notes.map((note) =>
        note.id === noteId ? restoreNoteService(note) : note
      );
      return { notes: nextNotes };
    });
    await queueNotesWrite(nextNotes);
  },
  archiveNote: async (noteId) => {
    let nextNotes: NotesState["notes"] = [];

    set((state) => {
      nextNotes = state.notes.map((note) =>
        note.id === noteId ? archiveNoteService(note) : note
      );
      return { notes: nextNotes };
    });
    await queueNotesWrite(nextNotes);
  },
  moveNote: async (noteId, folderId) => {
    let nextNotes: NotesState["notes"] = [];

    set((state) => {
      nextNotes = state.notes.map((note) =>
        note.id === noteId ? moveNoteService(note, folderId) : note
      );
      return { notes: nextNotes };
    });
    await queueNotesWrite(nextNotes);
  },
  toggleFavorite: async (noteId) => {
    let nextNotes: NotesState["notes"] = [];

    set((state) => {
      nextNotes = state.notes.map((note) =>
        note.id === noteId ? updateNoteService(note, { isFavorite: !note.isFavorite }) : note
      );
      return { notes: nextNotes };
    });
    await queueNotesWrite(nextNotes);
  },
  togglePinned: async (noteId) => {
    let nextNotes: NotesState["notes"] = [];

    set((state) => {
      nextNotes = state.notes.map((note) =>
        note.id === noteId ? updateNoteService(note, { isPinned: !note.isPinned }) : note
      );
      return { notes: nextNotes };
    });
    await queueNotesWrite(nextNotes);
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
