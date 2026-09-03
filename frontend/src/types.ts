export const OFFICE_ZONES = [
  "Entrance and lifts",
  "Open workspace",
  "Meeting-room corridor",
  "Coffee and kitchen area",
  "Print and utility area",
  "Manager/drop-in office",
] as const;

export type OfficeZone = (typeof OFFICE_ZONES)[number];

export type ItemId =
  | "cinnamon_bun"
  | "coffee"
  | "laptop"
  | "keycard"
  | "stapler"
  | "secret_document";

export const ITEM_NAMES: Record<ItemId, string> = {
  cinnamon_bun: "Cinnamon Bun",
  coffee: "Coffee",
  laptop: "Laptop",
  keycard: "Keycard",
  stapler: "Stapler",
  secret_document: "Secret Document",
};

export interface Choice {
  text: string;
  outcome: string;
  moneyChange: number;
  reputationChange: number;
  alertChange: number;
  requiredItem: ItemId | null;
  rewardItem: ItemId | null;
}

export interface Mission {
  title: string;
  situation: string;
  choices: Choice[];
  bossMessage?: string;
  ruleCritical?: boolean;
}

export type GamePhase = "title" | "map" | "mission" | "outcome" | "ending";
export type EndingType = "escaped" | "caught" | "locked_down";
export type AchievementId = "coffee_criminal" | "stapler_king" | "office_legend" | "master_thief";

export interface GameState {
  playerName: string;
  round: number;
  money: number;
  reputation: number;
  alertLevel: number;
  location: OfficeZone | null;
  bossZone: OfficeZone;
  previousBossZone: OfficeZone | null;
  bossClue: string;
  visitedZones: OfficeZone[];
  inventory: ItemId[];
  collectedItems: ItemId[];
  currentMission: Mission | null;
  selectedChoiceIndex: number | null;
  ending: EndingType | null;
  phase: GamePhase;
  bossEncounter: boolean;
  missionLoading: boolean;
  achievements: AchievementId[];
  lastRewardItem: ItemId | null;
}

export const BOSS_CLUES: Record<OfficeZone, string> = {
  "Entrance and lifts": "The lift bell keeps ringing. Someone impatient is guarding the exit.",
  "Open workspace": "A chair rolls across the open floor, followed by very angry footsteps.",
  "Meeting-room corridor": "A stern voice echoes between the meeting rooms.",
  "Coffee and kitchen area": "A mug slams down beside the coffee machine.",
  "Print and utility area": "You hear angry footsteps near the printers.",
  "Manager/drop-in office": "A desk drawer shuts inside the manager's office.",
};

export const ACHIEVEMENT_NAMES: Record<AchievementId, string> = {
  coffee_criminal: "Coffee Criminal",
  stapler_king: "Stapler King",
  office_legend: "Office Legend",
  master_thief: "Master Thief",
};

export const ENDINGS: Record<EndingType, { title: string; message: string }> = {
  escaped: { title: "CLEAN GETAWAY", message: "You slip into the lift with the keycard and secret document. The Boss blames the printer." },
  caught: { title: "BUSTED BY THE BOSS", message: "Five alert stars light up the office. Your daring heist ends in a very awkward performance review." },
  locked_down: { title: "OFFICE LOCKDOWN", message: "Eight rounds are gone. The doors seal and the Boss schedules an emergency all-hands meeting." },
};

export const STARTING_STATE: GameState = {
  playerName: "Rookie", round: 1, money: 2, reputation: 5, alertLevel: 0,
  location: null, bossZone: "Print and utility area", previousBossZone: null,
  bossClue: BOSS_CLUES["Print and utility area"], visitedZones: [], inventory: [], collectedItems: [],
  currentMission: null, selectedChoiceIndex: null, ending: null, phase: "title",
  bossEncounter: false, missionLoading: false, achievements: [], lastRewardItem: null,
};

export interface MissionRequestPayload {
  playerName: string;
  location: OfficeZone;
  round: number;
  money: number;
  reputation: number;
  alertLevel: number;
  bossZone: OfficeZone;
  bossEncounter: boolean;
  visitedLocations: OfficeZone[];
  inventory: ItemId[];
}

export interface MissionResponsePayload { mission: Mission; source: string; }
