/**
 * Gym Plan Service for Solo Leveling Gym
 * Handles operations related to personalized workout plans
 */

import { db } from '../firebase/config';
import { getAuth } from 'firebase/auth';
import { collection, doc, addDoc, getDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from '@firebase/firestore';
import { createGymPlan, fromFirestore, toFirestore } from '../models/gymPlanModel';

/**
 * Service class for gym plan operations
 */
export class GymPlanService {
  /**
   * Save a new gym plan for a user
   * @param {string} userId - The user ID
   * @param {Object} planData - The plan data
   * @returns {Promise<string>} - The ID of the created plan
   */
  async savePlan(userId, planData) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const plan = createGymPlan(planData);

      // Add timestamp
      plan.createdAt = new Date().toISOString();

      // Add to Firestore
      const plansRef = collection(db, 'users', userId, 'gymPlans');
      const docRef = await addDoc(plansRef, toFirestore(plan));

      return docRef.id;
    } catch (error) {
      console.error('Error saving gym plan:', error);
      throw error;
    }
  }

  /**
   * Get a specific gym plan by ID
   * @param {string} userId - The user ID
   * @param {string} planId - The plan ID
   * @returns {Promise<Object|null>} - The gym plan or null if not found
   */
  async getPlan(userId, planId) {
    try {
      if (!userId || !planId) {
        throw new Error('User ID and plan ID are required');
      }

      const planRef = doc(db, 'users', userId, 'gymPlans', planId);
      const planDoc = await getDoc(planRef);

      if (!planDoc.exists()) {
        return null;
      }

      return fromFirestore(planDoc.data());
    } catch (error) {
      console.error('Error getting gym plan:', error);
      throw error;
    }
  }

  /**
   * Get the latest gym plan for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object|null>} - The latest gym plan or null if none exists
   */
  async getLatestPlan(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const plansRef = collection(db, 'users', userId, 'gymPlans');
      const q = query(plansRef, orderBy('createdAt', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const planDoc = querySnapshot.docs[0];
      return {
        id: planDoc.id,
        ...fromFirestore(planDoc.data())
      };
    } catch (error) {
      console.error('Error getting latest gym plan:', error);
      throw error;
    }
  }

  /**
   * Get all gym plans for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} - Array of gym plans
   */
  async getAllPlans(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const plansRef = collection(db, 'users', userId, 'gymPlans');
      const q = query(plansRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...fromFirestore(doc.data())
      }));
    } catch (error) {
      console.error('Error getting all gym plans:', error);
      throw error;
    }
  }

  /**
   * Generate a personalized gym plan based on user input
   * @param {Object} planData - The plan data
   * @returns {Promise<string>} - The generated plan text
   */
  async generatePlan(planData) {
    try {
      // Prepare the prompt for the AI
      const prompt = this._createPromptFromPlanData(planData);

      // Get the current user's token
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const token = await currentUser.getIdToken();

      // Call the Gemini API to generate the plan
      const response = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate plan');
      }

      const data = await response.json();
      return data.plan;
    } catch (error) {
      console.error('Error generating gym plan:', error);
      throw error;
    }
  }

  /**
   * Create a prompt for the AI based on plan data
   * @param {Object} planData - The plan data
   * @returns {string} - The prompt for the AI
   * @private
   */
  _createPromptFromPlanData(planData) {
    return `Create a personalized gym workout plan with the following details:

Age: ${planData.age || 'Not specified'}
Sex: ${planData.sex || 'Not specified'}
Height: ${planData.height || 'Not specified'}
Weight: ${planData.weight || 'Not specified'}
Fitness Level: ${planData.fitnessLevel}
Goals: ${planData.goals.join(', ')}
Intensity: ${planData.intensity}
Days Per Week: ${planData.daysPerWeek}
Minutes Per Session: ${planData.minutesPerSession}
Equipment Access: ${planData.equipmentAccess}
Health Conditions: ${planData.healthConditions.length > 0 ? planData.healthConditions.join(', ') : 'None specified'}
Preferences: ${planData.preferences.length > 0 ? planData.preferences.join(', ') : 'None specified'}

Please provide a detailed workout plan that includes:
1. A weekly schedule
2. Specific exercises for each day
3. Sets, reps, and rest periods
4. Warm-up and cool-down routines
5. Progression guidelines
6. Nutrition tips related to their goals

Format the plan in a clear, structured way with markdown formatting.`;
  }
}
