// src/components/modals/WorkoutModal.jsx
'use client';

import React, { useState } from 'react';
import { ACTIVITY_TYPES } from '../../../lib/wearables/config';

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


const WorkoutModal = ({ isOpen, onClose, workouts, onStartWorkout, wearableConnected = false, onStartTrackedWorkout }) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customWorkout, setCustomWorkout] = useState({
    name: '',
    duration: '30',
    difficulty: 'medium',
    activityType: ACTIVITY_TYPES.STRENGTH_TRAINING,
    useWearable: false
  });

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
                        <div className="flex space-x-1">
                          {wearableConnected && (
                            <button
                              onClick={() => onStartTrackedWorkout({
                                ...workout,
                                activityType: workout.activityType || ACTIVITY_TYPES.STRENGTH_TRAINING
                              })}
                              className="ml-2 px-2 py-1 bg-green-700 hover:bg-green-600 rounded text-green-100 transition-colors flex items-center"
                              title="Track with smartwatch"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Track
                            </button>
                          )}
                          <button
                            onClick={() => onStartWorkout(workout)}
                            className="ml-2 px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-blue-100 transition-colors"
                          >
                            Enter Gate
                          </button>
                        </div>
                      </div>
                    </div>
                </li>
                ))
            ) : (
                <li className="text-gray-500 p-2">No gates available for your rank.</li>
            )}
        </ul>
        <div className="mt-4 pt-3 border-t border-gray-700 space-y-3">
          <div className="flex justify-between">
            <button
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded text-white font-medium transition-colors"
              onClick={() => onStartWorkout({ name: 'Random Gate', isRandom: true, exp: Math.floor(Math.random() * 150) + 50 })} // Example random EXP
            >
              Random Gate
            </button>
            <button
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded text-white font-medium transition-colors"
              onClick={() => {
                // Show custom workout form
                setShowCustomForm(prev => !prev);
              }}
            >
              Create Custom Gate
            </button>
          </div>

          {/* Custom Workout Form */}
          {showCustomForm && (
            <div className="bg-[#1a2335] p-3 rounded border border-purple-500/30">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">Create Custom Gate</h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Gate Name</label>
                  <input
                    type="text"
                    className="w-full bg-[#101827] border border-gray-700 rounded px-2 py-1 text-sm text-gray-200"
                    placeholder="Enter gate name"
                    value={customWorkout.name}
                    onChange={(e) => setCustomWorkout({...customWorkout, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Duration (mins)</label>
                    <input
                      type="number"
                      className="w-full bg-[#101827] border border-gray-700 rounded px-2 py-1 text-sm text-gray-200"
                      placeholder="Duration"
                      min="5"
                      max="120"
                      value={customWorkout.duration}
                      onChange={(e) => setCustomWorkout({...customWorkout, duration: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
                    <select
                      className="w-full bg-[#101827] border border-gray-700 rounded px-2 py-1 text-sm text-gray-200"
                      value={customWorkout.difficulty}
                      onChange={(e) => setCustomWorkout({...customWorkout, difficulty: e.target.value})}
                    >
                      <option value="easy">E Rank (Easy)</option>
                      <option value="medium">C Rank (Medium)</option>
                      <option value="hard">B Rank (Hard)</option>
                      <option value="expert">A Rank (Expert)</option>
                      <option value="master">S Rank (Master)</option>
                    </select>
                  </div>
                </div>
                {wearableConnected && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Activity Type</label>
                    <select
                      className="w-full bg-[#101827] border border-gray-700 rounded px-2 py-1 text-sm text-gray-200"
                      value={customWorkout.activityType}
                      onChange={(e) => setCustomWorkout({...customWorkout, activityType: e.target.value})}
                    >
                      <option value={ACTIVITY_TYPES.STRENGTH_TRAINING}>Strength Training</option>
                      <option value={ACTIVITY_TYPES.RUNNING}>Running</option>
                      <option value={ACTIVITY_TYPES.WALKING}>Walking</option>
                      <option value={ACTIVITY_TYPES.CYCLING}>Cycling</option>
                      <option value={ACTIVITY_TYPES.HIIT}>HIIT</option>
                      <option value={ACTIVITY_TYPES.YOGA}>Yoga</option>
                      <option value={ACTIVITY_TYPES.SWIMMING}>Swimming</option>
                      <option value={ACTIVITY_TYPES.ELLIPTICAL}>Elliptical</option>
                      <option value={ACTIVITY_TYPES.ROWING}>Rowing</option>
                      <option value={ACTIVITY_TYPES.CUSTOM}>Custom</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
                    onClick={() => setShowCustomForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-white text-sm transition-colors"
                    onClick={() => {
                      // Calculate EXP based on difficulty and duration
                      const difficultyMultiplier = {
                        easy: 1,
                        medium: 1.5,
                        hard: 2,
                        expert: 2.5,
                        master: 3
                      };
                      const exp = Math.floor(parseInt(customWorkout.duration) * difficultyMultiplier[customWorkout.difficulty] * 2);

                      // Create the workout object
                      const newWorkout = {
                        ...customWorkout,
                        id: `custom_${Date.now()}`,
                        exp,
                        isCustom: true
                      };

                      // Start the workout
                      if (wearableConnected && customWorkout.useWearable) {
                        onStartTrackedWorkout(newWorkout);
                      } else {
                        onStartWorkout(newWorkout);
                      }

                      // Reset and close form
                      setShowCustomForm(false);
                      setCustomWorkout({
                        name: '',
                        duration: '30',
                        difficulty: 'medium',
                        activityType: ACTIVITY_TYPES.STRENGTH_TRAINING,
                        useWearable: false
                      });
                    }}
                    disabled={!customWorkout.name}
                  >
                    Create & Enter
                  </button>
                </div>
              </div>
            </div>
          )}

          {wearableConnected && (
            <div className="flex items-center justify-center mt-2">
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Smartwatch connected and ready for tracking</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutModal;