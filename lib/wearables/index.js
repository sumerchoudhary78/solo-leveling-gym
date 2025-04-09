/**
 * Wearables integration module for Solo Leveling Gym
 * Provides functionality to connect to and retrieve data from various smartwatches and fitness trackers
 */

import { SUPPORTED_WEARABLES, ACTIVITY_TYPES, ACTIVITY_TYPE_MAPPINGS, DEFAULT_TRACKING_SETTINGS } from './config';
import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from '@firebase/firestore';
import { db } from '../firebase/config';

/**
 * Main class for wearable device integration
 */
class WearableIntegration {
  constructor(userId, platform = null) {
    this.userId = userId;
    this.platform = platform;
    this.isConnected = false;
    this.lastSyncTime = null;
    this.currentWorkout = null;
    this.settings = { ...DEFAULT_TRACKING_SETTINGS };
  }

  /**
   * Initialize the wearable integration for a user
   * @param {string} userId - Firebase user ID
   * @returns {Promise<WearableIntegration>} - Initialized integration instance
   */
  static async initialize(userId) {
    try {
      if (!userId) {
        console.error("Cannot initialize wearable integration: No user ID provided");
        return new WearableIntegration("anonymous");
      }

      // Check if user has existing wearable settings
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().wearableSettings) {
        const userData = userDoc.data();
        const wearableSettings = userData.wearableSettings || {};
        const { platform, settings, isConnected, lastSyncTime } = wearableSettings;

        const integration = new WearableIntegration(userId, platform);
        integration.settings = { ...DEFAULT_TRACKING_SETTINGS, ...(settings || {}) };
        integration.isConnected = isConnected || false;
        integration.lastSyncTime = lastSyncTime || null;

        return integration;
      }

      // No existing settings, return default instance
      return new WearableIntegration(userId);
    } catch (error) {
      console.error("Error initializing wearable integration:", error);
      // Return a default instance that won't break the app
      return new WearableIntegration(userId || "anonymous");
    }
  }

  /**
   * Get list of supported wearable platforms
   * @returns {Array} - List of supported platforms
   */
  getSupportedPlatforms() {
    return Object.keys(SUPPORTED_WEARABLES).map(key => ({
      id: key,
      name: SUPPORTED_WEARABLES[key].name,
      requiresApp: SUPPORTED_WEARABLES[key].requiresApp || false
    }));
  }

  /**
   * Connect to a wearable platform
   * @param {string} platformId - ID of the platform to connect to
   * @returns {Promise<Object>} - Connection result
   */
  async connectToPlatform(platformId) {
    try {
      if (!SUPPORTED_WEARABLES[platformId]) {
        throw new Error(`Unsupported platform: ${platformId}`);
      }

      const platform = SUPPORTED_WEARABLES[platformId];

      // For platforms requiring native app
      if (platform.requiresApp) {
        return {
          success: false,
          requiresApp: true,
          message: `${platform.name} requires a native app integration. Please install the Solo Leveling Gym app from the app store.`
        };
      }

      // For OAuth-based platforms
      // In a real implementation, this would redirect to the OAuth flow
      // For now, we'll simulate a successful connection

      // Update user's wearable settings in Firestore
      const userDocRef = doc(db, "users", this.userId);
      await updateDoc(userDocRef, {
        'wearableSettings': {
          platform: platformId,
          isConnected: true,
          lastSyncTime: serverTimestamp(),
          settings: this.settings
        }
      });

      this.platform = platformId;
      this.isConnected = true;
      this.lastSyncTime = new Date();

      return {
        success: true,
        platform: platformId,
        message: `Successfully connected to ${platform.name}`
      };
    } catch (error) {
      console.error("Error connecting to wearable platform:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Disconnect from the current wearable platform
   * @returns {Promise<Object>} - Disconnection result
   */
  async disconnect() {
    try {
      if (!this.platform) {
        return { success: false, message: "No platform connected" };
      }

      // Update user's wearable settings in Firestore
      const userDocRef = doc(db, "users", this.userId);
      await updateDoc(userDocRef, {
        'wearableSettings.isConnected': false
      });

      this.isConnected = false;

      return {
        success: true,
        message: `Disconnected from ${SUPPORTED_WEARABLES[this.platform].name}`
      };
    } catch (error) {
      console.error("Error disconnecting from wearable platform:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start tracking a workout
   * @param {Object} workout - Workout details
   * @returns {Promise<Object>} - Start tracking result
   */
  async startWorkoutTracking(workout) {
    try {
      if (!this.isConnected) {
        throw new Error("No wearable device connected");
      }

      // Map our workout type to the platform-specific type
      const activityType = workout.activityType || ACTIVITY_TYPES.CUSTOM;
      const platformActivityType = ACTIVITY_TYPE_MAPPINGS[this.platform]?.[activityType] ||
                                  ACTIVITY_TYPE_MAPPINGS[this.platform]?.[ACTIVITY_TYPES.CUSTOM];

      // In a real implementation, this would start a workout session on the device
      // For now, we'll simulate starting a workout

      // Create a workout tracking document in Firestore
      const workoutId = `workout_${Date.now()}`;
      const workoutDocRef = doc(db, "users", this.userId, "workouts", workoutId);

      const workoutData = {
        id: workoutId,
        name: workout.name,
        activityType,
        platformActivityType,
        startTime: serverTimestamp(),
        endTime: null,
        inProgress: true,
        platform: this.platform,
        metrics: {
          heartRate: [],
          calories: 0,
          steps: 0,
          distance: 0,
          duration: 0
        },
        // Store the original workout data for game mechanics
        gameData: {
          ...workout,
          expGained: 0,
          completed: false
        }
      };

      await setDoc(workoutDocRef, workoutData);

      this.currentWorkout = {
        id: workoutId,
        ...workoutData
      };

      return {
        success: true,
        workoutId,
        message: `Started tracking workout: ${workout.name}`
      };
    } catch (error) {
      console.error("Error starting workout tracking:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * End the current workout tracking session
   * @param {Object} metrics - Final workout metrics
   * @returns {Promise<Object>} - End tracking result
   */
  async endWorkoutTracking(metrics = {}) {
    try {
      if (!this.currentWorkout) {
        throw new Error("No active workout to end");
      }

      // In a real implementation, this would end the workout session on the device
      // and retrieve the final metrics
      // For now, we'll simulate ending a workout with some metrics

      // Update the workout document in Firestore
      const workoutDocRef = doc(db, "users", this.userId, "workouts", this.currentWorkout.id);

      // Combine provided metrics with defaults
      const finalMetrics = {
        heartRate: metrics.heartRate || [],
        calories: metrics.calories || Math.floor(Math.random() * 300) + 100, // Simulate 100-400 calories
        steps: metrics.steps || Math.floor(Math.random() * 5000) + 1000, // Simulate 1000-6000 steps
        distance: metrics.distance || (Math.random() * 5).toFixed(2), // Simulate 0-5 km
        duration: metrics.duration || Math.floor(Math.random() * 60) + 15 // Simulate 15-75 minutes
      };

      // Calculate exp based on metrics
      const expGained = Math.floor(finalMetrics.calories * 0.5 + finalMetrics.duration * 2);

      await updateDoc(workoutDocRef, {
        endTime: serverTimestamp(),
        inProgress: false,
        metrics: finalMetrics,
        'gameData.expGained': expGained,
        'gameData.completed': true
      });

      const completedWorkout = {
        ...this.currentWorkout,
        metrics: finalMetrics,
        endTime: new Date(),
        inProgress: false,
        gameData: {
          ...this.currentWorkout.gameData,
          expGained,
          completed: true
        }
      };

      // Reset current workout
      const workoutToReturn = { ...completedWorkout };
      this.currentWorkout = null;

      return {
        success: true,
        workout: workoutToReturn,
        message: `Ended workout tracking: ${workoutToReturn.name}`,
        expGained
      };
    } catch (error) {
      console.error("Error ending workout tracking:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update workout metrics in real-time
   * @param {Object} metrics - Current workout metrics
   * @returns {Promise<Object>} - Update result
   */
  async updateWorkoutMetrics(metrics) {
    try {
      if (!this.currentWorkout) {
        throw new Error("No active workout to update");
      }

      // Update the workout document in Firestore with the latest metrics
      const workoutDocRef = doc(db, "users", this.userId, "workouts", this.currentWorkout.id);

      await updateDoc(workoutDocRef, {
        metrics: {
          ...this.currentWorkout.metrics,
          ...metrics
        }
      });

      // Update local state
      this.currentWorkout.metrics = {
        ...this.currentWorkout.metrics,
        ...metrics
      };

      return {
        success: true,
        message: "Workout metrics updated"
      };
    } catch (error) {
      console.error("Error updating workout metrics:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's workout history
   * @param {number} limit - Maximum number of workouts to retrieve
   * @returns {Promise<Array>} - Workout history
   */
  async getWorkoutHistory(limit = 10) {
    // Implementation would fetch workout history from Firestore
    // This would be implemented in a real application
    return [];
  }

  /**
   * Update wearable integration settings
   * @param {Object} newSettings - New settings
   * @returns {Promise<Object>} - Update result
   */
  async updateSettings(newSettings) {
    try {
      // Merge new settings with existing settings
      const updatedSettings = {
        ...this.settings,
        ...newSettings
      };

      // Update settings in Firestore
      const userDocRef = doc(db, "users", this.userId);
      await updateDoc(userDocRef, {
        'wearableSettings.settings': updatedSettings
      });

      this.settings = updatedSettings;

      return {
        success: true,
        settings: updatedSettings,
        message: "Wearable settings updated"
      };
    } catch (error) {
      console.error("Error updating wearable settings:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default WearableIntegration;
export { SUPPORTED_WEARABLES, ACTIVITY_TYPES };
