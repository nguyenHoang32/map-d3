import "./App.css";
import "antd/dist/antd.css";
import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import {Routes, Route } from "react-router-dom";
import Map from "./components/Map/index"
function App() {
  
  return (
    <Router>
      <React.Fragment>
      <Routes>
        <Route path="/map" element={<Map />} />
        
      </Routes>
      </React.Fragment>
    </Router>
  );
}

export default App;
