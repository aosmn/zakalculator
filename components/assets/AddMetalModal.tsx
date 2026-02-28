import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useThemeColor } from '@/components/Themed';
import GradientButton from '@/components/shared/GradientButton';
import FormInput from '@/components/shared/FormInput';
import PickerRow from '@/components/shared/PickerRow';
import { MetalHolding } from '@/types';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  visible: boolean;
  defaultType?: 'gold' | 'silver';
  editing?: MetalHolding;
  onClose: () => void;
}

const GOLD_KARATS = [
  { label: '24k', value: 24 },
  { label: '22k', value: 22 },
  { label: '21k', value: 21 },
  { label: '18k', value: 18 },
  { label: '14k', value: 14 },
  { label: '12k', value: 12 },
  { label: '10k', value: 10 },
];

const SILVER_PURITY = [
  { label: '99.9%', value: 99.9 },
  { label: '92.5%', value: 92.5 },
  { label: '80%', value: 80 },
];

export default function AddMetalModal({ visible, defaultType = 'gold', editing, onClose }: Props) {
  const { addMetalHolding, updateMetalHolding } = useZakah();
  const { t } = useLanguage();
  const bg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');

  const [label, setLabel] = useState('');
  const [type, setType] = useState<'gold' | 'silver'>(defaultType);
  const [weight, setWeight] = useState('');
  const [purity, setPurity] = useState<number>(type === 'gold' ? 24 : 99.9);
  const [purityUnit, setPurityUnit] = useState<'karats' | 'percentage'>(
    type === 'gold' ? 'karats' : 'percentage'
  );

  useEffect(() => {
    if (editing) {
      setLabel(editing.label);
      setType(editing.type);
      setWeight(String(editing.weightGrams));
      setPurity(editing.purity);
      setPurityUnit(editing.purityUnit);
    } else {
      setLabel('');
      setType(defaultType);
      setWeight('');
      const defaultPurity = defaultType === 'gold' ? 24 : 99.9;
      setPurity(defaultPurity);
      setPurityUnit(defaultType === 'gold' ? 'karats' : 'percentage');
    }
  }, [editing, visible, defaultType]);

  // When type changes, reset purity defaults
  useEffect(() => {
    if (!editing) {
      setPurity(type === 'gold' ? 24 : 99.9);
      setPurityUnit(type === 'gold' ? 'karats' : 'percentage');
    }
  }, [type]);

  function handleSave() {
    const parsedWeight = parseFloat(weight);
    if (!label.trim() || isNaN(parsedWeight) || parsedWeight <= 0) return;
    const data = { label: label.trim(), type, weightGrams: parsedWeight, purity, purityUnit };
    if (editing) {
      updateMetalHolding(editing.id, data);
    } else {
      addMetalHolding(data);
    }
    onClose();
  }

  const purityOptions =
    type === 'gold'
      ? GOLD_KARATS
      : SILVER_PURITY;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior="padding" style={styles.kav}>
          <Pressable style={[styles.sheet, { backgroundColor: bg }]}>
            <Text style={[styles.title, { color: text }]}>
              {editing ? t('editMetalTitle') : t('addMetalTitle')}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FormInput
                label={t('weightGrams')}
                placeholder="0.00"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
              <PickerRow
                label={t('type')}
                options={[{ label: t('goldOption'), value: 'gold' }, { label: t('silverOption'), value: 'silver' }]}
                value={type}
                onChange={(v) => setType(v as 'gold' | 'silver')}
              />
              <FormInput label={t('labelField')} placeholder="e.g. Gold Ring" value={label} onChangeText={setLabel} />
              <PickerRow
                label={type === 'gold' ? t('purityKarats') : t('purityPercent')}
                options={purityOptions}
                value={purity}
                onChange={(v) => setPurity(Number(v))}
              />
            </ScrollView>
            <GradientButton
              label={editing ? t('update') : t('add')}
              onPress={handleSave}
              style={styles.saveBtn}
            />
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: muted }]}>{t('cancel')}</Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  kav: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 15 },
});
