# Firebase Rules Update Instructions

This document provides instructions on how to update your Firebase rules to support storing profile photos directly in Firestore.

## Firestore Rules

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project "solo-leveling-gym"
3. Navigate to "Firestore Database" in the left sidebar
4. Click on the "Rules" tab
5. Replace the current rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rules for usernames collection (public read, protected write)
    match /usernames/{username} {
      // Anyone can check if a username exists
      allow read: if true;

      // Only authenticated users can claim a username
      // and only if that username document doesn't exist yet
      allow create: if request.auth != null &&
                   !exists(/databases/$(database)/documents/usernames/$(username));

      // No updates or deletes allowed
      allow update, delete: if false;
    }

    // Rules for the users collection
    match /users/{userId} {
      // Allow users to read their own full document
      allow read: if request.auth != null && request.auth.uid == userId;

      // Allow creating user document on signup
      allow create: if request.auth != null && request.auth.uid == userId;

      // Allow users to update only their own documents
      allow update: if request.auth != null && request.auth.uid == userId;

      // Specifically allow avatar updates with larger data
      allow update: if request.auth != null && 
                   request.auth.uid == userId && 
                   request.resource.data.keys().hasAny(['avatarUrl', 'avatarUploadMethod', 'lastUpdated']);
                   
      // Allow storing images directly in Firestore
      // This rule allows documents up to 1MB in size for avatar data
      allow update: if request.auth != null && 
                   request.auth.uid == userId && 
                   request.resource.data.keys().hasAny(['avatarUrl']) && 
                   request.resource.data.avatarUrl.size() <= 1048576;

      // Disallow deleting user documents
      allow delete: if false;

      // Allow access to subcollections
      match /workouts/{workoutId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    // Rules for leaderboard & chat profile reading
    match /users/{userId} {
      // Allow reading other users' public profile data
      allow read: if request.auth != null;
    }

    // Rules for messages
    match /messages/{messageId} {
      // Allow reading messages if authenticated
      allow read: if request.auth != null;

      // Allow creating messages if authenticated and userId matches
      allow create: if request.auth != null &&
                   request.resource.data.userId == request.auth.uid;

      // Disallow updating messages
      allow update: if false;

      // Allow deleting only your own messages
      allow delete: if request.auth != null &&
                   resource.data.userId == request.auth.uid;
    }

    // Rules for quests
    match /quests/{questId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                   (request.resource.data.userId == request.auth.uid ||
                    resource.data.userId == request.auth.uid);
    }
  }
}
```

6. Click "Publish" to apply the changes

## Storage Rules (Optional)

If you're also using Firebase Storage for other files:

1. In the Firebase Console, navigate to "Storage"
2. Click on the "Rules" tab
3. Replace the current rules with the following:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all avatars
    match /avatars/{allPaths=**} {
      allow read: if true;
    }

    // Allow authenticated users to upload only to their own avatar folder
    match /avatars/{userId}/{fileName} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow temporary public uploads for profile photos
    match /temp/{fileName} {
      // Anyone can read temporary files
      allow read: if true;
      // Authenticated users can write to temp folder
      allow write: if request.auth != null;
    }

    // Default rule - deny everything else
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click "Publish" to apply the changes

## Realtime Database Rules

Since we're not using Realtime Database for storing images anymore, you can set restrictive rules:

1. In the Firebase Console, navigate to "Realtime Database"
2. Click on the "Rules" tab
3. Replace the current rules with the following:

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

4. Click "Publish" to apply the changes

## Important Notes

- The Firestore rules allow storing images directly in the user document with a size limit of 1MB
- Make sure your images are optimized and under 1MB for best results
- If you need to store larger images, consider using Firebase Storage instead
