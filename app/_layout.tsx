import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, View } from "react-native";

import { LockCodeModal } from "@/components/security/LockCodeModal";
import { useBootstrap } from "@/hooks/useBootstrap";
import { useTheme } from "@/hooks/useTheme";
import { verifyLockCode } from "@/lib/security";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function RootLayout() {
  const isReady = useBootstrap();
  const theme = useTheme();
  const settings = useSettingsStore((state) => state.settings);
  const [appUnlocked, setAppUnlocked] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);
  const previousAppLockEnabled = useRef(settings.appLockEnabled);
  const backgroundAtRef = useRef<number | null>(null);
  const requiresAppUnlock = Boolean(settings.appLockEnabled && settings.lockCodeHash && !appUnlocked);

  useEffect(() => {
    if (!previousAppLockEnabled.current && settings.appLockEnabled) {
      setAppUnlocked(true);
    }

    if (!settings.appLockEnabled) {
      setAppUnlocked(false);
    }

    previousAppLockEnabled.current = settings.appLockEnabled;
  }, [settings.appLockEnabled]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (!settings.appLockEnabled || !settings.lockCodeHash) {
        return;
      }

      if (nextState === "background" || nextState === "inactive") {
        backgroundAtRef.current = Date.now();

        if ((settings.appLockTimeoutMs ?? 60000) === 0) {
          setAppUnlocked(false);
        }

        return;
      }

      if (nextState === "active") {
        const backgroundAt = backgroundAtRef.current;
        backgroundAtRef.current = null;

        if (backgroundAt && Date.now() - backgroundAt >= (settings.appLockTimeoutMs ?? 60000)) {
          setAppUnlocked(false);
        }
      }
    });

    return () => subscription.remove();
  }, [settings.appLockEnabled, settings.appLockTimeoutMs, settings.lockCodeHash]);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background
        }}
      >
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme.statusBarStyle} />
      <LockCodeModal
        visible={requiresAppUnlock}
        title="App verrouillee"
        description="Entre ton code pour ouvrir BlockyNotes."
        mode="unlock"
        error={lockError}
        cancelLabel="Effacer"
        onCancel={() => setLockError(null)}
        onSubmit={(code) => {
          if (verifyLockCode(code, settings.lockCodeHash)) {
            setLockError(null);
            setAppUnlocked(true);
            return;
          }

          setLockError("Code incorrect.");
        }}
      />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings/about" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
