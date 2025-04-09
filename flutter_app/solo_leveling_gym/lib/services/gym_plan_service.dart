import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:solo_leveling_gym/models/gym_plan_model.dart';

class GymPlanService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // Get current user ID
  String? get _userId => _auth.currentUser?.uid;

  // Save a new gym plan
  Future<void> saveGymPlan(GymPlanModel plan) async {
    if (_userId == null) {
      throw Exception('User not logged in');
    }

    try {
      // Get current plans array or create a new one
      final userDoc = await _firestore.collection('users').doc(_userId).get();
      List<dynamic> currentPlans = [];

      if (userDoc.exists && userDoc.data()!.containsKey('gymPlans')) {
        currentPlans = List<dynamic>.from(userDoc.data()!['gymPlans'] ?? []);
      }

      // Add new plan to the array
      currentPlans.add(plan.toMap());

      // Update user document with the plans array
      await _firestore.collection('users').doc(_userId).update({
        'gymPlans': currentPlans,
        'hasGymPlan': true,
        'currentGymPlan': plan.toMap(),
        'lastGymPlanCreated': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      print('Error saving gym plan: $e');
      rethrow;
    }
  }

  // Get all gym plans for the current user
  Future<List<GymPlanModel>> getUserGymPlans() async {
    if (_userId == null) {
      throw Exception('User not logged in');
    }

    try {
      final userDoc = await _firestore.collection('users').doc(_userId).get();

      if (!userDoc.exists || !userDoc.data()!.containsKey('gymPlans')) {
        return [];
      }

      final List<dynamic> plansData =
          List<dynamic>.from(userDoc.data()!['gymPlans'] ?? []);

      // Sort by createdAt in descending order
      plansData.sort((a, b) {
        final aDate = DateTime.parse(a['createdAt']);
        final bDate = DateTime.parse(b['createdAt']);
        return bDate.compareTo(aDate);
      });

      return plansData.map((data) => GymPlanModel.fromMap(data)).toList();
    } catch (e) {
      print('Error getting gym plans: $e');
      rethrow;
    }
  }

  // Get the most recent gym plan for the current user
  Future<GymPlanModel?> getLatestGymPlan() async {
    if (_userId == null) {
      throw Exception('User not logged in');
    }

    try {
      final userDoc = await _firestore.collection('users').doc(_userId).get();

      if (!userDoc.exists || !userDoc.data()!.containsKey('currentGymPlan')) {
        return null;
      }

      final Map<String, dynamic> planData =
          Map<String, dynamic>.from(userDoc.data()!['currentGymPlan']);
      return GymPlanModel.fromMap(planData);
    } catch (e) {
      print('Error getting latest gym plan: $e');
      rethrow;
    }
  }

  // Generate a personalized gym plan based on user inputs
  Future<String> generateGymPlan(GymPlanModel planData) async {
    // In a real app, this would call an API or use a more sophisticated algorithm
    // For now, we'll generate a simple plan based on the user's inputs

    final StringBuffer plan = StringBuffer();

    // Add header
    plan.writeln('# YOUR PERSONALIZED GYM PLAN');
    plan.writeln('');

    // Add user stats
    plan.writeln('## USER PROFILE');
    if (planData.age != null) plan.writeln('Age: ${planData.age}');
    if (planData.sex != null) plan.writeln('Sex: ${planData.sex}');
    if (planData.height != null) plan.writeln('Height: ${planData.height} cm');
    if (planData.weight != null) plan.writeln('Weight: ${planData.weight} kg');
    plan.writeln('Fitness Level: ${planData.fitnessLevel}');
    plan.writeln('');

    // Add goals
    plan.writeln('## GOALS');
    for (final goal in planData.goals) {
      plan.writeln('- $goal');
    }
    plan.writeln('');

    // Add workout schedule
    plan.writeln('## WORKOUT SCHEDULE');
    plan.writeln('Days per week: ${planData.daysPerWeek}');
    plan.writeln('Minutes per session: ${planData.minutesPerSession}');
    plan.writeln('Intensity: ${planData.intensity}');
    plan.writeln('');

    // Generate workout plan based on goals and fitness level
    plan.writeln('## WORKOUT PLAN');

    // Different plans based on fitness level and goals
    if (planData.fitnessLevel == 'beginner') {
      _addBeginnerPlan(plan, planData);
    } else if (planData.fitnessLevel == 'intermediate') {
      _addIntermediatePlan(plan, planData);
    } else {
      _addAdvancedPlan(plan, planData);
    }

    // Add nutrition advice
    plan.writeln('## NUTRITION ADVICE');
    if (planData.goals.contains('Weight Loss')) {
      plan.writeln(
          '- Maintain a slight caloric deficit (200-500 calories below maintenance)');
      plan.writeln('- Focus on protein intake (1.6-2.2g per kg of bodyweight)');
      plan.writeln('- Prioritize whole foods and limit processed foods');
      plan.writeln('- Stay hydrated (aim for 3-4 liters of water daily)');
    } else if (planData.goals.contains('Muscle Gain')) {
      plan.writeln(
          '- Maintain a slight caloric surplus (200-500 calories above maintenance)');
      plan.writeln('- High protein intake (1.8-2.2g per kg of bodyweight)');
      plan.writeln('- Consume adequate carbohydrates for energy and recovery');
      plan.writeln(
          '- Consider a post-workout protein shake with carbohydrates');
    } else {
      plan.writeln('- Eat at maintenance calories');
      plan.writeln(
          '- Balanced macronutrient intake (protein, carbs, and fats)');
      plan.writeln('- Focus on nutrient-dense whole foods');
      plan.writeln('- Time nutrition around workouts for optimal performance');
    }

    // Add recovery advice
    plan.writeln('');
    plan.writeln('## RECOVERY STRATEGIES');
    plan.writeln('- Ensure 7-9 hours of quality sleep each night');
    plan.writeln(
        '- Incorporate active recovery on rest days (walking, light stretching)');
    plan.writeln('- Consider foam rolling for muscle recovery');
    plan.writeln('- Stay hydrated throughout the day');
    if (planData.intensity == 'high') {
      plan.writeln('- Consider contrast therapy (alternating hot and cold)');
      plan.writeln('- Monitor for signs of overtraining');
    }

    // Add disclaimer
    plan.writeln('');
    plan.writeln('## DISCLAIMER');
    plan.writeln(
        'This plan is generated based on the information you provided. It is recommended to consult with a healthcare professional before starting any new exercise program, especially if you have pre-existing health conditions.');

    return plan.toString();
  }

  // Helper methods to generate specific workout plans
  void _addBeginnerPlan(StringBuffer plan, GymPlanModel planData) {
    if (planData.daysPerWeek <= 3) {
      // Full body routine for beginners with 2-3 days per week
      plan.writeln(
          '### Full Body Workout (Repeat ${planData.daysPerWeek}x per week)');
      plan.writeln('');
      plan.writeln('1. Bodyweight Squats: 3 sets of 10-12 reps');
      plan.writeln('2. Push-ups (or knee push-ups): 3 sets of 8-10 reps');
      plan.writeln('3. Dumbbell Rows: 3 sets of 10 reps per arm');
      plan.writeln('4. Glute Bridges: 3 sets of 12 reps');
      plan.writeln('5. Plank: 3 sets, hold for 20-30 seconds');
      plan.writeln('6. Walking Lunges: 2 sets of 10 steps per leg');
      plan.writeln('7. Dumbbell Shoulder Press: 2 sets of 10 reps');
      plan.writeln('');
      plan.writeln('Rest 60-90 seconds between sets.');
    } else {
      // Upper/Lower split for beginners with 4+ days per week
      plan.writeln('### Upper Body Workout (2x per week)');
      plan.writeln('');
      plan.writeln('1. Push-ups (or knee push-ups): 3 sets of 8-10 reps');
      plan.writeln('2. Dumbbell Rows: 3 sets of 10 reps per arm');
      plan.writeln('3. Dumbbell Shoulder Press: 3 sets of 10 reps');
      plan.writeln('4. Lat Pulldowns or Assisted Pull-ups: 3 sets of 10 reps');
      plan.writeln('5. Tricep Dips (assisted if needed): 2 sets of 8-10 reps');
      plan.writeln('6. Bicep Curls: 2 sets of 10 reps');
      plan.writeln('7. Plank: 3 sets, hold for 20-30 seconds');
      plan.writeln('');
      plan.writeln('### Lower Body Workout (2x per week)');
      plan.writeln('');
      plan.writeln('1. Bodyweight Squats: 3 sets of 12 reps');
      plan.writeln('2. Walking Lunges: 3 sets of 10 steps per leg');
      plan.writeln('3. Glute Bridges: 3 sets of 12 reps');
      plan.writeln('4. Leg Press (if available): 3 sets of 10 reps');
      plan.writeln('5. Calf Raises: 3 sets of 15 reps');
      plan.writeln('6. Leg Curls (if available): 2 sets of 10 reps');
      plan.writeln('7. Plank: 3 sets, hold for 20-30 seconds');
      plan.writeln('');
      plan.writeln('Rest 60-90 seconds between sets.');
    }
  }

  void _addIntermediatePlan(StringBuffer plan, GymPlanModel planData) {
    if (planData.goals.contains('Strength')) {
      // Strength-focused plan
      if (planData.daysPerWeek <= 3) {
        plan.writeln(
            '### Full Body Strength Workout (Repeat ${planData.daysPerWeek}x per week)');
        plan.writeln('');
        plan.writeln('1. Barbell Squats: 4 sets of 5-6 reps');
        plan.writeln('2. Bench Press: 4 sets of 5-6 reps');
        plan.writeln('3. Bent-over Rows: 4 sets of 6-8 reps');
        plan.writeln('4. Overhead Press: 3 sets of 6-8 reps');
        plan.writeln('5. Romanian Deadlifts: 3 sets of 6-8 reps');
        plan.writeln('6. Pull-ups or Lat Pulldowns: 3 sets of 8-10 reps');
        plan.writeln('7. Plank: 3 sets, hold for 45-60 seconds');
      } else {
        plan.writeln('### Upper Body Strength (2x per week)');
        plan.writeln('');
        plan.writeln('1. Bench Press: 4 sets of 5-6 reps');
        plan.writeln('2. Bent-over Rows: 4 sets of 6-8 reps');
        plan.writeln('3. Overhead Press: 3 sets of 6-8 reps');
        plan.writeln('4. Pull-ups or Lat Pulldowns: 3 sets of 8-10 reps');
        plan.writeln('5. Incline Dumbbell Press: 3 sets of 8 reps');
        plan.writeln('6. Face Pulls: 3 sets of 12 reps');
        plan.writeln('7. Tricep Extensions: 3 sets of 10 reps');
        plan.writeln('8. Bicep Curls: 3 sets of 10 reps');
        plan.writeln('');
        plan.writeln('### Lower Body Strength (2x per week)');
        plan.writeln('');
        plan.writeln('1. Barbell Squats: 4 sets of 5-6 reps');
        plan.writeln('2. Romanian Deadlifts: 4 sets of 6-8 reps');
        plan.writeln(
            '3. Walking Lunges with Dumbbells: 3 sets of 10 steps per leg');
        plan.writeln('4. Leg Press: 3 sets of 8-10 reps');
        plan.writeln('5. Leg Curls: 3 sets of 10 reps');
        plan.writeln('6. Calf Raises: 4 sets of 12-15 reps');
        plan.writeln('7. Weighted Planks: 3 sets, hold for 45-60 seconds');
      }
    } else if (planData.goals.contains('Muscle Gain')) {
      // Hypertrophy-focused plan
      if (planData.daysPerWeek >= 4) {
        plan.writeln('### Push Day (2x per week)');
        plan.writeln('');
        plan.writeln('1. Bench Press: 4 sets of 8-10 reps');
        plan.writeln('2. Incline Dumbbell Press: 3 sets of 10 reps');
        plan.writeln('3. Seated Shoulder Press: 3 sets of 10 reps');
        plan.writeln('4. Lateral Raises: 3 sets of 12-15 reps');
        plan.writeln('5. Tricep Pushdowns: 3 sets of 12 reps');
        plan.writeln('6. Overhead Tricep Extensions: 3 sets of 12 reps');
        plan.writeln('');
        plan.writeln('### Pull Day (2x per week)');
        plan.writeln('');
        plan.writeln('1. Pull-ups or Lat Pulldowns: 4 sets of 8-10 reps');
        plan.writeln('2. Bent-over Rows: 4 sets of 10 reps');
        plan.writeln('3. Seated Cable Rows: 3 sets of 10 reps');
        plan.writeln('4. Face Pulls: 3 sets of 15 reps');
        plan.writeln('5. Bicep Curls: 3 sets of 12 reps');
        plan.writeln('6. Hammer Curls: 3 sets of 12 reps');
        plan.writeln('');
        plan.writeln('### Legs Day (1-2x per week)');
        plan.writeln('');
        plan.writeln('1. Barbell Squats: 4 sets of 8-10 reps');
        plan.writeln('2. Romanian Deadlifts: 4 sets of 10 reps');
        plan.writeln('3. Walking Lunges: 3 sets of 10 steps per leg');
        plan.writeln('4. Leg Press: 3 sets of 12 reps');
        plan.writeln('5. Leg Extensions: 3 sets of 12 reps');
        plan.writeln('6. Leg Curls: 3 sets of 12 reps');
        plan.writeln('7. Calf Raises: 4 sets of 15-20 reps');
      } else {
        plan.writeln('### Upper Body (Day 1)');
        plan.writeln('');
        plan.writeln('1. Bench Press: 4 sets of 8-10 reps');
        plan.writeln('2. Bent-over Rows: 4 sets of 10 reps');
        plan.writeln('3. Incline Dumbbell Press: 3 sets of 10 reps');
        plan.writeln('4. Lat Pulldowns: 3 sets of 10 reps');
        plan.writeln('5. Lateral Raises: 3 sets of 12-15 reps');
        plan.writeln('6. Face Pulls: 3 sets of 15 reps');
        plan.writeln('7. Tricep Pushdowns: 3 sets of 12 reps');
        plan.writeln('8. Bicep Curls: 3 sets of 12 reps');
        plan.writeln('');
        plan.writeln('### Lower Body (Day 2)');
        plan.writeln('');
        plan.writeln('1. Barbell Squats: 4 sets of 8-10 reps');
        plan.writeln('2. Romanian Deadlifts: 4 sets of 10 reps');
        plan.writeln('3. Walking Lunges: 3 sets of 10 steps per leg');
        plan.writeln('4. Leg Press: 3 sets of 12 reps');
        plan.writeln('5. Leg Extensions: 3 sets of 12 reps');
        plan.writeln('6. Leg Curls: 3 sets of 12 reps');
        plan.writeln('7. Calf Raises: 4 sets of 15-20 reps');
        plan.writeln('8. Planks: 3 sets, hold for 45-60 seconds');
      }
    } else {
      // General fitness plan
      plan.writeln('### Full Body Workout A (alternate with Workout B)');
      plan.writeln('');
      plan.writeln('1. Barbell Squats: 3 sets of 8-10 reps');
      plan.writeln('2. Bench Press: 3 sets of 8-10 reps');
      plan.writeln('3. Bent-over Rows: 3 sets of 10 reps');
      plan.writeln('4. Dumbbell Shoulder Press: 3 sets of 10 reps');
      plan.writeln('5. Romanian Deadlifts: 3 sets of 10 reps');
      plan.writeln('6. Tricep Pushdowns: 3 sets of 12 reps');
      plan.writeln('7. Plank: 3 sets, hold for 45-60 seconds');
      plan.writeln('');
      plan.writeln('### Full Body Workout B (alternate with Workout A)');
      plan.writeln('');
      plan.writeln('1. Lunges: 3 sets of 10 reps per leg');
      plan.writeln('2. Incline Dumbbell Press: 3 sets of 10 reps');
      plan.writeln('3. Pull-ups or Lat Pulldowns: 3 sets of 8-10 reps');
      plan.writeln('4. Lateral Raises: 3 sets of 12-15 reps');
      plan.writeln('5. Leg Press: 3 sets of 10-12 reps');
      plan.writeln('6. Bicep Curls: 3 sets of 12 reps');
      plan.writeln('7. Russian Twists: 3 sets of 15 reps per side');
    }

    plan.writeln('');
    plan.writeln(
        'Rest 60-90 seconds between sets for compound exercises, 45-60 seconds for isolation exercises.');
  }

  void _addAdvancedPlan(StringBuffer plan, GymPlanModel planData) {
    if (planData.goals.contains('Strength')) {
      // Advanced strength plan
      plan.writeln('### 4-Day Upper/Lower Split with Periodization');
      plan.writeln('');
      plan.writeln('#### Upper Body Strength (Day 1)');
      plan.writeln('1. Bench Press: 5 sets of 5 reps (80-85% 1RM)');
      plan.writeln('2. Weighted Pull-ups: 4 sets of 6 reps');
      plan.writeln('3. Overhead Press: 4 sets of 6 reps');
      plan.writeln('4. Barbell Rows: 4 sets of 6 reps');
      plan.writeln('5. Weighted Dips: 3 sets of 8 reps');
      plan.writeln('6. Face Pulls: 3 sets of 12 reps');
      plan.writeln('7. Tricep Extensions: 3 sets of 10 reps');
      plan.writeln('');
      plan.writeln('#### Lower Body Strength (Day 2)');
      plan.writeln('1. Back Squats: 5 sets of 5 reps (80-85% 1RM)');
      plan.writeln('2. Deadlifts: 4 sets of 5 reps');
      plan.writeln('3. Walking Lunges with Barbell: 3 sets of 8 steps per leg');
      plan.writeln('4. Leg Press: 4 sets of 8 reps');
      plan.writeln('5. Good Mornings: 3 sets of 8 reps');
      plan.writeln('6. Weighted Calf Raises: 4 sets of 12 reps');
      plan.writeln('7. Hanging Leg Raises: 3 sets of 12 reps');
      plan.writeln('');
      plan.writeln('#### Upper Body Hypertrophy (Day 3)');
      plan.writeln('1. Incline Bench Press: 4 sets of 8-10 reps');
      plan.writeln('2. Lat Pulldowns: 4 sets of 10 reps');
      plan.writeln('3. Seated Dumbbell Press: 4 sets of 10 reps');
      plan.writeln('4. Cable Rows: 4 sets of 10 reps');
      plan.writeln('5. Lateral Raises: 3 sets of 12-15 reps');
      plan.writeln('6. Skull Crushers: 3 sets of 12 reps');
      plan.writeln('7. Barbell Curls: 3 sets of 12 reps');
      plan.writeln('');
      plan.writeln('#### Lower Body Hypertrophy (Day 4)');
      plan.writeln('1. Front Squats: 4 sets of 8-10 reps');
      plan.writeln('2. Romanian Deadlifts: 4 sets of 10 reps');
      plan.writeln('3. Bulgarian Split Squats: 3 sets of 10 reps per leg');
      plan.writeln('4. Leg Extensions: 3 sets of 12 reps');
      plan.writeln('5. Leg Curls: 3 sets of 12 reps');
      plan.writeln('6. Seated Calf Raises: 4 sets of 15 reps');
      plan.writeln('7. Ab Wheel Rollouts: 3 sets of 10-12 reps');
    } else if (planData.goals.contains('Muscle Gain')) {
      // Advanced hypertrophy plan
      plan.writeln('### 5-Day Body Part Split');
      plan.writeln('');
      plan.writeln('#### Chest Day');
      plan.writeln('1. Bench Press: 4 sets of 8-10 reps');
      plan.writeln('2. Incline Dumbbell Press: 4 sets of 10 reps');
      plan.writeln('3. Chest Flyes: 3 sets of 12 reps');
      plan.writeln('4. Decline Press: 3 sets of 10 reps');
      plan.writeln('5. Cable Crossovers: 3 sets of 12-15 reps');
      plan.writeln('6. Push-ups (to failure): 2 sets');
      plan.writeln('');
      plan.writeln('#### Back Day');
      plan.writeln('1. Deadlifts: 4 sets of 6-8 reps');
      plan.writeln('2. Pull-ups: 4 sets of 8-10 reps');
      plan.writeln('3. Barbell Rows: 4 sets of 10 reps');
      plan.writeln('4. Seated Cable Rows: 3 sets of 10-12 reps');
      plan.writeln('5. Lat Pulldowns: 3 sets of 12 reps');
      plan.writeln('6. Straight Arm Pulldowns: 3 sets of 12-15 reps');
      plan.writeln('');
      plan.writeln('#### Legs Day');
      plan.writeln('1. Back Squats: 4 sets of 8-10 reps');
      plan.writeln('2. Romanian Deadlifts: 4 sets of 10 reps');
      plan.writeln('3. Leg Press: 4 sets of 10-12 reps');
      plan.writeln('4. Walking Lunges: 3 sets of 10 steps per leg');
      plan.writeln('5. Leg Extensions: 3 sets of 12-15 reps');
      plan.writeln('6. Leg Curls: 3 sets of 12-15 reps');
      plan.writeln('7. Standing Calf Raises: 4 sets of 15-20 reps');
      plan.writeln('8. Seated Calf Raises: 3 sets of 15-20 reps');
      plan.writeln('');
      plan.writeln('#### Shoulders Day');
      plan.writeln('1. Overhead Press: 4 sets of 8-10 reps');
      plan.writeln('2. Seated Dumbbell Press: 4 sets of 10 reps');
      plan.writeln('3. Lateral Raises: 4 sets of 12-15 reps');
      plan.writeln('4. Front Raises: 3 sets of 12 reps');
      plan.writeln('5. Rear Delt Flyes: 3 sets of 12-15 reps');
      plan.writeln('6. Face Pulls: 3 sets of 15 reps');
      plan.writeln('7. Shrugs: 4 sets of 12 reps');
      plan.writeln('');
      plan.writeln('#### Arms Day');
      plan.writeln('1. Close-Grip Bench Press: 4 sets of 8-10 reps');
      plan.writeln('2. Barbell Curls: 4 sets of 10 reps');
      plan.writeln('3. Skull Crushers: 3 sets of 10-12 reps');
      plan.writeln('4. Incline Dumbbell Curls: 3 sets of 10-12 reps');
      plan.writeln('5. Cable Tricep Pushdowns: 3 sets of 12-15 reps');
      plan.writeln('6. Hammer Curls: 3 sets of 12 reps');
      plan.writeln('7. Overhead Tricep Extensions: 3 sets of 12 reps');
      plan.writeln('8. Concentration Curls: 2 sets of 15 reps');
    } else {
      // Advanced general fitness/athletic plan
      plan.writeln('### 4-Day Athletic Performance Split');
      plan.writeln('');
      plan.writeln('#### Day 1: Lower Body Power');
      plan.writeln('1. Box Jumps: 4 sets of 5 reps');
      plan.writeln('2. Back Squats: 5 sets of 5 reps');
      plan.writeln('3. Deadlifts: 4 sets of 5 reps');
      plan.writeln('4. Walking Lunges: 3 sets of 10 steps per leg');
      plan.writeln('5. Leg Press: 3 sets of 8-10 reps');
      plan.writeln('6. Hanging Leg Raises: 3 sets of 12 reps');
      plan.writeln('7. Plank: 3 sets, hold for 60 seconds');
      plan.writeln('');
      plan.writeln('#### Day 2: Upper Body Power');
      plan.writeln('1. Medicine Ball Chest Throws: 4 sets of 5 reps');
      plan.writeln('2. Bench Press: 5 sets of 5 reps');
      plan.writeln('3. Weighted Pull-ups: 4 sets of 6-8 reps');
      plan.writeln('4. Overhead Press: 4 sets of 6-8 reps');
      plan.writeln('5. Barbell Rows: 4 sets of 8 reps');
      plan.writeln('6. Face Pulls: 3 sets of 12 reps');
      plan.writeln('7. Russian Twists: 3 sets of 15 reps per side');
      plan.writeln('');
      plan.writeln('#### Day 3: Conditioning');
      plan.writeln(
          '1. Sprint Intervals: 10 rounds of 30 seconds sprint, 30 seconds rest');
      plan.writeln('2. Battle Ropes: 4 sets of 30 seconds');
      plan.writeln('3. Kettlebell Swings: 4 sets of 15 reps');
      plan.writeln('4. Box Jumps: 4 sets of 10 reps');
      plan.writeln('5. Burpees: 4 sets of 12 reps');
      plan.writeln('6. Mountain Climbers: 4 sets of 30 seconds');
      plan.writeln('7. Plank Variations: 3 sets of 45 seconds each variation');
      plan.writeln('');
      plan.writeln('#### Day 4: Full Body Strength');
      plan.writeln('1. Front Squats: 4 sets of 8 reps');
      plan.writeln('2. Incline Bench Press: 4 sets of 8 reps');
      plan.writeln('3. Romanian Deadlifts: 4 sets of 8 reps');
      plan.writeln('4. Pull-ups: 4 sets of 8 reps');
      plan.writeln('5. Dips: 3 sets of 10 reps');
      plan.writeln('6. Lateral Raises: 3 sets of 12 reps');
      plan.writeln('7. Hanging Leg Raises: 3 sets of 12 reps');
    }

    plan.writeln('');
    plan.writeln(
        'Rest 2-3 minutes between sets for heavy compound exercises, 60-90 seconds for other exercises.');
  }
}
