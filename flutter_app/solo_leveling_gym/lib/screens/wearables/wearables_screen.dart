import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:solo_leveling_gym/services/auth_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class WearablesScreen extends StatefulWidget {
  @override
  _WearablesScreenState createState() => _WearablesScreenState();
}

class _WearablesScreenState extends State<WearablesScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _wearableSettings;
  String? _errorMessage;
  bool _isConnected = false;
  String _selectedPlatform = 'fitbit';

  final List<Map<String, dynamic>> _availablePlatforms = [
    {
      'id': 'fitbit',
      'name': 'Fitbit',
      'icon': Icons.watch,
      'color': Colors.teal,
    },
    {
      'id': 'garmin',
      'name': 'Garmin',
      'icon': Icons.watch,
      'color': Colors.blue,
    },
    {
      'id': 'apple_health',
      'name': 'Apple Health',
      'icon': Icons.favorite,
      'color': Colors.red,
    },
    {
      'id': 'google_fit',
      'name': 'Google Fit',
      'icon': Icons.directions_run,
      'color': Colors.green,
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadWearableSettings();
  }

  Future<void> _loadWearableSettings() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final userId =
          Provider.of<AuthService>(context, listen: false).currentUser!.uid;
      final userDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(userId)
          .get();
      final userData = userDoc.data() ?? {};

      final wearableSettings = userData['wearableSettings'];

      setState(() {
        _wearableSettings = wearableSettings;
        _isConnected =
            wearableSettings != null && wearableSettings['isConnected'] == true;
        if (wearableSettings != null && wearableSettings['platform'] != null) {
          _selectedPlatform = wearableSettings['platform'];
        }
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load wearable settings: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _connectWearable() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final userId =
          Provider.of<AuthService>(context, listen: false).currentUser!.uid;

      // In a real app, this would initiate OAuth flow with the selected platform
      // For this demo, we'll just simulate a successful connection

      // Update user document with wearable settings
      await FirebaseFirestore.instance.collection('users').doc(userId).update({
        'wearableSettings': {
          'platform': _selectedPlatform,
          'isConnected': true,
          'lastSyncTime': DateTime.now().toIso8601String(),
          'settings': {
            'trackWorkouts': true,
            'trackSteps': true,
            'trackHeartRate': true,
            'trackSleep': false,
          },
        },
      });

      setState(() {
        _isConnected = true;
        _wearableSettings = {
          'platform': _selectedPlatform,
          'isConnected': true,
          'lastSyncTime': DateTime.now().toIso8601String(),
          'settings': {
            'trackWorkouts': true,
            'trackSteps': true,
            'trackHeartRate': true,
            'trackSleep': false,
          },
        };
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Connected to ${_getPlatformName(_selectedPlatform)}'),
          backgroundColor: Colors.green,
        ),
      );
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to connect wearable: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _disconnectWearable() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final userId =
          Provider.of<AuthService>(context, listen: false).currentUser!.uid;

      // Update user document to remove wearable connection
      await FirebaseFirestore.instance.collection('users').doc(userId).update({
        'wearableSettings.isConnected': false,
      });

      setState(() {
        _isConnected = false;
        if (_wearableSettings != null) {
          _wearableSettings!['isConnected'] = false;
        }
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content:
              Text('Disconnected from ${_getPlatformName(_selectedPlatform)}'),
          backgroundColor: Colors.orange,
        ),
      );
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to disconnect wearable: ${e.toString()}';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  String _getPlatformName(String platformId) {
    final platform = _availablePlatforms.firstWhere(
      (p) => p['id'] == platformId,
      orElse: () => {'name': 'Unknown'},
    );
    return platform['name'];
  }

  Color _getPlatformColor(String platformId) {
    final platform = _availablePlatforms.firstWhere(
      (p) => p['id'] == platformId,
      orElse: () => {'color': Colors.grey},
    );
    return platform['color'];
  }

  IconData _getPlatformIcon(String platformId) {
    final platform = _availablePlatforms.firstWhere(
      (p) => p['id'] == platformId,
      orElse: () => {'icon': Icons.watch},
    );
    return platform['icon'];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Wearable Devices'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadWearableSettings,
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
                          onPressed: _loadWearableSettings,
                          child: Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : SingleChildScrollView(
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Connection status
                      Container(
                        padding: EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: _isConnected
                              ? Colors.green.withOpacity(0.1)
                              : Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _isConnected
                                ? Colors.green.withOpacity(0.3)
                                : Colors.red.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _isConnected ? Icons.check_circle : Icons.error,
                              color: _isConnected ? Colors.green : Colors.red,
                              size: 24,
                            ),
                            SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _isConnected
                                        ? 'Connected'
                                        : 'Not Connected',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: _isConnected
                                          ? Colors.green
                                          : Colors.red,
                                    ),
                                  ),
                                  SizedBox(height: 4),
                                  Text(
                                    _isConnected
                                        ? 'Your ${_getPlatformName(_selectedPlatform)} device is connected and syncing data'
                                        : 'Connect a wearable device to track your workouts automatically',
                                    style: TextStyle(
                                      color: Colors.grey[300],
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(height: 24),

                      // Platform selection
                      Text(
                        'Select Platform',
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
                        children: _availablePlatforms.map((platform) {
                          final isSelected =
                              _selectedPlatform == platform['id'];
                          return GestureDetector(
                            onTap: _isConnected
                                ? null
                                : () {
                                    setState(() {
                                      _selectedPlatform = platform['id'];
                                    });
                                  },
                            child: Container(
                              padding: EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Color(0xFF1F2A40),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isSelected
                                      ? platform['color']
                                      : Colors.transparent,
                                  width: 2,
                                ),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    platform['icon'],
                                    color: platform['color'],
                                    size: 40,
                                  ),
                                  SizedBox(height: 16),
                                  Text(
                                    platform['name'],
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  if (isSelected && _isConnected)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Container(
                                        padding: EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.green.withOpacity(0.1),
                                          borderRadius:
                                              BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          'CONNECTED',
                                          style: TextStyle(
                                            color: Colors.green,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      SizedBox(height: 24),

                      // Connection button
                      if (_isConnected)
                        ElevatedButton(
                          onPressed: _isLoading ? null : _disconnectWearable,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red,
                            padding: EdgeInsets.symmetric(vertical: 12),
                            minimumSize: Size(double.infinity, 0),
                          ),
                          child: _isLoading
                              ? SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white),
                                    strokeWidth: 2,
                                  ),
                                )
                              : Text(
                                  'DISCONNECT ${_getPlatformName(_selectedPlatform).toUpperCase()}',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        )
                      else
                        ElevatedButton(
                          onPressed: _isLoading ? null : _connectWearable,
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                                _getPlatformColor(_selectedPlatform),
                            padding: EdgeInsets.symmetric(vertical: 12),
                            minimumSize: Size(double.infinity, 0),
                          ),
                          child: _isLoading
                              ? SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white),
                                    strokeWidth: 2,
                                  ),
                                )
                              : Text(
                                  'CONNECT ${_getPlatformName(_selectedPlatform).toUpperCase()}',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      SizedBox(height: 24),

                      // Settings (only shown when connected)
                      if (_isConnected) ...[
                        Text(
                          'Tracking Settings',
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
                            children: [
                              _buildSettingSwitch(
                                'Track Workouts',
                                _wearableSettings?['settings']
                                        ?['trackWorkouts'] ??
                                    true,
                                (value) {
                                  // In a real app, this would update the settings in Firestore
                                  setState(() {
                                    _wearableSettings!['settings']
                                        ['trackWorkouts'] = value;
                                  });
                                },
                              ),
                              Divider(color: Colors.grey[800]),
                              _buildSettingSwitch(
                                'Track Steps',
                                _wearableSettings?['settings']?['trackSteps'] ??
                                    true,
                                (value) {
                                  setState(() {
                                    _wearableSettings!['settings']
                                        ['trackSteps'] = value;
                                  });
                                },
                              ),
                              Divider(color: Colors.grey[800]),
                              _buildSettingSwitch(
                                'Track Heart Rate',
                                _wearableSettings?['settings']
                                        ?['trackHeartRate'] ??
                                    true,
                                (value) {
                                  setState(() {
                                    _wearableSettings!['settings']
                                        ['trackHeartRate'] = value;
                                  });
                                },
                              ),
                              Divider(color: Colors.grey[800]),
                              _buildSettingSwitch(
                                'Track Sleep',
                                _wearableSettings?['settings']?['trackSleep'] ??
                                    false,
                                (value) {
                                  setState(() {
                                    _wearableSettings!['settings']
                                        ['trackSleep'] = value;
                                  });
                                },
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Last synced: ${_formatLastSyncTime(_wearableSettings?['lastSyncTime'])}',
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ],
                  ),
                ),
    );
  }

  Widget _buildSettingSwitch(
      String title, bool value, Function(bool) onChanged) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: _getPlatformColor(_selectedPlatform),
          ),
        ],
      ),
    );
  }

  String _formatLastSyncTime(String? isoString) {
    if (isoString == null) return 'Never';

    try {
      final dateTime = DateTime.parse(isoString);
      final now = DateTime.now();
      final difference = now.difference(dateTime);

      if (difference.inMinutes < 1) {
        return 'Just now';
      } else if (difference.inHours < 1) {
        return '${difference.inMinutes} minutes ago';
      } else if (difference.inDays < 1) {
        return '${difference.inHours} hours ago';
      } else {
        return '${difference.inDays} days ago';
      }
    } catch (e) {
      return 'Unknown';
    }
  }
}
