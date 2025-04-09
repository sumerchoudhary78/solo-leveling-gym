import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:solo_leveling_gym/models/gym_plan_model.dart';
import 'package:solo_leveling_gym/widgets/custom_button.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class GymPlanResultScreen extends StatefulWidget {
  final GymPlanModel plan;
  
  const GymPlanResultScreen({Key? key, required this.plan}) : super(key: key);
  
  @override
  _GymPlanResultScreenState createState() => _GymPlanResultScreenState();
}

class _GymPlanResultScreenState extends State<GymPlanResultScreen> {
  bool _isLoading = false;
  String? _successMessage;
  String? _errorMessage;
  
  Future<void> _createQuestFromPlan() async {
    setState(() {
      _isLoading = true;
      _successMessage = null;
      _errorMessage = null;
    });
    
    try {
      final userId = FirebaseAuth.instance.currentUser?.uid;
      if (userId == null) {
        throw Exception('User not logged in');
      }
      
      // Create a quest based on the gym plan
      await FirebaseFirestore.instance.collection('quests').add({
        'title': 'Complete Your Personalized Gym Plan',
        'description': 'Follow your personalized gym plan for one week to earn experience and level up!',
        'type': 'workout',
        'difficulty': widget.plan.intensity == 'high' ? 'hard' : (widget.plan.intensity == 'low' ? 'easy' : 'normal'),
        'experienceReward': widget.plan.intensity == 'high' ? 300 : (widget.plan.intensity == 'low' ? 100 : 200),
        'requirements': {
          'workoutDays': widget.plan.daysPerWeek,
          'minutesPerSession': widget.plan.minutesPerSession,
        },
        'planId': widget.plan.createdAt.toIso8601String(),
        'createdBy': userId,
        'createdAt': DateTime.now().toIso8601String(),
        'isCustom': true,
      });
      
      setState(() {
        _successMessage = 'Quest created successfully! Check your quests tab to start.';
      });
      
      // Hide success message after 3 seconds
      Future.delayed(Duration(seconds: 3), () {
        if (mounted) {
          setState(() {
            _successMessage = null;
          });
        }
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
  
  Future<void> _copyPlanToClipboard() async {
    await Clipboard.setData(ClipboardData(text: widget.plan.generatedPlan ?? ''));
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Plan copied to clipboard'),
        duration: Duration(seconds: 2),
      ),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Your Gym Plan'),
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.copy),
            onPressed: _copyPlanToClipboard,
            tooltip: 'Copy to clipboard',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Plan header
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Color(0xFF1F2A40),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Your Personalized Gym Plan',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Created on ${widget.plan.createdAt.day}/${widget.plan.createdAt.month}/${widget.plan.createdAt.year}',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                  ),
                  SizedBox(height: 16),
                  Row(
                    children: [
                      _buildInfoChip(
                        icon: Icons.fitness_center,
                        label: widget.plan.fitnessLevel.toUpperCase(),
                      ),
                      SizedBox(width: 8),
                      _buildInfoChip(
                        icon: Icons.speed,
                        label: widget.plan.intensity.toUpperCase(),
                      ),
                      SizedBox(width: 8),
                      _buildInfoChip(
                        icon: Icons.calendar_today,
                        label: '${widget.plan.daysPerWeek} DAYS/WEEK',
                      ),
                    ],
                  ),
                ],
              ),
            ),
            SizedBox(height: 24),
            
            // Plan content
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Color(0xFF1F2A40),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'WORKOUT PLAN',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 16),
                  if (widget.plan.generatedPlan != null)
                    _buildMarkdownContent(widget.plan.generatedPlan!),
                ],
              ),
            ),
            SizedBox(height: 24),
            
            // Action buttons
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
            SizedBox(height: 16),
            CustomButton(
              text: 'CREATE QUEST FROM PLAN',
              isLoading: _isLoading,
              onPressed: _createQuestFromPlan,
            ),
            SizedBox(height: 16),
            OutlinedButton(
              onPressed: _copyPlanToClipboard,
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: Theme.of(context).primaryColor),
                padding: EdgeInsets.symmetric(vertical: 12),
              ),
              child: Text(
                'COPY PLAN TO CLIPBOARD',
                style: TextStyle(
                  color: Theme.of(context).primaryColor,
                ),
              ),
            ),
            SizedBox(height: 32),
            
            // Disclaimer
            Text(
              'Disclaimer: This plan is generated based on the information you provided. It is recommended to consult with a healthcare professional before starting any new exercise program.',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
  
  Widget _buildInfoChip({required IconData icon, required String label}) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: Theme.of(context).primaryColor,
          ),
          SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).primaryColor,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildMarkdownContent(String markdownText) {
    final lines = markdownText.split('\n');
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: lines.map((line) {
        if (line.startsWith('# ')) {
          // Main header
          return Padding(
            padding: EdgeInsets.only(bottom: 16, top: 8),
            child: Text(
              line.substring(2),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          );
        } else if (line.startsWith('## ')) {
          // Section header
          return Padding(
            padding: EdgeInsets.only(bottom: 12, top: 16),
            child: Text(
              line.substring(3),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).primaryColor,
              ),
            ),
          );
        } else if (line.startsWith('### ')) {
          // Subsection header
          return Padding(
            padding: EdgeInsets.only(bottom: 8, top: 12),
            child: Text(
              line.substring(4),
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          );
        } else if (line.startsWith('- ')) {
          // Bullet point
          return Padding(
            padding: EdgeInsets.only(bottom: 4, left: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '•',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[400],
                  ),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    line.substring(2),
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[300],
                    ),
                  ),
                ),
              ],
            ),
          );
        } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') ||
                  line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ') ||
                  line.startsWith('7. ') || line.startsWith('8. ')) {
          // Numbered list
          final number = line.substring(0, line.indexOf('.'));
          return Padding(
            padding: EdgeInsets.only(bottom: 4, left: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$number.',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    line.substring(line.indexOf('.') + 2),
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[300],
                    ),
                  ),
                ),
              ],
            ),
          );
        } else if (line.isEmpty) {
          // Empty line
          return SizedBox(height: 8);
        } else {
          // Regular text
          return Padding(
            padding: EdgeInsets.only(bottom: 4),
            child: Text(
              line,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[300],
              ),
            ),
          );
        }
      }).toList(),
    );
  }
}
