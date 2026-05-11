import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { isValidLockCode, normalizeLockCode } from "@/lib/security";
import { getAppPalette } from "@/theme/appPalette";

interface LockCodeModalProps {
  visible: boolean;
  title: string;
  description: string;
  mode: "create" | "unlock";
  confirmLabel?: string;
  cancelLabel?: string;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (code: string) => void;
}

export function LockCodeModal({
  visible,
  title,
  description,
  mode,
  confirmLabel,
  cancelLabel,
  error,
  onCancel,
  onSubmit
}: LockCodeModalProps) {
  const theme = useTheme();
  const palette = getAppPalette(theme);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (visible) {
      setCode("");
    }
  }, [visible]);

  const normalizedCode = normalizeLockCode(code);
  const canSubmit = mode === "unlock" ? normalizedCode.length > 0 : isValidLockCode(normalizedCode);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(15, 27, 58, 0.26)",
          justifyContent: "center",
          paddingHorizontal: 20
        }}
      >
        <View
          style={{
            borderRadius: 28,
            backgroundColor: palette.surface,
            padding: 22,
            gap: 16,
            borderWidth: 1,
            borderColor: palette.border
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 18,
              backgroundColor: palette.surfaceMuted,
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name={mode === "create" ? "lock-closed-outline" : "keypad-outline"} size={21} color={palette.text} />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={[theme.typography.h2, { color: palette.text, fontWeight: "900" }]}>{title}</Text>
            <Text style={[theme.typography.body, { color: palette.textMuted, lineHeight: 24 }]}>{description}</Text>
          </View>

          <TextInput
            value={code}
            onChangeText={(value) => setCode(normalizeLockCode(value))}
            autoFocus
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            placeholder={mode === "create" ? "Code a 4 chiffres min." : "Code"}
            placeholderTextColor={palette.placeholder}
            style={[
              theme.typography.h3,
              {
                minHeight: 56,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: error ? theme.colors.danger : palette.border,
                color: palette.text,
                paddingHorizontal: 16,
                letterSpacing: 3
              }
            ]}
          />

          {error ? <Text style={[theme.typography.caption, { color: theme.colors.danger, fontWeight: "800" }]}>{error}</Text> : null}

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={() => {
                setCode("");
                onCancel();
              }}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 52,
                borderRadius: 18,
                backgroundColor: palette.surfaceMuted,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.82 : 1
              })}
            >
              <Text style={[theme.typography.label, { color: palette.text, fontWeight: "900" }]}>{cancelLabel ?? "Annuler"}</Text>
            </Pressable>

            <Pressable
              disabled={!canSubmit}
              onPress={() => onSubmit(normalizedCode)}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 52,
                borderRadius: 18,
                backgroundColor: "#0F1B3A",
                alignItems: "center",
                justifyContent: "center",
                opacity: !canSubmit ? 0.4 : pressed ? 0.82 : 1
              })}
            >
              <Text style={[theme.typography.label, { color: "#FFFFFF", fontWeight: "900" }]}>{confirmLabel ?? "Valider"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
