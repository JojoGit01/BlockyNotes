/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        capture.tsx
 * @description Implements fast Inbox capture for ideas, shared text, and source links.
 *
 * @project     BlockyNotes
 * @module      Application / Notes
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
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { hapticSuccess } from "@/lib/haptics";
import { useNotesStore } from "@/store/useNotesStore";
import { getAppPalette } from "@/theme/appPalette";

const paramValue = (value?: string | string[]) => (Array.isArray(value) ? value[0] ?? "" : value ?? "");

export default function QuickCaptureScreen() {
  const params = useLocalSearchParams<{ content?: string | string[]; sourceUrl?: string | string[]; title?: string | string[] }>();
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const createNote = useNotesStore((state) => state.createNote);
  const sharedContent = paramValue(params.content);
  const sharedSourceUrl = paramValue(params.sourceUrl);
  const contentIsUrl = !sharedSourceUrl && /^https?:\/\/\S+$/i.test(sharedContent.trim());
  const [title, setTitle] = useState(() => paramValue(params.title));
  const [content, setContent] = useState(() => (contentIsUrl ? "" : sharedContent));
  const [sourceUrl, setSourceUrl] = useState(() => (contentIsUrl ? sharedContent.trim() : sharedSourceUrl));
  const [saving, setSaving] = useState(false);
  const canSave = useMemo(
    () => Boolean(title.trim() || content.trim() || sourceUrl.trim()),
    [content, sourceUrl, title]
  );

  const saveCapture = async () => {
    if (!canSave || saving) {
      return;
    }

    setSaving(true);
    const note = await createNote({
      title: title.trim() || (sourceUrl.trim() ? "Lien a lire" : "Capture rapide"),
      content,
      sourceUrl,
      noteMode: "free",
      dailyEntries: [],
      iconKey: sourceUrl.trim() ? "document" : "auto",
      isInbox: true,
      folderId: null
    });
    void hapticSuccess();
    router.replace(`/notes/${note.id}`);
  };

  return (
    <ScreenContainer
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="always"
      scrollable
      scrollBottomPadding={24}
    >
      <View style={{ flex: 1, gap: 18 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable
            accessibilityLabel="Fermer la capture"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 16,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="close" size={19} color={palette.text} />
          </Pressable>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <Ionicons name="mail-unread" size={15} color="#4F6EF7" />
            <Text style={[theme.typography.label, { color: "#4F6EF7", fontWeight: "900" }]}>Inbox</Text>
          </View>
        </View>

        <View>
          <Text style={[theme.typography.caption, { color: "#7C4DFF", letterSpacing: 4, textTransform: "uppercase", fontWeight: "900" }]}>Capture</Text>
          <Text style={{ color: palette.text, fontSize: 34, lineHeight: 40, fontWeight: "900", marginTop: 4 }}>Note rapide</Text>
          <Text style={[theme.typography.body, { color: palette.textMuted, marginTop: 4 }]}>{"Pose l'idee maintenant, organise-la plus tard."}</Text>
        </View>

        <View style={{ gap: 12 }}>
          <TextInput
            accessibilityLabel="Titre de la capture"
            autoFocus={!content && !sourceUrl}
            value={title}
            onChangeText={setTitle}
            placeholder="Titre (optionnel)"
            placeholderTextColor={palette.placeholder}
            style={{
              minHeight: 58,
              borderRadius: 18,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              color: palette.text,
              fontSize: 20,
              fontWeight: "800",
              paddingHorizontal: 16
            }}
          />
          <TextInput
            accessibilityLabel="Contenu de la capture"
            autoFocus={Boolean(content || sourceUrl)}
            value={content}
            onChangeText={setContent}
            placeholder="Une idee, une tache, une phrase..."
            placeholderTextColor={palette.placeholder}
            multiline
            selectionColor="#4F6EF7"
            textAlignVertical="top"
            style={{
              minHeight: 230,
              borderRadius: 20,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border,
              color: palette.text,
              fontSize: 17,
              lineHeight: 26,
              padding: 16
            }}
          />
          {sourceUrl ? (
            <View style={{ minHeight: 54, borderRadius: 18, backgroundColor: palette.surfaceMuted, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Ionicons name="link" size={17} color="#18A058" />
              <Text style={[theme.typography.body, { color: palette.text, flex: 1 }]} numberOfLines={1}>{sourceUrl}</Text>
              <Pressable accessibilityLabel="Retirer le lien" onPress={() => setSourceUrl("")} hitSlop={8}>
                <Ionicons name="close-circle" size={19} color={palette.textMuted} />
              </Pressable>
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityLabel="Enregistrer dans l'Inbox"
          accessibilityRole="button"
          disabled={!canSave || saving}
          onPress={() => void saveCapture()}
          style={({ pressed }) => ({
            minHeight: 58,
            borderRadius: 19,
            backgroundColor: canSave ? "#0F1B3A" : palette.surfaceMuted,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            opacity: pressed ? 0.86 : 1
          })}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Ionicons name="arrow-down-circle" size={20} color={canSave ? "#FFFFFF" : palette.textMuted} />}
          <Text style={[theme.typography.label, { color: canSave ? "#FFFFFF" : palette.textMuted, fontWeight: "900" }]}>{"Enregistrer dans l'Inbox"}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
