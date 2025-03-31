// src/components/modals/SkillsModal.jsx
'use client';

import React from 'react';

const SkillsModal = ({ isOpen, onClose, skills, onActivateSkill, stats }) => {
  if (!isOpen) return null;

  // Group skills by category
  const categories = {
    "Strength": (skills || []).filter(s => s.category === "strength"),
    "Stamina": (skills || []).filter(s => s.category === "stamina"), // Assuming 'stamina' maps to 'vitality' stat
    "Agility": (skills || []).filter(s => s.category === "agility"),
    "Special": (skills || []).filter(s => s.category === "special"),
  };

  // Basic check to see if requirements are met
  // NOTE: This assumes skills don't have their own 'unlocked' state managed separately.
  // It relies purely on checking stats against requirements each time.
  // Also assumes requirement names (e.g., 'Strength', 'Level', 'Vitality') match stat keys or 'level'.
  const checkRequirements = (skill, currentStats) => {
      if (!currentStats || !skill.requirement || typeof skill.requiredValue !== 'number') {
          console.warn("Missing stats or skill requirement info for:", skill.name);
          return false; // Cannot check if stats or requirement details are missing
      }

      let statValue;
      const requirementKey = skill.requirement.toLowerCase();

      if (requirementKey === 'level') {
          statValue = currentStats.level;
      } else if (requirementKey === 'stamina') { // Map 'Stamina' category to 'vitality' stat
          statValue = currentStats.vitality;
      } else {
           statValue = currentStats[requirementKey];
      }

      // Add a check if the required stat itself exists on the stats object
      if (statValue === undefined) {
          console.warn(`Required stat '${requirementKey}' not found in user stats for skill:`, skill.name);
          return false;
      }

      return (statValue || 0) >= skill.requiredValue;
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1f2a40] to-[#101827] p-6 rounded-lg shadow-xl w-full max-w-3xl border border-blue-500/50 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-300">Hunter Skills</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categories).map(([categoryName, categorySkills]) => (
            <div key={categoryName} className="bg-[#1a2335]/60 rounded-lg p-3">
              <h3 className="text-lg font-semibold text-blue-300 mb-2 border-b border-gray-700 pb-1">{categoryName}</h3>
              <div className="space-y-3">
                {categorySkills.length > 0 ? (
                  categorySkills.map(skill => {
                    const isUnlocked = checkRequirements(skill, stats);
                    // TODO: Cooldown needs persistent state (e.g., Firestore timestamp)
                    // Using skill.cooldown > 0 as a placeholder assuming local state update for now
                    const isOnCooldown = skill.cooldown > 0;

                    return (
                      <div key={skill.id} className={`rounded-md border ${isUnlocked ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/30 opacity-70'} p-3 transition-colors`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-grow">
                            <div className="flex items-center flex-wrap gap-x-2 mb-1">
                              <h4 className={`font-semibold ${isUnlocked ? 'text-gray-200' : 'text-gray-500'}`}>{skill.name}</h4>
                              {!isUnlocked && (
                                <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">Locked</span>
                              )}
                              {isUnlocked && isOnCooldown && (
                                <span className="text-xs bg-orange-900/70 text-orange-200 px-2 py-0.5 rounded">Cooldown: {skill.cooldown}h</span> // Display local cooldown
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>{skill.description}</p>
                          </div>
                           {/* Actions Column */}
                          <div className="flex-shrink-0 text-right">
                            {isUnlocked ? (
                              <button
                                onClick={() => onActivateSkill(skill)}
                                disabled={isOnCooldown}
                                className={`ml-2 px-3 py-1 text-sm rounded whitespace-nowrap ${isOnCooldown
                                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                              >
                                Activate
                              </button>
                            ) : (
                              <div className="text-xs text-gray-400 text-right ml-2 mt-1">
                                  Req: {skill.requirement} {skill.requiredValue}
                              </div>
                            )}
                          </div>
                        </div>
                        {isUnlocked && (
                          <div className="mt-2 text-xs text-gray-400">
                            <span className="font-medium text-blue-400">Effect:</span> {skill.effect}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 text-sm">No {categoryName.toLowerCase()} skills available.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsModal;