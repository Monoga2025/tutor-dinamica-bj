import sqlite3
conn = sqlite3.connect('tutor_ia.db')
cur = conn.cursor()

try:
    cur.execute("SELECT problem_num FROM solutions WHERE chapter=14 ORDER BY CAST(problem_num AS INTEGER) ASC")
    problems = [row[0] for row in cur.fetchall()]
    print("Chapter 14 solutions present:", problems)
    print("Total count:", len(problems))
except Exception as e:
    print(e)
