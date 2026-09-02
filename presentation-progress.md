# Grand Task Office — Presentation Progress

## Steps completed

1. **Started with an idea**  
   I received an individual challenge to create a small, fun game using as much AI assistance as possible. The other participants are each building their own separate game.

2. **Planned the game with Codex**  
   I used Codex as my planning partner. I described my ideas, asked questions, compared suggestions, and refined the project through several short discussions. I frequently used microphone input to speak naturally to the AI instead of typing every prompt.

3. **Chose the game concept**  
   With AI assistance, I named the game **Grand Task Office** and defined it as a GTA-inspired office comedy with missions, choices, alert stars, collectible objects, achievements, and a secret room.

4. **Chose the technology**  
   I initially selected React and React hooks, then changed the frontend to **Expo with React Native and TypeScript** so I could learn mobile-style development while still demonstrating the game in a laptop browser. I kept the very small Python Flask backend and Ollama for local AI.

5. **Installed the local AI model**  
   I installed Ollama and downloaded `gemma3:4b`. The local model will generate missions automatically without an online API key.

6. **Collected visual references**  
   I gathered an office floor plan and building and meeting-room photos. AI image generation will use them as references for an original, simplified comic-style map.

7. **Created the project plan**  
   I worked with Codex to document the game rules, architecture, graphics, AI integration, implementation steps, and tests in a Markdown file.

8. **Created the project folder**  
   I created `Desktop/GrandTaskOffice` and placed the project plan inside it.

9. **Handed the plan to GitHub Copilot**  
   I gave GitHub Copilot the Markdown plan as the project specification. Copilot analyzed it and produced a six-step implementation roadmap covering the foundation, playable game, local AI missions, map and visuals, items and features, and final verification. It also identified response validation as the main technical risk and kept fallback missions in the roadmap.

10. **Refined the frontend plan with AI**  
    After discussing the workshop goal with Codex, I chose Expo's default TypeScript template and Expo Router. The game will use React Native core components and built-in animation instead of a large UI library. Expo Web will be the main laptop demo, with the same project remaining compatible with iOS and Android.

11. **Completed Step 1 with GitHub Copilot**  
    I asked Copilot to build the foundation from the updated Markdown plan. It scaffolded an Expo SDK 57 frontend with React Native, TypeScript, and Expo Router, and installed its dependencies. It also created a Python Flask backend with `/health`, `/test-ollama`, and `POST /api/mission`, including response validation, three fallback missions, and six commented Python learning moments. Copilot created the virtual environment, launcher scripts for both services, a setup guide, and a foundation summary. Flask runs on port `5000` and Expo Web runs on port `8081`.

    This step demonstrated that an AI coding assistant could turn my natural-language plan into a working project structure, backend API, development scripts, and documentation while also explaining the generated Python code.

## Next step

12. **Build Step 2: Playable Game with GitHub Copilot**  
    I will ask Copilot to replace the Expo example routes with the five game screens, add the shared game reducer and player setup, integrate fixed sample missions, and make a complete five-mission game playable before connecting live AI generation.

## How AI supports my project

- **Codex:** idea development, planning, decisions, and documentation
- **Microphone input:** quickly explaining and refining my ideas through conversation instead of relying only on typed prompts
- **Image generation:** creating the office-map artwork from my references
- **Expo:** providing the React Native project, web demonstration environment, file-based routing, and cross-platform components
- **GitHub Copilot:** helping me write and understand the Expo, React Native, TypeScript, and Flask implementation
- **Ollama and `gemma3:4b`:** generating new missions inside the finished game
- **My role:** directing the AI tools, making decisions, checking their work, and combining the results into the final game

## Short presentation summary

> I began with an individual AI-game challenge and used Codex as my planning partner to turn the idea into a clear project plan. During planning, I frequently used the microphone to speak my prompts and refine the idea conversationally instead of typing everything. I chose Expo, React Native, TypeScript, Flask, and a local Ollama model, installed the model, generated the game artwork, and documented the implementation. GitHub Copilot transformed the plan into a six-step roadmap and completed Step 1 by generating the frontend and backend foundations, launcher scripts, fallbacks, and documentation. My next action is to use Copilot to build the playable game in Step 2. My goal is to use AI throughout the process while I direct, review, test, and combine the work.
