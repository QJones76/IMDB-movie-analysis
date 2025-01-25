import sqlite3
import pandas as pd
import os
from flask import Flask, jsonify
from flask_cors import CORS  # Import CORS for handling cross-origin requests

# File paths
csv_file = "../Data/processed_data.csv"  # Path to your CSV file
sqlite_file = "../output/imdb_movies.sqlite"  # Path to the SQLite file to be created

# Ensure the CSV file exists
if not os.path.exists(csv_file):
    raise FileNotFoundError(f"CSV file '{csv_file}' not found.")

# Create the output directory if it doesn’t exist
os.makedirs(os.path.dirname(sqlite_file), exist_ok=True)

# Table name
table_name = "movies"

def load_csv_to_sqlite():
    """Reads CSV data and writes it to an SQLite database."""
    try:
        df = pd.read_csv(csv_file)
        conn = sqlite3.connect(sqlite_file)
        df.to_sql(table_name, conn, if_exists='replace', index=False)
        print(f"Data successfully written to SQLite database in the table '{table_name}'.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if 'conn' in locals():
            conn.close()
            print("SQLite connection closed.")

# Load data into the database when the script is run
load_csv_to_sqlite()

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_movie_data():
    """Fetches movie data from the SQLite database."""
    conn = sqlite3.connect(sqlite_file)
    cursor = conn.cursor()
    query = """
    SELECT id, title, year, nominations, production_companies, 
           votes, rating, budget, gross_world_wide, gross_us_canada, genres 
    FROM movies
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    columns = ['id', 'title', 'year', 'nominations', 'production_companies', 
               'votes', 'rating', 'budget', 'gross_world_wide', 'gross_us_canada', 'genres']
    return [dict(zip(columns, row)) for row in rows]

@app.route('/get-movies', methods=['GET'])
def get_movies():
    """API endpoint to get movie data."""
    movie_data = get_movie_data()
    return jsonify(movie_data)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
