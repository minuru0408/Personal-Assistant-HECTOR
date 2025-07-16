import React, { useState } from 'react';
import '../Dashboard.css';

export default function VolumeControlWidget() {
  const [volume, setVolume] = useState(50);

  const handleChange = (e) => {
    setVolume(e.target.value);
  };

  return (
    <div className="widget">
      <div className="widget-header">Volume</div>
      <div className="widget-body">
        <input type="range" min="0" max="100" value={volume} onChange={handleChange} />
        <div>{volume}</div>
      </div>
    </div>
  );
}
