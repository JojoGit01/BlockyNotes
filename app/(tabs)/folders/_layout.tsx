/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        _layout.tsx
 * @description Configures the nested navigation stack for folder-related screens.
 *
 * @project     BlockyNotes
 * @module      Application / Folders
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
import { Stack } from "expo-router";

export default function FoldersStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="archives" />
      <Stack.Screen name="trash" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="delete/[id]" />
    </Stack>
  );
}
