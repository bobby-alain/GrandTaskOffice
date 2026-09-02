#!/bin/bash
# Start both backend and frontend in parallel

PROJECT_DIR="$(dirname "$0")"

echo "========================================="
echo "Grand Task Office — Starting All Services"
echo "========================================="
echo ""
echo "This will start:"
echo "  1. Flask Backend on http://localhost:5000"
echo "  2. Expo Frontend on http://localhost:8081"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Make scripts executable
chmod +x "$PROJECT_DIR/start-backend.sh"
chmod +x "$PROJECT_DIR/start-frontend.sh"

# Start backend in background
echo "Starting backend..."
"$PROJECT_DIR/start-backend.sh" &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo ""
echo "Starting frontend..."
"$PROJECT_DIR/start-frontend.sh" &
FRONTEND_PID=$!

# Handle Ctrl+C to kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
