import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:solo_leveling_gym/widgets/rank_badge.dart';
import 'package:solo_leveling_gym/widgets/elemental_avatar_frame.dart';

class LeaderboardScreen extends StatefulWidget {
  @override
  _LeaderboardScreenState createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _hunters = [];
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadLeaderboard();
  }

  Future<void> _loadLeaderboard() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final snapshot = await FirebaseFirestore.instance
          .collection('users')
          .orderBy('level', descending: true)
          .orderBy('experience', descending: true)
          .limit(20)
          .get();

      final hunters = snapshot.docs.map((doc) {
        final data = doc.data();
        return {
          'id': doc.id,
          'hunterName': data['hunterName'] ?? 'Anonymous Hunter',
          'level': data['level'] ?? 1,
          'experience': data['experience'] ?? 0,
          'avatarUrl': data['avatarUrl'],
          'huntsCompleted': data['huntsCompleted'] ?? 0,
        };
      }).toList();

      setState(() {
        _hunters = hunters;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load leaderboard: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  String _getRankFromLevel(int level) {
    if (level >= 50) return 'Special Authority';
    if (level >= 40) return 'National Level';
    if (level >= 30) return 'S';
    if (level >= 25) return 'A';
    if (level >= 20) return 'B';
    if (level >= 15) return 'C';
    if (level >= 10) return 'D';
    return 'E';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hunter Rankings'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadLeaderboard,
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
                          onPressed: _loadLeaderboard,
                          child: Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : _hunters.isEmpty
                  ? Center(
                      child: Text(
                        'No hunters found',
                        style: TextStyle(color: Colors.grey),
                      ),
                    )
                  : _buildLeaderboard(),
    );
  }

  Widget _buildLeaderboard() {
    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: _hunters.length,
      itemBuilder: (context, index) {
        final hunter = _hunters[index];
        final rank = _getRankFromLevel(hunter['level']);
        final isTopThree = index < 3;

        return Card(
          margin: EdgeInsets.only(bottom: 16),
          color: Color(0xFF1F2A40),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
            side: BorderSide(
              color: isTopThree
                  ? [
                      Colors.amber,
                      Colors.grey.shade400,
                      Colors.brown.shade300
                    ][index]
                      .withOpacity(0.5)
                  : Colors.transparent,
              width: isTopThree ? 1 : 0,
            ),
          ),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                // Rank number
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isTopThree
                        ? [
                            Colors.amber,
                            Colors.grey.shade400,
                            Colors.brown.shade300
                          ][index]
                        : Colors.blue,
                  ),
                  child: Center(
                    child: Text(
                      '${index + 1}',
                      style: TextStyle(
                        color: isTopThree ? Colors.black : Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 16),

                // Avatar with elemental effects
                ElementalAvatarFrame(
                  imageUrl: hunter['avatarUrl'],
                  level: hunter['level'],
                  size: 60,
                ),
                SizedBox(width: 16),

                // Hunter info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        hunter['hunterName'],
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            'Level ${hunter['level']}',
                            style: TextStyle(
                              color: Colors.grey,
                            ),
                          ),
                          SizedBox(width: 8),
                          Text(
                            '•',
                            style: TextStyle(
                              color: Colors.grey,
                            ),
                          ),
                          SizedBox(width: 8),
                          Text(
                            '${hunter['experience']} XP',
                            style: TextStyle(
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Rank badge
                RankBadge(rank: rank),
              ],
            ),
          ),
        );
      },
    );
  }
}
