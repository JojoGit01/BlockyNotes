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
    color: input.color ?? DEFAULT_FOLDER_COLOR,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};
