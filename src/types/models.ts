/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        models.ts
 * @description Defines persisted domain entities and application setting types.
 *
 * @project     BlockyNotes
 * @module      Core / Types
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
export interface NoteDailyEntry {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteIconKey =
  | "auto"
  | "document"
  | "sport"
  | "food"
  | "personal"
  | "work"
  | "money"
  | "travel"
  | "health"
  | "shopping"
  | "school"
  | "code"
  | "music"
  | "home";

export type NoteMode = "day" | "free";

export type FolderIconKey =
  | "briefcase"
  | "brain"
  | "shopping"
  | "sport"
  | "palette"
  | "school"
  | "home"
  | "code";

export interface Note {
  id: string;
  title: string;
  content: string;
  noteMode?: NoteMode;
  dailyEntries?: NoteDailyEntry[];
  iconKey?: NoteIconKey | null;
  folderId: string | null;
  tagIds: string[];
  isInbox?: boolean;
  sourceUrl?: string | null;
  isFavorite: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  lockCodeHash?: string | null;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface NoteRevision {
  id: string;
  noteId: string;
  title: string;
  content: string;
  noteMode: NoteMode;
  dailyEntries: NoteDailyEntry[];
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  iconKey?: FolderIconKey | null;
  color: string;
  isLocked?: boolean;
  lockCodeHash?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export type ThemeMode = "system" | "light" | "dark";
export type SortOrder = "updatedAt-desc" | "updatedAt-asc" | "title-asc";
export type AppLockTimeout = 0 | 60000 | 300000;

export interface AppSettings {
  displayName: string;
  theme: ThemeMode;
  sortOrder: SortOrder;
  showArchivedOnDashboard: boolean;
  appLockEnabled?: boolean;
  lockAllNotes?: boolean;
  lockAllFolders?: boolean;
  appLockTimeoutMs?: AppLockTimeout;
  lockCodeHash?: string | null;
}
