@echo off
REM Smart Grocery Assistant - Windows Startup Script

echo 🚀 Smart Grocery Shopping Assistant - Full Stack Setup
echo ======================================================

echo.
echo 1️⃣ Setting up Backend...
echo -------------------------

REM Navigate to backend directory
cd backend

REM Install Python dependencies
echo 📦 Installing Python dependencies...
python -m pip install -r requirements.txt

REM Start backend server
echo 🔥 Starting Flask backend server...
start "Backend Server" cmd /k python run.py

REM Give backend time to start
timeout /t 3 /nobreak > nul

cd ..

echo.
echo 2️⃣ Setting up Frontend...
echo -------------------------

REM Navigate to frontend directory
cd frontend

REM Install Node dependencies
echo 📦 Installing Node.js dependencies...
call npm install

REM Start frontend
echo 🌐 Starting React development server...
start "Frontend Server" cmd /k npm start

cd ..

echo.
echo ✅ Setup Complete!
echo ==================
echo 🔗 Frontend: http://localhost:3000
echo 🔗 Backend API: http://localhost:5000
echo.
echo 📝 Both servers are running in separate windows
echo 🎉 Happy shopping with your Smart Grocery Assistant!

pause