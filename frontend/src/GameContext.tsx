import React, { createContext, Dispatch, ReactNode, useContext, useReducer } from "react";
import { getFallbackMission } from "./sampleMissions";
import {
  AchievementId,
  BOSS_CLUES,
  GameState,
  Mission,
  OFFICE_ZONES,
  OfficeZone,
  STARTING_STATE,
} from "./types";

export type GameAction =
  | { type: "START_GAME"; payload: { playerName: string } }
  | { type: "SELECT_LOCATION"; payload: { location: OfficeZone } }
  | { type: "SET_MISSION"; payload: { location: OfficeZone; mission: Mission } }
  | { type: "SET_MISSION_LOADING"; payload: { loading: boolean } }
  | { type: "SELECT_CHOICE"; payload: { choiceIndex: number } }
  | { type: "ADVANCE_ROUND" }
  | { type: "RESTART_GAME" };

function nameSeed(name: string): number {
  return [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

function startingBossZone(playerName: string): OfficeZone {
  return OFFICE_ZONES[nameSeed(playerName) % OFFICE_ZONES.length];
}

export function nextBossZone(current: OfficeZone, round: number, playerName: string): OfficeZone {
  const currentIndex = OFFICE_ZONES.indexOf(current);
  const step = 1 + ((round + nameSeed(playerName)) % (OFFICE_ZONES.length - 1));
  return OFFICE_ZONES[(currentIndex + step) % OFFICE_ZONES.length];
}

function achievementsFor(state: GameState): AchievementId[] {
  const achievements: AchievementId[] = [];
  if (state.collectedItems.includes("coffee")) achievements.push("coffee_criminal");
  if (state.collectedItems.includes("stapler")) achievements.push("stapler_king");
  if (state.reputation >= 8) achievements.push("office_legend");
  if (state.collectedItems.length >= 3) achievements.push("master_thief");
  return achievements;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const playerName = action.payload.playerName.trim() || "Rookie";
      const bossZone = startingBossZone(playerName);
      return { ...STARTING_STATE, playerName, bossZone, bossClue: BOSS_CLUES[bossZone], phase: "map" };
    }

    case "SELECT_LOCATION": {
      const location = action.payload.location;
      const hasKeycard = state.inventory.includes("keycard");
      const canEscape = hasKeycard && state.inventory.includes("secret_document");
      if (location === "Manager/drop-in office" && !hasKeycard) return state;
      if (location === "Entrance and lifts" && canEscape) {
        const ended = { ...state, location, ending: "escaped" as const, phase: "ending" as const };
        return { ...ended, achievements: achievementsFor(ended) };
      }

      const bossEncounter = location === state.bossZone;
      const alertLevel = Math.min(5, state.alertLevel + (bossEncounter ? 1 : 0));
      const currentMission = getFallbackMission(state, location, bossEncounter);
      const visitedZones = state.visitedZones.includes(location) ? state.visitedZones : [...state.visitedZones, location];
      const selected = { ...state, location, visitedZones, bossEncounter, alertLevel, currentMission, selectedChoiceIndex: null, lastRewardItem: null };
      if (alertLevel >= 5) {
        const ended = { ...selected, ending: "caught" as const, phase: "ending" as const };
        return { ...ended, achievements: achievementsFor(ended) };
      }
      return { ...selected, phase: "mission" };
    }

    case "SET_MISSION":
      if (state.phase !== "mission" || state.location !== action.payload.location || state.currentMission?.ruleCritical) return state;
      return { ...state, currentMission: action.payload.mission, missionLoading: false };

    case "SET_MISSION_LOADING":
      return { ...state, missionLoading: action.payload.loading };

    case "SELECT_CHOICE": {
      const mission = state.currentMission;
      const choice = mission?.choices[action.payload.choiceIndex];
      if (!choice || (choice.requiredItem && !state.inventory.includes(choice.requiredItem))) return state;

      let inventory = [...state.inventory];
      if (choice.requiredItem) inventory = inventory.filter((item) => item !== choice.requiredItem);
      if (choice.rewardItem && !inventory.includes(choice.rewardItem)) inventory.push(choice.rewardItem);
      const collectedItems = choice.rewardItem && !state.collectedItems.includes(choice.rewardItem)
        ? [...state.collectedItems, choice.rewardItem]
        : state.collectedItems;

      return {
        ...state,
        phase: "outcome",
        selectedChoiceIndex: action.payload.choiceIndex,
        money: Math.max(0, state.money + choice.moneyChange),
        reputation: Math.max(0, Math.min(10, state.reputation + choice.reputationChange)),
        alertLevel: Math.max(0, Math.min(5, state.alertLevel + choice.alertChange)),
        inventory,
        collectedItems,
        lastRewardItem: choice.rewardItem,
      };
    }

    case "ADVANCE_ROUND": {
      if (state.alertLevel >= 5) {
        const ended = { ...state, ending: "caught" as const, phase: "ending" as const };
        return { ...ended, achievements: achievementsFor(ended) };
      }
      if (state.round >= 8) {
        const ended = { ...state, ending: "locked_down" as const, phase: "ending" as const };
        return { ...ended, achievements: achievementsFor(ended) };
      }
      const bossZone = nextBossZone(state.bossZone, state.round, state.playerName);
      return {
        ...state,
        round: state.round + 1,
        previousBossZone: state.bossZone,
        bossZone,
        bossClue: BOSS_CLUES[bossZone],
        phase: "map",
        location: null,
        bossEncounter: false,
        currentMission: null,
        selectedChoiceIndex: null,
        missionLoading: false,
        lastRewardItem: null,
      };
    }

    case "RESTART_GAME":
      return { ...STARTING_STATE };

    default:
      return state;
  }
}

interface GameContextValue { state: GameState; dispatch: Dispatch<GameAction>; }
const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, STARTING_STATE);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used inside GameProvider");
  return context;
}
