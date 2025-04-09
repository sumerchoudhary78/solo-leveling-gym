/**
 * API routes for wearable device integration
 * Handles authentication, data retrieval, and webhook endpoints for smartwatch data
 */

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import WearableIntegration from '../../../lib/wearables';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );

    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Initialize with default app config if service account is not available
    // This is useful for development environments
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
    });
  }
}

// Initialize Firestore for admin operations if needed
// We're not using it directly in this file, but initializing for completeness
getFirestore();

/**
 * Verify Firebase authentication token
 * @param {string} token - Firebase auth token
 * @returns {Promise<Object>} - User data if valid
 */
async function verifyAuthToken(token) {
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}

/**
 * Handle GET requests - Retrieve wearable data
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await verifyAuthToken(authToken);
    if (!userData) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const userId = userData.uid;

    // Initialize wearable integration
    const wearableIntegration = await WearableIntegration.initialize(userId);

    switch (action) {
      case 'platforms':
        // Get supported platforms
        const platforms = wearableIntegration.getSupportedPlatforms();
        return NextResponse.json({ platforms });

      case 'status':
        // Get connection status
        return NextResponse.json({
          isConnected: wearableIntegration.isConnected,
          platform: wearableIntegration.platform,
          lastSyncTime: wearableIntegration.lastSyncTime,
          settings: wearableIntegration.settings
        });

      case 'history':
        // Get workout history
        const limit = parseInt(searchParams.get('limit') || '10');
        const history = await wearableIntegration.getWorkoutHistory(limit);
        return NextResponse.json({ history });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in wearables API:', error);
    return NextResponse.json({
      error: 'Server error',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * Handle POST requests - Connect, start/end workouts, update settings
 */
export async function POST(request) {
  try {
    const { action, platformId, workout, metrics, settings } = await request.json();
    const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userData = await verifyAuthToken(authToken);
    if (!userData) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const userId = userData.uid;

    // Initialize wearable integration
    const wearableIntegration = await WearableIntegration.initialize(userId);

    switch (action) {
      case 'connect':
        // Connect to a wearable platform
        if (!platformId) {
          return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
        }
        const connectResult = await wearableIntegration.connectToPlatform(platformId);
        return NextResponse.json(connectResult);

      case 'disconnect':
        // Disconnect from current platform
        const disconnectResult = await wearableIntegration.disconnect();
        return NextResponse.json(disconnectResult);

      case 'start_workout':
        // Start workout tracking
        if (!workout) {
          return NextResponse.json({ error: 'Workout data is required' }, { status: 400 });
        }
        const startResult = await wearableIntegration.startWorkoutTracking(workout);
        return NextResponse.json(startResult);

      case 'end_workout':
        // End workout tracking
        const endResult = await wearableIntegration.endWorkoutTracking(metrics);
        return NextResponse.json(endResult);

      case 'update_metrics':
        // Update workout metrics
        if (!metrics) {
          return NextResponse.json({ error: 'Metrics data is required' }, { status: 400 });
        }
        const updateResult = await wearableIntegration.updateWorkoutMetrics(metrics);
        return NextResponse.json(updateResult);

      case 'update_settings':
        // Update wearable settings
        if (!settings) {
          return NextResponse.json({ error: 'Settings data is required' }, { status: 400 });
        }
        const settingsResult = await wearableIntegration.updateSettings(settings);
        return NextResponse.json(settingsResult);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in wearables API:', error);
    return NextResponse.json({
      error: 'Server error',
      message: error.message
    }, { status: 500 });
  }
}

/**
 * Handle webhook callbacks from wearable platforms
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    const { platform, data } = body;
    // signature is used for verification in a real implementation

    // Verify webhook signature (implementation would depend on the platform)
    // This is a placeholder for actual signature verification
    console.log('Received webhook from platform:', platform);

    // Process the webhook data
    // This would update the relevant user's workout data
    if (data && data.userId) {
      console.log('Processing workout data for user:', data.userId);
      // Process data here
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({
      error: 'Server error',
      message: error.message
    }, { status: 500 });
  }
}
