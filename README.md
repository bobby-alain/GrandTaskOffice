# Grand Task Office

**Grand Task Office** is a short single-player office heist built with Expo, React Native, Flask, and a local Ollama model. You play a rookie operative against a computer-controlled Boss patrol.

## Mission

1. Find the keycard in the meeting-room corridor.
2. Use it to enter the manager's office.
3. Steal the secret document.
4. Return to the entrance and escape.

You lose when Boss Alert reaches five stars or round eight ends. The deterministic frontend owns these rules; Ollama only writes dialogue, clues, missions, and consequences.

## Start the demo

Ollama and `gemma3:4b` are optional because complete fallback missions are included.

```bash
ollama run gemma3:4b
```

In another terminal:

```bash
cd /Users/bobby.inayat/Desktop/GrandTaskOffice
./start-all.sh
```

- Expo Web: `http://localhost:8081`
- Flask: `http://localhost:5001`
- Ollama: `http://localhost:11434`

To start services separately, use `./start-frontend.sh` and `./start-backend.sh`.

## Stack

- Expo SDK 57 and React Native 0.86
- Expo Router for title, map, mission, and ending routes
- React Context and `useReducer` for the game engine
- React Native `Animated` for screen entrances, Boss warnings, alert stars, escape glow, and item rewards
- Flask for a small local API bridge
- Ollama with `gemma3:4b` for optional generated content

## API

`POST http://localhost:5001/api/mission`

```json
{
  "playerName": "Bobby",
  "location": "Print and utility area",
  "round": 3,
  "money": 4,
  "reputation": 6,
  "alertLevel": 2,
  "bossZone": "Print and utility area",
  "bossEncounter": true,
  "visitedLocations": ["Open workspace"],
  "inventory": ["coffee"]
}
```

The response contains `mission`, `source`, exactly three choices, and an optional `bossMessage`. AI output is validated and effects are clamped to `-2...2`. AI-generated keycards and secret documents are discarded; those rewards remain controlled by deterministic missions.

Other endpoints:

```bash
curl http://localhost:5001/health
curl http://localhost:5001/test-ollama
```

Set a different backend URL when needed:

```bash
EXPO_PUBLIC_API_URL=http://localhost:5001 npx expo start --web
```

## Project structure

```text
GrandTaskOffice/
├── frontend/
│   ├── assets/game/             Integrated title, map, and six item images
│   └── src/
│       ├── app/                 Expo Router screens
│       ├── components/game-ui.tsx
│       ├── GameContext.tsx      Reducer and Boss patrol rules
│       ├── api.ts               Flask request and validation
│       ├── sampleMissions.ts    Complete offline missions
│       └── types.ts
├── backend/app.py               Flask, Ollama prompt, validation, fallbacks
├── grand-task-office-project-plan.md
├── presentation-progress.md
└── STEP2_SINGLE_PLAYER_COMPLETE.md
```

## Validation

```bash
cd frontend
npx tsc --noEmit
npx expo export --platform web

cd ../backend
venv/bin/python -m py_compile app.py
```

The visual identity is an original retro crime-comedy treatment. It does not copy GTA logos, fonts, characters, maps, or artwork.
