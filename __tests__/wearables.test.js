/**
 * Tests for wearable device integration
 */

import WearableIntegration, { SUPPORTED_WEARABLES, ACTIVITY_TYPES } from '../lib/wearables';
import { doc, getDoc, updateDoc, setDoc } from '@firebase/firestore';
import { db } from '../lib/firebase/config';

// Mock Firebase Firestore
jest.mock('@firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

// Mock Firebase config
jest.mock('../lib/firebase/config', () => ({
  db: {}
}));

describe('WearableIntegration', () => {
  const mockUserId = 'test-user-123';
  let wearableIntegration;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock successful document retrieval with no existing wearable settings
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        level: 1,
        exp: 0,
        maxExp: 100
      })
    });
    
    // Mock successful document updates
    updateDoc.mockResolvedValue({});
    setDoc.mockResolvedValue({});
    
    // Create a new instance for each test
    wearableIntegration = new WearableIntegration(mockUserId);
  });

  test('should initialize with default settings', () => {
    expect(wearableIntegration.userId).toBe(mockUserId);
    expect(wearableIntegration.platform).toBeNull();
    expect(wearableIntegration.isConnected).toBe(false);
    expect(wearableIntegration.lastSyncTime).toBeNull();
    expect(wearableIntegration.currentWorkout).toBeNull();
    expect(wearableIntegration.settings).toBeDefined();
  });

  test('should return supported platforms', () => {
    const platforms = wearableIntegration.getSupportedPlatforms();
    expect(platforms).toBeInstanceOf(Array);
    expect(platforms.length).toBeGreaterThan(0);
    expect(platforms[0]).toHaveProperty('id');
    expect(platforms[0]).toHaveProperty('name');
  });

  test('should connect to a supported platform', async () => {
    const platformId = 'FITBIT';
    const result = await wearableIntegration.connectToPlatform(platformId);
    
    expect(result.success).toBe(true);
    expect(result.platform).toBe(platformId);
    expect(wearableIntegration.platform).toBe(platformId);
    expect(wearableIntegration.isConnected).toBe(true);
    
    // Verify Firestore was updated
    expect(updateDoc).toHaveBeenCalled();
  });

  test('should reject connection to unsupported platform', async () => {
    const platformId = 'UNSUPPORTED_PLATFORM';
    
    await expect(wearableIntegration.connectToPlatform(platformId))
      .rejects.toThrow(`Unsupported platform: ${platformId}`);
  });

  test('should disconnect from platform', async () => {
    // First connect
    wearableIntegration.platform = 'FITBIT';
    wearableIntegration.isConnected = true;
    
    // Then disconnect
    const result = await wearableIntegration.disconnect();
    
    expect(result.success).toBe(true);
    expect(wearableIntegration.isConnected).toBe(false);
    
    // Verify Firestore was updated
    expect(updateDoc).toHaveBeenCalled();
  });

  test('should start workout tracking', async () => {
    // Setup connected state
    wearableIntegration.platform = 'FITBIT';
    wearableIntegration.isConnected = true;
    
    const workout = {
      name: 'Test Workout',
      activityType: ACTIVITY_TYPES.STRENGTH_TRAINING,
      difficulty: 'medium',
      duration: '30',
      exp: 100
    };
    
    const result = await wearableIntegration.startWorkoutTracking(workout);
    
    expect(result.success).toBe(true);
    expect(result.workoutId).toBeDefined();
    expect(wearableIntegration.currentWorkout).toBeDefined();
    expect(wearableIntegration.currentWorkout.name).toBe(workout.name);
    
    // Verify Firestore document was created
    expect(setDoc).toHaveBeenCalled();
  });

  test('should end workout tracking', async () => {
    // Setup connected state with active workout
    wearableIntegration.platform = 'FITBIT';
    wearableIntegration.isConnected = true;
    wearableIntegration.currentWorkout = {
      id: 'workout_123',
      name: 'Test Workout',
      activityType: ACTIVITY_TYPES.STRENGTH_TRAINING,
      metrics: {
        heartRate: [],
        calories: 0,
        steps: 0,
        distance: 0,
        duration: 0
      },
      gameData: {
        exp: 100,
        completed: false
      }
    };
    
    const result = await wearableIntegration.endWorkoutTracking();
    
    expect(result.success).toBe(true);
    expect(result.expGained).toBeGreaterThan(0);
    expect(wearableIntegration.currentWorkout).toBeNull();
    
    // Verify Firestore was updated
    expect(updateDoc).toHaveBeenCalled();
  });

  test('should update settings', async () => {
    const newSettings = {
      trackHeartRate: false,
      syncFrequency: 'manual'
    };
    
    const result = await wearableIntegration.updateSettings(newSettings);
    
    expect(result.success).toBe(true);
    expect(wearableIntegration.settings.trackHeartRate).toBe(false);
    expect(wearableIntegration.settings.syncFrequency).toBe('manual');
    
    // Verify Firestore was updated
    expect(updateDoc).toHaveBeenCalled();
  });
});
