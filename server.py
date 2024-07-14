from flask import Flask, jsonify, request
import sqlite3
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app) 

# Fetch a random word from database 
def _fetch_random_word():
    conn = sqlite3.connect('words.db')
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) FROM words')
    word_count = cursor.fetchone()[0]

    random_index = random.randint(0, word_count - 1)

    cursor.execute('SELECT word FROM words LIMIT 1 OFFSET ?', (random_index,))
    random_word = cursor.fetchone()[0]

    conn.close()
    return random_word


# Server GET query that returns two random consecutive letters from a random word
@app.route('/random-letters', methods=['GET']) 
def random_letters():
    word = _fetch_random_word()
    random_char_index = random.randint(0, len(word)-2)
    letters = word[random_char_index:random_char_index+2]
    return jsonify(letters=letters, word=word)


# POST query checks if word exists 
@app.route('/check-word', methods=['POST'])
def check_word():
    data = request.json
    word = data.get('word').lower()
    
    conn = sqlite3.connect('words.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM words WHERE word = ?', (word,))
    exists = cursor.fetchone()[0] > 0
    
    conn.close()
    return jsonify(exists=exists)



if __name__ == '__main__':
    app.run(debug=True)