import "./App.css";
import * as d3 from "d3";
import { nest } from "d3-collection";
import { useEffect, useState } from "react";
import { Drawer, Button } from "antd";
import "antd/dist/antd.css";
import { data1 } from "./data1.js";
function App() {
  const [visible, setVisible] = useState(false);
  const [field, setField] = useState({});
  const [check, setCheck] = useState([]);
  const calSize = (width, height, row, col) => {
    let size;
    let colWidth = Math.floor(width / col);

    let rowWidth = Math.floor(height / row);
    size = Math.min(colWidth, rowWidth);

    return size;
  };

  let width = 1200;
  // let height = map._groups[0][0].height.baseVal.value;
  let height = 2000;
  useEffect(() => {
    let data = data1;
    const map = d3
      .select("#map")
      .append("svg")
      .attr("width", `calc(100vw - 95px - 130px)`)
      .attr("height", `calc(100vh)`);
    // .attr("transform","translate(-150,-300) scale(0.5,0.5)");

    const initialScale = 2;
    const initialTranslate = [
      (width * (1 - initialScale)) / 2,
      (height * (1 - initialScale)) / 2,
    ];
    // map.attr(
    //   "transform",
    //   `translate(${initialTranslate[0]}, ${initialTranslate[1]})scale(${initialScale})`
    // );
    const size = calSize(width, height, data.nRow, data.nCol);

    // --------------------------
    image(map, data);

    // ======================
    function handleZoom(e, a) {
      let transform = e.transform;
      if(transform.k < 1) transform.k = 1;

      d3.select("svg g").attr("transform", transform);
      


// let factor = mapWidth / d3.select('#map svg').attr('viewBox').split(' ')[2]
// console.log(d3.select('#map svg')._groups[0][0].width.animVal.value)
d3.select('#minimapRect').remove();
let mapWidth = d3.select('#map')._groups[0][0].offsetWidth;
let mapHeight = d3.select('#map')._groups[0][0].offsetHeight;
let factor = mapWidth / d3.select('#map svg')._groups[0][0].width.animVal.value;
let minimapWidth = 130;
      let minimapHeight = 140;
let dx =  -transform.x / transform.k;
console.log(transform)
      let dy =  -transform.y / transform.k;
      
      console.log( transform.k)
      let minimapRect = d3.select("#mini-map svg g").append('rect')
          .attr('id', 'minimapRect')
          .attr('width', minimapWidth/ (transform.k) )
          .attr('height', minimapHeight / (transform.k) )
          .attr('stroke', 'red')
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('transform', `translate(${+dx/12 + 5},${+dy/12})`);
    }


    let transform = d3.zoomIdentity.translate(0, 0).scale(1);
    let zoom = d3
      .zoom()
      .on("zoom", handleZoom)
      .scaleExtent([0.6, 3])
      .translateExtent([
        [0, 0],
        [width, 1200],
      ]);
    d3.select("svg").call(zoom).call(zoom.transform, transform)

    drawMap();
    drawMinimap();
    function image() {
      let defs = map.append("defs");
      defs
        .append("pattern")
        .attr("id", "pattern-image")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("height", 1)
        .attr("width", 1)
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://w3.org/1999/xlink")
        .attr("xlink:href", "usa.png");

      defs
        .selectAll(".image-pattern")
        .data(data.data)
        .enter()
        .append("pattern")
        .attr("class", "pattern-image")
        .attr("id", function (d) {
          return d.id;
        })
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("height", 1)
        .attr("width", 1)
        .attr("preserveAspectRatio", "none")
        .attr("xmlns:xlink", "http://w3.org/1999/xlink")
        .attr("xlink:href", function (d) {
          if (d.img) return d.img;
          return "";
        });
    }
    function drawMap() {
      let gridRow = map.append("g").attr("class", "grid-square");
      let array = [];
      for (let i = 0; i < data.nCol; i++) {
        let row = [];
        for (let j = 0; j < data.nRow; j++) {
          let x = i * size;
          let y = j * size;
          row.push({ x, y });
        }
        array.push(row);
      }

      let row = gridRow
        .selectAll(".row")
        .data(array)
        .enter()
        .append("g")
        .attr("class", "col");

      let col = row
        .selectAll(".col")
        .data(function (d) {
          return d;
        })
        .enter()
        .append("rect")
        .attr("class", "square")
        .attr("x", function (d) {
          return d.x;
        })
        .attr("y", function (d) {
          return d.y;
        })
        .attr("width", size)
        .attr("height", size)
        .style("fill", "#212137")
        .style("stroke", "black");
      let fields = row
        .select(".fields")
        .data(data.data)
        .enter()
        .append("rect")
        .attr("class", "field")
        .attr("x", function (d) {
          return (d.position[1][0] + 6) * size;
        })
        .attr("y", function (d) {
          return d.position[0][0] * size;
        })
        .attr("width", function (d) {
          if (d.position[1].length > 1) {
            return (
              (d.position[1][d.position[1].length - 1] - d.position[1][0] + 1) *
              size
            );
          }

          return size;
        })
        .attr("height", function (d) {
          if (d.position[0].length > 1) {
            return (
              (d.position[0][d.position[0].length - 1] - d.position[0][0] + 1) *
              size
            );
          }

          return size;
        })
        .style("cursor", "pointer")
        .style("fill", function (d) {
          if (!d.img) {
            return "green";
          }
          return `url(#${d.id})`;
        })
        .style("stroke", "black")
        .on("click", function (e, d) {
          let active = d3.select(this);
          e.preventDefault();
          if (active.attr("class").includes("active")) {
            // reset();
          } else {
            let allField = document.querySelectorAll(".field");
            allField.forEach((a) => a.classList.remove("active"));
            active.classed("active", !active.classed("active"));
            // field.style("fill", "red")
            active.style("opacity", 1);

            d3.select("svg g")
              .transition()
              .duration(1000)
              .call(
                zoom.transform,
                d3.zoomIdentity
                  .translate(width / 8 + 400, height / 8)
                  .scale(d3.zoomTransform(this).k)
                  .translate(-+active.attr("x"), -+active.attr("y"))
              );

            setField(d);
            showDrawer();
          }
        })
        .on("dblclick", function (e) {
          return e.preventDefault();
        });
    }
    function drawMinimap() {
      let minimapWidth = width / 8;
      let minimapHeight = height / 8;
      let minimap = d3
        .select("#mini-map")
        .append("svg")
        .attr("width", minimapWidth - 15)
        .attr("height", minimapHeight - 110);

      const minimapSize = calSize(
        minimapWidth,
        minimapHeight,
        data.nRow,
        data.nCol
      );

      let minimapGrid = minimap.append("g").attr("class", "minimap-grid");

      let arrayMini = [];
      for (let i = 0; i < data.nCol; i++) {
        let row = [];
        for (let j = 0; j < data.nRow; j++) {
          let x = i * minimapSize;
          let y = j * minimapSize;
          row.push({ x, y });
        }
        arrayMini.push(row);
      }
      let rowMini = minimapGrid
        .selectAll(".row-mini")
        .data(arrayMini)
        .enter()
        .append("g")
        .attr("class", "col-mini");

      let colMini = rowMini
        .selectAll(".col-mini")
        .data(function (d) {
          return d;
        })
        .enter()
        .append("rect")
        .attr("class", "square")
        .attr("x", function (d) {
          return d.x;
        })
        .attr("y", function (d) {
          return d.y;
        })
        .attr("width", minimapSize)
        .attr("height", minimapSize)
        .style("fill", "#212137")
        .style("stroke", "black");
      //

      //
      let fieldsMini = rowMini
        .select(".fields-mini")
        .data(data.data)
        .enter()
        .append("rect")
        .attr("class", "field")
        .attr("x", function (d) {
          return (d.position[1][0] + 6) * minimapSize;
        })
        .attr("y", function (d) {
          return d.position[0][0] * minimapSize;
        })
        .attr("width", function (d) {
          if (d.position[1].length > 1) {
            return (
              (d.position[1][d.position[1].length - 1] - d.position[1][0] + 1) *
              minimapSize
            );
          }

          return minimapSize;
        })
        .attr("height", function (d) {
          if (d.position[0].length > 1) {
            return (
              (d.position[0][d.position[0].length - 1] - d.position[0][0] + 1) *
              minimapSize
            );
          }

          return minimapSize;
        })
        .style("fill", function (d) {
          if (!d.img) return "green";
          return `url(#${d.id})`;
        })
        .style("stroke", "black");
    }
    function reset() {
      d3.select("svg g")
        .transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(-95, -60).scale(1));
    }
  }, []);
  const handleFilter = (e) => {
    if (check.includes(Number(e.target.value))) {
      let fields = d3.selectAll(".field");
      fields
        .filter(function (d, i) {
          if (d.position[0].length === Number(e.target.value)) {
            return this;
          }
        })
        .style("fill", function (d) {
          if (!d.img) {
            return "green";
          }
          return `url(#${d.id})`;
        });
      let newCheck = check.filter((a) => a !== Number(e.target.value));
      setCheck(newCheck);
    } else {
      let fields = d3.selectAll(".field");
      fields
        .filter(function (d, i) {
          if (d.position[0].length === Number(e.target.value)) {
            return this;
          }
        })
        .style("fill", "orange");
      let newCheck = [...check];
      newCheck.push(Number(e.target.value));
      setCheck(newCheck);
    }
  };
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  function isEmpty(obj) {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        return false;
      }
    }

    return JSON.stringify(obj) === JSON.stringify({});
  }
  return (
    <div className="App">
      <Drawer
        className="info"
        mask={false}
        autoFocus={false}
        title="Infomation"
        placement="right"
        onClose={onClose}
        visible={visible}
        width={250}
        style={{ marginTop: 60 }}
      >
        {!isEmpty(field) && visible && (
          <>
            <div>Name: {field.name || field.id}</div>
            <div>
              Position: {field.position[0][0]} x {field.position[1][0]}
            </div>
            <div>
              Area: {field.position[0].length} x {field.position[0].length}
            </div>
            <img src={field.img || "green.jpg"} />{" "}
          </>
        )}
      </Drawer>
      <div className="nav">Nav</div>
      <div className="action">
        <div>Map</div>
        <div>
          <input
            type="checkbox"
            value={4}
            onChange={(value) => handleFilter(value)}
          />
          4x4
        </div>
        <div>
          <input
            type="checkbox"
            value={3}
            onChange={(value) => handleFilter(value)}
          />
          3x3
        </div>
        <div>
          <input
            type="checkbox"
            value={2}
            onChange={(value) => handleFilter(value)}
          />
          2x2
        </div>
        <div>
          <input
            type="checkbox"
            value={1}
            onChange={(value) => handleFilter(value)}
          />
          1x1
        </div>
      </div>
      <div className="container">
        <div className="menu"></div>

        <div id="map"></div>
        <div id="mini-map"></div>
      </div>
    </div>
  );
}

export default App;
