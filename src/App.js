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
  const [currentZoom, setCurrentZoom] = useState(1);
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
    size = Math.max(colWidth, rowWidth);

    return size;
  };
  const width = Number(window.screen.width - 95 - 235);
  const height = Number(window.screen.height - 60);
  let minimapWidth = width / 7;
  let minimapHeight = height / 7;
  const size = calSize(width, height, data1.nRow, data1.nCol);
  useEffect(() => {
    let data = data1;
    const map = d3
      .select("#map")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
    .attr("transform","translate(115,0)");

    // const initialScale = 2;
    // const initialTranslate = [
    //   (width * (1 - initialScale)) / 2,
    //   (height * (1 - initialScale)) / 2,
    // ];
    // map.attr(
    //   "transform",
    //   `translate(${initialTranslate[0]}, ${initialTranslate[1]})scale(${initialScale})`
    // );

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
    var brush = d3.brush()
    
    .extent([[0, 0], [minimapWidth*1.5, minimapHeight*1.5]])
    
    .on("start brush", brushed);
    
    function handleZoom(e, a) {
      let transform = e.transform;
      // const myTransform = d3.select("svg g").attr("transform");
      d3.select("svg g").attr("transform", transform);
      setCurrentZoom(transform.k)
      d3.select("#minimapRect").remove();
      
      let dx = -transform.x / transform.k;
      let dy = -transform.y / transform.k;

      let minimapRect = d3
        .select("#mini-map svg g")
        .append("rect")
        .attr("id", "minimapRect")

        .attr("width", ((minimapWidth/1.5) / transform.k))
        .attr("height", ((minimapHeight/1.5) / transform.k ))

        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("transform", `translate(${+dx / 7 },${+dy / 7 })`);

        d3.select(".selection").attr("x", +dx / 7).attr("y", dy / 7).attr("width",  ((minimapWidth/1.5) / transform.k)).attr("height", ((minimapHeight/1.5) / transform.k ))

    }

    let transform = d3.zoomIdentity.translate(0, 0).scale(1);
    let zoom = d3
      .zoom()
      .on("zoom", handleZoom)
      .scaleExtent([0.4, 3])
      
      .translateExtent([
        [-100, -100],
        [width*1.5, height*1.5],
      ]);
    d3.select("svg").call(zoom)
    .on("touchstart.zoom", null)
    .on("touchend.zoom", null)
    .call(zoom.transform, transform);


    
    
  d3.select("#mini-map svg g").call(brush).call(brush.move, [[0, 0], [minimapWidth / 1.5 +10, minimapHeight / 1.5 + 10]]);
  function brushed(e){
    
    const x = e.selection[0][0];
    const  y = e.selection[0][1];
    d3.select(".selection").attr("x", -x).attr("y", -y).attr("width",  ((minimapWidth/3) / currentZoom)).attr("height", ((minimapHeight/3) / currentZoom ))
    const minimapReact = d3.select("#minimapRect")
    .attr("transform", `translate(${x-10},${y-10})`);
    d3.select("#map svg g").attr("transform", `translate(${-x * 7},${-y * 7})`);

    // console.log()
  }
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
            const k = 2.6;

            active.style("opacity", 1);

            d3.select("#map svg g")
              .transition()
              .duration(1000)
              .attr(
                "transform",
                "translate(" +
                  width / 2 +
                  "," +
                  height / 2 +
                  ")scale(" +
                  k +
                  ")translate(" +
                  -x +
                  "," +
                  -y +
                  ")"
              );

            var transform = d3.zoomIdentity
              .translate(width / 2, height / 2)
              .scale(k)
              .translate(-x, -y);
            d3.select("svg").transition()
            .duration(1000).call(zoom.transform, transform);
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
      let activeField = fields.filter(function (d, i) {
        let area = d.position.rowEnd - d.position.rowStart;
        if (area + 1 === Number(e.target.value) || check.includes(area + 1)) {
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
    let rStart = min.split(",")[0];
    let rEnd = max.split(",")[0];
    let cStart = min.split(",")[1];
    let cEnd = max.split(",")[1];
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
    // e.preventDefault();
    let zoom = d3.zoom();
    let svg = d3.select("svg g");
    let minimapWidth = 120;
    let minimapHeight = 130;
    //
    const scale = Number(e.target.value);
    setCurrentZoom(scale);
    d3.select("svg").attr("transform", "scale(" + scale + ")");
    // d3.select("#minimapRect").remove();
    // let minimapRect = d3
    //   .select("#mini-map svg g")
    //   .append("rect")
    //   .attr("id", "minimapRect")
    //   .attr("width", minimapWidth / scale)
    //   .attr("height", minimapHeight / scale)
    //   .attr("stroke", "red")
    //   .attr("stroke-width", 2)
    //   .attr("fill", "none")
    //   .attr("transform", `scale(${scale})`);
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
            value={currentZoom}
            min={0.8}
            max={3}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
