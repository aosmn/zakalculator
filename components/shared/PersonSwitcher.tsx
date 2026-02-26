import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from '@/components/Themed';
import { useZakah } from '@/context/ZakahContext';
import { useLanguage } from '@/context/LanguageContext';

type SheetMode = 'list' | 'add' | 'rename';

export default function PersonSwitcher() {
  const { people, activePerson, switchPerson, addPerson, renamePerson, deletePerson } = useZakah();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<SheetMode>('list');
  const [inputValue, setInputValue] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const { t } = useLanguage();
  const bg = useThemeColor({}, 'card');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');

  function openSheet() {
    setMode('list');
    setInputValue('');
    setRenamingId(null);
    setDeleteTarget(null);
    setIsOpen(true);
  }

  function closeSheet() {
    setIsOpen(false);
    setMode('list');
    setInputValue('');
    setRenamingId(null);
    setDeleteTarget(null);
  }

  function handleSwitch(id: string) {
    if (id !== activePerson.id) switchPerson(id);
    closeSheet();
  }

  function handleAddPress() {
    setInputValue('');
    setMode('add');
  }

  function handleAddConfirm() {
    const name = inputValue.trim();
    if (!name) return;
    addPerson(name);
    closeSheet();
  }

  function handleRenamePress(id: string, currentName: string) {
    setRenamingId(id);
    setInputValue(currentName);
    setMode('rename');
  }

  function handleRenameConfirm() {
    const name = inputValue.trim();
    if (!name || !renamingId) return;
    renamePerson(renamingId, name);
    closeSheet();
  }

  function handleDeletePress(id: string, name: string) {
    setDeleteTarget({ id, name });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deletePerson(deleteTarget.id);
    setDeleteTarget(null);
  }

  const displayName =
    activePerson.name.length > 12 ? activePerson.name.slice(0, 12) + '…' : activePerson.name;

  return (
    <>
      {/* Header trigger */}
      <Pressable style={styles.trigger} onPress={openSheet} hitSlop={8}>
        <FontAwesome name="user-o" size={16} color={text} />
        <Text style={[styles.triggerName, { color: text }]}>{displayName}</Text>
        <FontAwesome name="chevron-down" size={10} color={muted} />
      </Pressable>

      {/* Bottom-sheet modal */}
      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={styles.overlay} onPress={closeSheet}>
          <Pressable style={[styles.sheet, { backgroundColor: bg }]}>

            {/* ── List mode ── */}
            {mode === 'list' && !deleteTarget && (
              <>
                <View style={[styles.sheetHeader, { borderBottomColor: border }]}>
                  <View style={styles.titleGroup}>
                    <Text style={[styles.sheetTitle, { color: text }]}>{t('people')}</Text>
                    <Text style={[styles.sheetDesc, { color: muted }]}>{t('peopleSectionDesc')}</Text>
                  </View>
                  <Pressable onPress={handleAddPress} hitSlop={8}>
                    <FontAwesome name="plus" size={18} color={tint} />
                  </Pressable>
                </View>
                <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                  {people.map((person) => {
                    const isActive = person.id === activePerson.id;
                    return (
                      <Pressable
                        key={person.id}
                        style={[styles.personRow, isActive && { backgroundColor: tint + '18' }]}
                        onPress={() => handleSwitch(person.id)}>
                        <View style={styles.personRowLeft}>
                          {isActive ? (
                            <FontAwesome name="check" size={14} color={tint} style={styles.checkIcon} />
                          ) : (
                            <View style={styles.checkPlaceholder} />
                          )}
                          <Text style={[styles.personName, { color: isActive ? tint : text }]}>
                            {person.name}
                          </Text>
                        </View>
                        <View style={styles.rowActions}>
                          <Pressable
                            onPress={() => handleRenamePress(person.id, person.name)}
                            hitSlop={8}
                            style={styles.actionBtn}>
                            <FontAwesome name="pencil" size={14} color={muted} />
                          </Pressable>
                          {!isActive && people.length > 1 && (
                            <Pressable
                              onPress={() => handleDeletePress(person.id, person.name)}
                              hitSlop={8}
                              style={styles.actionBtn}>
                              <Feather name="trash-2" size={15} color={danger} />
                            </Pressable>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <Pressable style={[styles.cancelBtn, { borderTopColor: border }]} onPress={closeSheet}>
                  <Text style={[styles.cancelText, { color: muted }]}>{t('cancel')}</Text>
                </Pressable>
              </>
            )}

            {/* ── Delete confirmation ── */}
            {mode === 'list' && deleteTarget && (
              <>
                <Text style={[styles.sheetTitle, { color: text, marginBottom: 8 }]}>{t('deleteTitle', { name: deleteTarget.name })}</Text>
                <Text style={[styles.deleteMsg, { color: muted }]}>
                  {t('deletePersonMsg')}
                </Text>
                <Pressable style={[styles.actionBtn, { backgroundColor: danger }]} onPress={handleDeleteConfirm}>
                  <Text style={styles.actionBtnText}>{t('deletePerson')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: border }]}
                  onPress={() => setDeleteTarget(null)}>
                  <Text style={[styles.actionBtnText, { color: text }]}>{t('cancel')}</Text>
                </Pressable>
              </>
            )}

            {/* ── Add mode ── */}
            {mode === 'add' && (
              <>
                <Text style={[styles.sheetTitle, { color: text, marginBottom: 16 }]}>{t('addPerson')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: border, color: text, backgroundColor: bg }]}
                  placeholder={t('nameField')}
                  placeholderTextColor={muted}
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoFocus
                  onSubmitEditing={handleAddConfirm}
                  returnKeyType="done"
                />
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: inputValue.trim() ? tint : border }]}
                  onPress={handleAddConfirm}
                  disabled={!inputValue.trim()}>
                  <Text style={styles.actionBtnText}>{t('addBtn')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: border }]}
                  onPress={() => setMode('list')}>
                  <Text style={[styles.actionBtnText, { color: muted }]}>{t('back')}</Text>
                </Pressable>
              </>
            )}

            {/* ── Rename mode ── */}
            {mode === 'rename' && (
              <>
                <Text style={[styles.sheetTitle, { color: text, marginBottom: 16 }]}>{t('renamePerson')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: border, color: text, backgroundColor: bg }]}
                  placeholder={t('nameField')}
                  placeholderTextColor={muted}
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoFocus
                  onSubmitEditing={handleRenameConfirm}
                  returnKeyType="done"
                />
                <Pressable
                  style={[styles.actionBtn, { backgroundColor: inputValue.trim() ? tint : border }]}
                  onPress={handleRenameConfirm}
                  disabled={!inputValue.trim()}>
                  <Text style={styles.actionBtnText}>{t('doneBtn')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: border }]}
                  onPress={() => setMode('list')}>
                  <Text style={[styles.actionBtnText, { color: muted }]}>{t('back')}</Text>
                </Pressable>
              </>
            )}

          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  triggerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 4,
  },
  titleGroup: {
    flex: 1,
    marginRight: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sheetDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  list: {
    flexGrow: 0,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  personRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkIcon: {
    width: 20,
  },
  checkPlaceholder: {
    width: 20,
  },
  personName: {
    fontSize: 16,
    fontWeight: '500',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  cancelBtn: {
    borderTopWidth: 1,
    paddingTop: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  deleteMsg: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 14,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
