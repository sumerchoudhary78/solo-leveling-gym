// src/components/modals/ShadowArmyModal.jsx
'use client';

import React from 'react';

// NOTE: Assumes 'shadows' prop contains the full list with 'unlocked' and 'equipped' status.
// Persistence of this status needs to be handled in the parent component via Firestore.
const ShadowArmyModal = ({ isOpen, onClose, shadows, onEquipShadow, maxEquipped = 3 }) => {
  if (!isOpen) return null;

  const equippedShadows = (shadows || []).filter(s => s.equipped);
  const availableShadows = (shadows || []).filter(s => s.unlocked && !s.equipped);
  const lockedShadows = (shadows || []).filter(s => !s.unlocked);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1f2a40] to-[#101827] p-6 rounded-lg shadow-xl w-full max-w-3xl border border-purple-500/50 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-300">Shadow Army</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="space-y-6">
          {/* Equipped Shadows */}
          <div>
            <h3 className="text-lg font-semibold text-purple-400 mb-2 border-b border-gray-700 pb-1">Active Shadows ({equippedShadows.length}/{maxEquipped})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {equippedShadows.map(shadow => (
                <div key={shadow.id} className="bg-gradient-to-b from-purple-900/30 to-[#1a2335] rounded-lg p-3 border border-purple-500/50 shadow-md flex flex-col justify-between min-h-[190px]"> {/* Ensure consistent height */}
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-purple-800/30 rounded-full mb-2 flex items-center justify-center text-purple-300">
                      <span className="text-2xl">{shadow.icon || '❓'}</span>
                    </div>
                    <h4 className="font-semibold text-purple-300 mb-1">{shadow.name}</h4>
                    <p className="text-xs text-gray-400 mb-2 h-10 overflow-hidden">{shadow.effect}</p>
                  </div>
                  <button
                    onClick={() => onEquipShadow(shadow.id, false)} // Pass false to unequip
                    className="w-full mt-auto px-2 py-1 text-xs rounded bg-purple-700/50 hover:bg-purple-600/50 text-purple-200 transition-colors"
                  >
                    Unequip
                  </button>
                </div>
              ))}
              {/* Placeholder for empty slots */}
              {Array.from({ length: Math.max(0, maxEquipped - equippedShadows.length) }).map((_, index) => (
                  <div key={`placeholder-${index}`} className="bg-[#1a2335]/30 rounded-lg p-3 border border-gray-700/50 shadow-inner flex items-center justify-center min-h-[190px]">
                      <span className="text-gray-600 text-sm">Empty Slot</span>
                  </div>
              ))}
            </div>
            {equippedShadows.length === 0 && maxEquipped === 0 && ( // Only show if no slots available at all
              <p className="text-gray-500 text-sm p-3 text-center">No shadow slots available yet.</p>
            )}
          </div>

          {/* Available Shadows */}
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2 border-b border-gray-700 pb-1">Available Shadows ({availableShadows.length})</h3>
            {availableShadows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availableShadows.map(shadow => (
                  <div key={shadow.id} className="bg-[#1a2335]/60 rounded-lg p-3 border border-gray-600/50 shadow-md flex flex-col justify-between min-h-[190px]"> {/* Ensure consistent height */}
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-blue-800/30 rounded-full mb-2 flex items-center justify-center text-blue-300">
                        <span className="text-2xl">{shadow.icon || '❓'}</span>
                      </div>
                      <h4 className="font-semibold text-blue-300 mb-1">{shadow.name}</h4>
                      <p className="text-xs text-gray-400 mb-2 h-10 overflow-hidden">{shadow.effect}</p>
                    </div>
                    <button
                      onClick={() => onEquipShadow(shadow.id, true)} // Pass true to equip
                      className="w-full mt-auto px-2 py-1 text-xs rounded bg-blue-700 hover:bg-blue-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      disabled={equippedShadows.length >= maxEquipped}
                    >
                      Equip
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm p-3 text-center">No available shadows. Complete more gates or quests to unlock shadows.</div>
            )}
          </div>

          {/* Locked Shadows */}
          <div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">Locked Shadows ({lockedShadows.length})</h3>
            {lockedShadows.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lockedShadows.slice(0, 6).map(shadow => ( // Show first few locked
                  <div key={shadow.id} className="bg-gray-800/20 rounded-lg p-3 border border-gray-700/50 shadow-inner opacity-60 flex flex-col justify-between min-h-[190px]"> {/* Ensure consistent height */}
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-gray-700/30 rounded-full mb-2 flex items-center justify-center text-gray-500">
                        <span className="text-2xl">?</span>
                      </div>
                      <h4 className="font-semibold text-gray-500 mb-1">{shadow.name}</h4>
                      <p className="text-xs text-gray-600 mb-2 h-10 overflow-hidden">
                        Locked: {shadow.unlockRequirement || 'Requirement not specified'}
                      </p>
                    </div>
                     <div className="w-full mt-auto px-2 py-1 text-xs rounded bg-gray-700/30 text-gray-600 text-center">Locked</div>
                  </div>
                ))}
                {lockedShadows.length > 6 && (
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 text-gray-500 text-xs text-center mt-2">
                    + {lockedShadows.length - 6} more locked shadows...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm p-3 text-center">All shadows unlocked!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadowArmyModal;