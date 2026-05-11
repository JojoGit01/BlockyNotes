import type { AppSettings, Folder, Note, Tag } from "@/types/models";

export interface NotesState {
  notes: Note[];
  tags: Tag[];
  hydrated: boolean;
  loadNotes: () => Promise<void>;
  createNote: (input: Partial<Note> & Pick<Note, "title" | "content">) => Promise<Note>;
  updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  purgeNote: (noteId: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  restoreNote: (noteId: string) => Promise<void>;
  archiveNote: (noteId: string) => Promise<void>;
  moveNote: (noteId: string, folderId: string | null) => Promise<void>;
  toggleFavorite: (noteId: string) => Promise<void>;
  togglePinned: (noteId: string) => Promise<void>;
  searchNotes: (query: string) => Note[];
  getFilteredNotes: () => Note[];
}

export interface FoldersState {
  folders: Folder[];
  hydrated: boolean;
  loadFolders: () => Promise<void>;
  createFolder: (input: Pick<Folder, "name"> & Partial<Folder>) => Promise<Folder>;
  updateFolder: (folderId: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
}

export interface SettingsState {
  settings: AppSettings;
  hydrated: boolean;
  loadSettings: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  updateTheme: (theme: AppSettings["theme"]) => Promise<void>;
  updateSortOrder: (sortOrder: AppSettings["sortOrder"]) => Promise<void>;
  updateSecurity: (updates: Partial<AppSettings>) => Promise<void>;
}

export interface UIState {
  searchQuery: string;
  selectedFolderId: string | null;
  showArchived: boolean;
  showDeleted: boolean;
  selectedNoteIds: string[];
  setSearchQuery: (query: string) => void;
  setSelectedFolder: (folderId: string | null) => void;
  toggleShowArchived: () => void;
  toggleShowDeleted: () => void;
  toggleNoteSelection: (noteId: string) => void;
  clearSelection: () => void;
}
