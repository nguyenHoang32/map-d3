import React, { useState, useEffect } from "react";
import * as d3 from "d3";
import Action from "../Action/Action";
import Information from "../Information/index";
import Modal from "../Modal/index";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  MenuOutlined,
  LeftOutlined,
  RightOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import styles from "./app.module.scss";
import { data1 } from "../../data1";
import cn from "classnames/bind";
import update from "immutability-helper";
import { Select } from "antd";
import { color, inRange, isEmpty } from "../../ultis.js";
const cx = cn.bind(styles);
const { Option } = Select;
const Map = ({ props }) => {
  const navigate = useNavigate();
  const [currentZoom, setCurrentZoom] = useState(3);
  const [visible, setVisible] = useState(false);

  const [field, setField] = useState({});

  const [visibleAction, setVisibleAction] = useState(false);
  const [displayMinimap, setDisplayMinimap] = useState(true);
  const [modal, setModal] = useState({
    show: true,
    text: "Creating map...",
    showButton: false,
  });
  const location = useLocation();
  // FIlter
  const [minCoordinates, setMinCoordinates] = useState("");
  const [maxCoordinates, setMaxCoordinates] = useState("");
  const [filterCheckbox, setFilterCheckbox] = useState({
    sale: [],
    size: [],
  });
  const [wallet, setWallet] = useState("");
  const [partners, setPartners] = useState(null);

  // ---------------------------
  const [filterArray, setFilterArray] = useState([]);

  //------------------------------
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = window.innerWidth < 800;
  const calSize = (width, height, row, col) => {
    let size;
    let colWidth = Number(width / col).toFixed(2);
    let rowWidth = Number(height / row).toFixed(2);
    size = Math.min(colWidth, rowWidth);

    return size * 2;
  };
  let width = Number(window.screen.availWidth - 90);
  let height = Number(window.screen.availHeight - 60);
  if (window.innerWidth < 800) {
    width = Number(window.innerWidth);
  }
  const ratio = 1 / 7;
  let minimapWidth = (width * ratio).toFixed(2);
  let minimapHeight = (height * ratio).toFixed(2);
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
    navigate("/map?zoom=3");
    let data = data1;
    const canvas = d3
      .select("#canvas")
      .attr("width", width)
      .attr("height", height);
    const context = canvas.node().getContext("2d");
    
    const canvasImg = d3
      .select("#canvas-image")
      .attr("width", width)
      .attr("height", height);
    const contextImg = canvasImg.node().getContext("2d");
    const canvasFilter = d3
      .select("#canvas-filter")
      .attr("width", width)
      .attr("height", height);
    const contextFilter = canvasFilter.node().getContext("2d");
    const map = d3
      .select("#map")
      .append("svg")
      // .attr("width", width)
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(0,0)");
    const g = d3
      .select("#map svg")
      .append("g")
      .attr("width", width)
      .attr("height", height);
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
    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // ======================

    setModal(update(modal, { text: { $set: "Creating map..." } }));
    // drawMap();
    const zoomFactor = 0.5;
    function handleZoom(e) {
      const transform = e.transform;
      
      // transform.k = transform.k * 1.2;
      // transform.x = transform.x * 1.2;
      // transform.y = transform.y * 1.2;
      // navigate(
      //   `/map?zoom=${transform.k}&currentX=${transform.x}&currentY=${transform.y}`
      // );

      d3.select("svg g").attr("transform", transform);
      if (e.sourceEvent !== null) {
        div.transition().duration(100).style("opacity", 0);
      }
      setCurrentZoom(transform.k);

      let dx = -transform.x / transform.k;
      let dy = -transform.y / transform.k;
      if (!isMobile) {
        //   const canvasMiniRect = d3
        //   .select("#canvas-mini-rect")
        //   .attr("width", minimapWidth)
        //   .attr("height", minimapHeight);

        //   const contextMiniRect = canvasMiniRect.node().getContext("2d");
        //   contextMiniRect.clearRect(0, 0, minimapWidth, minimapHeight);
        // // contextMini.fillStyle = "rgba(33,33,55, 1)";
        // // contextMiniRect.fillStyle = "white";
        // contextMiniRect.fillRect(0, 0, minimapWidth, minimapHeight);
        // contextMiniRect.strokeStyle = "red"
        // contextMiniRect.lineWidth = 2;
        // contextMiniRect.strokeRect(2 + dx * ratio, 2 + dy * ratio, minimapWidth / transform.k - 4, minimapHeight / transform.k - 4);
        // contextMiniRect.fill();
        // contextMiniRect.closePath();
        d3.select("#minimapRect").remove();
        let minimapRect = d3
          .select("#mini-map svg g")
          .append("rect")
          .attr("id", "minimapRect")
          .attr("class", "mini-react")
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


      // contextImg.save();
      // contextImg.clearRect(0, 0, width, height);
      // contextImg.translate(transform.x, transform.y);
      // contextImg.scale(transform.k, transform.k);
      // drawImage();
      // contextImg.restore();
      
      // drawFilter(filterArray);
      // filterCombine();
      // drawFilter();
      drawNew();
      // console.log(testa)
      setSearchParams({
        zoom: transform.k,
        currentX: transform.x,
        currentY: transform.y,
      });
    }
    function debounce(fn, delay) {
      var timer = null;
      return function () {
        var context = this,
          args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    }
    function start(e) {
      const transform = e.transform;
      d3.select("svg g").attr("transform", transform);
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
    function drawImage() {
      const myTransform = d3.zoomTransform(d3.select("#map svg").node());
      for(let i=0; i < data.data.length; i++){
        if(data.data[i].img){
          var img = new Image();
          let x = data.data[i].position.colStart * size * myTransform.k;
          let y = data.data[i].position.rowStart * size  * myTransform.k;
          let square = data.data[i].position.colEnd - data.data[i].position.colStart + 1;
          img.src = `/${data.data[i].img}`;
          img.onload = function () {
            contextImg.drawImage(img, myTransform.x + x, myTransform.y + y, square * size  * myTransform.k, square * size * myTransform.k );
          };
        }
      }
      
    }
    // drawImage();
    function drawCanvas() {
      for (let i = 0; i < data.nCol; i++) {
        for (let j = 0; j < data.nRow; j++) {
          let x = i * size;
          let y = j * size;
          context.beginPath();

          //Drawing a rectangle
          context.fillStyle = color.dark;
          context.fillRect(x, y, size, size);
          //Optional if you also sizeant to give the rectangle a stroke
          context.strokeStyle = color.stroke;
          context.lineWidth = 0.5;
          context.strokeRect(x, y, size, size);

          context.fill();
          context.closePath();
        }
      }
    }
    // -----------------------------------

    // ====================================
    let minimap = d3
      .select("#mini-map")
      .append("svg")
      .attr("width", minimapWidth)
      .attr("height", minimapHeight);

    const gMinimap = minimap.append("g").attr("class", "minimap-grid");
    const canvasMini = d3
      .select("#canvas-mini")
      .attr("width", minimapWidth)
      .attr("height", minimapHeight);

   
    const contextMini = canvasMini.node().getContext("2d");
    contextMini.clearRect(0, 0, minimapWidth, minimapHeight);
    contextMini.fillStyle = "rgba(33,33,55, 1)";
    // contextMini.fillStyle = "white";
    contextMini.fillRect(0, 0, minimapWidth, minimapHeight);

    contextMini.fill();
    contextMini.closePath();
    function drawMiniField() {
      for (let i = 0; i < data.data.length; i++) {
        let x = data.data[i].position.colStart * minimapSize;
        let y = data.data[i].position.rowStart * minimapSize;
        let square =
          data.data[i].position.rowEnd - data.data[i].position.rowStart + 1;
        contextMini.beginPath();
        //Drawing a rectangle
        contextMini.fillStyle = color.green;
        //   context.fillStyle = "yellow";
        contextMini.fillRect(
          x,
          y,
          square * minimapSize,
          square * minimapSize
        );
        //Optional if you also sizeant to give the rectangle a stroke
        // contextMini.strokeStyle = color.stroke;

        contextMini.fill();
        contextMini.closePath();
      }
    }
    drawMiniField();
    // ===================
    function chunkArray(ar, chunksize) {
      var R = [];
      if (chunksize <= 0) return ar;
      for (var i = 0; i < ar.length; i += chunksize) {
        R.push(ar.slice(i, i + chunksize));
      }
      return R;
    }
    var dataPool = chunkArray(data.data, 100);
    var poolPosition = 0;
    var iterator;
    var groups = [];
    function updateVisualization() {
      groups = g
        .selectAll("abc")
        .data(dataPool[poolPosition])
        .enter()
        .append("rect")
        .attr("class", "field-init")
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
            return color.green;
          }
          return `url(#${d.id})`;
        })
        .style("stroke-width", "0.1px")
        .style("stroke", color.stroke)
        .on("click", function (e, d) {
          div.style("opacity", 0);
          let active = d3.select(this);
          if (active.attr("class").includes("active")) {
            // reset();
          } else {
            let allField = document.querySelectorAll(".field-init");
            if (allField.length === 0) {
              allField = document.querySelectorAll(".field");
            }
            allField.forEach((a) => a.removeAttribute("id"));
            // active.classed("active", !active.classed("active"));
            active.attr("id", "active");
            // active.style("fill", "pink");
            const size = Number(active.attr("height"));
            // const blurField = d3.select("#blur-init-" + d.id);
            // blurField.style("fill-opacity", 0);
            const x = Number(active.attr("x")) + size / 2;
            const y = Number(active.attr("y")) + size / 2;
            active.style("opacity", 1);
            let currentScale, currentScaleString;
            const myTransform = d3.zoomTransform(d3.select("#map svg").node());
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

            var isMobile = {
              Android: function () {
                return navigator.userAgent.match(/Android/i);
              },
              BlackBerry: function () {
                return navigator.userAgent.match(/BlackBerry/i);
              },
              iOS: function () {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
              },
              Opera: function () {
                return navigator.userAgent.match(/Opera Mini/i);
              },
              Windows: function () {
                return (
                  navigator.userAgent.match(/IEMobile/i) ||
                  navigator.userAgent.match(/WPDesktop/i)
                );
              },
              any: function () {
                return (
                  isMobile.Android() ||
                  isMobile.BlackBerry() ||
                  isMobile.iOS() ||
                  isMobile.Opera() ||
                  isMobile.Windows()
                );
              },
            };
            if (isMobile.any()) {
              // let transform = d3.zoomIdentity
              //   .translate(-x / 2, -y / 2)
              //   .scale(myTransform.k);
              // d3.select("svg")
              //   .transition()
              //   .duration(100)
              //   .call(zoom.transform, transform);
              // setSearchParams({
              //   zoom: myTransform.k,
              //   currentX: Number(-x / 2),
              //   currentY: Number(-y / 2),
              // });
            } else {
              // let transform = d3.zoomIdentity
              //   .translate(width / 2, height / 2)
              //   .scale(myTransform.k)
              //   .translate(Number(-x), Number(-y));
              // d3.select("svg")
              //   .transition()
              //   .duration(100)
              //   .call(zoom.transform, transform);
              // setSearchParams({
              //   zoom: myTransform.k,
              //   currentX: Number(width / 2 - x),
              //   currentY: Number(height / 2 - y),
              // });
            }

            if (!isMobile.any()) {
              div.transition().duration(500).style("opacity", 0.9);
              div
                .html(
                  `<div class="tooltip-img"></div>
                <div class="tooltip-content">
                  <div>Name: ${d.id}</div>
                  <div>Estate: ... </div>
                </div>`
                )
                .style("left", myTransform.x + x * myTransform.k + 90 + "px")
                .style("top", myTransform.y + y * myTransform.k + 60 + "px");
              // .style("left", width / 2 + 90 + "px")
              // .style("top", height / 2 + 60 + "px");
            }

            setField(d);
            showDrawer();
          }
          // Blur
        })
        .on("dblclick", function (e) {
          return e.preventDefault();
        });

      //

      // let fieldsMini = d3
      // .select("#mini-map svg g")
      // .selectAll("abc")
      // .data(dataPool[poolPosition])
      // .enter()
      // .append("rect")
      // .attr("class", "field-init")
      // .attr("x", function (d) {
      //   return d.position.colStart * minimapSize;
      // })
      // .attr("y", function (d) {
      //   return d.position.rowStart * minimapSize;
      // })
      // .attr("width", function (d) {
      //   let area = d.position.colEnd - d.position.colStart;

      //   return (area + 1) * minimapSize;
      // })
      // .attr("height", function (d) {
      //   let area = d.position.rowEnd - d.position.rowStart;
      //   return (area + 1) * minimapSize;
      // })
      // .style("fill", function (d) {
      //   return color.green;
      //   // if (!d.img)
      //   // return `url(#${d.id})`;
      // });

      poolPosition += 1;
      if (poolPosition >= dataPool.length) {
        setModal(update(modal, { show: { $set: false }, text: { $set: "" } }));
        clearInterval(iterator);
      }
    }

    iterator = setInterval(updateVisualization, 10);

    function drawMap() {
      map.append("g").attr("class", "grid-square");
      drawCanvas();

      let fields = d3
        .select("svg g")
        // .selectAll(".fields")
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
            return color.green;
          }
          return `url(#${d.id})`;
        })
        .style("stroke-width", "0.5px")
        .style("stroke", color.stroke)
        .on("click", function (e, d) {
          div.style("opacity", 0);
          let active = d3.select(this);
          let allField = document.querySelectorAll(".field");
          if (active.attr("class").includes("active")) {
            // reset();
          } else {
            allField.forEach((a) => a.classList.remove("active"));
            active.classed("active", !active.classed("active"));
            const size = Number(active.attr("height"));
            // const blurField = d3.select("#blur-init-" + d.id);
            // blurField.style("fill-opacity", 0);
            const x = Number(active.attr("x")) + size / 2;
            const y = Number(active.attr("y")) + size / 2;
            active.style("opacity", 1);
            let currentScale, currentScaleString;
            const myTransform = d3.zoomTransform(d3.select("#map svg").node());
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

            var isMobile = {
              Android: function () {
                return navigator.userAgent.match(/Android/i);
              },
              BlackBerry: function () {
                return navigator.userAgent.match(/BlackBerry/i);
              },
              iOS: function () {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
              },
              Opera: function () {
                return navigator.userAgent.match(/Opera Mini/i);
              },
              Windows: function () {
                return (
                  navigator.userAgent.match(/IEMobile/i) ||
                  navigator.userAgent.match(/WPDesktop/i)
                );
              },
              any: function () {
                return (
                  isMobile.Android() ||
                  isMobile.BlackBerry() ||
                  isMobile.iOS() ||
                  isMobile.Opera() ||
                  isMobile.Windows()
                );
              },
            };
            if (isMobile.any()) {
              let transform = d3.zoomIdentity
                .translate(-x / 2, -y / 2)
                .scale(myTransform.k);
              d3.select("svg")
                .transition()
                .duration(300)
                .call(zoom.transform, transform);
              setSearchParams({
                zoom: myTransform.k,
                currentX: Number(-x / 2),
                currentY: Number(-y / 2),
              });
            } else {
              let transform = d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(myTransform.k)
                .translate(Number(-x), Number(-y));
              d3.select("svg")
                .transition()
                .duration(300)
                .call(zoom.transform, transform);
              setSearchParams({
                zoom: myTransform.k,
                currentX: Number(width / 2 - x),
                currentY: Number(height / 2 - y),
              });
            }

            if (!isMobile.any()) {
              div.transition().duration(500).style("opacity", 0.9);
              div
                .html(
                  `<div class="tooltip-img"></div>
                  <div class="tooltip-content">
                    <div>Name: ${d.id}</div>
                    <div>Estate: ... </div>
                  </div>`
                )
                .style("left", width / 2 + 90 + "px")
                .style("top", height / 2 + 60 + "px");
            }

            setField(d);
            showDrawer();
          }
          // Blur
        })
        .on("dblclick", function (e) {
          return e.preventDefault();
        });
      d3.select("#map svg g")
        .selectAll(".blur-init")
        .data(data.data)
        .enter()
        .append("rect")
        .attr("class", "blur-init")
        .attr("id", function (d) {
          return "blur-init-" + d.id;
        })
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
          return "#323950";
        })
        .style("fill-opacity", 0);
    }
    function drawMinimap() {}

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

  useEffect(() => {}, []);

  const handleFilterSize = async (filter) => {
    const newModal = { show: true, text: "Applying filter ...." };
    setModal(newModal);
    const initBlur = d3.selectAll(".field-init");
    const activeBlur = d3.selectAll(".blur");
    // const query = initBlur.empty() ? (activeBlur.empty() ? ".blur" :".blur-blured") : ".blur-init";
    const query = initBlur.empty() ? ".blur-family" : ".field-init";
    let index = 0;
    d3.selectAll(query).filter(function (d) {
      let area = d.position.rowEnd - d.position.rowStart + 1;
      let condition;
      if (filter["size"].length > 0 && filter["sale"].length > 0) {
        condition =
          filter["size"].includes(area) && filter["sale"].includes(d.sale);
      } else {
        condition =
          filter["size"].includes(area) || filter["sale"].includes(d.sale);
      }
      if (!condition) {
        // d3.select(this).classed("blur-field-active", true)
        // return d3.select(this).classed("blur-family blur-blured field", true)
        return d3.select(this).attr("class", "blur-family blur-blured field");
      }
      index++;
      // return d3.select(this).classed("blur-family blur field", true)
      return d3.select(this).attr("class", "blur-family blur field");
    });

    if (filter["size"].length === 0 && filter["sale"].length === 0) {
      d3.selectAll(".blur-blured").attr("class", "blur-family blur field");
      index = 1;
    }
    drawNew();
    drawNewMini();
    if (index === 0) {
      setModal({
        show: true,
        text: "No results",
        showButton: true,
      });
    } else {
      setTimeout(() => {
        setModal({
          show: false,
          text: "",
        });
      }, 1000);
    }
  };
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const drawNew = () => {
    let canvasFilter = d3.select("#canvas-filter");
    let contextFilter = canvasFilter.node().getContext("2d");
    const transform = d3.zoomTransform(d3.select("#map svg").node());
    const blured = d3.selectAll(".blur-blured");
    contextFilter.save();
    contextFilter.clearRect(0, 0, width, height);
    contextFilter.translate(transform.x, transform.y);
    contextFilter.scale(transform.k, transform.k);
    blured.filter((d) => {
      let square = d.position.rowEnd - d.position.rowStart + 1;

      let x = d.position.colStart * size;
      let y = d.position.rowStart * size;
      contextFilter.beginPath();
      //Drawing a rectangle

      contextFilter.fillStyle = "rgba(0, 0, 0, 0.5)";
      contextFilter.fillRect(x, y, square * size, square * size);
      //Optional if you also sizeant to give the rectangle a stroke
      contextFilter.strokeStyle = color.stroke;
      contextFilter.lineWidth = 0.5;
      // contextMiniFilter.lineWidth = 0.5;
      contextFilter.strokeRect(x, y, square * size, square * size);
      // contextMiniFilter.strokeRect(xmini, ymini, square * minimapSize, square * minimapSize);

      contextFilter.fill();
      contextFilter.closePath();
    });
    contextFilter.restore();
  };
  const drawNewMini = () => {
    const canvasMini = d3.select("#canvas-mini");
    const contextMini = canvasMini.node().getContext("2d");
    const blured = d3.selectAll(".blur-blured");

    

    let data = data1;
    contextMini.save();

    contextMini.clearRect(0, 0, width, height);
    contextMini.clearRect(0, 0, minimapWidth, minimapHeight);
    contextMini.fillStyle = "rgba(33,33,55, 1)";
    // contextMini.fillStyle = "white";
    contextMini.fillRect(0, 0, minimapWidth, minimapHeight);

    contextMini.fill();
    contextMini.closePath();
    // contextMini.translate(2, 2);
    for (let i = 0; i < data.data.length; i++) {
      let x = data.data[i].position.colStart * minimapSize;
      let y = data.data[i].position.rowStart * minimapSize;
      let square =
        data.data[i].position.rowEnd - data.data[i].position.rowStart + 1;
        contextMini.beginPath();
      //Drawing a rectangle
      contextMini.fillStyle = color.green;
      //   context.fillStyle = "yellow";
      contextMini.fillRect(
        x,
        y,
        square * minimapSize,
        square * minimapSize
      );
      //Optional if you also sizeant to give the rectangle a stroke
      // contextMiniField.strokeStyle = color.stroke;

      contextMini.fill();
      contextMini.closePath();
    }
   

    // contextMini.translate(2, 2);
    blured.filter((d) => {
      let square = d.position.rowEnd - d.position.rowStart + 1;

      let xmini = d.position.colStart * minimapSize;
      let ymini = d.position.rowStart * minimapSize;
      contextMini.beginPath();
      //Drawing a rectangle

      contextMini.fillStyle = "rgba(0, 0, 0, 0.7)";
      contextMini.fillRect(
        xmini,
        ymini,
        square * minimapSize,
        square * minimapSize
      );
      //Optional if you also sizeant to give the rectangle a stroke
      // contextMiniFilter.strokeStyle = color.stroke;
      // contextMiniFilter.lineWidth = 0.5;
      // contextMiniFilter.strokeRect(xmini, ymini, square * minimapSize, square * minimapSize);

      contextMini.fill();
      contextMini.closePath();
    });
    contextMini.restore();
  };
  const resetFilterCanvas = () => {
    let canvasFilter = d3.select("#canvas-filter");
    let contextFilter = canvasFilter.node().getContext("2d");
    const transform = d3.zoomTransform(d3.select("#map svg").node());
    contextFilter.save();
    contextFilter.clearRect(0, 0, width, height);
    contextFilter.translate(transform.x, transform.y);
    contextFilter.scale(transform.k, transform.k);
    contextFilter.restore();
  };

  const filterCoordinates = () => {
    const newModal = { show: true, text: "Applying filter ...." };
    setModal(newModal);
    let rStart, cStart, rEnd, cEnd;

    const initBlur = d3.selectAll(".field-init");
    const activeBlur = d3.selectAll(".blur");
    const query = initBlur.empty()
      ? activeBlur.empty()
        ? ".blur-blured"
        : ".blur"
      : ".field-init";

    let fields = d3.selectAll(query);
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
    let index = 0;
    d3.selectAll(query).filter(function (d) {
      if (!active.includes(d)) {
        // d3.select(this).classed("blur-field-active", true)

        return d3.select(this).attr("class", "blur-family blur-blured field");
      }
      index++;

      return d3.select(this).attr("class", "blur-family blur field");
    });
    drawNew();
    drawNewMini();
    if (index === 0) {
      setModal({
        show: true,
        text: "No results",
        showButton: true,
      });
    } else {
      setModal({
        show: false,
        text: "",
      });
    }
  };

  // const filterCombine = (filter, type) => {
  //   let canvasFilter = d3.select("#canvas-filter");
  //   let contextFilter = canvasFilter.node().getContext("2d");
  //   const transform = d3.zoomTransform(d3.select("#map svg").node());
  //   if (
  //     filterCheckbox["size"].length === 0 &&
  //     filterCheckbox["sale"].length === 0 &&
  //     minCoordinates === "" &&
  //     maxCoordinates === ""
  //   ) {
  //     contextFilter.save();
  //     contextFilter.clearRect(0, 0, width, height);
  //     contextFilter.restore();
  //     setTimeout(() => {
  //       setModal({
  //         show: false,
  //         text: "",
  //       });
  //     }, 1000);
  //     return;
  //   }
  //   contextFilter.save();
  //   contextFilter.clearRect(0, 0, width, height);

  //   contextFilter.translate(transform.x, transform.y);
  //   contextFilter.scale(transform.k, transform.k);
  //   // handleFilterSize(filterCheckbox);
  //   let data = data1;
  //   let filterArrayLocal = [];
  //   for (let i = 0; i < data.data.length; i++) {
  //     let square =
  //       data.data[i].position.rowEnd - data.data[i].position.rowStart + 1;

  //     let x = data.data[i].position.colStart * size;
  //     let y = data.data[i].position.rowStart * size;
  //     contextFilter.beginPath();
  //     //Drawing a rectangle
  //     if (filterCheckbox["size"].includes(square)) {
  //       filterArrayLocal.push(data.data[i]);

  //       contextFilter.fillStyle = "rgba(0, 0, 0, 0)";
  //     } else {
  //       contextFilter.fillStyle = "rgba(0, 0, 0, 0.5)";
  //     }

  //     contextFilter.fillRect(x, y, square * size, square * size);
  //     //Optional if you also sizeant to give the rectangle a stroke
  //     contextFilter.strokeStyle = color.stroke;
  //     contextFilter.lineWidth = 0.5;
  //     contextFilter.strokeRect(x, y, square * size, square * size);

  //     contextFilter.fill();
  //     contextFilter.closePath();
  //   }
  //   contextFilter.restore();

  //   setFilterArray(filterArrayLocal);

  //   setTimeout(() => {
  //     setModal({
  //       show: false,
  //       text: "",
  //     });
  //   }, 1000);
  // };
  const resetFilter = () => {
    setFilterCheckbox({ sale: [], size: [] });
    setMinCoordinates("");
    setMaxCoordinates("");
    setWallet("");
    setPartners(null);
    setModal({
      show: false,
      text: "",
      showButton: false,
    });
    d3.selectAll(".blur-blured").attr("class", "blur-family blur field");
    drawNew();
    drawNewMini();
  };

  const handleInputRange = (e) => {
    let data = data1;
    let direction = 1,
      factor = 0.5,
      target_zoom = 1,
      center = [width / 2, height / 2],
      translate0 = [],
      l = [],
      view = {};
    const preZoom = Number(searchParams.get("zoom"));
    const preX = Number(searchParams.get("currentX"));
    const preY = Number(searchParams.get("currentY"));
    if (e.target.id === "mobi_zoom_in" || e.target.id === "mobi_zoom_out") {
      direction = e.target.id === "mobi_zoom_in" ? 1 : -1;
      target_zoom = preZoom + factor * direction;
      view = { x: preX, y: preY, k: preZoom };
      if (target_zoom < 1 || target_zoom > 10) {
        return false;
      }
      translate0 = [
        (center[0] - view.x) / view.k,
        (center[1] - view.y) / view.k,
      ];
      view.k = target_zoom;
      l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];
      view.x += center[0] - l[0];
      view.y += center[1] - l[1];
      let transform = d3.zoomIdentity.translate(view.x, view.y).scale(view.k);
      d3.select("svg")
        .transition()
        .duration(300)
        .call(zoom.transform, transform);
      d3.select("svg g").attr(
        "transform",
        `translate(${view.x},${view.y})scale(${view.k})`
      );

      let context = d3.select("#canvas").node().getContext("2d");
      // context.resetTransform();
      // context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, width, height);
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(view.x, view.y);
      context.scale(view.k, view.k);

      context.clearRect(0, 0, width, height);
      for (let i = 0; i < data.nCol; i++) {
        for (let j = 0; j < data.nRow; j++) {
          let x = i * size;
          let y = j * size;
          context.beginPath();

          //Drawing a rectangle
          context.fillStyle = color.dark;
          context.fillRect(x, y, size, size);
          //Optional if you also sizeant to give the rectangle a stroke
          context.strokeStyle = color.stroke;
          context.lineWidth = 0.5;
          context.strokeRect(x, y, size, size);

          context.fill();
          context.closePath();
        }
      }
      context.restore();

      setSearchParams({ zoom: view.k, currentX: view.x, currentY: view.y });
    } else {
      if (e.target.id === "zoom_range") {
        target_zoom = Number(e.target.value);
      } else {
        direction = e.target.id === "zoom_in" ? 1 : -1;
        target_zoom = preZoom + factor * direction;
      }
      view = { x: preX, y: preY, k: preZoom };

      if (target_zoom < 1 || target_zoom > 10) {
        return false;
      }
      translate0 = [
        (center[0] - view.x) / view.k,
        (center[1] - view.y) / view.k,
      ];
      view.k = target_zoom;

      l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];
      view.x += center[0] - l[0];
      view.y += center[1] - l[1];
      let transform = d3.zoomIdentity.translate(view.x, view.y).scale(view.k);
      d3.select("#mini-map svg #minimapRect").remove();
      let dx = -view.x / view.k;
      let dy = -view.y / view.k;

      d3.select("#minimapRect").remove();
      let minimapRect = d3
        .select("#mini-map svg g")
        .append("rect")
        .attr("id", "minimapRect")
        .attr("width", minimapWidth / view.k - 4)
        .attr("height", minimapHeight / view.k - 4)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("transform", `translate(${2 + dx * ratio},${2 + dy * ratio})`);

      d3.select("svg")
        .transition()
        .duration(300)
        .call(zoom.transform, transform);
      d3.select("svg g").attr(
        "transform",
        `translate(${view.x}, ${view.y})scale(${view.k})`
      );

      let context = d3.select("#canvas").node().getContext("2d");
      // context.resetTransform();
      // context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, width, height);
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(view.x, view.y);
      context.scale(view.k, view.k);

      context.clearRect(0, 0, width, height);
      for (let i = 0; i < data.nCol; i++) {
        for (let j = 0; j < data.nRow; j++) {
          let x = i * size;
          let y = j * size;
          context.beginPath();

          //Drawing a rectangle
          context.fillStyle = color.dark;
          context.fillRect(x, y, size, size);
          //Optional if you also sizeant to give the rectangle a stroke
          context.strokeStyle = color.stroke;
          context.lineWidth = 0.5;
          context.strokeRect(x, y, size, size);

          context.fill();
          context.closePath();
        }
      }
      context.restore();

      setSearchParams({ zoom: view.k, currentX: view.x, currentY: view.y });
    }
  };
  const changeDisplayMinimap = () => {
    setDisplayMinimap(!displayMinimap);
  };
  const handleChangeCheckbox = (e) => {
    const newModal = { show: true, text: "Applying filter ...." };
    setModal(newModal);
    const name = e.target.name;
    const value = Number(e.target.value);
    const newFilter = filterCheckbox;

    const array = ["sale", "size"];
    // sale: [],
    // size: [],

    if (array.includes(name)) {
      if (newFilter[name].includes(value)) {
        newFilter[name] = filterCheckbox[name].filter((item) => item !== value);
      } else {
        newFilter[name].push(value);
      }
    } else {
      newFilter[name] = value;
    }
    setFilterCheckbox(newFilter);

    // filterCombine();
    handleFilterSize(newFilter);
  };
  const filterWallet = () => {
    const newModal = { show: true, text: "Applying filter ...." };
    setModal(newModal);
    const initBlur = d3.selectAll(".field-init");
    const activeBlur = d3.selectAll(".blur");
    const query = initBlur.empty()
      ? activeBlur.empty()
        ? ".blur-blured"
        : ".blur"
      : ".field-init";
    let index = 0;
    d3.selectAll(query).filter(function (d) {
      if (d.wallet === wallet) {
        index++;
        return d3.select(this).attr("class", "blur-family blur field");
      }
      return d3.select(this).attr("class", "blur-family blur-blured field");
    });
    if (index === 0) {
      setModal({
        show: true,
        text: "No results",
        showButton: true,
      });
    } else {
      setTimeout(() => {
        setModal({
          show: false,
          text: "",
        });
      }, 500);
    }
  };
  const filterPartners = (value) => {
    setPartners(value);
    const newModal = { show: true, text: "Applying filter ...." };
    setModal(newModal);
    const initBlur = d3.selectAll(".field-init");
    const activeBlur = d3.selectAll(".blur");
    const query = initBlur.empty()
      ? activeBlur.empty()
        ? ".blur-blured"
        : ".blur"
      : ".field-init";
    let index = 0;
    d3.selectAll(query).filter(function (d) {
      if (d.partners === Number(value)) {
        index++;
        return d3
          .select(this)

          .attr("class", "blur-family blur field");
      }
      return d3
        .select(this)

        .attr("class", "blur-family blur-blured field");
    });
    drawNew();
    drawNewMini();
    if (index === 0) {
      setModal({
        show: true,
        text: "No results",
        showButton: true,
      });
    } else {
      setTimeout(() => {
        setModal({
          show: false,
          text: "",
        });
      }, 500);
    }
  };
  const handleChangeSelect = (value) => {
    let data = data1;
    const fieldInit = d3.selectAll("#map .field-init");
    const query = fieldInit.empty()
      ? ".field": ".field-init";
      const field = d3.selectAll(query);
    const preZoom = Number(searchParams.get("zoom"));
    const context = d3.select("#canvas").node().getContext("2d");
    field.filter(function (d) {
      if (d.company === Number(value)) {
        const active = d3.select(this);
        const size = Number(active.attr("height"));
        const x = Number(active.attr("x")) + size / 2;
        const y = Number(active.attr("y")) + size / 2;
        let transform = d3.zoomIdentity
          // .translate(width / 2, height / 2)
          .scale(preZoom)
          .translate(
            Number(-x + width / (2 * preZoom)),
            Number(-y + height / (2 * preZoom))
          );
        d3.select("svg")
          .transition()
          .duration(500)
          .call(zoom.transform, transform);
        setSearchParams({
          zoom: preZoom,
          currentX: Number(-x + width / (2 * preZoom)),
          currentY: Number(-y + height / (2 * preZoom)),
        });
        d3.select("svg g").attr("transform", transform);
        context.clearRect(0, 0, width, height);
        context.save();
        context.scale(preZoom, preZoom);
        context.translate(
          Number(-x + width / (2 * preZoom)),
          Number(-y + height / (2 * preZoom))
        );

        context.clearRect(0, 0, width, height);
        for (let i = 0; i < data.nCol; i++) {
          for (let j = 0; j < data.nRow; j++) {
            let x = i * size;
            let y = j * size;
            context.beginPath();

            //Drawing a rectangle
            // context.fillStyle = color.black;
            context.fillStyle = color.dark;
            context.fillRect(x, y, size, size);
            //Optional if you also sizeant to give the rectangle a stroke
            context.strokeStyle = color.stroke;
            context.lineWidth = 0.5;
            context.strokeRect(x, y, size, size);

            context.fill();
            context.closePath();
          }
        }
        context.restore();

        let dx = -transform.x / transform.k;
        let dy = -transform.y / transform.k;

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
    });
  };
  return (
    <div className="App">
      {modal.show && (
        <Modal
          text={modal.text}
          resetFilter={resetFilter}
          showButton={modal.showButton}
          show={modal.show}
        />
      )}
      <Information
        visible={visible}
        field={field}
        isEmpty={isEmpty}
        onClose={onClose}
      />
      <div className={cx("nav")}>Nav</div>
      <Action
        submit={filterCoordinates}
        // submit={drawFilter}
        visibleAction={visibleAction}
        setVisibleAction={setVisibleAction}
        handleFilterSize={handleFilterSize}
        setMin={setMinCoordinates}
        setMax={setMaxCoordinates}
        min={minCoordinates}
        max={maxCoordinates}
        filterCheckbox={filterCheckbox}
        handleChangeCheckbox={handleChangeCheckbox}
        setWallet={setWallet}
        wallet={wallet}
        filterWallet={filterWallet}
        filterPartners={filterPartners}
        resetFilter={resetFilter}
        partners={partners}
      />

      <div className={cx("container")}>
        <div className={cx("menu")}>Menu</div>
        <div id="map-container">
          <canvas id="canvas"></canvas>
          <div id="map"></div>
          <canvas id="canvas-image"></canvas>
          <canvas id="canvas-filter"></canvas>
        </div>

        <div
          className={cx("minimap-container")}
          style={{
            left: `${visibleAction ? "400px" : "200px"}`,
            pointerEvents: displayMinimap ? "all" : "none",
          }}
        >
          <canvas
            id="canvas-mini"
            style={{
              visibility: `${displayMinimap ? "visible" : "hidden"}`,
              pointerEvents: displayMinimap ? "all" : "none",
              transform: `translate(${!displayMinimap ? "-500px" : "0px"})`,
            }}
          ></canvas>
          <div
            id="mini-map"
            style={{
              height: minimapHeight + 4,
              width: minimapWidth + 30,
              visibility: `${displayMinimap ? "visible" : "hidden"}`,
              pointerEvents: displayMinimap ? "all" : "none",
              transform: `translate(${!displayMinimap ? "-9999px" : "0px"})`,
            }}
          >
            <div className={cx("inputrange-wrapper")} id="input-range-minimap">
              <button id="zoom_in" onClick={(e) => handleInputRange(e)}>
                +
              </button>
              <input
                id="zoom_range"
                style={{ width: minimapHeight - 42 }}
                onChange={(e) => handleInputRange(e)}
                type="range"
                className={cx("input-range")}
                value={Number(searchParams.get("zoom"))}
                min={1}
                max={10}
                step={0.5}
              />
              <button id="zoom_out" onClick={(e) => handleInputRange(e)}>
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
          <div
            className={cx("select-filter-container")}
            style={{
              visibility: `${displayMinimap ? "visible" : "hidden"}`,
              pointerEvents: displayMinimap ? "all" : "none",
              transform: `translate(${!displayMinimap ? "-500px" : "0px"})`,
            }}
          >
            <Select
              defaultValue="Choose select"
              className={cx("select-filter")}
              onChange={handleChangeSelect}
            >
              <Option value="1">binance</Option>
              <Option value="2">Lucy</Option>
            </Select>
          </div>
        </div>
        <div className={cx("mobile")}>
          <div className={cx("mobile-menu")}>
            <MenuOutlined />
          </div>
          <div className={cx("mobile-zoom")}>
            <div id="mobi_zoom_in" onClick={(e) => handleInputRange(e)}>
              +
            </div>
            <div className={cx("divider")}></div>
            <div id="mobi_zoom_out" onClick={(e) => handleInputRange(e)}>
              -
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Map;
