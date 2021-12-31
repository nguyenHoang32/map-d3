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
import { color, inRange, isEmpty } from "../../ultis.js";
const cx = cn.bind(styles);

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
  const [wallet,setWallet] = useState("");
  const [partners, setPartners] = useState(null);
  //------------------------------
  const [searchParams, setSearchParams] = useSearchParams();
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
  const ratio = 1 / 4.5;
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
    var div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // ======================
    drawMinimap();

    setModal(update(modal, { text: { $set: "Creating map..." } }));
    drawMap();
    const zoomFactor = 0.5;
    function handleZoom(e) {
      console.log("zoom");
      const transform = e.transform;
      // navigate(
      //   `/map?zoom=${transform.k}&currentX=${transform.x}&currentY=${transform.y}`
      // );
      setSearchParams({
        zoom: transform.k,
        currentX: transform.x,
        currentY: transform.y,
      });

      d3.select("svg g").attr("transform", transform);
      if (e.sourceEvent !== null) {
        div.transition().duration(100).style("opacity", 0);
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
    function drawMap() {
      map.append("g").attr("class", "grid-square");
      drawCanvas();

      let fields = d3
        .select("svg g")
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
            return color.green;
          }
          return `url(#${d.id})`;
        })
        .style("stroke-width", "0.5px")
        .style("stroke", color.stroke)
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
            const blurField = d3.select("#blur-init-" + d.id);
            blurField.style("fill-opacity", 0);
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
                zoom: currentScale,
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
                zoom: currentScale,
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
        .attr("id", function(d){
          return "blur-init-"+ d.id;
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
    function drawMinimap() {
      let minimap = d3
        .select("#mini-map")
        .append("svg")
        .attr("width", minimapWidth)
        .attr("height", minimapHeight);

      const canvas = d3
        .select("#canvas")
        .attr("width", width)
        .attr("height", height);

      minimap.append("g").attr("class", "minimap-grid");
      const canvasMini = d3
        .select("#canvas-mini")
        .attr("width", minimapWidth)
        .attr("height", minimapHeight);
      const contextMini = canvasMini.node().getContext("2d");
      contextMini.clearRect(0, 0, minimapWidth, minimapHeight);
      contextMini.fillStyle = "#212137";
      contextMini.fillRect(0, 0, minimapWidth, minimapHeight);

      contextMini.fill();
      contextMini.closePath();

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
          if (!d.img) return color.green;
          return `url(#${d.id})`;
        });

      d3.select("#mini-map svg g")
        .selectAll(".blur-init")
        .data(data.data)
        .enter()
        .append("rect")
        .attr("class", "blur-init")
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
    setModal(update(modal, { show: { $set: false }, text: { $set: "" } }));
  }, []);
  const handleFilterSize = async (filter) => {
    setModal({ show: true, text: "Applying filter..." });
    const initBlur = d3.selectAll(".blur-init");
    const activeBlur = d3.selectAll(".blur")
    const query = initBlur.empty() ? (activeBlur.empty() ? ".blur-blured"  :".blur") : ".blur-init";
    let index = 0;
    d3.selectAll(query)
      .filter(function (d) {
        let area = d.position.rowEnd - d.position.rowStart + 1;
        let condition;
        if(filter["size"].length > 0 && filter["sale"].length > 0){
          condition = filter["size"].includes(area) && filter["sale"].includes(d.sale)
        }else{
          condition = filter["size"].includes(area) || filter["sale"].includes(d.sale)
        }
        if (!condition) {
          // d3.select(this).classed("blur-field-active", true)
          return d3.select(this).style("fill-opacity", 0.5)
          .attr("class", "blur-blured")
        }
        index++;
        return d3.select(this).style("fill-opacity", 0)
        .attr("class", "blur")
      })
      
    if (filter["size"].length === 0 && filter["sale"].length === 0) {
      d3.selectAll(".blur-blured").style("fill-opacity", 0).attr("class", "blur");
      index = 1;
    }
   
    if(index === 0){
      setModal({
        show: true,
        text: "No results",
        showButton: true
      });
    }else{
      setTimeout(() => {
        setModal({
          show: false,
          text: "",
        });
      }, 1000)
    }
    
  };
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const filterCoordinates = () => {
    setModal({
      show: true,
      text: "Applying filter...",
    });
    let rStart, cStart, rEnd, cEnd;

    
    const initBlur = d3.selectAll(".blur-init");
    const activeBlur = d3.selectAll(".blur")
    const query = initBlur.empty() ? (activeBlur.empty() ? ".blur-blured"  :".blur") : ".blur-init";

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
    d3.selectAll(query)
      .filter(function (d) {
        if (!active.includes(d)) {
          // d3.select(this).classed("blur-field-active", true)
          
          return d3.select(this).style("fill-opacity", 0.5)
          .attr("class", "blur-blured")
        }
        index++;
        return d3.select(this).style("fill-opacity", 0)
        .attr("class", "blur")
      })
      
     
      
      if(index === 0){
        setModal({
          show: true,
          text: "No results",
          showButton: true
        });
      }else{
        setModal({
          show: false,
          text: "",
        });
  
      }
  };
  const resetFilter = () => {
setFilterCheckbox({sale: [], size: []})
  setMinCoordinates("");
  setMaxCoordinates("");
  setWallet("");
  setPartners(null);
  setModal({
    show: false,
    text: "",
    showButton: false
  });
  d3.selectAll(".blur-blured").style("fill-opacity", 0).attr("class", "blur");
  }
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
          context.fillStyle = color.black;
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
          context.fillStyle = color.black;
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
    const name = e.target.name;
    const value = Number(e.target.value);
    const newFilter = filterCheckbox;
    
    const array = ["sale", "size"]
    // sale: [],
    // size: [],
    
    if(array.includes(name)){
      if(newFilter[name].includes(value)){
        newFilter[name] = filterCheckbox[name].filter(item => item !== value);
      }else{
        newFilter[name].push(value);
      }
    }else{
      newFilter[name] = value;
    }
    setFilterCheckbox(newFilter);
    handleFilterSize(newFilter);
  }
  const filterWallet = () => {
    setModal({
      show: true,
      text: "Applying filter...",
    });
    const initBlur = d3.selectAll(".blur-init");
    const activeBlur = d3.selectAll(".blur");
    const query = initBlur.empty() ? (activeBlur.empty() ? ".blur-blured"  :".blur") : ".blur-init";
    let index = 0;
    d3.selectAll(query)
    .filter(function (d) {
     if(d.wallet === wallet){
       index++;
       return d3.select(this).style("fill-opacity", 0)
       .attr("class", "blur")
     }
     return d3.select(this).style("fill-opacity", 0.5)
     .attr("class", "blur-blured")
    })
    if(index === 0){
      setModal({
        show: true,
        text: "No results",
        showButton: true
      });
    }else{
      setTimeout(() => {
        setModal({
          show: false,
          text: "",
        });
      }, 1000)

    }
    
  }
  const filterPartners = (value) => {
    setPartners(value);
    setModal({
      show: true,
      text: "Applying filter...",
    });
    const initBlur = d3.selectAll(".blur-init");
    const activeBlur = d3.selectAll(".blur");
    const query = initBlur.empty() ? (activeBlur.empty() ? ".blur-blured"  :".blur") : ".blur-init";
    let index = 0;
    d3.selectAll(query).filter(function(d){
      if(d.partners === Number(value)){
        index++;
        return d3.select(this).style("fill-opacity", 0)
        .attr("class", "blur")
      }
      return d3.select(this).style("fill-opacity", 0.5)
      .attr("class", "blur-blured")
    })
    if(index === 0){
      setModal({
        show: true,
        text: "No results",
        showButton: true
      });
    }else{
      setTimeout(() => {
        setModal({
          show: false,
          text: "",
        });
      }, 1000)

    }
  }
  
  return (
    <div className="App">
      {modal.show && <Modal text={modal.text}  resetFilter={resetFilter} showButton={modal.showButton}/>}
      <Information
        visible={visible}
        field={field}
        isEmpty={isEmpty}
        onClose={onClose}
      />
      <div className={cx("nav")}>Nav</div>
      <Action
        submit={filterCoordinates}
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
        </div>

        <div
          className={cx("minimap-container")}
          style={{
            left: `${visibleAction ? "400px" : "200px"}`,
            pointerEvents: displayMinimap ? "all" : "none",
          }}
        >
          <canvas id="canvas-mini"></canvas>
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
