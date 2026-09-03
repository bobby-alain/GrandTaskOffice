import { useEffect, useRef } from "react";
import { Animated, Image, ImageBackground, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { requestMission } from "../api";
import { GameButton, Hud, ITEM_ART, ScreenEntrance } from "../components/game-ui";
import { useGame } from "../GameContext";
import { COLORS } from "../theme";
import { ITEM_NAMES } from "../types";

const background = require("../../assets/game/title-screen-background.png");
const USE_NATIVE_DRIVER = Platform.OS !== "web";

export default function MissionScreen() {
  const router = useRouter();
  const { state, dispatch } = useGame();
  const requestedKey = useRef("");
  const warning = useRef(new Animated.Value(0)).current;
  const reward = useRef(new Animated.Value(0)).current;
  const mission = state.currentMission;
  const selected = mission && state.selectedChoiceIndex !== null ? mission.choices[state.selectedChoiceIndex] : null;

  useEffect(() => {
    if (!state.location || !mission || mission.ruleCritical || state.phase !== "mission") return;
    const key = `${state.round}:${state.location}`;
    if (requestedKey.current === key) return;
    requestedKey.current = key;
    dispatch({ type: "SET_MISSION_LOADING", payload: { loading: true } });
    requestMission(state, state.location).then((generated) => {
      if (generated) dispatch({ type: "SET_MISSION", payload: { location: state.location!, mission: generated } });
      else dispatch({ type: "SET_MISSION_LOADING", payload: { loading: false } });
    });
  }, [dispatch, mission, state]);

  useEffect(() => {
    if (!state.bossEncounter) return;
    Animated.sequence([
      Animated.timing(warning, { toValue: 1, duration: 120, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(warning, { toValue: -1, duration: 120, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(warning, { toValue: 0, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, [state.bossEncounter, warning]);

  useEffect(() => {
    if (!state.lastRewardItem) return;
    Animated.sequence([
      Animated.spring(reward, { toValue: 1, speed: 10, bounciness: 12, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.delay(350),
      Animated.timing(reward, { toValue: 2, duration: 650, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, [state.lastRewardItem, reward]);

  if (!mission || !state.location) {
    return <View style={styles.empty}><Text style={styles.body}>No mission loaded.</Text><GameButton label="RETURN TO MAP" onPress={() => router.replace("/map")} /></View>;
  }

  const choose = (index: number) => dispatch({ type: "SELECT_CHOICE", payload: { choiceIndex: index } });
  const advance = () => {
    const ending = state.alertLevel >= 5 || state.round >= 8;
    dispatch({ type: "ADVANCE_ROUND" });
    router.replace(ending ? "/ending" : "/map");
  };

  return (
    <ImageBackground source={background} resizeMode="cover" style={styles.background}>
      <View style={styles.scrim} />
      <ScrollView contentContainerStyle={styles.content}>
        <Hud state={state} />
        <Animated.View style={{ transform: [{ translateX: warning.interpolate({ inputRange: [-1, 0, 1], outputRange: [-12, 0, 12] }) }] }}>
          <ScreenEntrance style={[styles.panel, state.bossEncounter ? styles.bossPanel : undefined]}>
            <View style={styles.metaRow}>
              <Text style={styles.location}>ROUND {state.round}  /  {state.location.toUpperCase()}</Text>
              {state.missionLoading && <Text style={styles.aiStatus}>AI IS WRITING… FALLBACK READY</Text>}
            </View>
            {state.bossEncounter && <View style={styles.warning}><Text style={styles.warningTitle}>⚠ BOSS ENCOUNTER — ALERT +1</Text><Text style={styles.bossMessage}>“{mission.bossMessage ?? "What exactly are you doing here?"}”</Text></View>}
            <Text style={styles.title}>{mission.title.toUpperCase()}</Text>
            <Text style={styles.situation}>{mission.situation}</Text>

            {!selected ? (
              <View style={styles.choices}>
                <Text style={styles.prompt}>CHOOSE YOUR MOVE</Text>
                {mission.choices.map((choice, index) => {
                  const locked = !!choice.requiredItem && !state.inventory.includes(choice.requiredItem);
                  return (
                    <Pressable key={`${choice.text}-${index}`} accessibilityRole="button" accessibilityState={{ disabled: locked }} disabled={locked} onPress={() => choose(index)} style={({ pressed }) => [styles.choice, locked && styles.choiceLocked, pressed && styles.choicePressed]}>
                      <Text style={styles.choiceNumber}>0{index + 1}</Text>
                      <View style={styles.choiceCopy}><Text style={styles.choiceText}>{choice.text.toUpperCase()}</Text>{choice.requiredItem && <Text style={styles.itemOption}>{locked ? "LOCKED" : "ITEM OPTION"}  •  {ITEM_NAMES[choice.requiredItem]}</Text>}</View>
                      <Text style={styles.arrow}>›</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.outcome}>
                <Text style={styles.prompt}>CONSEQUENCE</Text>
                <Text style={styles.outcomeText}>{selected.outcome}</Text>
                <View style={styles.effects}>
                  <Text style={styles.effect}>CASH {selected.moneyChange >= 0 ? "+" : ""}{selected.moneyChange}</Text>
                  <Text style={styles.effect}>REP {selected.reputationChange >= 0 ? "+" : ""}{selected.reputationChange}</Text>
                  <Text style={[styles.effect, selected.alertChange > 0 && styles.danger]}>ALERT {selected.alertChange >= 0 ? "+" : ""}{selected.alertChange}</Text>
                </View>
                {state.lastRewardItem && (
                  <Animated.View style={[styles.reward, { opacity: reward.interpolate({ inputRange: [0, 0.2, 1.7, 2], outputRange: [0, 1, 1, 0] }), transform: [{ scale: reward.interpolate({ inputRange: [0, 1, 2], outputRange: [0.2, 1.2, 0.45] }) }, { translateY: reward.interpolate({ inputRange: [0, 1, 2], outputRange: [30, 0, -100] }) }] }]}>
                    <Image source={ITEM_ART[state.lastRewardItem]} style={styles.rewardImage} resizeMode="contain" />
                    <Text style={styles.rewardText}>{ITEM_NAMES[state.lastRewardItem].toUpperCase()} ACQUIRED</Text>
                  </Animated.View>
                )}
                <GameButton label={state.alertLevel >= 5 || state.round >= 8 ? "SEE WHAT HAPPENED" : "RETURN TO THE MAP"} onPress={advance} tone={state.alertLevel >= 5 ? "orange" : "teal"} />
              </View>
            )}
          </ScreenEntrance>
        </Animated.View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 }, scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(6,11,12,0.74)" },
  content: { width: "100%", maxWidth: 980, minHeight: "100%", alignSelf: "center", justifyContent: "center", padding: 20, gap: 14 },
  panel: { backgroundColor: COLORS.panel, borderWidth: 3, borderColor: COLORS.teal, borderRadius: 11, padding: 24, shadowColor: "#000", shadowOpacity: 0.65, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  bossPanel: { borderColor: COLORS.danger }, metaRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  location: { color: COLORS.gold, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 }, aiStatus: { color: "#85d8d0", fontSize: 10, fontWeight: "800" },
  warning: { backgroundColor: "rgba(151,29,17,0.88)", borderLeftWidth: 7, borderLeftColor: COLORS.gold, padding: 13, marginTop: 14 }, warningTitle: { color: "white", fontSize: 17, fontWeight: "900" }, bossMessage: { color: COLORS.cream, marginTop: 6, fontStyle: "italic" },
  title: { color: COLORS.cream, fontSize: 39, lineHeight: 40, fontWeight: "900", marginTop: 18, textShadowColor: COLORS.terracottaDark, textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0 },
  situation: { color: "white", fontSize: 18, lineHeight: 27, marginTop: 12, marginBottom: 20 }, prompt: { color: COLORS.gold, fontSize: 12, fontWeight: "900", letterSpacing: 1.7, marginBottom: 10 }, choices: { gap: 11 },
  choice: { minHeight: 68, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 2, borderColor: COLORS.teal, borderRadius: 8, padding: 10 }, choiceLocked: { opacity: 0.38, borderColor: "#777" }, choicePressed: { transform: [{ translateX: 5 }], backgroundColor: "rgba(13,143,138,0.35)" }, choiceNumber: { color: COLORS.terracotta, fontSize: 25, fontWeight: "900", marginRight: 12 }, choiceCopy: { flex: 1 }, choiceText: { color: "white", fontSize: 15, fontWeight: "900" }, itemOption: { color: COLORS.gold, fontSize: 10, fontWeight: "900", marginTop: 5 }, arrow: { color: COLORS.gold, fontSize: 36, fontWeight: "300" },
  outcome: { backgroundColor: "rgba(8,39,39,0.72)", borderLeftWidth: 6, borderLeftColor: COLORS.gold, padding: 18, gap: 12 }, outcomeText: { color: COLORS.cream, fontSize: 20, lineHeight: 29, fontWeight: "700" }, effects: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, effect: { color: COLORS.charcoal, backgroundColor: COLORS.gold, fontSize: 12, fontWeight: "900", paddingVertical: 7, paddingHorizontal: 10, borderRadius: 4 }, danger: { backgroundColor: COLORS.danger, color: "white" },
  reward: { alignSelf: "center", alignItems: "center" }, rewardImage: { width: 100, height: 100 }, rewardText: { color: COLORS.gold, fontWeight: "900", letterSpacing: 1 },
  empty: { flex: 1, justifyContent: "center", gap: 20, padding: 30, backgroundColor: COLORS.charcoal }, body: { color: "white", textAlign: "center" },
});
