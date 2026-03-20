import 'dart:math' as math;
import 'dart:ui';

import '../../instrument/domain/touch_note.dart';

class FrequencyMapper {
  const FrequencyMapper();

  static const List<String> _noteNames = <String>[
    'C',
    'D',
    'E',
    'F',
    'G',
    'A',
    'B',
  ];

  TouchNote mapTouch({
    required int id,
    required Offset localPosition,
    required Size size,
  }) {
    final Offset center = Offset(size.width * 0.5, size.height * 0.82);
    final Offset delta = localPosition - center;

    final double rawAngle = math.atan2(delta.dy, delta.dx);
    final double normalizedAngle =
        ((rawAngle + math.pi) / math.pi).clamp(0.0, 1.0);

    final double maxRadius = math.max(size.width * 0.52, size.height * 0.72);
    final double radius = delta.distance.clamp(0.0, maxRadius);
    final double radiusNorm = (radius / maxRadius).clamp(0.0, 1.0);

    final int noteIndex =
        (normalizedAngle * (_noteNames.length - 1)).round().clamp(
              0,
              _noteNames.length - 1,
            );
    final int octave = (2 + (1.0 - radiusNorm) * 3).round().clamp(2, 5);

    final int semitoneFromC = <int>[0, 2, 4, 5, 7, 9, 11][noteIndex];
    final int midi = 12 * (octave + 1) + semitoneFromC;
    final double frequency = 440.0 * math.pow(2, (midi - 69) / 12).toDouble();

    final HSVColor hsv = HSVColor.fromAHSV(
      1,
      210 - (normalizedAngle * 170),
      0.75,
      0.95 - radiusNorm * 0.25,
    );

    return TouchNote(
      id: id,
      position: localPosition,
      frequency: frequency,
      label: '${_noteNames[noteIndex]}$octave',
      color: hsv.toColor(),
    );
  }
}
