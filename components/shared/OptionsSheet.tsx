import { useThemeColor } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeToggle } from "@/context/ThemeContext";
import { useZakah } from "@/context/ZakahContext";
import { StoredAppData, ZakahState } from "@/types";
import { isStoredAppData } from "@/utils/storage";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function isValidState(obj: unknown): obj is ZakahState {
  if (!obj || typeof obj !== "object") return false;
  const s = obj as Record<string, unknown>;
  if ("version" in s) return false;
  return (
    Array.isArray(s.currencyHoldings) &&
    Array.isArray(s.metalHoldings) &&
    Array.isArray(s.exchangeRates) &&
    Array.isArray(s.payments) &&
    typeof s.priceSettings === "object"
  );
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function OptionsSheet({ visible, onClose }: Props) {
  const { state, importState, importAppData } = useZakah();
  const { lang, setLang, t } = useLanguage();
  const { toggleTheme } = useThemeToggle();
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  const [pendingData, setPendingData] = useState<
    ZakahState | StoredAppData | null
  >(null);
  const [backupStatus, setBackupStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const bg = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");
  const tint = useThemeColor({}, "tint");
  const border = useThemeColor({}, "border");
  const danger = useThemeColor({}, "danger");

  const insets = useSafeAreaInsets();

  function showBackupStatus(type: "success" | "error", message: string) {
    setBackupStatus({ type, message });
    setTimeout(() => setBackupStatus(null), 3500);
  }

  async function handleExport() {
    try {
      const json = JSON.stringify(state, null, 2);
      const fileName = `zakalculator-backup-${todayString()}.json`;
      if (Platform.OS === "web") {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        showBackupStatus("success", t("backupDownloaded"));
        return;
      }
      if (Platform.OS === "android") {
        const perms =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!perms.granted) return;
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          perms.directoryUri,
          fileName,
          "application/json",
        );
        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          fileUri,
          json,
        );
        showBackupStatus("success", t("backupExported"));
        return;
      }
      const dir =
        FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? "";
      const path = dir + fileName;
      await FileSystem.writeAsStringAsync(path, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, {
          mimeType: "application/json",
          UTI: "public.json",
          dialogTitle: "Export ZaKalculator backup",
        });
        showBackupStatus("success", t("backupExported"));
      } else {
        showBackupStatus("error", t("sharingUnavailable"));
      }
    } catch {
      showBackupStatus("error", t("exportFailed"));
    }
  }

  async function handleImport() {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const parsed = JSON.parse(await file.text());
          if (!isValidState(parsed) && !isStoredAppData(parsed)) {
            showBackupStatus("error", t("invalidBackup"));
            return;
          }
          setPendingData(parsed);
        } catch {
          showBackupStatus("error", t("couldNotRead"));
        }
      };
      input.click();
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === "android" ? "*/*" : "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      let json: string;
      try {
        json = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } catch {
        const response = await fetch(asset.uri);
        json = await response.text();
      }
      const parsed = JSON.parse(json);
      if (!isValidState(parsed) && !isStoredAppData(parsed)) {
        showBackupStatus("error", t("invalidBackup"));
        return;
      }
      setPendingData(parsed);
    } catch {
      showBackupStatus("error", t("couldNotRead"));
    }
  }

  function confirmImport() {
    if (!pendingData) return;
    if (isStoredAppData(pendingData)) importAppData(pendingData);
    else importState(pendingData as ZakahState);
    setPendingData(null);
    showBackupStatus("success", t("importSuccess"));
  }

  function close() {
    onClose();
  }

  const isDark = colorScheme === "dark";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: bg, paddingBottom: 40 + insets.bottom },
          ]}
        >
          {/* ── Language + Color mode + Backup ── */}
          <>
            {/* Language */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <Feather name="globe" size={15} color={muted} />
                <Text style={[styles.toggleLabelText, { color: text }]}>
                  {t("language")}
                </Text>
              </View>
              <View style={styles.pills}>
                {(["en", "ar"] as const).map((l) => (
                  <Pressable
                    key={l}
                    style={[
                      styles.pill,
                      {
                        borderColor: lang === l ? tint : border,
                        backgroundColor:
                          lang === l ? tint + "18" : "transparent",
                      },
                    ]}
                    onPress={() => setLang(l)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: lang === l ? tint : muted },
                      ]}
                    >
                      {l === "en" ? "EN" : "AR"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Color mode */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <Feather
                  name={isDark ? "moon" : "sun"}
                  size={15}
                  color={muted}
                />
                <Text style={[styles.toggleLabelText, { color: text }]}>
                  Color Mode
                </Text>
              </View>
              <View style={styles.pills}>
                {([false, true] as const).map((dark) => (
                  <Pressable
                    key={String(dark)}
                    style={[
                      styles.pill,
                      {
                        borderColor: isDark === dark ? tint : border,
                        backgroundColor:
                          isDark === dark ? tint + "18" : "transparent",
                      },
                    ]}
                    onPress={() => {
                      if (isDark !== dark) toggleTheme();
                    }}
                  >
                    <Feather
                      name={dark ? "moon" : "sun"}
                      size={13}
                      color={isDark === dark ? tint : muted}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: border }]} />

            {/* Prices & Rates */}
            <Pressable
              style={styles.toggleRow}
              onPress={() => {
                onClose();
                router.push("/prices");
              }}
            >
              <View style={styles.toggleLabel}>
                <Feather name="sliders" size={15} color={muted} />
                <Text style={[styles.toggleLabelText, { color: text }]}>
                  {t("pricesRates")}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={muted} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: border }]} />

            {/* Backup & Restore */}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLabel}>
                <Feather name="archive" size={15} color={muted} />
                <Text style={[styles.toggleLabelText, { color: text }]}>
                  {t("backupRestore")}
                </Text>
              </View>
            </View>
            <Text style={[styles.backupDesc, { color: muted }]}>
              {t("backupDesc")}
            </Text>
            {pendingData ? (
              <>
                <Text
                  style={[
                    styles.toggleLabelText,
                    { color: text, marginBottom: 8 },
                  ]}
                >
                  {isStoredAppData(pendingData)
                    ? t("replaceAllMsg")
                    : t("replacePersonMsg")}
                </Text>
                <View style={styles.backupButtons}>
                  <Pressable
                    style={[
                      styles.backupBtn,
                      styles.backupBtnOutline,
                      { borderColor: border },
                    ]}
                    onPress={() => setPendingData(null)}
                  >
                    <Text style={[styles.backupBtnText, { color: muted }]}>
                      {t("cancel")}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.backupBtn, { backgroundColor: danger }]}
                    onPress={confirmImport}
                  >
                    <Text style={styles.backupBtnText}>{t("replaceBtn")}</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.backupButtons}>
                <Pressable
                  style={[styles.backupBtn, { backgroundColor: tint }]}
                  onPress={handleExport}
                >
                  <Text style={styles.backupBtnText}>{t("exportBtn")}</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.backupBtn,
                    styles.backupBtnOutline,
                    { borderColor: border },
                  ]}
                  onPress={handleImport}
                >
                  <Text style={[styles.backupBtnText, { color: text }]}>
                    {t("importBtn")}
                  </Text>
                </Pressable>
              </View>
            )}
            {backupStatus && (
              <Text
                style={[
                  styles.backupStatus,
                  { color: backupStatus.type === "success" ? tint : danger },
                ]}
              >
                {backupStatus.message}
              </Text>
            )}
          </>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },

  divider: { height: 1, marginVertical: 16 },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  toggleLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  toggleLabelText: { fontSize: 15, fontWeight: "500" },
  pills: { flexDirection: "row", gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillText: { fontSize: 13, fontWeight: "700" },

  backupDesc: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  backupButtons: { flexDirection: "row", gap: 10 },
  backupBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  backupBtnOutline: { borderWidth: 1, backgroundColor: "transparent" },
  backupBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  backupStatus: { fontSize: 13, marginTop: 10, textAlign: "center" },
});
