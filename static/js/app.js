/*
This function is for loading movie data from the csv files and dynamically generating genre checkboxes
*/
function loadMovieData() {
    // Fetch data from the Flask API endpoint
    fetch('http://127.0.0.1:5001/get-movies')
        .then(response => response.json())  // Parse JSON response
        .then(data => {
            // This assigns the columns to variables 
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

            updateDashboard(); // Initialize dashboard after loading data

            // Safely assign global variable after data is loaded
            window.filteredData = filterMovies();
        })
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
    const topMovies = filteredData.sort((a, b) => b.gross_ww - a.gross_ww).slice(0, 50);


    // Start by giving treemap a hierarchy
    const root = d3.hierarchy({ children: topMovies })
        .sum(d => d.gross_ww)
        .sort((a, b) => b.value - a.value);

    // Customize layout
    const treemapLayout = d3.treemap()
        .size([1500, 600]) // Set the size for the treemap
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

    // creates a new group element to contain the rectangle and the text of each movie
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
}

//// STOP!!!!!
function buildBubbleChart(filteredData) {
    // Create an object to store the sum of gross_ww for each production company
    const productionSums = {};

    // Iterate through each data entry and process the production companies
    filteredData.forEach(d => {
        // Clean up the production_companies string to convert it into an actual array
        let companies = [];
        try {
            // Clean up the production companies array, removing surrounding quotes and brackets
            companies = JSON.parse(d.production_companies.replace(/'/g, '"')); // Replace single quotes with double quotes
        } catch (e) {
            // If parsing fails, treat it as a single company (this should be rare)
            companies = [d.production_companies];
        }

        // Iterate through each company and add the gross_ww to the correct sum
        companies.forEach(company => {
            // Ensure the company exists in productionSums, otherwise initialize it with 0
            if (!productionSums[company]) {
                productionSums[company] = 0;
            }
            productionSums[company] += d.gross_ww;  // Add to the existing sum
        });
    });

    // Convert the productionSums object to an array of objects for D3 processing
    const companyData = Object.entries(productionSums).map(([key, value]) => ({
        key: key,  // Production company name
        value: value // Sum of gross_ww
    }));

    // Sort the production companies by gross_ww value in descending order
    const top100Companies = companyData.sort((a, b) => b.value - a.value).slice(0, 100);

    // Prepare the hierarchy for the bubble chart using d3.hierarchy
    const root = d3.hierarchy({children: top100Companies})
        .sum(d => d.value)  // Use the summed gross_ww as the size of the bubble
        .sort((a, b) => b.value - a.value);

    // Set up the bubble chart layout
    const packLayout = d3.pack()
        .size([800, 800])  // Size of the chart
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
        .domain([0, d3.max(top100Companies, d => d.value)])  // Map the values of gross_ww
        .range([10, 100]);  // Define the range for the radius of the bubbles (10 to 100)

    // Create a group for each production company (bubble)
    const node = svg.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    // Create the bubbles (circles)
    node.append("circle")
        .attr("r", d => sizeScale(d.value))  // Use the scaled radius
        .attr("fill", "steelblue")
        .attr("opacity", 0.6);

    // Add text labels inside each bubble
    node.append("text")
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .text(d => d.data.key);  // Use the production company name as label

    // Add a title to each bubble
    node.append("title")
        .text(d => `${d.data.key}\nGross: $${d.value.toLocaleString()}`);

}


// Build stacked bar chart
// function buildStackedBar(filteredData) {
//     // Step 1: Calculate the variation for each movie
//     filteredData.forEach(d => {
//         d.variation = Math.abs(d.gross_ww - d.budget); // Absolute difference between gross and budget
//     });

//     // Step 2: Sort the data by variation and get the top 10 movies
//     const topMoviesByVariation = filteredData
//         .sort((a, b) => b.variation - a.variation)
//         .slice(0, 10);

//     // Step 3: Prepare data for the stacked bar chart
//     const stackedData = topMoviesByVariation.map(d => ({
//         title: d.title,
//         budget: d.budget,
//         gross_ww: d.gross_world_wide
//     }));

//     // Step 4: Set up the chart dimensions and margin
//     const margin = { top: 20, right: 30, bottom: 40, left: 90 };
//     const width = 900 - margin.left - margin.right;
//     const height = 500 - margin.top - margin.bottom;

//     // Step 5: Create the SVG element in the div with id 'chart3'
//     const svg = d3.select("#chart4")
//         .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//     // Step 6: Set the x and y scales
//     const x = d3.scaleBand()
//         .domain(topMoviesByVariation.map(d => d.title))
//         .range([0, width])
//         .padding(0.1);

//     const y = d3.scaleLinear()
//         .domain([0, d3.max(stackedData, d => d.budget + d.gross_ww)])
//         .nice()
//         .range([height, 0]);

//     // Step 7: Add the x-axis and y-axis
//     svg.append("g")
//         .attr("transform", `translate(0, ${height})`)
//         .call(d3.axisBottom(x))
//         .selectAll("text")
//         .attr("transform", "rotate(-45)")
//         .style("text-anchor", "end");

//     svg.append("g")
//         .call(d3.axisLeft(y));

//     // Step 8: Create the bars for the stacked chart
//     svg.selectAll(".bar-budget")
//         .data(stackedData)
//         .enter()
//         .append("rect")
//         .attr("class", "bar-budget")
//         .attr("x", d => x(d.title))
//         .attr("width", x.bandwidth())
//         .attr("y", d => y(d.budget))
//         .attr("height", d => height - y(d.budget))
//         .attr("fill", "#69b3a2");

//     svg.selectAll(".bar-gross")
//         .data(stackedData)
//         .enter()
//         .append("rect")
//         .attr("class", "bar-gross")
//         .attr("x", d => x(d.title))
//         .attr("width", x.bandwidth())
//         .attr("y", d => y(d.budget + d.gross_ww))
//         .attr("height", d => height - y(d.gross_ww))
//         .attr("fill", "#ff7f0e");
// }




// // Update the dashboard when filters change
// function updateDashboard() {
//     let filteredData = filterMovies();
//     console.log(filteredData);
//     // console.log("Filtered Data Length:", filteredData.length);
//     // console.log("Filtered Data Sample:", filteredData[0]);
//     buildCharts(filteredData);
// }

function updateDashboard() {
    console.log("Updating dashboard...");
    let filteredData = filterMovies();
    let groupedData = groupDataByYear(filteredData);
    console.log("Grouped Data:", groupedData);
    console.log("Filtered Data Inside updateDashboard:", filteredData);
    buildCharts(filteredData);
    buildBubbleChart(filteredData);
}


// Load movie data and initialize dashboard
loadMovieData();
