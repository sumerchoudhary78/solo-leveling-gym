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
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );
  
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

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
    const { platform, data, signature } = await request.json();
    
    // Verify webhook signature (implementation would depend on the platform)
    // This is a placeholder for actual signature verification
    
    // Process the webhook data
    // This would update the relevant user's workout data
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ 
      error: 'Server error',
      message: error.message 
    }, { status: 500 });
  }
}
