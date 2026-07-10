/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        noteHistory.ts
 * @description Persists bounded local revision history for note recovery.
 *
 * @project     BlockyNotes
 * @module      Services / Notes
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-07-11
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
import { noteRevisionsRepository } from "@/storage/repositories";
import { buildNoteContentFromEntries } from "@/services/notes/dailyEntries";
import type { Note, NoteRevision } from "@/types/models";

const MAX_REVISIONS_PER_NOTE = 8;
const REVISION_INTERVAL_MS = 5 * 60 * 1000;

let revisionWriteQueue: Promise<void> = Promise.resolve();
const lastRevisionAtByNote = new Map<string, number>();

const snapshotMatches = (revision: NoteRevision, note: Note) =>
  revision.title === note.title &&
  (revision.noteMode === "day" || revision.content === note.content) &&
  revision.noteMode === (note.noteMode ?? "day") &&
  JSON.stringify(revision.dailyEntries) === JSON.stringify(note.dailyEntries ?? []);

export const queueNoteRevision = (note: Note, force = false) => {
  const save = revisionWriteQueue.then(async () => {
    const knownRevisionAt = lastRevisionAtByNote.get(note.id);

    if (!force && knownRevisionAt && Date.now() - knownRevisionAt < REVISION_INTERVAL_MS) {
      return;
    }

    const revisions = await noteRevisionsRepository.read();
    const latest = revisions
      .filter((revision) => revision.noteId === note.id)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt))[0];

    if (latest && snapshotMatches(latest, note)) {
      lastRevisionAtByNote.set(note.id, new Date(latest.createdAt).getTime());
      return;
    }

    if (!force && latest && Date.now() - new Date(latest.createdAt).getTime() < REVISION_INTERVAL_MS) {
      lastRevisionAtByNote.set(note.id, new Date(latest.createdAt).getTime());
      return;
    }

    const createdAt = new Date().toISOString();
    const revision: NoteRevision = {
      id: `${note.id}-${createdAt}`,
      noteId: note.id,
      title: note.title,
      content: note.noteMode === "free" ? note.content : "",
      noteMode: note.noteMode ?? "day",
      dailyEntries: (note.dailyEntries ?? []).map((entry) => ({ ...entry })),
      createdAt
    };
    const otherNotes = revisions.filter((entry) => entry.noteId !== note.id);
    const noteRevisions = [revision, ...revisions.filter((entry) => entry.noteId === note.id)]
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
      .slice(0, MAX_REVISIONS_PER_NOTE);

    await noteRevisionsRepository.write([...otherNotes, ...noteRevisions]);
    lastRevisionAtByNote.set(note.id, new Date(createdAt).getTime());
  });

  revisionWriteQueue = save.catch(() => undefined);
  return save;
};

export const listNoteRevisions = async (noteId: string) => {
  await revisionWriteQueue;
  const revisions = await noteRevisionsRepository.read();

  return revisions
    .filter((revision) => revision.noteId === noteId)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .map((revision) =>
      revision.noteMode === "day"
        ? { ...revision, content: buildNoteContentFromEntries(revision.dailyEntries) }
        : revision
    );
};

export const deleteNoteRevisions = async (noteId: string) => {
  const remove = revisionWriteQueue.then(async () => {
    const revisions = await noteRevisionsRepository.read();
    await noteRevisionsRepository.write(revisions.filter((revision) => revision.noteId !== noteId));
    lastRevisionAtByNote.delete(noteId);
  });

  revisionWriteQueue = remove.catch(() => undefined);
  return remove;
};
