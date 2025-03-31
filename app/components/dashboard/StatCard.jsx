// src/components/dashboard/StatCard.jsx
'use client';

import React from 'react';

const StatCard = ({ title, value, children, className = "", onClick }) => (
  <div
    className={`bg-gradient-to-br from-[#1f2a40] to-[#1a2335] p-4 rounded-lg shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-blue-500/30 hover:scale-[1.02] ${className} ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <span className="text-sm uppercase text-gray-400 tracking-wider mb-1 font-semibold">{title}</span>
    {value !== undefined && <span className="text-4xl font-bold text-white">{value}</span>}
    {children}
  </div>
);

export default StatCard;