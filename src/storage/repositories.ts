import { STORAGE_KEYS } from "@/storage/keys";
import { readStorage, writeStorage } from "@/storage/storage";
import type { AppSettings, Folder, Note, Tag } from "@/types/models";

export const notesRepository = {
  read: () => readStorage<Note[]>(STORAGE_KEYS.notes, []),
  write: (notes: Note[]) => writeStorage(STORAGE_KEYS.notes, notes)
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
