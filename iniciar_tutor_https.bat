@echo off
title Tutor IA - HTTPS Tablet
cd /d "C:\Users\danie\OneDrive\Desktop\AI_LAB\02 - LLM Apps\Parciales 5"

echo.
echo  =========================================
echo   TUTOR IA - HTTPS PARA MICROFONO TABLET
echo  =========================================
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%
echo  PC     : https://localhost:8443/dinamica.html
echo  Tablet : https://%IP%:8443/dinamica.html
echo.
echo  Si la tablet avisa certificado no seguro, entra en Avanzado y continuar.
echo.

start https://localhost:8443/dinamica.html
python server.py --https

pause
