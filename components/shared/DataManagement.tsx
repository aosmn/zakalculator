import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useThemeColor } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import { StoredAppData, ZakahState } from '@/types';
import { isStoredAppData } from '@/utils/storage';

function isValidState(obj: unknown): obj is ZakahState {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  // Exclude v2 blobs — they have a version field
  if ('version' in s) return false;
  return (
    Array.isArray(s.currencyHoldings) &&
    Array.isArray(s.metalHoldings) &&
    Array.isArray(s.exchangeRates) &&
    Array.isArray(s.payments) &&
    typeof s.priceSettings === 'object'
  );
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function DataManagement() {
  const { state, importState, importAppData } = useZakah();
  const { t } = useLanguage();
  const tint = useThemeColor({}, 'tint');
  const danger = useThemeColor({}, 'danger');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');

  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // pendingData holds parsed state waiting for user confirmation
  const [pendingData, setPendingData] = useState<ZakahState | StoredAppData | null>(null);

  function showStatus(type: 'success' | 'error', message: string) {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3500);
  }

  async function handleExport() {
    try {
      const json = JSON.stringify(state, null, 2);
      const fileName = `zakalculator-backup-${todayString()}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
        showStatus('success', t('backupDownloaded'));
        return;
      }

      const path = FileSystem.cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Export ZaKalculator backup' });
        showStatus('success', t('backupExported'));
      } else {
        showStatus('error', t('sharingUnavailable'));
      }
    } catch {
      showStatus('error', t('exportFailed'));
    }
  }

  async function handleImport() {
    if (Platform.OS === 'web') {
      // Use a native file input on web so mobile browsers show Files (not Photos).
      // accept=".json,application/json" is the most compatible combination.
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const json = await file.text();
          const parsed = JSON.parse(json);
          if (!isValidState(parsed) && !isStoredAppData(parsed)) {
            showStatus('error', t('invalidBackup'));
            return;
          }
          setPendingData(parsed);
        } catch {
          showStatus('error', t('couldNotRead'));
        }
      };
      input.click();
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const json = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const parsed = JSON.parse(json);

      if (!isValidState(parsed) && !isStoredAppData(parsed)) {
        showStatus('error', t('invalidBackup'));
        return;
      }

      setPendingData(parsed);
    } catch {
      showStatus('error', t('couldNotRead'));
    }
  }

  function confirmImport() {
    if (!pendingData) return;
    if (isStoredAppData(pendingData)) {
      importAppData(pendingData);
    } else {
      importState(pendingData as ZakahState);
    }
    setPendingData(null);
    showStatus('success', t('importSuccess'));
  }

  return (
    <View style={[styles.container, { backgroundColor: card, borderColor: border }]}>
      <Text style={[styles.title, { color: text }]}>{t('backupRestore')}</Text>
      <Text style={[styles.desc, { color: muted }]}>
        {t('backupDesc')}
      </Text>

      {pendingData ? (
        <View>
          <Text style={[styles.confirmText, { color: text }]}>
            {isStoredAppData(pendingData)
              ? t('replaceAllMsg')
              : t('replacePersonMsg')}
          </Text>
          <View style={styles.buttons}>
            <Pressable
              style={[styles.btn, styles.btnOutline, { borderColor: border }]}
              onPress={() => setPendingData(null)}>
              <Text style={[styles.btnText, { color: muted }]}>{t('cancel')}</Text>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: danger }]} onPress={confirmImport}>
              <Text style={styles.btnText}>{t('replaceBtn')}</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.buttons}>
          <Pressable style={[styles.btn, { backgroundColor: tint }]} onPress={handleExport}>
            <Text style={styles.btnText}>{t('exportBtn')}</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnOutline, { borderColor: border }]}
            onPress={handleImport}>
            <Text style={[styles.btnText, { color: text }]}>{t('importBtn')}</Text>
          </Pressable>
        </View>
      )}

      {status ? (
        <Text style={[styles.status, { color: status.type === 'success' ? tint : danger }]}>
          {status.message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 8 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  desc: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  confirmText: { fontSize: 14, marginBottom: 14, lineHeight: 20 },
  buttons: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  btnOutline: { borderWidth: 1, backgroundColor: 'transparent' },
  btnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  status: { fontSize: 13, marginTop: 12, textAlign: 'center' },
});
