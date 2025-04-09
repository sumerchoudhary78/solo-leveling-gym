import 'package:flutter/material.dart';
import 'package:solo_leveling_gym/models/gym_plan_model.dart';
import 'package:solo_leveling_gym/services/gym_plan_service.dart';
import 'package:solo_leveling_gym/screens/gym_plan/gym_plan_questionnaire_screen.dart';
import 'package:solo_leveling_gym/screens/gym_plan/gym_plan_history_screen.dart';
import 'package:solo_leveling_gym/screens/gym_plan/gym_plan_result_screen.dart';
import 'package:solo_leveling_gym/widgets/custom_button.dart';

class GymPlanScreen extends StatefulWidget {
  @override
  _GymPlanScreenState createState() => _GymPlanScreenState();
}

class _GymPlanScreenState extends State<GymPlanScreen> {
  final GymPlanService _gymPlanService = GymPlanService();

  bool _isLoading = true;
  GymPlanModel? _latestPlan;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadLatestPlan();
  }

  Future<void> _loadLatestPlan() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final latestPlan = await _gymPlanService.getLatestGymPlan();
      setState(() {
        _latestPlan = latestPlan;
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
          'Gym Plan',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.history),
            onPressed: () {
              Navigator.push(
                context,
                PageRouteBuilder(
                  pageBuilder: (context, animation, secondaryAnimation) =>
                      GymPlanHistoryScreen(),
                  transitionsBuilder:
                      (context, animation, secondaryAnimation, child) {
                    var begin = Offset(1.0, 0.0);
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
            tooltip: 'View Plan History',
          ),
        ],
      ),
      body: AnimatedSwitcher(
        duration: Duration(milliseconds: 500),
        child: _isLoading
            ? Center(child: CircularProgressIndicator())
            : _errorMessage != null
                ? _buildErrorView()
                : _latestPlan == null
                    ? _buildEmptyView()
                    : _buildLatestPlanView(),
      ),
      floatingActionButton: AnimatedScale(
        scale: _isLoading ? 0.0 : 1.0,
        duration: Duration(milliseconds: 300),
        curve: Curves.bounceOut,
        child: FloatingActionButton(
          onPressed: () {
            Navigator.push(
              context,
              PageRouteBuilder(
                pageBuilder: (context, animation, secondaryAnimation) =>
                    GymPlanQuestionnaireScreen(),
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  var begin = Offset(0.0, 1.0);
                  var end = Offset.zero;
                  var curve = Curves.easeInOut;
                  var tween = Tween(begin: begin, end: end)
                      .chain(CurveTween(curve: curve));
                  return SlideTransition(
                      position: animation.drive(tween), child: child);
                },
              ),
            ).then((_) => _loadLatestPlan());
          },
          child: Icon(Icons.add),
          tooltip: 'Create New Plan',
          elevation: 4.0,
          backgroundColor: Theme.of(context).primaryColor,
        ),
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
              'Error loading gym plan',
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
              onPressed: _loadLatestPlan,
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
              size: 64,
              color: Colors.grey,
            ),
            SizedBox(height: 24),
            Text(
              'No Gym Plan Yet',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 16),
            Text(
              'Create your personalized gym plan based on your goals, fitness level, and preferences.',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[300],
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 32),
            CustomButton(
              text: 'CREATE YOUR PLAN',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => GymPlanQuestionnaireScreen(),
                  ),
                ).then((_) => _loadLatestPlan());
              },
            ),
            SizedBox(height: 16),
            Text(
              'Your plan will be tailored to your specific needs and goals.',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLatestPlanView() {
    final plan = _latestPlan!;

    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Latest plan card
          Card(
            color: Color(0xFF1F2A40),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Your Latest Plan',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color:
                              Theme.of(context).primaryColor.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${plan.createdAt.day}/${plan.createdAt.month}/${plan.createdAt.year}',
                          style: TextStyle(
                            fontSize: 12,
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
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: plan.goals.map((goal) {
                      return Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color:
                              Theme.of(context).primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color:
                                Theme.of(context).primaryColor.withOpacity(0.3),
                          ),
                        ),
                        child: Text(
                          goal,
                          style: TextStyle(
                            fontSize: 14,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  SizedBox(height: 24),
                  CustomButton(
                    text: 'VIEW FULL PLAN',
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => GymPlanResultScreen(plan: plan),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 24),

          // Plan summary
          Card(
            color: Color(0xFF1F2A40),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Plan Summary',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 16),
                  _buildSummaryItem(
                    icon: Icons.fitness_center,
                    title: 'Workout Frequency',
                    value: '${plan.daysPerWeek} days per week',
                  ),
                  Divider(color: Colors.grey[700]),
                  _buildSummaryItem(
                    icon: Icons.timer,
                    title: 'Session Duration',
                    value: '${plan.minutesPerSession} minutes',
                  ),
                  Divider(color: Colors.grey[700]),
                  _buildSummaryItem(
                    icon: Icons.speed,
                    title: 'Intensity',
                    value:
                        '${plan.intensity.substring(0, 1).toUpperCase()}${plan.intensity.substring(1)}',
                  ),
                  Divider(color: Colors.grey[700]),
                  _buildSummaryItem(
                    icon: Icons.fitness_center,
                    title: 'Equipment',
                    value:
                        '${plan.equipmentAccess.substring(0, 1).toUpperCase()}${plan.equipmentAccess.substring(1)}',
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 24),

          // Actions
          Card(
            color: Color(0xFF1F2A40),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Actions',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 16),
                  _buildActionButton(
                    icon: Icons.add,
                    title: 'Create New Plan',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => GymPlanQuestionnaireScreen(),
                        ),
                      ).then((_) => _loadLatestPlan());
                    },
                  ),
                  SizedBox(height: 12),
                  _buildActionButton(
                    icon: Icons.history,
                    title: 'View Plan History',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => GymPlanHistoryScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 32),
        ],
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

  Widget _buildSummaryItem({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Icon(
            icon,
            size: 24,
            color: Colors.grey[400],
          ),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[400],
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          border: Border.all(
            color: Colors.grey[700]!,
            width: 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 24,
              color: Theme.of(context).primaryColor,
            ),
            SizedBox(width: 16),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            Spacer(),
            Icon(
              Icons.arrow_forward_ios,
              size: 16,
              color: Colors.grey,
            ),
          ],
        ),
      ),
    );
  }
}
