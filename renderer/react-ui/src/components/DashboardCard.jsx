import React from 'react';
import '../Dashboard.css';

export default function DashboardCard({ title, children }) {
  return (
    <div className="widget">
      {title && <div className="widget-header">{title}</div>}
      <div className="widget-body">{children}</div>
    </div>
  );
}
