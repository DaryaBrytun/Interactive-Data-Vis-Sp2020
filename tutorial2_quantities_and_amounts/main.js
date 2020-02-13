// data load
// reference for d3.autotype: https://github.com/d3/d3-dsv#autoType
d3.csv("../data/squirrelActivities.csv", d3.autoType).then(data => {
  console.log(data);

  /** CONSTANTS */
  // constants help us reference the same values throughout our code
  const width = window.innerWidth * 0.9,
    height = window.innerHeight / 3,
    paddingInner = 0.1,
    margin = { top: 20, bottom: 40, left: 03, right: 40 };

  /** SCALES */
  // reference for d3.scales: https://github.com/d3/d3-scale
  const yScale = d3
    .scaleBand()
    .domain(data.map(d => d.activity))
    .range([height - margin.bottom, margin.top])
    .paddingInner(paddingInner);

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .range([margin.left, width - margin.right]);

  var color = d3
    .scaleOrdinal()
    .domain(data.map(d => d.activity))
    .range(d3.schemeSet1);


  // // reference for d3.axis: https://github.com/d3/d3-axis
  const xAxis = d3.axisBottom(xScale).ticks(data.length);
  const yAxis = d3.axisRight(yScale).ticks(data.length);

  /** MAIN CODE */
  const svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // append rects
  const rect = svg
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("y", d => yScale(d.activity))
    .attr("x", 0)
    .attr("width", d =>  xScale(d.count))
    .attr("height", yScale.bandwidth())
    .attr("fill", function(d, i) { return color(i); });

  // append text
  const text = svg
    .selectAll("text")
    .data(data)
    .join("text")
    .attr("class", "label")
    // this allows us to position the text in the center of the bar
    .attr("x", d => xScale(d.count) + (yScale.bandwidth() / 2))
    .attr("y", d => yScale(d.activity))
    .text(d => d.count)
    .attr("dy", "1.8em");

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);
    svg
    .append("g")
    .attr("class", "axis")
    .call(yAxis);


});