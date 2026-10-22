# BenchFlow - 1-Click Startup Script
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   Starting BenchFlow Fullstack Platform   " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Start Docker Containers (Postgres, Keycloak, pgAdmin, Adminer)
Write-Host "`n[1/3] Starting Docker Services..." -ForegroundColor Yellow
docker compose up -d

# 2. Start Backend FastAPI
Write-Host "`n[2/3] Launching FastAPI Backend (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 3. Start Frontend Next.js
Write-Host "`n[3/3] Launching Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " All services started successfully!" -ForegroundColor Green
Write-Host " - Frontend   : http://localhost:3000" -ForegroundColor White
Write-Host " - FastAPI API: http://localhost:8000/docs" -ForegroundColor White
Write-Host " - pgAdmin    : http://localhost:5050" -ForegroundColor White
Write-Host " - Keycloak   : http://localhost:8080" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Green
