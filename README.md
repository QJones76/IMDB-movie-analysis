# IMDB-movie-analysis Dashboard

![Image](https://github.com/user-attachments/assets/dc298f9d-2ee8-4922-8a1a-c050dc8ea1f2)
![Image](https://github.com/user-attachments/assets/767fdd5b-5ee1-4388-8499-37fb349c9735)

## The Main Idea

---
The purpose of this dashboard is to provide users with a data-driven exploration of popular movies across different genres and time periods. It achieves this through various statistical visualizations, including a Top 50 Movies Treemap, which ranks films based on their worldwide gross earnings, and a correlation heatmap that highlights potential relationships between key variables such as budget, revenue, ratings, and nominations.

Additionally, the dashboard offers insights into the major production companies shaping the industry by analyzing their financial impact. It also features a mix of dynamic and static statistics, allowing users to observe how different factors influence movie success. By integrating interactive filters, users can refine their analysis and uncover trends in genre popularity, financial performance, and industry influence over time.

---
## Usage: How we got here and how to do the same

---
#### Processing the Data:
We took [this public dataset](https://www.kaggle.com/datasets/raedaddala/top-500-600-movies-of-each-year-from-1960-to-2024) from Kaggle and downloaded the .csv provided. We named this file "unprocessed_data.csv" in our "Data" folder. Then, inside of the jupyter notebook named "processing_data.ipynb". We inspected, cleaned, and re-ordered the data for our goals. We then exported that data into a new .csv file named, "processed_data.csv". 

#### Storing the Data:
After we had a cleaned dataset, we imported the data into a sqlite database file named, "movies_analysis.sqlite." Then we created a [flask](https://pypi.org/project/Flask/) app that runs on a local server to access the database and return specific API endpoints. This was all done inside the app.py file. You will need to follow these steps if your cloning the repository for your own exploration. First, open a command-line interface. Follow the instructions to set up a [Conda environment](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html) and activate your new environment. Then install all the python libraries we used in the project by typing: 
```
pip install -r /path/to/requirements.txt
```
After your environment is set up, you can run the flask API file. Navigate to the app.py file while still in the command-line interface. If you are one windows, launch the file by typing:
```
python.exe app.py
```
Or, if you are on a mac os system, type:
```
python3 app.py
```
This will launch the flask app on the local server port 5001. After the file is running, you can open the index.html file and play around with the year-range slider and the genre selection box yourself to see what movies, facts, and companies are relevent to your favorite genres and time frames. 


#### Building the Dashboard:
With our data retrieval system set up, we then had to build both the front and back end code for our dashboard. 
- front end development:
  Our "index.html' and "styles.css" is where all of the front-end creation of HTML elements and their styling are stored.
- back end development:
  Inside our "app.js" file is where we created functions to run our filtering of the data with user interaction and building the charts in our dashboard. The order of our      functions follow this structure: fetching the data, dynamically adding filter elements, and adding event listeners for those elements; grabbing the filtered values; using    those values to filter the entire dataset; building the tree map chart, the Fun Facts section, the bubble chart, and a static correlation coefficient heatmap; creating a     function that updates the dashboard; and, finally, initializing the dashboard.

For more information about how to interpret correlation heatmaps, please refer to this document: [Guide to Interpreting Heatmaps](https://github.com/QJones76/IMDB-movie-analysis/issues/8#issue-2817119843)
Or you can visit the bottom of the "processing_data.csv" file to see how we reached these calculations.

---
## References and Ethicality

---
Ethical responsibility is a key factor when handling data, particularly in projects that involve public datasets. While this project is conducted as part of an educational program, we acknowledge the importance of ensuring responsible data usage, transparency, and adherence to data-sharing guidelines. Given that the dataset is publicly accessible and licensed under the MIT License, we have the flexibility to collect, analyze, and share insights while respecting the terms set by the original data provider.

To maintain ethical standards, we have ensured that our data processing and visualization methods remain aligned with best practices in data integrity, avoiding misrepresentation or misleading interpretations. Additionally, we encourage users who wish to explore the dataset further to review the license and adhere to the same ethical guidelines.

Below, we provide both the dataset and its associated license for reference:
- Dataset: Raed Addala. (2025). 30,000+ Movies, 60+ Years of Data, Rich Metadata [Data set]. Kaggle. https://doi.org/10.34740/KAGGLE/DSV/10379655
- Dataset License: MIT License

For further reading on ethical data practices, consider the following references:
-	Zook, M., Barocas, S., Boyd, D., Crawford, K., Keller, E., Gangadharan, S. P., & Pasquale, F. (2017). Ten simple rules for responsible big data research. PLOS Computational Biology, 13(3), e1005399. https://doi.org/10.1371/journal.pcbi.1005399
-	National Academies of Sciences, Engineering, and Medicine. (2018). Data Science and Ethical Responsibilities. Washington, DC: The National Academies Press. https://doi.org/10.17226/25135
-	Floridi, L., & Taddeo, M. (2016). What is data ethics? Philosophical Transactions of the Royal Society A, 374(2083), 20160360. https://doi.org/10.1098/rsta.2016.0360

By maintaining ethical considerations in data collection, analysis, and visualization, we ensure that this project upholds the principles of responsible data science while fostering transparency and educational exploration.

---
## Citations

---
- We used [these docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals) to understand the spread syntax which helped in automatically populating the genres selection box from the dataset itself
- We used the [new operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new) along with the [Set() constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/Set) to help iterate through the genres and remove repeating genres for our genre selection box
- We used the [classList property](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) to help add HTML elements to our index.html dynamically in JavaScript.
- We used the [appendChild() method](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild) to append dynamically produced HTML elements to proper parent elements
- We used the [noUiSlider](https://refreshless.com/nouislider/), which was a new JS library we discovered that produced the slider for our year range selector
- We used the [try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) statement to parse the movie production companies.
- We used the [replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace) method to replace characters in array for parsing. Both the [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions) and the [assertions guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Assertions) were helpful in this endeavor.
- we used the [reduce]() method to help calculate the fun facts section. This combined with the [conditional (ternary) operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator) and arrow functions were helpful in keeping the code concise.
- We used the d3-textwrap function, which can be found [here](https://www.npmjs.com/package/d3-textwrap?activeTab=readme) or you can visit their [GitHub](https://github.com/vijithassar/d3-textwrap) repository that holds the code, in association with [chatGPT](https://chatgpt.com/) to add text wrap functionality to the treemap.
- Finally, consulting [chatGPT](https://chatgpt.com/) was extremely helpful in styling our noUiSlider and checkbox elements.

Slideshow:
- Altman, R. (Director). (1992). *The Player* [Film]. Avenue Pictures Productions.
- Tarantino, Q. (Director). (2019). *Once Upon a Time in Hollywood* [Film]. Columbia Pictures, Heyday Films, Bona Film Group, Visiona Romantica.
- Guest, C. (Director). (1989). *The Big Picture* [Film]. Columbia Pictures.
- Jonze, S. (Director). (2002). *Adaptation* [Film]. Beverly Detroit, Clinica Estetico, Good Machine, and Intermedia Films.
- Sonnenfeld, B. (Director). (1995). *Get Shorty* [Film]. Metro-Goldwyn-Mayer.
- Guest, C. (Director). (2006). *For Your Consideration* [Film]. Castle Rock Entertainment, Shangri-La Entertainment, and HBO Films.
- Goddard, J., Houseman, J. (Producers), & Minnelli, V. (Director). (1952). *The Bad and the Beautiful* [Film]. Metro-Goldwyn-Mayer.
- Chazelle, D. (Director). (2016). *La La Land* [Film]. Summit Entertainment, Marc Platt Productions, and Black Label Media.
