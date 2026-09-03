import { useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Hud, Inventory, ScreenEntrance } from "../components/game-ui";
import { useGame } from "../GameContext";
import { COLORS } from "../theme";
import { OFFICE_ZONES, OfficeZone } from "../types";

const mapArt = require("../../assets/game/office-map.png");
const USE_NATIVE_DRIVER = Platform.OS !== "web";
const positions: Record<OfficeZone, { left: `${number}%`; top: `${number}%`; width: `${number}%`; height: `${number}%` }> = {
  "Open workspace": { left: "4%", top: "10%", width: "28%", height: "32%" },
  "Meeting-room corridor": { left: "35%", top: "10%", width: "29%", height: "32%" },
  "Coffee and kitchen area": { left: "68%", top: "10%", width: "28%", height: "32%" },
  "Print and utility area": { left: "4%", top: "57%", width: "28%", height: "28%" },
  "Entrance and lifts": { left: "35%", top: "57%", width: "29%", height: "28%" },
  "Manager/drop-in office": { left: "68%", top: "57%", width: "28%", height: "28%" },
};

function objective(inventory: string[]) {
  if (!inventory.includes("keycard")) return "FIND THE KEYCARD IN THE MEETING CORRIDOR";
  if (!inventory.includes("secret_document")) return "ENTER THE MANAGER'S OFFICE AND STEAL THE FILE";
  return "REACH THE LIFTS AND ESCAPE";
}

export default function MapScreen() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const [focused, setFocused] = useState<OfficeZone | null>(null);
  const [hovered, setHovered] = useState<OfficeZone | null>(null);
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
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ScreenEntrance>
        <Hud state={state} />
        <View style={styles.briefing}>
          <View style={styles.objectiveBlock}><Text style={styles.kicker}>PRIMARY HEIST OBJECTIVE</Text><Text style={styles.objective}>{objective(state.inventory)}</Text></View>
          <View style={styles.clueBlock}><Text style={styles.kicker}>BOSS PATROL CLUE</Text><Text style={styles.clue}>“{state.bossClue}”</Text></View>
        </View>
        <View style={styles.howToPlay}>
          <Text style={styles.howToPlayTitle}>YOUR MOVE</Text>
          <Text style={styles.howToPlayText}>Choose any unlocked zone below. Every visit starts a mission. Avoid the zone suggested by the Boss clue—or risk another alert star.</Text>
          <Text style={styles.aiText}>LOCAL AI: OLLAMA WRITES NORMAL AND BOSS MISSIONS WHEN RUNNING • OFFLINE MISSIONS ARE ALWAYS READY</Text>
        </View>
        <View style={styles.mapFrame}>
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
        <View style={styles.inventoryPanel}><Text style={styles.kicker}>HEIST INVENTORY</Text><Inventory items={state.inventory} /></View>
      </ScreenEntrance>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.charcoal },
  content: { width: "100%", maxWidth: 1240, alignSelf: "center", padding: 18, gap: 12 },
  briefing: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginVertical: 10 },
  objectiveBlock: { flex: 2, minWidth: 280, backgroundColor: COLORS.terracottaDark, borderLeftWidth: 6, borderLeftColor: COLORS.gold, padding: 12 },
  clueBlock: { flex: 1, minWidth: 280, backgroundColor: COLORS.panelSoft, borderLeftWidth: 6, borderLeftColor: COLORS.teal, padding: 12 },
  kicker: { color: COLORS.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  objective: { color: "white", fontSize: 17, fontWeight: "900", marginTop: 4 },
  clue: { color: COLORS.cream, fontSize: 14, fontStyle: "italic", marginTop: 4 },
  howToPlay: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, backgroundColor: "rgba(13,143,138,0.22)", borderWidth: 1, borderColor: COLORS.teal, paddingVertical: 9, paddingHorizontal: 12 },
  howToPlayTitle: { color: COLORS.gold, fontSize: 12, fontWeight: "900", letterSpacing: 1.3 },
  howToPlayText: { color: "white", fontSize: 12, fontWeight: "700", flex: 1, minWidth: 300 },
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
});
