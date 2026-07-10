/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        useBootstrap.ts
 * @description Hydrates persisted application stores during startup.
 *
 * @project     BlockyNotes
 * @module      Core / Hooks
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
import { useEffect, useState } from "react";

import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";

export const useBootstrap = () => {
  const [isReady, setIsReady] = useState(false);
  const loadNotes = useNotesStore((state) => state.loadNotes);
  const loadFolders = useFoldersStore((state) => state.loadFolders);
  const loadSettings = useSettingsStore((state) => state.loadSettings);

  useEffect(() => {
    const bootstrap = async () => {
      await Promise.all([loadNotes(), loadFolders(), loadSettings()]);
      setIsReady(true);
    };

    void bootstrap();
  }, [loadFolders, loadNotes, loadSettings]);

  return isReady;
};
