import "./App.css";
import * as d3 from "d3";
import { nest } from "d3-collection";
import { useEffect, useState } from "react";

function App() {
  const [field, setField] = useState({});
  let width = 800;
  let height = 600;
  const calSize = (width, height, row, col) => {
    let size;
    let colWidth = Math.floor(width / col);
    let rowWidth = Math.floor(height / row);
    size = Math.min(colWidth, rowWidth);
    console.log(size);
    return size;
  };
  useEffect(() => {
    Promise.all([d3.csv("publication-grids.csv")]).then((result) => {
      let data = result[0];
      let nRow = new Set();
      let nCol = new Set();
      data.forEach((a) => {
        nRow.add(Number(a.row));
        nCol.add(Number(a.col));
      });
      nRow = Array.from(nRow);
      nCol = Array.from(nCol);
      const size = calSize(width, height, Math.max(...nRow), Math.max(...nCol));
      const map = d3
        .select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      let gridRow = map.append("g").attr("class", "grid-square");
      let array = [];
      for (let i = 0; i <= Math.max(...nCol) + 1; i++) {
        let row = [];
        for (let j = 0; j <= Math.max(...nRow) + 1; j++) {
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
        .style("fill", "#B2B1B9")
        .style("stroke", "black");

      // --------------------------
      let defs = map.append("defs");
      defs
        .append("pattern")
        .attr("id", "jon-snow")
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
        .data(data)
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
          return d.img;
        });

      // ======================
      function handleZoom(e,a) {
        let transform = e.transform;
        let modifiedTransform = d3.zoomIdentity.scale( 0.5/transform.k ).translate( -transform.x, -transform.y );
        // console.log(e.target)
        console.log(e)
        if(e.sourceEvent !== null){
          minimapRect
          .attr('width', e.sourceEvent.pageX/3 )
          .attr('height', e.sourceEvent.pageY/3 )
          .attr('stroke', 'red')
          .attr('stroke-width', 5/modifiedTransform.k )
          .attr('stroke-dasharray', 5/modifiedTransform.k )
          .attr('fill', 'none')
          .attr('transform', modifiedTransform);
        }
        
        d3.select("svg g").attr("transform", e.transform);
 }
        

      
      let zoom = d3
        .zoom()
        .on("zoom", handleZoom)
        .scaleExtent([1, 1.6])
        .translateExtent([
          [0, 0],
          [width, height],
        ]);

      d3.select("svg g").call(zoom);

      // ---------------------------------------------
      let fields = row
        .select(".fields")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "field")
        .attr("x", function (d) {
          return (d.col - 1) * size;
        })
        .attr("y", function (d) {
          return (d.row - 1) * size;
        })
        .attr("width", size)
        .attr("height", size)
        .style("cursor", "pointer")
        .style("fill", function (d) {
          if (d.img === "green.jpg") return "green";
          return `url(#${d.id})`;
        })
        .style("stroke", "black")
        .on("click", function (e, d) {
          let active = d3.select(this);
        
          if (active.attr("class").includes("active")) {
            reset();
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
                  .translate(width / 2, height / 2)
                  .scale(1.5)
                  .translate(-+active.attr("x"), -+active.attr("y"))
              );

             
            setField(d);
          }
        });

      function reset() {
        map
          .transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
      }
      let minimapWidth = width / 4;
      let minimapHeight = height/4;
      let minimap = d3.select("#mini-map").append("svg")
      .attr("width", minimapWidth)
      .attr("height", minimapHeight)

      const minimapSize = calSize(minimapWidth, minimapHeight, Math.max(...nRow), Math.max(...nCol));

      let minimapGrid = minimap
      .append("g")
      .attr("class", "minimap-grid")

      let arrayMini = [];
       for (let i = 0; i <= Math.max(...nCol) + 1; i++) {
        let row = [];
        for (let j = 0; j <= Math.max(...nRow) + 1; j++) {
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
        .style("fill", "#B2B1B9")
        .style("stroke", "black");

        let fieldsMini = rowMini
        .select(".fields-mini")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "field")
        .attr("x", function (d) {
          return (d.col - 1) * minimapSize;
        })
        .attr("y", function (d) {
          return (d.row - 1) * minimapSize;
        })
        .attr("width", minimapSize)
        .attr("height", minimapSize)
        .style("fill", function (d) {
          if (d.img === "green.jpg") return "green";
          return `url(#${d.id})`;
        })
        .style("stroke", "black")
        
        let minimapRect = minimap.append('rect')
        .attr('id', 'minimapRect');
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
      //   .style("fill", "#B2B1B9")
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

  return (
    <div className="App">
      <div id="map"></div>
      <div id="mini-map"></div>
      {field && 
        <div id="info">
          <h1>Name: {field.state}</h1>
          <h2>
            Position: {field.row} x {field.col}
          </h2>
          <img src={field.img}/>
        </div>
      }
    </div>
  );
}

export default App;
