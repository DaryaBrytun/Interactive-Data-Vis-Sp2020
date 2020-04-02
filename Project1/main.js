
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 70, left: 80, right: 40 },
  radius = 5,
  default_selection = "Select a Year";
  default_selection2 = "Select a Region";

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;


/* APPLICATION STATE */
let state = {
  data: [],
  selectedRegion: null, // + YOUR FILTER SELECTION
  selectedYear: null,
  // hover: {
  //   Country: null,
  //   Life_exp: null,
  //   Income: null,
  // },
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
  .range([6,40]);

  // + AXES

  var xAxis = d3.axisBottom(xScale)
  .tickValues([400, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 200000])
  .tickFormat(d3.format(".1s"));
  var yAxis = d3.axisLeft(yScale);

  // + UI ELEMENT SETUP

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

 selectYear
  .selectAll("option")
  .data([
    ...Array.from(new Set(state.data.map(d => d.Year))), // unique data values-- (hint: to do this programmatically take a look `Sets`)
    default_selection,
  ])
  .join("option")
  .attr("value", d => d)
  .text(d => d);

  selectYear.property("value", default_selection);


  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(["Asia", "Europe", "The Americas",
    "Africa", 
    // "All", 
    default_selection2,
  ]) // + ADD UNIQUE VALUES
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  selectElement.property("value", default_selection2);
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
  .attr("style", "fill: black")
  .text("Economy (GDP per capita), $");

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
  .attr("style", "fill: black")
  .text("Life Expectancy, years");


  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state

  function draw() {
    // filter the data for the selectedParty
   let filteredData = state.data;
 


  if (state.selectedRegion !== "null" && state.selectedYear !== "null") {
    filteredData = state.data.filter(d => d.Region === state.selectedRegion && d.Year === +state.selectedYear  )

    }


  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => `${d.Year}_${d.Region}`)
    .join(
      enter => 
      // enter selections -- all data elements that don't have a `.dot` element attached to them yet
      enter // + HANDLE ENTER SELECTION
      .append("circle")
      .attr("class", "dot") // Note: this is important so we can identify it in future updates
      .attr("stroke", "lightblue")
      .attr("opacity", 0.9)
      .attr("fill", (d,i) => 
      {
        if (d.Region === "Europe") return "#bc70a4";
        else if (d.Region === "Africa") return "#00a591";
        else if (d.Region === "The Americas") return "#660066";
        else if (d.Region === "Asia") return "#6b5b95";
        else return "#006e6d";
      })
      .attr("r", d => circleScale(d.Population))
      .attr("cy", d => yScale(d.Life_exp))
      .attr("cx", d => xScale(d.Income)) // initial value - to be transitioned
      // .on("mousemove", d => {
      //   // we can use d3.mouse() to tell us the exact x and y positions of our cursor
      //     const [mx, my] = d3.mouse(svg.node());
      //   // projection can be inverted to return [lat, long] from [x, y] in pixels
      //    const proj = projection.invert([mx, my]);
      //    state.hover["Country"] = d.Country;
      //    state.hover["Life Expectancy"] = d.Life_exp;
      //    state.hover["GDP"] = d.Income;
      //    draw();
      //   })
      .call(enter =>
        enter
          .transition() // initialize transition
          .delay(d => d.Income) // delay on each element
          .duration(10) // duration 500ms
          .attr("cy", d => yScale(d.Life_exp))
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
        .delay(d => 50 * d.Income)
        .duration(10)
        .attr("r",6)
        .transition()
        .duration(10)
        .attr("fill", "#daa520")
        .transition()
        .duration(10)
        .attr("r", 2)
        .attr("cy", height)
        .delay(d => 50 * d.Income)
        .remove()
      )
    )
}


