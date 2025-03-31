// src/components/dashboard/StatItem.jsx
'use client';

import React from 'react';

const StatItem = ({ title, value, onIncrease, availablePoints }) => (
  <div className="bg-gradient-to-br from-[#1f2a40] to-[#1a2335] p-4 rounded-lg shadow-lg flex flex-col items-center transition-all duration-300 hover:shadow-blue-500/30 hover:scale-[1.02]">
    <span className="text-sm uppercase text-gray-400 tracking-wider mb-1 font-semibold">{title}</span>
    <div className="flex items-center gap-3 mt-1">
      <span className="text-4xl font-bold text-white">{value || 0}</span>
      <button
        onClick={onIncrease}
        disabled={availablePoints <= 0}
        className={`bg-[#313f5b] hover:bg-[#4a5a7a] disabled:bg-gray-600 text-white font-bold py-1 px-3 rounded text-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-gray-600`}
        aria-label={`Increase ${title}`}
      >
        +
      </button>
    </div>
  </div>
);

export default StatItem;