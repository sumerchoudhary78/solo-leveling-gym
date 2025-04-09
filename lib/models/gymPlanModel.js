/**
 * Gym Plan Model for Solo Leveling Gym
 * Defines the data structure for personalized workout plans
 */

/**
 * Create a new gym plan object
 * @param {Object} data - The plan data
 * @returns {Object} - Formatted gym plan object
 */
export function createGymPlan(data = {}) {
  return {
    age: data.age || null,
    sex: data.sex || null,
    height: data.height || null,
    weight: data.weight || null,
    fitnessLevel: data.fitnessLevel || 'beginner',
    goals: Array.isArray(data.goals) ? data.goals : [],
    intensity: data.intensity || 'moderate',
    daysPerWeek: data.daysPerWeek || 3,
    minutesPerSession: data.minutesPerSession || 60,
    equipmentAccess: data.equipmentAccess || 'gym',
    healthConditions: Array.isArray(data.healthConditions) ? data.healthConditions : [],
    preferences: Array.isArray(data.preferences) ? data.preferences : [],
    generatedPlan: data.generatedPlan || null,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

/**
 * Convert Firestore data to a gym plan object
 * @param {Object} data - Firestore document data
 * @returns {Object} - Formatted gym plan object
 */
export function fromFirestore(data) {
  if (!data) return null;
  
  return {
    age: data.age || null,
    sex: data.sex || null,
    height: data.height || null,
    weight: data.weight || null,
    fitnessLevel: data.fitnessLevel || 'beginner',
    goals: Array.isArray(data.goals) ? data.goals : [],
    intensity: data.intensity || 'moderate',
    daysPerWeek: data.daysPerWeek || 3,
    minutesPerSession: data.minutesPerSession || 60,
    equipmentAccess: data.equipmentAccess || 'gym',
    healthConditions: Array.isArray(data.healthConditions) ? data.healthConditions : [],
    preferences: Array.isArray(data.preferences) ? data.preferences : [],
    generatedPlan: data.generatedPlan || null,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

/**
 * Convert a gym plan object to Firestore data
 * @param {Object} plan - Gym plan object
 * @returns {Object} - Formatted data for Firestore
 */
export function toFirestore(plan) {
  return {
    age: plan.age,
    sex: plan.sex,
    height: plan.height,
    weight: plan.weight,
    fitnessLevel: plan.fitnessLevel,
    goals: plan.goals,
    intensity: plan.intensity,
    daysPerWeek: plan.daysPerWeek,
    minutesPerSession: plan.minutesPerSession,
    equipmentAccess: plan.equipmentAccess,
    healthConditions: plan.healthConditions,
    preferences: plan.preferences,
    generatedPlan: plan.generatedPlan,
    createdAt: plan.createdAt,
  };
}
