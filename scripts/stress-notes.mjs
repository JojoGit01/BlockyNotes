/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        stress-notes.mjs
 * @description Stress-tests note generation, serialization, search, updates, and compact storage.
 *
 * @project     BlockyNotes
 * @module      Quality Assurance
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
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

const NOTE_COUNT = 200;
const FOLDER_COUNT = 30;
const DAYS_PER_JOURNAL = 60;
const LONG_PARAGRAPH = Array.from(
  { length: 40 },
  (_, index) => `Ligne ${index + 1}: preparation, suivi, decisions et prochaines actions BlockyNotes.`
).join("\n");

const startedAt = performance.now();
const folders = Array.from({ length: FOLDER_COUNT }, (_, index) => ({
  id: `stress-folder-${index + 1}`,
  name: `Dossier ${index + 1}`
}));
const notes = Array.from({ length: NOTE_COUNT }, (_, noteIndex) => {
  const dailyEntries = Array.from({ length: DAYS_PER_JOURNAL }, (_, dayIndex) => {
    const date = new Date(2026, 0, 1);
    date.setDate(date.getDate() + dayIndex);

    return {
      id: `stress-note-${noteIndex + 1}-day-${dayIndex + 1}`,
      date: date.toISOString().slice(0, 10),
      content: `${LONG_PARAGRAPH}\nNote ${noteIndex + 1}, jour ${dayIndex + 1}.`,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString()
    };
  });

  return {
    id: `stress-note-${noteIndex + 1}`,
    title: `Note de charge ${noteIndex + 1}`,
    content: dailyEntries.map((entry) => entry.content).join("\n\n"),
    noteMode: "day",
    dailyEntries,
    folderId: folders[noteIndex % folders.length].id,
    updatedAt: dailyEntries[dailyEntries.length - 1].updatedAt
  };
});
const generatedAt = performance.now();

assert.equal(notes.length, NOTE_COUNT);
assert.equal(folders.length, FOLDER_COUNT);
assert.equal(notes.reduce((total, note) => total + note.dailyEntries.length, 0), NOTE_COUNT * DAYS_PER_JOURNAL);

const serialized = JSON.stringify({ folders, notes });
const compactSerialized = JSON.stringify({
  folders,
  notes: notes.map((note) => ({ ...note, content: note.noteMode === "free" ? note.content : "" }))
});
const restored = JSON.parse(serialized);
assert.equal(restored.notes.length, NOTE_COUNT);
assert.equal(restored.notes[199].dailyEntries.length, DAYS_PER_JOURNAL);
assert.ok(Buffer.byteLength(compactSerialized) < Buffer.byteLength(serialized));
const serializedAt = performance.now();

const query = "prochaines actions blockynotes";
const results = notes.filter((note) => `${note.title}\n${note.content}`.toLowerCase().includes(query));
assert.equal(results.length, NOTE_COUNT);
const searchedAt = performance.now();

let updatedNotes = notes;
for (let index = 0; index < 1000; index += 1) {
  const targetId = `stress-note-${(index % NOTE_COUNT) + 1}`;
  updatedNotes = updatedNotes.map((note) =>
    note.id === targetId ? { ...note, title: `${note.title.split(" #")[0]} #${index}` } : note
  );
}
assert.equal(updatedNotes.length, NOTE_COUNT);
assert.equal(updatedNotes.filter((note) => note.title.includes("#")).length, NOTE_COUNT);
const updatedAt = performance.now();

const result = {
  folders: FOLDER_COUNT,
  notes: NOTE_COUNT,
  dailyEntries: NOTE_COUNT * DAYS_PER_JOURNAL,
  serializedMegabytes: Number((Buffer.byteLength(serialized) / 1024 / 1024).toFixed(2)),
  compactStorageMegabytes: Number((Buffer.byteLength(compactSerialized) / 1024 / 1024).toFixed(2)),
  generationMs: Number((generatedAt - startedAt).toFixed(1)),
  serializationMs: Number((serializedAt - generatedAt).toFixed(1)),
  searchMs: Number((searchedAt - serializedAt).toFixed(1)),
  immutableUpdatesMs: Number((updatedAt - searchedAt).toFixed(1)),
  totalMs: Number((updatedAt - startedAt).toFixed(1))
};

console.log("BlockyNotes stress test passed");
console.table(result);
