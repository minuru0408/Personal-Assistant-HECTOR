import React from 'react';

export function CircularProgress({ value, size = 60, color = '#0af' }) {
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: `4px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
  };
  return <div style={circleStyle}>{value}%</div>;
}
