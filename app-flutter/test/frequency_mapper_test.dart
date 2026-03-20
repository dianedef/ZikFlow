import 'dart:ui';

import 'package:flutter_test/flutter_test.dart';
import 'package:zikflow_instrument/src/features/mapping/domain/frequency_mapper.dart';

void main() {
  group('FrequencyMapper', () {
    const FrequencyMapper mapper = FrequencyMapper();
    const Size size = Size(1200, 800);

    test('returns a note in a playable frequency range', () {
      final result = mapper.mapTouch(
        id: 1,
        localPosition: const Offset(600, 300),
        size: size,
      );

      expect(result.frequency, greaterThan(60));
      expect(result.frequency, lessThan(1100));
      expect(result.label, isNotEmpty);
    });

    test('different positions produce different note labels or frequencies', () {
      final low = mapper.mapTouch(
        id: 1,
        localPosition: const Offset(160, 620),
        size: size,
      );
      final high = mapper.mapTouch(
        id: 2,
        localPosition: const Offset(980, 220),
        size: size,
      );

      expect(
        low.frequency != high.frequency || low.label != high.label,
        isTrue,
      );
    });
  });
}
