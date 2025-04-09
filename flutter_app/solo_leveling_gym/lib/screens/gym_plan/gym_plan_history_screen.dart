import 'package:flutter/material.dart';
import 'package:solo_leveling_gym/models/gym_plan_model.dart';
import 'package:solo_leveling_gym/services/gym_plan_service.dart';
import 'package:solo_leveling_gym/screens/gym_plan/gym_plan_result_screen.dart';
import 'package:solo_leveling_gym/widgets/custom_button.dart';
import 'package:solo_leveling_gym/widgets/animated_card.dart';
import 'package:solo_leveling_gym/widgets/animated_list_item.dart';

class GymPlanHistoryScreen extends StatefulWidget {
  @override
  _GymPlanHistoryScreenState createState() => _GymPlanHistoryScreenState();
}

class _GymPlanHistoryScreenState extends State<GymPlanHistoryScreen> {
  final GymPlanService _gymPlanService = GymPlanService();

  bool _isLoading = true;
  List<GymPlanModel> _plans = [];
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  Future<void> _loadPlans() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final plans = await _gymPlanService.getUserGymPlans();
      setState(() {
        _plans = plans;
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Your Gym Plans',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        elevation: 0,
      ),
      body: AnimatedSwitcher(
        duration: Duration(milliseconds: 500),
        child: _isLoading
            ? Center(child: CircularProgressIndicator())
            : _errorMessage != null
                ? _buildErrorView()
                : _plans.isEmpty
                    ? _buildEmptyView()
                    : _buildPlansList(),
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: Colors.red,
            ),
            SizedBox(height: 16),
            Text(
              'Error loading plans',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 8),
            Text(
              _errorMessage ?? 'Unknown error',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[300],
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 24),
            CustomButton(
              text: 'TRY AGAIN',
              onPressed: _loadPlans,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyView() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.fitness_center,
              size: 48,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'No Gym Plans Yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Create your first personalized gym plan to get started!',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[300],
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 24),
            CustomButton(
              text: 'CREATE NEW PLAN',
              onPressed: () {
                Navigator.pushNamed(context, '/gym_plan/create');
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlansList() {
    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: _plans.length,
      itemBuilder: (context, index) {
        final plan = _plans[index];
        return AnimatedListItem(
          index: index,
          child: AnimatedCard(
            margin: EdgeInsets.only(bottom: 16),
            color: Color(0xFF1F2A40),
            borderRadius: 12,
            onTap: () {
              Navigator.push(
                context,
                PageRouteBuilder(
                  pageBuilder: (context, animation, secondaryAnimation) =>
                      GymPlanResultScreen(plan: plan),
                  transitionsBuilder:
                      (context, animation, secondaryAnimation, child) {
                    var begin = Offset(0.0, 0.1);
                    var end = Offset.zero;
                    var curve = Curves.easeInOut;
                    var tween = Tween(begin: begin, end: end)
                        .chain(CurveTween(curve: curve));
                    return SlideTransition(
                        position: animation.drive(tween), child: child);
                  },
                ),
              );
            },
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.fitness_center,
                          color: Theme.of(context).primaryColor,
                          size: 20,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Gym Plan',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${plan.createdAt.day}/${plan.createdAt.month}/${plan.createdAt.year}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 16),
                Row(
                  children: [
                    _buildInfoChip(
                      icon: Icons.fitness_center,
                      label: plan.fitnessLevel.toUpperCase(),
                    ),
                    SizedBox(width: 8),
                    _buildInfoChip(
                      icon: Icons.speed,
                      label: plan.intensity.toUpperCase(),
                    ),
                    SizedBox(width: 8),
                    _buildInfoChip(
                      icon: Icons.calendar_today,
                      label: '${plan.daysPerWeek} DAYS/WEEK',
                    ),
                  ],
                ),
                SizedBox(height: 16),
                Text(
                  'Goals:',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: plan.goals.map((goal) {
                    return Container(
                      padding:
                          EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color:
                              Theme.of(context).primaryColor.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        goal,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    );
                  }).toList(),
                ),
                SizedBox(height: 16),
                CustomButton(
                  text: 'VIEW PLAN',
                  icon: Icons.visibility,
                  onPressed: () {
                    Navigator.push(
                      context,
                      PageRouteBuilder(
                        pageBuilder: (context, animation, secondaryAnimation) =>
                            GymPlanResultScreen(plan: plan),
                        transitionsBuilder:
                            (context, animation, secondaryAnimation, child) {
                          var begin = Offset(0.0, 0.1);
                          var end = Offset.zero;
                          var curve = Curves.easeInOut;
                          var tween = Tween(begin: begin, end: end)
                              .chain(CurveTween(curve: curve));
                          return SlideTransition(
                              position: animation.drive(tween), child: child);
                        },
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoChip({required IconData icon, required String label}) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Theme.of(context).primaryColor.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 12,
            color: Theme.of(context).primaryColor,
          ),
          SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Theme.of(context).primaryColor,
            ),
          ),
        ],
      ),
    );
  }
}
