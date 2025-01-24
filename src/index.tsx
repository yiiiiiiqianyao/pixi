import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App'; // pixi
import Main from './three/main'; // three

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<Main />);
