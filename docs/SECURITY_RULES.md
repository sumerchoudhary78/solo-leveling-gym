# Security Rules Configuration Guide

This document provides instructions on how to apply the updated security rules for Firebase services in the Solo Leveling Gym application.

## Overview

The application uses three Firebase services, each with its own security rules:

1. **Firestore Database** - For storing user profiles, messages, and other structured data
2. **Realtime Database** - For real-time features and leaderboards
3. **Firebase Storage** - For storing user avatars and other files

## Applying the Rules

### Firestore Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (Solo Leveling Gym)
3. In the left sidebar, click on "Firestore Database"
4. Click on the "Rules" tab
5. Replace the existing rules with the content of the `firestore.rules` file
6. Click "Publish"

### Realtime Database Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (Solo Leveling Gym)
3. In the left sidebar, click on "Realtime Database"
4. Click on the "Rules" tab
5. Replace the existing rules with the content of the `database.rules.json` file
6. Click "Publish"

### Firebase Storage Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (Solo Leveling Gym)
3. In the left sidebar, click on "Storage"
4. Click on the "Rules" tab
5. Replace the existing rules with the content of the `firebase.storage.rules` file
6. Click "Publish"

## CORS Configuration for Firebase Storage

To fix CORS issues with Firebase Storage, you need to configure CORS settings:

1. Install Firebase CLI if you haven't already:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Apply the CORS configuration using the `firebase-cors.json` file:
   ```
   firebase storage:cors update --project solo-leveling-gym firebase-cors.json
   ```

## Understanding the Rules

### Firestore Rules

- **Users Collection**: Users can read and write only to their own documents
- **Usernames Collection**: Anyone can read (to check if a username exists), but only authenticated users can create new usernames
- **Messages Collection**: Authenticated users can read all messages, but can only create/delete their own messages
- **Quests Collection**: Authenticated users can read all quests, but can only write to their own quest data

### Realtime Database Rules

- **Users Node**: Users can read and write only to their own data, but certain profile fields are readable by any authenticated user (for leaderboards)
- **Leaderboard Node**: Any authenticated user can read the leaderboard, but only admin processes can write to it
- **Chats Node**: Any authenticated user can read and write to chats

### Firebase Storage Rules

- **Avatars Folder**: Anyone can read avatars, but users can only upload to their own user folder
- **Temp Folder**: A temporary storage area where authenticated users can upload files (useful for profile photo uploads)
- **Default Rule**: Deny access to everything else

## Security Considerations

These rules provide a good balance between security and functionality:

- User data is protected so that only the owner can modify it
- Public data (like avatars and leaderboards) is accessible to all users
- Temporary upload areas are available for profile photos
- Default deny rules prevent unauthorized access to other resources

If you need to make your application even more secure, consider:

1. Adding validation rules to ensure data meets specific formats
2. Implementing rate limiting to prevent abuse
3. Using Firebase Authentication custom claims for admin roles
