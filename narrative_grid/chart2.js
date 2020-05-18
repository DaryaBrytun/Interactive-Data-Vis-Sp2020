export function chart2() {
  const width = window.innerWidth * 0.6,
  height = window.innerHeight * 0.5,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5,
  default_selection = "Select a Year";

let svg;
let xScale;
let yScale;
let circleScale;
let tooltip;

const formatPopulation = d3.format(".2s")

let state = {
  data: [],
  selectedYear: "2017",
};

d3.csv("./data/LifeExpExpend.csv", d => ({
    Year: +d.Year,
    Country: d.Country,
    Region: d.Region,
    Population: +d.Population,
    LifeExp: +d.LifeExp,
    GDP: +d.GDP,
    HealthExpend: +d.HealthExpend,
})).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});


function init() {

  xScale = d3
  .scaleLog()
  .domain(d3.extent(state.data, d => d.HealthExpend))
  .range([margin.left, width - margin.right]);

  yScale = d3
  .scaleLinear()
  .domain(d3.extent(state.data, d => d.LifeExp))
  .range([height - margin.bottom, margin.top]);

  circleScale = d3
  .scaleLinear()
  .domain(d3.extent(state.data, d => d.Population))
  .range([8,50]);

 
  var xAxis = d3.axisBottom(xScale)
  .tickValues([15, 30, 60, 100, 200, 300, 600, 1000, 2000, 3000, 5000, 10000])
  .tickFormat(d3.format("$,"));
  var yAxis = d3.axisLeft(yScale);
  
 var svgLegend = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width",  400)
  .attr("height", 150);

//legend
svgLegend.append("circle").attr("cx",20).attr("cy",10).attr("r", 6).style("fill", "#bc70a4")
svgLegend.append("circle").attr("cx",20).attr("cy",25).attr("r", 6).style("fill", "#6b5b95")
svgLegend.append("circle").attr("cx",20).attr("cy",40).attr("r", 6).style("fill", "#00a591")
svgLegend.append("circle").attr("cx",20).attr("cy",55).attr("r", 6).style("fill", "#660066")
svgLegend.append("circle").attr("cx",150).attr("cy",10).attr("r", 6).style("fill", "#9dea4f")
svgLegend.append("circle").attr("cx",150).attr("cy",25).attr("r", 6).style("fill", "#faf20a")
svgLegend.append("text").attr("x", 30).attr("y", 10).text("Europe").style("font-size", "15px").attr("alignment-baseline","middle")
svgLegend.append("text").attr("x", 30).attr("y", 25).text("Africa").style("font-size", "15px").attr("alignment-baseline","middle")
svgLegend.append("text").attr("x", 30).attr("y", 40).text("Asia").style("font-size", "15px").attr("alignment-baseline","middle")
svgLegend.append("text").attr("x", 30).attr("y", 55).text("South America").style("font-size", "15px").attr("alignment-baseline","middle")
svgLegend.append("text").attr("x", 160).attr("y", 10).text("North America").style("font-size", "15px").attr("alignment-baseline","middle")
svgLegend.append("text").attr("x", 160).attr("y", 25).text("Oceania").style("font-size", "15px").attr("alignment-baseline","middle")

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

  tooltip = d3
  .select('#tooltip')
  .attr("width", 100)
  .attr("height", 100)
  .attr('style', 'position: absolute;');

  svg = d3
  .select("#d3-container-2")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

 
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
  .text("Health Expenditure, $");

  svg
  .append("g")
  .attr("class", "axis y-axis")
  .attr("transform", `translate(${margin.left},0)`)
  .call(yAxis)
  .append("text")
  .attr("class", "axis-label")
  .attr("y", "-5%")
  .attr("dx", "-150")
  .attr("transform", "rotate(-90)", "writing-mode: tb", "vertical-lr")   
  .attr("style", "fill: black")
  .text("Life Expectancy, years");
  draw(); 
}

  function draw() {
   
    let filteredData;
   if (state.selectedYear !== null) {
    filteredData = state.data.filter(d => d.Year === +state.selectedYear);
    }
   
  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.Region)
    .join(
      enter => 
      enter 
      .append("circle")
      .attr("class", "dot") 
      .attr("id", d =>`${d.Year}_${d.Country}`)
      .attr("stroke", "#444952")
      .style('cursor', 'pointer')
      .attr("opacity", 0.7)
      .attr("fill", (d,i) => 
      {
        switch (d.Region){ 
          case "Europe": return "#bc70a4";
          break;
          case "Africa": return "#6b5b95";
          break;
          case "Asia": return "#00a591";
          break;
          case "South America": return "#660066";
          break;
          case "North America": return "#9dea4f";
          break;
          case "Oceania": return "#faf20a";
          break;
        }})
      .attr("cy", d => yScale(d.LifeExp))
      .attr("cx", d => xScale(d.HealthExpend)) 
      .on("click", function(d, i) {
        console.log("clicking on", this);
        d3.select(this)
          .transition()
          .attr('r', 20);
      })
      .on("mouseover", d => {
        tooltip
        .transition()
        .duration(200)
        .style('opacity', 1)
        tooltip
        .html("<strong>Country: </strong>" + d.Country + 
            "<br/>"+ "<strong>Life Expectancy: </strong>" + d.LifeExp + 
            "<br/>" + "<strong>Health Expenditure: </strong>"+ d.HealthExpend+
            "<br/>" + "<strong>Population: </strong>" + formatPopulation(d.Population))	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY) + "px");	
            })	
     .on("mouseout", d => {
      tooltip
      .transition()
      .duration(500)
      .style('opacity', 0)
     })
      .call(enter =>
        enter
          .transition() 
          .delay(d => d.HealthExpend / 500) 
          .duration(300)
          .attr("r", d => circleScale(d.Population))
        ),

      update => 
      update.call(update =>
      update
      .transition()
      .duration(300)
      .attr("cy", d => yScale(d.LifeExp))
      .attr("cx", d => xScale(d.HealthExpend))
      ), 

      exit =>
      exit.call(exit =>
        exit.remove()
      )
    );
    }
   

}