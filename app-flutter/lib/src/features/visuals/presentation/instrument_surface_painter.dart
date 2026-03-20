import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';

import '../../instrument/domain/touch_note.dart';

class InstrumentSurfacePainter extends CustomPainter {
  const InstrumentSurfacePainter({
    required this.activeNotes,
  });

  final List<TouchNote> activeNotes;

  @override
  void paint(Canvas canvas, Size size) {
    final Rect bounds = Offset.zero & size;
    final Paint background = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: <Color>[
          Color(0xFF040612),
          Color(0xFF0A1330),
          Color(0xFF150B23),
        ],
      ).createShader(bounds);
    canvas.drawRect(bounds, background);

    final Offset center = Offset(size.width * 0.5, size.height * 0.82);

    final Paint arcPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.25
      ..color = const Color(0x33FFFFFF);

    final Rect arcRect = Rect.fromCircle(
      center: center,
      radius: math.max(size.width * 0.48, size.height * 0.55),
    );

    for (int i = 0; i < 5; i++) {
      final double inset = i * 48;
      canvas.drawArc(
        arcRect.deflate(inset),
        math.pi,
        math.pi,
        false,
        arcPaint,
      );
    }

    final Paint guidePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1
      ..color = const Color(0x22B5C7FF);

    for (int i = 0; i <= 6; i++) {
      final double t = i / 6;
      final double angle = math.pi + t * math.pi;
      final Offset end = Offset(
        center.dx + math.cos(angle) * size.width * 0.48,
        center.dy + math.sin(angle) * size.width * 0.48,
      );
      canvas.drawLine(center, end, guidePaint);
    }

    for (final TouchNote note in activeNotes) {
      final Paint glow = Paint()
        ..shader = RadialGradient(
          colors: <Color>[
            note.color.withValues(alpha: 0.50),
            note.color.withValues(alpha: 0.16),
            Colors.transparent,
          ],
        ).createShader(
          Rect.fromCircle(center: note.position, radius: 88),
        );

      final Paint core = Paint()..color = note.color;
      final Paint ring = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5
        ..color = note.color.withValues(alpha: 0.6);

      canvas.drawCircle(note.position, 88, glow);
      canvas.drawCircle(note.position, 16, core);
      canvas.drawCircle(note.position, 28, ring);
    }
  }

  @override
  bool shouldRepaint(covariant InstrumentSurfacePainter oldDelegate) {
    return oldDelegate.activeNotes != activeNotes;
  }
}
