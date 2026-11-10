@echo off
cd /d "%~dp0"
title FoodControl - Servidor local

echo.
echo   Iniciando FoodControl en http://localhost:8000 ...
echo   El servidor se ejecuta en esta ventana.
echo   Presiona Ctrl+C para detenerlo.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor.ps1" -Port 8000
pause
