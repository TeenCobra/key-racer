from flask import Flask, render_template, request, redirect, url_for, jsonify
import mysql.connector
import time

app = Flask(__name__)

# Connect to MySQL database
def connect_to_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="mangotree@12345",
        database="website"
    )

# Function to create users and feedback tables if they don't exist
def create_tables():
    conn = connect_to_db()
    cursor = conn.cursor()
    
    user_table_query = """
    CREATE TABLE IF NOT EXISTS users (
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        score int default 0
    )
    """
    
    feedback_table_query = """
    CREATE TABLE IF NOT EXISTS feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL
    )
    """
    
    cursor.execute(user_table_query)
    cursor.execute(feedback_table_query)
    conn.commit()
    cursor.close()
    conn.close()

# Call the function when the app starts
create_tables()

# Home route
@app.route('/')
def home():
    return render_template('home.html')

# Game start route
@app.route('/templates/game_start.html')
def start():
    return render_template('game_start.html')

# Index route
@app.route('/templates/index.html')
def index():
    return render_template('index.html')

# Game page route
@app.route('/templates/game.html')
def game():
    return render_template('game.html')

# Feedback page route
@app.route('/templates/feedback.html')
def feedback():
    return render_template('feedback.html')

# Route to handle game2 page
@app.route('/templates/game2.html')
def game2():
    return render_template('game2.html')

# Route to handle game3 page
@app.route('/templates/game3.html')
def game3():
    return render_template('game3.html')

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')

    conn = connect_to_db()
    cursor = conn.cursor()
    
    query = "INSERT INTO users (name, username, password) VALUES (%s, %s, %s)"
    values = (name, username, password)
    
    try:
        cursor.execute(query, values)
        conn.commit()
        return jsonify({"status": "success", "message": "Now let's play the game!", "redirect": url_for('game'), "username": username})
    except mysql.connector.IntegrityError:
        return jsonify({"status": "error", "message": "Username already exists, please choose a different one."})
    finally:
        cursor.close()
        conn.close()

# Route to handle sign-in via AJAX
@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = connect_to_db()
    cursor = conn.cursor()
    query = "SELECT username FROM users WHERE username = %s AND password = %s"
    cursor.execute(query, (username,password))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if user:
        return jsonify({"status": "success", "redirect": url_for('game'), "username": user[0]})
    else:
        return jsonify({"status": "error", "message": "Username not found, please sign up."})
    
@app.route('/save_score', methods=['POST'])
def save_score():
    data = request.json
    username = data.get("username")
    score = data.get("score")

    if not username or score is None:
        return jsonify({"message": "Invalid data"}), 400

    conn = connect_to_db()
    cursor = conn.cursor()

    # Update only if the new score is higher
    query = "UPDATE users SET score = GREATEST(score, %s) WHERE username = %s"
    cursor.execute(query, (score, username))
    conn.commit()
    
    cursor.close()
    conn.close()

    return jsonify({"message": "Score updated successfully!"})

@app.route('/get_score', methods=['GET'])
def get_score():
    username = request.args.get("username")

    if not username:
        return jsonify({"message": "Invalid request"}), 400

    conn = connect_to_db()
    cursor = conn.cursor()

    query = "SELECT score FROM users WHERE username = %s"
    cursor.execute(query, (username,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({"high_score": result[0] if result else 0})



# Route to handle feedback form submission
@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    name = request.form['name']
    message = request.form['message']

    conn = connect_to_db()
    cursor = conn.cursor()
    query = "INSERT INTO feedback (name, message) VALUES (%s, %s)"
    values = (name, message)

    try:
        cursor.execute(query, values)
        conn.commit()
    except Exception as e:
        return f"An error occurrexd: {str(e)}"
    finally:
        cursor.close()
        conn.close()

    time.sleep(4)
    return redirect(url_for('index'))

# API route to fetch feedback messages
@app.route('/get_feedback', methods=['GET'])
def get_feedback():
    conn = connect_to_db()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT name, message FROM feedback"  # Fetch both name and message
    cursor.execute(query)
    feedbacks = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return {"feedbacks": feedbacks}  # Return both name & message

if __name__ == "__main__":
    app.run(debug=True)
