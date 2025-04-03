/**
 * Configuration for smartwatch and wearable device integrations
 * Supports multiple wearable platforms through their respective APIs
 */

// Supported wearable platforms and their API configurations
export const SUPPORTED_WEARABLES = {
  FITBIT: {
    name: 'Fitbit',
    apiBase: 'https://api.fitbit.com/1/user/-/',
    scopes: [
      'activity',
      'heartrate',
      'location',
      'nutrition',
      'profile',
      'settings',
      'sleep',
      'weight'
    ],
    authEndpoint: 'https://www.fitbit.com/oauth2/authorize',
    tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
    clientId: process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID || '',
    clientSecret: process.env.FITBIT_CLIENT_SECRET || '',
  },
  GARMIN: {
    name: 'Garmin',
    apiBase: 'https://apis.garmin.com/wellness-api/rest/',
    scopes: [
      'activity_data',
      'heart_rate',
      'sleep_data',
      'user_profile'
    ],
    authEndpoint: 'https://connect.garmin.com/oauthConfirm',
    tokenEndpoint: 'https://connectapi.garmin.com/oauth-service/oauth/token',
    clientId: process.env.NEXT_PUBLIC_GARMIN_CLIENT_ID || '',
    clientSecret: process.env.GARMIN_CLIENT_SECRET || '',
  },
  APPLE_HEALTH: {
    name: 'Apple Health',
    // Apple Health requires a native app integration
    // This is a placeholder for future implementation
    isNative: true,
    requiresApp: true,
  },
  GOOGLE_FIT: {
    name: 'Google Fit',
    apiBase: 'https://www.googleapis.com/fitness/v1/users/me/',
    scopes: [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read'
    ],
    authEndpoint: 'https://accounts.google.com/o/oauth2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    clientId: process.env.NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_FIT_CLIENT_SECRET || '',
  },
  SAMSUNG_HEALTH: {
    name: 'Samsung Health',
    // Samsung Health requires a native app integration
    // This is a placeholder for future implementation
    isNative: true,
    requiresApp: true,
  }
};

// Workout activity types that can be tracked
export const ACTIVITY_TYPES = {
  RUNNING: 'running',
  WALKING: 'walking',
  CYCLING: 'cycling',
  STRENGTH_TRAINING: 'strength_training',
  HIIT: 'hiit',
  YOGA: 'yoga',
  SWIMMING: 'swimming',
  ELLIPTICAL: 'elliptical',
  ROWING: 'rowing',
  CUSTOM: 'custom'
};

// Mapping between our activity types and platform-specific activity types
export const ACTIVITY_TYPE_MAPPINGS = {
  FITBIT: {
    [ACTIVITY_TYPES.RUNNING]: 'Run',
    [ACTIVITY_TYPES.WALKING]: 'Walk',
    [ACTIVITY_TYPES.CYCLING]: 'Bike',
    [ACTIVITY_TYPES.STRENGTH_TRAINING]: 'Weights',
    [ACTIVITY_TYPES.HIIT]: 'Interval',
    [ACTIVITY_TYPES.YOGA]: 'Yoga',
    [ACTIVITY_TYPES.SWIMMING]: 'Swim',
    [ACTIVITY_TYPES.ELLIPTICAL]: 'Elliptical',
    [ACTIVITY_TYPES.ROWING]: 'Rowing',
    [ACTIVITY_TYPES.CUSTOM]: 'Workout'
  },
  GOOGLE_FIT: {
    [ACTIVITY_TYPES.RUNNING]: 'running',
    [ACTIVITY_TYPES.WALKING]: 'walking',
    [ACTIVITY_TYPES.CYCLING]: 'biking',
    [ACTIVITY_TYPES.STRENGTH_TRAINING]: 'strength_training',
    [ACTIVITY_TYPES.HIIT]: 'interval_training',
    [ACTIVITY_TYPES.YOGA]: 'yoga',
    [ACTIVITY_TYPES.SWIMMING]: 'swimming',
    [ACTIVITY_TYPES.ELLIPTICAL]: 'elliptical',
    [ACTIVITY_TYPES.ROWING]: 'rowing',
    [ACTIVITY_TYPES.CUSTOM]: 'workout'
  }
  // Add mappings for other platforms as needed
};

// Default settings for workout tracking
export const DEFAULT_TRACKING_SETTINGS = {
  trackHeartRate: true,
  trackCalories: true,
  trackSteps: true,
  trackDistance: true,
  trackDuration: true,
  autoDetectActivity: true,
  notifyOnMilestones: true,
  syncFrequency: 'realtime', // 'realtime', 'end_of_workout', 'manual'
};
