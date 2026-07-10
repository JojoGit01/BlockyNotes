/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        repositories.ts
 * @description Provides typed persistence repositories and compact note serialization.
 *
 * @project     BlockyNotes
 * @module      Data / Storage
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
import { STORAGE_KEYS } from "@/storage/keys";
import { readStorage, writeStorage } from "@/storage/storage";
import type { AppSettings, Folder, Note, NoteRevision, Tag } from "@/types/models";

export const notesRepository = {
  read: () => readStorage<Note[]>(STORAGE_KEYS.notes, []),
  write: (notes: Note[]) =>
    writeStorage(
      STORAGE_KEYS.notes,
      notes.map((note) =>
        note.noteMode !== "free" && (note.dailyEntries?.length ?? 0) > 0
          ? { ...note, content: "" }
          : note
      )
    )
};

export const noteRevisionsRepository = {
  read: () => readStorage<NoteRevision[]>(STORAGE_KEYS.noteRevisions, []),
  write: (revisions: NoteRevision[]) => writeStorage(STORAGE_KEYS.noteRevisions, revisions)
};

export const foldersRepository = {
  read: () => readStorage<Folder[]>(STORAGE_KEYS.folders, []),
  write: (folders: Folder[]) => writeStorage(STORAGE_KEYS.folders, folders)
};

export const tagsRepository = {
  read: () => readStorage<Tag[]>(STORAGE_KEYS.tags, []),
  write: (tags: Tag[]) => writeStorage(STORAGE_KEYS.tags, tags)
};

export const settingsRepository = {
  read: (fallback: AppSettings) => readStorage<AppSettings>(STORAGE_KEYS.settings, fallback),
  write: (settings: AppSettings) => writeStorage(STORAGE_KEYS.settings, settings)
};
