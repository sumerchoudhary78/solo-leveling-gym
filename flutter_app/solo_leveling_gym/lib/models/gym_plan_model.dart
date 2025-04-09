class GymPlanModel {
  final int? age;
  final String? sex;
  final double? height;
  final double? weight;
  final String fitnessLevel;
  final List<String> goals;
  final String intensity;
  final int daysPerWeek;
  final int minutesPerSession;
  final String equipmentAccess;
  final List<String> healthConditions;
  final List<String> preferences;
  final String? generatedPlan;
  final DateTime createdAt;

  GymPlanModel({
    this.age,
    this.sex,
    this.height,
    this.weight,
    required this.fitnessLevel,
    required this.goals,
    required this.intensity,
    required this.daysPerWeek,
    required this.minutesPerSession,
    required this.equipmentAccess,
    required this.healthConditions,
    required this.preferences,
    this.generatedPlan,
    DateTime? createdAt,
  }) : this.createdAt = createdAt ?? DateTime.now();

  // Convert model to a map for Firestore
  Map<String, dynamic> toMap() {
    return {
      'age': age,
      'sex': sex,
      'height': height,
      'weight': weight,
      'fitnessLevel': fitnessLevel,
      'goals': goals,
      'intensity': intensity,
      'daysPerWeek': daysPerWeek,
      'minutesPerSession': minutesPerSession,
      'equipmentAccess': equipmentAccess,
      'healthConditions': healthConditions,
      'preferences': preferences,
      'generatedPlan': generatedPlan,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  // Create model from a Firestore map
  factory GymPlanModel.fromMap(Map<String, dynamic> map) {
    return GymPlanModel(
      age: map['age'],
      sex: map['sex'],
      height: map['height'],
      weight: map['weight'],
      fitnessLevel: map['fitnessLevel'] ?? 'beginner',
      goals: List<String>.from(map['goals'] ?? []),
      intensity: map['intensity'] ?? 'moderate',
      daysPerWeek: map['daysPerWeek'] ?? 3,
      minutesPerSession: map['minutesPerSession'] ?? 60,
      equipmentAccess: map['equipmentAccess'] ?? 'gym',
      healthConditions: List<String>.from(map['healthConditions'] ?? []),
      preferences: List<String>.from(map['preferences'] ?? []),
      generatedPlan: map['generatedPlan'],
      createdAt: map['createdAt'] != null 
          ? DateTime.parse(map['createdAt']) 
          : DateTime.now(),
    );
  }

  // Create a copy of the model with updated fields
  GymPlanModel copyWith({
    int? age,
    String? sex,
    double? height,
    double? weight,
    String? fitnessLevel,
    List<String>? goals,
    String? intensity,
    int? daysPerWeek,
    int? minutesPerSession,
    String? equipmentAccess,
    List<String>? healthConditions,
    List<String>? preferences,
    String? generatedPlan,
    DateTime? createdAt,
  }) {
    return GymPlanModel(
      age: age ?? this.age,
      sex: sex ?? this.sex,
      height: height ?? this.height,
      weight: weight ?? this.weight,
      fitnessLevel: fitnessLevel ?? this.fitnessLevel,
      goals: goals ?? this.goals,
      intensity: intensity ?? this.intensity,
      daysPerWeek: daysPerWeek ?? this.daysPerWeek,
      minutesPerSession: minutesPerSession ?? this.minutesPerSession,
      equipmentAccess: equipmentAccess ?? this.equipmentAccess,
      healthConditions: healthConditions ?? this.healthConditions,
      preferences: preferences ?? this.preferences,
      generatedPlan: generatedPlan ?? this.generatedPlan,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
