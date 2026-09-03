#!/bin/bash
# Start the Flask backend

echo "========================================="
echo "Starting Grand Task Office — Flask Backend"
echo "========================================="
echo ""
echo "Backend will run on: http://localhost:5001"
echo "Press Ctrl+C to stop"
echo ""

cd "$(dirname "$0")/backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the Flask app
python app.py
