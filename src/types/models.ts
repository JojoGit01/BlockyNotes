export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tagIds: string[];
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Folder {
  id: string;
  name: string;
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
