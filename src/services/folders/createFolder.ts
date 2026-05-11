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
