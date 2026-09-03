import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import { COLORS } from "../theme";
import { GameState, ItemId, ITEM_NAMES } from "../types";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

export const ITEM_ART: Record<ItemId, ImageSourcePropType> = {
  cinnamon_bun: require("../../assets/game/cinnamon-bun.png"),
  coffee: require("../../assets/game/coffee.png"),
  laptop: require("../../assets/game/laptop.png"),
  keycard: require("../../assets/game/keycard.png"),
  stapler: require("../../assets/game/stapler.png"),
  secret_document: require("../../assets/game/secret-document.png"),
};

export function ScreenEntrance({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(progress, { toValue: 1, speed: 12, bounciness: 4, useNativeDriver: USE_NATIVE_DRIVER }).start();
  }, [progress]);
  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

export function GameButton({ label, onPress, tone = "orange", disabled = false, compact = false }: { label: string; onPress: () => void; tone?: "orange" | "teal" | "gold"; disabled?: boolean; compact?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const color = tone === "teal" ? COLORS.teal : tone === "gold" ? COLORS.gold : COLORS.terracotta;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
      style={({ pressed }) => [styles.button, compact && styles.buttonCompact, { backgroundColor: color }, hovered && styles.buttonHovered, pressed && styles.buttonPressed, focused && styles.focused, disabled && styles.disabled]}
    >
      <Text style={[styles.buttonLabel, tone === "gold" && styles.darkLabel]}>{label}</Text>
    </Pressable>
  );
}

export function AlertStars({ level }: { level: number }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    pulse.setValue(1.45);
    Animated.spring(pulse, { toValue: 1, friction: 4, useNativeDriver: USE_NATIVE_DRIVER }).start();
  }, [level, pulse]);
  return (
    <View accessibilityLabel={`${level} of 5 Boss alert stars`} style={styles.stars}>
      {[0, 1, 2, 3, 4].map((star) => (
        <Animated.Text key={star} style={[styles.star, star < level ? styles.starOn : styles.starOff, star === level - 1 && { transform: [{ scale: pulse }] }]}>★</Animated.Text>
      ))}
    </View>
  );
}

export function Inventory({ items, compact = false }: { items: ItemId[]; compact?: boolean }) {
  return (
    <View style={styles.inventory} accessibilityLabel={`Inventory: ${items.map((item) => ITEM_NAMES[item]).join(", ") || "empty"}`}>
      {items.length === 0 ? <Text style={styles.empty}>EMPTY</Text> : items.map((item) => (
        <View key={item} style={[styles.itemSlot, compact && styles.itemSlotCompact]}>
          <Image source={ITEM_ART[item]} resizeMode="contain" style={[styles.itemImage, compact && styles.itemImageCompact]} />
          {!compact && <Text numberOfLines={1} style={styles.itemName}>{ITEM_NAMES[item]}</Text>}
        </View>
      ))}
    </View>
  );
}

export function Hud({ state }: { state: GameState }) {
  const { height } = useWindowDimensions();
  const compact = height < 600;
  return (
    <View style={[styles.hud, compact && styles.hudCompact]}>
      <View style={[styles.hudStat, compact && styles.hudStatCompact]}><Text style={styles.hudLabel}>PLAYER</Text><Text numberOfLines={1} style={[styles.hudValue, compact && styles.hudValueCompact]}>{state.playerName}</Text></View>
      <View style={[styles.hudStat, compact && styles.hudStatCompact]}><Text style={styles.hudLabel}>ROUND</Text><Text style={[styles.hudValue, compact && styles.hudValueCompact]}>{state.round}/8</Text></View>
      <View style={[styles.hudStat, compact && styles.hudStatCompact]}><Text style={styles.hudLabel}>CASH</Text><Text style={[styles.hudValue, compact && styles.hudValueCompact]}>${state.money}</Text></View>
      <View style={[styles.hudStat, compact && styles.hudStatCompact]}><Text style={styles.hudLabel}>REP</Text><Text style={[styles.hudValue, compact && styles.hudValueCompact]}>{state.reputation}/10</Text></View>
      <View style={styles.alertBlock}><Text style={styles.hudLabel}>BOSS ALERT</Text><AlertStars level={state.alertLevel} /></View>
      <Inventory items={state.inventory} compact />
    </View>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 60, borderRadius: 8, borderWidth: 3, borderColor: COLORS.charcoal, justifyContent: "center", alignItems: "center", paddingHorizontal: 22, shadowColor: "#000", shadowOpacity: 0.45, shadowRadius: 0, shadowOffset: { width: 5, height: 5 }, elevation: 7 },
  buttonCompact: { minHeight: 48, paddingHorizontal: 14 },
  buttonPressed: { transform: [{ translateX: 3 }, { translateY: 3 }], shadowOffset: { width: 1, height: 1 }, opacity: 0.9 },
  buttonHovered: { borderColor: COLORS.cream },
  buttonLabel: { color: "white", fontSize: 18, fontWeight: "900", letterSpacing: 1.2, textAlign: "center", textShadowColor: COLORS.charcoal, textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 },
  darkLabel: { color: COLORS.charcoal, textShadowColor: "transparent" },
  focused: { borderColor: COLORS.gold, borderWidth: 4 },
  disabled: { opacity: 0.42 },
  stars: { flexDirection: "row", gap: 2 },
  star: { fontSize: 25, lineHeight: 27, textShadowColor: "#000", textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 2 },
  starOn: { color: COLORS.gold },
  starOff: { color: "#4a5555" },
  inventory: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  itemSlot: { width: 84, alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: COLORS.teal, borderRadius: 6, padding: 4 },
  itemSlotCompact: { width: 40, height: 40, padding: 1 },
  itemImage: { width: 54, height: 54 },
  itemImageCompact: { width: 36, height: 36 },
  itemName: { color: COLORS.cream, fontSize: 10, fontWeight: "800" },
  empty: { color: "#94a09e", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  hud: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12, backgroundColor: COLORS.panel, borderWidth: 2, borderColor: COLORS.teal, borderRadius: 10, padding: 10 },
  hudCompact: { flexWrap: "nowrap", gap: 7, paddingVertical: 5, paddingHorizontal: 8 },
  hudStat: { minWidth: 64 },
  hudStatCompact: { minWidth: 42, maxWidth: 90 },
  hudLabel: { color: COLORS.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  hudValue: { color: COLORS.cream, fontSize: 16, fontWeight: "900" },
  hudValueCompact: { fontSize: 14 },
  alertBlock: { marginRight: "auto" },
});
