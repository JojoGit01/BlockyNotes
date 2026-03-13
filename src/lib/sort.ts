import type { Note, SortOrder } from "@/types/models";

export const sortNotes = (notes: Note[], sortOrder: SortOrder) => {
  const sorted = [...notes];

  sorted.sort((a, b) => {
    if (sortOrder === "updatedAt-desc") {
      return b.updatedAt.localeCompare(a.updatedAt);
    }

    if (sortOrder === "updatedAt-asc") {
      return a.updatedAt.localeCompare(b.updatedAt);
    }

    return a.title.localeCompare(b.title);
  });

  return sorted;
};
