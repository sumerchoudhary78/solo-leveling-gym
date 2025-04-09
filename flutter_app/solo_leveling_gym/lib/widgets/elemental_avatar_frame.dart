import 'package:flutter/material.dart';
import 'dart:math' as math;

class ElementalAvatarFrame extends StatefulWidget {
  final String? imageUrl;
  final int level;
  final double size;

  const ElementalAvatarFrame({
    Key? key,
    this.imageUrl,
    required this.level,
    this.size = 80,
  }) : super(key: key);

  @override
  _ElementalAvatarFrameState createState() => _ElementalAvatarFrameState();
}

class _ElementalAvatarFrameState extends State<ElementalAvatarFrame>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late List<ElementalParticle> _particles;
  final Random _random = Random();

  // Define rank colors
  static const Map<String, Color> rankColors = {
    'E': Color(0xFF9CA3AF), // Shadow - Gray
    'D': Color(0xFF60A5FA), // Ice - Light Blue
    'C': Color(0xFF38BDF8), // Water - Blue
    'B': Color(0xFFFBBF24), // Earth - Yellow/Brown
    'A': Color(0xFFE4E4E7), // Wind - Light Gray
    'S': Color(0xFFEF4444), // Fire - Red
    'National Level': Color(0xFFF59E0B), // Lightning - Yellow
    'Special Authority': Color(0xFFA78BFA), // Cosmic - Purple
  };

  // Define elemental themes for each rank
  static const Map<String, Map<String, dynamic>> rankElements = {
    'E': {
      'name': 'Shadow',
      'particleColors': [
        Color(0xFF9CA3AF),
        Color(0xFF6B7280),
        Color(0xFF4B5563),
        Color(0xFF374151)
      ],
      'particleType': 'shadow'
    },
    'D': {
      'name': 'Ice',
      'particleColors': [
        Color(0xFF60A5FA),
        Color(0xFF93C5FD),
        Color(0xFF3B82F6),
        Color(0xFF2563EB)
      ],
      'particleType': 'ice'
    },
    'C': {
      'name': 'Water',
      'particleColors': [
        Color(0xFF38BDF8),
        Color(0xFF0EA5E9),
        Color(0xFF0284C7),
        Color(0xFF0369A1)
      ],
      'particleType': 'water'
    },
    'B': {
      'name': 'Earth',
      'particleColors': [
        Color(0xFFFBBF24),
        Color(0xFFD97706),
        Color(0xFF92400E),
        Color(0xFF78350F)
      ],
      'particleType': 'earth'
    },
    'A': {
      'name': 'Wind',
      'particleColors': [
        Color(0xFFE4E4E7),
        Color(0xFFA1A1AA),
        Color(0xFF71717A),
        Color(0xFF52525B)
      ],
      'particleType': 'wind'
    },
    'S': {
      'name': 'Fire',
      'particleColors': [
        Color(0xFFEF4444),
        Color(0xFFF87171),
        Color(0xFFDC2626),
        Color(0xFFB91C1C)
      ],
      'particleType': 'fire'
    },
    'National Level': {
      'name': 'Lightning',
      'particleColors': [
        Color(0xFFF59E0B),
        Color(0xFFFBBF24),
        Color(0xFFD97706),
        Color(0xFFB45309)
      ],
      'particleType': 'lightning'
    },
    'Special Authority': {
      'name': 'Cosmic',
      'particleColors': [
        Color(0xFFA78BFA),
        Color(0xFF8B5CF6),
        Color(0xFF7C3AED),
        Color(0xFF6D28D9)
      ],
      'particleType': 'cosmic'
    },
  };

  // Define animation intensity based on rank
  static const Map<String, double> rankAnimationIntensity = {
    'E': 0.3,
    'D': 0.5,
    'C': 0.7,
    'B': 0.8,
    'A': 0.9,
    'S': 1.0,
    'National Level': 1.2,
    'Special Authority': 1.5,
  };

  // Get rank details based on level
  Map<String, dynamic> _getRankDetails(int level) {
    String rank;
    if (level >= 50) {
      rank = 'Special Authority';
    } else if (level >= 40) {
      rank = 'National Level';
    } else if (level >= 30) {
      rank = 'S';
    } else if (level >= 25) {
      rank = 'A';
    } else if (level >= 20) {
      rank = 'B';
    } else if (level >= 15) {
      rank = 'C';
    } else if (level >= 10) {
      rank = 'D';
    } else {
      rank = 'E';
    }

    return {
      'rank': rank,
      'color': rankColors[rank]!,
      'intensity': rankAnimationIntensity[rank]!,
      'elementDetails': rankElements[rank]!,
    };
  }

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();

    // Initialize particles
    _initializeParticles();
  }

  void _initializeParticles() {
    final rankDetails = _getRankDetails(widget.level);
    final elementDetails = rankDetails['elementDetails'] as Map<String, dynamic>;
    final particleColors = elementDetails['particleColors'] as List<Color>;
    final particleType = elementDetails['particleType'] as String;
    final intensity = rankDetails['intensity'] as double;

    // Create particles based on rank intensity
    final particleCount = (10 + (intensity * 15)).round();
    _particles = List.generate(particleCount, (index) {
      return ElementalParticle(
        color: particleColors[_random.nextInt(particleColors.length)],
        size: _random.nextDouble() * 4 + 2,
        angle: _random.nextDouble() * 2 * math.pi,
        speed: 0.01 + _random.nextDouble() * 0.03 * intensity,
        radius: widget.size / 2 * 0.8 + _random.nextDouble() * (widget.size / 2 * 0.3),
        elementType: particleType,
        opacity: 0.7,
        // Element-specific properties
        fadeSpeed: 0.01 + _random.nextDouble() * 0.02,
        shimmerSpeed: 0.05 + _random.nextDouble() * 0.1,
        waveAmplitude: 0.1 + _random.nextDouble() * 0.2,
        waveFrequency: 0.05 + _random.nextDouble() * 0.1,
        gustSpeed: 0.1 + _random.nextDouble() * 0.2,
        gustIntensity: 0.1 + _random.nextDouble() * 0.3,
        flickerSpeed: 0.2 + _random.nextDouble() * 0.3,
        flashSpeed: 0.3 + _random.nextDouble() * 0.5,
        jumpProbability: 0.005 + (intensity * 0.01),
      );
    });
  }

  @override
  void didUpdateWidget(ElementalAvatarFrame oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.level != widget.level || oldWidget.size != widget.size) {
      _initializeParticles();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final rankDetails = _getRankDetails(widget.level);
    final rankColor = rankDetails['color'] as Color;
    final intensity = rankDetails['intensity'] as double;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        // Update particle positions based on animation
        for (var particle in _particles) {
          particle.update(_controller.value, intensity);
        }

        return Container(
          width: widget.size,
          height: widget.size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
          ),
          child: Stack(
            children: [
              // Avatar image or placeholder
              Center(
                child: Container(
                  width: widget.size * 0.85,
                  height: widget.size * 0.85,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: rankColor,
                      width: 2,
                    ),
                  ),
                  child: ClipOval(
                    child: widget.imageUrl != null
                        ? Image.network(
                            widget.imageUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: Colors.grey[800],
                                child: Icon(
                                  Icons.person,
                                  size: widget.size * 0.4,
                                  color: Colors.grey,
                                ),
                              );
                            },
                          )
                        : Container(
                            color: Colors.grey[800],
                            child: Icon(
                              Icons.person,
                              size: widget.size * 0.4,
                              color: Colors.grey,
                            ),
                          ),
                  ),
                ),
              ),
              
              // Animated ring
              Center(
                child: TweenAnimationBuilder<double>(
                  tween: Tween<double>(begin: 1.0, end: 1.05),
                  duration: Duration(milliseconds: 1500),
                  builder: (context, value, child) {
                    return Transform.scale(
                      scale: 1.0 + (math.sin(_controller.value * 10) * 0.05 * intensity),
                      child: Container(
                        width: widget.size,
                        height: widget.size,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: rankColor.withOpacity(0.7),
                            width: 3,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              
              // Particles
              ...List.generate(_particles.length, (index) {
                final particle = _particles[index];
                return Positioned(
                  left: widget.size / 2 + particle.x - particle.size / 2,
                  top: widget.size / 2 + particle.y - particle.size / 2,
                  child: Opacity(
                    opacity: particle.opacity,
                    child: Container(
                      width: particle.size,
                      height: particle.size,
                      decoration: BoxDecoration(
                        color: particle.color,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: particle.color.withOpacity(0.5),
                            blurRadius: 3,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
              
              // Glow effect for high ranks
              if (intensity >= 0.7)
                Center(
                  child: Container(
                    width: widget.size * 1.2,
                    height: widget.size * 1.2,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: rankColor.withOpacity(0.3),
                          blurRadius: 15,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}

class ElementalParticle {
  Color color;
  double size;
  double angle;
  double speed;
  double radius;
  String elementType;
  double opacity;
  
  // Element-specific properties
  double fadeSpeed;
  double shimmerSpeed;
  double waveAmplitude;
  double waveFrequency;
  double gustSpeed;
  double gustIntensity;
  double flickerSpeed;
  double flashSpeed;
  double jumpProbability;
  
  // Position
  double x = 0;
  double y = 0;
  
  // For random effects
  final Random _random = Random();

  ElementalParticle({
    required this.color,
    required this.size,
    required this.angle,
    required this.speed,
    required this.radius,
    required this.elementType,
    required this.opacity,
    required this.fadeSpeed,
    required this.shimmerSpeed,
    required this.waveAmplitude,
    required this.waveFrequency,
    required this.gustSpeed,
    required this.gustIntensity,
    required this.flickerSpeed,
    required this.flashSpeed,
    required this.jumpProbability,
  });

  void update(double time, double intensity) {
    // Base animation for all particles
    angle += speed;
    
    // Element-specific animations
    switch (elementType) {
      case 'shadow':
        // Shadow particles fade in and out and move in erratic patterns
        opacity = 0.3 + math.sin(time * fadeSpeed * 10) * 0.3;
        
        // Slightly erratic movement
        final shadowRadius = radius + math.sin(time * 5) * 0.1 * radius;
        x = math.cos(angle) * shadowRadius;
        y = math.sin(angle) * shadowRadius;
        break;
        
      case 'ice':
        // Ice particles shimmer and have crystalline movement
        opacity = 0.5 + math.sin(time * shimmerSpeed * 10) * 0.3;
        
        // Crystalline movement (more angular)
        x = math.cos(angle) * radius;
        y = math.sin(angle) * radius;
        
        // Occasional sparkle effect
        if (_random.nextDouble() < 0.01) {
          size = size * 1.5;
          Future.delayed(Duration(milliseconds: 100), () {
            size = size / 1.5;
          });
        }
        break;
        
      case 'water':
        // Water particles flow in wave patterns
        final waveOffset = math.sin(time * waveFrequency * 10) * waveAmplitude * radius;
        x = math.cos(angle) * radius + waveOffset;
        y = math.sin(angle) * radius;
        
        // Subtle opacity changes like water
        opacity = 0.6 + math.sin(time * 2) * 0.2;
        break;
        
      case 'earth':
        // Earth particles have gravitational effects
        final gravitationalPull = 0.2 + math.sin(time * 3) * 0.1;
        x = math.cos(angle) * radius;
        y = math.sin(angle) * radius + gravitationalPull * radius;
        
        // Stable opacity
        opacity = 0.7;
        break;
        
      case 'wind':
        // Wind particles move in gusts
        final gustEffect = math.sin(time * gustSpeed * 10) * gustIntensity;
        final windRadius = radius + gustEffect * radius;
        
        x = math.cos(angle) * windRadius;
        y = math.sin(angle) * windRadius;
        
        // Wind particles are more transparent
        opacity = 0.3 + gustEffect.abs() * 0.5;
        break;
        
      case 'fire':
        // Fire particles flicker and rise
        x = math.cos(angle) * radius;
        y = math.sin(angle) * radius + math.sin(time * flickerSpeed * 10) * 0.1 * radius;
        
        // Flickering opacity
        opacity = 0.5 + _random.nextDouble() * 0.5;
        
        // Occasional size flicker
        if (_random.nextDouble() < 0.05) {
          size = size * (0.8 + _random.nextDouble() * 0.4);
        }
        break;
        
      case 'lightning':
        // Lightning particles flash and jump
        x = math.cos(angle) * radius;
        y = math.sin(angle) * radius;
        
        // Random flashing
        opacity = 0.3 + math.sin(time * flashSpeed * 10).abs() * 0.7;
        
        // Occasional jumping to new position
        if (_random.nextDouble() < jumpProbability) {
          angle = _random.nextDouble() * 2 * math.pi;
        }
        break;
        
      case 'cosmic':
        // Cosmic particles have complex orbital patterns
        final orbitOffset = math.sin(time * 7 + angle) * 0.2 * radius;
        x = math.cos(angle) * radius + math.cos(angle * 3 + time * 5) * orbitOffset;
        y = math.sin(angle) * radius + math.sin(angle * 2 + time * 3) * orbitOffset;
        
        // Pulsing opacity
        opacity = 0.4 + math.sin(time * 5 + angle * 2) * 0.3;
        break;
        
      default:
        // Default circular movement for any other element
        x = math.cos(angle) * radius;
        y = math.sin(angle) * radius;
        
        // Default pulsing opacity
        opacity = 0.7;
    }
  }
}

class Random {
  final math.Random _random = math.Random();
  
  double nextDouble() {
    return _random.nextDouble();
  }
  
  int nextInt(int max) {
    return _random.nextInt(max);
  }
}
