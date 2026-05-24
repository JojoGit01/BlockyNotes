import { buildNoteContentFromEntries } from "@/services/notes/dailyEntries";
import { hashLockCode } from "@/lib/security";
import type { Folder, FolderIconKey, Note, NoteDailyEntry, NoteIconKey } from "@/types/models";

export const demoSeedPrefix = "seed-";
export const demoSeedLockCode = "1234";

type BuildDemoSeedDataParams = {
  folders: Folder[];
  notes: Note[];
};

type DemoFolderInput = {
  color: string;
  iconKey: FolderIconKey;
  id: string;
  locked?: boolean;
  name: string;
};

type DemoNoteInput = {
  archived?: boolean;
  deleted?: boolean;
  favorite?: boolean;
  folderId: string | null;
  iconKey: NoteIconKey;
  id: string;
  locked?: boolean;
  offset: number;
  pinned?: boolean;
  sections: { dateOffset: number; text: string }[];
  title: string;
};

const isoDaysAgo = (days: number, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
};

const dateKeyDaysAgo = (days: number) => isoDaysAgo(days).slice(0, 10);

const makeEntries = (noteId: string, sections: DemoNoteInput["sections"]): NoteDailyEntry[] =>
  sections.map((section, index) => {
    const timestamp = isoDaysAgo(section.dateOffset, 9 + index);

    return {
      id: `${noteId}-entry-${index + 1}`,
      date: dateKeyDaysAgo(section.dateOffset),
      content: section.text,
      createdAt: timestamp,
      updatedAt: timestamp
    };
  });

const demoFolders: DemoFolderInput[] = [
  { id: "work", name: "Client Studio", iconKey: "briefcase", color: "#4F6EF7" },
  { id: "product", name: "Produit", iconKey: "palette", color: "#FF6B7A" },
  { id: "home", name: "Maison", iconKey: "home", color: "#18A058" },
  { id: "training", name: "Sport & sante", iconKey: "sport", color: "#F59E0B" },
  { id: "vault", name: "Coffre test", iconKey: "code", color: "#7C4DFF", locked: true }
];

const demoNotes: DemoNoteInput[] = [
  {
    id: "launch-plan",
    folderId: "product",
    title: "Plan lancement BlockyNotes",
    iconKey: "work",
    pinned: true,
    favorite: true,
    offset: 0,
    sections: [
      { dateOffset: 0, text: "Finaliser l'export PDF, tester la securite, puis faire une passe UX sur les dossiers." },
      { dateOffset: 2, text: "Verifier les empty states, les retours de navigation et les notes multi-dates." }
    ]
  },
  {
    id: "client-call",
    folderId: "work",
    title: "Call client - refonte mobile",
    iconKey: "work",
    favorite: true,
    offset: 1,
    sections: [
      { dateOffset: 1, text: "Points a presenter: navigation dossiers, export fichiers, verrouillage notes et mode Navy." }
    ]
  },
  {
    id: "roadmap-q2",
    folderId: "product",
    title: "Roadmap Q2",
    iconKey: "document",
    pinned: true,
    offset: 2,
    sections: [
      { dateOffset: 2, text: "1. Recherche globale\n2. Widgets de raccourcis\n3. Import JSON\n4. Mode focus pour l'ecriture" }
    ]
  },
  {
    id: "bug-bash",
    folderId: "product",
    title: "Bug bash",
    iconKey: "code",
    offset: 3,
    sections: [
      { dateOffset: 3, text: "Tester: note vide, transfert de notes, suppression dossier, retour depuis note verrouillee." },
      { dateOffset: 1, text: "Ajouter un cas avec dossier personnel et un cas avec dossier verrouille." }
    ]
  },
  {
    id: "groceries",
    folderId: "home",
    title: "Courses semaine",
    iconKey: "shopping",
    offset: 0,
    sections: [
      { dateOffset: 0, text: "- Cafe\n- Fruits\n- Riz\n- Lessive\n- Chocolat noir" }
    ]
  },
  {
    id: "home-projects",
    folderId: "home",
    title: "Petits travaux maison",
    iconKey: "home",
    offset: 4,
    sections: [
      { dateOffset: 4, text: "Changer l'ampoule du bureau, ranger les cables, mesurer l'etagere murale." }
    ]
  },
  {
    id: "meal-prep",
    folderId: "home",
    title: "Meal prep rapide",
    iconKey: "food",
    favorite: true,
    offset: 5,
    sections: [
      { dateOffset: 5, text: "Batch: poulet citron, quinoa, legumes rotis. Sauce yaourt + menthe." }
    ]
  },
  {
    id: "run-plan",
    folderId: "training",
    title: "Programme running",
    iconKey: "sport",
    offset: 1,
    sections: [
      { dateOffset: 1, text: "Mardi: 30 min easy\nJeudi: fractionne court\nDimanche: sortie longue tranquille" }
    ]
  },
  {
    id: "sleep-log",
    folderId: "training",
    title: "Suivi sommeil",
    iconKey: "health",
    offset: 6,
    sections: [
      { dateOffset: 6, text: "7h10, reveil correct. Eviter cafe apres 16h." },
      { dateOffset: 3, text: "6h40, coucher tard. Prevoir routine plus calme." }
    ]
  },
  {
    id: "budget",
    folderId: null,
    title: "Budget perso",
    iconKey: "money",
    locked: true,
    offset: 2,
    sections: [
      { dateOffset: 2, text: "Objectif: garder 20% du revenu en epargne. Revoir abonnements en fin de mois." }
    ]
  },
  {
    id: "secret-ideas",
    folderId: "vault",
    title: "Idees confidentielles",
    iconKey: "code",
    locked: true,
    offset: 3,
    sections: [
      { dateOffset: 3, text: "Prototype: mode coffre pour notes sensibles + export protege par code." }
    ]
  },
  {
    id: "travel-weekend",
    folderId: null,
    title: "Weekend a Lisbonne",
    iconKey: "travel",
    favorite: true,
    offset: 7,
    sections: [
      { dateOffset: 7, text: "A voir: Alfama, LX Factory, miradouro au coucher du soleil. Garder une matinee sans planning." }
    ]
  },
  {
    id: "book-notes",
    folderId: null,
    title: "Lecture - notes rapides",
    iconKey: "school",
    offset: 8,
    sections: [
      { dateOffset: 8, text: "Une bonne app de notes doit disparaitre pendant l'ecriture et reapparaitre pour organiser." }
    ]
  },
  {
    id: "playlist",
    folderId: null,
    title: "Playlist focus",
    iconKey: "music",
    offset: 9,
    sections: [
      { dateOffset: 9, text: "Nils Frahm, Tycho, Bonobo, FKJ. Tester une playlist sans paroles pour coder." }
    ]
  },
  {
    id: "release-checklist",
    folderId: "work",
    title: "Checklist release",
    iconKey: "code",
    offset: 10,
    sections: [
      { dateOffset: 10, text: "- Typecheck\n- Lint\n- Test navigation\n- Export fichiers\n- Notes verrouillees" }
    ]
  },
  {
    id: "meeting-recap",
    folderId: "work",
    title: "Recap equipe",
    iconKey: "work",
    archived: true,
    offset: 15,
    sections: [
      { dateOffset: 15, text: "Decision: simplifier le header, garder le logo seul, harmoniser les cards dossiers." }
    ]
  },
  {
    id: "old-idea",
    folderId: "product",
    title: "Ancienne idee a revoir",
    iconKey: "document",
    archived: true,
    offset: 18,
    sections: [
      { dateOffset: 18, text: "Peut-etre ajouter des themes custom plus tard, mais priorite a la stabilite." }
    ]
  },
  {
    id: "trash-test",
    folderId: "home",
    title: "Note supprimee demo",
    iconKey: "document",
    deleted: true,
    offset: 20,
    sections: [
      { dateOffset: 20, text: "Cette note sert a tester la corbeille et la restauration." }
    ]
  },
  {
    id: "ux-observations",
    folderId: "product",
    title: "Observations UX",
    iconKey: "personal",
    offset: 4,
    sections: [
      { dateOffset: 4, text: "Les actions principales doivent etre en FAB, pas en texte discret dans les titres." },
      { dateOffset: 0, text: "Les transferts doivent toujours demander une selection explicite." }
    ]
  },
  {
    id: "inbox-random",
    folderId: null,
    title: "Inbox rapide",
    iconKey: "document",
    offset: 0,
    sections: [
      { dateOffset: 0, text: "Note libre pour tester la recherche, le tri et le dossier Personnel." }
    ]
  }
];

const toFolder = (input: DemoFolderInput): Folder => {
  const timestamp = isoDaysAgo(input.locked ? 5 : 12);

  return {
    id: `${demoSeedPrefix}folder-${input.id}`,
    name: input.name,
    iconKey: input.iconKey,
    color: input.color,
    isLocked: Boolean(input.locked),
    lockCodeHash: input.locked ? hashLockCode(demoSeedLockCode) : null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

const toNote = (input: DemoNoteInput): Note => {
  const id = `${demoSeedPrefix}note-${input.id}`;
  const dailyEntries = makeEntries(id, input.sections);
  const createdAt = isoDaysAgo(input.offset + 2, 8);
  const updatedAt = isoDaysAgo(input.offset, 18);

  return {
    id,
    title: input.title,
    content: buildNoteContentFromEntries(dailyEntries),
    dailyEntries,
    iconKey: input.iconKey,
    folderId: input.folderId ? `${demoSeedPrefix}folder-${input.folderId}` : null,
    tagIds: [],
    isFavorite: Boolean(input.favorite),
    isPinned: Boolean(input.pinned),
    isLocked: Boolean(input.locked),
    lockCodeHash: input.locked ? hashLockCode(demoSeedLockCode) : null,
    isArchived: Boolean(input.archived),
    isDeleted: Boolean(input.deleted),
    createdAt,
    updatedAt,
    deletedAt: input.deleted ? isoDaysAgo(1, 12) : null
  };
};

export const buildDemoSeedData = ({ folders, notes }: BuildDemoSeedDataParams) => {
  const userFolders = folders.filter((folder) => !folder.id.startsWith(demoSeedPrefix));
  const userNotes = notes.filter((note) => !note.id.startsWith(demoSeedPrefix));
  const seededFolders = demoFolders.map(toFolder);
  const seededNotes = demoNotes.map(toNote);

  return {
    folders: [...userFolders, ...seededFolders],
    notes: [...seededNotes, ...userNotes],
    summary: {
      folders: seededFolders.length,
      notes: seededNotes.length,
      lockedCode: demoSeedLockCode
    }
  };
};
