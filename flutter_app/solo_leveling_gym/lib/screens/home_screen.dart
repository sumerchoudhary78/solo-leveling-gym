import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:solo_leveling_gym/services/auth_service.dart';
import 'package:solo_leveling_gym/screens/profile/profile_screen.dart';
import 'package:solo_leveling_gym/screens/leaderboard/leaderboard_screen.dart';
import 'package:solo_leveling_gym/screens/quests/quests_screen.dart';
import 'package:solo_leveling_gym/screens/wearables/wearables_screen.dart';
import 'package:solo_leveling_gym/screens/gym_plan/gym_plan_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    QuestsScreen(),
    LeaderboardScreen(),
    GymPlanScreen(),
    WearablesScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: Color(0xFF1F2A40),
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.fitness_center),
            label: 'Quests',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.leaderboard),
            label: 'Leaderboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment),
            label: 'Gym Plan',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.watch),
            label: 'Wearables',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
