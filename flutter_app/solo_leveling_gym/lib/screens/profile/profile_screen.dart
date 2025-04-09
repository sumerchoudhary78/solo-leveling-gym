import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:solo_leveling_gym/services/auth_service.dart';
import 'package:solo_leveling_gym/screens/profile/edit_profile_screen.dart';
import 'package:solo_leveling_gym/widgets/custom_button.dart';
import 'package:solo_leveling_gym/widgets/stat_card.dart';
import 'package:solo_leveling_gym/widgets/rank_badge.dart';
import 'package:solo_leveling_gym/widgets/elemental_avatar_frame.dart';

class ProfileScreen extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _profileData;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final profileData = await Provider.of<AuthService>(context, listen: false)
          .getUserProfile();
      setState(() {
        _profileData = profileData;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load profile: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _signOut() async {
    try {
      await Provider.of<AuthService>(context, listen: false).signOut();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error signing out: ${e.toString()}')),
      );
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

  Color _getRankColor(String rank) {
    switch (rank) {
      case 'E':
        return Colors.grey;
      case 'D':
        return Colors.blue;
      case 'C':
        return Colors.green;
      case 'B':
        return Colors.amber;
      case 'A':
        return Colors.orange;
      case 'S':
        return Colors.red;
      case 'National Level':
        return Colors.redAccent;
      case 'Special Authority':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hunter Profile'),
        actions: [
          IconButton(
            icon: Icon(Icons.edit),
            onPressed: _profileData == null
                ? null
                : () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => EditProfileScreen(
                          profileData: _profileData!,
                        ),
                      ),
                    );
                    _loadProfile();
                  },
          ),
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: _signOut,
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _errorMessage!,
                        style: TextStyle(color: Colors.red),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 16),
                      CustomButton(
                        text: 'Retry',
                        onPressed: _loadProfile,
                      ),
                    ],
                  ),
                )
              : _buildProfile(),
    );
  }

  Widget _buildProfile() {
    if (_profileData == null) {
      return Center(child: Text('No profile data available'));
    }

    final level = _profileData!['level'] ?? 1;
    final rank = _getRankFromLevel(level);
    final rankColor = _getRankColor(rank);
    final hunterName = _profileData!['hunterName'] ?? 'Anonymous Hunter';
    final avatarUrl = _profileData!['avatarUrl'];
    final experience = _profileData!['experience'] ?? 0;
    final huntsCompleted = _profileData!['huntsCompleted'] ?? 0;
    final joinDate = _profileData!['joinDate'] != null
        ? DateTime.parse(_profileData!['joinDate'])
        : null;

    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Avatar and basic info
          Center(
            child: Column(
              children: [
                Stack(
                  children: [
                    // Elemental avatar frame with animations
                    ElementalAvatarFrame(
                      imageUrl: avatarUrl,
                      level: level,
                      size: 120,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: RankBadge(rank: rank),
                    ),
                  ],
                ),
                SizedBox(height: 16),
                Text(
                  hunterName,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Level $level • $rank Rank',
                  style: TextStyle(
                    fontSize: 16,
                    color: rankColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (joinDate != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Text(
                      'Joined ${_formatDate(joinDate)}',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          SizedBox(height: 32),

          // Stats
          Text(
            'Hunter Stats',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            children: [
              StatCard(
                title: 'Level',
                value: level.toString(),
                icon: Icons.trending_up,
                color: Colors.blue,
              ),
              StatCard(
                title: 'Experience',
                value: experience.toString(),
                icon: Icons.star,
                color: Colors.amber,
              ),
              StatCard(
                title: 'Quests Completed',
                value: huntsCompleted.toString(),
                icon: Icons.fitness_center,
                color: Colors.green,
              ),
              StatCard(
                title: 'Rank',
                value: rank,
                icon: Icons.military_tech,
                color: rankColor,
              ),
            ],
          ),
          SizedBox(height: 32),

          // Recent activity
          Text(
            'Recent Activity',
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
            child: Text(
              'No recent activity to display',
              style: TextStyle(
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays < 1) {
      return 'Today';
    } else if (difference.inDays < 2) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return '$weeks ${weeks == 1 ? 'week' : 'weeks'} ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'month' : 'months'} ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return '$years ${years == 1 ? 'year' : 'years'} ago';
    }
  }
}
