export function chart4() {

  const width = window.innerWidth * 0.6,
  height = window.innerHeight * 0.5,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };


  let svg;
  let xScale;
  let yScale;


const formatRound = d3.format('.0f')

let state = {
  data: [],
  };

Promise.all([
  d3.csv("./data/prediction.csv", d => ({
Country: d.Country,
LE2019: d.LE2019,
LE2050: d.LE2050,
LE2070: d.LE2070,
}))]).then(([data]) => {
state.data = data;
console.log("state: ", state);
init();
});

function init() {



var svg = d3.select("#d3-container-4")
.append("svg")
  .attr("width", width )
  .attr("height", height )
.append("g")
  .attr("transform",
        "translate(" + margin.left  + "," + margin.top + ")");

  xScale = d3.scaleLinear()
  .domain([65,95])
  .range([ 0, width]);
  
  svg
  .append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(xScale))
  .append("text")
  .attr("class", "axis-label")
  .attr("front-size", "15px")
  .attr("x", "50%")
  .attr("dy", "5em")
  .attr("style", "fill: black")
  .text("Forecasting life expectancy, years");


  yScale = d3.scaleBand()
  .range([ 0, height])
  .domain(state.data.map(d => d.Country))
  .padding(1);
  
  svg
  .append("g")
  .call(d3.axisLeft(yScale))
  

  var tooltip = d3.select("#d3-container-4")
    .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "lightgrey")
      .style("border-radius", "1px")
      .style("width", "260px")
      .style("height", "70px")
      .style("padding", "5px")
      .style("color", "black")

  var showTooltip = function(d) {
    tooltip
      .style("opacity", 1)
      .html("<strong>Country: </strong>" + d.Country + 
      "<br/>"+ "<strong>Life Expectancy in  2019: </strong>" + formatRound(d.LE2019) + 
      "<br/>" + "<strong>Life expectancy by 2050: </strong>"+ formatRound(d.LE2050) +
      "<br/>" + "<strong>Life expectancy by 2070: </strong>"+ formatRound(d.LE2070))
      .style("left", (d3.event.pageX) + "px")		
      .style("top", (d3.event.pageY - 28) + "px");
  }
  var moveTooltip = function(d) {
    tooltip
    .transition()
    .duration(500)
    .style('opacity', 0)
  }
  var hideTooltip = function(d) {
    tooltip
      .transition()
      .duration(500)
      .style("opacity", 0)
  }
        
  // Lines 1 between circles
  svg.selectAll("myline")
    .data(state.data)
    .enter()
    .append("line")
      .attr("x1", d => xScale(d.LE2019))
      .attr("x2", d => xScale(d.LE2050))
      .attr("y1", d => yScale(d.Country))
      .attr("y2", d => yScale(d.Country))
      .attr("stroke", "grey")
      .attr("stroke-width", "1px")

   // Lines 2 between circles
  svg.selectAll("myline")
  .data(state.data)
  .enter()
  .append("line")
    .attr("x1", d => xScale(d.LE2050))
    .attr("x2", d => xScale(d.LE2070))
    .attr("y1", d => yScale(d.Country))
    .attr("y2", d => yScale(d.Country))
    .attr("stroke", "grey")
    .attr("stroke-width", "1px")

  // Circles of variable 2019
  svg.selectAll("mycircle")
    .data(state.data)
    .enter()
    .append("circle")
      .attr("cx", d => xScale(d.LE2019))
      .attr("cy", d => yScale(d.Country))
      .attr("r", "6")
      .style("fill", "#69b3a2")
    .on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )


  // Circles of variable 2050
  svg.selectAll("mycircle")
    .data(state.data)
    .enter()
    .append("circle")
      .attr("cx", d => xScale(d.LE2050))
      .attr("cy", d => yScale(d.Country))
      .attr("r", "6")
      .style("fill", "#4C4082")
    .on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )


  // Circles of variable 2070
  svg.selectAll("mycircle")
    .data(state.data)
    .enter()
    .append("circle")
      .attr("cx", d => xScale(d.LE2070))
      .attr("cy", d => yScale(d.Country))
      .attr("r", "6")
      .style("fill", "#731B11")
    .on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )


  // Add one dot in the legend for each name.
  var size = 20
  var allgroups = ["2019", "2050", "2070"]
  
  svg.selectAll("myrect")
    .data(allgroups)
    .enter()
    .append("circle")
      .attr("cx", 800)
      .attr("cy", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("r", 7)
      .style("fill", d => {
        if (d === "2019") return "#69b3a2";
        else if (d === "2050") return "#4C4082";
        else return "#731B11"})
   
// Add labels beside legend dots
svg.selectAll("mylabels")
.data(allgroups)
.enter()
.append("text")
  .attr("x", 800 + size*.8)
  .attr("y", function(d,i){ return i * (size + 5) + (size/2)})
  .style("fill", "black")
  .text(function(d){ return d})
  .attr("text-anchor", "left")
  .style("alignment-baseline", "middle")

  draw(); 
}
function draw() {
}

}