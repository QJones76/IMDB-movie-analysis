let movieData = []; // Define movieData in the global scope

// This function is for loading movie data from the csv files and dynamically generating genre checkboxes
function loadMovieData() {
    // Fetch data from the Flask API endpoints
    Promise.all([
        fetch('http://127.0.0.1:5001/get-movies').then(response => response.json()),
        fetch('http://127.0.0.1:5001/get-heatmap').then(response => response.json())
    ])
    .then(([movieDataResponse, heatmapDataResponse]) => {
        // Process movie data
        movieData = movieDataResponse.map(d => ({
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

        // Initialize the dashboard upon successfully getting data
        updateDashboard();

        // Assign global variable after data is loaded
        window.filteredData = filterMovies();

        // Process heatmap data
        const heatmapData = heatmapDataResponse;
        console.log("Heatmap Data:", heatmapData);

        // Build heatmap
        buildHeatmap(heatmapData);
    })
    // Add a condition to catch data fetching errors
    .catch(error => {
        console.error("Error fetching data:", error);
    });
}

// Add custom color scale for charts
const colors = [
    "#D95F02", // orange
    "#7570B3", // purple
    "#E7298A", // pink
    "#66A51E", // green vibrant
    "#E6AB02", // Catheter-bag
    "#1B9E77", // teal green
    "#B07AA1", // muted lavender
    "#DC863B", // burnt orange
    "#6A3D9A", // deep purple
    "#BC80BD", // soft mauve
    "#8DD3C7", // mint green
    "#FDB462", // apricot orange
    "#80B1D3"  // sky blue
];

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
    // Return new filtered data
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
    .attr("fill", (d, i) => colors[i % colors.length])
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
    // Add event listener for if the mouse isn't currently on an element
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

// Build Holly's fun facts
// loop through the entire dataset to find the fun facts
function updateFunFacts(filteredData) {

    // Select the correct chart class
    const chart2Element = document.querySelector('#chart2');

    // Remove existing content
    chart2Element.innerHTML = '';

    // Check if the dataset is empty. If it is, add a message to the HTML element
    if (!filteredData.length) {
        chart2Element.innerHTML = "<p>YOUR DATA IS BROKEN AGAIN NERD!</p>";
        return;
    }

    const highestRated = filteredData.reduce((prev, curr) => (curr.rating > prev.rating ? curr : prev), filteredData[0]);
    const lowestRated = filteredData.reduce((prev, curr) => (curr.rating < prev.rating ? curr : prev), filteredData[0]);
    const mostNominations = filteredData.reduce((prev, curr) => (curr.nominations > prev.nominations ? curr : prev), filteredData[0]);
    const highestUsAndCanada = filteredData.reduce((prev, curr) => (curr.gross_us_canada > prev.gross_us_canada ? curr : prev), filteredData[0]);
    const highestWW = filteredData.reduce((prev, curr) => (curr.gross_ww > prev.gross_ww ? curr : prev), filteredData[0]);
    const lowestBudget = filteredData.reduce((prev, curr) => (curr.budget < prev.budget ? curr : prev), filteredData[0]);

    // check all the elements loaded correctly
    console.log("Highest rated: ", highestRated);
    console.log("Lowest rated: ", lowestRated);
    console.log("Most nominated: ", mostNominations);
    console.log("Highest Us/Canada: ", highestUsAndCanada);
    console.log("Highest earning ww: ", highestWW);
    console.log("lowest budget: ", lowestBudget);

    // Create a fun facts section
    const funFactsHTML = `
    <div style="font-size:24px;">
        <div class="fact1">
            <p><strong>The Highest Rated</strong> movie of the selected fields is <strong>${highestRated.title}</strong> with an IMDB rating of <strong>${highestRated.rating}</strong>.</p>
        </div>
        <div class="fact2">
            <p><strong>The Lowest Rated</strong> movie of the selected fields is <strong>${lowestRated.title}</strong> with an IMDB rating of <strong>${lowestRated.rating}</strong>.</p>
        </div>
        <div class="fact3">
            <p><strong>The Most Nominated</strong> movie of the selected fields is <strong>${mostNominations.title}</strong>, receiving <strong>${mostNominations.nominations}</strong> nominations!</p>
        </div>
        <div class="fact4">
            <p><strong>${highestUsAndCanada.title}</strong> earned the most in US and Canadian markets. They earned <strong>$${highestUsAndCanada.gross_us_canada}</strong> total!</p>
        </div>
        <div class="fact5">
            <p><strong>${highestWW.title}</strong> earned the most in the world wide market. They earned <strong>$${highestWW.gross_ww}.</strong></p>
        </div>
        <div class="fact6">
            <p><strong>${lowestBudget.title}</strong> had the lowest budget. They only had <strong>$${lowestBudget.budget}</strong> to work with</p>
        </div>
    </div>
`;

    // Append the fun facts to the chart2 element
    chart2Element.innerHTML = funFactsHTML;
}


// Build Aditi's Bubble chart
function buildBubbleChart(filteredData) {
    // Create an object to store the sum of gross_ww for each production company
    const productionSums = {};

    // Iterate through each data entry and process the production companies
    filteredData.forEach(d => {
        let companies = [];
        try {
            // First attempt: Handle the case where production companies are enclosed in backticks
            let cleanedString = d.production_companies;

            // Check if the string is enclosed in backticks and remove them
            if (cleanedString.startsWith('`') && cleanedString.endsWith('`')) {
                cleanedString = cleanedString.slice(1, -1); // Remove backticks
            }

            // Now handle the rest of the string as before, replacing quotes and parsing
            companies = JSON.parse(
                cleanedString
                    .replace(/'/g, '"')                       // Replace single quotes with double quotes
                    .replace(/\\"/g, "'")                     // Replace escaped double quotes with single quotes
                    .replace(/"(?=\w+['’]\w+)/g, match => match.replace('"', "'")) // Adjust double quotes for nested single quotes
            );
        } catch (e1) {
            try {
                // Second attempt: Replace backticks and other formatting issues
                let cleanedString = d.production_companies.replace(/`/g, '"');
                
                if (cleanedString.includes("'") && !cleanedString.includes('"')) {
                    cleanedString = cleanedString.replace(/'(?![^"]*")/g, '"'); // Replace single quotes outside double quotes
                }
    
                companies = JSON.parse(cleanedString);
            } catch (e2) {
                try {
                    // Third attempt: Handle mixed quotes specifically for your case
                    let adjustedString = d.production_companies
                        .replace(/'/g, '"') // Replace all single quotes with double quotes
                        .replace(/"\\"/g, "'") // Replace escaped double quotes inside quotes
                        .replace(/""/g, '"') // Fix double double quotes
                        .replace(/\\"/g, "'"); // Replace escaped double quotes with single quotes
    
                    companies = JSON.parse(adjustedString);
                } catch (e3) {
                    try {
                        // Fourth attempt: Handle mixed quotes with different approach
                        let mixedQuotesString = d.production_companies
                            .replace(/'/g, '"') // Replace all single quotes with double quotes
                            .replace(/"(?=\w+['’]\w+)/g, match => match.replace('"', "'")) // Adjust double quotes for nested single quotes
                            .replace(/""/g, '"'); // Fix double double quotes
                        
                        companies = JSON.parse(mixedQuotesString);
                    } catch (e4) {
                        // If all else fails, treat the entire string as a single company
                        companies = [d.production_companies];
                    }
                }
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
        .attr("fill", (d, i) => colors[i % colors.length])
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


// Build Nicholas' heatmap
function calculateCorrelationMatrix(data, columns) {
    function pearsonCorrelation(x, y) {
        const meanX = d3.mean(x);
        const meanY = d3.mean(y);
        const numerator = d3.sum(x.map((xi, i) => (xi - meanX) * (y[i] - meanY)));
        const denominator = Math.sqrt(
            d3.sum(x.map(xi => Math.pow(xi - meanX, 2))) *
            d3.sum(y.map(yi => Math.pow(yi - meanY, 2)))
        );
        return numerator / denominator;
    }

    const matrix = [];
    for (let i = 0; i < columns.length; i++) {
        for (let j = 0; j < columns.length; j++) {
            const x = data.map(d => d[columns[i]]);
            const y = data.map(d => d[columns[j]]);
            matrix.push({
                row: i,
                col: j,
                value: pearsonCorrelation(x, y)
            });
        }
    }
    return matrix;
}

// Function to build heatmap using D3
function buildHeatmap(data) {
    const margin = { top: 0, right: 0, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    // Define the columns you want to visualize
    const columns = ["avg_rating_change", "budget_change", "gross_us_change", "gross_world_change", "nominations_change", "oscars_change", "votes_change"];
    
    // Calculate the correlation matrix
    const heatmapData = calculateCorrelationMatrix(data, columns);

    // Remove any existing heatmap
    d3.select("#chart4").selectAll("svg").remove();

    // Append new SVG element for heatmap
    const svg = d3.select("#chart4")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .domain(columns)
        .padding(0.01);

    const y = d3.scaleBand()
        .range([height, 0])
        .domain(columns)
        .padding(0.01);

    // Define custom color interpolator for blue-white-red
    const interpolateBuWeRd = t => {
        if (t < 0.5) {
            return d3.interpolateBlues(2 * t);
        } else {
            return d3.interpolateReds(2 * (t - 0.5));
        }
    };

    const colorScale = d3.scaleSequential()
        .interpolator(interpolateBuWeRd)
        .domain([-1, 1]); // Correlation ranges from -1 to 1

    svg.selectAll()
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("x", d => x(columns[d.col]))
        .attr("y", d => y(columns[d.row]))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => colorScale(d.value))
        .append("title") // Tooltip to show the correlation value
        .text(d => d.value.toFixed(2));

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));
}

function updateDashboard() {
    console.log("Updating dashboard...");
    let filteredData = filterMovies();
    console.log("Filtered Data Inside updateDashboard:", filteredData);
    buildTreemap(filteredData);
    updateFunFacts(filteredData);
    buildBubbleChart(filteredData);
}

// Load movie data and initialize dashboard
loadMovieData();