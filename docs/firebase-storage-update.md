# Firebase Storage Configuration

This document provides instructions on how to configure Firebase Storage for profile photo uploads. The application now uses a simplified, minimalist UI that stores images directly in Firebase Storage.

## Storage Rules

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project "solo-leveling-gym"
3. Navigate to "Storage" in the left sidebar
4. Click on the "Rules" tab
5. Replace the current rules with the following:

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
      // Allow larger file sizes (10MB max)
      allow write: if request.auth != null &&
                   request.auth.uid == userId &&
                   request.resource.size <= 10 * 1024 * 1024 &&
                   request.resource.contentType.matches('image/.*');
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

6. Click "Publish" to apply the changes

## Storage Bucket Configuration

Make sure your Firebase Storage bucket is properly configured:

1. In the Firebase Console, navigate to "Storage"
2. If you haven't set up Storage yet, click "Get Started" and follow the setup wizard
3. The default bucket name should be `solo-leveling-gym.appspot.com`

## CORS Configuration

You need to configure CORS (Cross-Origin Resource Sharing) to allow uploads from your domain:

1. Install the Google Cloud SDK from https://cloud.google.com/sdk/docs/install
2. Open a terminal and authenticate with your Google account:
   ```
   gcloud auth login
   ```
3. Set your project:
   ```
   gcloud config set project solo-leveling-gym
   ```
4. Create a file named `cors.json` with the following content:
   ```json
   [
     {
       "origin": ["*"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Content-Length", "Content-Encoding", "Content-Disposition", "Cache-Control", "x-goog-meta-uploadedBy", "x-goog-meta-uploadedAt"]
     }
   ]
   ```
5. Apply the CORS configuration to your bucket:
   ```
   gsutil cors set cors.json gs://solo-leveling-gym.appspot.com
   ```
6. Verify the CORS configuration:
   ```
   gsutil cors get gs://solo-leveling-gym.appspot.com
   ```

**Alternative Method (If you don't want to install Google Cloud SDK):**

1. Go to the Google Cloud Console: https://console.cloud.google.com/
2. Select your project
3. Navigate to Storage > Buckets
4. Click on your bucket name
5. Go to the "Permissions" tab
6. Add a new CORS configuration with the settings above

## Important Notes

- The Storage rules allow files up to 10MB in size
- Only image files are allowed (JPEG, PNG, GIF, etc.)
- Each user can only upload to their own folder (`avatars/{userId}/`)
- All avatar images are publicly readable
- The temporary folder can be used for temporary uploads during processing

## Troubleshooting

If you encounter issues with uploads:

### Common Errors

1. **ERR_FAILED or CORS Error**:
   - This is usually a CORS configuration issue
   - Make sure you've configured CORS as described above
   - Try uploading from a different browser
   - Check if you're using a VPN or proxy that might interfere with the connection

2. **Permission Denied**:
   - Verify that the user is properly authenticated
   - Check that your Firebase Storage rules are correctly configured
   - Make sure the user is trying to upload to their own folder

3. **File Size Issues**:
   - Make sure the file size is under 10MB
   - Try with a smaller image file

4. **Network Issues**:
   - Check your internet connection
   - Try on a different network
   - Disable any browser extensions that might interfere with uploads

### Debugging Steps

1. Check the browser console for detailed error messages
2. Look for specific Firebase Storage error codes (e.g., 'storage/unauthorized')
3. Verify that the Firebase Storage rules have been published
4. Check the Network tab in browser DevTools to see the actual request and response
5. Try uploading a very small image (under 100KB) to test if size is the issue

### Last Resort Solutions

1. Clear browser cache and cookies
2. Try in an incognito/private browsing window
3. Temporarily disable any security software or browser extensions
4. If all else fails, you can use the Firebase Storage REST API directly instead of the JavaScript SDK
