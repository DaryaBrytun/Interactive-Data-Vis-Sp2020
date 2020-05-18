export function chart3() {
  const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.55,
  margin = {top: 50, bottom: 30, left: 50, right: 20};
 
  var formatdol = d3.format("$,")
  let svg;
  let xScale;
  let yScale;
  let yAxis;

let state = {
  data: [],
  };

Promise.all([
  d3.csv("./data/LifeExpTop.csv", d => ({
Country: d.Country,
Region: d.Region,
LifeExp: +d.LifeExp,
GDP: +d.GDP,
HealthExpend: +d.HealthExpend,
}))]).then(([data]) => {
state.data = data;
console.log("state: ", state);
init();
});

function init() {

xScale = d3.scaleBand()
      .domain(state.data.map(d => d.Country))
      .range([margin.left, width- margin.left - margin.right])
      .padding(0.1);
  
yScale = d3.scaleLinear()
      .domain([0, d3.max(state.data, d => d.HealthExpend)])
      .range([height - margin.top - margin.bottom, margin.top])

yAxis = d3.axisLeft(yScale);

const logScale = d3
.scaleSymlog() 
.domain(d3.extent(state.data, d => d.HealthExpend))
.range([0.1, 0.4]); 

const colorScale = d3.scaleSequential(d => d3.interpolatePuBuGn(logScale(d)));

svg = d3.select("#d3-container-3")
          .append("svg")
          .attr("width", width)
          .attr("height", height);
          
          svg.append("g")
          .attr("class", "axis y-axis")
          .attr("transform","translate(" + margin.left + ",0)")
          .call(yAxis)
          .append("text")
          .attr("y", "50%")
          .attr("dx", "-3em")
          .attr("writing-mode", "vertical-rl")
          .text("Birth rate");

        
  svg.selectAll("rect")
      .data(state.data)
      .enter()
          .append("rect")
           .attr("class","bar")
           .on("mouseover",function(){
            d3.select(this)
              .attr("fill","red")
          }) 				
          .on("mouseout",function(){
            d3.select(this)
              .transition("colorfade")
              .duration(250)
              .attr("fill",d=> colorScale(d.HealthExpend))})
  
          .attr("fill",d=> colorScale(d.HealthExpend))
              
          .attr("x", function(d,i){
             return xScale(d.Country);
          })
          .attr("width", xScale.bandwidth())    
          .attr("y", height- margin.top - margin.bottom)   				
          
          .transition("bars")
          .delay(function(d, i) {
            return i * 50;
          })
          .duration(1000)
  
           .attr("y", d=> yScale(d.HealthExpend))   				
          .attr("height", function(d,i){
            return height- margin.top - margin.bottom- yScale(d.HealthExpend);
          })  
              

 svg.selectAll("rect") 			
          .append("title")
           .text(function(d) {
             return d.Country + ": " + formatdol(d.HealthExpend);
           })
 


  svg.selectAll(".val-label")
      .data(state.data)
      .enter()
      .append("text")
      .classed("val-label", true)
      .attr("x", function(d,i){
      return xScale(d.Country) + xScale.bandwidth()/2;
    })
          .attr("y", height- margin.top - margin.bottom)   				
          .transition("label")
          .delay(function(d, i) {
            return i * 50;  
          })
          .duration(1000)
  
           .attr("y", function(d,i){
              return yScale(d.HealthExpend) - 4;
          })
          .attr("text-anchor","middle")
          .text(d=> formatdol(d.HealthExpend));

  svg.selectAll(".bar-label")
          .data(state.data)
          .enter()
          .append("text")
          .classed("bar-label", true)
  
          .attr("transform",function(d,i){
            return "translate(" + (xScale(d.Country) + xScale.bandwidth()/2 - 20) + "," + (height - 75) + ")" 
              + " rotate(45)" })
           
          .attr("text-anchor","left")
          .text(d => d.Country)
          
          d3.select("#byValue1").on("click", function() {
            state.data.sort(function(a, b) {
              return d3.descending(a.HealthExpend, b.HealthExpend)
            })
            xScale.domain(state.data.map(d =>d.Country));
            svg.selectAll(".bar")
              .transition()
              .duration(500)
              .attr("x", function(d, i) {
                return xScale(d.Country);
              })
          
            svg.selectAll(".val-label")
              .transition()
              .duration(500)
              .attr("x", function(d, i) {
                return xScale(d.Country) + xScale.bandwidth() / 2;
              })
          
            svg.selectAll(".bar-label")
              .transition()
              .duration(500)
              .attr("transform", function(d, i) {
                return "translate(" + (xScale(d.Country) + xScale.bandwidth() / 2 - 20) + "," + (height -75) + ")" + " rotate(45)"
              })
          })
                    
  
  d3.select("#byCountry1").on("click", function() {
state.data.sort(function(a, b) {
  return d3.ascending(a.Country, b.Country)
})
xScale.domain(state.data.map(d=> d.Country));
svg.selectAll(".bar")
  .transition()
  .duration(500)
  .attr("x", function(d, i) {
    return xScale(d.Country);
  })

svg.selectAll(".val-label")
  .transition()
  .duration(500)
  .attr("x", function(d, i) {
    return xScale(d.Country) + xScale.bandwidth() / 2;
  })

svg.selectAll(".bar-label")
  .transition()
  .duration(500)
  .attr("transform", function(d, i) {
    return "translate(" + (xScale(d.Country) + xScale.bandwidth() / 2 - 20) + "," + (height-75) + ")" + " rotate(45)"
  })})
  draw(); 
}
function draw() {
}
}
