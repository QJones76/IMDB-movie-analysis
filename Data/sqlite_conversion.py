# import dependencies
import pandas as pd
import sqlite3

# Read the CSV files into DataFrames
heatmap_df = pd.read_csv('heatmap.csv')
processed_data_df = pd.read_csv('processed_data.csv')

# Connect to SQLite database (this will create the database file if it doesn't exist)
conn = sqlite3.connect('movies_analysis.sqlite')

# Export the DataFrames to SQLite tables
heatmap_df.to_sql('heatmap_data', conn, if_exists='replace', index=False)
processed_data_df.to_sql('movie_data', conn, if_exists='replace', index=False)

# Close the connection
conn.close()

print("CSV files have been exported to SQLite database.")
