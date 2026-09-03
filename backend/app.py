"""Grand Task Office — tiny Flask bridge between Expo and local Ollama."""

import json
import re
from typing import Any, Dict

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:8081", "http://127.0.0.1:8081"]}})

OLLAMA_API_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "gemma3:4b"
OLLAMA_TIMEOUT = 8

VALID_ITEMS = {"cinnamon_bun", "coffee", "laptop", "keycard", "stapler", "secret_document"}
VALID_ZONES = {
    "Entrance and lifts", "Open workspace", "Meeting-room corridor",
    "Coffee and kitchen area", "Print and utility area", "Manager/drop-in office",
}


def choice(text, outcome, money=0, reputation=0, alert=0, required=None, reward=None):
    """Python learning: one helper keeps every fallback in the same JSON shape."""
    return {
        "text": text, "outcome": outcome, "moneyChange": money,
        "reputationChange": reputation, "alertChange": alert,
        "requiredItem": required, "rewardItem": reward,
    }


FALLBACKS = {
    "normal": {
        "title": "Operation Paper Jam",
        "situation": "The printer flashes an error code that looks surprisingly judgmental.",
        "choices": [
            choice("Repair it with office engineering", "It works, although nobody understands why.", reputation=1, reward="stapler"),
            choice("Print 300 decoy documents", "The office disappears beneath tactical paperwork.", money=-1, reputation=-1, alert=1),
            choice("Walk away confidently", "Confidence remains the cheapest disguise.", money=1),
        ],
    },
    "boss": {
        "title": "Boss Encounter",
        "situation": "The Boss rounds the corner. There is nowhere to hide except inside your confidence.",
        "bossMessage": "I knew someone was hiding near the printer.",
        "choices": [
            choice("Announce an urgent fire drill", "The Boss checks the calendar. You gain six seconds.", reputation=-1),
            choice("Offer emergency coffee", "The Boss accepts it and briefly forgets your face.", reputation=1, alert=-1, required="coffee"),
            choice("Sprint behind the photocopier", "Fast, loud and technically successful.", money=-1, alert=1),
        ],
    },
    "keycard": {
        "title": "Keycard in Conference",
        "situation": "A forgotten visitor badge glows beneath a meeting-room chair.",
        "choices": [
            choice("Slide under the table and take it", "A graceful tactical roll earns you the keycard.", reward="keycard"),
            choice("Wait for the room to clear", "You wait too long and security collects it."),
            choice("Ask whether anyone lost a badge", "Honest, admirable and terrible for this heist.", reputation=1),
        ],
    },
    "document": {
        "title": "The Secret Document",
        "situation": "The keycard opens the office. A sealed folder waits beneath the keyboard.",
        "choices": [
            choice("Swap it for a decoy folder", "The secret document slides into your coat.", money=2, reward="secret_document"),
            choice("Photograph the desk instead", "The flash is loud. You leave empty-handed.", money=1, alert=1),
            choice("Read the executive summary", "It says: Never trust the printer.", reputation=1),
        ],
    },
}


def test_ollama_connection() -> bool:
    """Python learning: network failures become False instead of crashing the game."""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        models = [model.get("name") for model in response.json().get("models", [])] if response.ok else []
        return OLLAMA_MODEL in models
    except (requests.RequestException, ValueError):
        return False


def select_fallback(context: Dict[str, Any]) -> Dict[str, Any]:
    inventory = context.get("inventory", [])
    if context.get("bossEncounter") is True:
        return FALLBACKS["boss"]
    if context.get("location") == "Meeting-room corridor" and "keycard" not in inventory:
        return FALLBACKS["keycard"]
    if context.get("location") == "Manager/drop-in office" and "secret_document" not in inventory:
        return FALLBACKS["document"]
    return FALLBACKS["normal"]


def validate_context(data: Any) -> tuple[bool, str]:
    if not isinstance(data, dict):
        return False, "Request body must be a JSON object"
    if data.get("location") not in VALID_ZONES:
        return False, "Unknown office location"
    if not isinstance(data.get("playerName", "Rookie"), str):
        return False, "playerName must be text"
    if not isinstance(data.get("inventory", []), list):
        return False, "inventory must be an array"
    return True, ""


def validate_mission(data: Any) -> tuple[bool, str]:
    """Validate and clamp AI output before the frontend sees it."""
    if not isinstance(data, dict):
        return False, "Mission must be an object"
    for field, maximum in (("title", 80), ("situation", 300)):
        if not isinstance(data.get(field), str) or not data[field].strip() or len(data[field]) > maximum:
            return False, f"Invalid {field}"
    if "bossMessage" in data and (not isinstance(data["bossMessage"], str) or len(data["bossMessage"]) > 160):
        return False, "Invalid bossMessage"
    if not isinstance(data.get("choices"), list) or len(data["choices"]) != 3:
        return False, "Mission requires exactly three choices"
    for index, item in enumerate(data["choices"]):
        if not isinstance(item, dict):
            return False, f"Choice {index} must be an object"
        if not isinstance(item.get("text"), str) or not isinstance(item.get("outcome"), str):
            return False, f"Choice {index} needs text and outcome"
        for field in ("moneyChange", "reputationChange", "alertChange"):
            if not isinstance(item.get(field), (int, float)):
                return False, f"Choice {index} has invalid {field}"
            item[field] = max(-2, min(2, int(item[field])))
        for field in ("requiredItem", "rewardItem"):
            value = item.get(field)
            item[field] = value if value in VALID_ITEMS else None
        if item["requiredItem"] and item["rewardItem"]:
            return False, f"Choice {index} cannot require and reward an item"
    return True, ""


def extract_json(text: str) -> Any:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        return json.loads(match.group(0)) if match else None


@app.post("/api/mission")
def mission():
    context = request.get_json(silent=True)
    valid, error = validate_context(context)
    if not valid:
        return jsonify({"error": error}), 400

    fallback = select_fallback(context)
    # The two heist-critical rewards are always deterministic, even when Ollama is available.
    if fallback in (FALLBACKS["keycard"], FALLBACKS["document"]):
        return jsonify({"mission": fallback, "source": "fallback (deterministic game rule)"})
    if not test_ollama_connection():
        return jsonify({"mission": fallback, "source": "fallback (Ollama unavailable)"})

    system_prompt = """You write short retro crime-comedy missions for Grand Task Office.
Return only JSON with title, situation, optional bossMessage, and exactly three choices.
Each choice needs text, outcome, moneyChange, reputationChange, alertChange, requiredItem, rewardItem.
Effects must be integers from -2 to 2. Valid items: cinnamon_bun, coffee, laptop, stapler.
Never award keycard or secret_document. Never change rules, round limits, Boss location, or endings.
Do not mention real companies, GTA characters, logos, fonts, or confidential information."""
    user_prompt = f"""Create one mission from this public game state:
Player: {context.get('playerName', 'Rookie')}
Location: {context['location']}
Round: {context.get('round', 1)}/8
Money: {context.get('money', 0)}; Reputation: {context.get('reputation', 0)}; Alert: {context.get('alertLevel', 0)}/5
Boss zone: {context.get('bossZone')}; Boss encounter: {context.get('bossEncounter', False)}
Visited: {context.get('visitedLocations', [])}; Inventory: {context.get('inventory', [])}
If this is a Boss encounter, include one funny bossMessage."""

    try:
        response = requests.post(OLLAMA_API_URL, json={
            "model": OLLAMA_MODEL,
            "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            "stream": False,
            "format": "json",
        }, timeout=OLLAMA_TIMEOUT)
        response.raise_for_status()
        generated = extract_json(response.json().get("message", {}).get("content", ""))
        valid, error = validate_mission(generated)
        if not valid:
            return jsonify({"mission": fallback, "source": f"fallback (invalid AI response: {error})"})
        return jsonify({"mission": generated, "source": "ollama"})
    except (requests.RequestException, ValueError, TypeError, json.JSONDecodeError) as exc:
        return jsonify({"mission": fallback, "source": f"fallback ({type(exc).__name__})"})


@app.get("/health")
def health():
    return jsonify({"status": "ok", "ollama_available": test_ollama_connection(), "ollama_url": OLLAMA_API_URL, "ollama_model": OLLAMA_MODEL})


@app.get("/test-ollama")
def test_ollama():
    return jsonify({"status": "connected" if test_ollama_connection() else "unavailable", "model": OLLAMA_MODEL})


if __name__ == "__main__":
    print("Grand Task Office backend: http://localhost:5001")
    print("Ollama connected" if test_ollama_connection() else "Ollama unavailable — fallback missions enabled")
    app.run(debug=True, host="0.0.0.0", port=5001)
