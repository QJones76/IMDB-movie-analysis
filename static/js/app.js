/*
This function is for loading movie data from the csv files and dynamically generating genre checkboxes
*/
function loadMovieData() {
    d3.csv('Data/processed_data.csv').then(data => {
        // This assigns the columns to variabls
        movieData = data.map(d => ({
            id: d.id,
            title: d.title,
            year: +d.year,
            nominations: +d.nominations,
            production_companies: d.production_companies,
            votes: +d.votes,
            rating: +d.rating,
            budget: +d.budget,
            gross_ww: +d.gross_world_wide,
            gross_us_canada: +d.gross_us_canada,
            genres: JSON.parse(d.genres.replace(/'/g, '"'))
        }));

        // Extract unique genres, add them to a new set so repeats don't populate, and sort them alphabetically
        // IMPORTANT: Look into sorting them by their value_counts()
        let uniqueGenres = [...new Set(movieData.flatMap(movie => movie.genres))].sort();
        // Look at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals
        // for more on the spread syntax (i.e. the '...')


        // grab the element
        const genreCheckboxContainer = document.getElementById("genre-checkboxes");
        // Clear existing checked boxes
        genreCheckboxContainer.innerHTML = "";

        // Create a checkbox for each genre by looping through unique genres and adding HTML elements needed
        // for checkboxes 
        uniqueGenres.forEach(genre => {
            // Create div element for a checkbox
            let checkboxWrapper = document.createElement("div");
            // Add a class to div element for css styling
            checkboxWrapper.classList.add("checkbox-wrapper");

            // Create checkbox input element with id, value, and class for css styling
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = genre;
            checkbox.value = genre;
            checkbox.classList.add("genre-checkbox");

            // Create cooresponding label for each unique genre
            let label = document.createElement("label");
            label.setAttribute("for", genre);
            // Add text content for current genre
            label.textContent = genre;

            // Append all created HTML elements to correct parent elements
            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            genreCheckboxContainer.appendChild(checkboxWrapper);
        });

        // Create an event listener to update the dashboard upon checkbox changes
        const checkboxes = document.querySelectorAll(".genre-checkbox");
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", updateDashboard);
        });

        // Create an event listener to update the dashboard upon slider changes
        slider.noUiSlider.on("update", function() {
            updateDashboard();
        });

        updateDashboard(); // Initialize dashboard after loading data

        // Safely assign gloabal variable after data is loaded
        window.filteredData = filterMovies();
    });
}

// Get selected genres from checkboxes
function getFilterValues() {
    // Get the year values from the noUiSlider
    // The .map(Number) converts the values in the array to numbers
    let yearRange = slider.noUiSlider.get().map(Number);
    // Get the selected checkboxes
    let selectedGenres = Array.from(document.querySelectorAll(".genre-checkbox:checked")).map(checkbox => checkbox.value);
    // Return needed values for data populating
    return { yearMin: yearRange[0], yearMax: yearRange[1], genres: selectedGenres };
}

// Filter movies based on selected genres and year range
function filterMovies() {
    const { yearMin, yearMax, genres } = getFilterValues();

    let filtered = movieData.filter(movie =>
        movie.year >= yearMin && movie.year <= yearMax &&
        (genres.length === 0 || genres.some(genre => movie.genres.includes(genre)))
        // Handle case where no genre is selected 
    );
    // Return new filterd data
    return filtered;
}

// Build charts
function buildCharts(filteredData) {
    // Sort data by gross_ww in descending order for the top 50 movies
    const topMovies = filteredData.sort((a,b) => b.gross_ww - a.gross_ww).slice(0, 50)
    // Start by giving treemap a hierarchy
    // The hierarchy wraps the dataset in children property to establish a parent-child structure
    const root = d3.hierarchy({ children: topMovies })
        // Calculate the size of the boxes
        .sum(d => d.gross_ww)
        // Sort values for treemap population
        .sort((a, b) => b.value - a.value);

    // Customize layout
    const treemapLayout = d3.treemap()
        .padding(2)
        // .attr("width", 1200)
        // .attr("height", 600)

    // Assign the root hierarchy to the customized layout
    treemapLayout(root);

    // Remove the previous chart
    d3.select("#chart1").selectAll("svg").remove(); 

    // Append new svg element in chart container with id of chart1
    const svg = d3.select("#chart1")
    .append("svg")
    .attr("width", 1200)
    .attr("height", 600)

    // creates a new group elemetn to contain the rectangle and the text of each movie
    const nodes = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Make the node rectangular 
    nodes.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", "steelblue");

    // Append text element inside each group
    nodes.append("text")
        .attr("x", 5)
        .attr("y", 15)
        .text(d => d.data.title)
        .attr("font-size", "16px")
        .attr("fill", "white");

    // Start Heatmap
       
}

// Update the dashboard when filters change
function updateDashboard() {
    let filteredData = filterMovies();
    console.log(filteredData);
    console.log("Filtered Data Length:", filteredData.length);
    console.log("Filtered Data Sample:", filteredData[0]);
    buildCharts(filteredData);
}

// Load movie data and initialize dashboard
loadMovieData();
