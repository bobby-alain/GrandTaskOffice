# Step 2 — Single-Player Heist Complete

The unfinished multiplayer Step 2 has been refactored into the intended one-player demo while the Step 1 foundation remains preserved in commit `6141d05`.

## Delivered

- Optional single name and **START THE HEIST** title screen
- Illustrated office map with six responsive hotspots
- Deterministic non-repeating Boss patrol and a clue each round
- Immediate Boss encounter alert
- Keycard → locked manager office → secret document → glowing exit progression
- Escaped, caught, and locked-down endings
- Five-star HUD, inventory art, large controls, focus/pressed/locked/completed states
- Screen, reward, Boss-warning, alert-star, and escape animations
- Live Ollama mission requests with deterministic frontend rules
- Normal, Boss, keycard, and document fallbacks for offline play

## Run

```bash
cd /Users/bobby.inayat/Desktop/GrandTaskOffice
./start-all.sh
```

Open `http://localhost:8081`.
