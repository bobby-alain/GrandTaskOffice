import { GameState, Mission, OfficeZone } from "./types";

const normalMissions: Record<OfficeZone, Mission> = {
  "Entrance and lifts": { title: "LOBBY DECOY", situation: "The receptionist studies you like a suspicious calendar invitation.", choices: [
    { text: "Deliver a fake parcel", outcome: "The parcel contains only confidence. Somehow it works.", moneyChange: 1, reputationChange: 1, alertChange: 0, requiredItem: null, rewardItem: null },
    { text: "Hide behind the tall plant", outcome: "The plant is tiny. You are not.", moneyChange: 0, reputationChange: -1, alertChange: 1, requiredItem: null, rewardItem: null },
    { text: "Buy an emergency cinnamon bun", outcome: "Sugar improves every questionable plan.", moneyChange: -1, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: "cinnamon_bun" },
  ]},
  "Open workspace": { title: "THE SILENT KEYBOARD", situation: "A laptop is unattended while its owner argues with a spreadsheet.", choices: [
    { text: "Borrow the laptop for the operation", outcome: "You acquire portable computing and several mysterious stickers.", moneyChange: 0, reputationChange: -1, alertChange: 1, requiredItem: null, rewardItem: "laptop" },
    { text: "Fix the spreadsheet first", outcome: "One formula later, you are treated like office royalty.", moneyChange: 1, reputationChange: 2, alertChange: 0, requiredItem: null, rewardItem: null },
    { text: "Crawl beneath the desks", outcome: "Excellent stealth, terrible cable management.", moneyChange: 1, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: null },
  ]},
  "Meeting-room corridor": { title: "KEYCARD IN CONFERENCE", situation: "A forgotten visitor badge glows beneath a meeting-room chair. This could open the manager's office.", ruleCritical: true, choices: [
    { text: "Slide under the table and take it", outcome: "A graceful tactical roll earns you the keycard.", moneyChange: 0, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: "keycard" },
    { text: "Trade coffee for the badge", outcome: "The trade succeeds, but the badge has already been moved.", moneyChange: 0, reputationChange: 1, alertChange: 0, requiredItem: "coffee", rewardItem: null },
    { text: "Wait for everyone to leave", outcome: "You wait too long and the badge disappears into lost property.", moneyChange: 0, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: null },
  ]},
  "Coffee and kitchen area": { title: "THE LAST COFFEE", situation: "One heroic cup remains between you and the afternoon slump.", choices: [
    { text: "Claim it for the mission", outcome: "The coffee joins your inventory with dramatic purpose.", moneyChange: 0, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: "coffee" },
    { text: "Distract everyone with a bun", outcome: "The kitchen clears while colleagues follow the cinnamon scent.", moneyChange: 1, reputationChange: 1, alertChange: 0, requiredItem: "cinnamon_bun", rewardItem: null },
    { text: "Make decaf and say nothing", outcome: "A quiet crime, noticed only by destiny.", moneyChange: 1, reputationChange: -1, alertChange: 1, requiredItem: null, rewardItem: null },
  ]},
  "Print and utility area": { title: "OPERATION PAPER JAM", situation: "The printer flashes an error code that looks surprisingly judgmental.", choices: [
    { text: "Repair it with office engineering", outcome: "A stapler cannot fix a printer, but now you own a stapler.", moneyChange: 0, reputationChange: 1, alertChange: 0, requiredItem: null, rewardItem: "stapler" },
    { text: "Print 300 decoy documents", outcome: "The office vanishes beneath a tactical blizzard of paper.", moneyChange: -1, reputationChange: -1, alertChange: 1, requiredItem: null, rewardItem: null },
    { text: "Use the laptop diagnostics", outcome: "The laptop whispers the sacred words: turn it off and on again.", moneyChange: 1, reputationChange: 2, alertChange: 0, requiredItem: "laptop", rewardItem: null },
  ]},
  "Manager/drop-in office": { title: "THE SECRET DOCUMENT", situation: "The keycard opens the manager's office. A sealed folder waits beneath a suspiciously tidy keyboard.", ruleCritical: true, choices: [
    { text: "Swap it for a decoy folder", outcome: "The secret document slides into your coat. Smooth work.", moneyChange: 2, reputationChange: 0, alertChange: 0, requiredItem: null, rewardItem: "secret_document" },
    { text: "Photograph the desk instead", outcome: "The webcam flash is louder than expected. You leave without the document.", moneyChange: 1, reputationChange: 0, alertChange: 1, requiredItem: null, rewardItem: null },
    { text: "Read the executive summary", outcome: "It says: 'Never trust the printer.' Useful, but you leave empty-handed.", moneyChange: 0, reputationChange: 1, alertChange: 0, requiredItem: null, rewardItem: null },
  ]},
};

const bossMission: Mission = { title: "BOSS ENCOUNTER", situation: "The Boss rounds the corner. There is nowhere to hide except inside your own confidence.", bossMessage: "I knew someone was sneaking around my office.", choices: [
  { text: "Pretend this is an urgent fire drill", outcome: "The Boss checks the calendar. You gain six precious seconds.", moneyChange: 0, reputationChange: -1, alertChange: 0, requiredItem: null, rewardItem: null },
  { text: "Offer emergency coffee", outcome: "The Boss accepts the coffee and briefly forgets your face.", moneyChange: 0, reputationChange: 1, alertChange: -1, requiredItem: "coffee", rewardItem: null },
  { text: "Sprint behind the photocopier", outcome: "Fast, loud and technically successful.", moneyChange: -1, reputationChange: 0, alertChange: 1, requiredItem: null, rewardItem: null },
]};

export function getFallbackMission(state: GameState, location: OfficeZone, bossEncounter: boolean): Mission {
  return bossEncounter ? bossMission : normalMissions[location];
}
