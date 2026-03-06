import { useThemeColor } from "@/components/Themed";
import { useLanguage } from "@/context/LanguageContext";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const VERTICAL_BREAKPOINT = 400;

interface ListItemProps {
  // Optional leading icon badge (44×44 gradient square)
  icon?: {
    name: React.ComponentProps<typeof Feather>["name"];
    gradient: [string, string];
  };

  // Content slots — string values rendered with predefined typography
  topStart?: string;
  midStart?: string;
  bottomStart?: string;
  topEnd?: string;
  midEnd?: string;
  midEndColor?: string; // defaults to theme "text"

  // Delete action — renders a trash icon at the bottom-end position
  onDelete?: () => void;

  // Card chrome
  stripColors?: [string, string];
  accentColor?: string;

  // Layout — auto-switches to vertical on narrow screens; pass explicitly to override
  vertical?: boolean;

  // Interaction
  onPress: () => void;
  onLongPress?: () => void;
}

export default function ListItem({
  icon,
  topStart,
  midStart,
  bottomStart,
  topEnd,
  midEnd,
  midEndColor,
  onDelete,
  stripColors,
  accentColor,
  vertical,
  onPress,
  onLongPress,
}: ListItemProps) {
  const { width } = useWindowDimensions();
  const isVertical = vertical ?? width < VERTICAL_BREAKPOINT;
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const isWeb = Platform.OS === "web";
  const enforceRTLStylesForWeb = isRTL && isWeb;
  const card = useThemeColor({}, "card");
  const border = useThemeColor({}, "border");
  const text = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");
  const danger = useThemeColor({}, "danger");

  const [hovered, setHovered] = useState(false);
  const hoverAnim = useRef(new Animated.Value(0)).current;

  function onHoverIn() {
    setHovered(true);
    Animated.spring(hoverAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 3,
    }).start();
  }

  function onHoverOut() {
    setHovered(false);
    Animated.spring(hoverAnim, {
      toValue: 0,
      useNativeDriver: true,
      speed: 40,
      bounciness: 3,
    }).start();
  }

  const translateY = hoverAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const hoverShadow = hovered
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }
    : {};

  const hasStart = topStart != null || midStart != null || bottomStart != null;
  const endItemsCount = [topEnd, midEnd, onDelete].filter(
    (v) => v != null,
  ).length;

  return (
    <Animated.View
      style={[
        styles.outer,
        hoverShadow,
        {
          backgroundColor: card,
          borderColor: border,
          ...(accentColor && {
            borderStartColor: accentColor,
            borderStartWidth: 3,
          }),

          ...(accentColor &&
            isRTL &&
            isWeb && {
              borderEndColor: accentColor,
              borderEndWidth: 3,
              borderStartWidth: 0,
            }),
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        style={[styles.pressable, { backgroundColor: card }]}
        onPress={onPress}
        onLongPress={onLongPress}
        onHoverIn={onHoverIn}
        onHoverOut={onHoverOut}
      >
        {isVertical ? (
          // ── Vertical layout ─────────────────────────────────────────────
          <View>
            {/* Top: icon + start column */}
            <View style={[styles.row, styles.rowCompact]}>
              {icon && (
                <LinearGradient
                  colors={icon.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.iconWrap,
                    {
                      shadowColor: icon.gradient[0],
                      shadowOpacity: 0.4,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 6,
                    },
                  ]}
                >
                  <Feather name={icon.name} size={20} color="#fff" />
                </LinearGradient>
              )}
              {hasStart && (
                <View style={styles.startCol}>
                  {topStart != null && (
                    <Text
                      style={[
                        styles.topStartText,
                        {
                          color: muted,
                          textAlign: enforceRTLStylesForWeb ? "right" : "left",
                        },
                      ]}
                    >
                      {topStart}
                    </Text>
                  )}
                  {midStart != null && (
                    <Text
                      style={[
                        styles.midStartText,
                        {
                          color: text,
                          textAlign: enforceRTLStylesForWeb ? "right" : "left",
                        },
                      ]}
                    >
                      {midStart}
                    </Text>
                  )}
                  {bottomStart != null && (
                    <Text
                      style={[
                        styles.bottomStartText,
                        {
                          color: muted,
                          textAlign: enforceRTLStylesForWeb ? "right" : "left",
                        },
                      ]}
                    >
                      {bottomStart}
                    </Text>
                  )}
                </View>
              )}
            </View>
            {/* Bottom: value + delete */}
            {<View style={styles.divider} />}

            {(midEnd != null || onDelete != null) && (
              <View
                style={[
                  styles.verticalBottom,
                  enforceRTLStylesForWeb && styles.rowRTL,
                ]}
              >
                {midEnd != null && (
                  <Text
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    style={[
                      styles.midEndTextVert,
                      {
                        color: midEndColor ?? text,
                        textAlign: enforceRTLStylesForWeb ? "left" : "right",
                      },
                    ]}
                  >
                    {midEnd}
                  </Text>
                )}
                {onDelete != null && (
                  <Pressable onPress={onDelete} hitSlop={8}>
                    <Feather name="trash-2" size={15} color={danger} />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        ) : (
          // ── Horizontal layout (default) ──────────────────────────────────
          <View style={[styles.row]}>
            {/* Icon badge */}
            {icon && (
              <LinearGradient
                colors={icon.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.iconWrap,
                  {
                    shadowColor: icon.gradient[0],
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 6,
                  },
                ]}
              >
                <Feather name={icon.name} size={20} color="#fff" />
              </LinearGradient>
            )}

            {/* Start column */}
            {hasStart && (
              <View style={styles.startCol}>
                {topStart != null && (
                  <Text
                    style={[
                      styles.topStartText,
                      {
                        color: muted,
                        textAlign: enforceRTLStylesForWeb ? "right" : "left",
                      },
                    ]}
                  >
                    {topStart}
                  </Text>
                )}
                {midStart != null && (
                  <Text
                    style={[
                      styles.midStartText,
                      {
                        color: text,
                        textAlign: enforceRTLStylesForWeb ? "right" : "left",
                      },
                    ]}
                  >
                    {midStart}
                  </Text>
                )}
                {bottomStart != null && (
                  <Text
                    style={[
                      styles.bottomStartText,
                      {
                        color: muted,
                        textAlign: enforceRTLStylesForWeb ? "right" : "left",
                      },
                    ]}
                  >
                    {bottomStart}
                  </Text>
                )}
              </View>
            )}

            {/* End column */}
            {endItemsCount > 0 && (
              <View
                style={[
                  styles.endCol,
                  {
                    justifyContent:
                      endItemsCount > 1 ? "space-between" : "center",
                    alignItems: "stretch",
                  },
                ]}
              >
                {topEnd != null && (
                  <Text
                    style={[
                      styles.topEndText,
                      {
                        color: muted,
                        textAlign: enforceRTLStylesForWeb ? "left" : "right",
                      },
                    ]}
                  >
                    {topEnd}
                  </Text>
                )}
                {midEnd != null && (
                  <Text
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    style={[
                      styles.midEndText,
                      {
                        color: midEndColor ?? text,
                        textAlign: enforceRTLStylesForWeb ? "left" : "right",
                      },
                    ]}
                  >
                    {midEnd}
                  </Text>
                )}
                {onDelete != null && (
                  <Pressable
                    onPress={onDelete}
                    hitSlop={8}
                    style={{ alignSelf: "flex-end" }}
                  >
                    <Feather name="trash-2" size={15} color={danger} />
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}

        {/* Bottom gradient strip */}
        {stripColors && (
          <LinearGradient
            colors={stripColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.strip}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginHorizontal: 4,
    marginBottom: 8,
  },
  outer: { borderRadius: 16, marginBottom: 10, borderWidth: 1 },
  pressable: { borderRadius: 16, overflow: "hidden" },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    alignSelf: "center",
  },
  rowRTL: { flexDirection: "row-reverse" },
  startCol: { flex: 1, justifyContent: "center", gap: 3 },
  endCol: { flex: 1, alignItems: "flex-end" },
  // Vertical layout
  rowCompact: { paddingBottom: 10 },
  verticalBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 14,
    gap: 8,
  },
  // Typography
  topStartText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  midStartText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  bottomStartText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  topEndText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  midEndText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  midEndTextVert: { fontSize: 20, fontFamily: "Inter_700Bold", flex: 1 },
  strip: { height: 3 },
});
