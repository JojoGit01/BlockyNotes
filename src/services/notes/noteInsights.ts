/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        noteInsights.ts
 * @description Extracts links and tags and computes smart collections and Replay insights.
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
import type { Note } from "@/types/models";

export type SmartCollectionKey =
  | "none"
  | "week"
  | "unfiled"
  | "locked"
  | "stale"
  | "linked"
  | "tagged";

export type NoteLink = {
  title: string;
  note: Note | null;
};

const normalizeTitle = (value: string) => value.trim().toLocaleLowerCase("fr-FR");

export const extractNoteLinkTitles = (content: string) => {
  const titles: string[] = [];
  const seen = new Set<string>();
  const matcher = /\[\[([^\[\]\n]{1,80})\]\]/g;
  let match = matcher.exec(content);

  while (match) {
    const title = match[1].trim();
    const normalized = normalizeTitle(title);

    if (title && !seen.has(normalized)) {
      seen.add(normalized);
      titles.push(title);
    }

    match = matcher.exec(content);
  }

  return titles;
};

export const extractHashtags = (content: string) => {
  const tags: string[] = [];
  const seen = new Set<string>();
  const matcher = /(?:^|\s)#([A-Za-zÀ-ÖØ-öø-ÿ0-9_-]{2,40})/g;
  let match = matcher.exec(content);

  while (match) {
    const tag = match[1];
    const normalized = tag.toLocaleLowerCase("fr-FR");

    if (!seen.has(normalized)) {
      seen.add(normalized);
      tags.push(tag);
    }

    match = matcher.exec(content);
  }

  return tags;
};

export const resolveNoteLinks = (content: string, notes: Note[], currentNoteId?: string): NoteLink[] => {
  const notesByTitle = new Map(
    notes
      .filter((note) => note.id !== currentNoteId && !note.isDeleted)
      .map((note) => [normalizeTitle(note.title), note])
  );

  return extractNoteLinkTitles(content).map((title) => ({
    title,
    note: notesByTitle.get(normalizeTitle(title)) ?? null
  }));
};

export const getNoteBacklinks = (note: Note, notes: Note[]) => {
  const targetTitle = normalizeTitle(note.title);

  if (!targetTitle) {
    return [];
  }

  return notes.filter(
    (candidate) =>
      candidate.id !== note.id &&
      !candidate.isDeleted &&
      extractNoteLinkTitles(candidate.content).some((title) => normalizeTitle(title) === targetTitle)
  );
};

export const matchesSmartCollection = (note: Note, collection: SmartCollectionKey, now = new Date()) => {
  if (collection === "none") {
    return true;
  }

  if (collection === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return new Date(note.updatedAt).getTime() >= weekAgo.getTime();
  }

  if (collection === "unfiled") {
    return note.folderId === null;
  }

  if (collection === "locked") {
    return Boolean(note.isLocked);
  }

  if (collection === "stale") {
    const staleBefore = new Date(now);
    staleBefore.setDate(now.getDate() - 30);
    return new Date(note.updatedAt).getTime() < staleBefore.getTime();
  }

  if (collection === "linked") {
    return extractNoteLinkTitles(note.content).length > 0;
  }

  return extractHashtags(`${note.title}\n${note.content}`).length > 0;
};

export const getReplayInsights = (notes: Note[], now = new Date()) => {
  const activeNotes = notes.filter((note) => !note.isDeleted && !note.isArchived);
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(now.getDate() - 30);

  const touchedThisWeek = activeNotes.filter(
    (note) => new Date(note.updatedAt).getTime() >= weekAgo.getTime()
  );
  const createdThisWeek = activeNotes.filter(
    (note) => new Date(note.createdAt).getTime() >= weekAgo.getTime()
  );
  const memory = [...activeNotes]
    .filter((note) => new Date(note.updatedAt).getTime() < monthAgo.getTime())
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
  const resume = [...activeNotes]
    .filter((note) => note.isPinned || note.isFavorite)
    .filter((note) => new Date(note.updatedAt).getTime() < weekAgo.getTime())
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;

  return {
    createdThisWeek: createdThisWeek.length,
    touchedThisWeek: touchedThisWeek.length,
    inboxCount: activeNotes.filter((note) => note.isInbox).length,
    memory,
    resume
  };
};
