import 'package:flutter/material.dart';
import 'package:solo_leveling_gym/screens/auth/login_screen.dart';
import 'package:solo_leveling_gym/screens/auth/register_screen.dart';
import 'package:solo_leveling_gym/screens/home_screen.dart';
import 'package:solo_leveling_gym/screens/gym_plan/gym_plan_screen.dart';
import 'package:solo_leveling_gym/screens/gym_plan/gym_plan_questionnaire_screen.dart';
import 'package:solo_leveling_gym/screens/gym_plan/gym_plan_history_screen.dart';
import 'package:solo_leveling_gym/screens/auth/auth_wrapper.dart';

// Define routes for the app
final Map<String, WidgetBuilder> routes = {
  '/': (context) => const AuthWrapper(),
  '/login': (context) => LoginScreen(),
  '/register': (context) => RegisterScreen(),
  '/home': (context) => HomeScreen(),
  '/gym_plan': (context) => GymPlanScreen(),
  '/gym_plan/create': (context) => GymPlanQuestionnaireScreen(),
  '/gym_plan/history': (context) => GymPlanHistoryScreen(),
};
