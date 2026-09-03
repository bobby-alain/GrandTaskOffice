# Grand Task Office — Presentation Progress

## What I did with AI

1. **Started with an individual challenge** — Everyone in the workshop is building a separate game. This project is mine, built by me in collaboration with AI.
2. **Planned by conversation** — I used Codex to brainstorm, compare ideas, choose the name **Grand Task Office**, define the rules, and create the Markdown plan. I frequently used the microphone instead of typing so I could refine ideas naturally.
3. **Chose the stack** — With AI guidance, I changed the frontend from ordinary React to Expo, React Native, TypeScript, and Expo Router. I kept a tiny Python Flask backend and local Ollama model.
4. **Installed local AI** — I installed Ollama and downloaded `gemma3:4b`, allowing the finished game to create missions without an online API key.
5. **Created visual references and assets** — I supplied an office plan and location photographs. AI image generation turned them into an original retro crime-comedy title screen, office map, and item artwork.
6. **Built Step 1 with GitHub Copilot** — Copilot scaffolded the Expo frontend, Flask backend, virtual environment, launcher scripts, validation, fallbacks, and learning comments. This foundation was saved separately in Git as commit `6141d05`.
7. **Reviewed the first playable version** — The first Step 2 attempt looked like a plain 4–6-player form and list. I used screenshots and microphone feedback to explain that I wanted one player against the computer and a much richer retro game interface.
8. **Redesigned the game with Codex** — Together we converted the concept into a single-player heist: find the keycard, steal the document, dodge a patrolling Boss, and escape before five alert stars or eight rounds.
9. **Implemented the redesigned Step 2** — AI refactored the reducer, integrated the generated graphics, cropped the item sprite sheet, created map hotspots and large arcade controls, added the Boss opponent and three endings, updated Flask/Ollama, and kept complete offline fallbacks.
10. **Validated the result** — TypeScript, Expo Web export, Python syntax, API fallback routes, deterministic patrol, progression, endings, and restart are checked before presentation.
11. **Simplified after playtesting** — The first map had six locations and felt too busy on a phone. I asked AI to reduce it to three clear locations while preserving the complete keycard → document → escape game loop.
12. **Expanded local-AI variety** — I kept the critical heist steps deterministic, then used Ollama to generate fresh side missions and Boss encounters from rotating location-and-round themes. The game visibly labels missions created by the local model.
13. **Added sound and a stronger ending** — AI generated an original local retro loop and victory sting, connected them through Expo Audio, enlarged the phone text, and redesigned the winning screen so the celebration and Play Again button both fit.
14. **Tuned the soundtrack after feedback** — I asked AI to replace the arcade-like loop with an original 92 BPM hip-hop-inspired office-heist beat and keep a large safe-area MUSIC/MUTED control visible on every screen.

## How the AI roles fit together

- **Microphone:** fast natural-language direction and design feedback
- **Codex:** planning, implementation, debugging, testing, and documentation
- **Image generation:** original environment and item artwork based on supplied references
- **GitHub Copilot:** initial project scaffold and learning-oriented code generation
- **Ollama + gemma3:4b:** local runtime dialogue and mission flavour
- **My role:** creative direction, decisions, source material, review, testing, and acceptance

## Short presentation version

> This is my individual game, created by me together with AI. I used the microphone and Codex to turn a rough GTA-style office idea into a plan, chose Expo and React Native so I could learn something new, and used GitHub Copilot to scaffold the first foundation. I installed a local Ollama model and used AI image generation on my office references. When the first playable version felt too plain and multiplayer-focused, I gave the AI screenshots and spoken feedback. We redesigned it as a single-player heist against a fair computer-controlled Boss, integrated the artwork, and tested both live-AI and offline gameplay. I directed and reviewed each decision while AI helped produce and explain the work.
