import { GameState, ItemId, Mission, MissionRequestPayload, MissionResponsePayload, OfficeZone } from "./types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5001";
const validItems: ItemId[] = ["cinnamon_bun", "coffee", "laptop", "keycard", "stapler", "secret_document"];

function isMission(value: unknown): value is Mission {
  if (!value || typeof value !== "object") return false;
  const mission = value as Mission;
  return typeof mission.title === "string" && typeof mission.situation === "string" && Array.isArray(mission.choices) && mission.choices.length === 3 && mission.choices.every((choice) =>
    typeof choice.text === "string" && typeof choice.outcome === "string" && [choice.moneyChange, choice.reputationChange, choice.alertChange].every(Number.isFinite) &&
    (choice.requiredItem === null || validItems.includes(choice.requiredItem)) && (choice.rewardItem === null || validItems.includes(choice.rewardItem))
  );
}

export async function requestMission(state: GameState, location: OfficeZone): Promise<Mission | null> {
  if ((location === "Meeting-room corridor" && !state.inventory.includes("keycard")) || (location === "Manager/drop-in office" && !state.inventory.includes("secret_document"))) return null;
  const payload: MissionRequestPayload = { playerName: state.playerName, location, round: state.round, money: state.money, reputation: state.reputation, alertLevel: state.alertLevel, bossZone: state.bossZone, bossEncounter: state.bossEncounter, visitedLocations: state.visitedZones, inventory: state.inventory };
  try {
    const response = await fetch(`${API_URL}/api/mission`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) return null;
    const data = (await response.json()) as MissionResponsePayload;
    if (!isMission(data.mission)) return null;
    return { ...data.mission, choices: data.mission.choices.map((choice) => ({ ...choice,
      moneyChange: Math.max(-2, Math.min(2, choice.moneyChange)), reputationChange: Math.max(-2, Math.min(2, choice.reputationChange)), alertChange: Math.max(-2, Math.min(2, choice.alertChange)),
      rewardItem: choice.rewardItem === "keycard" || choice.rewardItem === "secret_document" ? null : choice.rewardItem,
    })) };
  } catch { return null; }
}
