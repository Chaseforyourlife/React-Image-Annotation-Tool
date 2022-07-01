/*
function App() {
  const [initialData, setInitialData] = useState([{}]);

  useEffect(() => {
    fetch('/home').then(
      response => response.json()
    ).then(
      data => console.log(data)
    )
  });


*/
import logo from './logo.svg';
import './App.css';
import Home from './components/Home';
import Region from './components/Region';
import Regions from './components/Regions';
import Brand from './components/Brand'
import MapID from './components/MapID'
import MapIDImages from './components/MapIDImages'

import MapIDAnnotateParams from './components/MapIDAnnotateParams'
import MapIDBIDParams from './components/MapIDBIDParams'
import Loading from './components/Loading'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import React, {useEffect, useState} from 'react'; //ES6 js





function App() {
  return(
      
      <Router>
        <div className="App" id="App">
          <link rel="icon" href='/static/images/dave.ico'></link>
          <meta httpEquiv="Cache-Control" content=" no-cache, no-store, must-revalidate"></meta>
          <header className="App-header" id="App-header">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/regions" element={<Regions />} />
              <Route path="/regions/:region_name" element={<Region />} />
              <Route path="/regions/:region_name/:brand_name" element={<Brand />} />
              <Route path="/regions/:region_name/:brand_name/:map_id" element={<MapID />} />
              <Route path="/regions/:region_name/:brand_name/:map_id/images" element={<MapIDImages />} />
              <Route path="/regions/:region_name/:brand_name/:map_id/annotate" element={<MapIDAnnotateParams />} />
              <Route path="/regions/:region_name/:brand_name/:map_id/bid" element={<MapIDBIDParams />} />
            </Routes>
          </header>
        </div>
      </Router>
  );
}

export default App;


