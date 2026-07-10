/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        notesExport.ts
 * @description Builds Markdown, text, JSON, and PDF-ready note export content.
 *
 * @project     BlockyNotes
 * @module      Services / Export
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-05-11
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
import { buildNoteContentFromEntries, normalizeDailyEntries, sortDailyEntries } from "@/services/notes/dailyEntries";
import type { Folder, Note } from "@/types/models";

export type NotesExportFormat = "markdown" | "text" | "json";
export type NotesFileExportFormat = NotesExportFormat | "pdf";

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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

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

export const buildNotesExportHtml = ({
  folders,
  notes,
  exportedAt = new Date()
}: Omit<BuildNotesExportParams, "format">) => {
  const exportableNotes = sortedExportNotes(notes);
  const exportedAtLabel = exportedAt.toLocaleString("fr-FR");

  const notesHtml = exportableNotes
    .map((note) => {
      const entries = noteEntries(note);
      const entriesHtml =
        entries.length > 0
          ? entries
              .map(
                (entry) => `
                  <section class="entry">
                    <h3>${escapeHtml(formatDate(entry.date))}</h3>
                    <p>${escapeHtml(entry.content.trim() || "Aucun contenu").replace(/\n/g, "<br />")}</p>
                  </section>
                `
              )
              .join("")
          : `<section class="entry"><p>${escapeHtml(note.content.trim() || "Aucun contenu").replace(/\n/g, "<br />")}</p></section>`;

      return `
        <article class="note">
          <div class="note-header">
            <div>
              <h2>${escapeHtml(cleanTitle(note))}</h2>
              <p class="meta">${escapeHtml(folderNameForNote(folders, note))} - Modifie le ${escapeHtml(formatDateTime(note.updatedAt))}</p>
            </div>
            <div class="status">${note.isArchived ? "Archivee" : "Active"}</div>
          </div>
          <div class="chips">
            ${note.isFavorite ? "<span>Favori</span>" : ""}
            ${note.isPinned ? "<span>Epinglee</span>" : ""}
            ${note.isLocked ? "<span>Verrouillee</span>" : ""}
          </div>
          ${entriesHtml}
        </article>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page { margin: 28px; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #071736;
            background: #ffffff;
            margin: 0;
            padding: 0;
          }
          .cover {
            background: #0F1B3A;
            color: #ffffff;
            border-radius: 22px;
            padding: 26px;
            margin-bottom: 22px;
          }
          .cover h1 {
            font-size: 30px;
            margin: 0 0 10px;
          }
          .cover p {
            color: #F1ECFF;
            margin: 4px 0;
            font-size: 14px;
          }
          .note {
            border: 1px solid #E8E9EE;
            border-radius: 18px;
            padding: 18px;
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .note-header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
          }
          h2 {
            font-size: 22px;
            margin: 0;
          }
          h3 {
            color: #4F6EF7;
            font-size: 14px;
            margin: 18px 0 8px;
          }
          .meta {
            color: #7B7F89;
            margin: 6px 0 0;
            font-size: 12px;
          }
          .status {
            background: #E4ECFF;
            color: #4F6EF7;
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 800;
          }
          .chips {
            display: flex;
            gap: 6px;
            margin-top: 12px;
          }
          .chips span {
            background: #F4F6FA;
            border-radius: 999px;
            padding: 5px 8px;
            color: #4B5563;
            font-size: 11px;
            font-weight: 700;
          }
          .entry p {
            color: #1F2937;
            font-size: 14px;
            line-height: 1.55;
            white-space: normal;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <section class="cover">
          <h1>Export BlockyNotes</h1>
          <p>Export realise le ${escapeHtml(exportedAtLabel)}</p>
          <p>${exportableNotes.length} note${exportableNotes.length > 1 ? "s" : ""} exportee${exportableNotes.length > 1 ? "s" : ""}</p>
        </section>
        ${notesHtml || "<p>Aucune note a exporter.</p>"}
      </body>
    </html>`;
};
