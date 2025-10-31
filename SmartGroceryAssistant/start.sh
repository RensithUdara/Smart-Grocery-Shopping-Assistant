#!/bin/bash
# Smart Grocery Assistant - Full Stack Startup Script

echo "🚀 Smart Grocery Shopping Assistant - Full Stack Setup"
echo "======================================================"

# Check if we're on Windows (using Git Bash or similar)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    echo "🪟 Detected Windows environment"
    PYTHON_CMD="python"
    NPM_CMD="npm"
else
    echo "🐧 Detected Unix-like environment"
    PYTHON_CMD="python3"
    NPM_CMD="npm"
fi

echo ""
echo "1️⃣ Setting up Backend..."
echo "-------------------------"

# Navigate to backend directory
cd backend

# Install Python dependencies
echo "📦 Installing Python dependencies..."
$PYTHON_CMD -m pip install -r requirements.txt

# Start backend in background
echo "🔥 Starting Flask backend server..."
$PYTHON_CMD run.py &
BACKEND_PID=$!

# Give backend time to start
sleep 3

cd ..

echo ""
echo "2️⃣ Setting up Frontend..."
echo "-------------------------"

# Navigate to frontend directory
cd frontend

# Install Node dependencies
echo "📦 Installing Node.js dependencies..."
$NPM_CMD install

# Start frontend
echo "🌐 Starting React development server..."
$NPM_CMD start &
FRONTEND_PID=$!

cd ..

echo ""
echo "✅ Setup Complete!"
echo "=================="
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:5000"
echo ""
echo "📝 To stop both servers:"
echo "   - Press Ctrl+C in this terminal"
echo "   - Or kill processes manually:"
echo "     kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎉 Happy shopping with your Smart Grocery Assistant!"

# Wait for user interruption
wait