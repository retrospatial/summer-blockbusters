// set the dimensions and margins of the graph
var margin = { top: 80, right: 25, bottom: 30, left: 40 },
  width = 750 - margin.left - margin.right,
  height = 750 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Read the data
d3.csv(
  "https://raw.githubusercontent.com/retrospatial/stuff/main/seasons_totals_tidy.csv",
  function (data) {
    // Extract unique years and seasons
    var myYears = d3
      .map(data, function (d) {
        return d.year;
      })
      .keys();
    var mySeasons = d3
      .map(data, function (d) {
        return d.season;
      })
      .keys();

    // Determine the top_season for each year
    var topSeasons = [];
    myYears.forEach(function (year) {
      var yearData = data.filter(function (d) {
        return d.year === year;
      });
      var maxCount = d3.max(yearData, function (d) {
        return +d.count;
      });
      var topSeason = yearData.find(function (d) {
        return +d.count === maxCount;
      }).season;
      topSeasons.push({ year: year, top_season: topSeason });
    });

    // Merge the top_season information into the original data
    data.forEach(function (d) {
      var yearTopSeason = topSeasons.find(function (ts) {
        return ts.year === d.year;
      });
      d.top_season = yearTopSeason ? yearTopSeason.top_season : "";
    });

    // Build X scales and axis:
    // FORMAT THE TITLES -> select text element, then .style
    var x = d3.scaleBand().range([0, width]).domain(mySeasons).padding(0.05);
    svg
      .append("g")
      .style("font-size", 15)
      .attr("transform", "translate(0, 0)")
      .call(d3.axisTop(x).tickSize(0))
      .select(".domain")
      .remove();

    // Rotate x-axis text diagonally
    // svg
    //     .selectAll(".tick text")
    //     .attr("transform", "rotate(-45)")
    //     .style("text-anchor", "end");

    // Build Y scales and axis:
    var y = d3
      .scaleBand()
      .range([height, 0])
      .domain(myYears.reverse()) // Reverse the domain to flip the y-axis
      .padding(0.05);

    // Build color scale with 5 discrete colors based on count value
    var myColor = d3
      .scaleQuantile()
      .domain(
        data.map(function (d) {
          return +d.count;
        })
      )
      .range(d3.schemePurples[5]);

    // Create a tooltip
    const tooltip = d3
      .select("#my_dataviz")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Add the squares
    svg
      .selectAll("rect")
      .data(data, function (d) {
        return d.season + ":" + d.year;
      })
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x(d.season);
      })
      .attr("y", function (d) {
        return y(d.year);
      })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function (d) {
        return myColor(d.count);
      })
      .style("stroke-width", 2)
      .style("stroke", "black")
      .style("opacity", 0.8)
      .on("mouseover", mouseover)
      // .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);

    function mouseover(d) {
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip
        .html( `<div style=" border-bottom: 8px groove #1c87c9;">Number of movies: + ${d.count}</div><div>${d.year}</div>`)
        .style("left", d3.event.layerX + 10 + "px")
        .style("top", d3.event.layerY - 28 + "px");
    }

    // Function to move tooltip with mouse movement
    function mousemove(d) {
      tooltip
        .style("left", d3.event.layerX + 10 + "px")
        .style("top", d3.event.layerY - 28 + "px");
    }

    // Function to hide tooltip on mouseleave
    function mouseleave(d) {
      tooltip.transition().duration(500).style("opacity", 0);
    }
  }
);

// Add title to graph
svg
  .append("text")
  .attr("x", 0)
  .attr("y", -50)
  .attr("text-anchor", "left")
  .style("font-size", "22px")
  .text("A d3.js heatmap");

// Add subtitle to graph
svg
  .append("text")
  .attr("x", 0)
  .attr("y", -20)
  .attr("text-anchor", "left")
  .style("font-size", "14px")
  .style("fill", "grey")
  .style("max-width", 400)
  .text("A short description of the take-away message of this chart.");

// Create the legend
var legendSvg = d3
  .select("#legend")
  .append("svg")
  .attr("width", 200)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(0," + margin.top + ")");

// Build color scale for the legend
var legendColor = d3
  .scaleOrdinal()
  .domain(["1st", "2nd", "3rd", "4th", "5th"])
  .range(d3.schemePurples[5]);

// Add color scale rectangles to the legend
var legendRect = legendSvg
  .selectAll("legendRect")
  .data(["1st", "2nd", "3rd", "4th", "5th"])
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("y", function (d, i) {
    return i * 30;
  })
  .attr("width", 20)
  .attr("height", 20)
  .style("fill", function (d) {
    return legendColor(d);
  });

// Add labels to the legend
var legendLabels = legendSvg
  .selectAll("legendLabels")
  .data(["least movies", "", "", "", "most movies"])
  .enter()
  .append("text")
  .attr("x", 30)
  .attr("y", function (d, i) {
    return i * 30 + 15;
  })
  .style("font-size", "12px")
  .text(function (d) {
    return d;
  });