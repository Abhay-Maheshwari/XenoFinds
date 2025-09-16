@echo off
echo 🚀 Starting Shopify Data Ingestion App...

REM Copy environment file
echo 📋 Setting up environment...
copy config.env .env

REM Start backend in new window
echo 🔧 Starting Backend Server...
start "Backend Server" cmd /k "npm run dev"

REM Wait a bit for backend to start
timeout /t 5 /nobreak

REM Start frontend in new window  
echo 🎨 Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo ✅ Both servers are starting...
echo 🌐 Backend will be available at: http://localhost:3000
echo 🎨 Frontend will be available at: http://localhost:3001
echo 📊 Dashboard will be at: http://localhost:3001/dashboard

pause
