// src/components/modals/WorkoutModal.jsx
'use client';

import React from 'react';

// Helper function for difficulty badge (could be moved to utils if used elsewhere)
const getDifficultyBadge = (difficulty) => {
    const badges = {
      easy: <span className="px-2 py-0.5 text-xs bg-blue-900 text-blue-200 rounded">E Rank</span>,
      medium: <span className="px-2 py-0.5 text-xs bg-green-900 text-green-200 rounded">C Rank</span>,
      hard: <span className="px-2 py-0.5 text-xs bg-yellow-900 text-yellow-200 rounded">B Rank</span>,
      expert: <span className="px-2 py-0.5 text-xs bg-orange-900 text-orange-200 rounded">A Rank</span>,
      master: <span className="px-2 py-0.5 text-xs bg-red-900 text-red-200 rounded">S Rank</span>,
    };
    return badges[difficulty] || badges.easy;
};


const WorkoutModal = ({ isOpen, onClose, workouts, onStartWorkout }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1f2a40] to-[#101827] p-6 rounded-lg shadow-xl w-full max-w-md border border-blue-500/50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-300">Available Gates</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <ul className="list-none space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {(workouts || []).length > 0 ? (
                (workouts || []).map((workout, index) => (
                <li key={workout.id || index} className="bg-[#1a2335] rounded shadow-sm overflow-hidden">
                    <div className="p-2 border-l-4 border-blue-500">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-gray-200">{workout.name}</h3>
                        {getDifficultyBadge(workout.difficulty || 'easy')}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">
                          {workout.duration || '20-30'} minutes | {workout.exp || '100'} EXP
                        </span>
                        <button
                          onClick={() => onStartWorkout(workout)}
                          className="ml-2 px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-blue-100 transition-colors"
                        >
                          Enter Gate
                        </button>
                      </div>
                    </div>
                </li>
                ))
            ) : (
                <li className="text-gray-500 p-2">No gates available for your rank.</li>
            )}
        </ul>
        <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between">
          <button
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white font-medium transition-colors"
            onClick={() => onStartWorkout({ name: 'Random Gate', isRandom: true, exp: Math.floor(Math.random() * 150) + 50 })} // Example random EXP
          >
            Random Gate
          </button>
          <button
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded text-white font-medium transition-colors"
            onClick={() => { /* TODO: Implement create custom workout */ alert("Custom Gate creation coming soon!"); }}
          >
            Create Custom Gate
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;