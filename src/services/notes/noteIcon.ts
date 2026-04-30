import { Ionicons } from "@expo/vector-icons";

import type { Note, NoteIconKey } from "@/types/models";

type NoteIconName = keyof typeof Ionicons.glyphMap;

export interface NoteIconOption {
  key: NoteIconKey;
  label: string;
  icon: NoteIconName;
  color: string;
  backgroundColor: string;
}

interface NoteIconMatch extends NoteIconOption {
  keywords: string[];
}

export const noteIconOptions: NoteIconOption[] = [
  {
    key: "auto",
    label: "Auto",
    icon: "sparkles-outline",
    color: "#7C5CFA",
    backgroundColor: "#EFE8F7"
  },
  {
    key: "document",
    label: "Note",
    icon: "document-text-outline",
    color: "#7C5CFA",
    backgroundColor: "#EFE8F7"
  },
  {
    key: "sport",
    label: "Sport",
    icon: "football-outline",
    color: "#2563EB",
    backgroundColor: "#DBEAFE"
  },
  {
    key: "food",
    label: "Food",
    icon: "restaurant-outline",
    color: "#EA580C",
    backgroundColor: "#FFEDD5"
  },
  {
    key: "personal",
    label: "Perso",
    icon: "person-outline",
    color: "#7C3AED",
    backgroundColor: "#EDE9FE"
  },
  {
    key: "work",
    label: "Travail",
    icon: "briefcase-outline",
    color: "#0F766E",
    backgroundColor: "#CCFBF1"
  },
  {
    key: "money",
    label: "Budget",
    icon: "wallet-outline",
    color: "#047857",
    backgroundColor: "#D1FAE5"
  },
  {
    key: "travel",
    label: "Voyage",
    icon: "airplane-outline",
    color: "#0284C7",
    backgroundColor: "#E0F2FE"
  },
  {
    key: "health",
    label: "Sante",
    icon: "fitness-outline",
    color: "#DC2626",
    backgroundColor: "#FEE2E2"
  },
  {
    key: "shopping",
    label: "Achats",
    icon: "cart-outline",
    color: "#C026D3",
    backgroundColor: "#FAE8FF"
  },
  {
    key: "school",
    label: "Cours",
    icon: "school-outline",
    color: "#CA8A04",
    backgroundColor: "#FEF3C7"
  },
  {
    key: "code",
    label: "Code",
    icon: "code-slash-outline",
    color: "#334155",
    backgroundColor: "#E2E8F0"
  },
  {
    key: "music",
    label: "Musique",
    icon: "musical-notes-outline",
    color: "#DB2777",
    backgroundColor: "#FCE7F3"
  },
  {
    key: "home",
    label: "Maison",
    icon: "home-outline",
    color: "#92400E",
    backgroundColor: "#FEF3C7"
  }
];

const iconMatches: NoteIconMatch[] = [
  {
    ...noteIconOptions.find((option) => option.key === "sport")!,
    keywords: ["sport", "football", "foot", "basket", "muscu", "gym", "running", "course", "entrainement"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "food")!,
    keywords: ["food", "bouffe", "repas", "cuisine", "restaurant", "recette", "manger", "pizza", "burger"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "personal")!,
    keywords: ["perso", "personnel", "journal", "mood", "idee", "pensee", "vie", "moi"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "work")!,
    keywords: ["travail", "work", "job", "client", "meeting", "rdv", "business", "projet"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "money")!,
    keywords: ["argent", "budget", "finance", "facture", "banque", "depense", "revenu", "prix"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "travel")!,
    keywords: ["voyage", "trip", "vacances", "hotel", "avion", "train", "ville", "weekend"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "health")!,
    keywords: ["sante", "docteur", "medecin", "medical", "rdv medical", "fitness", "mental"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "shopping")!,
    keywords: ["shopping", "achat", "acheter", "course", "courses", "liste de courses"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "school")!,
    keywords: ["ecole", "cours", "formation", "apprendre", "revision", "devoir"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "code")!,
    keywords: ["code", "dev", "bug", "feature", "app", "react", "typescript", "expo"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "music")!,
    keywords: ["musique", "playlist", "son", "album", "concert"],
  },
  {
    ...noteIconOptions.find((option) => option.key === "home")!,
    keywords: ["maison", "home", "appart", "menage", "deco"],
  }
];

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const getNoteIcon = (note: Note) => {
  if (note.iconKey && note.iconKey !== "auto") {
    return noteIconOptions.find((option) => option.key === note.iconKey) ?? noteIconOptions[1];
  }

  const haystack = normalizeText(`${note.title} ${note.content}`);
  const match = iconMatches.find((item) =>
    item.keywords.some((keyword) => haystack.includes(normalizeText(keyword)))
  );

  return match ?? noteIconOptions[1];
};
