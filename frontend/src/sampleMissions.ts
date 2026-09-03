import { GameState, Mission, OfficeZone } from "./types";

const normalMissions: Record<OfficeZone, Mission> = {
  "Entrance and lifts": { title: "LOBBY DECOY", situation: "The receptionist studies you like a suspicious calendar invitation.", choices: [
    { text: "Deliver a fake parcel", outcome: "The parcel contains only confidence. Somehow it works.", moneyChange: 1, reputationChange: 1, alertChange: 0, requiredItem: null, rewardItem: null },
    { text: "Borrow the emergency coffee", outcome: "The coffee joins the operation and smells extremely classified.", moneyChange: 0, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: "coffee" },
    { text: "Buy an emergency cinnamon bun", outcome: "Sugar improves every questionable plan.", moneyChange: -1, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: "cinnamon_bun" },
  ]},
  "Open workspace": { title: "THE SILENT KEYBOARD", situation: "A laptop is unattended while its owner argues with a spreadsheet.", choices: [
    { text: "Borrow the laptop for the operation", outcome: "You acquire portable computing and several mysterious stickers.", moneyChange: 0, reputationChange: -1, alertChange: 1, requiredItem: null, rewardItem: "laptop" },
    { text: "Pocket the tactical stapler", outcome: "It is heavy, red, and probably important to someone.", moneyChange: 0, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: "stapler" },
    { text: "Crawl beneath the desks", outcome: "Excellent stealth, terrible cable management.", moneyChange: 1, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: null },
  ]},
  "Manager/drop-in office": { title: "THE SECRET DOCUMENT", situation: "The keycard opens the manager's office. A sealed folder waits beneath a suspiciously tidy keyboard.", ruleCritical: true, choices: [
    { text: "Swap it for a decoy folder", outcome: "The secret document slides into your coat. Smooth work.", moneyChange: 2, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: "secret_document" },
    { text: "Photograph the desk instead", outcome: "The webcam flash is louder than expected. You leave without the document.", moneyChange: 1, reputationChange: 0, alertChange: 1, requiredItem: null, rewardItem: null },
    { text: "Read the executive summary", outcome: "It says: 'Never trust the printer.' Useful, but you leave empty-handed.", moneyChange: 0, reputationChange: 1, alertChange: 0, requiredItem: null, rewardItem: null },
  ]},
};

const keycardMission: Mission = { title: "KEYCARD IN THE OPEN", situation: "A forgotten keycard glows beneath a meeting table inside the open workspace.", ruleCritical: true, choices: [
  { text: "Slide under the table and take it", outcome: "A graceful tactical roll earns you the keycard.", moneyChange: 0, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: "keycard" },
  { text: "Trade coffee for the keycard", outcome: "A suspiciously efficient exchange earns you the keycard.", moneyChange: 0, reputationChange: 1, alertChange: 0, requiredItem: "coffee", rewardItem: "keycard" },
  { text: "Wait for everyone to leave", outcome: "You wait too long and security collects it.", moneyChange: 0, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: null },
]};

const bossMission: Mission = { title: "BOSS ENCOUNTER", situation: "The Boss rounds the corner. There is nowhere to hide except inside your own confidence.", bossMessage: "I knew someone was sneaking around my office.", choices: [
  { text: "Pretend this is an urgent fire drill", outcome: "The Boss checks the calendar. You gain six precious seconds.", moneyChange: 0, reputationChange: -1, alertChange: 0, requiredItem: null, rewardItem: null },
  { text: "Offer emergency coffee", outcome: "The Boss accepts the coffee and briefly forgets your face.", moneyChange: 0, reputationChange: 1, alertChange: -1, requiredItem: "coffee", rewardItem: null },
  { text: "Sprint behind the photocopier", outcome: "Fast, loud and technically successful.", moneyChange: -1, reputationChange: 0, alertChange: 1, requiredItem: null, rewardItem: null },
]};

export function getFallbackMission(state: GameState, location: OfficeZone, bossEncounter: boolean): Mission {
  if (bossEncounter) return bossMission;
  if (location === "Open workspace" && !state.inventory.includes("keycard")) return keycardMission;
  return normalMissions[location];
}
