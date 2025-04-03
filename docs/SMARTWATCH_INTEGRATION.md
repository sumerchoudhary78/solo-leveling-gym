# Smartwatch Integration for Solo Leveling Gym

This document provides instructions on how to set up and use the smartwatch integration feature in Solo Leveling Gym.

## Overview

Solo Leveling Gym now supports integration with various smartwatches and fitness trackers to track your workouts in real-time. This allows you to:

- Track workout duration, heart rate, calories burned, steps, and distance
- Automatically gain experience points based on your actual physical activity
- Complete quests based on real workout data
- View your workout history with detailed metrics

## Supported Devices

The following smartwatch platforms are currently supported:

- **Fitbit** - All Fitbit devices with heart rate monitoring
- **Garmin** - Garmin fitness watches and trackers
- **Google Fit** - Any device that syncs with Google Fit
- **Apple Health** - Requires the Solo Leveling Gym mobile app (coming soon)
- **Samsung Health** - Requires the Solo Leveling Gym mobile app (coming soon)

## Setup Instructions

### 1. Environment Variables

First, you need to set up the required environment variables for the smartwatch APIs. Create or update your `.env.local` file with the following variables:

```
# Fitbit API
NEXT_PUBLIC_FITBIT_CLIENT_ID=your_fitbit_client_id
FITBIT_CLIENT_SECRET=your_fitbit_client_secret

# Garmin API
NEXT_PUBLIC_GARMIN_CLIENT_ID=your_garmin_client_id
GARMIN_CLIENT_SECRET=your_garmin_client_secret

# Google Fit API
NEXT_PUBLIC_GOOGLE_FIT_CLIENT_ID=your_google_fit_client_id
GOOGLE_FIT_CLIENT_SECRET=your_google_fit_client_secret
```

### 2. OAuth Configuration

For OAuth-based platforms (Fitbit, Garmin, Google Fit), you need to set up the redirect URI in their respective developer portals:

- **Redirect URI**: `https://your-app-domain.com/api/wearables/callback`

### 3. Firebase Configuration

Make sure your Firebase project has the necessary security rules to allow storing and retrieving workout data:

```
// Add to your firestore.rules file
match /users/{userId}/workouts/{workoutId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

## Using the Smartwatch Integration

### Connecting Your Device

1. Log in to Solo Leveling Gym
2. Click the smartwatch button in the bottom right corner of the dashboard
3. Select your device type from the dropdown menu
4. Click "Connect Device"
5. Follow the authorization prompts for your specific platform
6. Once connected, you'll see a green indicator showing your device is ready

### Tracking a Workout

1. Click "Enter Gate" on the dashboard
2. Select a workout from the available gates
3. Click the "Track" button next to the workout (only visible when a device is connected)
4. Complete your physical workout while the app tracks your progress
5. When finished, click the "End Workout" button that appears at the bottom of the screen
6. Your experience points will be calculated based on your actual workout metrics

### Customizing Tracking Settings

1. Open the smartwatch settings by clicking the smartwatch button
2. Adjust which metrics you want to track (heart rate, calories, steps, etc.)
3. Set your preferred sync frequency
4. Click "Save Settings" to apply your changes

## Troubleshooting

### Device Not Connecting

- Make sure your device is supported
- Check that you've entered the correct API credentials in your environment variables
- Ensure your device has the latest firmware
- Try disconnecting and reconnecting the device

### Workout Not Tracking

- Verify that your device is properly connected (green indicator visible)
- Check that your device has sufficient battery
- Ensure your device's sensors are properly positioned (e.g., heart rate monitor)
- Try ending the workout and starting a new one

### Data Not Syncing

- Check your internet connection
- Verify that your device is within Bluetooth range of your phone (if applicable)
- Try manually syncing your device through its companion app
- Restart the Solo Leveling Gym application

## Technical Details

The smartwatch integration uses a combination of:

1. **OAuth Authentication** - For secure access to your fitness data
2. **Webhook Callbacks** - For real-time updates from the fitness platforms
3. **Firebase Firestore** - For storing and retrieving workout data
4. **Next.js API Routes** - For handling authentication and data processing

The integration is designed to be privacy-focused, only accessing the specific fitness data needed for the game mechanics.

## Future Enhancements

- **Mobile App Integration** - Native mobile app for better background tracking
- **Additional Platforms** - Support for more fitness devices and platforms
- **Advanced Metrics** - Track more detailed workout metrics like heart rate zones, VO2 max, etc.
- **Social Features** - Compare workouts with friends and compete on leaderboards
- **Custom Workout Templates** - Create and save your own workout templates

## Feedback and Support

If you encounter any issues or have suggestions for improving the smartwatch integration, please:

1. Open an issue on our GitHub repository
2. Contact support at support@sololevelinggym.com
3. Join our Discord community for real-time assistance

We're constantly working to improve the smartwatch integration and appreciate your feedback!
