// src/components/modals/QuestLogModal.jsx
'use client';

import React from 'react';

// Helper to get quest type badge
const getQuestTypeBadge = (type) => {
    const badges = {
        daily: <span className="px-2 py-0.5 text-xs bg-green-900/70 text-green-200 rounded whitespace-nowrap">Daily</span>,
        weekly: <span className="px-2 py-0.5 text-xs bg-blue-900/70 text-blue-200 rounded whitespace-nowrap">Weekly</span>,
        main: <span className="px-2 py-0.5 text-xs bg-purple-900/70 text-purple-200 rounded whitespace-nowrap">Main</span>,
        special: <span className="px-2 py-0.5 text-xs bg-yellow-900/70 text-yellow-200 rounded whitespace-nowrap">Special</span>,
    };
    return badges[type] || badges.daily;
};

// Helper to format rewards
const formatRewards = (quest) => {
    const parts = [];
    if (quest.rewardExp) parts.push(`${quest.rewardExp} EXP`);
    if (quest.rewardPoints) parts.push(`${quest.rewardPoints} Stat Pts`);
    if (quest.rewardItem) parts.push(quest.rewardItem);
    return parts.join(', ') || 'None';
};

// Placeholder for objective check - replace with real logic based on quest requirements and user stats/progress
const canCompleteQuest = (quest) => {
    // Example: Check if the quest has progress tracking and it reached 100%
    if (typeof quest.progress === 'number' && quest.progress >= 100) {
        return true;
    }
    // Example: Specific check for a quest ID
    if (quest.id === 'q1') {
        // Assume you pass user's daily pushup count somehow or check it here
        // return userStats.dailyPushups >= 50;
        return true; // Placeholder: allow completion
    }
    // Default: Cannot complete if progress isn't 100 (if progress exists)
    if (typeof quest.progress === 'number') {
        return false;
    }
    // Default: Allow completion if no specific check or progress tracking
    return true; // Allow manual completion for now
};


const QuestLogModal = ({ isOpen, onClose, quests, onAcceptQuest, onAbandonQuest, onCompleteQuest }) => {
    if (!isOpen) return null;

    // Group quests by status
    const activeQuests = quests.filter(q => q.status === 'active');
    const availableQuests = quests.filter(q => q.status === 'available');
    const completedQuests = quests.filter(q => q.status === 'completed');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-[#1f2a40] to-[#101827] p-6 rounded-lg shadow-xl w-full max-w-3xl border border-blue-500/50 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-blue-300">Hunter Association Quests</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
                </div>

                <div className="space-y-6">
                    {/* Active Quests */}
                    <div>
                        <h3 className="text-lg font-semibold text-yellow-300 mb-2 border-b border-gray-700 pb-1">Active Quests ({activeQuests.length})</h3>
                        {activeQuests.length > 0 ? (
                            <div className="space-y-3">
                                {activeQuests.map(quest => (
                                    <div key={quest.id} className="bg-[#1a2335]/60 rounded-lg p-3 border-l-4 border-yellow-500">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                                            {/* Left Side: Details */}
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h4 className="font-semibold text-gray-200">{quest.title}</h4>
                                                    {getQuestTypeBadge(quest.type)}
                                                    {/* Add Time Limit Display Logic if needed */}
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
                                            </div>
                                            {/* Right Side: Actions */}
                                            <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 mt-1 sm:mt-0 w-full sm:w-auto justify-end">
                                                <button
                                                    onClick={() => onCompleteQuest(quest.id)}
                                                    disabled={!canCompleteQuest(quest)} // Use the check function
                                                    className="px-3 py-1 text-sm rounded bg-green-600 hover:bg-green-500 text-white disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed whitespace-nowrap transition-colors flex-1 sm:flex-none"
                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    onClick={() => onAbandonQuest(quest.id)}
                                                    className="px-3 py-1 text-sm rounded bg-red-600 hover:bg-red-500 text-white whitespace-nowrap transition-colors flex-1 sm:flex-none"
                                                >
                                                    Abandon
                                                </button>
                                            </div>
                                        </div>
                                        {/* Bottom Row: Rewards & Progress */}
                                        <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                            <div className="text-xs text-gray-400">
                                                <span className="font-medium text-blue-400">Rewards:</span>
                                                <span className="ml-1">{formatRewards(quest)}</span>
                                            </div>
                                            {/* Optional: Progress Bar */}
                                            {typeof quest.progress === 'number' && quest.status === 'active' && (
                                                <div className="w-full sm:w-1/3 mt-1 sm:mt-0">
                                                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                        <div
                                                            className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                                                            style={{ width: `${quest.progress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xxs text-right text-yellow-300">{quest.progress || 0}%</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm p-3">No active quests. Accept a quest to get started.</div>
                        )}
                    </div>

                    {/* Available Quests */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-300 mb-2 border-b border-gray-700 pb-1">Available Quests ({availableQuests.length})</h3>
                        {availableQuests.length > 0 ? (
                            <div className="space-y-3">
                                {availableQuests.map(quest => (
                                    <div key={quest.id} className="bg-[#1a2335]/60 rounded-lg p-3">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h4 className="font-semibold text-gray-200">{quest.title}</h4>
                                                    {getQuestTypeBadge(quest.type)}
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
                                            </div>
                                            <button
                                                onClick={() => onAcceptQuest(quest.id)}
                                                className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-500 text-white flex-shrink-0 whitespace-nowrap transition-colors mt-1 sm:mt-0 w-full sm:w-auto"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-400">
                                            <span className="font-medium text-blue-400">Rewards:</span>
                                            <span className="ml-1">{formatRewards(quest)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm p-3">No quests available. Check back later.</div>
                        )}
                    </div>

                    {/* Completed Quests (Collapsed) */}
                    <div>
                        <h3 className="text-lg font-semibold text-green-300 mb-2 border-b border-gray-700 pb-1">Completed Quests ({completedQuests.length})</h3>
                        {completedQuests.length > 0 ? (
                            <details className="group">
                                <summary className="text-gray-400 cursor-pointer group-hover:text-white text-sm mb-2 list-none flex items-center">
                                    <span className="mr-1 group-open:rotate-90 transform transition-transform duration-200">▶</span>
                                    Show/Hide Completed
                                </summary>
                                <div className="space-y-3 max-h-40 overflow-y-auto pl-5 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                                    {completedQuests.map(quest => (
                                        <div key={quest.id} className="bg-[#1a2335]/40 rounded-lg p-3 border-l-4 border-green-500/50">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold text-gray-400">{quest.title}</h4>
                                                {getQuestTypeBadge(quest.type)}
                                                <span className="text-xs text-green-400">(Completed)</span>
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                Rewards Claimed: {formatRewards(quest)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        ) : (
                            <div className="text-gray-500 text-sm p-3">No completed quests yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestLogModal;