-- create staging table

DROP TABLE IF EXISTS StagingMovies;

CREATE TABLE StagingMovies (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    year INTEGER,
    rating FLOAT,
    votes VARCHAR,
    budget FLOAT,
    gross_world_wide FLOAT,
    gross_us_canada FLOAT,
    opening_weekend_gross FLOAT,
    genres TEXT,
    production_companies TEXT,
    wins INTEGER,
    nominations INTEGER,
    oscars INTEGER
);

-- build out normalization tables
DROP TABLE IF EXISTS MovieProductionCompanies CASCADE;
DROP TABLE IF EXISTS ProductionCompanies CASCADE;
DROP TABLE IF EXISTS MovieGenres CASCADE;
DROP TABLE IF EXISTS Genres CASCADE;
DROP TABLE IF EXISTS Financials CASCADE;
DROP TABLE IF EXISTS Movies CASCADE;

-- Create Movies Table
CREATE TABLE Movies (
    id VARCHAR PRIMARY KEY,
    title VARCHAR NOT NULL,
    year INTEGER,
    rating FLOAT,
    votes INTEGER,
    genres TEXT,  -- Store as JSON array of strings
    production_companies TEXT,  -- Store as JSON array of strings
    wins INTEGER,
    nominations INTEGER,
    oscars INTEGER
);

-- Create Financials Table
CREATE TABLE Financials (
    movie_id VARCHAR PRIMARY KEY REFERENCES Movies(id),
    budget FLOAT,
    gross_world_wide FLOAT,
    gross_us_canada FLOAT,
    opening_weekend_gross FLOAT
);

-- Create Genres Table
CREATE TABLE Genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL
);

-- Create MovieGenres Table
CREATE TABLE MovieGenres (
    movie_id VARCHAR REFERENCES Movies(id),
    genre_id INTEGER REFERENCES Genres(id),
    PRIMARY KEY (movie_id, genre_id)
);

-- Create ProductionCompanies Table
CREATE TABLE ProductionCompanies (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL
);

-- Create MovieProductionCompanies Table
CREATE TABLE MovieProductionCompanies (
    movie_id VARCHAR REFERENCES Movies(id),
    company_id INTEGER REFERENCES ProductionCompanies(id),
    PRIMARY KEY (movie_id, company_id)
);

-- insert into Movies table
INSERT INTO Movies (id, title, year, rating, votes, genres, production_companies, wins, nominations, oscars)
SELECT id, title, 
       CASE WHEN year ~ '^\d+$' THEN CAST(year AS INTEGER) ELSE NULL END,  -- Convert year to INTEGER
       CASE WHEN rating ~ '^\d+(\.\d+)?$' THEN CAST(rating AS FLOAT) ELSE NULL END,  -- Convert rating to FLOAT
       CASE WHEN votes ~ '^\d+K?$' THEN CAST(REPLACE(votes, 'K', '000') AS INTEGER) ELSE NULL END,  -- Convert votes to INTEGER
       genres, production_companies,
       CASE WHEN wins ~ '^\d+$' THEN CAST(wins AS INTEGER) ELSE NULL END,  -- Convert wins to INTEGER
       CASE WHEN nominations ~ '^\d+$' THEN CAST(nominations AS INTEGER) ELSE NULL END,  -- Convert nominations to INTEGER
       CASE WHEN oscars ~ '^\d+$' THEN CAST(oscars AS INTEGER) ELSE NULL END  -- Convert oscars to INTEGER
FROM StagingMovies;

-- insert into Financials table
INSERT INTO Financials (movie_id, budget, gross_world_wide, gross_us_canada, opening_weekend_gross)
SELECT id,
       CASE WHEN budget ~ '^\d+(\.\d+)?$' THEN CAST(budget AS FLOAT) ELSE NULL END,  -- Convert budget to FLOAT
       CASE WHEN gross_world_wide ~ '^\d+(\.\d+)?$' THEN CAST(gross_world_wide AS FLOAT) ELSE NULL END,  -- Convert gross_world_wide to FLOAT
       CASE WHEN gross_us_canada ~ '^\d+(\.\d+)?$' THEN CAST(gross_us_canada AS FLOAT) ELSE NULL END,  -- Convert gross_us_canada to FLOAT
       CASE WHEN opening_weekend_gross ~ '^\d+(\.\d+)?$' THEN CAST(opening_weekend_gross AS FLOAT) ELSE NULL END  -- Convert opening_weekend_gross to FLOAT
FROM StagingMovies;

