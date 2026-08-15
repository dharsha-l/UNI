# UNI-INSPECTION Startup Script
# AI-Assisted Evidence-Traceable Institutional Inspection Platform

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  UNI-INSPECTION                                          ║" -ForegroundColor Cyan
Write-Host "║  AI-Assisted Evidence-Traceable Institutional Inspection ║" -ForegroundColor Cyan
Write-Host "║  Evidence-driven. AI-assisted. Human-verified.           ║" -ForegroundColor Gray
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting backend API server on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Starting frontend dev server on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 4

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  UNI-INSPECTION is running!                              ║" -ForegroundColor Green
Write-Host "║                                                          ║" -ForegroundColor Green
Write-Host "║  Frontend:  http://localhost:5173                        ║" -ForegroundColor White
Write-Host "║  Backend:   http://localhost:3001                        ║" -ForegroundColor White
Write-Host "║  Health:    http://localhost:3001/api/health             ║" -ForegroundColor White
Write-Host "║                                                          ║" -ForegroundColor Green
Write-Host "║  Demo Credentials:                                       ║" -ForegroundColor White
Write-Host "║  Email:     inspector@uninspection.demo                  ║" -ForegroundColor White
Write-Host "║  Password:  password123                                  ║" -ForegroundColor White
Write-Host "║                                                          ║" -ForegroundColor Green
Write-Host "║  Demo Institution: ABC Engineering College               ║" -ForegroundColor White
Write-Host "║  AISHE Code:       CSE-UNI-001                          ║" -ForegroundColor White
Write-Host "║  Inspection ID:    INS-2026-001                          ║" -ForegroundColor White
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Open browser after a short delay
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"