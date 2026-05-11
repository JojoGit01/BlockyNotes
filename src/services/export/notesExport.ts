import { buildNoteContentFromEntries, normalizeDailyEntries, sortDailyEntries } from "@/services/notes/dailyEntries";
import type { Folder, Note } from "@/types/models";

export type NotesExportFormat = "markdown" | "text" | "json";

type BuildNotesExportParams = {
  folders: Folder[];
  format: NotesExportFormat;
  notes: Note[];
  exportedAt?: Date;
};

const folderNameForNote = (folders: Folder[], note: Note) =>
  folders.find((folder) => folder.id === note.folderId)?.name ?? "Personnel";

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("fr-FR");
};

const formatDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

const cleanTitle = (note: Note) => note.title.trim() || "Sans titre";

const sortedExportNotes = (notes: Note[]) =>
  notes
    .filter((note) => !note.isDeleted)
    .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));

const noteEntries = (note: Note) => sortDailyEntries(normalizeDailyEntries(note));

export const getExportableNotes = (notes: Note[]) => sortedExportNotes(notes);

export const buildNotesExport = ({
  folders,
  format,
  notes,
  exportedAt = new Date()
}: BuildNotesExportParams) => {
  const exportableNotes = sortedExportNotes(notes);
  const exportedAtIso = exportedAt.toISOString();
  const exportedAtLabel = exportedAt.toLocaleString("fr-FR");

  if (format === "json") {
    return JSON.stringify(
      {
        app: "BlockyNotes",
        schemaVersion: 1,
        exportedAt: exportedAtIso,
        totals: {
          folders: folders.length,
          notes: exportableNotes.length
        },
        folders: folders.map((folder) => ({
          id: folder.id,
          name: folder.name,
          color: folder.color,
          iconKey: folder.iconKey ?? null,
          isLocked: Boolean(folder.isLocked),
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt
        })),
        notes: exportableNotes.map((note) => {
          const entries = noteEntries(note);

          return {
            id: note.id,
            title: cleanTitle(note),
            content: buildNoteContentFromEntries(entries) || note.content,
            dailyEntries: entries.map((entry) => ({
              id: entry.id,
              date: entry.date,
              content: entry.content,
              createdAt: entry.createdAt,
              updatedAt: entry.updatedAt
            })),
            folderId: note.folderId,
            folderName: folderNameForNote(folders, note),
            tagIds: note.tagIds,
            iconKey: note.iconKey ?? null,
            isFavorite: note.isFavorite,
            isPinned: Boolean(note.isPinned),
            isLocked: Boolean(note.isLocked),
            isArchived: note.isArchived,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            deletedAt: note.deletedAt
          };
        })
      },
      null,
      2
    );
  }

  if (format === "markdown") {
    return [
      "# Export BlockyNotes",
      "",
      `Export realise le ${exportedAtLabel}`,
      `${exportableNotes.length} note${exportableNotes.length > 1 ? "s" : ""} exportee${exportableNotes.length > 1 ? "s" : ""}`,
      "",
      ...exportableNotes.flatMap((note) => {
        const entries = noteEntries(note);
        const content = buildNoteContentFromEntries(entries) || note.content.trim() || "_Aucun contenu_";

        return [
          `## ${cleanTitle(note)}`,
          "",
          `- Dossier: ${folderNameForNote(folders, note)}`,
          `- Cree: ${formatDateTime(note.createdAt)}`,
          `- Modifie: ${formatDateTime(note.updatedAt)}`,
          `- Statut: ${note.isArchived ? "Archivee" : "Active"}`,
          `- Favori: ${note.isFavorite ? "Oui" : "Non"}`,
          `- Verrouillee: ${note.isLocked ? "Oui" : "Non"}`,
          "",
          entries.length > 1 ? "### Notes par date" : "### Note",
          "",
          ...(entries.length > 1
            ? entries.flatMap((entry) => [
                `#### ${formatDate(entry.date)}`,
                "",
                entry.content.trim() || "_Aucun contenu_",
                ""
              ])
            : [content, ""])
        ];
      })
    ].join("\n");
  }

  return [
    "Export BlockyNotes",
    `Export realise le ${exportedAtLabel}`,
    `${exportableNotes.length} note${exportableNotes.length > 1 ? "s" : ""} exportee${exportableNotes.length > 1 ? "s" : ""}`,
    "",
    ...exportableNotes.flatMap((note) => {
      const entries = noteEntries(note);
      const content = buildNoteContentFromEntries(entries) || note.content.trim() || "Aucun contenu";

      return [
        cleanTitle(note),
        `Dossier: ${folderNameForNote(folders, note)}`,
        `Cree: ${formatDateTime(note.createdAt)}`,
        `Modifie: ${formatDateTime(note.updatedAt)}`,
        `Statut: ${note.isArchived ? "Archivee" : "Active"}`,
        `Favori: ${note.isFavorite ? "Oui" : "Non"}`,
        `Verrouillee: ${note.isLocked ? "Oui" : "Non"}`,
        "",
        ...(entries.length > 1
          ? entries.flatMap((entry) => [
              `[${formatDate(entry.date)}]`,
              entry.content.trim() || "Aucun contenu",
              ""
            ])
          : [content, ""]),
        "----------------------------------------",
        ""
      ];
    })
  ].join("\n");
};
