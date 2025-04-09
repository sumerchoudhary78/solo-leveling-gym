# Profile Photo Upload Setup

This document provides instructions on how to set up and configure the profile photo upload functionality in Solo Leveling Gym.

## Firebase Storage Configuration

The profile photo upload feature uses Firebase Storage to store user avatars. Follow these steps to ensure it's properly configured:

### 1. Firebase Console Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (Solo Leveling Gym)
3. In the left sidebar, click on "Storage"
4. If you haven't set up Storage yet, click "Get Started" and follow the setup wizard
5. Choose a location for your Storage bucket (preferably close to your users)
6. Start in production mode (or test mode if you're still developing)

### 2. Storage Rules Configuration

For security, update your Storage rules to only allow authenticated users to upload their own avatars:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read any avatar
    match /avatars/{allPaths=**} {
      allow read: if request.auth != null;
    }
    
    // Allow users to upload only their own avatars
    match /avatars/{userId}/{fileName} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Environment Variables

Make sure your `.env.local` file includes the Firebase Storage bucket URL:

```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

## Using the Profile Photo Upload Feature

### Accessing the Profile Edit Page

1. Log in to Solo Leveling Gym
2. On your dashboard, click the "Edit Profile" button
3. On the profile edit page, you'll see the avatar upload section at the top

### Uploading a Profile Photo

1. Click the "Choose File" button
2. Select an image from your device (JPG, PNG, or GIF format)
3. The image will appear in the preview with your rank frame
4. Click "Upload Avatar" to save your new profile photo

### Avatar Guidelines

- Images should be square format (1:1 ratio) for best results
- Maximum file size: 5MB
- Supported formats: JPG, PNG, GIF
- Your rank frame will be automatically applied to your avatar

## Troubleshooting

### Common Issues

1. **Upload fails with "Unauthorized" error**
   - Make sure you're logged in
   - Check that your Firebase Storage rules are correctly configured

2. **Image doesn't appear after upload**
   - Try refreshing the page
   - Check browser console for errors
   - Verify that the image URL is being saved to your user profile in Firestore

3. **"Storage quota exceeded" error**
   - You may have reached your Firebase Storage quota
   - Consider upgrading your Firebase plan or optimizing image sizes

### Getting Help

If you encounter any issues with the profile photo upload feature, please:

1. Check the browser console for specific error messages
2. Verify your Firebase configuration in the `.env.local` file
3. Ensure your Firebase project has Storage enabled
4. Contact support with specific details about the issue
