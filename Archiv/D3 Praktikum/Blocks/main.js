var data = [];
function randInt(lo, hi) {
  var value = Math.floor(Math.random() * hi) + lo;
  return value;
}
function fadein() {
  var elements = document.querySelectorAll(".block");
  i = 0;
  while (i < elements.length) {
    elements[i].style.width = "100px";
    elements[i].style.height = "100px";
    i += 1;
  }
}

function add() {
  data.push(data.length + 1);
  d3.select("#blocks")
    .append("img")
    .attr("class", "block")
    .attr("src", "Symbol_thumbs_up.svg.png");
  window.setTimeout(fadein(), 1000);
  console.log(data);
}
function remove() {
  data.pop();
  d3.selectAll(".block")
    .data(data)
    .exit()
    .remove();
  console.log(data);
}

function die() {
  d3.selectAll(".block").remove();
  console.log(data);
}
function revive() {
  d3.selectAll(".block")
    .data(data)
    .enter()
    .select("#blocks")
    .append("img")
    .attr("class", "block")
    .attr("src", "Symbol_thumbs_up.svg.png");
  fadein;
  console.log(data);
}
function changeColor() {
  var elements = document.querySelectorAll(".block");
  i = 0;
  j = 0;

  while (i < elements.length) {
    elements[i].style.backgroundColor =
      "rgb(" +
      randInt(0, 255) +
      "," +
      randInt(0, 255) +
      "," +
      randInt(0, 255) +
      ")";
    i += 1;
  }
}
function changeRot() {
  var elements = document.querySelectorAll(".block");
  i = 0;
  while (i < elements.length) {
    elements[i].style.transform = "rotate(" + randInt(0, 399) + "grad)";
    i += 1;
  }
}
//d3.selectAll(".example").data(data).enter()
