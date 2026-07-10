/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        locks.ts
 * @description Resolves effective note and folder security requirements.
 *
 * @project     BlockyNotes
 * @module      Services / Security
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-05-11
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
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
