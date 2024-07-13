import sqlite3

conn = sqlite3.connect('words.db')
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL
)
''')

with open('words_alpha.txt', 'r') as file:
    words = [(line.strip(),) for line in file if line.strip()]
cursor.executemany('INSERT INTO words (word) VALUES (?)', words)

conn.commit()
conn.close()