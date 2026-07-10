/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        createFolder.ts
 * @description Creates normalized folder entities with application defaults.
 *
 * @project     BlockyNotes
 * @module      Services / Folders
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
import { DEFAULT_FOLDER_COLOR } from "@/lib/constants";
import { nowIso } from "@/lib/date";
import { createId } from "@/lib/id";
import type { Folder } from "@/types/models";

export const createFolderService = (
  input: Pick<Folder, "name"> & Partial<Folder>
): Folder => {
  const timestamp = nowIso();

  return {
    id: createId("folder"),
    name: input.name.trim(),
    iconKey: input.iconKey ?? "briefcase",
    color: input.color ?? DEFAULT_FOLDER_COLOR,
    isLocked: input.isLocked ?? false,
    lockCodeHash: input.lockCodeHash ?? null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};
