import React from 'react';

export function MiniChart({ data = [] }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: '40px' }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            width: '4px',
            marginRight: '2px',
            height: `${(v / max) * 100}%`,
            background: '#0af',
          }}
        />
      ))}
    </div>
  );
}
