/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        replay.tsx
 * @description Renders Blocky Replay summaries, weekly activity, memories, and notes to resume.
 *
 * @project     BlockyNotes
 * @module      Application / Core
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
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { getReplayInsights } from "@/services/notes/noteInsights";
import { useNotesStore } from "@/store/useNotesStore";
import { getAppPalette } from "@/theme/appPalette";
import type { Note } from "@/types/models";

function ReplayNote({ icon, label, note }: { icon: keyof typeof Ionicons.glyphMap; label: string; note: Note }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/notes/${note.id}`)}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, opacity: pressed ? 0.8 : 1 })}
    >
      <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: "#E4ECFF", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={20} color="#4F6EF7" />
      </View>
      <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: palette.divider, paddingVertical: 13 }}>
        <Text style={[theme.typography.caption, { color: palette.textMuted, fontWeight: "900" }]}>{label}</Text>
        <Text style={[theme.typography.h3, { color: palette.text, fontWeight: "900", marginTop: 2 }]} numberOfLines={1}>{note.title || "Sans titre"}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={palette.textMuted} />
    </Pressable>
  );
}

export default function ReplayScreen() {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const notes = useNotesStore((state) => state.notes);
  const insights = getReplayInsights(notes);

  return (
    <ScreenContainer scrollable scrollBottomPadding={24}>
      <View style={{ gap: 22 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable accessibilityLabel="Retour" onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="arrow-back" size={18} color={palette.text} />
          </Pressable>
          <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: "#EFE6FF", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="sparkles" size={20} color="#7C4DFF" />
          </View>
        </View>

        <View>
          <Text style={[theme.typography.caption, { color: "#7C4DFF", letterSpacing: 4, textTransform: "uppercase", fontWeight: "900" }]}>Blocky Replay</Text>
          <Text style={{ color: palette.text, fontSize: 34, lineHeight: 40, fontWeight: "900", marginTop: 4 }}>Ta semaine en notes</Text>
          <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 4 }]}>Un resume calme pour reprendre le fil sans chercher.</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { label: "Modifiees", value: insights.touchedThisWeek, color: "#4F6EF7", background: "#E4ECFF", icon: "create-outline" as const },
            { label: "Creees", value: insights.createdThisWeek, color: "#18A058", background: "#D8FAF1", icon: "add-circle-outline" as const },
            { label: "Inbox", value: insights.inboxCount, color: "#F97316", background: "#FFF1DC", icon: "mail-unread-outline" as const }
          ].map((stat) => (
            <View key={stat.label} style={{ flex: 1, minHeight: 112, borderRadius: 20, backgroundColor: palette.surface, padding: 13, borderWidth: 1, borderColor: palette.border }}>
              <View style={{ width: 32, height: 32, borderRadius: 12, backgroundColor: stat.background, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={stat.icon} size={15} color={stat.color} />
              </View>
              <Text style={{ color: palette.text, fontSize: 24, lineHeight: 28, fontWeight: "900", marginTop: 8 }}>{stat.value}</Text>
              <Text style={[theme.typography.caption, { color: palette.textMuted }]} numberOfLines={1}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {insights.resume || insights.memory ? (
          <View style={{ gap: 4 }}>
            <Text style={{ color: palette.text, fontSize: 20, lineHeight: 25, fontWeight: "900", marginBottom: 6 }}>A retrouver</Text>
            {insights.resume ? <ReplayNote icon="play-circle-outline" label="A reprendre" note={insights.resume} /> : null}
            {insights.memory ? <ReplayNote icon="time-outline" label="Souvenir de tes notes" note={insights.memory} /> : null}
          </View>
        ) : (
          <EmptyState title="Le Replay se construit" description="Continue a noter. Les souvenirs et reprises apparaitront avec le temps." icon="sparkles-outline" />
        )}
      </View>
    </ScreenContainer>
  );
}
