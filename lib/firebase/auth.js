/**
 * Authentication utilities for Firebase
 */

import { auth } from './config';

/**
 * Verify a Firebase authentication token
 * @param {string} token - The authentication token to verify
 * @returns {Promise<Object|null>} - The user data if token is valid, null otherwise
 */
export async function verifyAuthToken(token) {
  try {
    if (!token) {
      return null;
    }
    
    // Get the current user
    const currentUser = auth.currentUser;
    
    // If there's no current user, try to get the user from the token
    if (!currentUser) {
      try {
        // This is a simplified version - in a production app, you would use
        // Firebase Admin SDK to verify the token server-side
        await auth.signInWithCustomToken(token);
        return auth.currentUser;
      } catch (error) {
        console.error('Error verifying token:', error);
        return null;
      }
    }
    
    // If the current user's token matches the provided token, return the user
    if (await currentUser.getIdToken() === token) {
      return {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in verifyAuthToken:', error);
    return null;
  }
}
