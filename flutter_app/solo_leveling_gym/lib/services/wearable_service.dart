import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:solo_leveling_gym/models/wearable_models.dart';

class WearableService extends ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final String userId;
  
  bool _isConnected = false;
  String? _platform;
  DateTime? _lastSyncTime;
  WearableSettings _settings = WearableSettings();
  List<WorkoutData> _workoutHistory = [];
  
  // Getters
  bool get isConnected => _isConnected;
  String? get platform => _platform;
  DateTime? get lastSyncTime => _lastSyncTime;
  WearableSettings get settings => _settings;
  List<WorkoutData> get workoutHistory => _workoutHistory;
  
  // Constructor
  WearableService({required this.userId}) {
    _loadWearableSettings();
  }
  
  // Load wearable settings from Firestore
  Future<void> _loadWearableSettings() async {
    try {
      final userDoc = await _firestore.collection('users').doc(userId).get();
      
      if (userDoc.exists && userDoc.data()!.containsKey('wearableSettings')) {
        final wearableData = userDoc.data()!['wearableSettings'];
        
        _isConnected = wearableData['isConnected'] ?? false;
        _platform = wearableData['platform'];
        
        if (wearableData['lastSyncTime'] != null) {
          _lastSyncTime = DateTime.parse(wearableData['lastSyncTime']);
        }
        
        if (wearableData['settings'] != null) {
          _settings = WearableSettings.fromMap(wearableData['settings']);
        }
        
        notifyListeners();
      }
    } catch (e) {
      print('Error loading wearable settings: $e');
    }
  }
  
  // Get list of supported platforms
  List<WearablePlatform> getSupportedPlatforms() {
    return [
      WearablePlatform(
        id: 'fitbit',
        name: 'Fitbit',
        requiresApp: false,
        icon: Icons.watch,
        color: Colors.teal,
      ),
      WearablePlatform(
        id: 'garmin',
        name: 'Garmin',
        requiresApp: false,
        icon: Icons.watch,
        color: Colors.blue,
      ),
      WearablePlatform(
        id: 'apple_health',
        name: 'Apple Health',
        requiresApp: true,
        icon: Icons.favorite,
        color: Colors.red,
      ),
      WearablePlatform(
        id: 'google_fit',
        name: 'Google Fit',
        requiresApp: false,
        icon: Icons.directions_run,
        color: Colors.green,
      ),
      WearablePlatform(
        id: 'samsung_health',
        name: 'Samsung Health',
        requiresApp: true,
        icon: Icons.watch,
        color: Colors.indigo,
      ),
    ];
  }
  
  // Connect to a wearable platform
  Future<WearableConnectionResult> connectToPlatform(String platformId) async {
    try {
      final platform = getSupportedPlatforms().firstWhere(
        (p) => p.id == platformId,
        orElse: () => throw Exception('Unsupported platform: $platformId'),
      );
      
      // For platforms requiring native app integration
      if (platform.requiresApp) {
        return WearableConnectionResult(
          success: false,
          requiresApp: true,
          message: '${platform.name} requires a native app integration. Please install the Solo Leveling Gym app from the app store.',
        );
      }
      
      // For OAuth-based platforms
      // In a real implementation, this would initiate OAuth flow with the selected platform
      // For now, we'll simulate a successful connection
      
      // Update user's wearable settings in Firestore
      await _firestore.collection('users').doc(userId).update({
        'wearableSettings': {
          'platform': platformId,
          'isConnected': true,
          'lastSyncTime': DateTime.now().toIso8601String(),
          'settings': _settings.toMap(),
        }
      });
      
      _platform = platformId;
      _isConnected = true;
      _lastSyncTime = DateTime.now();
      
      notifyListeners();
      
      return WearableConnectionResult(
        success: true,
        platform: platformId,
        message: 'Successfully connected to ${platform.name}',
      );
    } catch (e) {
      print('Error connecting to wearable platform: $e');
      return WearableConnectionResult(
        success: false,
        error: e.toString(),
      );
    }
  }
  
  // Disconnect from current platform
  Future<WearableConnectionResult> disconnect() async {
    try {
      await _firestore.collection('users').doc(userId).update({
        'wearableSettings.isConnected': false,
      });
      
      _isConnected = false;
      
      notifyListeners();
      
      return WearableConnectionResult(
        success: true,
        message: 'Successfully disconnected from wearable device',
      );
    } catch (e) {
      print('Error disconnecting from wearable platform: $e');
      return WearableConnectionResult(
        success: false,
        error: e.toString(),
      );
    }
  }
  
  // Update wearable settings
  Future<WearableConnectionResult> updateSettings(WearableSettings newSettings) async {
    try {
      await _firestore.collection('users').doc(userId).update({
        'wearableSettings.settings': newSettings.toMap(),
      });
      
      _settings = newSettings;
      
      notifyListeners();
      
      return WearableConnectionResult(
        success: true,
        message: 'Settings updated successfully',
      );
    } catch (e) {
      print('Error updating wearable settings: $e');
      return WearableConnectionResult(
        success: false,
        error: e.toString(),
      );
    }
  }
  
  // Start workout tracking
  Future<WearableConnectionResult> startWorkoutTracking(WorkoutData workout) async {
    try {
      if (!_isConnected) {
        return WearableConnectionResult(
          success: false,
          message: 'No wearable device connected',
        );
      }
      
      // Map workout type to platform-specific activity type
      final activityType = workout.activityType;
      final platformActivityType = _mapActivityType(activityType, _platform!);
      
      // Create a workout tracking document in Firestore
      final workoutId = 'workout_${DateTime.now().millisecondsSinceEpoch}';
      final workoutDocRef = _firestore
          .collection('users')
          .doc(userId)
          .collection('workouts')
          .doc(workoutId);
      
      final workoutData = {
        'id': workoutId,
        'name': workout.name,
        'activityType': activityType,
        'platformActivityType': platformActivityType,
        'startTime': DateTime.now().toIso8601String(),
        'endTime': null,
        'inProgress': true,
        'platform': _platform,
        'metrics': {
          'heartRate': [],
          'calories': 0,
          'steps': 0,
          'distance': 0,
          'duration': 0,
        },
        // Store the original workout data for game mechanics
        'gameData': workout.toMap(),
      };
      
      await workoutDocRef.set(workoutData);
      
      return WearableConnectionResult(
        success: true,
        message: 'Workout tracking started',
        workoutId: workoutId,
      );
    } catch (e) {
      print('Error starting workout tracking: $e');
      return WearableConnectionResult(
        success: false,
        error: e.toString(),
      );
    }
  }
  
  // End workout tracking
  Future<WearableConnectionResult> endWorkoutTracking(String workoutId, {WorkoutMetrics? metrics}) async {
    try {
      if (!_isConnected) {
        return WearableConnectionResult(
          success: false,
          message: 'No wearable device connected',
        );
      }
      
      final workoutDocRef = _firestore
          .collection('users')
          .doc(userId)
          .collection('workouts')
          .doc(workoutId);
      
      final workoutDoc = await workoutDocRef.get();
      
      if (!workoutDoc.exists) {
        return WearableConnectionResult(
          success: false,
          message: 'Workout not found',
        );
      }
      
      // If no metrics provided, generate simulated metrics
      final finalMetrics = metrics ?? _generateSimulatedMetrics();
      
      // Calculate exp based on metrics
      final expGained = (finalMetrics.calories * 0.5 + finalMetrics.duration * 2).floor();
      
      await workoutDocRef.update({
        'endTime': DateTime.now().toIso8601String(),
        'inProgress': false,
        'metrics': finalMetrics.toMap(),
        'gameData.expGained': expGained,
        'gameData.completed': true,
      });
      
      // Update user's experience
      await _firestore.collection('users').doc(userId).update({
        'experience': FieldValue.increment(expGained),
        'huntsCompleted': FieldValue.increment(1),
      });
      
      // Check if user should level up
      await _checkForLevelUp();
      
      return WearableConnectionResult(
        success: true,
        message: 'Workout completed successfully',
        expGained: expGained,
      );
    } catch (e) {
      print('Error ending workout tracking: $e');
      return WearableConnectionResult(
        success: false,
        error: e.toString(),
      );
    }
  }
  
  // Get workout history
  Future<List<WorkoutData>> getWorkoutHistory({int limit = 10}) async {
    try {
      final snapshot = await _firestore
          .collection('users')
          .doc(userId)
          .collection('workouts')
          .orderBy('startTime', descending: true)
          .limit(limit)
          .get();
      
      final workouts = snapshot.docs.map((doc) {
        final data = doc.data();
        return WorkoutData.fromMap(data);
      }).toList();
      
      _workoutHistory = workouts;
      
      return workouts;
    } catch (e) {
      print('Error getting workout history: $e');
      return [];
    }
  }
  
  // Helper method to map activity types to platform-specific types
  String _mapActivityType(String activityType, String platform) {
    final activityMappings = {
      'fitbit': {
        'running': 'run',
        'walking': 'walk',
        'cycling': 'bike',
        'strength_training': 'weights',
        'hiit': 'interval',
        'yoga': 'yoga',
        'swimming': 'swim',
        'elliptical': 'elliptical',
        'rowing': 'rowing',
        'custom': 'workout',
      },
      'garmin': {
        'running': 'running',
        'walking': 'walking',
        'cycling': 'cycling',
        'strength_training': 'strength_training',
        'hiit': 'hiit',
        'yoga': 'yoga',
        'swimming': 'swimming',
        'elliptical': 'elliptical',
        'rowing': 'rowing',
        'custom': 'fitness_equipment',
      },
      'google_fit': {
        'running': 'running',
        'walking': 'walking',
        'cycling': 'biking',
        'strength_training': 'strength_training',
        'hiit': 'interval_training',
        'yoga': 'yoga',
        'swimming': 'swimming',
        'elliptical': 'elliptical',
        'rowing': 'rowing',
        'custom': 'workout',
      },
      'apple_health': {
        'running': 'HKWorkoutActivityTypeRunning',
        'walking': 'HKWorkoutActivityTypeWalking',
        'cycling': 'HKWorkoutActivityTypeCycling',
        'strength_training': 'HKWorkoutActivityTypeTraditionalStrengthTraining',
        'hiit': 'HKWorkoutActivityTypeHighIntensityIntervalTraining',
        'yoga': 'HKWorkoutActivityTypeYoga',
        'swimming': 'HKWorkoutActivityTypeSwimming',
        'elliptical': 'HKWorkoutActivityTypeElliptical',
        'rowing': 'HKWorkoutActivityTypeRowing',
        'custom': 'HKWorkoutActivityTypeOther',
      },
      'samsung_health': {
        'running': 'running',
        'walking': 'walking',
        'cycling': 'cycling',
        'strength_training': 'weight_machine',
        'hiit': 'circuit_training',
        'yoga': 'yoga',
        'swimming': 'swimming',
        'elliptical': 'elliptical',
        'rowing': 'rowing',
        'custom': 'other',
      },
    };
    
    final platformMappings = activityMappings[platform] ?? activityMappings['fitbit']!;
    return platformMappings[activityType] ?? platformMappings['custom']!;
  }
  
  // Generate simulated metrics for testing
  WorkoutMetrics _generateSimulatedMetrics() {
    final random = Random();
    
    return WorkoutMetrics(
      heartRate: List.generate(
        10,
        (index) => 70 + random.nextInt(80),
      ),
      calories: 100 + random.nextInt(300),
      steps: 1000 + random.nextInt(5000),
      distance: (random.nextDouble() * 5).toStringAsFixed(2),
      duration: 15 + random.nextInt(60),
    );
  }
  
  // Check if user should level up based on experience
  Future<void> _checkForLevelUp() async {
    try {
      final userDoc = await _firestore.collection('users').doc(userId).get();
      
      if (!userDoc.exists) return;
      
      final userData = userDoc.data()!;
      final currentLevel = userData['level'] ?? 1;
      final currentExp = userData['experience'] ?? 0;
      
      // Calculate required exp for next level
      // Using a simple formula: nextLevelExp = currentLevel * 100
      final requiredExp = currentLevel * 100;
      
      if (currentExp >= requiredExp) {
        // Level up!
        await _firestore.collection('users').doc(userId).update({
          'level': currentLevel + 1,
          'statPoints': FieldValue.increment(3), // Award stat points on level up
        });
      }
    } catch (e) {
      print('Error checking for level up: $e');
    }
  }
}

// Helper class for random number generation
class Random {
  final math.Random _random = math.Random();
  
  int nextInt(int max) => _random.nextInt(max);
  
  double nextDouble() => _random.nextDouble();
}

import 'dart:math' as math;
