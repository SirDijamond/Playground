// SVG erstellen
var svg = d3.select("svg"),
  width = svg.attr("width"),
  height = svg.attr("height");

// Simulation erstellen
var simulation = d3
  .forceSimulation()
  .force(
    "link",
    d3
      .forceLink()
      .distance(250)
      .strength(0.1)
  )
  .force("charge", d3.forceManyBody().distanceMax(1600))
  .force("center", d3.forceCenter(width / 2, height / 2));
var dragging = false;
var hovering = false;
// Daten importieren
d3.json("europa1.json", function(error, graph) {
  if (error) throw error;
  var nodes = graph.nodes;
  var nodeMap = d3.map(nodes, function(d) {
    return d.id;
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
        return d.id;
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
    .on("mouseout", handleMouseOut);

  gNodes
    .append("circle")
    .attr("r", 5)
    .attr("cursor", "pointer");

  gNodes
    .append("text")
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.id;
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

  simulation.nodes(nodes).on("tick", ticked);
  simulation.force("link").links(bilateral_links);

  // Neues Positionieren der Nodes und bilateral_links bei Veränderung
  function ticked() {
    link.attr("d", function(d) {
      return `M ${d[0].x},${d[0].y} L ${d[1].x},${d[1].y}`;
    });
    gNodes.attr("transform", function(d) {
      return `translate(${d.x},${d.y})`;
    });
  }

  generate_Info(graph);

  function handleMouseOver(d) {
    if (!dragging) {
      console.log("Hovering");
      // alle Nachbarländer suchen
      attached_objects = [d.name];
      bilateral_links.forEach(function(link, i) {
        if (d.name == link.source.name) {
          attached_objects.push(link.target.name);
        }
      });
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
      hovering = true;
    }
  }

  function handleMouseOut(d) {
    if (!dragging) {
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
      hovering = false;
    }
  }
  function dragstarted(d) {
    dragging = true;
    // wenn kein Drag-Event aktiv
    if (d3.event.active == 0) {
      // erlaube Knoten sich zu bewegen und starte neu
      simulation.alphaTarget(0.1).restart();
    }
    if (!hovering) {
      handleMouseOver;
    }
  }
  function dragended(d) {
    dragging = false;
    // wenn kein Drag-Event aktiv
    if (d3.event.active == 0) {
      // erlaube Knoten nicht mehr sich zu bewegen
      simulation.alphaTarget(0);
    }
    // Position der Knoten freigegeben
    d.fx = null;
    d.fy = null;
    if (!hovering) {
      handleMouseOut;
    }
  }
});

/*****************************Functions*******************************/
function filter_Links(bilateral_links, nodeMap) {
  unilateral_links = [];
  var linkMap = new Map();
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

  //
  bilateral_links.forEach(function(link) {
    var s = (link.source = nodeMap.get(link.source)),
      t = (link.target = nodeMap.get(link.target));
    bilateral_links.push({
      source: s,
      target: t
    });
    unilateral_links.push([s, t]);
  });

  unilateral_links.forEach(function(link, i) {
    var source = link[0].name;
    var target = link[1].name;
    if (!linkMap.get(source)) {
      unilateral_links.splice(i, 1);
    } else if (!linkMap.get(source).includes(target)) {
      unilateral_links.splice(i, 1);
    }
  });

  return unilateral_links;
}

function dragged(d) {
  // Position des Knotens fix setzen
  d.fx = d3.event.x;
  d.fy = d3.event.y;
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
    var a = info
      .append("a")
      .attr("id", "title")
      .attr("href", graph.information.reference)
      .attr("target", "_blank")
      .text(graph.information.graphic_type);
    if (graph.information.reference) {
      a.attr("class", "link");
      alert = d3
        .select("body")
        .insert("p")
        .text("Klicken Sie den Titel an um die Referenz zu öffnen.");
      setTimeout(() => {
        alert.remove();
      }, 7500);
    }
  }
  info.insert("span").text(information_text);

  if (graph.information.usage) {
    info._groups[0][0].innerHTML =
      info._groups[0][0].innerHTML + "<br/>" + graph.information.usage;
  }
}
