/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        noteTemplates.ts
 * @description Defines reusable structures for creating common note types.
 *
 * @project     BlockyNotes
 * @module      Services / Notes
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-04-30
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
import type { NoteIconKey } from "@/types/models";

export interface NoteTemplate {
  key: string;
  label: string;
  title: string;
  content: string;
  iconKey: NoteIconKey;
}

export const noteTemplates: NoteTemplate[] = [
  {
    key: "blank",
    label: "Vide",
    title: "",
    content: "",
    iconKey: "auto"
  },
  {
    key: "daily",
    label: "Journal",
    title: "Journal du jour",
    content: "Mood:\n\nCe qui s'est passe:\n\nA retenir:\n\nDemain:",
    iconKey: "personal"
  },
  {
    key: "todo",
    label: "To-do",
    title: "Liste de choses a faire",
    content: "- [ ] Priorite 1\n- [ ] Priorite 2\n- [ ] Priorite 3\n\nNotes:",
    iconKey: "document"
  },
  {
    key: "workout",
    label: "Sport",
    title: "Seance sport",
    content: "Objectif:\n\nExercices:\n- \n- \n- \n\nRessenti:",
    iconKey: "sport"
  },
  {
    key: "recipe",
    label: "Recette",
    title: "Nouvelle recette",
    content: "Ingredients:\n- \n\nEtapes:\n1. \n2. \n3. \n\nAjustements:",
    iconKey: "food"
  },
  {
    key: "project",
    label: "Projet",
    title: "Idee projet",
    content: "Objectif:\n\nPourquoi c'est utile:\n\nPremieres actions:\n- \n- \n- ",
    iconKey: "work"
  }
];
