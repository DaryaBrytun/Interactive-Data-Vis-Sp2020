/**
 * CONSTANTS AND GLOBALS
 * */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;

/**
 * APPLICATION STATE
 * */
let state = {
  data: null,
  hover: null,
  mousePosition: null,
};

/**
 * LOAD DATA
 * */
d3.json("../data/flare.json", d3.autotype).then(data => {
  state.data = data;
  console.log(state.data)
  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
  const container = d3.select("#d3-container").style("position", "relative");
  const colorScale = d3.scaleOrdinal(d3.schemeSet3);

  tooltip = container
    .append("div")
    .attr("class", "tooltip")
    .attr("width", 100)
    .attr("height", 100)
    .style("position", "absolute");

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);



  // make hierarchy
  const root = d3
    .hierarchy(state.data) // children accessor
    .sum(d => d.value) // sets the 'value' of each level
    .sort((a, b) => b.value - a.value);

  // make treemap layout generator
  const pack = d3
    .pack()
    .size([width -2, height-2])
    .padding(4);

  // call our generator on our root hierarchy node
  pack(root); // creates our coordinates and dimensions based on the heirarchy and tiling algorithm

  // create g for each leaf
  const leaf = svg
    .selectAll("g")
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x +1},${d.y + 1})`);

  leaf
    .append("circle")
    .attr("class", "nodeCircle")
    .attr("fill", d => {
      const level1Ancestor = d.ancestors().find(d => d.depth === 1);
      return colorScale(level1Ancestor.data.name);
    })
    .attr("r", d => d.r)
    .on("mouseover", d => {
      state.hover = {
        translate: [
          d.x,
          d.y,
        ],
        name: d.data.name,
        value: d.data.value,
        title: `${d
          .ancestors()
          .reverse()
          .map(d => d.data.name)
          .join("/")}`,
      };
      draw();
    });

  draw(); // calls the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  if (state.hover) {
    tooltip
      .html(
        `
        <div>Name: ${state.hover.name}</div>
        <div>Value: ${state.hover.value}</div>
        <div>Hierarchy Path: ${state.hover.title}</div>
      `
      )
      .transition()
      .duration(500)
      .style(
        "transform",
        `translate(${state.hover.translate[0]}px,${state.hover.translate[1]}px)`
      );
  }
}
