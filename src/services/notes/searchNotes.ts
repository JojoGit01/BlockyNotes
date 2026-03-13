import type { Note } from "@/types/models";

export const searchNotesService = (notes: Note[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return notes;
  }

  return notes.filter((note) => {
    const haystack = `${note.title} ${note.content}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
};
