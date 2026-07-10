/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        keys.ts
 * @description Defines stable local-storage keys for persisted application data.
 *
 * @project     BlockyNotes
 * @module      Data / Storage
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
export const STORAGE_KEYS = {
  notes: "@blockynotes/notes",
  noteRevisions: "@blockynotes/note-revisions",
  folders: "@blockynotes/folders",
  tags: "@blockynotes/tags",
  settings: "@blockynotes/settings"
} as const;
