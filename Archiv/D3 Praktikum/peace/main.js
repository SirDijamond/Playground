function addsvg(
  height,
  width,
  margin_left,
  margin_top,
  margin_bottom,
  margin_right,
  g_tag
) {
  d3.select("#svgs")
    .append("svg")
    .attr("height", height)
    .attr("width", width)
    .attr(
      "style",
      "margin-top:" +
        margin_top +
        ";margin-left:" +
        margin_left +
        ";margin-bottom:" +
        margin_bottom +
        ";margin-right:" +
        margin_right
    )
    .attr("class", "cool_svg");
  if (g_tag) {
    d3.select(".cool_svg")
      .append("g")
      .attr(
        "style",
        "margin-top:" +
          margin_top +
          ";margin-left:" +
          margin_left +
          ";margin-bottom:" +
          margin_bottom +
          ";margin-right:" +
          margin_right
      )
      .attr("class", "group");
    var graph = d3.select(".group");
    graph
      .append("circle")
      .attr("cx", "400")
      .attr("cy", "400")
      .attr("r", "390");
    graph
      .append("path")
      .attr("d", "M 400,10 400,790")
      .attr("class", "line");
    graph
      .append("path")
      .attr("class", "line")
      .attr("d", "M 400,400 677,677");
    graph
      .append("path")
      .attr("class", "line")
      .attr("d", "M 400,400 123,677");
  }
  console.log(baumi);
}
addsvg(800, 800, "50px", "50px", "0px", "0px", true);
