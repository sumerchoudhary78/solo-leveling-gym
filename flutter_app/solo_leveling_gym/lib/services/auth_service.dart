import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AuthService with ChangeNotifier {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  // Auth state changes stream
  Stream<User?> get authStateChanges => _auth.authStateChanges();
  
  // Current user
  User? get currentUser => _auth.currentUser;
  
  // Sign in with email and password
  Future<UserCredential> signInWithEmailAndPassword(String email, String password) async {
    try {
      final result = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      notifyListeners();
      return result;
    } catch (e) {
      print('Error signing in: $e');
      rethrow;
    }
  }
  
  // Register with email and password
  Future<UserCredential> registerWithEmailAndPassword(
    String email, 
    String password, 
    String username
  ) async {
    try {
      // Check if username is already taken
      final usernameDoc = await _firestore.collection('usernames').doc(username).get();
      if (usernameDoc.exists) {
        throw FirebaseAuthException(
          code: 'username-already-in-use',
          message: 'The username is already taken. Please choose another one.',
        );
      }
      
      // Create user with email and password
      final result = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      // Create user document in Firestore
      await _firestore.collection('users').doc(result.user!.uid).set({
        'email': email,
        'hunterName': username,
        'level': 1,
        'experience': 0,
        'joinDate': DateTime.now().toIso8601String(),
        'lastActive': DateTime.now().toIso8601String(),
        'huntsCompleted': 0,
      });
      
      // Reserve the username
      await _firestore.collection('usernames').doc(username).set({
        'uid': result.user!.uid,
      });
      
      notifyListeners();
      return result;
    } catch (e) {
      print('Error registering: $e');
      rethrow;
    }
  }
  
  // Sign out
  Future<void> signOut() async {
    try {
      await _auth.signOut();
      notifyListeners();
    } catch (e) {
      print('Error signing out: $e');
      rethrow;
    }
  }
  
  // Get user profile data
  Future<Map<String, dynamic>> getUserProfile() async {
    try {
      if (currentUser == null) {
        throw Exception('No user logged in');
      }
      
      final doc = await _firestore.collection('users').doc(currentUser!.uid).get();
      if (!doc.exists) {
        throw Exception('User profile not found');
      }
      
      return doc.data() as Map<String, dynamic>;
    } catch (e) {
      print('Error getting user profile: $e');
      rethrow;
    }
  }
  
  // Update user profile
  Future<void> updateUserProfile(Map<String, dynamic> data) async {
    try {
      if (currentUser == null) {
        throw Exception('No user logged in');
      }
      
      await _firestore.collection('users').doc(currentUser!.uid).update({
        ...data,
        'lastUpdated': DateTime.now().toIso8601String(),
      });
      
      notifyListeners();
    } catch (e) {
      print('Error updating user profile: $e');
      rethrow;
    }
  }
}
