
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 70, left: 80, right: 40 },
  radius = 5;
  // default_selection = "Select a Year",
  // default_selection2 = "Select a Region";

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;


/* APPLICATION STATE */
let state = {
  data: [],
  selectedRegion: "All", // + YOUR FILTER SELECTION
  selectedYear: "All",
};

/* LOAD DATA */
d3.csv("../data/lifeExp1.csv", d3.autoType).then(raw_data => {
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
  .domain(d3.extent(state.data, d => d.Income))
  .range([margin.left, width - margin.right]);

  yScale = d3
  .scaleLinear()
  .domain(d3.extent(state.data, d => d.Life_exp))
  .range([height - margin.bottom, margin.top]);

  //population scale for circle size
  circleScale = d3
  .scaleLinear()
  .domain(d3.extent(state.data, d => d.Population))
  .range([3,20]);

  // + AXES

  var xAxis = d3.axisBottom(xScale).ticks(10, d3.format(".2s"));
  var yAxis = d3.axisLeft(yScale);

  // // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    console.log("new salected region is ", this.value);
    state.selectedRegion= this.value;
    draw(); // re-draw the graph based on this new selection
  });

  const selectYear = d3.select("#dropdown_year").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    console.log("new salected year is ", this.value);
    state.selectedYear= this.value;
    draw(); // re-draw the graph based on this new selection
  });

//  selectYear
//   .selectAll("option")
//   .data([
//     ...Array.from(new Set(state.data.map(d => d.Year))), // unique data values-- (hint: to do this programmatically take a look `Sets`)
//     // default_selection,
//   ])
//   .join("option")
//   .attr("value", d => d)
//   .text(d => d);

  // selectYear.property("value", default_selection);

  // getting the YEAR data categories
  let yearTypes = new Set(d3.map(state.data,function(d) {return d.Year;}).keys());
  yearTypes.add("All");
  yearTypes.delete("Year");
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
    .data(["All", "Asia", "Europe", "The Americas",
    "Africa"]) // + ADD UNIQUE VALUES
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // selectElement.property("value", default_selection2);
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

// var timeLabel = svg.append("text")
//     .attr("y", height - 300)
//     .attr("x", width - 300)
//     .attr("font-size", "100px")
//     .attr("opacity", "0.4")
//     .attr("text-anchor", "middle")
//     .text("1800");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state
function draw() {
   // filter the data for the selectedParty
  let filteredData;
  // if there is a selectedParty, filter the data before mapping 
  // it to our elements
  if (state.selectedRegion !== "All") {
    filteredData = state.data.filter(d => d.Region === state.selectedRegion);
  if (state.selectedYear !== "All") {
    filteredData = state.data.filter(d => d.Year === state.selectedYear);
    }
  }
  if (state.selectedYear !== "All") {
    filteredData = state.data.filter(d => d.Year === state.selectedYear);
  if (state.selectedRegion !== "All") {
    filteredData = state.data.filter(d => d.Region === state.selectedRegion);
    }
  }

  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.Country)
    .join(
      enter => 
      // enter selections -- all data elements that don't have a `.dot` element attached to them yet
      enter // + HANDLE ENTER SELECTION
      .append("circle")
      .attr("class", "dot") // Note: this is important so we can identify it in future updates
      .attr("stroke", "lightblue")
      .attr("opacity", 0.9)
      .attr("fill", d => {
        if (d.Region === "Europe") return "#bc70a4";
        else if (d.Region === "Africa") return "#00a591";
        else if (d.Region === "The Americas") return "#660066";
        else if (d.Region === "Asia") return "#6b5b95";
        else return "#006e6d";
      })
      .attr("r", d => circleScale(d.Population))
      .attr("cy", d => yScale(d.Life_exp))
      .attr("cx", d => xScale(d.Income)) // initial value - to be transitioned
      .call(enter =>
        enter
          .transition() // initialize transition
          .delay(d => d.Income) // delay on each element
          .duration(10) // duration 500ms
      ),
      update => // + HANDLE UPDATE SELECTION
      // update selections -- all data elements that match with a `.dot` element
      update.call(update =>
      update
      .transition()
      .duration(37)
      .attr("stroke", "red")
      .transition()
      .duration(50)
      .attr("stroke", "green")
      ), 


      exit =>
      exit.call(exit =>
        // exit selections -- all the `.dot` element that no longer match to HTML elements
        exit
          .transition()
          .delay(d => d.Income)
          .duration(10)
          .attr("r",3)
          .remove()
      )
    );
}
