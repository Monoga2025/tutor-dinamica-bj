@echo off
title Tutor IA - Parciales
cd /d "C:\Users\danie\OneDrive\Desktop\AI_LAB\02 - LLM Apps\Parciales 5"

echo.
echo  =========================================
echo   TUTOR IA - INICIANDO SERVIDOR
echo   Tablet: http://192.168.1.12:8080/dinamica.html
echo  =========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%
echo  Tu IP actual: http://%IP%:8080/dinamica.html
echo.

start http://localhost:8080/dinamica.html
python server.py

pause
