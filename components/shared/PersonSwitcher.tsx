import { useThemeColor } from "@/components/Themed";
import GradientButton, {
  GRADIENT_DANGER,
} from "@/components/shared/GradientButton";
import { useLanguage } from "@/context/LanguageContext";
import { useZakah } from "@/context/ZakahContext";
import { Feather } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SheetMode = "list" | "add" | "rename";

export default function PersonSwitcher() {
  const {
    people,
    activePerson,
    switchPerson,
    addPerson,
    renamePerson,
    deletePerson,
  } = useZakah();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<SheetMode>("list");
  const [inputValue, setInputValue] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { t, lang } = useLanguage();
  const isRTL = lang === "ar";
  const rowDir = isRTL ? "row-reverse" : "row";
  const bg = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");
  const tint = useThemeColor({}, "tint");
  const border = useThemeColor({}, "border");
  const danger = useThemeColor({}, "danger");

  const insets = useSafeAreaInsets();

  function openSheet() {
    setMode("list");
    setInputValue("");
    setRenamingId(null);
    setDeleteTarget(null);
    setIsOpen(true);
  }

  function closeSheet() {
    setIsOpen(false);
    setMode("list");
    setInputValue("");
    setRenamingId(null);
    setDeleteTarget(null);
  }

  function handleSwitch(id: string) {
    if (id !== activePerson.id) switchPerson(id);
    closeSheet();
  }

  function handleAddPress() {
    setInputValue("");
    setMode("add");
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
    setMode("rename");
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
    activePerson.name.length > 12
      ? activePerson.name.slice(0, 12) + "…"
      : activePerson.name;

  return (
    <>
      {/* Header trigger */}
      <Pressable style={styles.trigger} onPress={openSheet} hitSlop={8}>
        <FontAwesome name="user-o" size={16} color={text} />
        <Text style={[styles.triggerName, { color: text }]}>{displayName}</Text>
        <FontAwesome name="chevron-down" size={10} color={muted} />
      </Pressable>

      {/* Bottom-sheet modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={closeSheet}
      >
        <Pressable style={styles.overlay} onPress={closeSheet}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: bg, paddingBottom: 24 + insets.bottom },
            ]}
          >
            {/* ── List mode ── */}
            {mode === "list" && !deleteTarget && (
              <>
                <View
                  style={[
                    styles.sheetHeader,
                    { borderBottomColor: border, flexDirection: rowDir },
                  ]}
                >
                  <View style={styles.titleGroup}>
                    <Text
                      style={[
                        styles.sheetTitle,
                        { color: text, textAlign: isRTL ? "right" : "left" },
                      ]}
                    >
                      {t("people")}
                    </Text>
                    <Text
                      style={[
                        styles.sheetDesc,
                        { color: muted, textAlign: isRTL ? "right" : "left" },
                      ]}
                    >
                      {t("peopleSectionDesc")}
                    </Text>
                  </View>
                  <Pressable onPress={handleAddPress} hitSlop={8}>
                    <FontAwesome name="plus" size={18} color={tint} />
                  </Pressable>
                </View>
                <ScrollView
                  style={styles.list}
                  keyboardShouldPersistTaps="handled"
                >
                  {people.map((person) => {
                    const isActive = person.id === activePerson.id;
                    return (
                      <Pressable
                        key={person.id}
                        style={[
                          styles.personRow,
                          { flexDirection: rowDir },
                          isActive && { backgroundColor: tint + "18" },
                        ]}
                        onPress={() => handleSwitch(person.id)}
                      >
                        <View
                          style={[
                            styles.personRowLeft,
                            { flexDirection: rowDir },
                          ]}
                        >
                          {isActive ? (
                            <FontAwesome
                              name="check"
                              size={14}
                              color={tint}
                              style={[styles.checkIcon]}
                            />
                          ) : (
                            <View style={styles.checkPlaceholder} />
                          )}
                          <Text
                            style={[
                              styles.personName,
                              {
                                color: isActive ? tint : text,
                                textAlign: isRTL ? "right" : "left",
                              },
                            ]}
                          >
                            {person.name}
                          </Text>
                        </View>
                        <View style={styles.rowActions}>
                          <Pressable
                            onPress={() =>
                              handleRenamePress(person.id, person.name)
                            }
                            hitSlop={8}
                            style={styles.iconBtn}
                          >
                            <FontAwesome
                              name="pencil"
                              size={14}
                              color={muted}
                            />
                          </Pressable>
                          {!isActive && people.length > 1 && (
                            <Pressable
                              onPress={() =>
                                handleDeletePress(person.id, person.name)
                              }
                              hitSlop={8}
                              style={styles.iconBtn}
                            >
                              <Feather
                                name="trash-2"
                                size={15}
                                color={danger}
                              />
                            </Pressable>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <Pressable
                  style={[styles.cancelBtn, { borderTopColor: border }]}
                  onPress={closeSheet}
                >
                  <Text style={[styles.cancelText, { color: muted }]}>
                    {t("cancel")}
                  </Text>
                </Pressable>
              </>
            )}

            {/* ── Delete confirmation ── */}
            {mode === "list" && deleteTarget && (
              <>
                <Text
                  style={[
                    styles.sheetTitle,
                    {
                      color: text,
                      marginBottom: 8,
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                >
                  {t("deleteTitle", { name: deleteTarget.name })}
                </Text>
                <Text
                  style={[
                    styles.deleteMsg,
                    { color: muted, textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {t("deletePersonMsg")}
                </Text>
                <GradientButton
                  label={t("deletePerson")}
                  onPress={handleDeleteConfirm}
                  colors={GRADIENT_DANGER}
                  style={styles.actionBtn}
                />
                <Pressable
                  style={[
                    styles.actionBtn,
                    styles.actionBtnOutline,
                    { borderColor: border },
                  ]}
                  onPress={() => setDeleteTarget(null)}
                >
                  <Text style={[styles.actionBtnText, { color: text }]}>
                    {t("cancel")}
                  </Text>
                </Pressable>
              </>
            )}

            {/* ── Add mode ── */}
            {mode === "add" && (
              <>
                <Text
                  style={[
                    styles.sheetTitle,
                    {
                      color: text,
                      marginBottom: 16,
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                >
                  {t("addPerson")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: border, color: text, backgroundColor: bg },
                  ]}
                  placeholder={t("nameField")}
                  placeholderTextColor={muted}
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoFocus
                  onSubmitEditing={handleAddConfirm}
                  returnKeyType="done"
                />
                <GradientButton
                  label={t("addBtn")}
                  onPress={handleAddConfirm}
                  disabled={!inputValue.trim()}
                  style={styles.actionBtn}
                />
                <Pressable
                  style={[
                    styles.actionBtn,
                    styles.actionBtnOutline,
                    { borderColor: border },
                  ]}
                  onPress={() => setMode("list")}
                >
                  <Text style={[styles.actionBtnText, { color: muted }]}>
                    {t("back")}
                  </Text>
                </Pressable>
              </>
            )}

            {/* ── Rename mode ── */}
            {mode === "rename" && (
              <>
                <Text
                  style={[
                    styles.sheetTitle,
                    {
                      color: text,
                      marginBottom: 16,
                      textAlign: isRTL ? "right" : "left",
                    },
                  ]}
                >
                  {t("renamePerson")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: border, color: text, backgroundColor: bg },
                  ]}
                  placeholder={t("nameField")}
                  placeholderTextColor={muted}
                  value={inputValue}
                  onChangeText={setInputValue}
                  autoFocus
                  onSubmitEditing={handleRenameConfirm}
                  returnKeyType="done"
                />
                <GradientButton
                  label={t("doneBtn")}
                  onPress={handleRenameConfirm}
                  disabled={!inputValue.trim()}
                  style={styles.actionBtn}
                />
                <Pressable
                  style={[
                    styles.actionBtn,
                    styles.actionBtnOutline,
                    { borderColor: border },
                  ]}
                  onPress={() => setMode("list")}
                >
                  <Text style={[styles.actionBtnText, { color: muted }]}>
                    {t("back")}
                  </Text>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  triggerName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 44,
    maxHeight: "60%",
    maxWidth: 540,
    width: "100%",
    alignSelf: "center",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 4,
  },
  titleGroup: {
    flex: 1,
    marginEnd: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  sheetDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  list: {
    flexGrow: 0,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  personRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkIcon: {
    width: 20,
    margin: 6,
  },
  checkPlaceholder: {
    width: 20,
  },
  personName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  cancelBtn: {
    borderTopWidth: 1,
    paddingTop: 14,
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  deleteMsg: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginBottom: 14,
  },
  actionBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  actionBtnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
