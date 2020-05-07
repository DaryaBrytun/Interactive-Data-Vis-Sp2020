export function chart1() {

  const width = window.innerWidth * 0.4,
  height = window.innerHeight * 0.4,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;


// tooltip = d3
// .select('body')
// .append("div")
// .attr("class", "#tooltip")
// .attr("width", 100)
// .attr("height", 100)
// .attr('style', 'position: absolute; opacity: 0;');


let state = {
  geojson: null,
  life: null,
};


Promise.all([
  d3.json("../../data/world.json"),
  d3.csv("../../data/life10.csv", d => ({
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

  const projection = d3
  .geoMercator()
  .fitSize([width, height], state.geojson);

  const path = d3
  .geoPath()
  .projection(projection);
  
  const lifeLookup = new Map(state.life.map(d => [d.Country, d.LifeExp]))

  const colorScale = d3.scaleSequential(d3.interpolateViridis)
  .domain(d3.extent(state.life.map(d => d['LifeExp'])))


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
    .attr("fill", d => {
      const stateName = d.properties.name
      const statelife = lifeLookup.get(stateName)
      return colorScale(statelife)
    })
    .attr("opacity", 0.8)
    .on('mouseover', d => {
      tooltip
      .transition()
      .duration(200)
      .style('opacity', 1)
      tooltip
      .html("<strong>Country: </strong>" + d.properties.name + 
          "<br/>"+ "<strong>Life Expectancy: </strong>" + d['LifeExp'])
              .style("left", (d3.event.pageX) + "px")		
              .style("top", (d3.event.pageY - 30) + "px");	
          })	
    .on('mouseout', d => {
      tooltip
      .style('opacity', 0)
    })
    .on('mousemove', d => { 
      d3.select('#tooltip')
      .style('left', (d3.event.pageX + 15) + 'px')
      .style('top', (d3.event.pageY + 15) + 'px')
    })
    .on("mouseout", function(d, i) { d3
      .select(this)
      .attr("opacity", 0.8)
    }) 
};
  function draw() {



  }
}
