// SVG erstellen
var body = document.body,
  html = document.documentElement;

var height =
  Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  ) - 110;
var width = Math.max(html.clientWidth, html.offsetWidth, body.offsetWidth) - 25;

var svg = d3
    .select("svg")
    .attr("height", height)
    .attr("width", width),
  width = svg.attr("width");
var linkMap = new Map();
// Simulation erstellen
var simulation = d3
  .forceSimulation()
  .force(
    "link",
    d3
      .forceLink()
      .distance(100)
      .strength(0.25)
  )
  .force(
    "charge",
    d3
      .forceManyBody()
      .distanceMax(200)
      .distanceMin(150)
      .strength(-0.4 * height)
  )
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collide", d3.forceCollide().radius(25));

// Daten importieren
d3.json("europa1.json", function(error, graph) {
  if (error) throw error;
  var nodes = graph.nodes;
  var nodeMap = d3.map(nodes, function(d) {
    return d.name;
  });
  var bilateral_links = graph.links;

  var link = svg
    .selectAll(".link")
    .data(filter_Links(bilateral_links, nodeMap))
    .enter()
    .append("path")
    .attr("class", "link");
  link.filter();

  var gNodes = svg
    .selectAll(".node")
    .data(
      nodes.filter(function(d) {
        return d.name;
      })
    )
    .enter()
    .append("g")
    .attr("class", "node")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    )
    .on("end", handleMouseOver)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("contextmenu", function(d, i) {
      d3.event.preventDefault();
      create_dropdown(d, i);
    });
  gNodes
    .append("circle")
    .attr("r", 5)
    .attr("cursor", "pointer");

  gNodes
    .append("text")
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.name;
    })
    .attr("cursor", "pointer")
    .attr("y", "15");

  gNodes.each(function(d) {
    color = [];
    for (let i = 0; i < 3; i++) {
      color.push(randInt(10, 100));
    }
    d3.select(this)
      .select("circle")
      .style("stroke", `rgb(${color[0]},${color[1]},${color[2]})`);
    d3.select(this)
      .select("text")
      .style("fill", `rgb(${color[0]},${color[1]},${color[2]})`);
  });

  // Ersetze Text durch echte Knoten
  bilateral_links.forEach(function(link) {
    link.source = nodeMap.get(link.source);
    link.target = nodeMap.get(link.target);
  });

  simulation.nodes(nodes).on("tick", ticked);
  simulation.force("link").links(bilateral_links);
  generate_Info(graph);

  // Neues Positionieren der Nodes und bilateral_links bei Veränderung
  function ticked() {
    link.attr("d", function(d) {
      return `M ${d[0].x},${d[0].y} L ${d[1].x},${d[1].y}`;
    });
    gNodes.attr("transform", function(d) {
      return `translate(${d.x},${d.y})`;
    });
  }

  function set_attached_objects(d) {
    attached_objects = [d.name];
    bilateral_links.forEach(function(link, i) {
      if (d.name == link.source.name) {
        attached_objects.push(link.target.name);
      }
    });
    return attached_objects;
  }

  function handleMouseOver(d) {
    // alle Nachbarländer suchen
    attached_objects = set_attached_objects(d);
    // Transparenz der nicht zugehörigen Knoten erhöhen
    gNodes._groups[0].forEach(group => {
      if (!attached_objects.includes(group.__data__.name)) {
        d3.select(group)
          .transition()
          .duration(1000)
          .style("opacity", 0.15);
      }
    });
    // Zugehörige bilateral_links filtern und rot einfärben
    link._groups[0].forEach(link => {
      if (
        (link.__data__[0].name == d.name &&
          attached_objects.includes(link.__data__[1].name)) ||
        (link.__data__[1].name == d.name &&
          attached_objects.includes(link.__data__[0].name))
      ) {
        d3.select(link)
          .transition()
          .duration(500)
          .style("stroke", "red");
      } else {
        // Transparenz der nicht zugehörigen bilateral_links erhöhen
        d3.select(link)
          .transition()
          .duration(500)
          .style("opacity", 0.1);
      }
    });
  }

  function handleMouseOut(d) {
    // Zurücksetzten der Hervorhebungen
    gNodes._groups[0].forEach(group => {
      d3.select(group)
        .transition()
        .duration(500)
        .style("opacity");
    });
    link._groups[0].forEach(link => {
      d3.select(link)
        .transition()
        .duration(500)
        .style("opacity", 1)
        .style("stroke", "rgba(132, 182, 206, 0.699)");
    });
  }
  // Menüfunktionen bei Rechtsklick auf Land
  function create_dropdown(d) {
    if (d.menu == null) {
      d.menu = d3
        .select("body")
        .append("select")
        .style("top", d.y)
        .style("left", d.x);
      d.menu._groups[0][0].innerHTML = `<option selected disabled>Aktion für ${
        d.name
      } auswählen</option>`;
      d.menu
        .append("option")
        .on("click", display_connections)
        .text("Verknüpfungen ausgeben");
      d.menu
        .append("option")
        .on("click", google_maps_search)
        .text("In Google Maps öffnen");
      d.menu.timeout = setTimeout(() => {
        d.menu.remove();
        d.menu = null;
      }, 10000);

      function display_connections() {
        attached_objects = set_attached_objects(d);
        // attached_objects sortieren
        attached_objects = [attached_objects[0]].concat(
          attached_objects.slice(1).sort()
        );
        // String generieren
        if (attached_objects.length > 1) {
          // Wenn es verknüpfte Knotenpunkte gibt
          if (attached_objects.length > 2) {
            // Wenn es mehr als einen verknüpften Knotenpunkt gibt
            var connections = "Die verknüpften Knotenpunkte sind ";
            if (attached_objects.length > 3) {
              // Wenn es mehr als zwei verknüpfte Knotenpunkte gibt
              attached_objects
                .slice(1, attached_objects.length - 2)
                .forEach(connection => {
                  connections += connection + ", ";
                });
            }
            connections +=
              attached_objects[attached_objects.length - 2] +
              " und " +
              attached_objects[attached_objects.length - 1];
          } else {
            // Wird ausgeführt, wenn es nur zwei verknüpfte Knotenpunkte gibt
            connections = `Der einzige verknüpfte Knotenpunkt ist ${
              attached_objects[1]
            }.`;
          }
          alert(
            `Sie befinden sich auf dem Knotenpunkt ${
              attached_objects[0]
            }. ${connections}.`
          );
        } else {
          // Wird ausgeführt, wenn es keinen verknüpften Knotenpunkt gibt
          alert(
            `Sie befinden sich auf dem Knotenpunkt ${
              attached_objects[0]
            }. Es gibt keine verknüpften Knotenpunkte.`
          );
        }
        clearTimeout(d.menu.timeout);
        d.menu.remove();
        d.menu = null;
      }

      function google_maps_search() {
        window.open(
          `https://www.google.com/maps/place/${encodeURIComponent(d.id)}`,
          "_blank"
        );
      }
    }
  }
});

/*****************************Functions*******************************/
function filter_Links(bilateral_links, nodeMap) {
  unilateral_links = [];

  bilateral_links.forEach(link => {
    if (!linkMap.get(link.target) && !linkMap.get(link.source)) {
      // wenn kein Eintrag für target und kein Eintrag für source
      linkMap.set(link.source, [link.target]); // neuen Eintrag für source anlegen
    } else if (!linkMap.get(link.target) && linkMap.get(link.source)) {
      // wenn kein Eintrag für target, aber ein Eintrag für source
      linkMap.set(link.source, linkMap.get(link.source).concat(link.target)); // target an Eintrag für source hinzufügen
    } else if (
      !linkMap.get(link.target).includes(link.source) && // wenn Eintrag für target die source nicht enthält
      !linkMap.get(link.source) // und kein Eintrag für source
    ) {
      linkMap.set(link.source, [link.target]); // neuen Eintrag für source hinzufügen
    } else if (!linkMap.get(link.target).includes(link.source)) {
      // wenn Eintrag für target die source nicht enthält
      linkMap.set(link.source, linkMap.get(link.source).concat(link.target)); // target an Eintrag für source hinzufügen
    }
  });

  var keys = Array.from(linkMap.keys());
  keys.forEach(key => {
    var linkedCountryNames = linkMap.get(key);
    linkedCountryNames.forEach(countryName => {
      unilateral_links.push([nodeMap.get(key), nodeMap.get(countryName)]);
    });
  });
  return unilateral_links;
}

function dragstarted(d) {
  // wenn kein Drag-Event aktiv
  if (d3.event.active == 0) {
    // erlaube Knoten sich zu bewegen und starte neu
    simulation.alphaTarget(0.1).restart();
  }
}

function dragged(d) {
  // Position des Knotens fix setzen
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  // wenn kein Drag-Event aktiv
  if (d3.event.active == 0) {
    // erlaube Knoten nicht mehr sich zu bewegen
    simulation.alphaTarget(0);
  }
  // Position der Knoten freigegeben
  d.fx = null;
  d.fy = null;
}

function randInt(lo, hi) {
  var value = Math.floor(Math.random() * hi) + lo;
  return value;
}

// Zusatzinformationen aus dem JSON verarbeiten und darstellen
function generate_Info(graph) {
  var information_text = "";
  if (!graph.information.graphic_type)
    graph.information.graphic_type = "Untitled";
  if (graph.information.creator) {
    information_text += " by " + graph.information.creator;
  }
  if (graph.information.date) {
    information_text += " - " + graph.information.date;
  }
  info = d3
    .select("body")
    .append("p")
    .attr("id", "info");

  if (graph.information.graphic_type) {
    info.text(info._groups[0][0].innerHTML);
    info
      .append("a")
      .attr("id", "title")
      .attr("href", graph.information.reference)
      .attr("target", "_blank")
      .text(graph.information.graphic_type);
  }
  info.insert("span").text(information_text);

  if (graph.information.usage) {
    info._groups[0][0].innerHTML =
      info._groups[0][0].innerHTML + "<br/>" + graph.information.usage;
  }
}
// Zukunftsversion
/* function flag_mode(gNodes) {
  gNodes
}
d3.select("body").append("figure").style("transform", "scale(0.25,0.25)").style("position", "absolute").append("figcaption", "Flag mode").append("img").attr("src", "Flag_of_the_United_Nations.svg") */
