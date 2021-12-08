import "./App.css";
import * as d3 from "d3";
import { nest } from "d3-collection";
import { useEffect, useState } from "react";
import { Drawer, Button } from "antd";
import 'antd/dist/antd.css';
const data1 = {
  nRow: 20,
  nCol: 20,
  data: [
    {
      id: 1,
      position: [
        [2, 3],
        [2, 3],
      ],
    },
    { id: 2, position: [[2], [4]] },
    { id: 4, position: [[2], [5]] },
    { id: 6, position: [[2], [6]] },
    { id: 3, position: [[3], [4]] },
    { id: 5, position: [[3], [5]] },
    {
      id: 7,
      position: [
        [3, 4],
        [6, 7],
      ],
    },
    {
      id: 8,
      position: [
        [4, 5],
        [2, 3],
      ],
      name: "USA",
      img: "usa.png",
    },
    { id: 9, position: [[4], [4]] },
    { id: 10, position: [[4], [5]] },
    { id: 11, position: [[5], [4]] },
    { id: 12, position: [[5], [5]] },
    { id: 13, position: [[6], [2]] },
    { id: 14, position: [[6], [3]] },
    {
      id: 15,
      position: [
        [6, 7, 8],
        [4, 5, 6],
      ],
    },
    { id: 16, position: [[7], [2]] },
    { id: 17, position: [[7], [3]] },
    { id: 18, position: [[8], [2]] },
    { id: 19, position: [[8], [3]] },
    { id: 20, position: [[9], [2]] },
    { id: 21, position: [[9], [3]] },
    { id: 22, position: [[9], [4]] },
    { id: 23, position: [[9], [5]] },
    { id: 24, position: [[9], [6]] },
    {
      id: 25,
      position: [
        [9, 10],
        [7, 8],
      ],
    },
    {
      id: 26,
      position: [
        [10, 11],
        [1, 2],
      ],
    },
    {
      id: 27,
      position: [[10], [3]],
      name: "France",
      img: "france.png",
    },
    { id: 28, position: [[10], [4]] },
    { id: 29, position: [[10], [5]] },
    { id: 30, position: [[10], [6]] },
    { id: 31, position: [[11], [3]] },
    { id: 32, position: [[11], [4]] },
    { id: 33, position: [[11], [5]] },
    { id: 34, position: [[11], [6]] },
    { id: 35, position: [[12], [0]] },
    { id: 36, position: [[12], [1]] },
    { id: 37, position: [[12], [2]] },
    { id: 38, position: [[12], [3]] },
    { id: 39, position: [[13], [0]] },
    { id: 40, position: [[13], [1]] },
    { id: 41, position: [[13], [2]] },
    { id: 42, position: [[13], [3]] },
    { id: 43, position: [[13], [4]] },
    { id: 44, position: [[13], [5]] },
    { id: 45, position: [[13], [6]] },
    { id: 53, position: [[13], [7]] },
    {
      id: 47,
      position: [
        [14, 15],
        [0, 1],
      ],
    },
    {
      id: 48,
      position: [
        [14, 15, 16, 17],
        [2, 3, 4, 5],
      ],
      name: "Viet Nam",
      img: "vn.svg.png",
    },
    { id: 49, position: [[14], [6]] },
    { id: 54, position: [[14], [7]] },
    { id: 50, position: [[15], [6]] },
    { id: 55, position: [[15], [7]] },
    { id: 51, position: [[16], [6]] },
    { id: 56, position: [[16], [7]] },
    { id: 52, position: [[17], [6]] },
    { id: 57, position: [[17], [7]] },
  ],
};
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
  useEffect(() => {
    Promise.all([d3.csv("publication-grids.csv")]).then((result) => {
      let data = data1;
      // let nRow = new Set();
      // let nCol = new Set();
      // data.forEach((a) => {
      //   nRow.add(Number(a.row));
      //   nCol.add(Number(a.col));
      // });
      // nRow = Array.from(nRow);
      // nCol = Array.from(nCol);

      let nRow = data.nRow;
      let nCol = data.nCol;
      const map = d3
        .select("#map")
        .append("svg")
        .attr("width", `calc(100vw - 95px - 130px)`)
        .attr("height", `calc(100vh)`);
      // .attr("transform","translate(-150,-300) scale(0.5,0.5)");
      let width = 1200;
      // let height = map._groups[0][0].height.baseVal.value;
      let height = 2000;
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
        .attr("class", "col")
        
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

      // --------------------------
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
        
      // ======================
      function handleZoom(e, a) {
        let transform = e.transform;
        // let modifiedTransform = d3.zoomIdentity
        //   .scale(0.5 / transform.k)
        //   .translate(-transform.x + 50, -transform.y + 50);

        // minimapRect
        //   .attr("width", (width / 12) * modifiedTransform.k)
        //   .attr("height", (height / 12) * modifiedTransform.k)
        //   .attr("stroke", "red")
        //   .attr("stroke-width", 5 / modifiedTransform.k)
        //   // .attr('stroke-dasharray', 5/modifiedTransform.k )
        //   .attr("fill", "none")
        //   .attr("transform", modifiedTransform);

        d3.select("svg g")
        .attr("transform", transform)
        // .style('transform', 'scale(' + e.transform.k + ')');
      }

      let zoom = d3
        .zoom()
        .on("zoom", handleZoom)
        .scaleExtent([0.6, 3])
        .translateExtent([
          [0, 0],
          [width, 1200],
        ]);
      d3.select("svg").call(zoom);
      
      // ---------------------------------------------
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
          return (d.position[0][0]) * size;
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
        });

      function reset() {
        d3.select("svg g")
          .transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(-95, -60).scale(1));
      }
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

      let minimapRect = minimap.append("rect").attr("id", "minimapRect");
      // let fields = row
      // .select(".fields")
      // .data(data)
      // .enter()
      // .append("rect")
      // .attr("class", "field")
      // .attr("x", function (d) {
      //   return (d.col - 1) * size;
      // })
      // .attr("y", function (d) {
      //   return (d.row - 1) * size;
      // })
      // .attr("width", size)
      // .attr("height", size)
      // .style("cursor", "pointer")
      // .style("fill", function (d) {
      //   if (d.img === "green.jpg") return "green";
      //   return `url(#${d.id})`;
      // })
      // .style("stroke", "black")
      // .on("click", function (e, d) {
      //   let active = d3.select(this);
      //   if (active.attr("class").includes("active")) {
      //     reset();
      //   } else {
      //     let allField = document.querySelectorAll(".field");
      //     allField.forEach((a) => a.classList.remove("active"));
      //     active.classed("active", !active.classed("active"));
      //     // field.style("fill", "red")
      //     active.style("opacity", 1);
      //     map
      //       .transition()
      //       .duration(1000)
      //       .call(
      //         zoom.transform,
      //         d3.zoomIdentity
      //           .translate(width / 2, height / 2)
      //           .scale(1.5)
      //           .translate(-+active.attr("x"), -+active.attr("y"))
      //       );
      //     setField(d);
      //   }
      // });
      // let gridRow = map.append("g").attr("class", "grid-square");
      // let array = [];
      // for (let i = 0; i <= Math.max(...nCol) + 1; i++) {
      //   let row = [];
      //   for (let j = 0; j <= Math.max(...nRow) + 1; j++) {
      //     let x = i * size;
      //     let y = j * size;
      //     row.push({ x, y });
      //   }
      //   array.push(row);
      // }
      // let row = gridRow
      //   .selectAll(".row")
      //   .data(array)
      //   .enter()
      //   .append("g")
      //   .attr("class", "col");
      // let col = row
      //   .selectAll(".col")
      //   .data(function (d) {
      //     return d;
      //   })
      //   .enter()
      //   .append("rect")
      //   .attr("class", "square")
      //   .attr("x", function (d) {
      //     return d.x;
      //   })
      //   .attr("y", function (d) {
      //     return d.y;
      //   })
      //   .attr("width", size)
      //   .attr("height", size)
      //   .style("fill", "#212137")
      //   .style("stroke", "black");

      // var brush = d3.brush()
      // .extent([[0, 0], [200, 200]])
      // .on("start brush", brushed);
      // var projection = d3.geoEquirectangular();
      // var path = d3.geoPath().projection(projection);
      // var miniProjection = d3.geoEquirectangular();
      // var miniPath = d3.geoPath().projection(miniProjection);
      // ---------------------------------

      //  ------------------------------
    }); //Promise
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
    for(var prop in obj) {
      if(Object.prototype.hasOwnProperty.call(obj, prop)) {
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
            style={{marginTop: 60}}
          >
            {
              (!isEmpty(field) && visible) &&<>
              <div>Name: {field.name || field.id}</div>
            <div>Position: {field.position[0][0]} x {field.position[1][0]}</div>
            <div>Area: {field.position[0].length} x {field.position[0].length}</div>
            <img src={field.img || "green.jpg"} /> </>
            }
            
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
