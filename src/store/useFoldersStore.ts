/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        useFoldersStore.ts
 * @description Manages folder state, persistence, and folder mutations.
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

import { nowIso } from "@/lib/date";
import { createFolderService } from "@/services/folders/createFolder";
import { foldersRepository } from "@/storage/repositories";
import type { FoldersState } from "@/types/store";

export const useFoldersStore = create<FoldersState>((set, get) => ({
  folders: [],
  hydrated: false,
  loadFolders: async () => {
    const folders = await foldersRepository.read();
    set({ folders, hydrated: true });
  },
  createFolder: async (input) => {
    const folder = createFolderService(input);
    const folders = [...get().folders, folder];
    await foldersRepository.write(folders);
    set({ folders });
    return folder;
  },
  updateFolder: async (folderId, updates) => {
    const folders = get().folders.map((folder) =>
      folder.id === folderId ? { ...folder, ...updates, updatedAt: nowIso() } : folder
    );
    await foldersRepository.write(folders);
    set({ folders });
  },
  deleteFolder: async (folderId) => {
    const folders = get().folders.filter((folder) => folder.id !== folderId);
    await foldersRepository.write(folders);
    set({ folders });
  }
}));
