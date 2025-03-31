// src/data/quests.js

// In a larger app, fetch these from a separate 'quests' collection in Firestore
export const masterQuestDefinitions = [
    {
      id: "q1",
      title: "Push Yourself to the Limit",
      description: "Complete 50 push-ups in a single day.",
      type: "daily",
      rewardExp: 100,
      rewardPoints: 0,
      timeLimit: 24 // Optional: Add logic to handle time limits if needed
    },
    {
      id: "q2",
      title: "Endurance Training",
      description: "Run a distance of 5km.",
      type: "weekly",
      rewardExp: 200,
      rewardPoints: 1,
      timeLimit: 168 // 7 days in hours
    },
    {
      id: "q3",
      title: "Weight Room Master",
      description: "Deadlift your body weight for 5 reps.",
      type: "main",
      rewardExp: 300,
      rewardPoints: 2,
      rewardItem: "Special Protein Shake"
    },
    {
      id: "q4",
      title: "Recovery Day",
      description: "Perform a 20-minute stretching routine.",
      type: "daily",
      rewardExp: 50
    },
    // Add more quest definitions here...
];

// You could add skill/shadow definitions here too if they become static data
// export const masterSkillDefinitions = [ ... ];
// export const masterShadowDefinitions = [ ... ];