import sqlite3
conn = sqlite3.connect('tutor_ia.db')
cur = conn.cursor()
cur.execute("PRAGMA table_info(solutions)")
print("solutions schema:", cur.fetchall())
cur.execute("PRAGMA table_info(bj_sections)")
print("bj_sections schema:", cur.fetchall())
