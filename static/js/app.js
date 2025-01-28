// This function is for loading movie data from the csv files and dynamically generating genre checkboxes

function loadMovieData() {

    // Fetch data from the Flask API endpoint
    fetch('http://127.0.0.1:5001/get-movies')
        .then(response => response.json())
        .then(data => {

            // This assigns the JSON values to variables 
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

                // Create corresponding label for each unique genre
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

            // Initialize the dashboard upon succefully getting data
            updateDashboard();

            // Assign global variable after data is loaded
            window.filteredData = filterMovies();
        })

        // Add a condition to catch data fetching errors
        .catch(error => {
            console.error("Error fetching movie data:", error);
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

    // Retrieve the filter values to use on movie dataset
    const { yearMin, yearMax, genres } = getFilterValues();

    // Assign the filtered movie dataset to a variable
    let filtered = movieData.filter(movie =>
        movie.year >= yearMin && movie.year <= yearMax &&
        // Handle the case where no genres are selected
        (genres.length === 0 || genres.some(genre => movie.genres.includes(genre)))
    );
    // Return new filterd data
    return filtered;
}

// BUILD ALL CHARTS 

// Build Quinn's treemap
function buildTreemap(filteredData) {

    // Sort data by gross_ww in descending order for the top 50 movies
    const topMovies = filteredData.sort((a, b) => b.gross_ww - a.gross_ww).slice(0, 50);

    // Start by giving treemap a hierarchy
    const root = d3.hierarchy({ children: topMovies })
        .sum(d => d.gross_ww)
        .sort((a, b) => b.value - a.value);

    // Customize layout
    const treemapLayout = d3.treemap()
        .size([1200, 600]) // Size must be the same as the parent HTML container
        .padding(2);

    // Assign the root hierarchy to the customized layout
    treemapLayout(root);

    // Remove the previous chart
    d3.select("#chart1").selectAll("svg").remove();

    // Append new svg element in chart container with id of chart1
    const svg = d3.select("#chart1")
        .append("svg")
        .attr("width", 1500)
        .attr("height", 600);

    // Create a new group to hold all the elements
    const nodes = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Make the node rectangular
    nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", "steelblue")
    // Add event listener for mouse hover tooltip functionality
    .on("mouseover", function(event, d) {
        d3.select("#tooltip")
          .style("visibility", "visible")
          .html(`<strong>Title:</strong> ${d.data.title}<br>
                 <strong>Year:</strong> ${d.data.year}<br>
                 <strong>Gross WW:</strong> $${d.data.gross_ww.toLocaleString()}<br>
                 <strong>Genres:</strong> ${d.data.genres}`);
    })
    .on("mousemove", function(event) {
        d3.select("#tooltip")
          .style("top", (event.pageY + 10) + "px")
          .style("left", (event.pageX + 10) + "px");
    })
    // Add event listener for if the mouse isn't currently on a element
    .on("mouseout", function() {
        d3.select("#tooltip").style("visibility", "hidden");
    });

     // Add the tooltip container 
     d3.select("body").append("div")
     .attr("id", "tooltip")
     .style("position", "absolute")
     .style("background", "white")
     .style("border", "1px solid black")
     .style("padding", "5px")
     .style("visibility", "hidden");

    // Append text element inside each group
    nodes.append("text")
        .attr("x", 5)
        .attr("y", 15)
        .text(d => d.data.title)
        .attr("font-size", "16px")
        .attr("fill", "white");
}

// Build Aditi's Bubble chart
function buildBubbleChart(filteredData) {
    // Create an object to store the sum of gross_ww for each production company
    const productionSums = {};

    // Iterate through each data entry and process the production companies
    filteredData.forEach(d => {
    
        let companies = [];
        try {
            // Replace the single quotes with double quotes to follow JS string format
            companies = JSON.parse(d.production_companies.replace(/'/g, '"'));
        } catch (e1) {
            try {
                // Additional layer to catch the backticks in some of the arrays
                let cleanedString = d.production_companies.replace(/`/g, '"');
                
                // Replace single quotes with double quotes, but not those already inside double quotes
                if (cleanedString.includes("'") && !cleanedString.includes('"')) {
                    cleanedString = cleanedString.replace(/'(?![^"]*")/g, '"'); // Replace single quotes outside double quotes
                }

                // Attempt to parse the cleaned string
                companies = JSON.parse(cleanedString);

            } catch (e2) {
                // If all else fails, treat the entire string as a single company
                companies = [d.production_companies];
            }
        }

        // Iterate through each company and add the gross_ww to the total sum of each production company
        companies.forEach(company => {
            
            // Ensure the company exists in productionSums, otherwise initialize it with 0
            // This is what the '!' is for at the beginning of the if parameter
            if (!productionSums[company]) {
                productionSums[company] = 0;
            }
            // Add to the existing sum
            productionSums[company] += d.gross_ww;  
        });
    });

    // Convert the productionSums object to an array of objects for D3 processing
    const companyData = Object.entries(productionSums).map(([key, value]) => ({
        key: key,  // Production company name
        value: value // Sum of gross_ww
    }));

    // Sort the production companies by sum of gross_ww value in descending order
    const top100Companies = companyData.sort((a, b) => b.value - a.value).slice(0, 100);

    // Prepare the hierarchy for the bubble chart using d3.hierarchy
    const root = d3.hierarchy({children: top100Companies})
        // Make the bubble size dependent on the sum of each production company
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    // Set up the bubble chart layout
    const packLayout = d3.pack()
        .size([800, 800])  // Chart needs to be same size as HTML container
        .padding(5);
    packLayout(root);

    // Remove the previous chart
    d3.select("#chart3").selectAll("svg").remove();

    // Append a new SVG element to the chart container
    const svg = d3.select("#chart3")
        .append("svg")
        .attr("width", 800)
        .attr("height", 800)
        .attr("viewBox", "0 0 800 800")
        .attr("preserveAspectRatio", "xMidYMid meet");

    // Create a scale to adjust the size of the bubbles
    const sizeScale = d3.scaleSqrt()
        // Add the values of gross_ww
        .domain([0, d3.max(top100Companies, d => d.value)])
        // Define the range for the radius of the bubbles (10 to 100)
        // Change the range for bigger or smaller bubbles
        .range([10, 100]);

    // Create a group for each production company (bubble)
    const node = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add the bubbles
    node.append("circle")
        .attr("r", d => sizeScale(d.value))
        .attr("fill", "steelblue")
        .attr("opacity", 0.6)
        .on("mouseover", function(event, d) {
            // Add tooltip functionality
            d3.select("#tooltip")
              .style("visibility", "visible")
              .html(`<strong>Company:</strong> ${d.data.key}<br>
                     <strong>Gross:</strong> $${d.data.value.toLocaleString()}`);
        })
        // Add event listener for tooltips
        .on("mousemove", function(event) {
            d3.select("#tooltip")
              .style("top", (event.pageY + 10) + "px")
              .style("left", (event.pageX + 10) + "px");
        })
        // Remove tool tip from screen if not hovered on
        .on("mouseout", function() {
            d3.select("#tooltip").style("visibility", "hidden");
        });

    // Add text labels inside each bubble
    node.append("text")
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .style("fill", "black")
        // Use the production company name as label
        .text(d => d.data.key);  
}

function updateDashboard() {
    console.log("Updating dashboard...");
    let filteredData = filterMovies();
    console.log("Filtered Data Inside updateDashboard:", filteredData);
    buildCharts(filteredData);
    buildBubbleChart(filteredData);
}


// Load movie data and initialize dashboard
loadMovieData();
