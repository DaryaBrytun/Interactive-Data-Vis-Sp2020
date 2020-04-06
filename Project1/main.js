
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 70, left: 80, right: 40 },
  radius = 5,
  default_selection = "Select a Year";
  default_selection2 = "Select a Region";

let svg;
let xScale;
let yScale;
let tooltip;

var formatIncome = d3.format("$,")
var formatPopulation = d3.format(".2s")

/* APPLICATION STATE */
let state = {
  data: [],
  selectedRegion: null, 
  selectedYear: null,
};

/* LOAD DATA */
d3.csv("../data/lifeExp1.csv", d3.autoType).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});


/* INITIALIZING FUNCTION */
function init() {

  xScale = d3
  .scaleLog()
  .domain(d3.extent(state.data, d => d.Income))
  .range([margin.left, width - margin.right]);

  yScale = d3
  .scaleLinear()
  .domain(d3.extent(state.data, d => d.Life_exp))
  .range([height - margin.bottom, margin.top]);

  circleScale = d3
  .scaleLinear()
  .domain(d3.extent(state.data, d => d.Population))
  .range([8,50]);

 
// + AXES
  var xAxis = d3.axisBottom(xScale)
  .tickValues([400, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 200000])
  .tickFormat(d3.format(".1s"));
  var yAxis = d3.axisLeft(yScale);

  // + UI ELEMENT SETUP
  const selectElement = d3.select("#dropdown").on("change", function() {
    console.log("new salected region is ", this.value);
    state.selectedRegion= this.value;
    draw(); 
  });

  const years = Array.from(new Set(state.data.map(d => d.Year)))
  d3.select(".slider_year")
  .attr("min", d3.min(years))
  .attr("max", d3.max(years))
  .on("change", function() {
    console.log("new salected year is ", this.value);
    state.selectedYear= this.value;
    d3.select("#dropdown_year").property("value", this.value)
    draw(); 
  });

  const selectYear = d3.select("#dropdown_year").on("change", function() {
    console.log("new salected year is ", this.value);
    state.selectedYear= this.value;
    draw(); 
  });

 selectYear
  .selectAll("option")
  .data([
    ...Array.from(new Set(state.data.map(d => d.Year))), 
    default_selection,
  ])
  .join("option")
  .attr("value", d => d)
  .text(d => d);

  selectYear.property("value", default_selection);


  selectElement
    .selectAll("option")
    .data(["Asia", "Europe", "The Americas",
    "Africa", 
    default_selection2,
  ]) 
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  selectElement.property("value", default_selection2);
 
// *TOOLTIP*
  div = d3
  .select('body')
  .append("div")
  .attr("class", "tooltip")
  .attr("width", 100)
  .attr("height", 100)
  .attr('style', 'position: absolute; opacity: 0;');

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
  .append("text")
  .attr("class", "axis-label")
  .attr("x", "50%")
  .attr("dy", "3em")
  .attr("style", "fill: black")
  .text("Economy (GDP per capita), $");

  svg
  .append("g")
  .attr("class", "axis y-axis")
  .attr("transform", `translate(${margin.left},0)`)
  .call(yAxis)
  .append("text")
  .attr("class", "axis-label")
  .attr("y", "-5%")
  .attr("dx", "-250")
  .attr("transform", "rotate(-90)", "writing-mode: tb", "vertical-lr")   
  .attr("style", "fill: black")
  .text("Life Expectancy, years");
  draw(); 
}

/* DRAW FUNCTION */
  function draw() {
   let filteredData = state.data;

  if (state.selectedRegion !== "null" && state.selectedYear !== "null") {
    filteredData = state.data.filter(d => d.Region === state.selectedRegion && d.Year === +state.selectedYear  )
    }

  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.Country)
    .join(
      enter => 
      enter 
      .append("circle")
      .attr("class", "dot") 
      .attr("id", d =>`${d.Year}_${d.Region}`)
      .attr("stroke", "#444952")
      .attr("opacity", 0.8)
      .attr("fill", (d,i) => 
      {
        switch (d.Region){ 
          case "Europe": return "#bc70a4";
          break;
          case "Africa": return "#6b5b95";
          break;
          case "Asia": return "#00a591";
          break;
          case "The Americas": return "#660066";
          break;
        }})
      .attr("cy", d => yScale(d.Life_exp))
      .attr("cx", d => xScale(d.Income)) 
      .on("mouseover", d => {
        div.transition()
        .duration(200)
        .style('opacity', 1)
        div.html("<strong>Country: </strong>" + d.Country + 
            "<br/>"+ "<strong>Year: </strong>" + d.Year +
            "<br/>"+ "<strong>Life Expectancy: </strong>" + d.Life_exp + 
            "<br/>" + "<strong>GDP per Capita: </strong>"+ formatIncome(d.Income) + 
            "<br/>" + "<strong>Population: </strong>" + formatPopulation(d.Population))	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })	
     .on("mouseout", d => {
      div.transition()
      .duration(500)
      .style('opacity', 0)
     })
      .call(enter =>
        enter
          .transition() 
          .delay(d => d.Income / 500) 
          .duration(300)
          .attr("r", d => circleScale(d.Population))
        ),

      update => 
      update.call(update =>
      update
      .transition()
      .duration(300)
      .attr("cy", d => yScale(d.Life_exp))
      .attr("cx", d => xScale(d.Income))
      ), 

      exit =>
      exit.call(exit =>
        exit.remove()
      )
    );
    }
   
   
