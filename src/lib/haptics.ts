/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        haptics.ts
 * @description Provides resilient haptic-feedback helpers for supported devices.
 *
 * @project     BlockyNotes
 * @module      Core / Utilities
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
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const runHaptic = async (feedback: () => Promise<void>) => {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await feedback();
  } catch {
    // Haptics are optional and must never block the user's action.
  }
};

export const hapticSelection = () => runHaptic(() => Haptics.selectionAsync());

export const hapticImpact = () =>
  runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

export const hapticSuccess = () =>
  runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

export const hapticWarning = () =>
  runHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
