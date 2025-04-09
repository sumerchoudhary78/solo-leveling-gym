import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:solo_leveling_gym/services/auth_service.dart';
import 'package:solo_leveling_gym/widgets/custom_button.dart';
import 'package:solo_leveling_gym/widgets/custom_text_field.dart';
import 'package:solo_leveling_gym/widgets/profile_photo_upload.dart';

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic> profileData;

  const EditProfileScreen({
    Key? key,
    required this.profileData,
  }) : super(key: key);

  @override
  _EditProfileScreenState createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _hunterNameController;
  late TextEditingController _bioController;
  bool _isLoading = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    _hunterNameController = TextEditingController(text: widget.profileData['hunterName'] ?? '');
    _bioController = TextEditingController(text: widget.profileData['bio'] ?? '');
  }

  @override
  void dispose() {
    _hunterNameController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      await Provider.of<AuthService>(context, listen: false).updateUserProfile({
        'hunterName': _hunterNameController.text.trim(),
        'bio': _bioController.text.trim(),
      });

      setState(() {
        _successMessage = 'Profile updated successfully';
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
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Edit Profile'),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Profile photo upload
            ProfilePhotoUpload(
              currentAvatarUrl: widget.profileData['avatarUrl'],
              userId: Provider.of<AuthService>(context).currentUser!.uid,
            ),
            SizedBox(height: 32),

            // Profile form
            Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Hunter Details',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(height: 16),
                  CustomTextField(
                    controller: _hunterNameController,
                    hintText: 'Hunter Name',
                    prefixIcon: Icons.person,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a hunter name';
                      }
                      if (value.length < 3) {
                        return 'Hunter name must be at least 3 characters';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 16),
                  CustomTextField(
                    controller: _bioController,
                    hintText: 'Bio (optional)',
                    prefixIcon: Icons.description,
                    maxLines: 3,
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
                  SizedBox(height: _errorMessage != null || _successMessage != null ? 24 : 0),

                  // Save button
                  CustomButton(
                    text: 'SAVE CHANGES',
                    isLoading: _isLoading,
                    onPressed: _saveProfile,
                  ),
                ],
              ),
            ),
            SizedBox(height: 32),

            // Stats section (read-only)
            Text(
              'Hunter Stats',
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStatRow('Level', widget.profileData['level']?.toString() ?? '1'),
                  SizedBox(height: 8),
                  _buildStatRow('Experience', widget.profileData['experience']?.toString() ?? '0'),
                  SizedBox(height: 8),
                  _buildStatRow('Quests Completed', widget.profileData['huntsCompleted']?.toString() ?? '0'),
                  SizedBox(height: 16),
                  Text(
                    'Note: Stats are earned through completing workouts and quests.',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 12,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.grey,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}
