export function chart1() {

  const width = window.innerWidth * 0.55,
  height = window.innerHeight * 0.6,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;


let state = {
  geojson: null,
  life: null,
};


Promise.all([
  d3.json("./data/world.json"),
  d3.csv("./data/life10.csv", d => ({
    Year: d.Year,
    Country: d.Country,
    LifeExp: +d.LifeExp,
    Male: +d.Male,
    Female: +d.Female,
    Population: +d.Population,
  })), 
]).then(([geojson, life]) => {
  state.geojson = geojson;
  state.life = life;
  console.log("state: ", state);
  init();
});


function init() {

  tooltip = d3
.select('#tooltip')
.classed("tooltip", true)
.attr("width", 100)
.attr("height", 100)
.attr('style', 'position: absolute; opacity: 0;');

  const projection = d3
  .geoMercator()
  .fitSize([width, height], state.geojson);

  const path = d3
  .geoPath()
  .projection(projection);
  
  const lifeLookup = new Map(state.life.map(d => [d.Country, d.LifeExp]))

  const colorScale = d3.scaleSequential(d3.interpolateViridis)
  .domain(d3.extent(state.life.map(d => d['LifeExp'])))
  
 
 
 
 
  var svgLegend = d3
  .select("#my_legend")
  .append("svg")
  .attr("width",  width/3)
  .attr("height", height/3);

svgLegend.append("circle").attr("cx",20).attr("cy",20).attr("r", 6).style("fill", "#682860")
svgLegend.append("circle").attr("cx",20).attr("cy",35).attr("r", 6).style("fill", "#49796b")
svgLegend.append("circle").attr("cx",20).attr("cy",50).attr("r", 6).style("fill", "#00a591")
svgLegend.append("circle").attr("cx",150).attr("cy",20).attr("r", 6).style("fill", "#00ad43")
svgLegend.append("circle").attr("cx",150).attr("cy",35).attr("r", 6).style("fill", "#9dea4f")
svgLegend.append("circle").attr("cx",150).attr("cy",50).attr("r", 6).style("fill", "#faf20a")
svgLegend.append("text").attr("x", 30).attr("y", 20).text("> 60 years").style("font-size", "15px").attr("alignment-baseline","middle")
svgLegend.append("text").attr("x", 30).attr("y", 35).text("60 - 65 years").style("font-size", "15px").attr("alignment-baseline","middle")
svgLegend.append("text").attr("x", 30).attr("y", 50).text("65 - 70 years").style("font-size", "15px").attr("alignment-baseline","middle")
svgLegend.append("text").attr("x", 160).attr("y", 20).text("70 - 75 years").style("font-size", "15px").attr("alignment-baseline","middle")
svgLegend.append("text").attr("x", 160).attr("y", 35).text("75 - 80 years").style("font-size", "15px").attr("alignment-baseline","middle")
svgLegend.append("text").attr("x", 160).attr("y", 50).text("< 80 years").style("font-size", "15px").attr("alignment-baseline","middle")



  svg = d3
    .select("#d3-container-1")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  svg
    .selectAll(".country")
    .data(state.geojson.features)
    .join("path")
    .attr("d", path)
    .attr("class", "country")
    .style("stroke", "#fff")
  	.style("stroke-width", "0.3")
    .attr("fill", d => {
      const stateName = d.properties.name
      const statelife = lifeLookup.get(stateName)
      return colorScale(statelife)
    })
    .attr("opacity", 1.0)
    .on('mouseover', d => {
      d3.select(this)
      tooltip
      .transition()
      .duration(200)
      .style("cursor", "pointer")
      .style('opacity', 0.8)
      tooltip
      .html("<strong>Country: </strong>" + d.properties.name)
              .style("left", (d3.event.pageX) + "px")		
              .style("top", (d3.event.pageY - 30) + "px");	
          })	
    .on('mouseout', d => {
      d3.select(this)
      tooltip
      .style('opacity', 0.0)
    })
    .on('mousemove', d => { 
      d3.select('#tooltip')
      .style('opacity', 1.0)
      .style('left', (d3.event.pageX + 15) + 'px')
      .style('top', (d3.event.pageY + 15) + 'px')
    });

    draw();
};
  function draw() {



  }
}
