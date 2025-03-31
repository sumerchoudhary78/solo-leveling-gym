// src/components/dashboard/ProgressBar.jsx
'use client';

import React from 'react';

const ProgressBar = ({ value, max, label, color = "bg-blue-500" }) => {
  const percentage = max > 0 ? Math.min(((value || 0) / max) * 100, 100) : 0;
  return (
    <div className="w-full px-2">
      <div className="flex justify-between text-xs text-gray-300 mb-1">
        <span className="font-medium">{label}</span>
        <span>{value || 0}/{max}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div className={`${color} h-2.5 rounded-full transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;