import 'package:flutter/material.dart';

class WearablePlatform {
  final String id;
  final String name;
  final bool requiresApp;
  final IconData icon;
  final Color color;

  const WearablePlatform({
    required this.id,
    required this.name,
    required this.requiresApp,
    required this.icon,
    required this.color,
  });
}

class WearableSettings {
  final bool trackHeartRate;
  final bool trackCalories;
  final bool trackSteps;
  final bool trackDistance;
  final bool trackSleep;
  final bool autoDetectActivity;
  final bool notifyOnMilestones;
  final String syncFrequency; // 'realtime', 'end_of_workout', 'manual'

  const WearableSettings({
    this.trackHeartRate = true,
    this.trackCalories = true,
    this.trackSteps = true,
    this.trackDistance = true,
    this.trackSleep = false,
    this.autoDetectActivity = true,
    this.notifyOnMilestones = true,
    this.syncFrequency = 'realtime',
  });

  // Create from map (for Firestore)
  factory WearableSettings.fromMap(Map<String, dynamic> map) {
    return WearableSettings(
      trackHeartRate: map['trackHeartRate'] ?? true,
      trackCalories: map['trackCalories'] ?? true,
      trackSteps: map['trackSteps'] ?? true,
      trackDistance: map['trackDistance'] ?? true,
      trackSleep: map['trackSleep'] ?? false,
      autoDetectActivity: map['autoDetectActivity'] ?? true,
      notifyOnMilestones: map['notifyOnMilestones'] ?? true,
      syncFrequency: map['syncFrequency'] ?? 'realtime',
    );
  }

  // Convert to map (for Firestore)
  Map<String, dynamic> toMap() {
    return {
      'trackHeartRate': trackHeartRate,
      'trackCalories': trackCalories,
      'trackSteps': trackSteps,
      'trackDistance': trackDistance,
      'trackSleep': trackSleep,
      'autoDetectActivity': autoDetectActivity,
      'notifyOnMilestones': notifyOnMilestones,
      'syncFrequency': syncFrequency,
    };
  }

  // Create a copy with some fields replaced
  WearableSettings copyWith({
    bool? trackHeartRate,
    bool? trackCalories,
    bool? trackSteps,
    bool? trackDistance,
    bool? trackSleep,
    bool? autoDetectActivity,
    bool? notifyOnMilestones,
    String? syncFrequency,
  }) {
    return WearableSettings(
      trackHeartRate: trackHeartRate ?? this.trackHeartRate,
      trackCalories: trackCalories ?? this.trackCalories,
      trackSteps: trackSteps ?? this.trackSteps,
      trackDistance: trackDistance ?? this.trackDistance,
      trackSleep: trackSleep ?? this.trackSleep,
      autoDetectActivity: autoDetectActivity ?? this.autoDetectActivity,
      notifyOnMilestones: notifyOnMilestones ?? this.notifyOnMilestones,
      syncFrequency: syncFrequency ?? this.syncFrequency,
    );
  }
}

class WorkoutData {
  final String id;
  final String name;
  final String activityType;
  final String? platformActivityType;
  final DateTime startTime;
  final DateTime? endTime;
  final bool inProgress;
  final String? platform;
  final WorkoutMetrics metrics;
  final Map<String, dynamic> gameData;

  const WorkoutData({
    required this.id,
    required this.name,
    required this.activityType,
    this.platformActivityType,
    required this.startTime,
    this.endTime,
    this.inProgress = false,
    this.platform,
    required this.metrics,
    required this.gameData,
  });

  // Create from map (for Firestore)
  factory WorkoutData.fromMap(Map<String, dynamic> map) {
    return WorkoutData(
      id: map['id'] ?? '',
      name: map['name'] ?? 'Workout',
      activityType: map['activityType'] ?? 'custom',
      platformActivityType: map['platformActivityType'],
      startTime: map['startTime'] != null
          ? DateTime.parse(map['startTime'])
          : DateTime.now(),
      endTime: map['endTime'] != null ? DateTime.parse(map['endTime']) : null,
      inProgress: map['inProgress'] ?? false,
      platform: map['platform'],
      metrics: map['metrics'] != null
          ? WorkoutMetrics.fromMap(map['metrics'])
          : WorkoutMetrics(),
      gameData: map['gameData'] ?? {},
    );
  }

  // Convert to map (for Firestore)
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'activityType': activityType,
      'platformActivityType': platformActivityType,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
      'inProgress': inProgress,
      'platform': platform,
      'metrics': metrics.toMap(),
      'gameData': gameData,
    };
  }
}

class WorkoutMetrics {
  final List<int> heartRate;
  final int calories;
  final int steps;
  final String distance; // in km, stored as string to preserve decimal precision
  final int duration; // in minutes

  const WorkoutMetrics({
    this.heartRate = const [],
    this.calories = 0,
    this.steps = 0,
    this.distance = '0.0',
    this.duration = 0,
  });

  // Create from map (for Firestore)
  factory WorkoutMetrics.fromMap(Map<String, dynamic> map) {
    return WorkoutMetrics(
      heartRate: map['heartRate'] != null
          ? List<int>.from(map['heartRate'])
          : const [],
      calories: map['calories'] ?? 0,
      steps: map['steps'] ?? 0,
      distance: map['distance']?.toString() ?? '0.0',
      duration: map['duration'] ?? 0,
    );
  }

  // Convert to map (for Firestore)
  Map<String, dynamic> toMap() {
    return {
      'heartRate': heartRate,
      'calories': calories,
      'steps': steps,
      'distance': distance,
      'duration': duration,
    };
  }
}

class WearableConnectionResult {
  final bool success;
  final String? message;
  final String? error;
  final String? platform;
  final bool requiresApp;
  final String? workoutId;
  final int? expGained;

  const WearableConnectionResult({
    required this.success,
    this.message,
    this.error,
    this.platform,
    this.requiresApp = false,
    this.workoutId,
    this.expGained,
  });
}
