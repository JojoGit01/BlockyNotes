/**
 * ============================================================================
 *
 *                         JDM // ENGINEERING
 *                         JONATHAN DI MARTINO
 *                  Ingénieur Fullstack | Expert IA
 *
 * ============================================================================
 *
 * @file        settings.tsx
 * @description Renders application preferences, security settings, and data-management actions.
 *
 * @project     BlockyNotes
 * @module      Application / Navigation
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
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { LockCodeModal } from "@/components/security/LockCodeModal";
import { AppHeaderLogo } from "@/components/ui/AppHeaderLogo";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTheme } from "@/hooks/useTheme";
import { hashLockCode, verifyLockCode } from "@/lib/security";
import { buildDemoSeedData } from "@/services/demo/demoSeedData";
import { getExportableNotes, type NotesFileExportFormat } from "@/services/export/notesExport";
import { shareNotesExportFile } from "@/services/export/shareNotesExportFile";
import { getNoteLockHash, isNoteLocked } from "@/services/security/locks";
import { foldersRepository, notesRepository } from "@/storage/repositories";
import { useFoldersStore } from "@/store/useFoldersStore";
import { useNotesStore } from "@/store/useNotesStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getAppPalette } from "@/theme/appPalette";
import type { AppLockTimeout, AppSettings } from "@/types/models";

const defaultDisplayName = "BlockyNotes User";
const navy = "#0F1B3A";
const lockTimeoutOptions: { label: string; value: AppLockTimeout }[] = [
  { label: "Immediat", value: 0 },
  { label: "1 min", value: 60000 },
  { label: "5 min", value: 300000 }
];

type SecurityModalState =
  | { type: "create"; updates: Partial<AppSettings> }
  | { type: "unlock-update"; updates: Partial<AppSettings> }
  | { type: "verify-change" }
  | { type: "change" }
  | { type: "export"; format: NotesFileExportFormat }
  | null;

function SectionPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 12,
        backgroundColor: palette.surfaceMuted,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: "row",
        alignItems: "center",
        gap: 6
      }}
    >
      <Ionicons name={icon} size={12} color={palette.text} />
      <Text
        style={[
          theme.typography.caption,
          { color: palette.text, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: "900", fontSize: 11 }
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function StatCard({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <View
      style={{
        flex: 1,
        minHeight: 88,
        borderRadius: 20,
        backgroundColor: palette.surface,
        padding: 13,
        justifyContent: "space-between",
        shadowColor: palette.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 14,
          backgroundColor: iconBackground,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <View>
        <Text style={[theme.typography.label, { color: palette.textStrong, fontWeight: "900" }]}>{title}</Text>
        <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1, fontSize: 11 }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

function SettingsRow({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  onPress,
  trailing
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 15,
            backgroundColor: iconBackground,
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.h3, { color: palette.textStrong, fontSize: 16, lineHeight: 21, fontWeight: "900" }]}>{title}</Text>
          <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1, fontSize: 12 }]} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        {trailing ?? <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />}
      </View>
    </Pressable>
  );
}

function SettingsSection({ children, label, icon }: { children: React.ReactNode; label: string; icon: keyof typeof Ionicons.glyphMap }) {
  const theme = useTheme();
  const palette = getAppPalette(theme);

  return (
    <View
      style={{
        borderRadius: 24,
        backgroundColor: palette.surface,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: palette.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 5
      }}
    >
      <SectionPill icon={icon} label={label} />
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const settings = useSettingsStore((state) => state.settings);
  const updateDisplayName = useSettingsStore((state) => state.updateDisplayName);
  const updateTheme = useSettingsStore((state) => state.updateTheme);
  const updateSecurity = useSettingsStore((state) => state.updateSecurity);
  const notes = useNotesStore((state) => state.notes);
  const loadNotes = useNotesStore((state) => state.loadNotes);
  const updateNote = useNotesStore((state) => state.updateNote);
  const folders = useFoldersStore((state) => state.folders);
  const loadFolders = useFoldersStore((state) => state.loadFolders);
  const updateFolder = useFoldersStore((state) => state.updateFolder);
  const activeNotesCount = notes.filter((note) => !note.isDeleted && !note.isArchived).length;
  const archivedNotesCount = notes.filter((note) => note.isArchived && !note.isDeleted).length;
  const deletedNotesCount = notes.filter((note) => note.isDeleted).length;
  const visibleDisplayName = settings.displayName === defaultDisplayName ? "Jo" : settings.displayName;
  const [displayNameDraft, setDisplayNameDraft] = useState(visibleDisplayName);
  const [showExportModal, setShowExportModal] = useState(false);
  const [securityModal, setSecurityModal] = useState<SecurityModalState>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<NotesFileExportFormat | null>(null);

  useEffect(() => {
    setDisplayNameDraft(settings.displayName === defaultDisplayName ? "Jo" : settings.displayName);
  }, [settings.displayName]);

  const themeSubtitle = theme.mode === "dark" ? "Navy premium" : "Light premium";

  const saveDisplayName = () => {
    if (displayNameDraft !== visibleDisplayName) {
      void updateDisplayName(displayNameDraft);
    }
  };

  const cycleTheme = () => {
    void updateTheme(theme.mode === "dark" ? "light" : "dark");
  };

  const lockTimeoutLabel = lockTimeoutOptions.find((option) => option.value === (settings.appLockTimeoutMs ?? 60000))?.label ?? "1 min";
  const cycleLockTimeout = () => {
    const currentIndex = lockTimeoutOptions.findIndex((option) => option.value === (settings.appLockTimeoutMs ?? 60000));
    const nextOption = lockTimeoutOptions[(currentIndex + 1) % lockTimeoutOptions.length] ?? lockTimeoutOptions[1];
    void updateSecurity({ appLockTimeoutMs: nextOption.value });
  };

  const exportableNotes = getExportableNotes(notes);

  const getLockedExportHashes = () =>
    Array.from(
      new Set(
        exportableNotes
          .map((note) => {
            const folder = folders.find((entry) => entry.id === note.folderId);
            return isNoteLocked(note, folder, settings) ? getNoteLockHash(note, folder, settings) : null;
          })
          .filter(Boolean)
      )
    );

  const runFileExport = async (format: NotesFileExportFormat) => {
    if (exportableNotes.length === 0) {
      Alert.alert("Aucune note", "Il n'y a aucune note a exporter pour le moment.");
      return;
    }

    try {
      setExportingFormat(format);
      await shareNotesExportFile({ format, notes, folders });
      setShowExportModal(false);
    } catch {
      Alert.alert("Export impossible", "Une erreur est survenue pendant la preparation de l'export.");
    } finally {
      setExportingFormat(null);
    }
  };

  const shareExport = async (format: NotesFileExportFormat) => {
    if (exportableNotes.length === 0) {
      Alert.alert("Aucune note", "Il n'y a aucune note a exporter pour le moment.");
      return;
    }

    if (getLockedExportHashes().length > 0) {
      setSecurityError(null);
      setSecurityModal({ type: "export", format });
      return;
    }

    await runFileExport(format);
  };

  const seedDemoData = async () => {
    const seeded = buildDemoSeedData({ folders, notes });

    await Promise.all([
      foldersRepository.write(seeded.folders),
      notesRepository.write(seeded.notes)
    ]);
    await Promise.all([loadFolders(), loadNotes()]);

    Alert.alert(
      "Seeds ajoutes",
      `${seeded.summary.folders} dossiers et ${seeded.summary.notes} notes demo sont prets. Code des notes/dossiers verrouilles: ${seeded.summary.lockedCode}.`
    );
  };

  const updateSecurityWithCode = (updates: Partial<typeof settings>) => {
    const enablesLock =
      updates.appLockEnabled === true ||
      updates.lockAllNotes === true ||
      updates.lockAllFolders === true;
    const disablesLock =
      updates.appLockEnabled === false ||
      updates.lockAllNotes === false ||
      updates.lockAllFolders === false;

    if (enablesLock && !settings.lockCodeHash) {
      setSecurityError(null);
      setSecurityModal({ type: "create", updates });
      return;
    }

    if (disablesLock && settings.lockCodeHash) {
      setSecurityError(null);
      setSecurityModal({ type: "unlock-update", updates });
      return;
    }

    void updateSecurity(updates);
  };

  const securityRows = [
    {
      icon: "phone-portrait" as keyof typeof Ionicons.glyphMap,
      iconColor: "#4F6EF7",
      iconBackground: "#E4ECFF",
      title: "Verrouiller l'app",
      subtitle: settings.appLockEnabled ? "Code demande a l'ouverture" : "Desactive",
      active: Boolean(settings.appLockEnabled),
      updates: { appLockEnabled: !settings.appLockEnabled }
    },
    {
      icon: "folder" as keyof typeof Ionicons.glyphMap,
      iconColor: "#18A058",
      iconBackground: "#D8FAF1",
      title: "Tous les dossiers",
      subtitle: settings.lockAllFolders ? "Tous les dossiers demandent le code" : "Seulement les dossiers choisis",
      active: Boolean(settings.lockAllFolders),
      updates: { lockAllFolders: !settings.lockAllFolders }
    },
    {
      icon: "document-text" as keyof typeof Ionicons.glyphMap,
      iconColor: "#F97316",
      iconBackground: "#FFF1DC",
      title: "Toutes les notes",
      subtitle: settings.lockAllNotes ? "Toutes les notes demandent le code" : "Seulement les notes choisies",
      active: Boolean(settings.lockAllNotes),
      updates: { lockAllNotes: !settings.lockAllNotes }
    }
  ];

  return (
    <ScreenContainer scrollable scrollBottomPadding={96}>
      <View style={{ gap: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, marginLeft: 4 }}>
            <Text
              style={[
                theme.typography.caption,
                { color: palette.text, letterSpacing: 5, textTransform: "uppercase", fontWeight: "900" }
              ]}
            >
              Personnalisation
            </Text>
              <Text style={{ color: palette.textStrong, marginTop: 2, fontSize: 36, lineHeight: 40, fontWeight: "900" }}>
              Reglages
            </Text>
          </View>

          <AppHeaderLogo />
        </View>

        <View
          style={{
            borderRadius: 24,
            backgroundColor: palette.surface,
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            shadowColor: palette.shadow,
            shadowOpacity: 0.06,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 5
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 19,
              backgroundColor: navy,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: navy,
              shadowOpacity: 0.25,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 7
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 26, lineHeight: 31, fontWeight: "900" }}>
              {visibleDisplayName.trim().charAt(0).toUpperCase() || "J"}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <TextInput
              value={displayNameDraft}
              onChangeText={setDisplayNameDraft}
              onBlur={saveDisplayName}
              onSubmitEditing={saveDisplayName}
              placeholder="Ton nom"
              placeholderTextColor={palette.placeholder}
              style={{ color: palette.textStrong, fontSize: 22, lineHeight: 27, fontWeight: "900", padding: 0 }}
            />
            <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 1 }]}>Ton espace de notes personnel</Text>
          </View>

          <View
            style={{
              borderRadius: 14,
              backgroundColor: palette.surfaceMuted,
              paddingHorizontal: 11,
              paddingVertical: 8
            }}
          >
            <Text style={[theme.typography.caption, { color: palette.text, fontWeight: "900" }]}>Premium</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatCard
            icon="create"
            iconColor="#FF6B7A"
            iconBackground="#E9ECF3"
            title={`${activeNotesCount} note${activeNotesCount > 1 ? "s" : ""}`}
            subtitle="Actives aujourd'hui"
          />
          <StatCard
            icon="cloud-done"
            iconColor={navy}
            iconBackground="#EAF0FF"
            title="Synchro OK"
            subtitle="Sauvegarde a l'instant"
          />
        </View>

        <SettingsSection icon="list" label="Preferences">
          <SettingsRow
            icon="color-palette"
            iconColor="#FF6B7A"
            iconBackground="#E9ECF3"
            title="Theme"
            subtitle={themeSubtitle}
            onPress={cycleTheme}
          />
          <View style={{ height: 1, backgroundColor: palette.divider, marginLeft: 54 }} />
          <SettingsRow
            icon="cloud"
            iconColor="#4F6EF7"
            iconBackground="#E4ECFF"
            title="Sauvegarde"
            subtitle="Automatique et locale"
            trailing={
              <View
                style={{
                  borderRadius: 13,
                  backgroundColor: palette.surfaceMuted,
                  paddingHorizontal: 10,
                  paddingVertical: 6
                }}
              >
                <Text style={[theme.typography.caption, { color: palette.text, fontWeight: "900" }]}>Auto</Text>
              </View>
            }
          />
          <View style={{ height: 1, backgroundColor: palette.divider, marginLeft: 54 }} />
          <SettingsRow
            icon="notifications"
            iconColor="#F59E0B"
            iconBackground="#FFF1DC"
            title="Notifications"
            subtitle="Rappels sur les notes"
            trailing={
              <View
                style={{
                  borderRadius: 13,
                  backgroundColor: palette.surfaceMuted,
                  paddingHorizontal: 10,
                  paddingVertical: 6
                }}
              >
                <Text style={[theme.typography.caption, { color: palette.text, fontWeight: "900" }]}>Soon</Text>
              </View>
            }
          />
        </SettingsSection>

        <SettingsSection icon="lock-closed" label="Securite">
          {securityRows.map((row, index) => (
            <View key={row.title}>
              {index > 0 ? <View style={{ height: 1, backgroundColor: palette.divider, marginLeft: 54 }} /> : null}
              <SettingsRow
                icon={row.icon}
                iconColor={row.iconColor}
                iconBackground={row.iconBackground}
                title={row.title}
                subtitle={row.subtitle}
                onPress={() => updateSecurityWithCode(row.updates)}
                trailing={
                  <View
                    style={{
                      width: 38,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: row.active ? row.iconBackground : palette.surfaceMuted,
                      alignItems: row.active ? "flex-end" : "flex-start",
                      justifyContent: "center",
                      paddingHorizontal: 4
                    }}
                  >
                    <View
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        backgroundColor: row.active ? row.iconColor : palette.textMuted
                      }}
                    />
                  </View>
                }
              />
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: palette.divider, marginLeft: 54 }} />
          <SettingsRow
            icon="timer"
            iconColor="#7C4DFF"
            iconBackground="#F0E6FF"
            title="Delai de verrouillage"
            subtitle={`Reverrouillage apres ${lockTimeoutLabel}`}
            onPress={cycleLockTimeout}
            trailing={
              <View
                style={{
                  borderRadius: 13,
                  backgroundColor: palette.surfaceMuted,
                  paddingHorizontal: 10,
                  paddingVertical: 6
                }}
              >
                <Text style={[theme.typography.caption, { color: palette.text, fontWeight: "900" }]}>{lockTimeoutLabel}</Text>
              </View>
            }
          />
          {settings.lockCodeHash ? (
            <>
              <View style={{ height: 1, backgroundColor: palette.divider, marginLeft: 54 }} />
              <SettingsRow
                icon="key"
                iconColor="#7C4DFF"
                iconBackground="#F0E6FF"
                title="Changer le code"
                subtitle="Modifier le code de securite"
                onPress={() => {
                  setSecurityError(null);
                  setSecurityModal({ type: "verify-change" });
                }}
              />
            </>
          ) : null}
        </SettingsSection>

        <SettingsSection icon="sparkles" label="Notes">
          <SettingsRow
            icon="download"
            iconColor="#4F6EF7"
            iconBackground="#D8FAF1"
            title="Exporter mes notes"
            subtitle="PDF, Markdown, texte brut, JSON"
            onPress={() => setShowExportModal(true)}
          />
          <View style={{ height: 1, backgroundColor: palette.divider, marginLeft: 54 }} />
          <SettingsRow
            icon="flask"
            iconColor="#7C4DFF"
            iconBackground="#F0E6FF"
            title="Ajouter donnees demo"
            subtitle="20 notes, 5 dossiers, verrouillage et archives"
            onPress={() => void seedDemoData()}
          />
          <View style={{ height: 1, backgroundColor: palette.divider, marginLeft: 54 }} />
          <SettingsRow
            icon="archive"
            iconColor={navy}
            iconBackground="#E9ECF3"
            title="Archives"
            subtitle={`${archivedNotesCount} note${archivedNotesCount > 1 ? "s" : ""} archivee${archivedNotesCount > 1 ? "s" : ""}`}
            onPress={() => router.push("/(tabs)/folders/archives")}
          />
          <View style={{ height: 1, backgroundColor: palette.divider, marginLeft: 54 }} />
          <SettingsRow
            icon="trash-outline"
            iconColor="#FF3434"
            iconBackground="#FFF1DC"
            title="Corbeille"
            subtitle={`${deletedNotesCount} note${deletedNotesCount > 1 ? "s" : ""} supprimee${deletedNotesCount > 1 ? "s" : ""}`}
            onPress={() => router.push("/(tabs)/folders/trash")}
          />
        </SettingsSection>
      </View>
      <LockCodeModal
        visible={securityModal !== null}
        title={
          securityModal?.type === "change"
            ? "Nouveau code"
            : securityModal?.type === "create"
              ? "Creer un code"
              : securityModal?.type === "export"
                ? "Export securise"
                : "Confirmer le code"
        }
        description={
          securityModal?.type === "change"
            ? "Entre le nouveau code de securite."
            : securityModal?.type === "create"
              ? "Ce code servira pour l'app, les dossiers et les notes verrouilles."
              : securityModal?.type === "export"
                ? "Cet export contient des notes verrouillees. Entre le code pour generer le fichier."
                : "Entre le code actuel pour continuer."
        }
        mode={securityModal?.type === "create" || securityModal?.type === "change" ? "create" : "unlock"}
        confirmLabel={
          securityModal?.type === "change"
            ? "Changer"
            : securityModal?.type === "create"
              ? "Activer"
              : securityModal?.type === "export"
                ? "Exporter"
                : "Confirmer"
        }
        error={securityError}
        onCancel={() => {
          setSecurityModal(null);
          setSecurityError(null);
        }}
        onSubmit={(code) => {
          if (securityModal?.type === "create") {
            void updateSecurity({ ...securityModal.updates, lockCodeHash: hashLockCode(code) });
            setSecurityModal(null);
            return;
          }

          if (securityModal?.type === "unlock-update") {
            if (!verifyLockCode(code, settings.lockCodeHash)) {
              setSecurityError("Code incorrect.");
              return;
            }

            void updateSecurity(securityModal.updates);
            setSecurityModal(null);
            setSecurityError(null);
            return;
          }

          if (securityModal?.type === "verify-change") {
            if (!verifyLockCode(code, settings.lockCodeHash)) {
              setSecurityError("Code incorrect.");
              return;
            }

            setSecurityError(null);
            setSecurityModal({ type: "change" });
            return;
          }

          if (securityModal?.type === "change") {
            const nextHash = hashLockCode(code);
            void Promise.all([
              updateSecurity({ lockCodeHash: nextHash }),
              ...notes.filter((note) => note.isLocked).map((note) => updateNote(note.id, { lockCodeHash: nextHash })),
              ...folders.filter((folder) => folder.isLocked).map((folder) => updateFolder(folder.id, { lockCodeHash: nextHash }))
            ]);
            setSecurityModal(null);
            setSecurityError(null);
          }

          if (securityModal?.type === "export") {
            const lockedHashes = getLockedExportHashes();

            if (lockedHashes.some((hash) => !verifyLockCode(code, hash))) {
              setSecurityError("Code incorrect pour les notes verrouillees.");
              return;
            }

            const format = securityModal.format;
            setSecurityModal(null);
            setSecurityError(null);
            void runFileExport(format);
          }
        }}
      />
      <Modal visible={showExportModal} transparent animationType="slide" onRequestClose={() => setShowExportModal(false)}>
        <Pressable
          onPress={() => setShowExportModal(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15, 27, 58, 0.22)",
            justifyContent: "flex-end"
          }}
        >
          <Pressable
            onPress={() => undefined}
            style={{
              backgroundColor: palette.surface,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 28,
              gap: 18
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 48,
                height: 5,
                borderRadius: 4,
                backgroundColor: palette.isDark ? "rgba(255,255,255,0.26)" : "#C9CBD5"
              }}
            />

            <View style={{ gap: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 18,
                    backgroundColor: "#E4ECFF",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Ionicons name="download-outline" size={22} color="#4F6EF7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: palette.text, fontSize: 27, lineHeight: 34, fontWeight: "900" }}>
                    Exporter mes notes
                  </Text>
                  <Text style={[theme.typography.body, { color: palette.textMuted }]}>
                    {exportableNotes.length} note{exportableNotes.length > 1 ? "s" : ""} prete{exportableNotes.length > 1 ? "s" : ""} a exporter.
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 10 }}>
                {[
                  {
                    format: "pdf" as NotesFileExportFormat,
                    icon: "document-outline" as keyof typeof Ionicons.glyphMap,
                    title: "PDF",
                    subtitle: "Fichier propre a sauvegarder ou envoyer",
                    color: "#4F6EF7",
                    iconBackground: "#E4ECFF",
                    badge: "PDF"
                  },
                  {
                    format: "markdown" as NotesFileExportFormat,
                    icon: "logo-markdown" as keyof typeof Ionicons.glyphMap,
                    title: "Markdown",
                    subtitle: "Ideal pour Notion, GitHub ou Obsidian",
                    color: "#7C4DFF",
                    iconBackground: "#F0E6FF",
                    badge: "MD"
                  },
                  {
                    format: "text" as NotesFileExportFormat,
                    icon: "document-text-outline" as keyof typeof Ionicons.glyphMap,
                    title: "Texte brut",
                    subtitle: "Simple a lire et a partager",
                    color: "#18A058",
                    iconBackground: "#D8FAF1",
                    badge: "TXT"
                  },
                  {
                    format: "json" as NotesFileExportFormat,
                    icon: "code-slash-outline" as keyof typeof Ionicons.glyphMap,
                    title: "JSON",
                    subtitle: "Format structure pour backup ou import",
                    color: "#F97316",
                    iconBackground: "#FFF1DC",
                    badge: "DEV"
                  }
                ].map((option, index, options) => (
                  <View key={option.format}>
                    <Pressable
                      disabled={exportableNotes.length === 0 || exportingFormat !== null}
                      onPress={() => void shareExport(option.format)}
                      style={({ pressed }) => ({
                        minHeight: 66,
                        paddingVertical: 9,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        opacity: exportableNotes.length === 0 ? 0.46 : pressed ? 0.78 : 1
                      })}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 16,
                          backgroundColor: option.iconBackground,
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Ionicons name={option.icon} size={18} color={option.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                          <Text style={[theme.typography.h3, { color: palette.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }]}>
                            {option.title}
                          </Text>
                          <View
                            style={{
                              borderRadius: 9,
                              backgroundColor: option.color,
                              paddingHorizontal: 6,
                              paddingVertical: 2
                            }}
                          >
                            <Text style={[theme.typography.caption, { color: "#FFFFFF", fontSize: 9, fontWeight: "900" }]}>
                              {option.badge}
                            </Text>
                          </View>
                        </View>
                        <Text style={[theme.typography.caption, { color: palette.textMuted, marginTop: 2 }]} numberOfLines={1}>
                          {option.subtitle}
                        </Text>
                      </View>
                      {exportingFormat === option.format ? (
                        <ActivityIndicator size="small" color={option.color} />
                      ) : (
                        <Ionicons name="share-outline" size={18} color={option.color} />
                      )}
                    </Pressable>
                    {index < options.length - 1 ? (
                      <View style={{ height: 1, backgroundColor: palette.divider, marginLeft: 56 }} />
                    ) : null}
                  </View>
                ))}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

