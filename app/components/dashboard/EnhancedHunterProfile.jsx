// src/components/dashboard/EnhancedHunterProfile.jsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import PlayerAvatarFrame from '@/components/three/PlayerAvatarFrame';

const EnhancedHunterProfile = ({ hunter }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  // If hunter data is not provided
  if (!hunter) return null;
  
  // Destructure hunter data with defaults
  const {
    id,
    hunterName = 'Anonymous Hunter',
    level = 1,
    exp = 0,
    nextLevelExp = 100,
    missions = [],
    avatarUrl = null,
    stats = { strength: 0, agility: 0, intelligence: 0, vitality: 0 },
    joinDate = 'Unknown',
    huntsCompleted = 0
  } = hunter;
  
  // Calculate rank
  const getRank = () => {
    if (level >= 50) return { name: "Special Authority", color: "text-purple-300", bgColor: "bg-purple-900/20" };
    if (level >= 40) return { name: "National Level", color: "text-red-300", bgColor: "bg-red-900/20" };
    if (level >= 30) return { name: "S", color: "text-red-400", bgColor: "bg-red-900/20" };
    if (level >= 25) return { name: "A", color: "text-orange-400", bgColor: "bg-orange-900/20" };
    if (level >= 20) return { name: "B", color: "text-yellow-400", bgColor: "bg-yellow-900/20" };
    if (level >= 15) return { name: "C", color: "text-green-400", bgColor: "bg-green-900/20" };
    if (level >= 10) return { name: "D", color: "text-blue-400", bgColor: "bg-blue-900/20" };
    return { name: "E", color: "text-gray-400", bgColor: "bg-gray-900/20" };
  };
  
  const rank = getRank();
  
  // Calculate exp percentage
  const expPercentage = Math.min(100, Math.round((exp / nextLevelExp) * 100));
  
  return (
    <div className="bg-[#1f2a40] rounded-lg shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Header with name and rank */}
      <div className="bg-gradient-to-r from-[#2a3a5a] to-[#344467] p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">{hunterName}</h2>
        <div className={`px-3 py-1 rounded-full ${rank.bgColor}`}>
          <span className={`font-bold ${rank.color}`}>Rank {rank.name}</span>
        </div>
      </div>
      
      {/* Main profile content */}
      <div className="p-5">
        <div className="flex flex-col md:flex-row">
          {/* Avatar with Three.js frame */}
          <div className="flex-shrink-0 flex justify-center mb-4 md:mb-0 md:mr-6">
            <PlayerAvatarFrame 
              rank={level} 
              size={120}
              imageUrl={avatarUrl} 
            />
          </div>
          
          {/* Basic stats */}
          <div className="flex-grow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#2a3a5a] p-3 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Level</div>
                <div className="text-2xl font-bold text-blue-300">{level}</div>
                {/* EXP Progress bar */}
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600" 
                    style={{ width: `${expPercentage}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {exp} / {nextLevelExp} EXP ({expPercentage}%)
                </div>
              </div>
              
              <div className="bg-[#2a3a5a] p-3 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Missions Completed</div>
                <div className="text-2xl font-bold text-green-400">{huntsCompleted}</div>
                <div className="mt-2 text-xs text-gray-400">Hunter since {joinDate}</div>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="mt-4 bg-[#2a3a5a] p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-blue-300">Hunter Stats</div>
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showDetails && (
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-2">
                  <div className="flex flex-col">
                    <div className="text-xs text-gray-400">Strength</div>
                    <div className="flex items-center">
                      <div className="h-1.5 flex-grow bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500" 
                          style={{ width: `${Math.min(100, stats.strength * 5)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-white">{stats.strength}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-xs text-gray-400">Agility</div>
                    <div className="flex items-center">
                      <div className="h-1.5 flex-grow bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${Math.min(100, stats.agility * 5)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-white">{stats.agility}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-xs text-gray-400">Intelligence</div>
                    <div className="flex items-center">
                      <div className="h-1.5 flex-grow bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${Math.min(100, stats.intelligence * 5)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-white">{stats.intelligence}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-xs text-gray-400">Vitality</div>
                    <div className="flex items-center">
                      <div className="h-1.5 flex-grow bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500" 
                          style={{ width: `${Math.min(100, stats.vitality * 5)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs text-white">{stats.vitality}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {!showDetails && (
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center">
                    <div className="text-xs text-gray-400">STR</div>
                    <div className="text-sm font-bold text-white">{stats.strength}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">AGI</div>
                    <div className="text-sm font-bold text-white">{stats.agility}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">INT</div>
                    <div className="text-sm font-bold text-white">{stats.intelligence}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400">VIT</div>
                    <div className="text-sm font-bold text-white">{stats.vitality}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/missions" className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition-colors">
            Find Missions
          </Link>
          <Link href="/leaderboard" className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-center transition-colors">
            View Rankings
          </Link>
          <button 
            onClick={() => window.location.href='/profile/edit'} 
            className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md text-center transition-colors"
          >
            Edit Profile
          </button>
        </div>
        
        {/* Recent activity or achievements */}
        {missions && missions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-blue-300 mb-2">Recent Missions</h3>
            <div className="bg-[#2a3a5a] p-3 rounded-lg">
              <ul className="space-y-2">
                {missions.slice(0, 3).map((mission, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span className="text-sm text-white">{mission.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      mission.completed 
                        ? 'bg-green-900/40 text-green-400' 
                        : 'bg-yellow-900/40 text-yellow-400'
                    }`}>
                      {mission.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </li>
                ))}
              </ul>
              {missions.length > 3 && (
                <Link href="/missions/history" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">
                  View all missions →
                </Link>
              )}
            </div>
          </div>
        )}
        
        {/* Visual rank effects */}
        {rank.name === 'S' || rank.name === 'National Level' || rank.name === 'Special Authority' ? (
          <div className="mt-4 p-3 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-lg border border-blue-500/20">
            <div className="flex items-center">
              <div className="mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707.707-.707A1 1 0 0115 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 01-1 1 1 1 0 01-.707-.293l-.707-.707-.707.707A1 1 0 0112 8a1 1 0 01-1-1V6h-1a1 1 0 110-2h1V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-300">Elite Hunter Privileges</h4>
                <p className="text-xs text-gray-400">Your high rank grants you access to special missions and areas.</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EnhancedHunterProfile;