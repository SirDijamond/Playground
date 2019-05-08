var gods_json = {
  name: "Odin",
  displayed: true,
  children: [
    {
      name: "Thor",
      displayed: true,
      children: [
        { name: "Magni", displayed: true, children: null },
        { name: "Modi", displayed: true, children: null },
        { name: "Thrud", displayed: true, children: null }
      ]
    },
    {
      name: "Balder",
      displayed: true,
      children: [{ name: "Forseti", displayed: true, children: null }]
    },
    { name: "Hödur", displayed: true, children: null },
    { name: "Hermodr", displayed: true, children: null },
    { name: "Bragi", displayed: true, children: null },
    { name: "Tyr", displayed: true, children: null },
    { name: "Vidar", displayed: true, children: null }
  ]
};

var margin = {
  left: 50,
  top: 50,
  bottom: 0,
  right: 0
};

var height = 800,
  width = 800;

var svg = d3
  .select("#svg-container")
  .append("svg")
  .attr("height", height)
  .attr("width", width)
  .attr("class", "cool_svg");

var graph = d3
  .select(".cool_svg")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .attr("class", "group");
var Baumi = d3.tree().size([width - 100, height - 100]);
var nodes = Baumi(d3.hierarchy(gods_json));

var line = graph
  .selectAll(".line")
  .data(nodes.descendants().slice(1))
  .enter()
  .append("path")
  .attr("class", "line")
  .attr("d", function(node) {
    var half = (node.parent.y + node.y) / 2;
    var k = 0.9;
    var path =
      "M " +
      node.x +
      "," +
      node.y +
      " C " +
      node.x +
      "," +
      half +
      " " +
      node.parent.x +
      "," +
      half +
      " " +
      node.parent.x +
      "," +
      node.parent.y;

    return path;
  });

var circles = graph
  .selectAll(".circle")
  .data(nodes.descendants())
  .enter()
  .append("circle")
  .attr("class", "circle")
  .attr("cx", function(node) {
    return node.x;
  })
  .attr("cy", function(node) {
    return node.y;
  })
  .attr("r", "12px")
  .on("click", test);

add_text();

function add_text() {
  var text = graph
    .selectAll(".god_text")
    .data(nodes.descendants())
    .enter()
    .append("text")
    .attr("class", function(node) {
      if (node.data.children == null) {
        return "god_text_without_children";
      } else {
        return "god_text_with_children";
      }
    })
    .attr("x", function(node) {
      return node.x;
    })
    .attr("y", function(node) {
      return node.y + 30;
    })
    .attr("text-anchor", "middle")
    .text(function(node) {
      return node.data.name;
    });
  console.log();
}

/* function test_old(d) {
  var ida = id_json[d.x + "," + d.y];
  console.log(ida[1]);
  if (ida[1]) {
    console.log("Hi");
    id_json[d.x + "," + d.y] = [ida[0], false];
    var opacity_value = 0;
  } else {
    console.log("Ho");
    var opacity_value = 1;
    id_json[d.x + "," + d.y] = [ida[0], true];
  }
  d3.selectAll("text#" + ida[0]).attr("fill-opacity", opacity_value);
} */
function test(d) {
  if (d.data.displayed) {
    d.data.displayed = false;
    var name = d.data.name;
    var texts = d3.selectAll("text");
    var texts = texts._groups[0];

    texts.forEach(text => {
      if (text.innerHTML == name) {
        text.remove();
      }
    });
  } else {
    d.data.displayed = true;
    add_text();
  }
}
