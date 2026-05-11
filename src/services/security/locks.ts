import type { AppSettings, Folder, Note } from "@/types/models";

export const isFolderLocked = (folder: Folder | undefined, settings: AppSettings) =>
  Boolean(folder && (folder.isLocked || settings.lockAllFolders));

export const isNoteLocked = (note: Note, folder: Folder | undefined, settings: AppSettings) =>
  Boolean(note.isLocked || settings.lockAllNotes || isFolderLocked(folder, settings));

export const getFolderLockHash = (folder: Folder | undefined, settings: AppSettings) =>
  folder?.lockCodeHash ?? settings.lockCodeHash ?? null;

export const getNoteLockHash = (note: Note, folder: Folder | undefined, settings: AppSettings) => {
  if (folder && isFolderLocked(folder, settings)) {
    return getFolderLockHash(folder, settings);
  }

  return note.lockCodeHash ?? settings.lockCodeHash ?? null;
};
