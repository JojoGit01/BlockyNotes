/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        [id].tsx
 * @description Confirms and executes deletion of an individual note.
 *
 * @project     BlockyNotes
 * @module      Application / Notes
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
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { useNotesStore } from "@/store/useNotesStore";
import { getAppPalette } from "@/theme/appPalette";

export default function DeleteNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const note = useNotesStore((state) => state.notes.find((entry) => entry.id === id));
  const deleteNote = useNotesStore((state) => state.deleteNote);

  if (!note) {
    return (
      <ScreenContainer>
        <EmptyState title="Note introuvable" description="Cette note n'existe plus." />
      </ScreenContainer>
    );
  }

  const handleConfirm = async () => {
    await deleteNote(note.id);
    router.replace("/notes");
  };

  return (
    <ScreenContainer scrollable>
      <View style={{ gap: theme.spacing.lg, paddingBottom: 120 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.lg }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: palette.surface,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="close" size={20} color={palette.text} />
          </Pressable>

          <Text style={[theme.typography.h3, { color: palette.text }]}>Supprimer la note</Text>
        </View>

        <AppCard
          style={{
            borderRadius: 28,
            paddingHorizontal: 22,
            paddingVertical: 24,
            backgroundColor: palette.surface
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: "#F8DDD3",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#8E4B38" />
            </View>
          </View>

          <Text style={[theme.typography.h2, { color: palette.text, textAlign: "center", marginTop: 18 }]}>
            Supprimer &quot;{note.title || "Sans titre"}&quot; ?
          </Text>
          <Text
            style={[
              theme.typography.body,
              { color: palette.textMuted, textAlign: "center", marginTop: theme.spacing.md, lineHeight: 30 }
            ]}
          >
            La note sera envoyee dans la corbeille et pourra etre restauree pendant 30 jours.
          </Text>

          <View style={{ flexDirection: "row", gap: theme.spacing.sm, marginTop: 22 }}>
            <Pressable
              onPress={() => router.back()}
              style={{
                flex: 1,
                minHeight: 42,
                borderRadius: 18,
                backgroundColor: palette.surfaceMuted,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={[theme.typography.label, { color: palette.text }]}>Annuler</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleConfirm()}
              style={{
                flex: 1,
                minHeight: 42,
                borderRadius: 18,
                backgroundColor: "#0F1B3A",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Text style={[theme.typography.label, { color: "#FFFFFF" }]}>Confirmer</Text>
            </Pressable>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
