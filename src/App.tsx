import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SpritePage from './components/sprite';
import SpinePage from './components/spine';
import HomePage from './components/home';
import TileMapPage from './components/tilemap';
import ParticlePage from './components/particle';
import GraphicPage from './components/graphic';

function App() {
  return (
    <div className="App">
      <Router>
      {/* <GraphicPage /> */}
        <div id='routerContent'>
          {/* 导航菜单可以放在这里 */}
          <div id='routerLink'>
            <Link to="/">home</Link>
            <Link to="/sprite">sprite</Link>
            <Link to="/spine">spine</Link>
            <Link to="/tilemap">tilemap</Link>
            <Link to="/particle">particle</Link>
            <Link to="/grahpic">grahpic</Link>
          </div>
        
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/sprite" element={<SpritePage/>} />
            <Route path="/spine" element={<SpinePage/>} />
            <Route path="/tilemap" element={<TileMapPage/>} />            
            <Route path="/particle" element={<ParticlePage/>} /> 
            <Route path="/grahpic" element={<GraphicPage/>} /> 
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
