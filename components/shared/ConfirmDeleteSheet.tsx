import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';

interface Props {
  visible: boolean;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteSheet({ visible, itemName, onConfirm, onCancel }: Props) {
  const bg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const danger = useThemeColor({}, 'danger');
  const muted = useThemeColor({}, 'muted');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <View style={[styles.sheet, { backgroundColor: bg }]}>
          <Text style={[styles.title, { color: text }]}>Delete {itemName ?? 'item'}?</Text>
          <Text style={[styles.subtitle, { color: muted }]}>This action cannot be undone.</Text>
          <Pressable style={[styles.btn, { backgroundColor: danger }]} onPress={onConfirm}>
            <Text style={styles.btnText}>Delete</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.cancel]} onPress={onCancel}>
            <Text style={[styles.btnText, { color: text }]}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  cancel: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ccc' },
  btnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
