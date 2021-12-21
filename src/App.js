import "./App.css";
import * as d3 from "d3";
import { nest } from "d3-collection";
import { useEffect, useState } from "react";
import { Drawer } from "antd";
import "antd/dist/antd.css";
import Action from "./components/Action/Action";
import Information from "./components/Information/index";
import { data1 } from "./data1.js";

import styles from "./app.module.scss";
import cn from "classnames/bind";

const cx = cn.bind(styles);
function App() {
  const [currentZoom, setCurrentZoom] = useState(1);
  const [visible, setVisible] = useState(false);

  const [field, setField] = useState({});
  const [checkSize, setCheckSize] = useState([]);
  const [minCoordinates, setMinCoordinates] = useState("");
  const [maxCoordinates, setMaxCoordinates] = useState("");
  const [visibleAction, setVisibleAction] = useState(true);
  const isMobile = window.screen.width < 800;
  const calSize = (width, height, row, col) => {
    let size;
    let colWidth = Math.floor(width / col);

    let rowWidth = Math.floor(height / row);
    size = Math.min(colWidth, rowWidth);

    return size;
  };
  let width = Number(window.screen.availWidth - 90 - 235);
  let height = Number(window.screen.availHeight - 60);
  if (window.innerWidth < 800) {
    width = Number(window.innerWidth);
  }
  const ratio = 1 / 5;
  let minimapWidth = width * ratio;
  let minimapHeight = height * ratio;

  const minimapSize = calSize(
    minimapWidth,
    minimapHeight,
    data1.nRow,
    data1.nCol
  );

  minimapWidth = minimapSize * data1.nCol;
  minimapHeight = minimapSize * data1.nRow;
  const size = calSize(width, height, data1.nRow, data1.nCol);
  let zoom = d3.zoom();

  useEffect(() => {
    let data = data1;
    const map = d3
      .select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(0,0)");

    // --------------------------
    image(map, data);
    let center = {
      rowStart: Math.floor(data.nRow / 2),
      colStart: Math.floor(data.nCol / 2),
    };
    data.data.forEach((item) => {
      item.rowStartNew = center.rowStart - item.position.rowStart;
      item.rowEndNew = center.rowStart - item.position.rowEnd;
      item.colStartNew = center.colStart - item.position.colStart;
      item.colEndNew = center.colStart - item.position.colEnd;
      if (item.position.rowStart <= center.rowStart) {
        item.rowStartNew = Math.abs(item.rowStartNew);
      } else {
        item.rowStartNew = -Math.abs(item.rowStartNew);
      }
      if (item.position.colStart <= center.colStart) {
        item.colStartNew = -Math.abs(item.colStartNew);
      } else {
        item.colStartNew = Math.abs(item.colStartNew);
      }
      if (item.position.rowEnd <= center.rowStart) {
        item.rowEndNew = Math.abs(item.rowEndNew);
      } else {
        item.rowEndNew = -Math.abs(item.rowEndNew);
      }
      if (item.position.colEnd <= center.colStart) {
        item.colEndNew = -Math.abs(item.colEndNew);
      } else {
        item.colEndNew = Math.abs(item.colEndNew);
      }
      return item;
    });

    // ======================

    drawMap();
    drawMinimap();
    function handleZoom(e) {
      // if(e.sourceEvent === null) return;

      console.log("zoom");
      // const transform = d3.zoomTransform(d3.select("#map svg").node());
      const transform = e.transform;
      d3.select("svg g").attr("transform", transform);
      setCurrentZoom(transform.k);

      let dx = -transform.x / transform.k;
      let dy = -transform.y / transform.k;
      if (!isMobile) {
        d3.select("#minimapRect").remove();
        let minimapRect = d3
          .select("#mini-map svg g")
          .append("rect")
          .attr("id", "minimapRect")
          .attr("width", minimapWidth / transform.k - 4)
          .attr("height", minimapHeight / transform.k - 4)
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("fill", "none")
          .attr("transform", `translate(${2 + dx * ratio},${2 + dy * ratio})`);
      }
    }

    let transform = d3.zoomIdentity.translate(0, 0);
    zoom.on("zoom", handleZoom).scaleExtent([1, 3]);

    // .translateExtent([
    //   [-100, -100],
    //   [width * 1.5, height * 1.5],
    // ]);
    d3.select("svg")
      .call(zoom)
      .on("touchstart.zoom", null)
      .on("touchend.zoom", null)
      .call(zoom.transform, transform)
      .on("dblclick.zoom", null);

    // d3.select("#mini-map svg").call(zoom);
    d3.select("svg").on("dblclick.zoom", null);
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
          return d.position.colStart * size;
        })
        .attr("y", function (d) {
          return d.position.rowStart * size;
        })
        .attr("width", function (d) {
          let area = d.position.colEnd - d.position.colStart;
          return (area + 1) * size;
        })
        .attr("height", function (d) {
          let area = d.position.rowEnd - d.position.rowStart;
          return (area + 1) * size;
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
          if (active.attr("class").includes("active")) {
            // reset();
          } else {
            let allField = document.querySelectorAll(".field");
            allField.forEach((a) => a.classList.remove("active"));
            active.classed("active", !active.classed("active"));
            const size = Number(active.attr("height"));

            const x = Number(active.attr("x")) + size / 2;
            const y = Number(active.attr("y")) + size / 2;

            active.style("opacity", 1);
            let currentScale, currentScaleString;
            if (d3.select("#map svg g").attr("transform") === null) {
              currentScale = 1;
            }
            //case where we have transformed the circle
            else {
              currentScaleString = d3
                .select("#map svg g")
                .attr("transform")
                .split(" ")[1];
              currentScale = +currentScaleString.substring(
                6,
                currentScaleString.length - 1
              );
            }
            if (window.screen.width < 800) {
              d3.select("svg g").attr(
                "transform",
                `translate(${-x + window.innerWidth / 2}, ${
                  -y + window.innerHeight / 2
                })`
              );
            } else {
              let transform = d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(currentScale)
                .translate(-x, -y);

              d3.select("svg")
                .transition()
                .duration(750)
                .call(zoom.transform, transform);
            }

            // d3.select("svg g").transition()
            //   .duration(750).attr("transform", `translate(${width / 2 - x }, ${height / 2 - y})scale(${currentScale})`)

            setField(d);
            showDrawer();
          }
          // Blur
        })
        .on("dblclick", function (e) {
          return e.preventDefault();
        });
      d3.select("#map svg g")
        .selectAll(".blur-field")
        .data(data.data)
        .enter()
        .append("rect")
        .attr("class", "blur-field")
        .attr("x", function (d) {
          return d.position.colStart * size;
        })
        .attr("y", function (d) {
          return d.position.rowStart * size;
        })
        .attr("width", function (d) {
          let area = d.position.colEnd - d.position.colStart;
          return (area + 1) * size;
        })
        .attr("height", function (d) {
          let area = d.position.rowEnd - d.position.rowStart;
          return (area + 1) * size;
        })
        .style("fill", function (d) {
          return "grey";
        })
        .style("fill-opacity", 0);
      //
    }
    function drawMinimap() {
      let minimap = d3
        .select("#mini-map")
        .append("svg")
        .attr("width", minimapWidth)
        .attr("height", minimapHeight);

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
        .style("fill", "#212137");
      // .style("stroke", "black");
      //

      //
      let fieldsMini = rowMini
        .select(".fields-mini")
        .data(data.data)
        .enter()
        .append("rect")
        .attr("class", "field")
        .attr("x", function (d) {
          return d.position.colStart * minimapSize;
        })
        .attr("y", function (d) {
          return d.position.rowStart * minimapSize;
        })
        .attr("width", function (d) {
          let area = d.position.colEnd - d.position.colStart;

          return (area + 1) * minimapSize;
        })
        .attr("height", function (d) {
          let area = d.position.rowEnd - d.position.rowStart;
          return (area + 1) * minimapSize;
        })
        .style("fill", function (d) {
          if (!d.img) return "green";
          return `url(#${d.id})`;
        });
      // .style("stroke", "black");

      d3.select("#mini-map svg g")
        .selectAll(".blur-field")
        .data(data.data)
        .enter()
        .append("rect")
        .attr("class", "blur-field")
        .attr("x", function (d) {
          return d.position.colStart * minimapSize;
        })
        .attr("y", function (d) {
          return d.position.rowStart * minimapSize;
        })
        .attr("width", function (d) {
          let area = d.position.colEnd - d.position.colStart;
          return (area + 1) * minimapSize;
        })
        .attr("height", function (d) {
          let area = d.position.rowEnd - d.position.rowStart;
          return (area + 1) * minimapSize;
        })
        .style("fill", function (d) {
          return "grey";
        })
        .style("fill-opacity", 0);
    }
    d3.select("#mini-map svg g")
      .append("rect")
      .attr("width", minimapWidth)
      .attr("height", minimapHeight)
      .attr("x", 0)
      .attr("y", 0)
      .style("fill", "white")
      .style("fill-opacity", 0.1);

    d3.select("#mini-map svg g").call(d3.drag().on("drag", dragged));
    function dragged(e) {
      const current = d3.select("#minimapRect");
      const transform = d3.zoomTransform(d3.select("#map svg").node());
      const currentWidth = Number(current.attr("width"));
      const currentHeight = Number(current.attr("height"));
      current
        .attr(
          "transform",
          `translate(${(e.x - currentWidth / 2) * transform.k}, ${
            (e.y - currentHeight / 2) * transform.k
          })`
        )
        .attr("width", currentWidth)
        .attr("height", currentHeight);

      d3.select("#map svg").call(
        zoom.transform,
        d3.zoomIdentity
          .translate(
            -Number(e.x - currentWidth / 2) * (1 / ratio) * transform.k,
            -Number(e.y - currentHeight / 2) * (1 / ratio) * transform.k
          )
          .scale(transform.k)
      );
    }
  }, []);
  const handleFilter = (e) => {
    if (checkSize.includes(Number(e.target.value))) {
      let fields = d3.selectAll(".field");
      let newCheck = checkSize.filter((a) => a !== Number(e.target.value));
      setCheckSize(newCheck);
      fields
        .filter(function (d, i) {
          let area = d.position.rowEnd - d.position.rowStart;
          if (area + 1 === Number(e.target.value)) {
            return this;
          }
        })
        .style("fill", function (d) {
          if (!d.img) {
            return "green";
          }
          return `url(#${d.id})`;
        });
      // ---------
      let disableArray = [];
      let activeArray = [];
      let disableField = fields.filter(function (d, i) {
        let area = d.position.rowEnd - d.position.rowStart;
        if (newCheck.includes(area + 1)) {
          activeArray.push(d);
        } else {
          disableArray.push(d);
        }
      });

      //  d3.selectAll(".blur-field").filter(function(d){
      //   return this;
      // }).style("fill-opacity", 0)

      d3.selectAll(".blur-field")
        .filter(function (d) {
          if (activeArray.includes(d)) {
            return d;
          }
        })
        .style("fill-opacity", 0);
      d3.selectAll(".blur-field")
        .filter(function (d) {
          if (disableArray.includes(d)) {
            return d;
          }
        })
        .style("fill-opacity", 0.5);
      if (newCheck.length === 0) {
        d3.selectAll(".blur-field").style("fill-opacity", 0);
      }
    } else {
      let fields = d3.selectAll(".field");
      let activeArray = [];
      let disableArray = [];
      let activeField = fields.filter(function (d, i) {
        let area = d.position.rowEnd - d.position.rowStart;
        if (
          area + 1 === Number(e.target.value) ||
          checkSize.includes(area + 1)
        ) {
          activeArray.push(d);
          return this;
        } else {
          disableArray.push(d);
        }
      });
      // .style("fill", "orange");

      d3.selectAll(".blur-field")
        .filter(function (d) {
          if (activeArray.includes(d)) {
            return this;
          }
        })
        .style("fill-opacity", 0);
      d3.selectAll(".blur-field")
        .filter(function (d) {
          if (disableArray.includes(d)) {
            return this;
          }
        })
        .style("fill-opacity", 0.6);

      let newCheck = [...checkSize];
      newCheck.push(Number(e.target.value));
      setCheckSize(newCheck);
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
  function inRange(x, min, max) {
    return (x - min) * (x - max) <= 0;
  }
  const submit = () => {
    let rStart, cStart, rEnd, cEnd;
    let fields = d3.selectAll(".field");
    [rStart, cStart] = minCoordinates.split(",");
    [rEnd, cEnd] = maxCoordinates.split(",");
    let active = [];
    fields.filter(function (d) {
      let condition1 =
        inRange(d.rowStartNew, rStart, rEnd) ||
        inRange(d.rowEndNew, rStart, rEnd);
      let condition2 =
        inRange(d.colStartNew, cStart, cEnd) ||
        inRange(d.colEndNew, cStart, cEnd);
      if (condition1 && condition2) {
        active.push(d);
        return this;
      }
    });
    d3.selectAll(".blur-field")
      .filter(function (d) {
        if (!active.includes(d)) {
          return this;
        }
      })
      .style("fill-opacity", 0.7);
  };
  const resetCoordinate = () => {
    d3.selectAll(".blur-field").style("fill-opacity", 0);
  };
  const handleInputRange = (value) => {
    let scale = Number(value);
    const transform = d3.select("#mini-map svg #minimapRect").attr("transform");
    // const point = d3.zoomTransform(d3.select("#map svg").node());
    // let center;
    d3.select("#mini-map svg #minimapRect").remove();
    let myTransform;
    let x, y;
    const baseWidth = minimapWidth / (scale);
    const baseHeight = minimapHeight / (scale);
    const dx = (baseWidth - baseWidth / (scale / currentZoom)) / 2;
    const dy = (baseHeight - baseHeight / (scale / currentZoom)) / 2;

    if (transform === null) {
      myTransform = "";

      [x, y] = [0, 0];
    } else {
      [x, y] = transform.substring(10, transform.length - 1).split(",");
      x = Number(x);
      y = Number(y);
      myTransform = `translate(${Number(Math.max(x + dx, 0))}, ${Number(
        Math.max(y + dy, 0)
      )})`;
    }
    //
    setCurrentZoom(scale);
    d3.select("#map svg").attr("transform", "scale(" + scale + ")");
    let minimapRect = d3
      .select("#mini-map svg g")
      .append("rect")
      .attr("id", "minimapRect")

      .attr("width", minimapWidth / (scale))
      .attr("height", minimapHeight / (scale))

      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("transform", myTransform);

    d3.select("#map svg").call(
      zoom.transform,
      d3.zoomIdentity
        .scale(scale)
        .translate(-Number(x + dx) * (1 / ratio), -Number(y + dy) * (1 / ratio))
    );
  };
  return (
    <div className="App">
      <Information
        visible={visible}
        field={field}
        isEmpty={isEmpty}
        onClose={onClose}
      />
      <div className={cx("nav")}>Nav</div>
      <Action
        submit={submit}
        visibleAction={visibleAction}
        setVisibleAction={setVisibleAction}
        handleFilter={handleFilter}
        setMin={setMinCoordinates}
        setMax={setMaxCoordinates}
        min={minCoordinates}
        max={maxCoordinates}
        resetCoordinate={resetCoordinate}
      />

      <div className={cx("container")}>
        <div className={cx("menu")}>Menu</div>

        <div id="map"></div>
        <div
          id="mini-map"
          style={{
            left: `${visibleAction ? "400px" : "200px"}`,
            height: minimapHeight + 4,
            width: minimapWidth + 30,
          }}
        >
          <div className={cx("inputrange-wrapper")}>
            <button onClick={() => {handleInputRange(Number(Math.min(currentZoom + 0.1, 3)))}}>+</button>
            <input
              style={{width: 24}}
              onChange={(e) => handleInputRange(e.target.value)}
              type="range"
              orient="vertical"
              className={cx("input-range")}
              value={currentZoom}
              min={1}
              max={3}
              step={0.1}
            />
            <button onClick={() => {handleInputRange(Number(Math.max(currentZoom - 0.1, 1)))}}>-</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
