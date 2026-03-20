import 'dart:ui';

class TouchNote {
  const TouchNote({
    required this.id,
    required this.position,
    required this.frequency,
    required this.label,
    required this.color,
  });

  final int id;
  final Offset position;
  final double frequency;
  final String label;
  final Color color;
}
