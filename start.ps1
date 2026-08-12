# InspectAI Startup Script
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  InspectAI — AI-Driven Inspection" -ForegroundColor Cyan
Write-Host "  Evidence-driven. AI-assisted. Human-verified." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting backend server on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "Starting frontend server on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  InspectAI is running!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "  Demo Login:" -ForegroundColor White
Write-Host "  Email:    inspector@demo.com" -ForegroundColor White
Write-Host "  Password: inspector123" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"
