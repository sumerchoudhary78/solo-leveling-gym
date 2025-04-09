import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:provider/provider.dart';
import 'package:solo_leveling_gym/services/auth_service.dart';
import 'package:solo_leveling_gym/screens/quests/quest_detail_screen.dart';

class QuestsScreen extends StatefulWidget {
  @override
  _QuestsScreenState createState() => _QuestsScreenState();
}

class _QuestsScreenState extends State<QuestsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = true;
  List<Map<String, dynamic>> _availableQuests = [];
  List<Map<String, dynamic>> _activeQuests = [];
  List<Map<String, dynamic>> _completedQuests = [];
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadQuests();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadQuests() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final userId = Provider.of<AuthService>(context, listen: false).currentUser!.uid;
      
      // Get user's active and completed quests
      final userDoc = await FirebaseFirestore.instance.collection('users').doc(userId).get();
      final userData = userDoc.data() ?? {};
      
      final activeQuestIds = List<String>.from(userData['activeQuests'] ?? []);
      final completedQuestIds = List<String>.from(userData['completedQuests'] ?? []);
      
      // Get all quests
      final questsSnapshot = await FirebaseFirestore.instance.collection('quests').get();
      
      final availableQuests = <Map<String, dynamic>>[];
      final activeQuests = <Map<String, dynamic>>[];
      final completedQuests = <Map<String, dynamic>>[];
      
      for (final doc in questsSnapshot.docs) {
        final questData = doc.data();
        final questId = doc.id;
        
        final quest = {
          'id': questId,
          'title': questData['title'] ?? 'Unnamed Quest',
          'description': questData['description'] ?? '',
          'type': questData['type'] ?? 'workout',
          'difficulty': questData['difficulty'] ?? 'normal',
          'experienceReward': questData['experienceReward'] ?? 100,
          'requirements': questData['requirements'] ?? {},
        };
        
        if (completedQuestIds.contains(questId)) {
          completedQuests.add(quest);
        } else if (activeQuestIds.contains(questId)) {
          activeQuests.add(quest);
        } else {
          availableQuests.add(quest);
        }
      }
      
      setState(() {
        _availableQuests = availableQuests;
        _activeQuests = activeQuests;
        _completedQuests = completedQuests;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load quests: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy': return Colors.green;
      case 'normal': return Colors.blue;
      case 'hard': return Colors.orange;
      case 'extreme': return Colors.red;
      default: return Colors.blue;
    }
  }

  IconData _getQuestTypeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'workout': return Icons.fitness_center;
      case 'cardio': return Icons.directions_run;
      case 'challenge': return Icons.emoji_events;
      case 'daily': return Icons.today;
      default: return Icons.fitness_center;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Quests'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'Available'),
            Tab(text: 'Active'),
            Tab(text: 'Completed'),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadQuests,
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _errorMessage!,
                          style: TextStyle(color: Colors.red),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loadQuests,
                          child: Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildQuestList(_availableQuests, 'available'),
                    _buildQuestList(_activeQuests, 'active'),
                    _buildQuestList(_completedQuests, 'completed'),
                  ],
                ),
    );
  }

  Widget _buildQuestList(List<Map<String, dynamic>> quests, String listType) {
    if (quests.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              listType == 'available'
                  ? Icons.search
                  : listType == 'active'
                      ? Icons.fitness_center
                      : Icons.emoji_events,
              size: 64,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              listType == 'available'
                  ? 'No available quests'
                  : listType == 'active'
                      ? 'No active quests'
                      : 'No completed quests',
              style: TextStyle(
                color: Colors.grey,
                fontSize: 16,
              ),
            ),
            SizedBox(height: 8),
            Text(
              listType == 'available'
                  ? 'Check back later for new quests'
                  : listType == 'active'
                      ? 'Start a quest to begin your journey'
                      : 'Complete quests to earn rewards',
              style: TextStyle(
                color: Colors.grey,
                fontSize: 14,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: quests.length,
      itemBuilder: (context, index) {
        final quest = quests[index];
        final difficulty = quest['difficulty'] ?? 'normal';
        final type = quest['type'] ?? 'workout';

        return Card(
          margin: EdgeInsets.only(bottom: 16),
          color: Color(0xFF1F2A40),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          child: InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => QuestDetailScreen(
                    quest: quest,
                    questStatus: listType,
                  ),
                ),
              ).then((_) => _loadQuests());
            },
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: _getDifficultyColor(difficulty).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          _getQuestTypeIcon(type),
                          color: _getDifficultyColor(difficulty),
                          size: 24,
                        ),
                      ),
                      SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              quest['title'],
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            SizedBox(height: 4),
                            Row(
                              children: [
                                Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: _getDifficultyColor(difficulty).withOpacity(0.1),
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
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.star,
                                color: Colors.amber,
                                size: 16,
                              ),
                              SizedBox(width: 4),
                              Text(
                                '${quest['experienceReward']} XP',
                                style: TextStyle(
                                  color: Colors.amber,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 4),
                          if (listType == 'active')
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.blue.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'IN PROGRESS',
                                style: TextStyle(
                                  color: Colors.blue,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          if (listType == 'completed')
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                'COMPLETED',
                                style: TextStyle(
                                  color: Colors.green,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: 16),
                  Text(
                    quest['description'],
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
