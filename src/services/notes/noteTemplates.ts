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
