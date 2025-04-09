import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:provider/provider.dart';
import 'package:solo_leveling_gym/services/auth_service.dart';
import 'package:solo_leveling_gym/widgets/custom_button.dart';

class QuestDetailScreen extends StatefulWidget {
  final Map<String, dynamic> quest;
  final String questStatus;

  const QuestDetailScreen({
    Key? key,
    required this.quest,
    required this.questStatus,
  }) : super(key: key);

  @override
  _QuestDetailScreenState createState() => _QuestDetailScreenState();
}

class _QuestDetailScreenState extends State<QuestDetailScreen> {
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  Future<void> _startQuest() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final userId =
          Provider.of<AuthService>(context, listen: false).currentUser!.uid;
      final userRef =
          FirebaseFirestore.instance.collection('users').doc(userId);

      // Get current active quests
      final userDoc = await userRef.get();
      final userData = userDoc.data() ?? {};
      final activeQuests = List<String>.from(userData['activeQuests'] ?? []);

      // Check if user already has 3 active quests
      if (activeQuests.length >= 3) {
        throw Exception('You can only have 3 active quests at a time');
      }

      // Add quest to active quests
      activeQuests.add(widget.quest['id']);

      // Update user document
      await userRef.update({
        'activeQuests': activeQuests,
      });

      setState(() {
        _successMessage = 'Quest started successfully';
      });

      // Navigate back after a short delay
      Future.delayed(Duration(seconds: 1), () {
        Navigator.pop(context);
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _completeQuest() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final userId =
          Provider.of<AuthService>(context, listen: false).currentUser!.uid;
      final userRef =
          FirebaseFirestore.instance.collection('users').doc(userId);

      // Get current active and completed quests
      final userDoc = await userRef.get();
      final userData = userDoc.data() ?? {};
      final activeQuests = List<String>.from(userData['activeQuests'] ?? []);
      final completedQuests =
          List<String>.from(userData['completedQuests'] ?? []);
      final currentLevel = userData['level'] ?? 1;
      final currentExp = userData['experience'] ?? 0;
      final huntsCompleted = userData['huntsCompleted'] ?? 0;

      // Remove quest from active quests
      activeQuests.remove(widget.quest['id']);

      // Add quest to completed quests
      completedQuests.add(widget.quest['id']);

      // Calculate new experience and level
      final expReward = widget.quest['experienceReward'] ?? 100;
      final newExp = currentExp + expReward;

      // Simple level calculation (100 XP per level)
      final newLevel = (newExp / 100).floor() + 1;

      // Update user document
      await userRef.update({
        'activeQuests': activeQuests,
        'completedQuests': completedQuests,
        'experience': newExp,
        'level': newLevel > currentLevel ? newLevel : currentLevel,
        'huntsCompleted': huntsCompleted + 1,
      });

      setState(() {
        _successMessage = 'Quest completed! You earned $expReward XP';
      });

      // Navigate back after a short delay
      Future.delayed(Duration(seconds: 1), () {
        Navigator.pop(context);
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _abandonQuest() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      final userId =
          Provider.of<AuthService>(context, listen: false).currentUser!.uid;
      final userRef =
          FirebaseFirestore.instance.collection('users').doc(userId);

      // Get current active quests
      final userDoc = await userRef.get();
      final userData = userDoc.data() ?? {};
      final activeQuests = List<String>.from(userData['activeQuests'] ?? []);

      // Remove quest from active quests
      activeQuests.remove(widget.quest['id']);

      // Update user document
      await userRef.update({
        'activeQuests': activeQuests,
      });

      setState(() {
        _successMessage = 'Quest abandoned';
      });

      // Navigate back after a short delay
      Future.delayed(Duration(seconds: 1), () {
        Navigator.pop(context);
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.green;
      case 'normal':
        return Colors.blue;
      case 'hard':
        return Colors.orange;
      case 'extreme':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }

  IconData _getQuestTypeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'workout':
        return Icons.fitness_center;
      case 'cardio':
        return Icons.directions_run;
      case 'challenge':
        return Icons.emoji_events;
      case 'daily':
        return Icons.today;
      default:
        return Icons.fitness_center;
    }
  }

  @override
  Widget build(BuildContext context) {
    final difficulty = widget.quest['difficulty'] ?? 'normal';
    final type = widget.quest['type'] ?? 'workout';
    final requirements = widget.quest['requirements'] ?? {};

    return Scaffold(
      appBar: AppBar(
        title: Text('Quest Details'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Quest header
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Color(0xFF1F2A40),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: _getDifficultyColor(difficulty).withOpacity(0.3),
                  width: 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color:
                              _getDifficultyColor(difficulty).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          _getQuestTypeIcon(type),
                          color: _getDifficultyColor(difficulty),
                          size: 32,
                        ),
                      ),
                      SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.quest['title'],
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            SizedBox(height: 8),
                            Row(
                              children: [
                                Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _getDifficultyColor(difficulty)
                                        .withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    difficulty.toUpperCase(),
                                    style: TextStyle(
                                      color: _getDifficultyColor(difficulty),
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                SizedBox(width: 8),
                                Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    type.toUpperCase(),
                                    style: TextStyle(
                                      color: Colors.grey,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 16),
                  Text(
                    widget.quest['description'],
                    style: TextStyle(
                      color: Colors.grey[300],
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(height: 16),
                  Row(
                    children: [
                      Icon(
                        Icons.star,
                        color: Colors.amber,
                        size: 20,
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Reward: ${widget.quest['experienceReward']} XP',
                        style: TextStyle(
                          color: Colors.amber,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            SizedBox(height: 24),

            // Requirements
            Text(
              'Requirements',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 16),
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Color(0xFF1F2A40),
                borderRadius: BorderRadius.circular(8),
              ),
              child: requirements.isEmpty
                  ? Text(
                      'No specific requirements. Complete the quest at your own pace.',
                      style: TextStyle(
                        color: Colors.grey,
                        fontSize: 14,
                      ),
                    )
                  : Column(
                      children: requirements.entries.map<Widget>((entry) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Row(
                            children: [
                              Icon(
                                Icons.check_circle_outline,
                                color: Colors.green,
                                size: 20,
                              ),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  '${entry.key}: ${entry.value}',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
            ),
            SizedBox(height: 24),

            // Error and success messages
            if (_errorMessage != null)
              Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.withOpacity(0.5)),
                ),
                child: Text(
                  _errorMessage!,
                  style: TextStyle(
                    color: Colors.red,
                    fontSize: 14,
                  ),
                ),
              ),
            if (_successMessage != null)
              Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green.withOpacity(0.5)),
                ),
                child: Text(
                  _successMessage!,
                  style: TextStyle(
                    color: Colors.green,
                    fontSize: 14,
                  ),
                ),
              ),
            SizedBox(
                height:
                    _errorMessage != null || _successMessage != null ? 24 : 0),

            // Action buttons
            if (widget.questStatus == 'available')
              CustomButton(
                text: 'START QUEST',
                isLoading: _isLoading,
                onPressed: _startQuest,
              ),
            if (widget.questStatus == 'active')
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  CustomButton(
                    text: 'COMPLETE QUEST',
                    isLoading: _isLoading,
                    onPressed: _completeQuest,
                  ),
                  SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: _isLoading ? null : _abandonQuest,
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Colors.red),
                      padding: EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: Text(
                      'ABANDON QUEST',
                      style: TextStyle(
                        color: Colors.red,
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
