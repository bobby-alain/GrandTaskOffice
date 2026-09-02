# Grand Task Office — Foundation Setup

## ✅ What's Ready

This is **Step 1: Foundation** of the Grand Task Office project.

### Frontend ✅
- **Expo** with default TypeScript template (SDK 57)
- **React Native** with Expo Router
- Located in: `./frontend`

### Backend ✅
- **Flask** minimal server with one endpoint: `POST /api/mission`
- **Ollama integration** with fallback missions
- Python learning comments throughout the code
- Located in: `./backend`

### Support
- Startup scripts for local development
- Health check and Ollama test endpoints

---

## 🚀 Quick Start

### Option 1: Start Both Services Together
```bash
chmod +x start-all.sh
./start-all.sh
```

This will start:
1. Flask backend at `http://localhost:5000`
2. Expo frontend at `http://localhost:8081`

### Option 2: Start Services Separately

**Terminal 1 — Backend:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

**Terminal 2 — Frontend:**
```bash
chmod +x start-frontend.sh
./start-frontend.sh
```

---

## 🔧 Backend Setup (Manual)

If you prefer to set up manually:

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask app
python app.py
```

The backend will start on `http://localhost:5000`

---

## 🔧 Frontend Setup (Manual)

If you prefer to set up manually:

```bash
cd frontend

# Install dependencies
npm install

# Start Expo web dev server
npx expo start --web
```

The frontend will start on `http://localhost:8081`

---

## 🧪 Testing the Backend

### Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "ollama_available": true,
  "ollama_url": "http://localhost:11434/api/chat",
  "ollama_model": "gemma3:4b"
}
```

### Test Ollama Connection
```bash
curl http://localhost:5000/test-ollama
```

Expected response (if Ollama is running):
```json
{
  "status": "connected",
  "models": ["gemma3:4b", ...],
  "gemma3_4b_available": true
}
```

### Request a Mission
```bash
curl -X POST http://localhost:5000/api/mission \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Coffee and kitchen area",
    "round": 1,
    "money": 10,
    "reputation": 5,
    "alertLevel": 0,
    "visitedLocations": [],
    "inventory": [],
    "players": ["Alex", "Sam", "Kim"]
  }'
```

You should get back a mission with title, situation, and 3 choices.

---

## 📋 Backend Endpoints

### `GET /health`
Health check endpoint. Returns backend status and Ollama availability.

### `GET /test-ollama`
Test Ollama connection and list available models.

### `POST /api/mission`
Main gameplay endpoint.

**Request body:**
```json
{
  "location": "string",
  "round": number,
  "money": number,
  "reputation": number,
  "alertLevel": number,
  "visitedLocations": string[],
  "inventory": string[],
  "players": string[]
}
```

**Response:**
```json
{
  "mission": {
    "title": "string",
    "situation": "string",
    "choices": [
      {
        "text": "string",
        "outcome": "string",
        "moneyChange": number,
        "reputationChange": number,
        "alertChange": number,
        "requiredItem": string | null,
        "rewardItem": string | null
      },
      ...
    ]
  },
  "source": "ollama" | "fallback (reason)"
}
```

---

## ⚙️ Configuration

### Ollama Settings (in `backend/app.py`)
- **URL**: `http://localhost:11434/api/chat`
- **Model**: `gemma3:4b`
- **Timeout**: 5 seconds

To use a different Ollama URL or model, edit `backend/app.py`:
```python
OLLAMA_API_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "gemma3:4b"
OLLAMA_TIMEOUT = 5
```

### Expo Frontend Configuration
Set the backend URL via environment variable:
```bash
export EXPO_PUBLIC_API_URL=http://localhost:5000
```

For the web demo on a shared screen, use `localhost:5000`.
For testing on a physical phone, use your Mac's local IP (e.g., `192.168.1.100:5000`).

---

## 🧠 Python Learning in This Step

The backend code includes detailed comments explaining:

1. **HTTP Requests** — Making requests to Ollama
2. **JSON Parsing & Validation** — Handling structured responses
3. **Configuration & Constants** — Setting up reusable values
4. **Helper Functions** — Testing connections
5. **Error Handling** — try/except blocks and fallbacks
6. **Type Hints** — Python type annotations
7. **Request/Response Patterns** — Flask and API design

Look for "Python Learning Moment #N" comments in `backend/app.py`.

---

## 🎮 Frontend Stack

The Expo frontend includes:
- **Expo Router** for file-based navigation
- **React Native** core components (View, Text, Pressable, etc.)
- **TypeScript** for type safety
- **Expo Animated API** for object animations (added in Step 5)

No Redux, no third-party UI framework. Keep it simple.

---

## 📁 Project Structure

```
GrandTaskOffice/
├── frontend/                    # Expo + React Native
│   ├── src/app/
│   │   ├── _layout.tsx         # (to create in Step 2)
│   │   ├── index.tsx           # (to create in Step 2)
│   │   ├── map.tsx             # (to create in Step 2)
│   │   ├── mission.tsx         # (to create in Step 2)
│   │   ├── secret-room.tsx     # (to create in Step 2)
│   │   └── ending.tsx          # (to create in Step 2)
│   ├── package.json
│   └── ...
├── backend/                     # Flask
│   ├── app.py                  # Main Flask application
│   ├── requirements.txt        # Python dependencies
│   └── venv/                   # (created on first run)
├── start-all.sh               # Start both services
├── start-backend.sh           # Start Flask only
├── start-frontend.sh          # Start Expo only
├── README.md                  # This file
└── grand-task-office-project-plan.md
```

---

## ✅ Step 1 Checklist

- [x] Scaffold Expo frontend with TypeScript template
- [x] Create Flask backend with `/api/mission` endpoint
- [x] Implement Ollama connection testing
- [x] Add fallback missions for resilience
- [x] Create startup scripts
- [x] Document Python learning concepts
- [ ] Test both services running together (coming next)
- [ ] Verify Expo proxy forwarding to Flask (coming next)

---

## 🚨 Troubleshooting

### Backend won't start
- Make sure Python 3.9+ is installed: `python3 --version`
- Check that port 5000 is not in use: `lsof -i :5000`
- Ensure all dependencies installed: `pip install -r requirements.txt`

### Ollama connection fails
- Check that Ollama is running: `ollama serve` (in another terminal)
- Verify the model is installed: `ollama pull gemma3:4b`
- Test connectivity: `curl http://localhost:11434/api/tags`

### Frontend won't start
- Make sure Node.js 18+ is installed: `node --version`
- Check that port 8081 is not in use: `lsof -i :8081`
- Clear Expo cache if needed: `npx expo start --web --clear`

### CORS errors in browser
- Flask CORS is configured to allow localhost
- Make sure frontend is running on `localhost:8081` (not `127.0.0.1`)

---

## 📝 Next Steps

**Step 2: Playable Game** (coming in next phase)
- Implement title/setup, map, mission, and ending screens with Expo Router
- Add game reducer with `useReducer`
- Create sample missions
- Make a complete 5-mission game playable

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md)

---

**Created:** September 2, 2026  
**Status:** Step 1 — Foundation ✅
