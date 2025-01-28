# Repository: IMDB-movie-analysis

## Usage: How we got here and how to do the same

---

#### Processing the Data:

We took [this public dataset]([https://www.kaggle.com/datasets/raedaddala/top-500-600-movies-of-each-year-from-1960-to-2024](https://www.kaggle.com/datasets/raedaddala/top-500-600-movies-of-each-year-from-1960-to-2024)) from Kaggle and downloaded the csv provided. We named this file "unprocessed_data.csv" in our "Data" folder. Then, inside of the jupyter notebook named "processing_data.ipynb", we inspected, cleaned, and re-ordered the data for our goals. We then exported that data into a new csv file named, "processed_data.csv".

Building the Dashboard:
After we had our dataset cleaned for our purposes, we needed to store it in a .sqlite file for easy retrieval of JSON data using [Flask]([https://pypi.org/project/Flask/)&#39;s](https://pypi.org/project/Flask/)'s) API endpoints. We accomplish both of these in the app.py file in the 'static/py' folder. This file converts the processed csv into a SQLite database file. Then, with the Flask API endpoint, we return JSON data for easy parsing in our "app.js" file.

##### front end:

Our "index.html' and "styles.css" is where all of the front-end creation of HTML elements and their styling are stored.

##### back end:

Inside our "app.js" file is where we created functions to run our filtering of the data with user interaction and building the charts in our dashboard. The order of our functions follow this structure: fetching the data, dynamically adding filter elements, and adding event listeners for those elements; grabbing the filtered values; using those values to filter the entire dataset; building the treemap, chart2, chart3, and chart4; creating a function that updates the dashboard; and, finally, initializing the dashboard.


---

## References

* Dataset
  Raed Addala. (2025). 30,000+ Movies, 60+ Years of Data, Rich Metadata [Data set]. Kaggle. https://doi.org/10.34740/KAGGLE/DSV/10379655
* Dataset License: [MIT](https://www.mit.edu/~amini/LICENSE.md)

---

## Citations

We used [these docs]([https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals)) to understand the spread syntax for automatically populating the genres selection boxWe used the [new operator]([https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)) along with the [Set() constructor]([https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/Set)) to help iterate through the genres and remove repeating genres for our genre selection boxWe used the [classList property]([https://developer.mozilla.org/en-US/docs/Web/API/Element/classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)) to help add HTML elements to our index.html dynamically in JavaScript.We used the [appendChild() method]([https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild)) to append dynamically produced HTML elements to proper parent elementsWe used the [noUiSlider]([https://refreshless.com/nouislider/](https://refreshless.com/nouislider/)), which was a new JS library we discovered that produced the slider for our year range selector

Slideshow:
Altman, R. (Director). (1992). *The Player* [Film]. Avenue Pictures Productions.
Tarantino, Q. (Director). (2019). *Once Upon a Time in Hollywood* [Film]. Columbia Pictures, Heyday Films, Bona Film Group, Visiona Romantica.
Guest, C. (Director). (1989). *The Big Picture* [Film]. Columbia Pictures.
Jonze, S. (Director). (2002). *Adaptation* [Film]. Beverly Detroit, Clinica Estetico, Good Machine, and Intermedia Films.
Sonnenfeld, B. (Director). (1995). *Get Shorty* [Film]. Metro-Goldwyn-Mayer.
Guest, C. (Director). (2006). *For Your Consideration* [Film]. Castle Rock Entertainment, Shangri-La Entertainment, and HBO Films.
Goddard, J., Houseman, J. (Producers), & Minnelli, V. (Director). (1952). *The Bad and the Beautiful* [Film]. Metro-Goldwyn-Mayer.
Chazelle, D. (Director). (2016). *La La Land* [Film]. Summit Entertainment, Marc Platt Productions, and Black Label Media.
