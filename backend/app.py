"""
Grand Task Office — Flask Backend

A minimal Flask service with one gameplay endpoint: POST /api/mission

This backend:
1. Receives game context from the Expo frontend
2. Sends it to Ollama running locally at http://localhost:11434/api/chat
3. Validates the response and returns structured mission JSON
4. Falls back to hardcoded missions if Ollama is unavailable

Python Learning Moment #1: HTTP requests and JSON handling
- We'll use the `requests` library to make HTTP calls to Ollama
- JSON parsing validates that responses are well-formed
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import sys
from typing import Optional, Dict, Any

# Initialize Flask app
app = Flask(__name__)

# Configure CORS for local Expo development
# Allow requests from Expo web dev server (typically localhost:8081)
CORS(app, resources={r"/api/*": {"origins": "localhost"}})

# ============================================================================
# Python Learning Moment #1: Constants and Configuration
# ============================================================================
# These are configuration values we reference throughout the app
OLLAMA_API_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "gemma3:4b"
OLLAMA_TIMEOUT = 5  # seconds

# Valid item identifiers (enum-like set)
VALID_ITEMS = {
    "cinnamon_bun",
    "coffee",
    "laptop",
    "keycard",
    "stapler",
    "secret_document",
}

# ============================================================================
# Python Learning Moment #2: Fallback Missions
# ============================================================================
# These hardcoded missions ensure the game is always playable,
# even if Ollama is stopped, slow, or returns invalid JSON.
# They're structured exactly like Ollama responses.

FALLBACK_MISSIONS = [
    {
        "title": "The Coffee Emergency",
        "situation": "Someone spilled coffee on the printer and now nothing's printing.",
        "choices": [
            {
                "text": "Frantically call IT support",
                "outcome": "IT arrives in 10 minutes. Crisis averted, but you look flustered.",
                "moneyChange": -1,
                "reputationChange": 0,
                "alertChange": 1,
                "requiredItem": None,
                "rewardItem": None,
            },
            {
                "text": "Fix it yourself with paper towels",
                "outcome": "You expertly dry the printer. Everyone's impressed.",
                "moneyChange": 1,
                "reputationChange": 2,
                "alertChange": 0,
                "requiredItem": None,
                "rewardItem": None,
            },
            {
                "text": "Blame the intern",
                "outcome": "The intern gets blamed. You escape notice, but it feels wrong.",
                "moneyChange": 0,
                "reputationChange": -2,
                "alertChange": 1,
                "requiredItem": None,
                "rewardItem": None,
            },
        ],
    },
    {
        "title": "Lunch Thief Alert",
        "situation": "Someone keeps stealing lunches from the office fridge.",
        "choices": [
            {
                "text": "Set a trap with a decoy sandwich",
                "outcome": "You catch the culprit red-handed. Office mystery solved!",
                "moneyChange": 2,
                "reputationChange": 1,
                "alertChange": 0,
                "requiredItem": None,
                "rewardItem": None,
            },
            {
                "text": "Leave an angry note",
                "outcome": "The lunches stop disappearing, but tensions are high.",
                "moneyChange": 0,
                "reputationChange": -1,
                "alertChange": 1,
                "requiredItem": None,
                "rewardItem": None,
            },
            {
                "text": "Ignore it and eat at your desk",
                "outcome": "Not your problem. You enjoy your sandwich in peace.",
                "moneyChange": 0,
                "reputationChange": 0,
                "alertChange": 0,
                "requiredItem": None,
                "rewardItem": None,
            },
        ],
    },
    {
        "title": "Mysterious Meeting Room Key",
        "situation": "A brass key appears on your desk with no explanation.",
        "choices": [
            {
                "text": "Turn it in to lost and found",
                "outcome": "Good deed done. The office runs smoother.",
                "moneyChange": 0,
                "reputationChange": 1,
                "alertChange": 0,
                "requiredItem": None,
                "rewardItem": None,
            },
            {
                "text": "Investigate where it leads",
                "outcome": "You unlock a hidden supply closet full of rare office supplies.",
                "moneyChange": 2,
                "reputationChange": 1,
                "alertChange": 0,
                "requiredItem": None,
                "rewardItem": "keycard",
            },
            {
                "text": "Sell it online",
                "outcome": "You make a quick buck, but someone's angry.",
                "moneyChange": 1,
                "reputationChange": -1,
                "alertChange": 1,
                "requiredItem": None,
                "rewardItem": None,
            },
        ],
    },
]


# ============================================================================
# Python Learning Moment #3: Helper Function for Ollama Connection
# ============================================================================
def test_ollama_connection() -> bool:
    """
    Test if Ollama is running and the model is available.
    
    This function makes a GET request to Ollama's /api/tags endpoint,
    which lists all available models.
    
    Returns:
        bool: True if Ollama is reachable and gemma3:4b is available, False otherwise.
    
    Python concept: try/except for error handling
    """
    try:
        response = requests.get(
            "http://localhost:11434/api/tags",
            timeout=2,  # Quick timeout for connection test
        )
        if response.status_code == 200:
            data = response.json()
            # Check if gemma3:4b is in the models list
            models = [m["name"] for m in data.get("models", [])]
            return OLLAMA_MODEL in models
    except (requests.ConnectionError, requests.Timeout, json.JSONDecodeError):
        pass
    return False


# ============================================================================
# Python Learning Moment #4: Response Validation
# ============================================================================
def validate_mission_response(data: Dict[str, Any]) -> tuple[bool, str]:
    """
    Validate that a mission response has the correct structure and values.
    
    A valid mission must have:
    - title: non-empty string, ≤80 chars
    - situation: non-empty string, ≤300 chars
    - choices: exactly 3 choices
    - Each choice must have required fields with valid values
    
    Args:
        data: The JSON data to validate (from Ollama)
    
    Returns:
        tuple: (is_valid, error_message)
    
    Python concepts:
    - Type hints (Dict, Any, tuple)
    - String validation and length checks
    - Enum membership (checking item IDs)
    - List length validation
    """
    # Check required top-level fields
    if not isinstance(data, dict):
        return False, "Response is not a dictionary"

    if "title" not in data or not isinstance(data["title"], str):
        return False, "Missing or invalid 'title'"
    if len(data["title"]) == 0 or len(data["title"]) > 80:
        return False, "Title must be 1-80 characters"

    if "situation" not in data or not isinstance(data["situation"], str):
        return False, "Missing or invalid 'situation'"
    if len(data["situation"]) == 0 or len(data["situation"]) > 300:
        return False, "Situation must be 1-300 characters"

    if "choices" not in data or not isinstance(data["choices"], list):
        return False, "Missing or invalid 'choices' (must be array)"
    if len(data["choices"]) != 3:
        return False, f"Expected exactly 3 choices, got {len(data['choices'])}"

    # Validate each choice
    for i, choice in enumerate(data["choices"]):
        if not isinstance(choice, dict):
            return False, f"Choice {i} is not a dictionary"

        # Required string fields
        for field in ["text", "outcome"]:
            if field not in choice or not isinstance(choice[field], str):
                return False, f"Choice {i}: missing or invalid '{field}'"
            if len(choice[field]) == 0:
                return False, f"Choice {i}: '{field}' cannot be empty"
            if field == "text" and len(choice[field]) > 100:
                return False, f"Choice {i}: text must be ≤100 chars"
            if field == "outcome" and len(choice[field]) > 200:
                return False, f"Choice {i}: outcome must be ≤200 chars"

        # Required numeric fields (clamp to -2...+2)
        for field in ["moneyChange", "reputationChange", "alertChange"]:
            if field not in choice or not isinstance(choice[field], (int, float)):
                return False, f"Choice {i}: missing or invalid '{field}' (must be number)"
            # Clamp the value
            value = int(choice[field])
            if value < -2 or value > 2:
                choice[field] = max(-2, min(2, value))

        # Optional item fields
        for field in ["requiredItem", "rewardItem"]:
            if field not in choice:
                choice[field] = None
            elif choice[field] is not None:
                if not isinstance(choice[field], str):
                    return False, f"Choice {i}: '{field}' must be string or null"
                if choice[field] not in VALID_ITEMS:
                    # Ignore unknown items safely
                    choice[field] = None

        # Validate: a choice cannot both require and reward an item
        if choice.get("requiredItem") and choice.get("rewardItem"):
            return False, f"Choice {i}: cannot both require and reward an item"

    return True, ""


# ============================================================================
# API ENDPOINT: POST /api/mission
# ============================================================================
@app.route("/api/mission", methods=["POST"])
def get_mission():
    """
    Main gameplay endpoint.
    
    Receives: Game context (location, round, stats, inventory, players)
    Returns: Mission with title, situation, and 3 choices
    
    If Ollama is available, generates a new mission.
    If Ollama is unavailable, returns a hardcoded fallback mission.
    
    Python Learning Moment #5: Request/Response Handling
    - request.json: Parse incoming JSON
    - jsonify: Convert Python dict to Flask JSON response
    - HTTP status codes (200, 400, 500)
    """
    try:
        # Parse incoming game context
        game_context = request.json

        if not game_context:
            return (
                jsonify({"error": "No JSON body provided"}),
                400,
            )

        # Check if Ollama is running
        if not test_ollama_connection():
            # Fallback: return a random hardcoded mission
            import random

            fallback = random.choice(FALLBACK_MISSIONS)
            return jsonify({
                "mission": fallback,
                "source": "fallback (Ollama unavailable)",
            })

        # ====================================================================
        # Python Learning Moment #6: Building the Prompt for Ollama
        # ====================================================================
        # We send the game context to Ollama and ask it to generate a mission.
        # The prompt structure is:
        #   - System message: role and constraints
        #   - User message: game context and instructions

        system_prompt = """You are a mission generator for a funny office game called 'Grand Task Office'.
Generate a short, humorous mission that fits the office setting.

IMPORTANT CONSTRAINTS:
1. Do NOT mention real company names, GTA logos, or confidential information
2. Return ONLY valid JSON, no other text
3. The mission must have exactly 3 choices
4. Each choice outcome should be funny and brief
5. Return JSON structure with: title, situation, choices (array of 3)
"""

        # Build user prompt with game context
        players_str = ", ".join(game_context.get("players", []))
        inventory_str = ", ".join(game_context.get("inventory", []))

        user_prompt = f"""Game State:
- Round: {game_context.get('round', 1)}
- Location: {game_context.get('location', 'Office')}
- Players: {players_str}
- Money: {game_context.get('money', 0)}
- Reputation: {game_context.get('reputation', 0)}
- Alert Level: {game_context.get('alertLevel', 0)}/5
- Inventory: {inventory_str if inventory_str else 'empty'}

Generate a funny mission for this round. Return ONLY JSON, no markdown or extra text.
JSON format:
{{
  "title": "Mission name",
  "situation": "What's happening?",
  "choices": [
    {{"text": "Option 1", "outcome": "Result 1", "moneyChange": 0, "reputationChange": 1, "alertChange": 0, "requiredItem": null, "rewardItem": null}},
    {{"text": "Option 2", "outcome": "Result 2", "moneyChange": 1, "reputationChange": 0, "alertChange": 0, "requiredItem": null, "rewardItem": null}},
    {{"text": "Option 3", "outcome": "Result 3", "moneyChange": 0, "reputationChange": -1, "alertChange": 1, "requiredItem": null, "rewardItem": "coffee"}}
  ]
}}
"""

        # Make request to Ollama
        ollama_request = {
            "model": OLLAMA_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "stream": False,
        }

        response = requests.post(
            OLLAMA_API_URL,
            json=ollama_request,
            timeout=OLLAMA_TIMEOUT,
        )

        if response.status_code != 200:
            raise Exception(f"Ollama returned status {response.status_code}")

        # Parse Ollama response
        ollama_data = response.json()
        mission_text = ollama_data.get("message", {}).get("content", "")

        # Extract JSON from response (Ollama might include extra text)
        # Try to parse the content as JSON
        mission_json = None
        try:
            # Try direct parse first
            mission_json = json.loads(mission_text)
        except json.JSONDecodeError:
            # Try extracting JSON from markdown code blocks or extra text
            import re
            json_match = re.search(r"\{.*\}", mission_text, re.DOTALL)
            if json_match:
                try:
                    mission_json = json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass

        if not mission_json:
            raise Exception("Could not parse mission JSON from Ollama response")

        # Validate the mission
        is_valid, error_msg = validate_mission_response(mission_json)
        if not is_valid:
            print(f"Validation failed: {error_msg}", file=sys.stderr)
            raise Exception(f"Mission validation failed: {error_msg}")

        return jsonify({
            "mission": mission_json,
            "source": "ollama",
        })

    except requests.Timeout:
        print("Ollama request timed out", file=sys.stderr)
        import random
        fallback = random.choice(FALLBACK_MISSIONS)
        return jsonify({
            "mission": fallback,
            "source": "fallback (timeout)",
        })
    except Exception as e:
        print(f"Error in /api/mission: {str(e)}", file=sys.stderr)
        import random
        fallback = random.choice(FALLBACK_MISSIONS)
        return jsonify({
            "mission": fallback,
            "source": f"fallback (error: {str(e)})",
        })


# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================
@app.route("/health", methods=["GET"])
def health():
    """
    Simple health check endpoint.
    
    Returns:
        JSON with status and Ollama connection status
    """
    ollama_available = test_ollama_connection()
    return jsonify({
        "status": "ok",
        "ollama_available": ollama_available,
        "ollama_url": OLLAMA_API_URL,
        "ollama_model": OLLAMA_MODEL,
    })


# ============================================================================
# OLLAMA TEST ENDPOINT
# ============================================================================
@app.route("/test-ollama", methods=["GET"])
def test_ollama():
    """
    Test endpoint to check Ollama connection and model availability.
    
    Useful for debugging during development.
    
    Returns:
        JSON with connection status and available models
    """
    try:
        response = requests.get(
            "http://localhost:11434/api/tags",
            timeout=2,
        )
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                "status": "connected",
                "models": [m["name"] for m in data.get("models", [])],
                "gemma3_4b_available": OLLAMA_MODEL in [m["name"] for m in data.get("models", [])],
            })
        else:
            return (
                jsonify({
                    "status": "error",
                    "message": f"Ollama returned status {response.status_code}",
                }),
                500,
            )
    except Exception as e:
        return (
            jsonify({
                "status": "error",
                "message": str(e),
            }),
            500,
        )


# ============================================================================
# Main Entry Point
# ============================================================================
if __name__ == "__main__":
    print("=" * 70)
    print("Grand Task Office — Flask Backend")
    print("=" * 70)
    print(f"Ollama URL: {OLLAMA_API_URL}")
    print(f"Model: {OLLAMA_MODEL}")
    print(f"Timeout: {OLLAMA_TIMEOUT}s")
    print()
    
    # Test Ollama connection on startup
    if test_ollama_connection():
        print("✅ Ollama is connected and gemma3:4b is available")
    else:
        print("⚠️  Ollama is not reachable. Missions will use fallbacks.")
    
    print()
    print("Starting Flask server on http://localhost:5000")
    print("=" * 70)
    print()
    
    # Run Flask app
    # debug=True enables auto-reload and better error messages
    # host='0.0.0.0' allows connections from other machines (needed for Expo)
    app.run(debug=True, host="0.0.0.0", port=5000)
