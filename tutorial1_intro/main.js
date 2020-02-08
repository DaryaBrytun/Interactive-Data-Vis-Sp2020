// load in csv
d3.csv("../data/world-happiness-report-2019.csv").then(data => {
    // once the data loads, console log it
    console.log("data", data);
  
    // select the `table` container in the HTML
    const table = d3.select("#d3-table");
  
    /** HEADER */
    const thead = table.append("thead");
    thead
      .append("tr")
      .append("th")
      .attr("colspan", "20")
      .text("Happiness scored according to economic production, social support, etc.");
  
    thead
      .append("tr")
      .selectAll("th")
      .data(data.columns)
      .join("td")
      .text(d => d);
  
    /** BODY */
    // rows
    const rows = table
      .append("tbody")
      .selectAll("tr")
      .data(data)
      .join("tr");
  
    // cells
    rows
      .selectAll("td")
      .data(d => Object.values(d))
      .join("td")
      // update the below logic to apply to your dataset
      .attr("class", d => +d <10 ? 'high' : null)
      .text(d => d);
   

  });
  