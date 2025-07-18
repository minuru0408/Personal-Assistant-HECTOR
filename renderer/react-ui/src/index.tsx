import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './Dashboard.jsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Dashboard/>
  </React.StrictMode>
);
