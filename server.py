#!/usr/bin/env python3
"""
Tutor IA — servidor local con SQLite.
Uso: python server.py
Abre en tablet: http://<IP>:8080/dinamica.html
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json, os, time, threading, socket, sqlite3

DB_FILE  = os.path.join(os.path.dirname(__file__), 'tutor_ia.db')
lock     = threading.Lock()

# ══════════════════════════════════════════════════════════
# BASE DE DATOS
# ══════════════════════════════════════════════════════════
def get_db():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")   # lecturas sin bloquear escrituras
    conn.execute("PRAGMA synchronous=NORMAL")
    return conn

DB = get_db()   # conexión global (protegida con lock)

def init_db():
    with lock:
        DB.executescript("""
        CREATE TABLE IF NOT EXISTS boards (
            id   TEXT PRIMARY KEY,
            name TEXT NOT NULL DEFAULT 'Tablero'
        );
        INSERT OR IGNORE INTO boards(id, name) VALUES ('default', 'Tablero 1');

        CREATE TABLE IF NOT EXISTS strokes (
            id       TEXT PRIMARY KEY,
            board_id TEXT NOT NULL DEFAULT 'default',
            pts      TEXT NOT NULL,
            tool     TEXT DEFAULT 'pen',
            color    TEXT DEFAULT '#111',
            sz       REAL DEFAULT 3,
            ts       REAL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_strokes_board ON strokes(board_id, ts);

        CREATE TABLE IF NOT EXISTS chat_messages (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            ex_id   TEXT    DEFAULT 'default',
            role    TEXT    NOT NULL,
            content TEXT    NOT NULL,
            cls     TEXT    DEFAULT '',
            ts      REAL    DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS mastery (
            ex_id    TEXT PRIMARY KEY,
            status   TEXT    DEFAULT 'none',
            correct  INTEGER DEFAULT 0,
            attempts INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS config (
            key   TEXT PRIMARY KEY,
            value TEXT DEFAULT ''
        );

        -- ── DINÁMICA: Tablas nuevas ─────────────────────────
        CREATE TABLE IF NOT EXISTS student_progress (
            id          INTEGER PRIMARY KEY DEFAULT 1,
            rating      INTEGER DEFAULT 1200,
            streak      INTEGER DEFAULT 0,
            total_att   INTEGER DEFAULT 0,
            total_wins  INTEGER DEFAULT 0,
            last_ex_id  TEXT    DEFAULT '',
            hints_used  INTEGER DEFAULT 0,
            updated_ts  REAL    DEFAULT 0
        );
        INSERT OR IGNORE INTO student_progress(id) VALUES(1);

        CREATE TABLE IF NOT EXISTS attempts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            ex_id       TEXT    NOT NULL,
            ts          REAL    DEFAULT 0,
            hints_used  INTEGER DEFAULT 0,
            success     INTEGER DEFAULT 0,
            rating_before INTEGER DEFAULT 1200,
            rating_after  INTEGER DEFAULT 1200
        );
        CREATE INDEX IF NOT EXISTS idx_att_ex ON attempts(ex_id);

        CREATE TABLE IF NOT EXISTS bj_sections (
            chapter  INTEGER,
            section  TEXT,
            title    TEXT,
            content  TEXT,
            PRIMARY KEY(chapter, section)
        );
        """)
        DB.commit()
    try:
        DB.execute("ALTER TABLE chat_messages ADD COLUMN ex_id TEXT DEFAULT 'default'")
        DB.commit()
    except Exception:
        pass
    print(f"  [db] SQLite listo: {DB_FILE}")


# ══════════════════════════════════════════════════════════
# HANDLER HTTP
# ══════════════════════════════════════════════════════════
class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass  # silenciar logs de cada request

    # ── helpers ──────────────────────────────────────────
    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type',   'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin',  '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        n = int(self.headers.get('Content-Length', 0))
        if not n:
            return {}
        try:
            return json.loads(self.rfile.read(n).decode('utf-8'))
        except Exception:
            return {}

    def qs(self):
        """Devuelve dict de query params."""
        q = {}
        if '?' in self.path:
            for p in self.path.split('?', 1)[1].split('&'):
                k, _, v = p.partition('=')
                q[k] = v
        return q

    def base_path(self):
        return self.path.split('?')[0]

    # ── OPTIONS (CORS preflight) ─────────────────────────
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin',  '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    # ══════════════════════════════════════════════════════
    # GET
    # ══════════════════════════════════════════════════════
    def do_GET(self):
        p  = self.base_path()
        qs = self.qs()

        # ── ping ──────────────────────────────────────────
        if p == '/api/ping':
            self.send_json({'ok': True, 'ts': time.time()})

        # ── pizarra: trazos ───────────────────────────────
        elif p == '/api/strokes':
            board_id = qs.get('board', 'default')
            since    = float(qs.get('since', 0))
            with lock:
                rows = DB.execute(
                    "SELECT id,pts,tool,color,sz,ts FROM strokes WHERE board_id=? AND ts>? ORDER BY ts",
                    (board_id, since)
                ).fetchall()
            strokes = [
                {'id': r['id'], 'pts': json.loads(r['pts']),
                 'tool': r['tool'], 'color': r['color'], 'sz': r['sz'], 'ts': r['ts']}
                for r in rows
            ]
            self.send_json({'strokes': strokes, 'ts': time.time()})

        # ── tableros ──────────────────────────────────────
        elif p == '/api/boards':
            with lock:
                rows = DB.execute("SELECT id, name FROM boards").fetchall()
                result = {}
                for r in rows:
                    cnt = DB.execute("SELECT COUNT(*) FROM strokes WHERE board_id=?", (r['id'],)).fetchone()[0]
                    result[r['id']] = {'name': r['name'], 'count': cnt}
            self.send_json(result)

        # ── chat ──────────────────────────────────────────
        elif p == '/api/chat':
            limit = int(qs.get('limit', 150))
            ex_id = qs.get('ex_id', 'default')
            with lock:
                rows = DB.execute(
                    "SELECT role, content, cls, ts FROM chat_messages WHERE ex_id=? ORDER BY id DESC LIMIT ?",
                    (ex_id, limit,)
                ).fetchall()
            msgs = [{'role': r['role'], 'content': r['content'], 'cls': r['cls'], 'ts': r['ts']}
                    for r in reversed(rows)]
            self.send_json(msgs)

        # ── mastery ───────────────────────────────────────
        elif p == '/api/mastery':
            with lock:
                rows = DB.execute("SELECT ex_id, status, correct, attempts FROM mastery").fetchall()
            data = {r['ex_id']: {'status': r['status'], 'correct': r['correct'], 'attempts': r['attempts']}
                    for r in rows}
            self.send_json(data)

        # ── config ────────────────────────────────────────
        elif p == '/api/config':
            key = qs.get('key', '')
            if key:
                with lock:
                    row = DB.execute("SELECT value FROM config WHERE key=?", (key,)).fetchone()
                self.send_json({'key': key, 'value': row['value'] if row else ''})
            else:
                with lock:
                    rows = DB.execute("SELECT key, value FROM config").fetchall()
                self.send_json({r['key']: r['value'] for r in rows})

        # ── ELO: rating actual ────────────────────────────
        elif p == '/api/elo/rating':
            with lock:
                row = DB.execute("SELECT * FROM student_progress WHERE id=1").fetchone()
            self.send_json(dict(row) if row else {})

        # ── Solucionario OCR ──────────────────────────────
        elif p == '/api/solutions':
            ex_id = qs.get('id', '')
            chapter = qs.get('chapter', '')
            with lock:
                if ex_id:
                    row = DB.execute(
                        "SELECT * FROM solutions WHERE problem_id=?", (ex_id,)
                    ).fetchone()
                    self.send_json(dict(row) if row else {})
                elif chapter:
                    rows = DB.execute(
                        "SELECT problem_id, chapter, problem_num, method, final_answer FROM solutions WHERE chapter=? ORDER BY CAST(problem_num AS INTEGER)",
                        (int(chapter),)
                    ).fetchall()
                    self.send_json([dict(r) for r in rows])
                else:
                    rows = DB.execute(
                        "SELECT problem_id, chapter, problem_num, method, final_answer FROM solutions ORDER BY chapter, CAST(problem_num AS INTEGER)"
                    ).fetchall()
                    self.send_json([dict(r) for r in rows])

        # ── Ejercicios del libro ──────────────────────────
        elif p == '/api/exercises':
            chapter = qs.get('chapter', '')
            with lock:
                try:
                    if chapter:
                        rows = DB.execute(
                            "SELECT problem_id,chapter,problem_num,section,title,text,"
                            "has_figure,figure_desc,method,difficulty,page_num "
                            "FROM exercises WHERE chapter=? ORDER BY CAST(problem_num AS INTEGER)",
                            (int(chapter),)
                        ).fetchall()
                    else:
                        rows = DB.execute(
                            "SELECT problem_id,chapter,problem_num,section,title,text,"
                            "has_figure,figure_desc,method,difficulty,page_num "
                            "FROM exercises ORDER BY chapter, CAST(problem_num AS INTEGER)"
                        ).fetchall()
                    self.send_json([dict(r) for r in rows])
                except Exception:
                    self.send_json([])

        # ── ELO: historial de intentos ────────────────────
        elif p == '/api/elo/attempts':
            ex_id = qs.get('ex_id', '')
            limit = int(qs.get('limit', 50))
            with lock:
                if ex_id:
                    rows = DB.execute("SELECT * FROM attempts WHERE ex_id=? ORDER BY ts DESC LIMIT ?", (ex_id, limit)).fetchall()
                else:
                    rows = DB.execute("SELECT * FROM attempts ORDER BY ts DESC LIMIT ?", (limit,)).fetchall()
            self.send_json([dict(r) for r in rows])

        else:
            super().do_GET()

    # ══════════════════════════════════════════════════════
    # POST
    # ══════════════════════════════════════════════════════
    def do_POST(self):
        p    = self.base_path()
        data = self.read_body()

        # ── trazo único ───────────────────────────────────
        if p == '/api/stroke':
            stroke   = data.get('stroke', {})
            board_id = data.get('board', 'default')
            if stroke and stroke.get('id'):
                ts = time.time()
                with lock:
                    DB.execute(
                        "INSERT OR IGNORE INTO strokes(id,board_id,pts,tool,color,sz,ts) VALUES(?,?,?,?,?,?,?)",
                        (stroke['id'], board_id, json.dumps(stroke.get('pts', [])),
                         stroke.get('tool','pen'), stroke.get('color','#111'),
                         stroke.get('sz', 3), ts)
                    )
                    DB.commit()
            self.send_json({'ok': True})

        # ── limpiar tablero ───────────────────────────────
        elif p == '/api/clear':
            board_id = data.get('board', 'default')
            with lock:
                DB.execute("DELETE FROM strokes WHERE board_id=?", (board_id,))
                DB.commit()
            self.send_json({'ok': True})

        # ── crear tablero ─────────────────────────────────
        elif p == '/api/board/create':
            bid  = data.get('id') or f'board_{int(time.time()*1000)}'
            name = data.get('name', 'Nuevo tablero')
            with lock:
                DB.execute("INSERT OR IGNORE INTO boards(id,name) VALUES(?,?)", (bid, name))
                DB.commit()
            self.send_json({'ok': True, 'id': bid})

        # ── renombrar tablero ─────────────────────────────
        elif p == '/api/board/rename':
            with lock:
                DB.execute("UPDATE boards SET name=? WHERE id=?", (data.get('name','Tablero'), data.get('id','default')))
                DB.commit()
            self.send_json({'ok': True})

        # ── eliminar tablero ──────────────────────────────
        elif p == '/api/board/delete':
            bid = data.get('id','')
            if bid and bid != 'default':
                with lock:
                    DB.execute("DELETE FROM strokes WHERE board_id=?", (bid,))
                    DB.execute("DELETE FROM boards WHERE id=?", (bid,))
                    DB.commit()
            self.send_json({'ok': True})

        # ── guardar mensaje de chat ───────────────────────
        elif p == '/api/chat':
            role    = data.get('role','')
            content = data.get('content','')
            cls     = data.get('cls','')
            ts      = data.get('ts', time.time())
            ex_id   = data.get('ex_id', 'default')
            if role and content:
                with lock:
                    DB.execute(
                        "INSERT INTO chat_messages(ex_id,role,content,cls,ts) VALUES(?,?,?,?,?)",
                        (ex_id, role, content, cls, ts)
                    )
                    # Mantener máx 300 mensajes por ejercicio
                    DB.execute("""
                        DELETE FROM chat_messages WHERE id NOT IN (
                            SELECT id FROM chat_messages WHERE ex_id=? ORDER BY id DESC LIMIT 300
                        ) AND ex_id=?
                    """, (ex_id, ex_id))
                    DB.commit()
            self.send_json({'ok': True})

        # ── limpiar chat ──────────────────────────────────
        elif p == '/api/chat/clear':
            with lock:
                DB.execute("DELETE FROM chat_messages")
                DB.commit()
            self.send_json({'ok': True})

        # ── guardar mastery (bulk) ────────────────────────
        elif p == '/api/mastery':
            # data = { "E1": {status, correct, attempts}, ... }
            with lock:
                for ex_id, m in data.items():
                    DB.execute("""
                        INSERT INTO mastery(ex_id,status,correct,attempts) VALUES(?,?,?,?)
                        ON CONFLICT(ex_id) DO UPDATE SET
                            status=excluded.status,
                            correct=excluded.correct,
                            attempts=excluded.attempts
                    """, (ex_id, m.get('status','none'), m.get('correct',0), m.get('attempts',0)))
                DB.commit()
            self.send_json({'ok': True})

        # ── guardar config (key/value) ────────────────────
        elif p == '/api/config':
            key   = data.get('key','')
            value = data.get('value','')
            if key:
                with lock:
                    DB.execute(
                        "INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                        (key, value)
                    )
                    DB.commit()
            self.send_json({'ok': True})

        # ── ELO: guardar resultado de intento ─────────────
        elif p == '/api/elo/result':
            # data = {ex_id, success, hints_used, rating_before, rating_after, streak, total_att, total_wins}
            ex_id  = data.get('ex_id', '')
            if ex_id:
                with lock:
                    DB.execute(
                        "INSERT INTO attempts(ex_id,ts,hints_used,success,rating_before,rating_after) VALUES(?,?,?,?,?,?)",
                        (ex_id, time.time(),
                         data.get('hints_used', 0),
                         1 if data.get('success') else 0,
                         data.get('rating_before', 1200),
                         data.get('rating_after',  1200))
                    )
                    DB.execute("""
                        UPDATE student_progress SET
                            rating=?, streak=?, total_att=?, total_wins=?,
                            last_ex_id=?, hints_used=0, updated_ts=?
                        WHERE id=1
                    """, (
                        data.get('rating_after', 1200),
                        data.get('streak', 0),
                        data.get('total_att', 0),
                        data.get('total_wins', 0),
                        ex_id,
                        time.time()
                    ))
                    DB.commit()
            self.send_json({'ok': True})

        # ── ELO: guardar progress completo (sync) ─────────
        elif p == '/api/elo/sync':
            with lock:
                DB.execute("""
                    UPDATE student_progress SET
                        rating=?, streak=?, total_att=?, total_wins=?,
                        last_ex_id=?, updated_ts=?
                    WHERE id=1
                """, (
                    data.get('rating', 1200),
                    data.get('streak', 0),
                    data.get('total_att', 0),
                    data.get('total_wins', 0),
                    data.get('last_ex_id', ''),
                    time.time()
                ))
                DB.commit()
            self.send_json({'ok': True})

        else:
            self.send_response(404)
            self.end_headers()

    # ══════════════════════════════════════════════════════
    # DELETE
    # ══════════════════════════════════════════════════════
    def do_DELETE(self):
        p = self.base_path()
        if p == '/api/chat':
            with lock:
                DB.execute("DELETE FROM chat_messages")
                DB.commit()
            self.send_json({'ok': True})
        else:
            self.send_response(404)
            self.end_headers()


# ══════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

if __name__ == '__main__':
    init_db()
    ip     = get_local_ip()
    server = HTTPServer(('0.0.0.0', 8080), Handler)
    print('=' * 60)
    print('  Tutor DINAMICA - Beer & Johnston - SQLite')
    print('=' * 60)
    print(f'  PC/Mac  :  http://localhost:8080/dinamica.html')
    print(f'  Tablet  :  http://{ip}:8080/dinamica.html')
    print(f'  DB      :  {DB_FILE}')
    print('  Ctrl+C para detener')
    print('=' * 60)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        DB.close()
        print('\n  Servidor detenido.')
