import 'package:flutter/material.dart';
import 'package:solo_leveling_gym/models/gym_plan_model.dart';
import 'package:solo_leveling_gym/services/gym_plan_service.dart';
import 'package:solo_leveling_gym/widgets/custom_button.dart';
import 'package:solo_leveling_gym/widgets/custom_text_field.dart';
import 'package:solo_leveling_gym/screens/gym_plan/gym_plan_result_screen.dart';

class GymPlanQuestionnaireScreen extends StatefulWidget {
  @override
  _GymPlanQuestionnaireScreenState createState() => _GymPlanQuestionnaireScreenState();
}

class _GymPlanQuestionnaireScreenState extends State<GymPlanQuestionnaireScreen> {
  final _formKey = GlobalKey<FormState>();
  final _ageController = TextEditingController();
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();
  final _healthConditionsController = TextEditingController();
  final _preferencesController = TextEditingController();
  
  String _sex = 'male';
  String _fitnessLevel = 'beginner';
  List<String> _selectedGoals = [];
  String _intensity = 'moderate';
  int _daysPerWeek = 3;
  int _minutesPerSession = 60;
  String _equipmentAccess = 'gym';
  
  bool _isLoading = false;
  String? _errorMessage;
  
  final List<String> _availableGoals = [
    'Weight Loss',
    'Muscle Gain',
    'Strength',
    'Endurance',
    'General Fitness',
    'Athletic Performance',
  ];
  
  final GymPlanService _gymPlanService = GymPlanService();
  
  @override
  void dispose() {
    _ageController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    _healthConditionsController.dispose();
    _preferencesController.dispose();
    super.dispose();
  }
  
  Future<void> _generatePlan() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_selectedGoals.isEmpty) {
      setState(() {
        _errorMessage = 'Please select at least one goal';
      });
      return;
    }
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    
    try {
      // Create gym plan model from form data
      final planData = GymPlanModel(
        age: _ageController.text.isNotEmpty ? int.parse(_ageController.text) : null,
        sex: _sex,
        height: _heightController.text.isNotEmpty ? double.parse(_heightController.text) : null,
        weight: _weightController.text.isNotEmpty ? double.parse(_weightController.text) : null,
        fitnessLevel: _fitnessLevel,
        goals: _selectedGoals,
        intensity: _intensity,
        daysPerWeek: _daysPerWeek,
        minutesPerSession: _minutesPerSession,
        equipmentAccess: _equipmentAccess,
        healthConditions: _healthConditionsController.text.isNotEmpty 
            ? _healthConditionsController.text.split(',').map((e) => e.trim()).toList() 
            : [],
        preferences: _preferencesController.text.isNotEmpty 
            ? _preferencesController.text.split(',').map((e) => e.trim()).toList() 
            : [],
      );
      
      // Generate the plan
      final generatedPlan = await _gymPlanService.generateGymPlan(planData);
      
      // Save the plan with the generated content
      final planWithContent = planData.copyWith(generatedPlan: generatedPlan);
      await _gymPlanService.saveGymPlan(planWithContent);
      
      // Navigate to the result screen
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => GymPlanResultScreen(plan: planWithContent),
          ),
        );
      }
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
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create Your Gym Plan'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Introduction
              Text(
                'Personalized Gym Plan',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 8),
              Text(
                'Answer the questions below to create a personalized gym plan tailored to your goals and preferences.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[300],
                ),
              ),
              SizedBox(height: 24),
              
              // Basic Information Section
              _buildSectionHeader('Basic Information'),
              SizedBox(height: 16),
              
              // Age
              CustomTextField(
                controller: _ageController,
                hintText: 'Age (optional)',
                prefixIcon: Icons.calendar_today,
                keyboardType: TextInputType.number,
              ),
              SizedBox(height: 16),
              
              // Sex
              Text(
                'Sex',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'Male',
                      isSelected: _sex == 'male',
                      onTap: () => setState(() => _sex = 'male'),
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'Female',
                      isSelected: _sex == 'female',
                      onTap: () => setState(() => _sex = 'female'),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 16),
              
              // Height and Weight
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _heightController,
                      hintText: 'Height (cm, optional)',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: CustomTextField(
                      controller: _weightController,
                      hintText: 'Weight (kg, optional)',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 24),
              
              // Fitness Level Section
              _buildSectionHeader('Fitness Level'),
              SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'Beginner',
                      isSelected: _fitnessLevel == 'beginner',
                      onTap: () => setState(() => _fitnessLevel = 'beginner'),
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'Intermediate',
                      isSelected: _fitnessLevel == 'intermediate',
                      onTap: () => setState(() => _fitnessLevel = 'intermediate'),
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'Advanced',
                      isSelected: _fitnessLevel == 'advanced',
                      onTap: () => setState(() => _fitnessLevel = 'advanced'),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 24),
              
              // Goals Section
              _buildSectionHeader('Goals (Select at least one)'),
              SizedBox(height: 16),
              
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _availableGoals.map((goal) {
                  final isSelected = _selectedGoals.contains(goal);
                  return GestureDetector(
                    onTap: () {
                      setState(() {
                        if (isSelected) {
                          _selectedGoals.remove(goal);
                        } else {
                          _selectedGoals.add(goal);
                        }
                      });
                    },
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? Theme.of(context).primaryColor : Color(0xFF1F2A40),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
                          width: 1,
                        ),
                      ),
                      child: Text(
                        goal,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.grey,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              SizedBox(height: 24),
              
              // Intensity Section
              _buildSectionHeader('Desired Intensity'),
              SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'Low',
                      isSelected: _intensity == 'low',
                      onTap: () => setState(() => _intensity = 'low'),
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'Moderate',
                      isSelected: _intensity == 'moderate',
                      onTap: () => setState(() => _intensity = 'moderate'),
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'High',
                      isSelected: _intensity == 'high',
                      onTap: () => setState(() => _intensity = 'high'),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 24),
              
              // Time Commitment Section
              _buildSectionHeader('Time Commitment'),
              SizedBox(height: 16),
              
              Text(
                'Days per week: $_daysPerWeek',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 8),
              Slider(
                value: _daysPerWeek.toDouble(),
                min: 1,
                max: 7,
                divisions: 6,
                label: _daysPerWeek.toString(),
                onChanged: (value) {
                  setState(() {
                    _daysPerWeek = value.round();
                  });
                },
              ),
              SizedBox(height: 16),
              
              Text(
                'Minutes per session: $_minutesPerSession',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 8),
              Slider(
                value: _minutesPerSession.toDouble(),
                min: 15,
                max: 120,
                divisions: 7,
                label: _minutesPerSession.toString(),
                onChanged: (value) {
                  setState(() {
                    _minutesPerSession = value.round();
                  });
                },
              ),
              SizedBox(height: 24),
              
              // Equipment Access Section
              _buildSectionHeader('Available Equipment'),
              SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'Full Gym',
                      isSelected: _equipmentAccess == 'gym',
                      onTap: () => setState(() => _equipmentAccess = 'gym'),
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'Home Gym',
                      isSelected: _equipmentAccess == 'home',
                      onTap: () => setState(() => _equipmentAccess = 'home'),
                    ),
                  ),
                  SizedBox(width: 16),
                  Expanded(
                    child: _buildSelectionTile(
                      title: 'Minimal',
                      isSelected: _equipmentAccess == 'minimal',
                      onTap: () => setState(() => _equipmentAccess = 'minimal'),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 24),
              
              // Health Conditions Section
              _buildSectionHeader('Health Conditions (Optional)'),
              SizedBox(height: 8),
              Text(
                'List any injuries or health conditions, separated by commas.',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[400],
                ),
              ),
              SizedBox(height: 8),
              CustomTextField(
                controller: _healthConditionsController,
                hintText: 'e.g., knee injury, lower back pain',
                maxLines: 2,
              ),
              SizedBox(height: 24),
              
              // Preferences Section
              _buildSectionHeader('Exercise Preferences (Optional)'),
              SizedBox(height: 8),
              Text(
                'List exercises you enjoy or dislike, separated by commas.',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[400],
                ),
              ),
              SizedBox(height: 8),
              CustomTextField(
                controller: _preferencesController,
                hintText: 'e.g., enjoy running, dislike burpees',
                maxLines: 2,
              ),
              SizedBox(height: 32),
              
              // Error message
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
              SizedBox(height: _errorMessage != null ? 24 : 0),
              
              // Generate Plan Button
              CustomButton(
                text: 'GENERATE MY PLAN',
                isLoading: _isLoading,
                onPressed: _generatePlan,
              ),
              SizedBox(height: 16),
              
              // Disclaimer
              Text(
                'Disclaimer: This plan is generated based on the information you provided. It is recommended to consult with a healthcare professional before starting any new exercise program.',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildSectionHeader(String title) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        SizedBox(height: 8),
        Divider(color: Colors.grey[700]),
      ],
    );
  }
  
  Widget _buildSelectionTile({
    required String title,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Theme.of(context).primaryColor : Color(0xFF1F2A40),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? Theme.of(context).primaryColor : Colors.grey,
            width: 1,
          ),
        ),
        child: Text(
          title,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
