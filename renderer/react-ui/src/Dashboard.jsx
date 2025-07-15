import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import ChatWidget from './widgets/ChatWidget';
import WeatherWidget from './widgets/WeatherWidget';
import './Dashboard.css';

const defaultLayout = [
  { i: 'chat', x: 0, y: 0, w: 3, h: 4 },
  { i: 'weather', x: 3, y: 0, w: 3, h: 2 }
];

export default function Dashboard() {
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem('layout');
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  useEffect(() => {
    localStorage.setItem('layout', JSON.stringify(layout));
  }, [layout]);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={6}
      rowHeight={30}
      width={900}
      onLayoutChange={handleLayoutChange}
    >
      <div key="chat">
        <ChatWidget />
      </div>
      <div key="weather">
        <WeatherWidget />
      </div>
    </GridLayout>
  );
}
