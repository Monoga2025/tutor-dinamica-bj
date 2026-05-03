import fitz
import sys

PDF_PATH = r"C:\Users\danie\Downloads\Dinamica Libro completo.pdf"
try:
    doc = fitz.open(PDF_PATH)
    page = doc[297] # 0-indexed page 297 is physical page 298. Let's assume the user meant 0-indexed or 1-indexed. Let's print the text.
    print(page.get_text())
except Exception as e:
    print(e)
