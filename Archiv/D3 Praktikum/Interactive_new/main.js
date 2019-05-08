var treeData_1 = {
  name: "Odin",
  children: [
    {
      name: "Thor",
      children: [
        {
          name: "Magni"
        },
        {
          name: "Modi",
          children: [{ name: "Wilfried" }]
        }
      ]
    },
    {
      name: "Hödur",
      children: [
        {
          name: "Kevin-Sören",
          children: [
            {
              name: "Dietrich",
              children: [{ name: "Johannes" }, { name: "Jasper" }]
            },
            {
              name: "Justin",
              children: [
                {
                  name: "Franziskus",
                  children: [
                    { name: "Muhammed" },
                    { name: "Leon", children: { name: "Klobert" } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

var treeData = {
  name: "Alphabet",
  children: [
    { name: "nest" },
    { name: "Access & Energy" },
    { name: "verily" },
    { name: "Calico" },
    { name: "Side Walk Labs" },
    {
      name: "Google",
      children: [
        { name: "YouTube" },
        { name: "Google Search Engine" },
        { name: "Technical Infrastructure" },
        { name: "Google AdSense" },
        { name: "Google Maps" },
        { name: "G Suite" },
        { name: "Android" },
        { name: "Google for Work" },
        { name: "Google DeepMind" },
        { name: "ATAP" }
      ]
    },
    {
      name: "X",
      children: [
        { name: "Replicant" },
        { name: "GLASS" },
        { name: "PROJECT LOON" },
        { name: "WING" },
        { name: "Project Titan" }
      ]
    },
    { name: "GV" },
    { name: "CapitalG" },
    { name: "Waymo" }
  ]
};
treeData_2 = {
  name: "Divisionsstab",
  children: [
    { name: "Aufklärungs-Abteilung" },
    { name: "Panzerabwehr-Abteilung" },
    { name: "Pionier-Batallion" },
    { name: "Nachrichten-Abteilung" },
    { name: "Feld-Ersatz-Battalion" },
    { name: "Rückwärtige Dienste" }
  ]
};

// Proportionen festlegen
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  },
  width = 1600 - margin.left - margin.right;
height = 1000 - margin.top - margin.bottom;

// Hilfsvariablen
var i = 0,
  duration = 500,
  root = null;

// Anfügen und positionieren des SVGs
var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Neues tree layout mit Größe erstellen
var treemap = d3.tree().size([width, height]);

// Erzeugen der root node
root = d3.hierarchy(treeData);
root.x0 = width / 2;
root.y0 = 0;

update(root);

// Definieren der Update-Funktion
function update(source) {
  console.log("update");

  var treeData = treemap(root);

  var nodes = treeData.descendants();
  var links = treeData.descendants().slice(1); // Root hat kein Parent - slice(1)

  // Berechnung der y Position der Knoten (gleichmäßige Aufteilung)
  nodes.forEach(function(d) {
    var leaves = root.leaves();
    var maxDepth = 0;
    leaves.forEach(leaf => {
      var currentDepth = leaf.depth;
      if (maxDepth < currentDepth) {
        maxDepth = currentDepth;
      }
    });
    d.y = d.depth * (height / (maxDepth + 1));
  });

  // ****************** Nodes section ***************************

  // ID-Zuweisung
  var node = svg.selectAll("g.node").data(nodes, function(d) {
    var id;
    if (d.id) {
      id = d.id;
    } else {
      d.id = ++i;
      id = d.id;
    }
    return id;
  });

  // Hinzufügen der Knoten
  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + source.x0 + "," + source.y0 + ")";
    })
    .on("click", click);

  nodeEnter.append("circle").attr("class", "node");
  nodeEnter
    .selectAll("circle")
    .transition()
    .duration(duration)
    .style("fill", function(d) {
      if (d._children) {
        return "rgba(99, 242, 142,0)";
      } else {
        return "rgba(255,255,255,0)";
      }
    });

  // Hinzufügen des Texts
  var text_i = 0;
  var text_add;
  nodeEnter
    .append("a")
    .attr("target", "_blank")
    .attr(
      "xlink:href",

      function(d) {
        return "https://www.google.com/search?q=" + d.data.name;
      }
    )
    .append("text")
    .attr("y", function(d) {
      if (text_i == 0) {
        text_add = 0;
        text_i = 1;
      } else {
        text_add = 11;
        text_i = 0;
      }
      if (d.children) {
        obj = -15 - text_add;
      } else if (d._children) {
        obj = -15 - text_add;
      } else {
        obj = 20 + text_add;
      }
      return obj;
    })
    .text(function(d) {
      return d.data.name;
    })
    .attr("text-anchor", "middle")
    .transition()
    .duration(duration)
    .style("fill-opacity", 1);

  // Speicherung d. neuen Zustands durch zusammenführen (merge) von node und nodeEnter
  var nodeUpdate = nodeEnter.merge(node);

  // Animationen etc. darstellen
  nodeUpdate
    .transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  nodeUpdate
    .select("circle.node")
    .transition()
    .duration(duration)
    .attr("r", 10)
    .style("fill", function(d) {
      if (d._children) {
        return "rgb(99, 242, 142)";
      } else {
        return "#fff";
      }
    })
    .attr("cursor", "pointer");

  // Entfernen der Knoten, Animieren
  var nodeExit = node
    .exit()
    .transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.x + "," + source.y + ")";
    })
    .remove();

  nodeExit.select("circle").attr("r", 0);

  nodeExit.select("text").style("fill-opacity", 0);

  // ****************** links section ***************************

  // ID-Zuweisung
  var link = svg.selectAll("path.link").data(links, function(d) {
    return d.id;
  });

  // Hinzufügen der Verbindungen
  var linkEnter = link
    .enter()
    .insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
      var o = {
        x: source.x0,
        y: source.y0
      };
      return diagonal(o, o);
    });

  // Speicherung d. neuen Zustands durch zusammenführen (merge) von link und linkEnter
  var linkUpdate = linkEnter.merge(link);

  linkUpdate
    .transition()
    .duration(duration)
    .attr("d", function(d) {
      return diagonal(d, d.parent);
    });

  // Entfernen der Verbindungen
  var linkExit = link
    .exit()
    .transition()
    .duration(duration)
    .attr("d", function(d) {
      var o = {
        x: source.x,
        y: source.y
      };
      return diagonal(o, o);
    })
    .remove();

  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Berechnen der Verbindungen
function diagonal(s, d) {
  path = `M ${s.x} ${s.y}
  L ${s.x} ${(s.y + d.y) / 2},
  ${d.x} ${(s.y + d.y) / 2},
    ${d.x} ${d.y}`;
  return path;
}

// Entfernen der children bei allen anderen children
function collapse(d) {
  console.log("collapse");
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse); //Rekursion
    d.children = null;
  }
}

// Zustand der Child-Nodes beim Ausgangsknoten
//_children: Temp-Var zum Zwischenspeichern von Children
function click(d) {
  console.log("click");
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}
