@echo off
title Ingesta Ejercicios Cap 14 - Beer Johnston
cd /d "C:\Users\danie\OneDrive\Desktop\AI_LAB\02 - LLM Apps\Parciales 5"

echo.
echo  ==========================================
echo   INGESTA EJERCICIOS - CAP 14 - B^&J
echo   45 paginas (297-341 del PDF libro)
echo   ~2 seg por pagina = ~90 segundos total
echo  ==========================================
echo.
echo  Ctrl+C para cancelar (retoma donde quedo)
echo.

python ingest_libro.py

echo.
echo  Listo. Recarga dinamica.html para ver los ejercicios.
pause
