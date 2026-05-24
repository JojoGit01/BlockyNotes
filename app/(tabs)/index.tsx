import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/ui/AppBackground";
import { AppHeaderLogo } from "@/components/ui/AppHeaderLogo";
import { useTheme } from "@/hooks/useTheme";
import { getFolderIcon } from "@/services/folders/folderIcon";
import { getNoteIcon } from "@/services/notes/noteIcon";
import { searchNotesService } from "@/services/notes/searchNotes";
import { isNoteLocked } from "@/services/security/locks";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useUIStore } from "@/store/useUIStore";
import { getAppPalette } from "@/theme/appPalette";
import type { Folder, Note } from "@/types/models";

const navy = "#0F1B3A";

const includesQuery = (value: string, query: string) => value.toLowerCase().includes(query.toLowerCase());

function HighlightText({
  query,
  style,
  text
}: {
  query: string;
  style: object;
  text: string;
}) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return (
      <Text style={style} numberOfLines={1}>
        {text}
      </Text>
    );
  }

  const index = text.toLowerCase().indexOf(trimmedQuery.toLowerCase());

  if (index === -1) {
    return (
      <Text style={style} numberOfLines={1}>
        {text}
      </Text>
    );
  }

  return (
    <Text style={style} numberOfLines={1}>
      {text.slice(0, index)}
      <Text style={{ color: "#4F6EF7" }}>{text.slice(index, index + trimmedQuery.length)}</Text>
      {text.slice(index + trimmedQuery.length)}
    </Text>
  );
}

const noteDateLabel = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

const noteElementCount = (note: Note) => {
  const count = note.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;

  return Math.max(count, note.title.trim() ? 1 : 0);
};

function StatItem({
  icon,
  color,
  background,
  label,
  value
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  label: string;
  value: number;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 13,
          backgroundColor: background,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 5, fontWeight: "800", fontSize: 11 }]}>{label}</Text>
      <Text style={{ color: palette.text, fontSize: 18, lineHeight: 22, fontWeight: "900", marginTop: 1 }}>{value}</Text>
    </View>
  );
}

function HomeNoteRow({ note, query = "" }: { note: Note; query?: string }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const settings = useSettingsStore((state) => state.settings);
  const folder = useFoldersStore((state) => state.folders.find((entry) => entry.id === note.folderId));
  const noteIcon = getNoteIcon(note);
  const locked = isNoteLocked(note, folder, settings);
  const elementCount = noteElementCount(note);
  const meta =
    locked
      ? "Contenu masque - code requis"
      : elementCount > 1
      ? `${elementCount} elements - ${noteDateLabel(note.updatedAt)}`
      : `${noteDateLabel(note.updatedAt)} - Mode jour par jour`;

  return (
    <Pressable
      onPress={() => router.push(`/notes/${note.id}`)}
      style={({ pressed }) => ({
        minHeight: 68,
        borderRadius: 20,
        backgroundColor: palette.surface,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: pressed ? 0.88 : 1,
        shadowColor: palette.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5
      })}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 16,
          backgroundColor: noteIcon.backgroundColor,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={locked ? "lock-closed" : noteIcon.icon} size={19} color={locked ? "#0F1B3A" : noteIcon.color} />
      </View>
      <View style={{ flex: 1 }}>
        <HighlightText
          query={query}
          text={note.title || "Sans titre"}
          style={[theme.typography.h3, { color: palette.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }]}
        />
        <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      {locked ? (
        <View
          style={{
            borderRadius: 12,
            backgroundColor: "#E4ECFF",
            paddingHorizontal: 8,
            paddingVertical: 5,
            flexDirection: "row",
            alignItems: "center",
            gap: 4
          }}
        >
          <Ionicons name="shield-checkmark" size={12} color="#4F6EF7" />
          <Text style={[theme.typography.caption, { color: "#4F6EF7", fontWeight: "900", fontSize: 10 }]}>Secure</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
    </Pressable>
  );
}

function HomeFolderRow({ folder, query }: { folder: Pick<Folder, "id" | "iconKey" | "name"> | { id: null; name: string }; query: string }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const folderIcon = folder.id ? getFolderIcon(folder) : null;

  return (
    <Pressable
      onPress={() => router.push(folder.id ? { pathname: "/folders/[id]", params: { id: folder.id } } : "/folders/personal")}
      style={({ pressed }) => ({
        minHeight: 64,
        borderRadius: 20,
        backgroundColor: palette.surface,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: pressed ? 0.88 : 1,
        shadowColor: palette.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 15,
          backgroundColor: folderIcon?.backgroundColor ?? "#E4ECFF",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={folderIcon?.icon ?? "folder-open-outline"} size={18} color={folderIcon?.color ?? "#4F6EF7"} />
      </View>
      <View style={{ flex: 1 }}>
        <HighlightText query={query} text={folder.name} style={[theme.typography.h3, { color: palette.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }]} />
        <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]}>Dossier</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
    </Pressable>
  );
}

function SearchSection({ children, count, icon, title }: { children: ReactNode; count: number; icon: keyof typeof Ionicons.glyphMap; title: string }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  if (count === 0) {
    return null;
  }

  return (
    <View style={{ gap: 9 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4 }}>
        <Ionicons name={icon} size={15} color={palette.textMuted} />
        <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900", flex: 1 }]}>{title}</Text>
        <Text style={[theme.typography.caption, { color: palette.textMuted, fontWeight: "900" }]}>{count}</Text>
      </View>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const insets = useSafeAreaInsets();
  const notes = useNotesStore((state) => state.notes);
  const folders = useFoldersStore((state) => state.folders);
  const displayName = useSettingsStore((state) => state.settings.displayName);
  const searchQuery = useUIStore((state) => state.searchQuery);
  const setSearchQuery = useUIStore((state) => state.setSearchQuery);
  const visibleDisplayName = displayName === "BlockyNotes User" ? "Jo" : displayName.trim();
  const activeNotes = notes.filter((note) => !note.isDeleted && !note.isArchived);
  const pinnedNotes = activeNotes
    .filter((note) => note.isPinned)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 2);
  const favoriteNotesCount = activeNotes.filter((note) => note.isFavorite).length;
  const recentNotes = activeNotes
    .filter((note) => !note.isPinned)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3);
  const trimmedSearchQuery = searchQuery.trim();
  const activeSearchResults = trimmedSearchQuery
    ? searchNotesService(activeNotes, trimmedSearchQuery).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4)
    : [];
  const folderSearchResults = trimmedSearchQuery
    ? ([{ id: null, name: "Personnel" }, ...folders] as (Pick<Folder, "id" | "iconKey" | "name"> | { id: null; name: string })[])
        .filter((folder) => includesQuery(folder.name, trimmedSearchQuery))
        .slice(0, 4)
    : [];
  const archiveSearchResults = trimmedSearchQuery
    ? searchNotesService(
        notes.filter((note) => note.isArchived && !note.isDeleted),
        trimmedSearchQuery
      )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 4)
    : [];
  const trashSearchResults = trimmedSearchQuery
    ? searchNotesService(
        notes.filter((note) => note.isDeleted),
        trimmedSearchQuery
      )
        .sort((a, b) => (b.deletedAt ?? b.updatedAt).localeCompare(a.deletedAt ?? a.updatedAt))
        .slice(0, 4)
    : [];
  const totalSearchResults =
    activeSearchResults.length + folderSearchResults.length + archiveSearchResults.length + trashSearchResults.length;
  const floatingButtonBottom = insets.bottom + 90;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppBackground />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: floatingButtonBottom + 34 }}>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <View style={{ flex: 1, marginLeft: 4 }}>
              <Text
                style={[
                  theme.typography.caption,
                  { color: palette.text, letterSpacing: 5, textTransform: "uppercase", fontWeight: "900" }
                ]}
              >
                Bonjour
              </Text>
              <Text style={{ color: palette.text, marginTop: 2, fontSize: 36, lineHeight: 40, fontWeight: "900" }}>
                {visibleDisplayName || "Jo"}
              </Text>
            </View>

            <AppHeaderLogo />
          </View>

          <View
            style={{
              minHeight: 76,
              borderRadius: 22,
              backgroundColor: navy,
              overflow: "hidden",
              paddingHorizontal: 14,
              paddingVertical: 12,
              justifyContent: "center",
              shadowColor: navy,
              shadowOpacity: 0.14,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 9 },
              elevation: 7
            }}
          >
            <View
              style={{
                position: "absolute",
                right: -34,
                top: -22,
                width: 150,
                height: 150,
                borderRadius: 75,
                backgroundColor: "rgba(255,255,255,0.08)"
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  backgroundColor: "#8B4DFF",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Ionicons name="sparkles" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 20, lineHeight: 24, fontWeight: "900" }}>BlockyNotes</Text>
                <Text style={[theme.typography.caption, { color: "#FFFFFF", marginTop: 2 }]} numberOfLines={1}>
                  Notes, journal & dossiers.
                </Text>
              </View>
              <View
                style={{
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  paddingHorizontal: 9,
                  paddingVertical: 6
                }}
              >
                <Text style={[theme.typography.caption, { color: "#FFFFFF", fontWeight: "900" }]}>Premium</Text>
              </View>
            </View>
          </View>

          <View
            style={{
              minHeight: 74,
              borderRadius: 20,
              backgroundColor: palette.surface,
              paddingHorizontal: 10,
              paddingVertical: 8,
              flexDirection: "row",
              shadowColor: palette.shadow,
              shadowOpacity: 0.06,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 5
            }}
          >
            <StatItem icon="document-text" color="#6F4DFF" background="#EFE5FF" label="Notes" value={activeNotes.length} />
            <View style={{ width: 1, backgroundColor: palette.divider, marginVertical: 10 }} />
            <StatItem icon="star" color="#F97316" background="#FFF1DC" label="Favoris" value={favoriteNotesCount} />
            <View style={{ width: 1, backgroundColor: palette.divider, marginVertical: 10 }} />
            <StatItem icon="folder" color="#0F766E" background="#D8FAF1" label="Dossiers" value={folders.length + 1} />
          </View>

          <View
            style={{
              minHeight: 54,
              borderRadius: 20,
              backgroundColor: palette.surface,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              gap: 12,
              shadowColor: palette.shadow,
              shadowOpacity: 0.05,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
              elevation: 5
            }}
          >
            <Ionicons name="search-outline" size={17} color="#7B7F89" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => router.push("/notes")}
              placeholder="Recherche globale..."
              placeholderTextColor={palette.placeholder}
              returnKeyType="search"
              style={[theme.typography.body, { flex: 1, color: palette.text, paddingVertical: 8 }]}
            />
            {trimmedSearchQuery ? (
              <Pressable
                onPress={() => setSearchQuery("")}
                hitSlop={8}
                style={({ pressed }) => ({
                  width: 30,
                  height: 30,
                  borderRadius: 12,
                  backgroundColor: "#FFE6E6",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.82 : 1
                })}
              >
                <Ionicons name="close" size={16} color="#FF3434" />
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => router.push("/notes")}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 13,
                backgroundColor: palette.surfaceMuted,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.82 : 1
              })}
            >
              <Ionicons name="list" size={18} color={palette.text} />
            </Pressable>
          </View>

          {trimmedSearchQuery ? (
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: palette.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>Recherche</Text>
                <Pressable onPress={() => router.push("/notes")}>
                  <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Voir tout</Text>
                </Pressable>
              </View>
              {totalSearchResults > 0 ? (
                <>
                  <SearchSection count={activeSearchResults.length} icon="document-text" title="Notes">
                    {activeSearchResults.map((note) => (
                      <HomeNoteRow key={note.id} note={note} query={trimmedSearchQuery} />
                    ))}
                  </SearchSection>
                  <SearchSection count={folderSearchResults.length} icon="folder" title="Dossiers">
                    {folderSearchResults.map((folder) => (
                      <HomeFolderRow key={folder.id ?? "personal"} folder={folder} query={trimmedSearchQuery} />
                    ))}
                  </SearchSection>
                  <SearchSection count={archiveSearchResults.length} icon="archive" title="Archives">
                    {archiveSearchResults.map((note) => (
                      <HomeNoteRow key={note.id} note={note} query={trimmedSearchQuery} />
                    ))}
                  </SearchSection>
                  <SearchSection count={trashSearchResults.length} icon="trash-outline" title="Corbeille">
                    {trashSearchResults.map((note) => (
                      <HomeNoteRow key={note.id} note={note} query={trimmedSearchQuery} />
                    ))}
                  </SearchSection>
                </>
              ) : (
                <View
                  style={{
                    borderRadius: 20,
                    backgroundColor: palette.surface,
                    padding: 14,
                    shadowColor: palette.shadow,
                    shadowOpacity: 0.05,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 10 },
                    elevation: 5
                  }}
                >
                  <Text style={[theme.typography.body, { color: palette.textMuted }]}>Aucune note trouvee.</Text>
                </View>
              )}
            </View>
          ) : (
            <>
              {pinnedNotes.length > 0 ? (
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: palette.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>Epinglees</Text>
                    <Pressable onPress={() => router.push("/notes")}>
                      <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Voir tout</Text>
                    </Pressable>
                  </View>
                  {pinnedNotes.map((note) => (
                    <HomeNoteRow key={note.id} note={note} />
                  ))}
                </View>
              ) : null}

              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: palette.text, fontSize: 20, lineHeight: 25, fontWeight: "900" }}>Recemment modifiees</Text>
                  <Pressable onPress={() => router.push("/notes")}>
                    <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>Voir tout</Text>
                  </Pressable>
                </View>
                {recentNotes.length > 0 ? (
                  recentNotes.map((note) => <HomeNoteRow key={note.id} note={note} />)
                ) : (
                  <View
                    style={{
                      borderRadius: 20,
                      backgroundColor: palette.surface,
                      padding: 14,
                      shadowColor: palette.shadow,
                      shadowOpacity: 0.05,
                      shadowRadius: 18,
                      shadowOffset: { width: 0, height: 10 },
                      elevation: 5
                    }}
                  >
                    <Text style={[theme.typography.body, { color: palette.textMuted }]}>Aucune note recente pour le moment.</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => router.push("/notes/new")}
        style={({ pressed }) => ({
          position: "absolute",
          right: 24,
          bottom: floatingButtonBottom,
          width: 58,
          height: 58,
          borderRadius: 21,
          backgroundColor: navy,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.9 : 1,
          shadowColor: navy,
          shadowOpacity: 0.26,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 12
        })}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}
