import { useEffect, useRef } from "react";
import { Animated, ImageBackground, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { useGameAudio } from "../AudioContext";
import { AlertStars, GameButton, Inventory, ScreenEntrance } from "../components/game-ui";
import { useGame } from "../GameContext";
import { COLORS } from "../theme";
import { ACHIEVEMENT_NAMES, ENDINGS } from "../types";

const background = require("../../assets/game/title-screen-background.png");

function VictoryCelebration() {
  const burst = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(burst, { toValue: 1, speed: 8, bounciness: 14, useNativeDriver: true }).start();
  }, [burst]);
  return (
    <Animated.View style={[styles.victoryBanner, { opacity: burst, transform: [{ scale: burst }] }]}>
      <Text style={styles.victoryStars}>★  ✦  ★  ✦  ★</Text>
      <Text style={styles.victoryText}>THE OFFICE NEVER SAW IT COMING!</Text>
    </Animated.View>
  );
}

export default function EndingScreen() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const { playVictory, startMusic } = useGameAudio();
  const { height } = useWindowDimensions();
  const compact = height < 600;
  const ending = state.ending ? ENDINGS[state.ending] : ENDINGS.locked_down;
  useEffect(() => {
    if (state.ending === "escaped") playVictory();
  }, [state.ending]);

  const restart = () => { startMusic(); dispatch({ type: "RESTART_GAME" }); router.replace("/"); };

  return (
    <ImageBackground source={background} resizeMode="cover" style={styles.background}>
      <View style={styles.scrim} />
      <ScrollView contentContainerStyle={[styles.content, compact && styles.contentCompact]}>
        <ScreenEntrance style={[styles.card, compact && styles.cardCompact, state.ending === "escaped" ? styles.win : styles.loss]}>
          <Text style={styles.kicker}>{state.ending === "escaped" ? "HEIST COMPLETE" : "MISSION FAILED"}</Text>
          {state.ending === "escaped" && <VictoryCelebration />}
          <Text style={[styles.title, compact && styles.titleCompact]}>{ending.title}</Text>
          <Text style={[styles.message, compact && styles.messageCompact]}>{ending.message}</Text>
          <View style={[styles.endingBody, compact && styles.endingBodyCompact]}>
            <View style={[styles.endingColumn, compact && styles.endingColumnCompact]}>
              <View style={[styles.stats, compact && styles.statsCompact]}>
                <View><Text style={styles.label}>PLAYER</Text><Text style={styles.value}>{state.playerName}</Text></View>
                <View><Text style={styles.label}>ROUNDS</Text><Text style={styles.value}>{state.round}/8</Text></View>
                <View><Text style={styles.label}>CASH</Text><Text style={styles.value}>${state.money}</Text></View>
                <View><Text style={styles.label}>REPUTATION</Text><Text style={styles.value}>{state.reputation}/10</Text></View>
              </View>
              <View style={[styles.section, compact && styles.sectionCompact]}><Text style={styles.label}>FINAL BOSS ALERT</Text><AlertStars level={state.alertLevel} /></View>
            </View>
            <View style={[styles.endingColumn, compact && styles.endingColumnCompact]}>
              <View style={[styles.section, compact && styles.sectionCompact]}><Text style={styles.label}>INVENTORY</Text><Inventory items={state.inventory} compact={compact} /></View>
              <View style={[styles.section, compact && styles.sectionCompact]}><Text style={styles.label}>ACHIEVEMENTS</Text><View style={styles.badges}>{state.achievements.length ? state.achievements.map((item) => <Text key={item} style={styles.badge}>★ {ACHIEVEMENT_NAMES[item]}</Text>) : <Text style={styles.muted}>No bonus achievements this time.</Text>}</View></View>
              <GameButton label="PLAY AGAIN" onPress={restart} tone={state.ending === "escaped" ? "gold" : "orange"} compact={compact} />
            </View>
          </View>
        </ScreenEntrance>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 }, scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(3,9,10,0.68)" }, content: { flexGrow: 1, justifyContent: "center", width: "100%", maxWidth: 820, alignSelf: "center", padding: 24 },
  contentCompact: { maxWidth: "100%", padding: 8 },
  card: { backgroundColor: COLORS.panel, borderWidth: 4, borderRadius: 12, padding: 28, shadowColor: "#000", shadowOpacity: 0.7, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } }, win: { borderColor: COLORS.gold }, loss: { borderColor: COLORS.danger },
  cardCompact: { padding: 12 },
  kicker: { color: COLORS.gold, fontSize: 12, fontWeight: "900", letterSpacing: 2 }, title: { color: COLORS.cream, fontSize: 43, lineHeight: 45, fontWeight: "900", marginVertical: 10, textShadowColor: COLORS.terracottaDark, textShadowOffset: { width: 4, height: 4 }, textShadowRadius: 0 }, message: { color: "white", fontSize: 18, lineHeight: 27, marginBottom: 20 },
  titleCompact: { fontSize: 27, lineHeight: 29, marginVertical: 5 }, messageCompact: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
  victoryBanner: { alignSelf: "stretch", alignItems: "center", backgroundColor: "rgba(242,184,75,0.16)", borderWidth: 2, borderColor: COLORS.gold, paddingVertical: 7, marginTop: 7, borderRadius: 7 },
  victoryStars: { color: COLORS.gold, fontSize: 22, lineHeight: 24, fontWeight: "900" },
  victoryText: { color: COLORS.cream, fontSize: 13, fontWeight: "900", letterSpacing: 1.4, marginTop: 2 },
  endingBody: {}, endingBodyCompact: { flexDirection: "row", gap: 10 },
  endingColumn: {}, endingColumnCompact: { flex: 1 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 22, backgroundColor: "rgba(255,255,255,0.07)", padding: 14, borderRadius: 7 }, label: { color: COLORS.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.2, marginBottom: 5 }, value: { color: COLORS.cream, fontSize: 19, fontWeight: "900" },
  statsCompact: { gap: 12, padding: 8 },
  section: { marginVertical: 10 }, sectionCompact: { marginVertical: 4 }, badges: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, badge: { color: COLORS.charcoal, backgroundColor: COLORS.gold, fontWeight: "900", paddingVertical: 7, paddingHorizontal: 10, borderRadius: 4 }, muted: { color: "#9ba8a5" },
});
