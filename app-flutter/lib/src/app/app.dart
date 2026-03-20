import 'package:flutter/material.dart';

import '../features/instrument/presentation/instrument_screen.dart';

class ZikflowApp extends StatelessWidget {
  const ZikflowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Zikflow Instrument',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF050816),
        useMaterial3: true,
      ),
      home: const InstrumentScreen(),
    );
  }
}
