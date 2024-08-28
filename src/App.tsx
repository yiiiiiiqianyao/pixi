import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SpritePage from './components/sprite';
import SpinePage from './components/spine';
import HomePage from './components/home';

function App() {
  return (
    <div className="App">
      <Router>
        <div id='routerContent'>
          {/* 导航菜单可以放在这里 */}
          <div id='routerLink'>
            <Link to="/">home</Link>
            <Link to="/sprite">sprite</Link>
            <Link to="/spine">spine</Link>
          </div>
        
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/sprite" element={<SpritePage/>} />
            <Route path="/spine" element={<SpinePage/>} />
            {/* 可以添加更多路由规则 */}
            
            {/* 如果没有匹配到任何路由，可以设置一个404页面 */}
            {/* <Route component={NotFound} /> */}
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
