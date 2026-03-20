import 'dart:ui';

import 'package:flutter/material.dart';

import '../../mapping/domain/frequency_mapper.dart';
import '../../visuals/presentation/instrument_surface_painter.dart';
import '../domain/touch_note.dart';

class InstrumentScreen extends StatefulWidget {
  const InstrumentScreen({super.key});

  @override
  State<InstrumentScreen> createState() => _InstrumentScreenState();
}

class _InstrumentScreenState extends State<InstrumentScreen> {
  final FrequencyMapper _mapper = const FrequencyMapper();
  final Map<int, TouchNote> _activeNotes = <int, TouchNote>{};

  void _updateTouches(PointerEvent event, Size size) {
    final int id = event.pointer;
    final TouchNote note = _mapper.mapTouch(
      id: id,
      localPosition: event.localPosition,
      size: size,
    );

    setState(() {
      _activeNotes[id] = note;
    });
  }

  void _removeTouch(PointerEvent event) {
    setState(() {
      _activeNotes.remove(event.pointer);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          final Size size = Size(constraints.maxWidth, constraints.maxHeight);
          final List<TouchNote> notes = _activeNotes.values.toList(growable: false);

          return Listener(
            behavior: HitTestBehavior.opaque,
            onPointerDown: (PointerDownEvent event) => _updateTouches(event, size),
            onPointerMove: (PointerMoveEvent event) => _updateTouches(event, size),
            onPointerUp: _removeTouch,
            onPointerCancel: _removeTouch,
            child: Stack(
              fit: StackFit.expand,
              children: <Widget>[
                CustomPaint(
                  painter: InstrumentSurfacePainter(activeNotes: notes),
                ),
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        const _HeaderBlock(),
                        const Spacer(),
                        if (notes.isNotEmpty)
                          Wrap(
                            spacing: 12,
                            runSpacing: 12,
                            children: notes
                                .map(
                                  (TouchNote note) => _ActiveNoteChip(note: note),
                                )
                                .toList(growable: false),
                          )
                        else
                          const _HintBlock(),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _HeaderBlock extends StatelessWidget {
  const _HeaderBlock();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const <Widget>[
        Text(
          'Zikflow V1',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        SizedBox(height: 8),
        Text(
          'Surface musicale plein ecran en arc de cercle. Maintien du doigt = sustain. Glisse = variation de hauteur.',
          style: TextStyle(
            fontSize: 14,
            height: 1.5,
            color: Color(0xB3FFFFFF),
          ),
        ),
      ],
    );
  }
}

class _HintBlock extends StatelessWidget {
  const _HintBlock();

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
          decoration: BoxDecoration(
            color: const Color(0x1AFFFFFF),
            border: Border.all(color: const Color(0x22FFFFFF)),
            borderRadius: BorderRadius.circular(24),
          ),
          child: const Text(
            'Pose un ou plusieurs doigts dans la surface pour afficher le mapping de note. La couche audio viendra ensuite sur cette base.',
            style: TextStyle(
              fontSize: 14,
              height: 1.5,
              color: Color(0xCCFFFFFF),
            ),
          ),
        ),
      ),
    );
  }
}

class _ActiveNoteChip extends StatelessWidget {
  const _ActiveNoteChip({
    required this.note,
  });

  final TouchNote note;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0x16000000),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: note.color.withValues(alpha: 0.45)),
      ),
      child: DefaultTextStyle(
        style: const TextStyle(color: Colors.white),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: note.color,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              note.label,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              '${note.frequency.toStringAsFixed(1)} Hz',
              style: const TextStyle(
                fontSize: 13,
                color: Color(0xB3FFFFFF),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
