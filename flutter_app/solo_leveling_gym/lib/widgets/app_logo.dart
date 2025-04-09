import 'package:flutter/material.dart';

class AppLogo extends StatelessWidget {
  final double size;
  final Color? color;

  const AppLogo({
    Key? key,
    this.size = 100,
    this.color,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final logoColor = color ?? Theme.of(context).primaryColor;
    
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: const Color(0xFF1F2A40),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: logoColor.withOpacity(0.3),
            blurRadius: 15,
            spreadRadius: 5,
          ),
        ],
      ),
      child: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Outer circle
            Container(
              width: size * 0.8,
              height: size * 0.8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: logoColor,
                  width: size * 0.03,
                ),
              ),
            ),
            // Inner circle
            Container(
              width: size * 0.6,
              height: size * 0.6,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: logoColor.withOpacity(0.2),
                border: Border.all(
                  color: logoColor,
                  width: size * 0.02,
                ),
              ),
            ),
            // Dumbbell icon
            Icon(
              Icons.fitness_center,
              size: size * 0.35,
              color: logoColor,
            ),
          ],
        ),
      ),
    );
  }
}
