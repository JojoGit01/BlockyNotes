/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        folderIcon.ts
 * @description Resolves folder iconography and color treatments.
 *
 * @project     BlockyNotes
 * @module      Services / Folders
 *
 * @author      Ingénieur Jonathan DI MARTINO
 * @created     2026-05-05
 * @updated     2026-07-11
 * @version     1.0.0
 *
 * @license     Proprietary
 * @copyright   Copyright (c) 2026 Jonathan DI MARTINO
 *
 * @signature   JDM::FULLSTACK_AI_ENGINEERING
 * ============================================================================
 */
import { Ionicons } from "@expo/vector-icons";

import type { Folder, FolderIconKey } from "@/types/models";

type FolderIconName = keyof typeof Ionicons.glyphMap;

export interface FolderIconOption {
  key: FolderIconKey;
  label: string;
  icon: FolderIconName;
  color: string;
  backgroundColor: string;
}

export const folderIconOptions: FolderIconOption[] = [
  {
    key: "briefcase",
    label: "Travail",
    icon: "briefcase",
    color: "#7A4B31",
    backgroundColor: "#F2D8D6"
  },
  {
    key: "brain",
    label: "Idees",
    icon: "bulb-outline",
    color: "#EC4899",
    backgroundColor: "#FFE4F1"
  },
  {
    key: "shopping",
    label: "Courses",
    icon: "cart-outline",
    color: "#7086A4",
    backgroundColor: "#FFEBD7"
  },
  {
    key: "sport",
    label: "Sport",
    icon: "barbell",
    color: "#F59E0B",
    backgroundColor: "#EFE6FF"
  },
  {
    key: "palette",
    label: "Projets",
    icon: "color-palette",
    color: "#FF6B7A",
    backgroundColor: "#D8FAF1"
  },
  {
    key: "school",
    label: "Cours",
    icon: "school-outline",
    color: "#4F6EF7",
    backgroundColor: "#E4ECFF"
  },
  {
    key: "home",
    label: "Maison",
    icon: "home-outline",
    color: "#18A058",
    backgroundColor: "#E4F8D8"
  },
  {
    key: "code",
    label: "Code",
    icon: "code-slash-outline",
    color: "#536275",
    backgroundColor: "#E5EAF2"
  }
];

export const getFolderIcon = (folder?: Pick<Folder, "iconKey"> | null) =>
  folderIconOptions.find((option) => option.key === folder?.iconKey) ?? folderIconOptions[0];
