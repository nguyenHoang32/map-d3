import "./App.css";
import * as d3 from "d3";
import { nest } from "d3-collection";
import { useEffect, useState } from "react";
import { Drawer } from "antd";
import "antd/dist/antd.css";
import Action from "./components/Action/Action";
import Information from "./components/Information/index";
import { data1 } from "./data1.js";
// import { data1 } from "./data2.js";

import styles from "./app.module.scss";
import cn from "classnames/bind";

const cx = cn.bind(styles);
function App() {
  const [visible, setVisible] = useState(false);
  const [field, setField] = useState({});
  const [check, setCheck] = useState([]);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [visibleAction, setVisibleAction] = useState(true);
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
  const size = calSize(width, height, data1.nRow, data1.nCol);
  useEffect(() => {
    let data = data1;
    const map = d3
      .select("#map")
      .append("svg")
      .attr("width", `calc(100vw - 95px - 130px)`)
      .attr("height", `calc(100vh)`);
    // .attr("transform","translate(-150,-300) scale(0.5,0.5)");

    // const initialScale = 2;
    // const initialTranslate = [
    //   (width * (1 - initialScale)) / 2,
    //   (height * (1 - initialScale)) / 2,
    // ];
    // map.attr(
    //   "transform",
    //   `translate(${initialTranslate[0]}, ${initialTranslate[1]})scale(${initialScale})`
    // );

    console.log(size * Math.floor(data.nRow / 2));
    // --------------------------
    image(map, data);
    let center = {
      rowStart: Math.floor(data.nRow / 2),
      colStart: Math.floor(data.nCol / 2),
    };

    data.data.forEach((item) => {
      if (item.position.rowStart <= center.rowStart) {
        item.rowStartNew = center.rowStart - item.position.rowStart;
      } else {
        item.rowStartNew = item.position.rowStart - center.rowStart;
      }
      if (item.position.colStart <= center.colStart) {
        item.colStartNew = item.position.colStart - center.colStart;
      } else {
        item.colStartNew = center.colStart - item.position.colStart;
      }
      if (item.position.rowEnd <= center.rowStart) {
        item.rowEndNew = center.rowStart - item.position.rowEnd;
      } else {
        item.rowEndNew = item.position.rowEnd - center.rowStart;
      }
      if (item.position.colEnd <= center.colStart) {
        item.colEndNew = item.position.colEnd - center.colStart;
      } else {
        item.colEndNew = center.colStart - item.position.colEnd;
      }
      return item;
    });

    // ======================
    function handleZoom(e, a) {
      let transform = e.transform;
      if (transform.k < 1) transform.k = 1;
      d3.select("svg g").attr("transform", transform);
      d3.select("#minimapRect").remove();
      let minimapWidth = 120;
      let minimapHeight = 130;
      let dx = -transform.x / transform.k;
      let dy = -transform.y / transform.k;
      let minimapRect = d3
        .select("#mini-map svg g")
        .append("rect")
        .attr("id", "minimapRect")
        .attr("width", (minimapWidth / transform.k) / 1.5)
        .attr("height", (minimapHeight / transform.k) / 1.5)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("transform", `translate(${+dx / 12 + 40},${+dy / 12 + 20})`);
    }

    let transform = d3.zoomIdentity.translate(0, 0).scale(1);
    let zoom = d3
      .zoom()
      .on("zoom", handleZoom)
      .scaleExtent([0.1, 3])
      .translateExtent([
        [-300, -200],
        [width*1.5, 1200],
      ]);
    d3.select("svg").call(zoom).call(zoom.transform, transform);

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
                  .translate(width / 7 + 400, height / 7)
                  .scale(d3.zoomTransform(this).k)
                  .translate(-+active.attr("x"), -+active.attr("y"))
              );

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
      let minimapWidth = width / 7;
      let minimapHeight = height / 7;
      let minimap = d3
        .select("#mini-map")
        .append("svg")
        .attr("width", minimapWidth - 20)
        .attr("height", minimapHeight - 170);

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
        })
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
      let newCheck = check.filter((a) => a !== Number(e.target.value));
      setCheck(newCheck);
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
      let activeField = fields
        .filter(function (d, i) {
          let area = d.position.rowEnd - d.position.rowStart;
          if (area + 1 === Number(e.target.value) || check.includes(area + 1)) {
            activeArray.push(d);
            return this;
          } else {
            disableArray.push(d);
          }
        })
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
  function inRange(x, min, max) {
    return (x - min) * (x - max) <= 0;
  }
  const submit = () => {
    // const size = calSize(width, height, data.nRow, data.nCol);

    let rStart = min.split(",")[0];
    let rEnd = max.split(",")[0];
    let cStart = min.split(",")[1];
    let cEnd = max.split(",")[1];
    // min.forEach(a => a * size)
    // max.forEach(a => a * size)

    let fields = d3.selectAll(".field");
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
  const zoomInMini = (e) => {
    e.preventDefault();
    console.log(e.target.value)
    let zoom = d3.zoom();
    let svg = d3.select("svg")
     
      // 
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(width/2, height/2).scale(Number(e.target.value)),
        
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
        setMin={setMin}
        setMax={setMax}
        min={min}
        max={max}
        resetCoordinate={resetCoordinate}
      />

      <div className={cx("container")}>
        <div className={cx("menu")}></div>

        <div id="map"></div>
        <div
          id="mini-map"
          style={{ left: `${visibleAction ? "400px" : "200px"}` }}
        >
          <input
            onChange={zoomInMini}
            type="range"
            orient="vertical"
            className={cx("input-range")}
            min={0.2}
            max={3}
            step={0.2}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
