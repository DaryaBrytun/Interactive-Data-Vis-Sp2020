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
  selectedRegion: "All" // + YOUR FILTER SELECTION
};

/* LOAD DATA */
d3.csv("../data/hp2016.csv", d3.autoType).then(raw_data => {
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
  .scaleLinear()
  .domain(d3.extent(state.data, d => d.economy))
  .range([margin.left, width - margin.right]);

  yScale = d3
  .scaleLinear()
  .domain(d3.extent(state.data, d => d.happiness_score))
  .range([height - margin.bottom, margin.top]);

  // + AXES

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    console.log("new salected region is ", this.value);
    state.selectedRegion= this.value
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(["All", "Australia and New Zealand", "Central and Eastern Europe", 
    "Asia", "Latin America and Caribbean",
    "Africa", "North America", 
    "Western Europe"]) // + ADD UNIQUE VALUES
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
  .text("Economy (GDP per capita)");

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
  .text("Happiness Score");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state
function draw() {
   // filter the data for the selectedParty
  let filteredData = state.data;
  // if there is a selectedParty, filter the data before mapping 
  // it to our elements
  if (state.selectedRegion !== "All") {
    filteredData = state.data.filter(d => d.region === state.selectedRegion);
  }
  // + FILTER DATA BASED ON STATE

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
        if (d.region === "Western Europe") return "#bc70a4";
        else if (d.region === "Africa") return "#00a591";
        else if (d.region === "North America") return "#660066";
        else if (d.region === "Latin America and Caribbean") return "#6b5b95";
        else if (d.region === "Australia and New Zealand") return "#004b8d";
        else if (d.region === "Central and Eastern Europe") return "#88b04b";
        else return "#006e6d";
      })
      .attr("r", 0)
      .attr("cy", d => margin.top)
      .attr("cx", d => xScale(d.economy)) // initial value - to be transitioned
      .call(enter =>
        enter
          .transition() // initialize transition
          .delay(d => 500 * d.economy) // delay on each element
          .duration(500) // duration 500ms
          .attr("cy", d => yScale(d.happiness_score))
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
          .delay(d => 50 * d.economy)
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
