/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        NativeShareIntentBridge.tsx
 * @description Routes native shared text and links into the Quick Capture workflow.
 *
 * @project     BlockyNotes
 * @module      Components / Sharing
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
import Constants from "expo-constants";
import { router } from "expo-router";
import { useShareIntent } from "expo-share-intent";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

export function NativeShareIntentBridge({ enabled }: { enabled: boolean }) {
  const handledIntentRef = useRef<string | null>(null);
  const { hasShareIntent, resetShareIntent, shareIntent } = useShareIntent({
    disabled: !enabled || Platform.OS === "web" || Constants.appOwnership === "expo",
    resetOnBackground: false
  });

  useEffect(() => {
    if (!enabled || !hasShareIntent) {
      return;
    }

    const intentKey = JSON.stringify(shareIntent);

    if (handledIntentRef.current === intentKey) {
      return;
    }

    handledIntentRef.current = intentKey;
    router.push({
      pathname: "/notes/capture",
      params: {
        content: shareIntent.text ?? "",
        sourceUrl: shareIntent.webUrl ?? "",
        title: shareIntent.meta?.title ?? ""
      }
    });
    resetShareIntent();
  }, [enabled, hasShareIntent, resetShareIntent, shareIntent]);

  return null;
}
