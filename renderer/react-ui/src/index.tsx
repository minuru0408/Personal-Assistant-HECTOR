import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './Dashboard';
import './index.css';

const root = createRoot(document.getElementById('root')!);
root.render(<Dashboard />);
