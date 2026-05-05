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
  dailyEntries?: NoteDailyEntry[];
  iconKey?: NoteIconKey | null;
  folderId: string | null;
  tagIds: string[];
  isFavorite: boolean;
  isPinned?: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Folder {
  id: string;
  name: string;
  iconKey?: FolderIconKey | null;
  color: string;
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

export interface AppSettings {
  displayName: string;
  theme: ThemeMode;
  sortOrder: SortOrder;
  showArchivedOnDashboard: boolean;
}
