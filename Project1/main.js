/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 70, left: 80, right: 40 },
  radius = 6;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selectedcontinent: "All", // + YOUR FILTER SELECTION
  selectedcountry: "All", 
  selectedyear: "All",
};

/* LOAD DATA */
d3.json("../data/data.json", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});


/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in 
function init() {
  // + SCALES
  xScale = d3
  .scaleLog()
  .base(10)
  .domain([140, 150000])
  .range([margin.left, width - margin.right]);

  yScale = d3
  .scaleLinear()
  .domain(d3.extent(state.data, d => d.life_exp))
  .range([height - margin.bottom, margin.top]);

  //population scale for circle size
  circleScale = d3
  .scaleLinear()
  .domain(d3.extent(state.data, d => d.population))
  .range([5,20]);

  // + AXES

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    console.log("new salected region is ", this.value);
    state.selectedcontinent= this.value
    draw(); // re-draw the graph based on this new selection
  });

  const selectYear = d3.select("#dropdown_year").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    console.log("new salected year is ", this.value);
    state.selectedyear= this.value
    draw(); // re-draw the graph based on this new selection
  });


  // getting the YEAR data categories
  let yearTypes = new Set(d3.map(state.data,function(d) {return d.year;}).keys());
  yearTypes.add("All");
  yearTypes.delete("NA");
  console.log(yearTypes);


  selectYear
  .selectAll("option")
  .data(Array.from(yearTypes)) // unique data values-- (hint: to do this programmatically take a look `Sets`)
  .join("option")
  .attr("value", d => d)
  .text(d => d);

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(["All", "asia", "europe", "americas",
    "africa"]) // + ADD UNIQUE VALUES
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // // + CREATE SVG ELEMENT

  svg = d3
  .select("#d3-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);


  // // + CALL AXES

  svg
  .append("g")
  .attr("class", "axis x-axis")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(xAxis)
  .append("text")//label
  .attr("class", "axis-label")
  .attr("x", "50%")//location
  .attr("dy", "3em")//location
  .attr("style", "fill: green")
  .text("Income (GDP per capita)");

  svg
  .append("g")
  .attr("class", "axis y-axis")
  .attr("transform", `translate(${margin.left},0)`)
  .call(yAxis)
  .append("text")//label
  .attr("class", "axis-label")
  .attr("y", "-5%")//location
  .attr("dx", "-250")//location
  .attr("transform", "rotate(-90)", "writing-mode: tb", "vertical-lr")   
  .attr("style", "fill: green")
  .text("Life Expectancy");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state
function draw() {
   // filter the data for the selectedParty
  let filteredData = state.data;
  // if there is a selectedParty, filter the data before mapping 
  // it to our elements
  if (state.selectedContinent !== "All") {
    filteredData = state.data.filter(d => d.continent === state.selectedContinent);
  }
  if (state.selectedyear !== "All") {
    filteredData = state.data.filter(d => d.year === state.selectedyear);
  }

  

  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.country)
    .join(
      enter => 
      // enter selections -- all data elements that don't have a `.dot` element attached to them yet
      enter // + HANDLE ENTER SELECTION
      .append("circle")
      .attr("class", "dot") // Note: this is important so we can identify it in future updates
      .attr("stroke", "lightblue")
      .attr("opacity", 0.9)
      .attr("fill", d => {
        if (d.continet === "europe") return "#bc70a4";
        else if (d.continent === "africa") return "#00a591";
        else if (d.continent === "americas") return "#660066";
        else if (d.continent === "asia") return "#6b5b95";
        else return "#006e6d";
      })
      .attr("r", 4)
      .attr("cy", d => margin.top)
      .attr("cx", d => xScale(d.income)) // initial value - to be transitioned
      .call(enter =>
        enter
          .transition() // initialize transition
          .delay(d => 500 * d.income) // delay on each element
          .duration(500) // duration 500ms
          .attr("cy", d => yScale(d.life_exp))
          .attr("r", radius)
      ),
      update => // + HANDLE UPDATE SELECTION
      // update selections -- all data elements that match with a `.dot` element
      update.call(update =>
      update
      .transition()
      .duration(700)
      .attr("stroke", "red")
      .transition()
      .duration(1000)
      .attr("stroke", "green")
      .attr("opacity", 7)
      ), 


      exit =>
      exit.call(exit =>
        // exit selections -- all the `.dot` element that no longer match to HTML elements
        exit
          .transition()
          .delay(d => 50 * d.income)
          .duration(700)
          .attr("r",6)
          .transition()
          .duration(850)
          .attr("fill", "#daa520")
          .transition()
          .duration(300)
          .attr("r", 2)
          .attr("cy", height)
          .remove()
      )
    );
}


