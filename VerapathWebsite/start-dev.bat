@echo off
echo Starting local dev server...
start cmd /k "npx http-server . -p 5500 --cors -c-1"
timeout /t 2 /nobreak >nul
start http://localhost:5500/index.html
