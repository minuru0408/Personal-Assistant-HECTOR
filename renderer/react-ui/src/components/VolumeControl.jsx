import React, { useState } from 'react';

export function VolumeControl() {
  const [volume, setVolume] = useState(50);
  return (
    <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(e.target.value)} />
  );
}
