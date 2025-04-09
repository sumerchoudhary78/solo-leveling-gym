import 'package:flutter/material.dart';

class RankBadge extends StatelessWidget {
  final String rank;

  const RankBadge({
    Key? key,
    required this.rank,
  }) : super(key: key);

  Color _getRankColor() {
    switch (rank) {
      case 'E': return Colors.grey;
      case 'D': return Colors.blue;
      case 'C': return Colors.green;
      case 'B': return Colors.amber;
      case 'A': return Colors.orange;
      case 'S': return Colors.red;
      case 'National Level': return Colors.redAccent;
      case 'Special Authority': return Colors.purple;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getRankColor(),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: _getRankColor().withOpacity(0.5),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        rank,
        style: TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }
}
