// src/components/modals/LevelUpModal.jsx
'use client';

import React from 'react';

const LevelUpModal = ({ isOpen, onClose, newLevel, rewards }) => {
    // Early return if not open or essential data is missing
    if (!isOpen || !rewards || typeof newLevel !== 'number' || newLevel <= 0) {
        // Optionally log an error if rewards are expected but missing when isOpen is true
        if (isOpen) {
            console.warn("LevelUpModal: Missing required props (newLevel, rewards)", { newLevel, rewards });
        }
        return null;
    }

    // Check if there are any rewards to display
    const hasStatPoints = rewards.statPoints > 0;
    const hasMaxHp = rewards.maxHp > 0;
    const hasUnlocks = rewards.unlocks && rewards.unlocks.length > 0;
    const hasAnyReward = hasStatPoints || hasMaxHp || hasUnlocks;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-[60] p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-8 rounded-lg shadow-xl text-center max-w-md border-2 border-yellow-400 ring-4 ring-yellow-400/30">
                {/* Animated elements */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className="animate-bounce-slow">
                        <span className="text-yellow-300 text-6xl drop-shadow-lg">⬆️</span>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg pointer-events-none">
                    {/* Subtle particle effects or glows can be added here */}
                </div>

                <h2 className="text-5xl font-bold text-yellow-300 mb-4 animate-pulse-bright filter drop-shadow-md">LEVEL UP!</h2>
                <p className="text-2xl text-white mb-6">You've reached <span className="text-yellow-300 font-bold">Level {newLevel}</span></p>

                <div className="mb-6 space-y-2">
                    <h3 className="text-lg font-semibold text-blue-300 mb-2">Rewards Granted:</h3>
                    <ul className="text-left space-y-2 bg-black/30 p-4 rounded-lg border border-blue-400/30 min-h-[80px]"> {/* Min height */}
                        {hasStatPoints && (
                            <li className="flex items-center text-white animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                                <span className="text-yellow-400 mr-2 text-lg">+</span>
                                <span>{rewards.statPoints} Stat Point{rewards.statPoints !== 1 ? 's' : ''}</span>
                            </li>
                        )}
                        {hasMaxHp && (
                            <li className="flex items-center text-white animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
                                <span className="text-red-400 mr-2 text-lg">+</span>
                                <span>{rewards.maxHp} Maximum HP</span>
                            </li>
                        )}
                        {hasUnlocks && (
                            <li className="pt-2 mt-2 border-t border-blue-500/30 animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
                                <span className="text-purple-400 font-semibold block mb-1">Unlocks:</span>
                                <ul className="list-disc list-inside pl-2 space-y-1">
                                    {rewards.unlocks.map((unlock, index) => (
                                        <li key={index} className="text-white text-sm">
                                            {unlock}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        )}
                        {!hasAnyReward && (
                            <li className="text-gray-400 italic animate-slide-in-left text-center py-4">No specific rewards this level. Keep pushing!</li>
                        )}
                    </ul>
                </div>

                <button
                    onClick={onClose}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-md shadow-lg hover:shadow-xl transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-indigo-900"
                >
                    Continue Journey
                </button>
            </div>
            {/* Add Tailwind CSS for animations (ensure these are defined in your global CSS or here) */}
            <style jsx global>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(-15%); animation-timing-function: cubic-bezier(0.8,0,1,1); } 50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); } }
                .animate-bounce-slow { animation: bounce-slow 1.5s infinite; }
                @keyframes pulse-bright { 0%, 100% { opacity: 1; text-shadow: 0 0 5px #fde047; } 50% { opacity: 0.8; text-shadow: 0 0 15px #fde047; } }
                .animate-pulse-bright { animation: pulse-bright 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes slide-in-left { 0% { opacity: 0; transform: translateX(-20px); } 100% { opacity: 1; transform: translateX(0); } }
                .animate-slide-in-left { animation: slide-in-left 0.5s ease-out forwards; opacity: 0; } /* Start hidden */
            `}</style>
        </div>
    );
};

export default LevelUpModal;