import sqlite3
conn = sqlite3.connect('tutor_ia.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables:", cur.fetchall())

try:
    cur.execute("SELECT COUNT(*) FROM bj_sections WHERE chapter='14'")
    print("bj_sections chapter 14 count:", cur.fetchone()[0])
except Exception as e:
    print(e)
    
try:
    cur.execute("SELECT COUNT(*) FROM solutions WHERE exercise_id LIKE '14.%'")
    print("solutions chapter 14 count:", cur.fetchone()[0])
except Exception as e:
    print(e)
