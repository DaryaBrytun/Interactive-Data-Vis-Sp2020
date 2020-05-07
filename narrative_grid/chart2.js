export function chart2() {
  const width = window.innerWidth * 0.3,
  height = window.innerHeight * 0.3,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 3,
  default_selection = "Select a Country";


let svg;
let xScale;
let y1Scale;
let y2Scale;
let y1Axis;
let tooltip;
let legend;

// const formatBillions = (num) => d3.format(".2s")(num).replace(/G/, 'B')


let state = {
  data: [],
  selectedCountry: null,
};


d3.csv("../../data/lifeExpGen.csv", d => ({
  year: new Date(d.Year),
  country: d.Country,
  ratio: +d.Ratio,
  female: +d.Female,
  male: +d.Male,
})).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

function init() {

  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.data, d => d.year))
    .range([margin.left, width - margin.right]);

  y1Scale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, d => d.female)])
    .range([height - margin.bottom, margin.top]);

  y2Scale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, d => d.male)])
    .range([height - margin.bottom, margin.top]);

  const xAxis = d3.axisBottom(xScale);
  y1Axis = d3.axisLeft(y1Scale);
  // y2Axis = d3.axisRight(y2Scale);

 
  const selectElement = d3
  .select("#dropdown")
  .on("change", function() {
    console.log("new selected entity is", this.value);
    state.selectedCountry = this.value;
    draw(); 
  });


  selectElement
    .selectAll("option")
    .data([
      ...Array.from(new Set(state.data.map(d => d.country))),
      default_selection,
    ])
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  selectElement.property("value", default_selection);

  // svg = d3.
  // select("#legend")

  // // legend
  // svg
  // .append("circle")
  // .attr("cx",30)
  // .attr("cy",10)
  // .attr("r", 4)
  // .style("fill", "#69b3a2")

  // svg
  // .append("circle")
  // .attr("cx",30)
  // .attr("cy",20)
  // .attr("r", 4)
  // .style("fill", "#404080")
  
  // svg.append("text")
  // .attr("x", 35)
  // .attr("y", 10)
  // .text("Male")
  // .style("font-size", "12px")
  // .attr("alignment-baseline","middle")

  // svg
  // .append("text")
  // .attr("x", 35)
  // .attr("y", 20)
  // .text("Female")
  // .style("font-size", "12px")
  // .attr("alignment-baseline","middle")
  

// // TOOLTIP
// div = d3
// .select('body')
// .append("div")
// .attr("class", "tooltip")
// .attr("width", 100)
// .attr("height", 100)
// .attr('style', 'position: absolute; opacity: 0;');

  svg = d3
    .select("#d3-container-2")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // add the xAxis
  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Year");

  // add the yAxis
  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(y1Axis)
    // .call(y2Axis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Life Expectancy");

  // svg
  //   .append("g")
  //   .attr("class", "axis y-axis")
  //   .attr("transform", `translate(${margin.left},0)`)
  //   // .style("fill", "red")
  //   .call(y2Axis)
  //   .append("text")
  //   .attr("class", "axis-label")
  //   .attr("y", "50%")
  //   .attr("dx", "-3em")
  //   .attr("writing-mode", "vertical-rl")
  //   .text("Population");

  draw(); 
}


function draw() {

  let filteredData;
  if (state.selectedCountry !== null) {
    filteredData = state.data.filter(d => d.country === state.selectedCountry);
  }


  y1Scale.domain([0, d3.max(filteredData, d => d.female)]);
  y2Scale.domain([0, d3.max(filteredData, d => d.male)]);

  d3.select("g.y-axis")
    .transition()
    .duration(1000)
    .call(y1Axis.scale(y1Scale))
    // .call(y2Axis.scale(y2Scale)); 

  // https://bl.ocks.org/d3noob/e34791a32a54e015f57d
  const lineFunc1 = d3
    .line()
    .x(d => xScale(d.year))
    .y(d => y1Scale(d.female));

  const lineFunc2 = d3
    .line()
    .x(d => xScale(d.year))
    .y(d => y2Scale(d.male));

  // const dot = svg
  //   .selectAll(".dot")
  //   .data(filteredData, d => d.year) // use `d.year` as the `key` to match between HTML and data elements
  //   .join(
  //     enter =>
  //       // enter selections -- all data elements that don't have a `.dot` element attached to them yet
  //       enter
  //         .append("circle")
  //         .attr("class", "dot") // Note: this is important so we can identify it in future updates
  //         .attr("r", radius)
  //         .attr("cy", height - margin.bottom) // initial value - to be transitioned
  //         .attr("cx", d => xScale(d.year))
  //         .on("mouseover", d => {
  //           div.transition()
  //           .duration(200)
  //           .style('opacity', 1)
  //           div.html("<strong>Country: </strong>" + d.country + 
  //               // "<br/>"+ "<strong>Year: </strong>" + d.year +
  //               "<br/>"+ "<strong>Female Life Expectancy: </strong>" + d.male + 
  //               // "<br/>" + "<strong>GDP per Capita: </strong>"+ formatIncome(d.Income) + 
  //               "<br/>" + "<strong>Male Life Expectancy: </strong>" + d.female)	
  //                   .style("left", (d3.event.pageX) + "px")		
  //                   .style("top", (d3.event.pageY - 28) + "px");	
  //               })	
  //        .on("mouseout", d => {
  //         div.transition()
  //         .duration(500)
  //         .style('opacity', 0)
  //        }),
  //       //  .call(enter =>
  //       //   enter
  //       //     .transition() 
  //       //     .delay(d => d.year) 
  //       //     .duration(300)
  //       //     .attr("r", d => d.female)
  //       //   ),
  //     update => update,
  //     exit =>
  //       exit.call(exit =>
  //         // exit selections -- all the `.dot` element that no longer match to HTML elements
  //         exit
  //           .transition()
  //           .delay(d => d.year)
  //           .duration(500)
  //           .attr("cy", height - margin.bottom)
  //           .remove()
  //       )
  //   )
  //   // the '.join()' function leaves us with the 'Enter' + 'Update' selections together.
  //   // Now we just need move them to the right place
  //   .call(
  //     selection =>
  //       selection
  //         .transition() // initialize transition
  //         .duration(1000) // duration 1000ms / 1s
  //         .attr("cy", d => y1Scale(d.female)) // started from the bottom, now we're here
  //   );


    
  const line1 = svg
    .selectAll("path.trend")
    .data([filteredData])
    .join(
      enter =>
        enter
          .append("path")
          .attr("class", "trend")
          // .style("fill", "#404080")
          .attr("opacity", 0), 
      update => update, 
      exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition() 
        .duration(1000)
        .attr("opacity", 1)
        .attr("d", d => lineFunc1(d))
    );
    const line2 = svg
    .selectAll("path.trend")
    .data([filteredData])
    .join(
      enter =>
        enter
          .append("path")
          .attr("class", "trend")
          // .style("fill", "#69b3a2")
          .attr("opacity", 0),
      update => update, 
      exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition() 
        .duration(1000)
        .attr("opacity", 1)
        .attr("d", d => lineFunc2(d)))
}
}