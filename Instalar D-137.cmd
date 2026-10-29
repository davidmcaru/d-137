@echo off
rem Instala el mod D-137 en este PC: Claude Code lo leera de esta carpeta. Doble clic; al acabar, /reload-plugins
rem en cada sesion abierta. Lo hace Herramientas\instalar.ps1.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Herramientas\instalar.ps1"
pause
