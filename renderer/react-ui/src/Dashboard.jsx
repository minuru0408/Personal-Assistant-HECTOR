import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import ChatWidget from './widgets/ChatWidget';
import WeatherWidget from './widgets/WeatherWidget';
import StocksWidget from './widgets/StocksWidget';
import FinanceWidget from './widgets/FinanceWidget';
import ReminderWidget from './widgets/ReminderWidget';
import PerformanceWidget from './widgets/PerformanceWidget';
import VolumeControlWidget from './widgets/VolumeControlWidget';
import './Dashboard.css';

const defaultLayout = [
  { i: 'chat', x: 0, y: 0, w: 3, h: 4 },
  { i: 'weather', x: 3, y: 0, w: 3, h: 2 },
  { i: 'stocks', x: 0, y: 6, w: 3, h: 3 },
  { i: 'finance', x: 3, y: 6, w: 3, h: 3 },
  { i: 'reminder', x: 6, y: 6, w: 3, h: 3 },
  { i: 'performance', x: 9, y: 6, w: 3, h: 3 },
  { i: 'volume', x: 0, y: 9, w: 12, h: 2 }
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
      cols={12}
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
      <div key="stocks">
        <StocksWidget />
      </div>
      <div key="finance">
        <FinanceWidget />
      </div>
      <div key="reminder">
        <ReminderWidget />
      </div>
      <div key="performance">
        <PerformanceWidget />
      </div>
      <div key="volume">
        <VolumeControlWidget />
      </div>
    </GridLayout>
  );
}
