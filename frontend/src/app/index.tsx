import { useState } from "react";
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { GameButton, ScreenEntrance } from "../components/game-ui";
import { useGameAudio } from "../AudioContext";
import { useGame } from "../GameContext";
import { COLORS } from "../theme";

const background = require("../../assets/game/title-screen-background.png");

export default function TitleScreen() {
  const router = useRouter();
  const { dispatch } = useGame();
  const { startMusic } = useGameAudio();
  const [playerName, setPlayerName] = useState("");
  const { height } = useWindowDimensions();
  const compact = height < 600;

  const start = () => {
    startMusic();
    dispatch({ type: "START_GAME", payload: { playerName } });
    router.replace("/map");
  };

  return (
    <ImageBackground
      source={background}
      resizeMode="cover"
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.scrim} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardArea}>
        <ScrollView contentContainerStyle={[styles.layout, compact && styles.layoutCompact]} keyboardShouldPersistTaps="handled">
          <ScreenEntrance style={[styles.card, compact && styles.cardCompact]}>
            <View style={[styles.hero, compact && styles.heroCompact]}>
              <Text style={styles.eyebrow}>AN OFFICE HEIST COMEDY</Text>
              <Text style={[styles.title, compact && styles.titleCompact]}>GRAND{`\n`}TASK OFFICE</Text>
              <View style={[styles.rule, compact && styles.ruleCompact]} />
              <Text style={[styles.tagline, compact && styles.taglineCompact]}>STEAL THE FILE. DODGE THE BOSS. ESCAPE BEFORE LOCKDOWN.</Text>
            </View>
            <View style={[styles.controls, compact && styles.controlsCompact]}>
              <View style={[styles.instructions, compact && styles.instructionsCompact]}>
                <Text style={styles.label}>HOW TO PLAY</Text>
                <Text style={[styles.step, compact && styles.stepCompact]}><Text style={styles.stepNumber}>1</Text>  PICK A MAP ZONE AND CHOOSE AN ACTION.</Text>
                <Text style={[styles.step, compact && styles.stepCompact]}><Text style={styles.stepNumber}>2</Text>  GET THE KEYCARD, THEN STEAL THE FILE.</Text>
                <Text style={[styles.step, compact && styles.stepCompact]}><Text style={styles.stepNumber}>3</Text>  RETURN TO THE LIFTS BEFORE LOCKDOWN.</Text>
              </View>
              <Text style={styles.label}>YOUR HEIST NAME (OPTIONAL)</Text>
              <TextInput
                accessibilityLabel="Player name"
                autoCapitalize="words"
                maxLength={24}
                onChangeText={setPlayerName}
                onSubmitEditing={start}
                placeholder="Rookie"
                placeholderTextColor="#78817f"
                returnKeyType="done"
                style={[styles.input, compact && styles.inputCompact]}
                value={playerName}
              />
              <GameButton label="START THE HEIST" onPress={start} compact={compact} />
              <Text style={[styles.finePrint, compact && styles.finePrintCompact]}>ONE PLAYER  •  ONE BOSS  •  EIGHT ROUNDS</Text>
            </View>
          </ScreenEntrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: "100%", minHeight: "100%", alignSelf: "stretch", backgroundColor: COLORS.charcoal },
  backgroundImage: { width: "100%", height: "100%" },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(3, 10, 12, 0.36)" },
  keyboardArea: { flex: 1 },
  layout: { flexGrow: 1, width: "100%", justifyContent: "center", alignItems: "flex-end", padding: 32 },
  layoutCompact: { paddingHorizontal: 20, paddingVertical: 10 },
  card: { width: "100%", maxWidth: 520, backgroundColor: COLORS.panel, borderWidth: 3, borderColor: COLORS.teal, borderRadius: 12, padding: 30, shadowColor: "#000", shadowOpacity: 0.7, shadowRadius: 18, shadowOffset: { width: 0, height: 12 } },
  cardCompact: { maxWidth: 760, minHeight: 0, flexDirection: "row", alignItems: "center", gap: 20, paddingHorizontal: 22, paddingVertical: 14 },
  hero: {},
  heroCompact: { flex: 0.85 },
  controls: {},
  controlsCompact: { flex: 1.15 },
  eyebrow: { color: COLORS.gold, fontSize: 13, fontWeight: "900", letterSpacing: 2.5 },
  title: { color: COLORS.cream, fontSize: 47, lineHeight: 45, fontWeight: "900", letterSpacing: -1, marginVertical: 12, textShadowColor: COLORS.terracottaDark, textShadowOffset: { width: 4, height: 4 }, textShadowRadius: 0 },
  titleCompact: { fontSize: 34, lineHeight: 32, marginVertical: 7 },
  rule: { height: 5, width: 120, backgroundColor: COLORS.terracotta, marginBottom: 16 },
  ruleCompact: { marginBottom: 9, width: 86, height: 4 },
  tagline: { color: "white", fontSize: 16, fontWeight: "800", lineHeight: 24, marginBottom: 16 },
  taglineCompact: { fontSize: 14, lineHeight: 19, marginBottom: 0 },
  instructions: { backgroundColor: "rgba(255,255,255,0.07)", borderLeftWidth: 5, borderLeftColor: COLORS.gold, padding: 12, marginBottom: 18, gap: 7 },
  instructionsCompact: { paddingVertical: 7, paddingHorizontal: 9, marginBottom: 8, gap: 2 },
  step: { color: COLORS.cream, fontSize: 11, lineHeight: 16, fontWeight: "800" },
  stepCompact: { fontSize: 11, lineHeight: 14 },
  stepNumber: { color: COLORS.terracotta, fontSize: 16, fontWeight: "900" },
  label: { color: COLORS.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginBottom: 7 },
  input: { minHeight: 56, color: COLORS.cream, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 2, borderColor: COLORS.teal, borderRadius: 7, paddingHorizontal: 16, fontSize: 19, fontWeight: "700", marginBottom: 14 },
  inputCompact: { minHeight: 44, fontSize: 15, marginBottom: 8 },
  finePrint: { color: "#a8b4b1", textAlign: "center", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginTop: 16 },
  finePrintCompact: { fontSize: 8, marginTop: 8 },
});
