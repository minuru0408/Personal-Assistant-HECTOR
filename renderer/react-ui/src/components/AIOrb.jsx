import React from 'react';

export function AIOrb({ state }) {
  const color = state === 'talking' ? '#0f0' : state === 'listening' ? '#ff0' : '#888';
  const style = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return <div style={style}></div>;
}
