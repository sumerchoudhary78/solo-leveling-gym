// src/app/page.js
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import { signOut } from 'firebase/auth';
import {
    doc,
    updateDoc,
    onSnapshot,
    addDoc, // Keep addDoc for chat
    serverTimestamp, // Keep for chat
    collection, // Keep for chat
    query, // Keep for chat
    orderBy, // Keep for chat
    limit, // Keep for chat
    writeBatch, // Keep for quest completion
    deleteField, // Potentially useful for removing quest data on abandon
    getDoc
} from "@firebase/firestore";
import { auth,db } from '../lib/firebase/config';
import { masterQuestDefinitions } from '../data/quests'; // Import quest definitions
import WearableIntegration from '../lib/wearables';

// Import Components
import HunterRank from './components/dashboard/HunterRank';
import StatCard from './components/dashboard/StatCard';
import ProgressBar from './components/dashboard/ProgressBar';
import StatItem from './components/dashboard/StatItem';
import ChatBox from './components/chat/ChatBox';
import WorkoutModal from './components/modals/WorkoutModal';
import SystemMessage from './components/ui/SystemMessage';
import SkillsModal from './components/modals/SkillsModal';
import QuestLogModal from './components/modals/QuestLogModal';
import ShadowArmyModal from './components/modals/ShadowArmyModal';
import LevelUpModal from './components/modals/LevelUpModal';
import WearableModal from './components/modals/WearableModal';

// Default structure for a new user's stats
const defaultUserStats = {
    level: 1,
    exp: 0,
    maxExp: 100,
    hp: 100,
    maxHp: 100,
    strength: 5,
    vitality: 5,
    agility: 5,
    statPoints: 0,
    hunterName: 'New Hunter',
    username: 'new_user',
    userQuests: {}, // Quest progress stored here { questId: { status: '...', progress: ... } }
    availableWorkouts: [ // Example default workouts
        { id: 'w1', name: 'Goblin Den', difficulty: 'easy', exp: 50, duration: '15' },
        { id: 'w2', name: 'Lizard Swamp', difficulty: 'medium', exp: 120, duration: '25' },
    ],
    equippedShadows: [], // Array of shadow IDs
    unlockedSkills: [], // Array of skill IDs
    // Wearable device settings
    wearableSettings: {
        platform: null,
        isConnected: false,
        lastSyncTime: null,
        settings: {
            trackHeartRate: true,
            trackCalories: true,
            trackSteps: true,
            trackDistance: true,
            trackDuration: true,
            autoDetectActivity: true,
            notifyOnMilestones: true,
            syncFrequency: 'realtime'
        }
    },
    // Workout history
    workoutHistory: [],
    // Add other fields as needed, e.g., inventory, lastLogin, etc.
};


export default function DashboardPage() { // Renamed from Home
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [localLoading, setLocalLoading] = useState(true); // Separate loading state for Firestore data
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [systemMessage, setSystemMessage] = useState(null);
    const systemMessageTimer = useRef(null);
    const [activeWorkout, setActiveWorkout] = useState(null);
    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
    const [isQuestLogOpen, setIsQuestLogOpen] = useState(false);
    const [isShadowArmyOpen, setIsShadowArmyOpen] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [levelUpDetails, setLevelUpDetails] = useState({ level: 0, rewards: { statPoints: 0, maxHp: 0, unlocks: [] } });

    // Wearable device states
    const [wearableIntegration, setWearableIntegration] = useState(null);
    const [isWearableModalOpen, setIsWearableModalOpen] = useState(false);

    // --- Local state for skills/shadows definitions (Could move to data/skills.js, data/shadows.js) ---
    // TODO: The 'unlocked'/'equipped' status here is just for display structure.
    // Real status should come from `stats.unlockedSkills` and `stats.equippedShadows`.
    const [skillDefinitions, setSkillDefinitions] = useState([
        { id: "s1", name: "Iron Body", category: "strength", description: "Increase maximum HP by 20%", effect: "Your maximum HP increases temporarily", cooldownDuration: 24, requirement: "Strength", requiredValue: 10 },
        { id: "s2", name: "Sprint", category: "agility", description: "Increase workout efficiency by 15%", effect: "Gain 15% more EXP from next workout", cooldownDuration: 12, requirement: "Agility", requiredValue: 15 },
        { id: "s3", name: "Endurance", category: "stamina", description: "Reduce recovery time slightly", effect: "Shorten cooldowns slightly", cooldownDuration: 0, requirement: "Vitality", requiredValue: 12 }, // Changed 'Vitality' to match stat
        { id: "s4", name: "Arise", category: "special", description: "Chance to retry a failed workout", effect: "Next failed workout might not count", cooldownDuration: 72, requirement: "Level", requiredValue: 20 },
    ]);
    const [shadowDefinitions, setShadowDefinitions] = useState([
        { id: "sh1", name: "Iron Muscle", icon: "💪", effect: "+5% Strength", unlockRequirement: "Reach Level 5" },
        { id: "sh2", name: "Swift Steps", icon: "🏃", effect: "+5% Agility", unlockRequirement: "Complete 5 running workouts" }, // Changed name for clarity
        { id: "sh3", name: "Tank's Resilience", icon: "🛡️", effect: "+5% Vitality", unlockRequirement: "Reach Vitality 15" },
        { id: "sh4", name: "Heart of the Pack", icon: "❤️", effect: "+10% Max HP", unlockRequirement: "Complete 20 cardio workouts" },
        { id: "sh5", name: "Alchemist's Touch", icon: "🧪", effect: "+15% effect from consumables", unlockRequirement: "Reach Level 15" },
        { id: "sh6", name: "Tusk's Might", icon: "🐘", effect: "+5% lifting capacity", unlockRequirement: "Deadlift bodyweight" },
        { id: "sh7", name: "Igris's Speed", icon: "⚔️", effect: "+3% all stats during workouts", unlockRequirement: "Reach S Rank (Level 30)" },
        { id: "sh8", name: "Beru's Regeneration", icon: "🦇", effect: "Recover 2% HP after workout", unlockRequirement: "Complete 50 workouts" }
    ]);

    // Helper to display system messages briefly
    const showSystemMessage = useCallback((message, duration = 4000) => {
        console.log("System Message:", message); // Log messages for debugging
        setSystemMessage(message);
        clearTimeout(systemMessageTimer.current); // Clear existing timer
        systemMessageTimer.current = setTimeout(() => {
            setSystemMessage(null);
        }, duration);
    }, []); // No dependencies needed

    // Clear timer on unmount
    useEffect(() => {
        return () => clearTimeout(systemMessageTimer.current);
    }, []);

    // --- Firestore Listener for User Data ---
    useEffect(() => {
        if (authLoading) {
            setLocalLoading(true); // Ensure loading state is true while auth is resolving
            return;
        }
        if (!user) {
            console.log("User not logged in, redirecting to login.");
            router.push('/login'); // Redirect if not logged in after auth check
            setLocalLoading(false);
            return;
        }

        console.log("User authenticated, setting up Firestore listener for UID:", user.uid);
        setLocalLoading(true); // Start loading Firestore data
        const userDocRef = doc(db, "users", user.uid);

        // Initialize wearable integration
        const initWearable = async () => {
            try {
                const wearableInstance = await WearableIntegration.initialize(user.uid);
                setWearableIntegration(wearableInstance);
                console.log("Wearable integration initialized:", wearableInstance.isConnected ? "Connected" : "Not connected");
            } catch (error) {
                console.error("Error initializing wearable integration:", error);
            }
        };

        initWearable();

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log("Received user data from Firestore:", userData);

                // Merge fetched data with defaults to ensure all fields exist
                const completeUserData = {
                    ...defaultUserStats, // Start with defaults
                    ...userData, // Overwrite with fetched data
                    // Ensure nested objects also have defaults if missing in userData
                    userQuests: userData.userQuests || {},
                    availableWorkouts: userData.availableWorkouts || defaultUserStats.availableWorkouts,
                    equippedShadows: userData.equippedShadows || [],
                    unlockedSkills: userData.unlockedSkills || [],
                    // Ensure core stats exist, falling back to default if needed (robustness)
                    level: userData.level ?? defaultUserStats.level,
                    exp: userData.exp ?? defaultUserStats.exp,
                    maxExp: userData.maxExp ?? defaultUserStats.maxExp,
                    hp: userData.hp ?? defaultUserStats.hp,
                    maxHp: userData.maxHp ?? defaultUserStats.maxHp,
                    strength: userData.strength ?? defaultUserStats.strength,
                    vitality: userData.vitality ?? defaultUserStats.vitality,
                    agility: userData.agility ?? defaultUserStats.agility,
                    statPoints: userData.statPoints ?? defaultUserStats.statPoints,
                    hunterName: userData.hunterName || `Hunter_${user.uid.substring(0, 4)}`, // Generate fallback name
                    username: userData.username || user.email?.split('@')[0] || `user_${user.uid.substring(0, 4)}`, // Generate fallback username
                };

                 // Perform a one-time update if essential fields were missing from Firestore
                 // This helps initialize new users or fix corrupted data
                 const fieldsToInitialize = {};
                 if (!userData.username) fieldsToInitialize.username = completeUserData.username;
                 if (!userData.hunterName) fieldsToInitialize.hunterName = completeUserData.hunterName;
                 if (userData.level === undefined) fieldsToInitialize.level = completeUserData.level;
                 // Add more checks as needed

                 if (Object.keys(fieldsToInitialize).length > 0) {
                     console.warn("Initializing missing fields in Firestore:", fieldsToInitialize);
                     updateDoc(userDocRef, fieldsToInitialize).catch(err => {
                         console.error("Error initializing missing fields:", err);
                     });
                 }


                // Check for level up based on previous stats vs current stats (if needed)
                // This listener primarily just updates the state. Level up is handled by handleGainExp.

                setStats(completeUserData);

            } else {
                console.warn("User document not found for UID:", user.uid, "Attempting to create default document.");
                // Create a default document if it doesn't exist (e.g., first login)
                const initialStats = {
                    ...defaultUserStats,
                    hunterName: `Hunter_${user.uid.substring(0, 4)}`,
                    username: user.email?.split('@')[0] || `user_${user.uid.substring(0, 4)}`,
                    createdAt: serverTimestamp(), // Track creation time
                };
                // Use setDoc to create the document with the user's UID
                setDoc(userDocRef, initialStats)
                    .then(() => {
                        console.log("Default user document created successfully.");
                        setStats(initialStats); // Set local state immediately
                    })
                    .catch((error) => {
                        console.error("Error creating default user document:", error);
                        showSystemMessage("Error setting up your profile. Please refresh.", 10000);
                        setStats(null); // Indicate an error state
                    });
            }
            setLocalLoading(false); // Firestore data loaded (or creation attempted)
        }, (error) => {
            console.error("Error fetching user document:", error);
            showSystemMessage("Error loading your profile data. Please try refreshing.", 10000);
            setStats(null); // Set stats to null on error
            setLocalLoading(false);
        });

        // Cleanup listener on unmount or when user/auth changes
        return () => {
            console.log("Unsubscribing from user data listener.");
            unsubscribe();
        };

    }, [user, authLoading, router, showSystemMessage]); // Add showSystemMessage dependency


    // --- Merge Quest Definitions with User Progress ---
    const mergedQuests = useMemo(() => {
        if (!stats?.userQuests) return []; // Return empty if stats or userQuests aren't loaded

        return masterQuestDefinitions.map(def => {
            const userQuestData = stats.userQuests[def.id];
            // Determine status: 'completed', 'active', or 'available'
            let status = 'available';
            let progress = 0;
            if (userQuestData) {
                status = userQuestData.status || 'available'; // Default to available if status is missing
                progress = userQuestData.progress || 0;
            }

            // Ensure completed quests stay completed, active stay active unless explicitly changed
            return {
                ...def, // Spread the master definition first
                status: status,
                progress: progress,
            };
        }).sort((a, b) => { // Sort: Active > Available > Completed
            const statusOrder = { active: 1, available: 2, completed: 3 };
            return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
        });
    }, [stats?.userQuests]); // Depend only on userQuests part of stats


    // --- Level Up Logic ---
    // This function calculates the result of gaining EXP, including potential level ups.
    // It's designed to be pure calculation based on provided current stats.
    const calculateLevelUp = useCallback((currentStats, gainedExp) => {
        // Use provided stats, falling back to defaults for safety
        const level = currentStats?.level ?? 1;
        const exp = currentStats?.exp ?? 0;
        let currentMaxExp = currentStats?.maxExp ?? 100;
        const statPoints = currentStats?.statPoints ?? 0;
        const maxHp = currentStats?.maxHp ?? 100;

        // Prevent division by zero or infinite loops if maxExp is invalid
        if (currentMaxExp <= 0) {
            console.error("Max EXP is zero or negative, resetting to 100 for calculation.");
            currentMaxExp = 100;
        }

        let newLevel = level;
        let currentExp = exp + gainedExp;
        let newMaxExp = currentMaxExp; // Start with current maxExp
        let accumulatedStatPoints = 0;
        let accumulatedMaxHp = 0;
        const accumulatedUnlocks = [];
        let didLevelUp = false;

        // Loop for multi-level ups
        while (currentExp >= newMaxExp) {
            didLevelUp = true;
            currentExp -= newMaxExp; // Carry over remaining exp
            newLevel += 1;

            // --- Define Base rewards per level ---
            const baseRewards = { statPoints: 2, maxHp: 10 };

            // --- Define Level-specific rewards/unlocks ---
            const specialRewards = {
                5: { unlocks: ["New Skill: Endurance Training"] }, // Placeholder unlock text
                10: { statPoints: 1, unlocks: ["Rank D Unlocked", "New Gates Available"] }, // Added 1 extra point = 3 total
                15: { unlocks: ["New Shadow: Alchemist's Touch"] }, // Use defined shadow name
                20: { statPoints: 3, unlocks: ["Rank B Unlocked", "Special Weekly Quests"] }, // Added 3 extra points = 5 total
                30: { statPoints: 8, unlocks: ["Rank S Unlocked", "New Shadow: Igris's Speed"] }, // Added 8 extra points = 10 total
                40: { unlocks: ["National Level Rank"] },
                50: { unlocks: ["Special Authority Rank"] },
            };

            let currentLevelRewards = { ...baseRewards, unlocks: [] };

            // Apply special rewards for the NEW level reached
            if (specialRewards[newLevel]) {
                currentLevelRewards.statPoints += specialRewards[newLevel].statPoints || 0;
                currentLevelRewards.maxHp += specialRewards[newLevel].maxHp || 0; // Although not used in example
                currentLevelRewards.unlocks.push(...(specialRewards[newLevel].unlocks || []));
            }

            accumulatedStatPoints += currentLevelRewards.statPoints;
            accumulatedMaxHp += currentLevelRewards.maxHp;
            accumulatedUnlocks.push(...currentLevelRewards.unlocks);

            // Calculate maxExp for the *next* level threshold (based on the level just achieved)
            // Example scaling: Increase by 20% + 50 flat, rounded down
            newMaxExp = Math.floor(newMaxExp * 1.2) + 50;

            // Safety break for extreme exp gain / potential infinite loop
             if (newLevel > level + 20) {
                  console.warn("Level up calculation exceeded 20 levels, breaking loop.");
                  break;
             }
        }

        const finalRewards = didLevelUp ? {
            statPoints: accumulatedStatPoints,
            maxHp: accumulatedMaxHp,
            unlocks: accumulatedUnlocks
        } : null;

        // Trigger the visual modal *if* a level up occurred
        if (didLevelUp) {
            console.log(`Level Up Triggered: Level ${newLevel}, Rewards:`, finalRewards);
            setLevelUpDetails({ level: newLevel, rewards: finalRewards });
            setShowLevelUp(true); // Controls the LevelUpModal visibility
        }

        // Return all necessary values needed to update Firestore
        return {
            level: newLevel,
            exp: currentExp, // Remaining EXP after level ups
            maxExp: newMaxExp, // Max EXP required for the *next* level
            statPoints: statPoints + accumulatedStatPoints, // Original points + gained points
            maxHp: maxHp + accumulatedMaxHp, // Original HP + gained HP
            didLevelUp, // Flag indicating if a level up happened
            // We don't return rewards here, they are handled by setLevelUpDetails
        };
    }, []); // No external dependencies needed for this calculation logic

    // --- Gain EXP Handler (Updates Firestore) ---
    const handleGainExp = useCallback(async (amount) => {
        if (!user || !stats || amount <= 0) {
            console.warn("Cannot gain EXP. Conditions not met:", { userExists: !!user, statsLoaded: !!stats, amount });
            return;
        }

        const userDocRef = doc(db, "users", user.uid);

        try {
            // Calculate potential level up results based on the *current* stats state
            // This is optimistic but avoids needing a read before write in most cases.
            // The onSnapshot listener will eventually sync the state anyway.
            const levelUpResult = calculateLevelUp(stats, amount);

            // Prepare the data to update in Firestore
            const updates = {
                exp: levelUpResult.exp,
                // Only update fields that actually changed to minimize writes
                ...(levelUpResult.level !== stats.level && { level: levelUpResult.level }),
                ...(levelUpResult.maxExp !== stats.maxExp && { maxExp: levelUpResult.maxExp }),
                ...(levelUpResult.statPoints !== stats.statPoints && { statPoints: levelUpResult.statPoints }),
                ...(levelUpResult.maxHp !== stats.maxHp && { maxHp: levelUpResult.maxHp }),
                lastActivity: serverTimestamp() // Optionally update last activity timestamp
            };

            // Only perform update if there are changes besides timestamp
             if (Object.keys(updates).length > 1) {
                 await updateDoc(userDocRef, updates);
                 console.log(`Gained ${amount} EXP. Firestore updated with changes:`, updates);
                  showSystemMessage(`Gained ${amount} experience points!`, 3000);
             } else {
                 console.log(`Gained ${amount} EXP, but no stat changes required update.`);
                 // Still show message even if only EXP changed but no level up etc.
                 showSystemMessage(`Gained ${amount} experience points!`, 3000);
                 // Update just the exp if no other changes triggered
                 if (levelUpResult.exp !== stats.exp) {
                    await updateDoc(userDocRef, { exp: levelUpResult.exp, lastActivity: serverTimestamp() });
                 }
             }

            // The level up modal is shown via calculateLevelUp setting state, not directly here.
            // The 'stats' state will be updated by the onSnapshot listener reflecting Firestore changes.

        } catch (error) {
            console.error("Error updating experience and level:", error);
            showSystemMessage("Error processing experience gain.");
        }
    }, [user, stats, calculateLevelUp, showSystemMessage]); // Dependencies


    // --- Quest Actions (Update Firestore) ---

    const handleAcceptQuest = useCallback(async (questId) => {
        if (!user || !stats) return;
        const userDocRef = doc(db, "users", user.uid);
        const questDefinition = masterQuestDefinitions.find(q => q.id === questId);
        if (!questDefinition) {
            console.error("Cannot accept quest: Definition not found for ID", questId);
            return;
        }

        const currentQuestStatus = stats.userQuests?.[questId]?.status;
        if (currentQuestStatus === 'active' || currentQuestStatus === 'completed') {
            showSystemMessage("Quest is already active or completed.");
            return;
        }

        try {
            // Update Firestore using dot notation for nested field
            await updateDoc(userDocRef, {
                [`userQuests.${questId}`]: { // Set the quest object
                    status: 'active',
                    progress: 0, // Reset progress on accept
                    acceptedAt: serverTimestamp() // Optional: track accept time
                }
            });
            console.log(`Quest ${questId} status updated to active in Firestore.`);
            showSystemMessage(`Accepted: ${questDefinition.title}`);
            setIsQuestLogOpen(false); // Close modal on success
        } catch (error) {
            console.error("Error accepting quest:", error);
            showSystemMessage(`Error accepting quest: ${questDefinition.title}`);
        }
    }, [user, stats, showSystemMessage]);

    const handleAbandonQuest = useCallback(async (questId) => {
        if (!user || !stats) return;
        const userDocRef = doc(db, "users", user.uid);
        const questDefinition = masterQuestDefinitions.find(q => q.id === questId);
        if (!questDefinition) {
            console.error("Cannot abandon quest: Definition not found for ID", questId);
            return;
        }

        if (stats.userQuests?.[questId]?.status !== 'active') {
            showSystemMessage("Can only abandon active quests.");
            return;
        }

        try {
             // Option 1: Reset to 'available' state
            await updateDoc(userDocRef, {
                [`userQuests.${questId}`]: {
                    status: 'available', // Set back to available
                    progress: 0
                    // Optionally keep other data or remove it
                }
            });
            // Option 2: Remove the quest entry completely using deleteField()
            // await updateDoc(userDocRef, {
            //     [`userQuests.${questId}`]: deleteField()
            // });

            console.log(`Quest ${questId} status updated to available (or removed) in Firestore.`);
            showSystemMessage(`Abandoned: ${questDefinition.title}`);
        } catch (error) {
            console.error("Error abandoning quest:", error);
            showSystemMessage(`Error abandoning quest: ${questDefinition.title}`);
        }
    }, [user, stats, showSystemMessage]);

    const handleCompleteQuest = useCallback(async (questId) => {
        if (!user || !stats) return;

        const userDocRef = doc(db, "users", user.uid);
        const questDefinition = masterQuestDefinitions.find(q => q.id === questId);
        if (!questDefinition) {
            console.error("Quest definition not found for ID:", questId);
            showSystemMessage("Error: Quest data not found.");
            return;
        }

        const currentQuestState = stats.userQuests?.[questId];
        if (currentQuestState?.status !== 'active') {
            showSystemMessage("Quest must be active to complete.");
            console.warn(`Attempted to complete non-active quest: ${questId}, status: ${currentQuestState?.status}`);
            return;
        }

        // --- Objective Checking ---
        // TODO: Implement real objective checking based on questDefinition and stats
        // For now, we assume the button is only enabled if completable (handled in QuestLogModal)
        // if (!canCompleteQuest(questDefinition, stats)) { // Pass stats if needed
        //     showSystemMessage(`Objectives not yet met for: ${questDefinition.title}`);
        //     return;
        // }
        // --- End Objective Checking ---

        try {
            const batch = writeBatch(db); // Use a batch for atomic updates

            // 1. Mark quest as completed in user's quest data
            batch.update(userDocRef, {
                [`userQuests.${questId}`]: {
                    ...currentQuestState, // Keep existing data like progress if needed
                    status: 'completed',
                    progress: 100, // Ensure progress is marked 100%
                    completedAt: serverTimestamp() // Optional: track completion time
                }
            });

            let rewardMessage = `Completed: ${questDefinition.title}!`;
            let totalExpGained = 0;

            // 2. Apply direct rewards (Stat Points, Items etc.) to the user document
            if (questDefinition.rewardPoints) {
                // IMPORTANT: Read the *current* statPoints from the local 'stats' state
                // batch.update works based on the server state, but for incrementing,
                // we need the client's best guess at the current value.
                // Firestore increments are safer if available and applicable.
                batch.update(userDocRef, {
                    statPoints: (stats.statPoints || 0) + questDefinition.rewardPoints
                });
                rewardMessage += ` +${questDefinition.rewardPoints} Stat Pts.`;
            }

            // TODO: Add item rewards logic here
            // Example: Add item ID to an inventory array
            // if (questDefinition.rewardItem) {
            //     batch.update(userDocRef, {
            //         inventory: arrayUnion(questDefinition.rewardItem) // Assumes inventory is an array
            //     });
            //     rewardMessage += ` Item: ${questDefinition.rewardItem}.`;
            // }

            // Prepare EXP gain (will be applied *after* batch commit)
            if (questDefinition.rewardExp) {
                totalExpGained = questDefinition.rewardExp;
                // Message formatting happens below after potential level up message
            }

            // Commit the batch update for quest status and direct rewards
            await batch.commit();
            console.log(`Quest ${questId} completed, status and direct rewards updated via batch.`);

            // 3. Apply EXP gain *after* the batch commit
            // This ensures the level up calculation happens based on the stats *after* points were added (if any)
            // The onSnapshot listener *should* update the local 'stats' quickly,
            // but calling handleGainExp ensures the calculation uses the latest known values.
            if (totalExpGained > 0) {
                await handleGainExp(totalExpGained); // This handles EXP update and potential level up modal
                // Note: handleGainExp already shows an EXP gain message.
                // We modify the rewardMessage to avoid doubling it.
                rewardMessage += ` (+${totalExpGained} EXP processed)`; // Modify message
            }

            showSystemMessage(rewardMessage, 6000); // Show combined message

        } catch (error) {
            console.error("Error completing quest:", error);
            showSystemMessage(`Error completing quest: ${questDefinition.title}`);
        }
    }, [user, stats, handleGainExp, showSystemMessage]);


    // --- Other Handlers ---

    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
            console.log("User logged out successfully");
            setStats(null); // Clear local stats
            // The AuthContext listener should handle the redirect via the main useEffect hook
            // No need for router.push('/login') here if AuthContext handles it.
        } catch (error) {
            console.error("Logout Error:", error);
            showSystemMessage("Logout failed. Please try again.");
        }
    }, [showSystemMessage]); // Added showSystemMessage

    const handleIncreaseStat = useCallback(async (statName) => {
        if (!user || !stats || (stats.statPoints || 0) <= 0) {
            showSystemMessage(stats?.statPoints > 0 ? "Cannot increase stat." : "No stat points available!");
            return;
        }
        if (!['strength', 'vitality', 'agility'].includes(statName)) {
             console.error("Invalid stat name:", statName);
             return;
        }

        const userDocRef = doc(db, "users", user.uid);
        const currentStatValue = stats[statName] || 0;
        const newStatValue = currentStatValue + 1;
        const newAvailablePoints = stats.statPoints - 1;

        try {
            await updateDoc(userDocRef, {
                [statName]: newStatValue,
                statPoints: newAvailablePoints,
            });
            // No need to set local state, onSnapshot will update it
            console.log(`Stat ${statName} updated to ${newStatValue} in Firestore.`);
            // Capitalize stat name for message
            const capitalizedStat = statName.charAt(0).toUpperCase() + statName.slice(1);
            showSystemMessage(`${capitalizedStat} increased to ${newStatValue}! (-1 Stat Point)`);
        } catch (error) {
            console.error("Error updating stat:", error);
            showSystemMessage(`Failed to increase ${statName}.`);
        }
    }, [user, stats, showSystemMessage]);


    const handleStartWorkout = useCallback((workout) => {
        // Standard workout without wearable tracking
        setActiveWorkout(workout); // Set local state for UI feedback
        setIsWorkoutModalOpen(false);
        showSystemMessage(`Entering ${workout.name || 'Random'} gate... Good luck!`, 5000);

        // --- Example: Simulate workout completion ---
        const workoutDuration = workout.isRandom ? (Math.random() * 10000 + 5000) : 10000; // Random 5-15s, Fixed 10s
        const expGain = workout.exp || (workout.isRandom ? Math.floor(Math.random() * 150) + 50 : 100); // Use defined or random exp

        const workoutTimer = setTimeout(() => {
            // Check if this is still the active workout before granting rewards
            // This prevents issues if the user starts another workout quickly
            // Note: This simple check might not be robust enough for complex scenarios.
            // Comparing by name/id is safer.
            setActiveWorkout(currentActiveWorkout => {
                if (currentActiveWorkout?.name === workout.name) {
                    showSystemMessage(`${workout.name || 'Random'} gate cleared!`, 5000);
                    handleGainExp(expGain); // Grant EXP using the handler

                    // Update workout history in Firestore
                    const userDocRef = doc(db, "users", user.uid);
                    const workoutHistory = {
                        id: `workout_${Date.now()}`,
                        name: workout.name,
                        type: workout.isRandom ? 'random' : (workout.isCustom ? 'custom' : 'standard'),
                        difficulty: workout.difficulty || 'easy',
                        duration: workout.duration || '10-15',
                        expGained: expGain,
                        completedAt: serverTimestamp()
                    };

                    // Add to workout history array
                    updateDoc(userDocRef, {
                        workoutHistory: [...(stats.workoutHistory || []), workoutHistory]
                    }).catch(error => {
                        console.error("Error updating workout history:", error);
                    });

                    return null; // Clear active workout
                }
                return currentActiveWorkout; // No change if not the expected workout
            });

        }, workoutDuration);

        // Cleanup function for the timeout if component unmounts or workout changes
        // (Could store timer ref if more complex cancellation is needed)
        // return () => clearTimeout(workoutTimer); // Need to manage this if required

    }, [showSystemMessage, handleGainExp, user, stats]); // Dependencies

    // Handle workout with wearable device tracking
    const handleStartTrackedWorkout = useCallback(async (workout) => {
        if (!wearableIntegration || !wearableIntegration.isConnected) {
            showSystemMessage("No wearable device connected. Using standard tracking instead.", 5000);
            handleStartWorkout(workout);
            return;
        }

        setActiveWorkout(workout); // Set local state for UI feedback
        setIsWorkoutModalOpen(false);
        showSystemMessage(`Starting tracked workout: ${workout.name}. Your wearable device will track your progress.`, 5000);

        try {
            // Start workout tracking with wearable device
            const result = await wearableIntegration.startWorkoutTracking(workout);

            if (!result.success) {
                throw new Error(result.error || "Failed to start workout tracking");
            }

            // Show success message
            showSystemMessage(`Workout tracking started. Complete your workout and return to end tracking.`, 5000);

        } catch (error) {
            console.error("Error starting tracked workout:", error);
            showSystemMessage(`Error starting workout tracking: ${error.message}. Using standard tracking instead.`, 5000);

            // Fall back to standard workout
            handleStartWorkout(workout);
        }
    }, [wearableIntegration, handleStartWorkout, showSystemMessage]);

    // Handle ending a tracked workout
    const handleEndTrackedWorkout = useCallback(async () => {
        if (!wearableIntegration || !wearableIntegration.currentWorkout) {
            showSystemMessage("No active tracked workout to end.", 3000);
            return;
        }

        try {
            // End workout tracking with wearable device
            const result = await wearableIntegration.endWorkoutTracking();

            if (!result.success) {
                throw new Error(result.error || "Failed to end workout tracking");
            }

            // Show success message
            showSystemMessage(`Workout completed! Gained ${result.expGained} experience points.`, 5000);

            // Grant experience points
            handleGainExp(result.expGained);

            // Clear active workout
            setActiveWorkout(null);

        } catch (error) {
            console.error("Error ending tracked workout:", error);
            showSystemMessage(`Error ending workout tracking: ${error.message}`, 5000);
        }
    }, [wearableIntegration, handleGainExp, showSystemMessage]);

    // Handle wearable device connection
    const handleConnectWearable = useCallback(async (platformId) => {
        if (!wearableIntegration) {
            return { success: false, message: "Wearable integration not initialized" };
        }

        try {
            const result = await wearableIntegration.connectToPlatform(platformId);

            if (result.success) {
                showSystemMessage(`Successfully connected to ${result.platform} device!`, 5000);
            }

            return result;
        } catch (error) {
            console.error("Error connecting to wearable device:", error);
            showSystemMessage(`Error connecting to wearable device: ${error.message}`, 5000);
            return { success: false, error: error.message };
        }
    }, [wearableIntegration, showSystemMessage]);

    // Handle wearable device disconnection
    const handleDisconnectWearable = useCallback(async () => {
        if (!wearableIntegration) {
            return { success: false, message: "Wearable integration not initialized" };
        }

        try {
            const result = await wearableIntegration.disconnect();

            if (result.success) {
                showSystemMessage("Disconnected from wearable device.", 3000);
            }

            return result;
        } catch (error) {
            console.error("Error disconnecting from wearable device:", error);
            showSystemMessage(`Error disconnecting from wearable device: ${error.message}`, 5000);
            return { success: false, error: error.message };
        }
    }, [wearableIntegration, showSystemMessage]);

    // Handle updating wearable settings
    const handleUpdateWearableSettings = useCallback(async (newSettings) => {
        if (!wearableIntegration) {
            return { success: false, message: "Wearable integration not initialized" };
        }

        try {
            const result = await wearableIntegration.updateSettings(newSettings);

            if (result.success) {
                showSystemMessage("Wearable settings updated.", 3000);
            }

            return result;
        } catch (error) {
            console.error("Error updating wearable settings:", error);
            showSystemMessage(`Error updating wearable settings: ${error.message}`, 5000);
            return { success: false, error: error.message };
        }
    }, [wearableIntegration, showSystemMessage]);


    const handleActivateSkill = useCallback((skill) => {
        // TODO: Implement persistent skill activation & cooldowns in Firestore
        // - Check cooldown timestamp in Firestore user data
        // - Apply skill effect (update stats temporarily, set flags, etc. in Firestore)
        // - Record activation timestamp in Firestore for cooldown tracking

        showSystemMessage(`Activated skill: ${skill.name}. ${skill.effect}`, 6000);
        setIsSkillsModalOpen(false);

        // --- Local Cooldown Simulation (Remove when using Firestore timestamps) ---
        if (skill.cooldownDuration > 0) {
             setSkillDefinitions(prevSkills => prevSkills.map(s =>
                s.id === skill.id ? { ...s, cooldown: skill.cooldownDuration } : s // Set local cooldown display
             ));
            // Simulate cooldown ending (for local display only)
             setTimeout(() => {
                setSkillDefinitions(prevSkills => prevSkills.map(s =>
                    s.id === skill.id ? { ...s, cooldown: 0 } : s
                ));
             }, skill.cooldownDuration * 1000 * 60 * 60); // Convert hours to ms (won't persist page refresh)
        }
        // --- End Local Simulation ---

    }, [showSystemMessage]);


    const handleEquipShadow = useCallback(async (shadowId, equip) => {
        if (!user || !stats) return;

        const userDocRef = doc(db, "users", user.uid);
        const maxEquipped = 3; // Define max allowed (could be dynamic based on level/rank)
        const currentEquipped = stats.equippedShadows || [];
        const targetShadowDef = shadowDefinitions.find(s => s.id === shadowId);
        if (!targetShadowDef) {
             console.error("Shadow definition not found:", shadowId);
             return;
        }


        let updatedEquippedShadows = [...currentEquipped];

        if (equip) {
            // Check if already equipped
            if (currentEquipped.includes(shadowId)) {
                showSystemMessage(`${targetShadowDef.name} is already equipped.`);
                return;
            }
            // Check if max limit reached
            if (currentEquipped.length >= maxEquipped) {
                showSystemMessage(`Cannot equip more than ${maxEquipped} shadows.`);
                return;
            }
            // Add to equipped list
            updatedEquippedShadows.push(shadowId);
        } else {
            // Remove from equipped list
            updatedEquippedShadows = currentEquipped.filter(id => id !== shadowId);
        }

        try {
            await updateDoc(userDocRef, {
                equippedShadows: updatedEquippedShadows
            });
            // onSnapshot will update the local 'stats' state
             showSystemMessage(equip ? `Equipped: ${targetShadowDef.name}` : `Unequipped: ${targetShadowDef.name}`);
             console.log("Updated equipped shadows in Firestore:", updatedEquippedShadows);
        } catch (error) {
            console.error("Error updating equipped shadows:", error);
            showSystemMessage(`Failed to ${equip ? 'equip' : 'unequip'} ${targetShadowDef.name}.`);
        }

    }, [user, stats, showSystemMessage, shadowDefinitions]);


    // --- Processed data for modals ---
    // Combine skill definitions with user's unlock status
     const userSkills = useMemo(() => {
        if (!stats) return [];
        // TODO: Integrate cooldown status from Firestore if implemented
        // const now = Date.now();
        return skillDefinitions.map(def => ({
            ...def,
            // unlocked: (stats.unlockedSkills || []).includes(def.id), // Check if user has unlocked it
            // cooldownEndTime: stats.activeCooldowns?.[def.id] || 0, // Get cooldown end time from stats
            // isOnCooldown: (stats.activeCooldowns?.[def.id] || 0) > now,
            cooldown: def.cooldown || 0 // Using local simulation cooldown for now
        }));
    }, [stats, skillDefinitions]);

    // Combine shadow definitions with user's unlock/equip status
    const userShadows = useMemo(() => {
        if (!stats) return [];
         // TODO: Determine 'unlocked' status based on requirements and user stats/progress
         // For now, assuming unlock requirement string is just for display
         // and 'unlocked' status needs separate logic or Firestore field
        return shadowDefinitions.map(def => ({
            ...def,
            unlocked: true, // Placeholder: Assume all defined shadows are potentially unlockable
            // unlocked: checkShadowUnlock(def, stats), // Replace with actual unlock check logic
            equipped: (stats.equippedShadows || []).includes(def.id) // Check if equipped
        }));
    }, [stats, shadowDefinitions]);


    // --- Loading and Error States ---
    if (authLoading || localLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#101827]">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-white text-xl">Loading System Interface...</p>
                </div>
            </div>
        );
    }

    // If user is logged in but stats failed to load (e.g., Firestore error, but doc *should* be created now)
    if (user && !stats) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-[#101827] text-center p-4">
                <h2 className="text-2xl text-red-400 font-semibold mb-4">Error Loading Profile</h2>
                <p className="text-gray-400 mb-6 max-w-md">
                    We encountered an issue loading your Hunter profile. This might be temporary.
                    Please try refreshing the page. If the problem persists, contact support.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-sm px-4 py-2 transition-all shadow-md hover:shadow-lg"
                    >
                        Refresh Page
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-semibold rounded-md text-sm px-4 py-2 transition-all shadow-md hover:shadow-lg"
                    >
                        Logout
                    </button>
                </div>
                 {/* Display system message if available */}
                 <SystemMessage message={systemMessage} />
            </div>
        );
    }

    // If user somehow becomes null after loading checks (should be caught by redirect)
    if (!user) {
        console.warn("DashboardPage rendering null because user is null after loading checks.");
        return null; // Or redirect again just in case
    }

    // --- Render Main Dashboard ---
    return (
        <>
            <div className="min-h-screen bg-[#101827] text-gray-100 font-sans p-4 sm:p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-6 sm:mb-10 flex-wrap gap-y-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-blue-300 tracking-wide">
                        {stats.hunterName || 'Hunter'}'s Dashboard
                    </h1>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <button onClick={() => setIsShadowArmyOpen(true)} className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium px-2 py-1 hover:bg-purple-900/30 rounded">Shadows</button>
                        <button onClick={() => setIsQuestLogOpen(true)} className="text-xs sm:text-sm text-green-400 hover:text-green-300 transition-colors font-medium px-2 py-1 hover:bg-green-900/30 rounded">Quests</button>
                        <button onClick={() => setIsSkillsModalOpen(true)} className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 transition-colors font-medium px-2 py-1 hover:bg-yellow-900/30 rounded">Skills</button>
                        <Link href="/leaderboard" className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium px-2 py-1 hover:bg-blue-900/30 rounded">Rankings</Link>
                        <span className="text-sm text-gray-500 hidden sm:inline mx-1">|</span>
                        <span className="text-xs sm:text-sm text-gray-300" title={user.email || 'No email'}>@{stats.username || '...'}</span>
                        <button onClick={handleLogout} className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-semibold rounded-md text-xs sm:text-sm px-3 py-1.5 transition-all shadow-md hover:shadow-lg">
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Grid */}
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left/Center Column (Stats & Workouts) */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Level & Status */}
                        <div className="md:col-span-1 grid grid-rows-2 gap-4 sm:gap-6">
                            <StatCard title="Level" value={stats.level}>
                                <HunterRank level={stats.level} />
                            </StatCard>
                            <StatCard title="Status" className="justify-around py-6">
                                <ProgressBar label="HP" value={stats.hp} max={stats.maxHp} color="bg-red-500" />
                                <ProgressBar label="EXP" value={stats.exp} max={stats.maxExp} color="bg-yellow-500" />
                            </StatCard>
                        </div>

                        {/* Strength & Stat Points */}
                        <div className="md:col-span-1 grid grid-rows-2 gap-4 sm:gap-6">
                            <StatItem
                                title="Strength"
                                value={stats.strength}
                                onIncrease={() => handleIncreaseStat('strength')}
                                availablePoints={stats.statPoints}
                            />
                            <StatCard title="Stat Points" value={stats.statPoints} />
                        </div>

                        {/* Vitality, Agility & Workouts */}
                         <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                             {/* Use grid-cols-2 for stats on smaller screens within this block */}
                             <div className="grid grid-cols-2 md:col-span-2 gap-4 sm:gap-6">
                                <StatItem
                                    title="Vitality"
                                    value={stats.vitality}
                                    onIncrease={() => handleIncreaseStat('vitality')}
                                    availablePoints={stats.statPoints}
                                />
                                <StatItem
                                    title="Agility"
                                    value={stats.agility}
                                    onIncrease={() => handleIncreaseStat('agility')}
                                    availablePoints={stats.statPoints}
                                />
                             </div>
                             {/* Gate Button */}
                            <div className="md:col-span-1">
                                <StatCard
                                    title="Gates"
                                    className="items-center justify-center h-full text-center cursor-pointer group"
                                    onClick={() => setIsWorkoutModalOpen(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400 group-hover:text-blue-300 transition-colors duration-200 mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <p className="text-gray-400 mt-2 text-sm group-hover:text-white transition-colors duration-200">Enter Gate</p>
                                    {activeWorkout && (
                                        <p className="text-xs text-blue-300 mt-1 animate-pulse">
                                            Clearing: {activeWorkout.name}
                                        </p>
                                    )}
                                    {wearableIntegration?.isConnected && (
                                        <div className="mt-2 flex items-center justify-center">
                                            <span className="bg-green-900/30 text-green-300 text-xs px-2 py-0.5 rounded-full flex items-center">
                                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                                Smartwatch Ready
                                            </span>
                                        </div>
                                    )}
                                </StatCard>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Chat) */}
                    <ChatBox
                        user={user}
                        hunterName={stats.hunterName}
                        currentUsername={stats.username} // Pass username fetched from stats
                    />
                </main>

                {/* Wearable Device Button */}
                <div className="fixed bottom-4 right-4 z-[100]">
                    <button
                        onClick={() => setIsWearableModalOpen(true)}
                        className={`p-3 rounded-full shadow-lg ${wearableIntegration?.isConnected ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-colors`}
                        title="Connect Smartwatch"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </div>

                {/* End Tracked Workout Button (only shown when there's an active tracked workout) */}
                {wearableIntegration?.currentWorkout && (
                    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100]">
                        <button
                            onClick={handleEndTrackedWorkout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center space-x-2 animate-pulse"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                            </svg>
                            <span>End Workout</span>
                        </button>
                    </div>
                )}
            </div>

             {/* Test EXP Button - Only in Development */}
             {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 left-4 z-[100]">
                    <button
                        // Use a smaller, fixed amount for easier testing, or percentage as before
                        onClick={() => handleGainExp(100)} // Test with fixed 100 EXP
                        // onClick={() => handleGainExp(stats?.maxExp ? Math.floor(stats.maxExp * 0.8) : 100)}
                        className="px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded shadow-lg text-xs font-semibold"
                        title={`Gain 100 EXP (Test)`}
                        // title={`Gain ${stats?.maxExp ? Math.floor(stats.maxExp * 0.8) : 100} EXP (Test)`}
                    >
                        +EXP (Test)
                    </button>
                </div>
             )}

            {/* Modals */}
            <WorkoutModal
                isOpen={isWorkoutModalOpen}
                onClose={() => setIsWorkoutModalOpen(false)}
                workouts={stats.availableWorkouts || []} // Pass workouts from stats
                onStartWorkout={handleStartWorkout}
                wearableConnected={wearableIntegration?.isConnected}
                onStartTrackedWorkout={handleStartTrackedWorkout}
            />
            <WearableModal
                isOpen={isWearableModalOpen}
                onClose={() => setIsWearableModalOpen(false)}
                wearableIntegration={wearableIntegration}
                onConnect={handleConnectWearable}
                onDisconnect={handleDisconnectWearable}
                onUpdateSettings={handleUpdateWearableSettings}
            />
            <SystemMessage message={systemMessage} />
            <SkillsModal
                isOpen={isSkillsModalOpen}
                onClose={() => setIsSkillsModalOpen(false)}
                skills={userSkills} // Pass processed skills
                onActivateSkill={handleActivateSkill}
                stats={stats} // Pass current stats for requirement checks
            />
            <QuestLogModal
                isOpen={isQuestLogOpen}
                onClose={() => setIsQuestLogOpen(false)}
                quests={mergedQuests} // Pass the combined list
                onAcceptQuest={handleAcceptQuest}
                onAbandonQuest={handleAbandonQuest}
                onCompleteQuest={handleCompleteQuest}
            />
            <ShadowArmyModal
                isOpen={isShadowArmyOpen}
                onClose={() => setIsShadowArmyOpen(false)}
                shadows={userShadows} // Pass processed shadows
                onEquipShadow={handleEquipShadow}
                maxEquipped={3} // Define max equipped count (could be dynamic from stats)
            />
            <LevelUpModal
                isOpen={showLevelUp}
                onClose={() => setShowLevelUp(false)}
                newLevel={levelUpDetails.level}
                rewards={levelUpDetails.rewards}
            />
        </>
    );
}