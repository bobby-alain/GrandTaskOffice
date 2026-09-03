import { useState } from "react";
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { GameButton, ScreenEntrance } from "../components/game-ui";
import { useGame } from "../GameContext";
import { COLORS } from "../theme";

const background = require("../../assets/game/title-screen-background.png");

export default function TitleScreen() {
  const router = useRouter();
  const { dispatch } = useGame();
  const [playerName, setPlayerName] = useState("");

  const start = () => {
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
        <ScrollView contentContainerStyle={styles.layout} keyboardShouldPersistTaps="handled">
          <ScreenEntrance style={styles.card}>
          <Text style={styles.eyebrow}>AN OFFICE HEIST COMEDY</Text>
          <Text style={styles.title}>GRAND{`\n`}TASK OFFICE</Text>
          <View style={styles.rule} />
          <Text style={styles.tagline}>STEAL THE FILE. DODGE THE BOSS. ESCAPE BEFORE LOCKDOWN.</Text>
          <View style={styles.instructions}>
            <Text style={styles.label}>HOW TO PLAY</Text>
            <Text style={styles.step}><Text style={styles.stepNumber}>1</Text>  PICK ANY UNLOCKED MAP ZONE AND CHOOSE A MISSION ACTION.</Text>
            <Text style={styles.step}><Text style={styles.stepNumber}>2</Text>  FIND THE KEYCARD, ENTER THE MANAGER'S OFFICE, AND STEAL THE FILE.</Text>
            <Text style={styles.step}><Text style={styles.stepNumber}>3</Text>  RETURN TO THE LIFTS BEFORE FIVE ALERT STARS OR ROUND EIGHT.</Text>
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
            style={styles.input}
            value={playerName}
          />
          <GameButton label="START THE HEIST" onPress={start} />
          <Text style={styles.finePrint}>ONE PLAYER  •  ONE BOSS  •  EIGHT ROUNDS</Text>
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
  card: { width: "100%", maxWidth: 520, backgroundColor: COLORS.panel, borderWidth: 3, borderColor: COLORS.teal, borderRadius: 12, padding: 30, shadowColor: "#000", shadowOpacity: 0.7, shadowRadius: 18, shadowOffset: { width: 0, height: 12 } },
  eyebrow: { color: COLORS.gold, fontSize: 13, fontWeight: "900", letterSpacing: 2.5 },
  title: { color: COLORS.cream, fontSize: 47, lineHeight: 45, fontWeight: "900", letterSpacing: -1, marginVertical: 12, textShadowColor: COLORS.terracottaDark, textShadowOffset: { width: 4, height: 4 }, textShadowRadius: 0 },
  rule: { height: 5, width: 120, backgroundColor: COLORS.terracotta, marginBottom: 16 },
  tagline: { color: "white", fontSize: 16, fontWeight: "800", lineHeight: 24, marginBottom: 16 },
  instructions: { backgroundColor: "rgba(255,255,255,0.07)", borderLeftWidth: 5, borderLeftColor: COLORS.gold, padding: 12, marginBottom: 18, gap: 7 },
  step: { color: COLORS.cream, fontSize: 11, lineHeight: 16, fontWeight: "800" },
  stepNumber: { color: COLORS.terracotta, fontSize: 16, fontWeight: "900" },
  label: { color: COLORS.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginBottom: 7 },
  input: { minHeight: 56, color: COLORS.cream, backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 2, borderColor: COLORS.teal, borderRadius: 7, paddingHorizontal: 16, fontSize: 19, fontWeight: "700", marginBottom: 14 },
  finePrint: { color: "#a8b4b1", textAlign: "center", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginTop: 16 },
});
