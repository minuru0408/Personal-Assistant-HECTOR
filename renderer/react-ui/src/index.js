import React from 'react';
import ReactDOM from 'react-dom';
import Dashboard from './Dashboard';  // ← your file
import './index.css';                // ← make sure this exists

ReactDOM.render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>,
  document.getElementById('root')
);
