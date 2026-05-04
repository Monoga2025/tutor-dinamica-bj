import fitz
import sqlite3
import requests
import json
import base64
import time
import os
import sys
import argparse

PDF_PATH = r"C:\Users\danie\Downloads\solucionario-mecanica-vectorial-para-ingenieros-dinamica-beer-9-edicion_compress.pdf"
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tutor_ia.db")
API_KEY = os.environ.get('OPENROUTER_API_KEY', '')
MODEL = "google/gemini-2.5-flash"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

PDF_START = 787
PDF_END = 948

PROMPT = """Eres un experto en extracción de soluciones de libros de mecánica.

Analiza esta página del Solucionario de Beer & Johnston Dinámica 9ª edición.

Extrae EXACTAMENTE en JSON (sin texto adicional):
{
  "problem_id": "14.47",       // número completo: capítulo.número
  "chapter": 14,
  "problem_num": "47",
  "problem_text": "...",       // enunciado completo en español si está, si no en inglés
  "method": "trabajo-energia", // uno de: trabajo-energia, f-ma, impulso-momento, potencia, otro
  "steps": ["paso 1...", "paso 2...", "..."],  // pasos de la solución
  "final_answer": "v = 3.2 m/s",  // respuesta final concisa
  "page_num": 787              // número de página visible en la imagen
}

Si la página NO contiene un ejercicio (es portada, índice, o continuación sin número nuevo), responde:
{"skip": true, "reason": "..."}

Si hay MÚLTIPLES problemas en la página, extrae solo el principal (el que tiene el header PROBLEM X.XX)."""


def init_db(conn):
    conn.execute("""
        CREATE TABLE IF NOT EXISTS solutions (
            problem_id TEXT PRIMARY KEY,
            chapter INTEGER,
            problem_num TEXT,
            problem_text TEXT,
            method TEXT,
            steps TEXT,
            final_answer TEXT,
            page_num INTEGER,
            processed_ts REAL DEFAULT 0,
            raw_response TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS ocr_progress (
            pdf_index INTEGER PRIMARY KEY,
            status TEXT DEFAULT 'pending',
            problem_id TEXT DEFAULT '',
            error_msg TEXT DEFAULT ''
        )
    """)
    conn.commit()


def init_progress(conn, start, end):
    for idx in range(start, end + 1):
        conn.execute(
            "INSERT OR IGNORE INTO ocr_progress (pdf_index, status) VALUES (?, 'pending')",
            (idx,)
        )
    conn.commit()


def get_status(conn, pdf_index):
    row = conn.execute(
        "SELECT status FROM ocr_progress WHERE pdf_index = ?", (pdf_index,)
    ).fetchone()
    return row[0] if row else None


def mark_progress(conn, pdf_index, status, problem_id="", error_msg=""):
    conn.execute(
        "INSERT OR REPLACE INTO ocr_progress (pdf_index, status, problem_id, error_msg) VALUES (?, ?, ?, ?)",
        (pdf_index, status, problem_id, error_msg)
    )
    conn.commit()


def render_page(doc, pdf_index, dpi=150):
    page = doc[pdf_index]
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat, colorspace=fitz.csRGB)
    return pix.tobytes("jpeg")


def call_gemini(b64_image):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8080",
        "X-Title": "Tutor Dinamica Ingest"
    }
    payload = {
        "model": MODEL,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_image}"}},
                {"type": "text", "text": PROMPT}
            ]
        }],
        "max_tokens": 2500
    }
    resp = requests.post(API_URL, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"]


def parse_response(raw):
    text = raw.strip()
    # strip markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        # remove first and last fence lines
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines).strip()
    return json.loads(text)


def insert_solution(conn, data, pdf_index, raw_response):
    steps_json = json.dumps(data.get("steps", []), ensure_ascii=False)
    conn.execute(
        """
        INSERT OR REPLACE INTO solutions
            (problem_id, chapter, problem_num, problem_text, method, steps, final_answer, page_num, processed_ts, raw_response)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            data.get("problem_id", ""),
            data.get("chapter"),
            data.get("problem_num", ""),
            data.get("problem_text", ""),
            data.get("method", "otro"),
            steps_json,
            data.get("final_answer", ""),
            data.get("page_num"),
            time.time(),
            raw_response
        )
    )
    conn.commit()


def main():
    parser = argparse.ArgumentParser(description="Ingest solucionario PDF into SQLite via Gemini Flash")
    parser.add_argument("--resume", action="store_true", default=True, help="Skip already processed pages (default: True)")
    parser.add_argument("--no-resume", dest="resume", action="store_false", help="Reprocess all pages")
    parser.add_argument("--test", type=int, default=0, metavar="N", help="Only process N pages (for testing)")
    parser.add_argument("--start", type=int, default=PDF_START, metavar="IDX", help=f"Start from PDF index (default: {PDF_START})")
    args = parser.parse_args()

    start_idx = args.start
    end_idx = PDF_END

    conn = sqlite3.connect(DB_PATH)
    init_db(conn)
    init_progress(conn, PDF_START, PDF_END)

    print(f"DB: {DB_PATH}")
    print(f"PDF: {PDF_PATH}")
    print(f"Range: {start_idx} — {end_idx} ({end_idx - start_idx + 1} pages)")
    if args.test:
        print(f"TEST MODE: only {args.test} pages")

    doc = fitz.open(PDF_PATH)

    total_ok = 0
    total_skip = 0
    total_error = 0
    processed = 0

    for pdf_index in range(start_idx, end_idx + 1):
        if args.test and processed >= args.test:
            break

        if args.resume:
            status = get_status(conn, pdf_index)
            if status == "ok" or status == "skip":
                continue

        try:
            jpeg_bytes = render_page(doc, pdf_index)
            b64 = base64.b64encode(jpeg_bytes).decode("utf-8")
            raw = call_gemini(b64)

            try:
                data = parse_response(raw)
            except (json.JSONDecodeError, ValueError) as e:
                mark_progress(conn, pdf_index, "error", error_msg=f"JSON parse error: {e}")
                total_error += 1
                processed += 1
                print(f"[{pdf_index}/{end_idx}] ERROR json — {e}")
                time.sleep(2)
                continue

            if data.get("skip"):
                mark_progress(conn, pdf_index, "skip", error_msg=data.get("reason", ""))
                total_skip += 1
                processed += 1
                if processed % 10 == 0:
                    print(f"[{pdf_index}/{end_idx}] skip — {data.get('reason', '')}")
                time.sleep(2)
                continue

            problem_id = data.get("problem_id", "")
            insert_solution(conn, data, pdf_index, raw)
            mark_progress(conn, pdf_index, "ok", problem_id=problem_id)
            total_ok += 1
            processed += 1

            if processed % 10 == 0:
                print(f"[{pdf_index}/{end_idx}] prob {problem_id} — ok")

            time.sleep(2)

        except requests.RequestException as e:
            mark_progress(conn, pdf_index, "error", error_msg=f"HTTP error: {e}")
            total_error += 1
            processed += 1
            print(f"[{pdf_index}/{end_idx}] ERROR http — {e}")
            time.sleep(5)
            continue

        except Exception as e:
            mark_progress(conn, pdf_index, "error", error_msg=str(e))
            total_error += 1
            processed += 1
            print(f"[{pdf_index}/{end_idx}] ERROR — {e}")
            time.sleep(2)
            continue

    doc.close()
    conn.close()

    print("\n=== SUMMARY ===")
    print(f"OK:      {total_ok}")
    print(f"Skipped: {total_skip}")
    print(f"Errors:  {total_error}")
    print(f"Total processed this run: {processed}")


if __name__ == "__main__":
    main()
