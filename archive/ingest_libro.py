#!/usr/bin/env python3
"""
Extrae TODOS los ejercicios del cap 14 del libro Beer & Johnston.
Páginas 297-341 del PDF.
Guarda en tabla `exercises` en tutor_ia.db.

Uso:
  python ingest_libro.py              # procesa todo (resume por defecto)
  python ingest_libro.py --test 5     # solo 5 páginas
  python ingest_libro.py --no-resume  # reprocesa desde cero
"""
import fitz, sqlite3, requests, json, base64, time, os, argparse

PDF_PATH = r"C:\Users\danie\Downloads\Dinamica Libro completo.pdf"
DB_PATH  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tutor_ia.db")
API_KEY  = os.environ.get('OPENROUTER_API_KEY', '')
MODEL    = "google/gemini-2.5-flash"
API_URL  = "https://openrouter.ai/api/v1/chat/completions"

PDF_START = 296   # índice 0-based (página visual 297)
PDF_END   = 340   # índice 0-based (página visual 341)

PROMPT = """Eres un experto en extracción de ejercicios de libros de ingeniería.
Analiza esta página del libro Beer & Johnston — Dinámica 9ª edición, Capítulo 14 (Sistemas de Partículas).

Extrae TODOS los problemas numerados que inicien en esta página. Responde SOLO en JSON:
{
  "exercises": [
    {
      "problem_id": "14.47",
      "chapter": 14,
      "problem_num": "47",
      "section": "14.5",
      "title": "título corto 3-6 palabras",
      "text": "enunciado completo del problema",
      "has_figure": true,
      "figure_description": "describe la figura: qué muestra, dimensiones visibles, ángulos, etc.",
      "method": "impulso-momento",
      "difficulty": 1200
    }
  ]
}

Reglas:
- method: "trabajo-energia" | "f-ma" | "impulso-momento" | "potencia" | "otro"
- difficulty: 1000 (fácil) a 1700 (difícil)
- Si la página solo tiene teoría/ejemplos resueltos/índice: {"exercises": [], "skip_reason": "razón"}
- NO incluir Sample Problems, solo problemas numerados (14.1, 14.2, ...)
- Si hay figura, describir en detalle para que la IA pueda resolver sin ver la imagen
- Responde SOLO el JSON, sin markdown"""


def init_db(conn):
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS exercises (
            problem_id   TEXT PRIMARY KEY,
            chapter      INTEGER,
            problem_num  TEXT,
            section      TEXT DEFAULT '',
            title        TEXT DEFAULT '',
            text         TEXT DEFAULT '',
            has_figure   INTEGER DEFAULT 0,
            figure_desc  TEXT DEFAULT '',
            method       TEXT DEFAULT 'otro',
            difficulty   INTEGER DEFAULT 1200,
            page_num     INTEGER DEFAULT 0,
            processed_ts REAL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS libro_progress (
            pdf_index INTEGER PRIMARY KEY,
            status    TEXT DEFAULT 'pending',
            problems  TEXT DEFAULT '',
            error_msg TEXT DEFAULT ''
        );
    """)
    conn.commit()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--resume",    action="store_true", default=True)
    parser.add_argument("--no-resume", dest="resume", action="store_false")
    parser.add_argument("--test",  type=int, default=0)
    parser.add_argument("--start", type=int, default=PDF_START)
    args = parser.parse_args()

    conn = sqlite3.connect(DB_PATH)
    init_db(conn)

    # Inicializar progreso
    for idx in range(PDF_START, PDF_END + 1):
        conn.execute("INSERT OR IGNORE INTO libro_progress(pdf_index) VALUES(?)", (idx,))
    conn.commit()

    print(f"📚 {PDF_PATH}")
    print(f"📄 Páginas {args.start+1}–{PDF_END+1}  ({PDF_END-args.start+1} páginas)")

    doc = fitz.open(PDF_PATH)
    ok = skip = err = done = 0

    for idx in range(args.start, PDF_END + 1):
        if args.test and done >= args.test:
            break

        if args.resume:
            row = conn.execute("SELECT status FROM libro_progress WHERE pdf_index=?", (idx,)).fetchone()
            if row and row[0] in ("ok", "skip"):
                continue

        pag = idx + 1
        try:
            # Renderizar página
            page = doc[idx]
            pix  = page.get_pixmap(matrix=fitz.Matrix(180/72, 180/72), colorspace=fitz.csRGB)
            b64  = base64.b64encode(pix.tobytes("jpeg")).decode()

            # Llamar Gemini
            r = requests.post(API_URL, timeout=90, json={
                "model": MODEL,
                "messages": [{"role":"user","content":[
                    {"type":"image_url","image_url":{"url":f"data:image/jpeg;base64,{b64}"}},
                    {"type":"text","text":PROMPT}
                ]}],
                "max_tokens": 3000
            }, headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8080"
            })
            r.raise_for_status()
            raw = r.json()["choices"][0]["message"]["content"].strip()

            # Parsear JSON
            if raw.startswith("```"):
                raw = "\n".join(l for l in raw.split("\n") if not l.strip().startswith("```")).strip()
            data = json.loads(raw)

            exs = data.get("exercises", [])
            if not exs:
                conn.execute("INSERT OR REPLACE INTO libro_progress VALUES(?,?,?,?)",
                             (idx,"skip","",data.get("skip_reason","")))
                conn.commit()
                skip += 1; done += 1
                print(f"[{pag}] ⏭  {data.get('skip_reason','')}")
            else:
                ids = []
                for ex in exs:
                    pid = str(ex.get("problem_id","")).strip()
                    if not pid: continue
                    conn.execute("""
                        INSERT OR REPLACE INTO exercises
                            (problem_id,chapter,problem_num,section,title,text,
                             has_figure,figure_desc,method,difficulty,page_num,processed_ts)
                        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
                    """, (pid, ex.get("chapter",14), str(ex.get("problem_num","")),
                          ex.get("section",""), ex.get("title",""), ex.get("text",""),
                          1 if ex.get("has_figure") else 0,
                          ex.get("figure_description",""),
                          ex.get("method","otro"), ex.get("difficulty",1200),
                          pag, time.time()))
                    ids.append(pid)
                conn.commit()
                conn.execute("INSERT OR REPLACE INTO libro_progress VALUES(?,?,?,?)",
                             (idx,"ok",",".join(ids),""))
                conn.commit()
                ok += 1; done += 1
                print(f"[{pag}] ✅ {ids}")

        except json.JSONDecodeError as e:
            conn.execute("INSERT OR REPLACE INTO libro_progress VALUES(?,?,?,?)",
                         (idx,"error","",f"JSON:{e}"))
            conn.commit()
            err += 1; done += 1
            print(f"[{pag}] ❌ JSON — {e}")
        except Exception as e:
            conn.execute("INSERT OR REPLACE INTO libro_progress VALUES(?,?,?,?)",
                         (idx,"error","",str(e)))
            conn.commit()
            err += 1; done += 1
            print(f"[{pag}] ❌ {e}")
            time.sleep(3 if "HTTP" in str(e) else 1)
            continue

        time.sleep(2)

    doc.close(); conn.close()
    print(f"\n=== FIN ===  ✅{ok}  ⏭{skip}  ❌{err}")


if __name__ == "__main__":
    main()
