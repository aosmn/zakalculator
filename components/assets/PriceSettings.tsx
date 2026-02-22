import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';
import FormInput from '@/components/shared/FormInput';
import SectionHeader from '@/components/shared/SectionHeader';
import ConfirmDeleteSheet from '@/components/shared/ConfirmDeleteSheet';
import CurrencyPickerSheet from '@/components/shared/CurrencyPickerSheet';
import { ExchangeRate } from '@/types';
import SectionSeparator from '@/components/shared/SectionSeparator';

const GOLD_KARATS = [24, 22, 21, 18, 14, 12, 10];

export default function PriceSettings() {
  const {
    state,
    updatePriceSettings,
    addExchangeRate,
    updateExchangeRate,
    deleteExchangeRate,
  } = useZakah();
  const { priceSettings, exchangeRates } = state;

  const { t } = useLanguage();
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');

  const [goldPrice, setGoldPrice] = useState(String(priceSettings.goldPricePerGram));
  const [silverPrice, setSilverPrice] = useState(String(priceSettings.silverPricePerGram));

  // Per-purity gold price drafts
  const [purityPriceDrafts, setPurityPriceDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      GOLD_KARATS.map((k) => [String(k), String(priceSettings.goldPurityPrices?.[k] ?? '')])
    )
  );

  // Sync local drafts when context loads from storage or after an import
  useEffect(() => {
    setGoldPrice(String(priceSettings.goldPricePerGram));
    setSilverPrice(String(priceSettings.silverPricePerGram));
    setPurityPriceDrafts(
      Object.fromEntries(
        GOLD_KARATS.map((k) => [String(k), String(priceSettings.goldPurityPrices?.[k] ?? '')])
      )
    );
  }, [priceSettings]);

  // Exchange rate form
  const [rateFrom, setRateFrom] = useState('');
  const [rateValue, setRateValue] = useState('');
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);

  // Currency picker state: 'base' | 'rateFrom' | null
  const [pickerTarget, setPickerTarget] = useState<'base' | 'rateFrom' | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ExchangeRate | null>(null);

  function applyPrices() {
    updatePriceSettings({
      goldPricePerGram: parseFloat(goldPrice) || priceSettings.goldPricePerGram,
      silverPricePerGram: parseFloat(silverPrice) || priceSettings.silverPricePerGram,
    });
  }

  function applyPurityPrice(karat: number) {
    const raw = purityPriceDrafts[String(karat)];
    const parsed = parseFloat(raw);
    const next = { ...(priceSettings.goldPurityPrices ?? {}) };
    if (raw === '' || isNaN(parsed)) {
      delete next[String(karat)];
    } else {
      next[String(karat)] = parsed;
    }
    updatePriceSettings({ goldPurityPrices: next });
  }

  function handlePickerSelect(code: string) {
    if (pickerTarget === 'base') {
      updatePriceSettings({ baseCurrency: code });
    } else if (pickerTarget === 'rateFrom') {
      setRateFrom(code);
    }
    setPickerTarget(null);
  }

  function handleAddOrUpdateRate() {
    const parsed = parseFloat(rateValue);
    if (!rateFrom.trim() || isNaN(parsed)) return;
    if (editingRate) {
      updateExchangeRate(editingRate.id, { fromCurrency: rateFrom, rate: parsed });
      setEditingRate(null);
    } else {
      addExchangeRate({ fromCurrency: rateFrom, rate: parsed });
    }
    setRateFrom('');
    setRateValue('');
  }

  function startEditRate(rate: ExchangeRate) {
    setEditingRate(rate);
    setRateFrom(rate.fromCurrency);
    setRateValue(String(rate.rate));
  }

  return (
    <View>
      <SectionHeader title={t('baseCurrencySection')} />
      <Text style={[styles.sectionDesc, { color: muted }]}>{t('baseCurrencyDesc')}</Text>

      {/* Base currency dropdown */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: muted }]}>{t('baseCurrencyLabel')}</Text>
        <Pressable
          style={[styles.currencyBtn, { borderColor: border, backgroundColor: card }]}
          onPress={() => setPickerTarget('base')}>
          <Text style={[styles.currencyCode, { color: text }]}>{priceSettings.baseCurrency}</Text>
          <Text style={[styles.chevron, { color: muted }]}>▾</Text>
        </Pressable>
      </View>

      <SectionSeparator />
      <SectionHeader title={t('metalPrices')} />
      <Text style={[styles.sectionDesc, { color: muted }]}>{t('metalPricesDesc')}</Text>

      <FormInput
        label={t('goldPriceLabel', { currency: priceSettings.baseCurrency })}
        value={goldPrice}
        onChangeText={setGoldPrice}
        keyboardType="decimal-pad"
        onBlur={applyPrices}
      />

      {/* Per-purity gold prices */}
      <Text style={[styles.subHeader, { color: muted }]}>{t('goldPurityPricesLabel')}</Text>
      <Text style={[styles.hint, { color: muted }]}>
        {t('goldPurityHint')}
      </Text>
      {GOLD_KARATS.filter((k) => k !== 24).map((karat) => {
        const derived = ((karat / 24) * (parseFloat(goldPrice) || priceSettings.goldPricePerGram)).toFixed(2);
        return (
          <View key={karat} style={styles.purityRow}>
            <Text style={[styles.karatLabel, { color: text }]}>{karat}k</Text>
            <TextInput
              style={[styles.purityInput, { borderColor: border, color: text, backgroundColor: card }]}
              placeholder={`~${derived}`}
              placeholderTextColor={muted}
              value={purityPriceDrafts[String(karat)]}
              onChangeText={(v) => setPurityPriceDrafts((prev) => ({ ...prev, [String(karat)]: v }))}
              keyboardType="decimal-pad"
              onBlur={() => applyPurityPrice(karat)}
            />
            <Text style={[styles.currencyLabel, { color: muted }]}>{priceSettings.baseCurrency}</Text>
          </View>
        );
      })}

      <FormInput
        label={t('silverPriceLabel', { currency: priceSettings.baseCurrency })}
        value={silverPrice}
        onChangeText={setSilverPrice}
        keyboardType="decimal-pad"
        onBlur={applyPrices}
        style={{ marginTop: 8 }}
      />

      <SectionSeparator />
      <SectionHeader title={t('exchangeRates')} />
      <Text style={[styles.sectionDesc, { color: muted }]}>
        {t('exchangeRateDesc', { base: priceSettings.baseCurrency })}
      </Text>

      {exchangeRates.map((rate) => (
        <View key={rate.id} style={[styles.rateRow, { backgroundColor: card, borderColor: border }]}>
          <Pressable style={styles.rateInfo} onPress={() => startEditRate(rate)}>
            <Text style={[styles.rateText, { color: text }]}>
              1 {rate.fromCurrency} = {rate.rate} {priceSettings.baseCurrency}
            </Text>
          </Pressable>
          <Pressable onPress={() => setDeleteTarget(rate)} hitSlop={8}>
            <Text style={[styles.deleteIcon, { color: danger }]}>✕</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.rateInputRow}>
        {/* "From" currency dropdown */}
        <View style={styles.rateInputFrom}>
          <Text style={[styles.fieldLabel, { color: muted }]}>{t('from')}</Text>
          <Pressable
            style={[styles.currencyBtn, { borderColor: border, backgroundColor: card }]}
            onPress={() => setPickerTarget('rateFrom')}>
            <Text style={[styles.currencyCode, { color: rateFrom ? text : muted }]}>
              {rateFrom || t('select')}
            </Text>
            <Text style={[styles.chevron, { color: muted }]}>▾</Text>
          </Pressable>
        </View>
        <View style={styles.rateInputVal}>
          <FormInput
            label={t('rate')}
            placeholder="0.00"
            value={rateValue}
            onChangeText={setRateValue}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <Pressable style={[styles.addRateBtn, { backgroundColor: tint }]} onPress={handleAddOrUpdateRate}>
        <Text style={styles.addRateBtnText}>{editingRate ? t('updateRate') : t('addRate')}</Text>
      </Pressable>
      {editingRate && (
        <Pressable
          onPress={() => { setEditingRate(null); setRateFrom(''); setRateValue(''); }}
          style={styles.cancelEdit}>
          <Text style={[styles.cancelText, { color: muted }]}>{t('cancelEdit')}</Text>
        </Pressable>
      )}

      <ConfirmDeleteSheet
        visible={!!deleteTarget}
        itemName={deleteTarget ? `${deleteTarget.fromCurrency} rate` : ''}
        onConfirm={() => { if (deleteTarget) deleteExchangeRate(deleteTarget.id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />

      <CurrencyPickerSheet
        visible={pickerTarget !== null}
        selected={pickerTarget === 'base' ? priceSettings.baseCurrency : rateFrom}
        onSelect={handlePickerSelect}
        onClose={() => setPickerTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  currencyBtn: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  currencyCode: { fontSize: 16, fontWeight: '600' },
  chevron: { fontSize: 16 },
  subHeader: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  hint: { fontSize: 12, marginBottom: 10 },
  sectionDesc: { fontSize: 12, marginBottom: 14, marginTop: -6 },
  purityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  karatLabel: { fontSize: 15, fontWeight: '700', width: 36 },
  purityInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 15 },
  currencyLabel: { fontSize: 13, fontWeight: '600', width: 40 },
  rateRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  rateInfo: { flex: 1 },
  rateText: { fontSize: 15 },
  deleteIcon: { fontSize: 18, fontWeight: '700', paddingHorizontal: 4 },
  rateInputRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  rateInputFrom: { flex: 1 },
  rateInputVal: { flex: 2 },
  addRateBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  addRateBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelEdit: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 14 },
});
