// src/components/dashboard/HunterRank.jsx
'use client';

import React from 'react';

const HunterRank = ({ level }) => {
  // Determine rank based on level
  let rank = "E";
  let rankColor = "text-gray-400";

  if (level >= 50) {
    rank = "Special Authority";
    rankColor = "text-purple-300";
  } else if (level >= 40) {
    rank = "National Level";
    rankColor = "text-red-300";
  } else if (level >= 30) {
    rank = "S";
    rankColor = "text-red-400";
  } else if (level >= 25) {
    rank = "A";
    rankColor = "text-orange-400";
  } else if (level >= 20) {
    rank = "B";
    rankColor = "text-yellow-400";
  } else if (level >= 15) {
    rank = "C";
    rankColor = "text-green-400";
  } else if (level >= 10) {
    rank = "D";
    rankColor = "text-blue-400";
  }



  return (
    <div className="flex flex-col items-center">
      <span className="text-sm uppercase text-gray-400 tracking-wider mb-1 font-semibold">Hunter Rank</span>

      <span className={`text-4xl font-bold ${rankColor} animate-pulse-slow`}>{rank}</span>
    </div>
  );
};

export default HunterRank;