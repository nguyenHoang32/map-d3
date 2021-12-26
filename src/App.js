import "./App.css";
import * as d3 from "d3";
import { useEffect, useState } from "react";
import "antd/dist/antd.css";
import Action from "./components/Action/Action";
import Information from "./components/Information/index";
import Modal from "./components/Modal/index";
import { data1 } from "./data1.js";

import styles from "./app.module.scss";
import cn from "classnames/bind";
import {
  MenuOutlined,
  LeftOutlined,
  RightOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import update from 'immutability-helper';
const cx = cn.bind(styles);
function App() {
  const [currentZoom, setCurrentZoom] = useState(3);
  const [visible, setVisible] = useState(false);

  const [field, setField] = useState({});
  const [checkSize, setCheckSize] = useState([]);
  const [minCoordinates, setMinCoordinates] = useState("");
  const [maxCoordinates, setMaxCoordinates] = useState("");
  const [visibleAction, setVisibleAction] = useState(false);
  const [displayMinimap, setDisplayMinimap] = useState(true);
  const [modal, setModal] = useState({
    show: true,
    text: "Creating minimap...",
  });

  const isMobile = window.innerWidth < 800;
  const calSize = (width, height, row, col) => {
    let size;
    let colWidth = Number(width / col).toFixed(2);
    let rowWidth = Number(height / row).toFixed(2);
    size = Math.min(colWidth, rowWidth);

    return size;
  };
  let width = Number(window.screen.availWidth - 90 - 235);
  let height = Number(window.screen.availHeight - 60);
  if (window.innerWidth < 800) {
    width = Number(window.innerWidth);
  }
  const ratio = 1 / 6;
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
    const canvas = d3
      .select("#canvas")
      .attr("width", width)
      .attr("height", height);
    const context = canvas.node().getContext("2d");
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
    var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // ======================
    drawMinimap();
    
    setModal(update(modal, {text: {$set: "Creating map..."}}))
    drawMap();
    

    function handleZoom(e) {
      const transform = e.transform;
      d3.select("svg g").attr("transform", transform);
      console.log(e)
      if(e.sourceEvent !== null){
        div.transition()
        .duration(100)
        .style("opacity", 0)
      }
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
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);
      drawCanvas();
      context.restore();
    }

    let transform = d3.zoomIdentity.translate(0, 0).scale(3);
    zoom.on("zoom", handleZoom).scaleExtent([1, 10]);

    // .translateExtent([
    //   [-100, -100],
    //   [width * 1.5, height * 1.5],
    // ]);
    d3.select("svg")
      .call(zoom)
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
    function drawCanvas() {
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < data.nCol; i++) {
        for (let j = 0; j < data.nRow; j++) {
          let x = i * size;
          let y = j * size;
          context.beginPath();

          //Drawing a rectangle
          context.fillStyle = "#212137";
          context.fillRect(x, y, size, size);
          //Optional if you also sizeant to give the rectangle a stroke
          context.strokeStyle = "black";
          context.lineWidth = 0.5;
          context.strokeRect(x, y, size, size);

          context.fill();
          context.closePath();
        }
      }
      // for (let i = 0; i < data.data.length; i++) {
      //   for (let j = 0; j < data.data[i].length; j++) {
      //     context.beginPath();
      //     const top = data.data[i][j].position.rowStart * size;
      //     const left = data.data[i][j].position.colStart * size;
      //     const width =
      //       (data.data[i][j].position.colEnd - data.data[i][j].position.colStart) * size;
      //     const height =
      //       (data.data[i][j].position.rowEnd - data.data[i][j].position.rowStart) * size;
      //     //Drawing a rectangle
      //     console.log(top,left,width,height)
      //     context.fillStyle = "green";
      //     context.fillRect(left, top, width, height);
      //     //Optional if you also sizeant to give the rectangle a stroke
      //     context.strokeStyle = "black";
      //     context.lineWidth = 0.5;
      //     context.strokeRect(left, top, width, height);

      //     context.fill();
      //     context.closePath();
      //   }
      // }
    }
    function drawMap() {
      map.append("g").attr("class", "grid-square");
      drawCanvas();

      let fields = d3.select("svg g")
        .selectAll(".fields")
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
        // .style("cursor", "pointer")
        .style("fill", function (d) {
          if (!d.img) {
            return "green";
          }
          return `url(#${d.id})`;
        })
        .style("stroke-width", "0.5px")
        .style("stroke", "black")
        .on("click", function (e, d) {
          div.style("opacity", 0);
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

            if (window.innerWidth < 800) {
              d3.select("svg g").attr(
                "transform",
                `translate(${-x + window.innerWidth / 2}, ${
                  -y + window.innerHeight / 2
                })`
              );
            } else {
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
              let transform = d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(currentScale)
                .translate(-x, -y);
              console.log(transform)
              d3.select("svg")
                .transition()
                .duration(300)
                .call(zoom.transform, transform);
                div.transition()
                .duration(500)
                .style("opacity", .9);
              div.html(`<div class="tooltip-img"></div>
              <div class="tooltip-content">
                <div>Name: ...</div>
                <div>Estate: ... </div>
              </div>`)
              .style("left", (width/2 + 90) + "px")
              .style("top", (height/2 + 60) + "px");
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
      
    }
    function drawMinimap() {
      let minimap = d3
        .select("#mini-map")
        .append("svg")
        .attr("width", minimapWidth)
        .attr("height", minimapHeight);

      minimap.append("g").attr("class", "minimap-grid");

      let fieldsMini = d3
        .select("#mini-map svg g")
        .selectAll(".fields-mini")
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
    setModal(update(modal, {show:{$set: false},text: {$set: ""}}))
  }, []);
  const handleFilter = async (e) => {
    let state = { show: true, text: "Applying filter..." };
    setModal({ ...state });
    let fields = await d3.selectAll(".field");
    fields
        .filter(function (d, i) {
          let area = Number(d.position.rowEnd - d.position.rowStart);
          
          if (e.includes(area + 1)) {
            return this;
          }
        })
        .style("fill", function (d) {
          if (!d.img) {
            return "green";
          }
          return `url(#${d.id})`;
        });
       
        d3
        .selectAll(".blur-field")
        .filter(function (d) {
          let area = d.position.rowEnd - d.position.rowStart;
          if (!e.includes(area + 1)) {
            return this
          }
        }).style("fill-opacity", 0.5);
        
        d3
        .selectAll(".blur-field")
        .filter(function (d) {
          let area = d.position.rowEnd - d.position.rowStart;
          if (e.includes(area + 1)) {
            return this
          }
        }).style("fill-opacity", 0);
        setTimeout(() => {
          setModal({
            show: false,
            text: "",
          });
        }, 2000)
    
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
    const baseWidth = minimapWidth / scale;
    const baseHeight = minimapHeight / scale;
    const dx = (baseWidth - baseWidth / (scale / currentZoom)) / 2;
    const dy = (baseHeight - baseHeight / (scale / currentZoom)) / 2;
    let myTransform;
    let x, y;

    const transform = d3.select("#mini-map svg #minimapRect").attr("transform");
    d3.select("#mini-map svg #minimapRect").remove();
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
    d3.select("#map svg").attr("transform", "scale(" + scale + ")");
    let minimapRect = d3
      .select("#mini-map svg g")
      .append("rect")
      .attr("id", "minimapRect")

      .attr("width", minimapWidth / scale)
      .attr("height", minimapHeight / scale)

      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("transform", myTransform);
    setCurrentZoom(scale);

    d3.select("#map svg").call(
      zoom.transform,
      d3.zoomIdentity
        .scale(scale)
        .translate(-Number(x + dx) * (1 / ratio), -Number(y + dy) * (1 / ratio))
    );
  };
  const changeDisplayMinimap = () => {
    setDisplayMinimap(!displayMinimap);
  };
  const zoomInMobile = (value) => {
    const scale = Number(value);
    setCurrentZoom(value);

    d3.select("#map svg").call(
      zoom.transform,
      d3.zoomIdentity.scale(scale).translate(width / 2, height / 2)
    );
    d3.select("#map svg").attr("transform", "scale(" + scale + ")");
  };
  return (
    <div className="App">
      {modal.show && <Modal text={modal.text} />}

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
        <div id="map-container">
          <canvas id="canvas"></canvas>
          <div id="map"></div>
        </div>

        <div
          className={cx("minimap-container")}
          style={{
            left: `${visibleAction ? "400px" : "200px"}`,
            pointerEvents: displayMinimap ? "all" : "none",
          }}
        >
          <div
            id="mini-map"
            style={{
              height: minimapHeight + 4,
              width: minimapWidth + 30,
              visibility: `${displayMinimap ? "visible" : "hidden"}`,
              pointerEvents: displayMinimap ? "all" : "none",
              transform: `translate(${!displayMinimap ? "-500px" : "0px"})`,
            }}
          >
            <div className={cx("inputrange-wrapper")} id="input-range-minimap">
              <button
                onClick={() => {
                  handleInputRange(Number(Math.min(currentZoom + 0.5, 10)));
                }}
              >
                +
              </button>
              <input
                style={{ width: 24 }}
                onChange={(e) => handleInputRange(e.target.value)}
                type="range"
                orient="vertical"
                className={cx("input-range")}
                value={currentZoom}
                min={1}
                max={10}
                step={0.5}
              />
              <button
                onClick={() => {
                  handleInputRange(Number(Math.max(currentZoom - 0.5, 3)));
                }}
              >
                -
              </button>
            </div>
          </div>
          <div
            className={cx(
              "minimap-action",
              displayMinimap
                ? cx("minimap-action--active")
                : cx("minimap-action--close")
            )}
            style={{ pointerEvents: "all" }}
          >
            <div
              className={cx("minimap-action-closeBtn")}
              onClick={changeDisplayMinimap}
            >
              {displayMinimap ? <LeftOutlined /> : <RightOutlined />}
            </div>
            <div className={cx("minimap-action-info")}>
              <InfoCircleOutlined />
            </div>
            <div className={cx("minimap-action-info")}>
              <MenuOutlined />
            </div>
          </div>
        </div>
        <div className={cx("mobile")}>
          <div className={cx("mobile-menu")}>
            <MenuOutlined />
          </div>
          <div className={cx("mobile-zoom")}>
            <div
              onClick={() => {
                zoomInMobile(Number(Math.min(currentZoom + 0.5, 10)));
              }}
            >
              +
            </div>
            <div className={cx("divider")}></div>
            <div
              onClick={() => {
                zoomInMobile(Number(Math.max(currentZoom - 0.5, 1)));
              }}
            >
              -
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
