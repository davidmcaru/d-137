@echo off
rem Vuelve a pintar en Mod D-137\Dibujos todos los dibujos del mod, desde su codigo (dibujos.cjs). Hace falta Node.js
where node >nul 2>nul || (echo Hace falta Node.js para rehacer los dibujos: https://nodejs.org & pause & exit /b 1)
node "%~dp0dibujos.cjs"
pause
