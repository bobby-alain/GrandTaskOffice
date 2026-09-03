import { useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { Hud, Inventory, ScreenEntrance } from "../components/game-ui";
import { useGame } from "../GameContext";
import { COLORS } from "../theme";
import { OFFICE_ZONES, OfficeZone } from "../types";

const mapArt = require("../../assets/game/office-map.png");
const USE_NATIVE_DRIVER = Platform.OS !== "web";
const positions: Record<OfficeZone, { left: `${number}%`; top: `${number}%`; width: `${number}%`; height: `${number}%` }> = {
  "Open workspace": { left: "4%", top: "10%", width: "28%", height: "75%" },
  "Entrance and lifts": { left: "35%", top: "10%", width: "29%", height: "75%" },
  "Manager/drop-in office": { left: "68%", top: "10%", width: "28%", height: "75%" },
};

function objective(inventory: string[]) {
  if (!inventory.includes("keycard")) return "SEARCH THE OPEN WORKSPACE FOR THE KEYCARD";
  if (!inventory.includes("secret_document")) return "ENTER THE MANAGER'S OFFICE AND STEAL THE FILE";
  return "REACH THE LIFTS AND ESCAPE";
}

export default function MapScreen() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [focused, setFocused] = useState<OfficeZone | null>(null);
  const [hovered, setHovered] = useState<OfficeZone | null>(null);
  const { height } = useWindowDimensions();
  const compact = height < 600;
  const glow = useRef(new Animated.Value(0)).current;
  const canEscape = state.inventory.includes("keycard") && state.inventory.includes("secret_document");

  useEffect(() => {
    if (!canEscape) return;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(glow, { toValue: 0, duration: 700, useNativeDriver: USE_NATIVE_DRIVER }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [canEscape, glow]);

  const selectZone = (zone: OfficeZone) => {
    const locked = zone === "Manager/drop-in office" && !state.inventory.includes("keycard");
    if (locked) return;
    const endsNow = (zone === "Entrance and lifts" && canEscape) || (zone === state.bossZone && state.alertLevel >= 4);
    dispatch({ type: "SELECT_LOCATION", payload: { location: zone } });
    router.replace(endsNow ? "/ending" : "/mission");
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={[styles.content, compact && styles.contentCompact]}>
      <ScreenEntrance>
        <Hud state={state} />
        <View style={[styles.gameArea, compact && styles.gameAreaCompact]}>
          <View style={[styles.sidePanel, compact && styles.sidePanelCompact]}>
            <View style={[styles.briefing, compact && styles.briefingCompact]}>
              <View style={[styles.objectiveBlock, compact && styles.infoBlockCompact]}><Text style={styles.kicker}>PRIMARY HEIST OBJECTIVE</Text><Text style={[styles.objective, compact && styles.objectiveCompact]}>{objective(state.inventory)}</Text></View>
              <View style={[styles.clueBlock, compact && styles.infoBlockCompact]}><Text style={styles.kicker}>BOSS PATROL CLUE</Text><Text numberOfLines={compact ? 2 : undefined} style={[styles.clue, compact && styles.clueCompact]}>“{state.bossClue}”</Text></View>
            </View>
            <View style={[styles.howToPlay, compact && styles.howToPlayCompact]}>
              <Text style={styles.howToPlayTitle}>YOUR MOVE</Text>
              <Text numberOfLines={compact ? 3 : undefined} style={[styles.howToPlayText, compact && styles.howToPlayTextCompact]}>Choose any unlocked zone. Every visit starts a mission. Avoid the Boss clue—or risk another alert star.</Text>
              {!compact && <Text style={styles.aiText}>LOCAL AI: OLLAMA WRITES NORMAL AND BOSS MISSIONS WHEN RUNNING • OFFLINE MISSIONS ARE ALWAYS READY</Text>}
            </View>
            <View style={[styles.inventoryPanel, compact && styles.inventoryPanelCompact]}><Text style={styles.kicker}>HEIST INVENTORY</Text><Inventory items={state.inventory} compact={compact} /></View>
          </View>
          <View style={[styles.mapFrame, compact && { height: Math.max(260, height - 76), flex: 1, aspectRatio: undefined }]}>
          <ImageBackground source={mapArt} resizeMode="cover" style={styles.map} imageStyle={styles.mapImage}>
            {OFFICE_ZONES.map((zone) => {
              const locked = zone === "Manager/drop-in office" && !state.inventory.includes("keycard");
              const escape = zone === "Entrance and lifts" && canEscape;
              const visited = state.visitedZones.includes(zone);
              return (
                <Animated.View key={zone} style={[styles.hotspotWrap, positions[zone], escape && { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }), transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) }] }]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${zone}${locked ? ", locked, keycard required" : escape ? ", escape available" : ""}`}
                    accessibilityState={{ disabled: locked, selected: visited }}
                    disabled={locked}
                    onBlur={() => setFocused(null)}
                    onFocus={() => setFocused(zone)}
                    onHoverIn={() => setHovered(zone)}
                    onHoverOut={() => setHovered(null)}
                    onPress={() => selectZone(zone)}
                    style={({ pressed }) => [styles.hotspot, visited && styles.visited, hovered === zone && styles.hovered, locked && styles.locked, escape && styles.escape, focused === zone && styles.focused, pressed && styles.pressed]}
                  >
                    <Text style={[styles.zoneName, escape && styles.escapeText]}>{escape ? "ESCAPE" : zone.toUpperCase()}</Text>
                    <Text style={styles.zoneState}>{locked ? "🔒 KEYCARD REQUIRED" : escape ? "EXIT IS OPEN" : visited ? "VISITED" : "ENTER"}</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ImageBackground>
          </View>
        </View>
      </ScreenEntrance>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.charcoal },
  content: { width: "100%", maxWidth: 1240, alignSelf: "center", padding: 18, gap: 12 },
  contentCompact: { maxWidth: "100%", padding: 6 },
  gameArea: {},
  gameAreaCompact: { flexDirection: "row", gap: 7, marginTop: 6 },
  sidePanel: {},
  sidePanelCompact: { width: "32%", minWidth: 205 },
  briefing: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginVertical: 10 },
  briefingCompact: { flexDirection: "column", flexWrap: "nowrap", gap: 5, marginVertical: 0 },
  objectiveBlock: { flex: 2, minWidth: 280, backgroundColor: COLORS.terracottaDark, borderLeftWidth: 6, borderLeftColor: COLORS.gold, padding: 12 },
  clueBlock: { flex: 1, minWidth: 280, backgroundColor: COLORS.panelSoft, borderLeftWidth: 6, borderLeftColor: COLORS.teal, padding: 12 },
  infoBlockCompact: { minWidth: 0, padding: 7, borderLeftWidth: 4 },
  kicker: { color: COLORS.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  objective: { color: "white", fontSize: 17, fontWeight: "900", marginTop: 4 },
  objectiveCompact: { fontSize: 13, lineHeight: 16 },
  clue: { color: COLORS.cream, fontSize: 14, fontStyle: "italic", marginTop: 4 },
  clueCompact: { fontSize: 12, lineHeight: 15 },
  howToPlay: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, backgroundColor: "rgba(13,143,138,0.22)", borderWidth: 1, borderColor: COLORS.teal, paddingVertical: 9, paddingHorizontal: 12 },
  howToPlayCompact: { display: "flex", marginTop: 5, gap: 3, paddingVertical: 6, paddingHorizontal: 7 },
  howToPlayTitle: { color: COLORS.gold, fontSize: 12, fontWeight: "900", letterSpacing: 1.3 },
  howToPlayText: { color: "white", fontSize: 12, fontWeight: "700", flex: 1, minWidth: 300 },
  howToPlayTextCompact: { minWidth: 0, fontSize: 11, lineHeight: 14 },
  aiText: { color: "#89d9d1", fontSize: 9, fontWeight: "900", letterSpacing: 0.5, width: "100%" },
  mapFrame: { width: "100%", aspectRatio: 1.5, borderWidth: 4, borderColor: COLORS.teal, backgroundColor: "#0a1112", shadowColor: "#000", shadowOpacity: 0.7, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  map: { flex: 1 },
  mapImage: { opacity: 0.92 },
  hotspotWrap: { position: "absolute" },
  hotspot: { flex: 1, minHeight: 56, justifyContent: "center", alignItems: "center", padding: 5, backgroundColor: "rgba(4, 19, 21, 0.63)", borderWidth: 2, borderColor: COLORS.teal, borderRadius: 8 },
  visited: { backgroundColor: "rgba(41, 74, 70, 0.74)", borderColor: "#80b5aa" },
  locked: { backgroundColor: "rgba(20,20,20,0.82)", borderColor: "#686868", opacity: 0.82 },
  escape: { backgroundColor: "rgba(242,184,75,0.88)", borderColor: "white", borderWidth: 4 },
  focused: { borderColor: COLORS.gold, borderWidth: 4 },
  hovered: { backgroundColor: "rgba(13,143,138,0.72)", borderColor: COLORS.cream },
  pressed: { opacity: 0.72, transform: [{ scale: 0.97 }] },
  zoneName: { color: "white", fontSize: 12, fontWeight: "900", textAlign: "center", textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 1 },
  zoneState: { color: COLORS.gold, fontSize: 9, fontWeight: "900", marginTop: 4, textAlign: "center" },
  escapeText: { color: COLORS.charcoal, fontSize: 22, textShadowColor: "transparent" },
  inventoryPanel: { backgroundColor: COLORS.panel, borderWidth: 2, borderColor: COLORS.terracotta, borderRadius: 8, padding: 10, gap: 6, marginTop: 10 },
  inventoryPanelCompact: { padding: 6, gap: 3, marginTop: 5 },
});
