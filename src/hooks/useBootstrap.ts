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
