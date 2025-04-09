# Solo Leveling Gym - Flutter Mobile App

This is the Flutter mobile app version of the Solo Leveling Gym web application. It connects to the same Firebase backend as the web app, allowing users to access their accounts and data across both platforms.

## Getting Started

### Prerequisites

- Flutter SDK (latest stable version)
- Android Studio or Xcode for device emulation
- Firebase project (same as the web app)

### Setup

1. Clone this repository
2. Install Flutter dependencies:
   ```bash
   flutter pub get
   ```
3. Configure Firebase for your Flutter app:
   ```bash
   dart pub global activate flutterfire_cli
   flutterfire configure --project=solo-leveling-gym
   ```
4. Run the app:
   ```bash
   flutter run
   ```

## Features

- **Authentication**: Login and registration with email/password
- **Profile Management**: View and edit user profile, upload profile photos
- **Quests**: Browse, start, and complete workout quests
- **Leaderboard**: View top hunters and rankings
- **Wearable Integration**: Connect with fitness wearables like Fitbit, Garmin, etc.

## Firebase Integration

This app uses the following Firebase services:

- **Firebase Authentication**: For user authentication
- **Cloud Firestore**: For storing user data, quests, and leaderboard information
- **Firebase Storage**: For storing profile photos and other media
- **Firebase Analytics**: For tracking app usage (optional)

## Project Structure

- `lib/main.dart`: Entry point of the application
- `lib/services/`: Service classes for Firebase and other functionality
- `lib/screens/`: UI screens for different app sections
- `lib/widgets/`: Reusable UI components
- `lib/models/`: Data models

## Dependencies

- `firebase_core`: Firebase core functionality
- `firebase_auth`: Firebase authentication
- `cloud_firestore`: Firestore database
- `firebase_storage`: Firebase storage for images
- `provider`: State management
- `image_picker`: For selecting images from gallery or camera
- `path`: For file path manipulation

## Customization

You can customize the app by:

1. Modifying the theme in `lib/main.dart`
2. Updating the app icons in `android/app/src/main/res/` and `ios/Runner/Assets.xcassets/`
3. Changing the app name in `android/app/src/main/AndroidManifest.xml` and `ios/Runner/Info.plist`

## Deployment

### Android

1. Build an APK:
   ```bash
   flutter build apk
   ```
2. Or build an App Bundle for Play Store:
   ```bash
   flutter build appbundle
   ```

### iOS

1. Build for iOS:
   ```bash
   flutter build ios
   ```
2. Open the Xcode project and archive for App Store submission

## Troubleshooting

- If you encounter Firebase configuration issues, make sure your `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) files are correctly placed
- For image upload issues, check your Firebase Storage rules
- For authentication issues, verify your Firebase Authentication settings

## License

This project is licensed under the MIT License - see the LICENSE file for details.
