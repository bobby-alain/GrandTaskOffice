# Grand Task Office — Project Plan

## Project summary

Grand Task Office is a 5–10 minute single-player office heist. One human player competes against a computer-controlled Boss patrol. The developer directs the project and collaborates with AI for planning, images, implementation, testing, documentation, and runtime mission writing.

```text
Expo + React Native → Flask → Ollama → gemma3:4b
```

The game remains fully playable when Ollama is offline.

## Game loop

1. Enter an optional player name; blank becomes **Rookie**.
2. Read a clue about the Boss's current patrol zone.
3. Pick one of six hotspots on the illustrated office map.
4. Resolve one mission with exactly three choices.
5. Collect items and manage money, reputation, and Boss Alert.
6. The Boss moves after the round and never immediately repeats a zone.
7. Escape before alert reaches five stars or eight rounds expire.

## Heist progression

- The meeting-room corridor contains the deterministic keycard mission.
- The manager's office is locked until the keycard is owned.
- The manager mission can award the secret document.
- With both required items, the entrance becomes a glowing **ESCAPE** hotspot.
- Reach it to earn **Clean Getaway**.
- Five alert stars produces **Busted by the Boss**.
- Finishing round eight produces **Office Lockdown**.

Coffee, laptop, stapler, and cinnamon bun remain optional helper items. They unlock special choices and humorous achievements.

## Fair computer opponent

The frontend reducer selects the Boss patrol using the player name, round, and previous zone. The next zone is always different from the current one. A clue is shown before every location choice. Entering the Boss zone immediately adds one alert star and starts a Boss encounter.

Ollama can write Boss dialogue, clues, situations, and consequences. It cannot select patrol zones, award the required heist items, change statistics outside the validated range, change round limits, or decide an ending.

## Visual design

- Original retro crime-comedy presentation inspired by the energy of classic crime games
- Full-screen illustrated title background and actual illustrated office map
- Six responsive, keyboard-accessible map hotspots
- Terracotta, teal, gold, cream, and charcoal palette
- Dark translucent panels and heavy uppercase headings with outlines/shadows
- Arcade buttons at least 56 px high
- HUD for round, cash, reputation, inventory, objective, and five alert stars
- Animated screen entrances, Boss warning shake, star pulse, escape glow, and item acquisition
- No copied GTA logos, fonts, characters, or artwork

## State and API

The React Context reducer stores `playerName`, round/stat values, current and previous Boss zones, clue, visited zones, inventory, mission, choice, and `escaped | caught | locked_down` ending. Shared-player voting and score-based endings are removed.

The Flask request contains player and map context, including `bossZone` and `bossEncounter`. Flask validates Ollama JSON, requires exactly three choices, clamps effects, filters items, and returns a deterministic fallback if the model is missing, slow, or invalid. Fallback coverage includes normal, Boss, keycard, and document encounters.

## Implementation steps

### Step 1 — Foundation ✅

- Expo SDK 57, React Native, TypeScript, and Expo Router scaffold
- Flask backend, Ollama connection, initial validation, and fallbacks
- Local launcher scripts and setup documentation
- Preserved in Git commit `6141d05`

### Step 2 — Single-player playable heist ✅

- Replaced 4–6 players and voting with one player against the Boss
- Added deterministic patrol, clues, alert encounters, eight-round limit, and three endings
- Integrated generated title/map art and six cropped inventory icons
- Added keycard → manager office → document → escape progression
- Added offline-complete missions, live Ollama requests, animations, and responsive arcade UI

### Step 3 — Playtest and polish

- Run the complete heist several times with Ollama on and off
- Tune hotspot positions, mission length, difficulty, and laptop scaling
- Add only lightweight sound if presentation time allows

### Step 4 — Demonstration

- Show title, map, Boss clue, collision, item animation, locked office, and all endings
- Explain the split between deterministic rules and AI-authored flavour
- Present how microphone, Codex, image generation, Copilot, and Ollama were used

## Acceptance tests

- Zero or one typed player name can start a game.
- No multiplayer/voting interface remains.
- Boss zones never immediately repeat.
- Entering the Boss zone adds an alert star and displays a Boss encounter.
- The manager's office is locked without the keycard.
- The document is unavailable before entering with the keycard.
- Escape appears only with both required items.
- Five stars, eight rounds, and successful escape produce their correct endings.
- Restart clears player, patrol, inventory, progress, and ending.
- Fallback missions complete the game without Ollama.
- Expo Web displays the generated art at laptop sizes and all key actions are keyboard accessible.
